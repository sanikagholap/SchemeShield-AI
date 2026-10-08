import io
from pathlib import Path
import pytest

from app.services.ocr_service import OCRProcessingService, ocr_processing_service
from app.services.url_service import URLInspectionService, url_inspection_service
from app.utils.exceptions import AppException


def get_auth_token(client, email="doc.url.citizen@example.com"):
    """Helper to register and login user and obtain JWT token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Doc Citizen"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return login_resp.json()["access_token"]


# =============================================================================
# 1. URL SYNTAX & SSRF GUARD UNIT TESTS
# =============================================================================

def test_url_syntax_validation():
    service = URLInspectionService()

    # Valid schemes
    valid_http, host, err = service.validate_url_syntax("http://example.com/scheme")
    assert valid_http is True
    assert host == "example.com"
    assert err is None

    valid_https, host, err = service.validate_url_syntax("https://myscheme.gov.in/search?q=kisan")
    assert valid_https is True
    assert host == "myscheme.gov.in"

    # Dangerous / prohibited schemes
    for bad_url in [
        "javascript:alert(1)",
        "file:///etc/passwd",
        "data:text/html,<script>alert(1)</script>",
        "ftp://ftp.example.com/file",
        "gopher://example.com",
    ]:
        valid, _, err = service.validate_url_syntax(bad_url)
        assert valid is False
        assert "Only HTTP and HTTPS are permitted" in err or "Invalid" in err

    # Malformed / empty
    valid, _, err = service.validate_url_syntax("")
    assert valid is False

    valid, _, err = service.validate_url_syntax("   ")
    assert valid is False


def test_ssrf_blocking_private_and_localhost():
    service = URLInspectionService()

    # Direct blocked hostnames
    for blocked_host in ["localhost", "127.0.0.1", "0.0.0.0", "::1", "router.local", "server.internal"]:
        safe, reason = service.is_ssrf_safe_host(blocked_host)
        assert safe is False
        assert reason is not None


def test_html_text_parser():
    service = URLInspectionService()
    html_sample = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>PM Housing Welfare Scheme</title>
        <style>body { font-size: 14px; }</style>
        <script>console.log("analytics");</script>
    </head>
    <body>
        <nav><a href="/">Home</a><a href="/login">Login</a></nav>
        <h1>Pradhan Mantri Awas Yojana</h1>
        <p>Financial assistance for building pucca houses for rural poor families.</p>
        <footer>Copyright 2026 Government Portal</footer>
    </body>
    </html>
    """
    title, clean_text = service._parse_html_text(html_sample)
    assert title == "PM Housing Welfare Scheme"
    assert "Pradhan Mantri Awas Yojana" in clean_text
    assert "Financial assistance for building pucca houses" in clean_text
    assert "analytics" not in clean_text
    assert "font-size" not in clean_text
    assert "Copyright" not in clean_text  # footer stripped


def test_fetch_and_extract_page_mocked(monkeypatch):
    service = URLInspectionService()

    class MockResponse:
        status_code = 200
        encoding = "utf-8"
        content = (
            b"<html><head><title>Official Portal</title></head>"
            b"<body><p>Direct benefit transfer for all eligible farmers.</p></body></html>"
        )

    class MockClient:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def get(self, url):
            return MockResponse()

    # Bypass DNS SSRF check and mock HTTP call
    monkeypatch.setattr(service, "is_ssrf_safe_host", lambda host: (True, None))
    monkeypatch.setattr("httpx.Client", MockClient)

    result = service.fetch_and_extract_page("https://trusted-site.gov.in/benefit")
    assert result["is_safe"] is True
    assert result["page_fetched"] is True
    assert result["content_extracted"] is True
    assert result["page_title"] == "Official Portal"
    assert "Direct benefit transfer" in result["extracted_text"]


def test_fetch_and_extract_page_timeout_handling(monkeypatch):
    import httpx
    service = URLInspectionService()

    class MockClientTimeout:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def get(self, url):
            raise httpx.TimeoutException("Mocked connection timed out")

    monkeypatch.setattr(service, "is_ssrf_safe_host", lambda host: (True, None))
    monkeypatch.setattr("httpx.Client", MockClientTimeout)

    result = service.fetch_and_extract_page("https://slow-server.com/delay")
    assert result["page_fetched"] is False
    assert result["content_extracted"] is False
    assert "timed out" in result["warning"].lower()


