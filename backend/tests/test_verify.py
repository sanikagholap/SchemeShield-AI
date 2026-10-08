import pytest
from app.services.official_source_service import OfficialSourceVerificationService


def get_auth_token(client, email="citizen.verify@example.com"):
    """Helper to register and login a user and return the Bearer token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Citizen Verify"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return login_resp.json()["access_token"]


def test_submit_verification_request_authenticated(client):
    """POST /api/v1/verify succeeds and runs local pipeline, returning completed status and scores."""
    token = get_auth_token(client, "verify.submit@example.com")
    payload = {
        "scheme_name": "Pradhan Mantri Free Smartphone Scheme",
        "description": "Circulating message claiming government provides free 5G phones upon paying Rs 299.",
        "submitted_url": "https://pm-smartphone-claim.xyz",
        "input_type": "url",
    }
    response = client.post(
        "/api/v1/verify",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["scheme_name"] == "Pradhan Mantri Free Smartphone Scheme"
    assert data["status"] == "completed"
    assert data["input_type"] == "url"
    assert data["submitted_url"] == "https://pm-smartphone-claim.xyz"
    assert "id" in data
    assert "created_at" in data
    assert data["risk_score"] is not None
    assert 0 <= data["risk_score"] <= 100
    assert data["confidence_score"] is not None
    assert 0 <= data["confidence_score"] <= 100
    assert data["result_label"] in ["genuine", "suspicious", "duplicate", "potentially_fake", "unable_to_verify"]
    assert data["explanation"] is not None
    assert "evidence" in data
    assert data["evidence"]["signals"] is not None


def test_submit_verification_unauthenticated(client):
    """POST /api/v1/verify fails with 401 when no token is present."""
    payload = {
        "scheme_name": "Unauthorized Verification Attempt",
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 401


def test_submit_verification_invalid_input(client):
    """POST /api/v1/verify returns 422 when scheme_name is missing or invalid."""
    token = get_auth_token(client, "verify.invalid@example.com")
    # Scheme name too short (<2 chars)
    payload = {"scheme_name": "A"}
    response = client.post(
        "/api/v1/verify",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


def test_get_verification_by_id(client):
    """GET /api/v1/verify/{id} returns the citizen's own verification record."""
    token = get_auth_token(client, "verify.lookup@example.com")
    create_resp = client.post(
        "/api/v1/verify",
        json={"scheme_name": "Solar Rooftop Subsidy Scheme"},
        headers={"Authorization": f"Bearer {token}"},
    )
    v_id = create_resp.json()["id"]

    get_resp = client.get(
        f"/api/v1/verify/{v_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == v_id
    assert get_resp.json()["scheme_name"] == "Solar Rooftop Subsidy Scheme"


def test_get_verification_not_found(client):
    """GET /api/v1/verify/{id} returns 404 for non-existent ID."""
    token = get_auth_token(client, "verify.notfound@example.com")
    response = client.get(
        "/api/v1/verify/999999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


def test_user_cannot_access_another_users_verification(client):
    """User B cannot access a verification record created by User A (403 Forbidden)."""
    token_user_a = get_auth_token(client, "user.a@example.com")
    token_user_b = get_auth_token(client, "user.b@example.com")

    # User A creates a verification request
    create_resp = client.post(
        "/api/v1/verify",
        json={"scheme_name": "User A Private Scheme"},
        headers={"Authorization": f"Bearer {token_user_a}"},
    )
    v_id = create_resp.json()["id"]

    # User B attempts to access User A's verification record
    access_resp = client.get(
        f"/api/v1/verify/{v_id}",
        headers={"Authorization": f"Bearer {token_user_b}"},
    )
    assert access_resp.status_code == 403
    assert "permission" in access_resp.json()["error"]["message"].lower()


def test_get_verification_history(client):
    """GET /api/v1/verify/history returns paginated history sorted newest first."""
    token = get_auth_token(client, "history.user@example.com")

    # Create 3 verification requests
    for i in range(1, 4):
        client.post(
            "/api/v1/verify",
            json={"scheme_name": f"History Test Scheme {i}"},
            headers={"Authorization": f"Bearer {token}"},
        )

    response = client.get(
        "/api/v1/verify/history?page=1&page_size=2",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total_pages"] == 2
    # Verify newest first sorting
    assert data["items"][0]["scheme_name"] == "History Test Scheme 3"


def test_verification_history_unauthenticated(client):
    """GET /api/v1/verify/history requires authentication (401)."""
    response = client.get("/api/v1/verify/history")
    assert response.status_code == 401


def test_official_source_domain_evaluation():
    """Unit test for OfficialSourceVerificationService domain trust analysis."""
    service = OfficialSourceVerificationService()

    # Trusted official domains
    res_gov = service.evaluate_domain_trust("https://myscheme.gov.in/schemes")
    assert res_gov["is_trusted"] is True
    assert res_gov["is_official_tld"] is True
    assert res_gov["extracted_domain"] == "myscheme.gov.in"

    res_nic = service.evaluate_domain_trust("http://rural.nic.in/index.html")
    assert res_nic["is_trusted"] is True
    assert res_nic["is_official_tld"] is True

    # Untrusted / scam domain
    res_scam = service.evaluate_domain_trust("https://pm-scheme-verify.xyz/apply")
    assert res_scam["is_trusted"] is False
    assert res_scam["is_official_tld"] is False
    assert res_scam["source_category"] == "unverified_third_party"