# =============================================================================
# 2. OCR & DOCUMENT EXTRACTION UNIT TESTS
# =============================================================================

def test_ocr_extract_text_file(tmp_path):
    service = OCRProcessingService()
    txt_file = tmp_path / "scheme_notice.txt"
    txt_file.write_text("Pradhan Mantri Kisan Samman Nidhi welfare income support.", encoding="utf-8")

    result = service.extract_text_from_file(txt_file)
    assert result["extraction_method"] == "plain_text"
    assert result["page_count"] == 1
    assert "Pradhan Mantri Kisan Samman Nidhi" in result["extracted_text"]


def test_ocr_extract_unsupported_file(tmp_path):
    service = OCRProcessingService()
    bad_file = tmp_path / "script.exe"
    bad_file.write_bytes(b"executable-binary-data")

    with pytest.raises(AppException) as exc_info:
        service.extract_text_from_file(bad_file)
    assert exc_info.value.status_code == 400
    assert "Unsupported file format" in exc_info.value.message


def test_ocr_extract_image_mocked(tmp_path, monkeypatch):
    service = OCRProcessingService()
    from PIL import Image

    img_file = tmp_path / "flyer.png"
    img = Image.new("RGB", (100, 100), color="white")
    img.save(img_file)

    # Mock pytesseract boundary
    monkeypatch.setattr(
        "pytesseract.image_to_string",
        lambda image: "Free Smartphone Scheme 2026. Register today and pay fee of Rs 199.",
    )

    result = service.extract_text_from_file(img_file)
    assert result["extraction_method"] == "ocr"
    assert "Free Smartphone Scheme 2026" in result["extracted_text"]


# =============================================================================
# 3. DOCUMENT VERIFICATION API INTEGRATION TESTS
# =============================================================================

def test_api_upload_text_document_authenticated(client):
    """Citizen uploads a text document with scam content -> verified as potentially_fake."""
    token = get_auth_token(client, "doc.scam@example.com")
    file_content = (
        b"Congratulations citizen! You have won the PM Laptop Scheme grant.\n"
        b"Pay registration fee of Rs 500 and share your OTP immediately to claim approval."
    )

    files = {"file": ("pm_grant_notice.txt", io.BytesIO(file_content), "text/plain")}
    response = client.post(
        "/api/v1/verify/document",
        files=files,
        data={"scheme_name": "PM Laptop Scheme Scam"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "completed"
    assert data["input_type"] == "document"
    assert data["result_label"] == "potentially_fake"
    assert data["risk_score"] >= 70.0
    assert "ocr_metadata" in data
    assert data["ocr_metadata"]["extraction_method"] == "plain_text"
    assert "signals" in data["evidence"]
    assert data["evidence"]["signals"][0]["type"] == "document"


def test_api_upload_document_unauthenticated(client):
    """Document upload requires Bearer token."""
    files = {"file": ("scheme.txt", io.BytesIO(b"Some text"), "text/plain")}
    response = client.post("/api/v1/verify/document", files=files)
    assert response.status_code == 401


def test_api_upload_unsupported_extension(client):
    """Rejects disallowed file extensions (e.g. .bin, .exe)."""
    token = get_auth_token(client, "doc.badext@example.com")
    files = {"file": ("malware.exe", io.BytesIO(b"executable content"), "application/octet-stream")}
    response = client.post(
        "/api/v1/verify/document",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "not supported" in response.json()["error"]["message"]


def test_api_upload_empty_file(client):
    """Rejects empty (0-byte) files with 400 Bad Request."""
    token = get_auth_token(client, "doc.empty@example.com")
    files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    response = client.post(
        "/api/v1/verify/document",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["error"]["message"].lower()


def test_api_upload_empty_extracted_text(client):
    """Rejects documents that yield only whitespace."""
    token = get_auth_token(client, "doc.whitespace@example.com")
    files = {"file": ("blank.txt", io.BytesIO(b"   \n\n\t  "), "text/plain")}
    response = client.post(
        "/api/v1/verify/document",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "readable or usable text" in response.json()["error"]["message"]


# =============================================================================
# 4. URL VERIFICATION API INTEGRATION TESTS
# =============================================================================

def test_api_verify_url_dangerous_scheme(client):
    """Rejects dangerous URL schemes like javascript: or file:."""
    token = get_auth_token(client, "url.danger@example.com")
    response = client.post(
        "/api/v1/verify/url",
        json={"url": "javascript:alert(document.cookie)"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "Only HTTP and HTTPS are permitted" in response.json()["error"]["message"]


def test_api_verify_url_localhost_ssrf_blocked(client):
    """SSRF guard detects local/internal host and reports safety warning."""
    token = get_auth_token(client, "url.ssrf@example.com")
    response = client.post(
        "/api/v1/verify/url",
        json={"url": "http://127.0.0.1:8000/internal-admin"},
        headers={"Authorization": f"Bearer {token}"},
    )
    # The API returns 201 with completed verification and reports unverified SSRF warning
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "completed"
    assert data["page_fetched"] is False
    assert data["content_analyzed"] is False
    assert data["input_type"] == "url"


def test_api_verify_url_mocked_official_page(client, monkeypatch):
    """Verifies official government page URL with mocked fetch."""
    token = get_auth_token(client, "url.gov@example.com")

    # Mock fetch and SSRF check
    monkeypatch.setattr(
        url_inspection_service,
        "fetch_and_extract_page",
        lambda url: {
            "url": url,
            "hostname": "rural.gov.in",
            "is_safe": True,
            "page_fetched": True,
            "content_extracted": True,
            "extracted_text": "Pradhan Mantri Awas Yojana Gramin provides pucca housing assistance for eligible rural families.",
            "page_title": "PMAY-G Official Portal",
            "warning": None,
        },
    )

    response = client.post(
        "/api/v1/verify/url",
        json={"url": "https://rural.gov.in/schemes/pmay-g"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "completed"
    assert data["result_label"] == "genuine"
    assert data["risk_score"] <= 25.0
    assert data["confidence_score"] >= 55.0
    assert data["page_fetched"] is True
    assert data["content_analyzed"] is True


def test_api_verify_url_mocked_scam_page(client, monkeypatch):
    """Verifies third-party URL circulating advance fee and OTP request."""
    token = get_auth_token(client, "url.scam@example.com")

    monkeypatch.setattr(
        url_inspection_service,
        "fetch_and_extract_page",
        lambda url: {
            "url": url,
            "hostname": "free-cash-yojana.online",
            "is_safe": True,
            "page_fetched": True,
            "content_extracted": True,
            "extracted_text": "Claim guaranteed cash subsidy now! Pay registration fee of Rs 399 and enter your OTP to confirm approval.",
            "page_title": "Free Cash Registration",
            "warning": None,
        },
    )

    response = client.post(
        "/api/v1/verify/url",
        json={"url": "https://free-cash-yojana.online/claim"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "completed"
    assert data["result_label"] == "potentially_fake"
    assert data["risk_score"] >= 70.0


def test_api_verify_history_includes_document_and_url(client):
    """History endpoint correctly lists document and url verification submissions."""
    token = get_auth_token(client, "history.multi@example.com")

    # 1. Submit text document
    file_bytes = io.BytesIO(b"Scheme text for verification history check.")
    client.post(
        "/api/v1/verify/document",
        files={"file": ("history_doc.txt", file_bytes, "text/plain")},
        headers={"Authorization": f"Bearer {token}"},
    )

    # 2. Submit URL
    client.post(
        "/api/v1/verify/url",
        json={"url": "https://india.gov.in/schemes"},
        headers={"Authorization": f"Bearer {token}"},
    )

    history_resp = client.get(
        "/api/v1/verify/history?page=1&page_size=10",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert history_resp.status_code == 200
    hist = history_resp.json()
    assert hist["total"] >= 2
    types = [item["input_type"] for item in hist["items"]]
    assert "document" in types
    assert "url" in types
