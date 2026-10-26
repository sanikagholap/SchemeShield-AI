import io
import pytest
from app.services.risk_scoring_service import RiskScoringService


def register_and_login(client, email, password="SecurePassword123!"):
    """Helper to create a user and return authorization bearer headers."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Test Citizen"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_empty_database_returns_real_zero_counts(client):
    """
    Verifies that an empty database / fresh user returns genuine empty lists
    and zero counts without fabricated placeholders.
    """
    headers = register_and_login(client, "empty_user@example.com")

    # 1. Scheme list returns genuine empty or real count
    schemes_resp = client.get("/api/v1/schemes?search=NonExistentSchemeXYZ")
    assert schemes_resp.status_code == 200
    schemes_data = schemes_resp.json()
    assert schemes_data["total"] == 0
    assert schemes_data["items"] == []

    # 2. History endpoint returns genuine empty records for user
    hist_resp = client.get("/api/v1/history", headers=headers)
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert hist_data["success"] is True
    assert hist_data["data"]["total"] == 0
    assert hist_data["data"]["items"] == []
    assert "scaffold" not in hist_data["message"].lower()

    # 3. User verification stats returns zero counts
    stats_resp = client.get("/api/v1/verify/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats_data = stats_resp.json()
    assert stats_data["total_verifications"] == 0
    assert stats_data["completed_verifications"] == 0
    assert stats_data["average_risk_score"] is None


def test_history_endpoint_requires_auth(client):
    """GET /api/v1/history requires authentication and rejects unauthenticated callers."""
    resp = client.get("/api/v1/history")
    assert resp.status_code == 401


def test_verification_analyze_endpoint_real_database_behavior(client):
    """
    POST /api/v1/verification/analyze requires authentication and performs
    genuine analysis with risk score, confidence score, and DB persistence.
    """
    # 1. Unauthenticated should fail with 401
    unauth_resp = client.post(
        "/api/v1/verification/analyze",
        json={"title": "Test Scheme", "content": "This is legitimate government assistance for agriculture."},
    )
    assert unauth_resp.status_code == 401

    # 2. Authenticated user performs analysis
    headers = register_and_login(client, "analyze_user@example.com")
    resp = client.post(
        "/api/v1/verification/analyze",
        json={
            "title": "National Solar Subsidy Program",
            "content": "Official government subsidy for rooftop solar installation with DBT transfer.",
        },
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "scaffold" not in data["message"].lower()
    assert data["data"]["status"] == "completed"
    assert data["data"]["risk_score"] is not None
    assert data["data"]["confidence_score"] is not None
    assert "signals" in data["data"]["evidence"]

    # 3. Verify it appears in user's history
    hist_resp = client.get("/api/v1/history", headers=headers)
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()["data"]
    assert hist_data["total"] >= 1
    assert any(item["scheme_name"] == "National Solar Subsidy Program" for item in hist_data["items"])


def test_verification_upload_endpoint_real_ocr_behavior(client):
    """
    POST /api/v1/verification/upload requires authentication and extracts
    document text, performs genuine verification, and persists the record.
    """
    headers = register_and_login(client, "upload_user@example.com")

    # Document with valid text
    file_content = b"Central Agriculture Assistance 2026. Official benefit disbursal via DBT."
    files = {"file": ("scheme_notice.txt", io.BytesIO(file_content), "text/plain")}

    resp = client.post(
        "/api/v1/verification/upload",
        files=files,
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert "scaffold" not in data["message"].lower()
    assert data["data"]["status"] == "completed"
    assert data["data"]["risk_score"] is not None


def test_verification_get_by_id_and_user_isolation(client):
    """
    GET /api/v1/verification/{id} returns real DB record, enforces 404 for
    missing, and 403 Forbidden when a user tries to access another citizen's record.
    """
    headers1 = register_and_login(client, "citizen_one@example.com")
    headers2 = register_and_login(client, "citizen_two@example.com")

    # Citizen 1 analyzes a scheme
    resp = client.post(
        "/api/v1/verification/analyze",
        json={"title": "Private Citizen 1 Record", "content": "Claimed welfare grant information for farmer subsidy."},
        headers=headers1,
    )
    assert resp.status_code == 200
    v_id = resp.json()["data"]["id"]

    # Citizen 1 can retrieve their record
    get_resp = client.get(f"/api/v1/verification/{v_id}", headers=headers1)
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["data"]["id"] == v_id
    assert get_data["data"]["scheme_name"] == "Private Citizen 1 Record"

    # Citizen 2 is blocked from accessing Citizen 1's record (403 Forbidden)
    forbidden_resp = client.get(f"/api/v1/verification/{v_id}", headers=headers2)
    assert forbidden_resp.status_code == 403

    # Nonexistent record returns 404 NotFound
    not_found_resp = client.get("/api/v1/verification/999999", headers=headers1)
    assert not_found_resp.status_code == 404


def test_scheme_not_labeled_fake_when_no_official_match_found():
    """
    Ensures that an unknown scheme with no official catalog or domain match
    is classified as 'unable_to_verify', NEVER as 'potentially_fake' or 'fake'.
    """
    assessment = RiskScoringService.calculate_assessment(
        suspicious_result={"detected": False, "matched_categories": [], "severity_score": 0, "reasons": []},
        similarity_result={"similarity_score": 0.0, "duplicate_match": False, "top_matches": []},
        official_source_result={"is_trusted": False, "extracted_domain": ""},
        scheme_name="Newly Introduced District Scholarship Program",
        description="A local community scholarship program offering educational support to students in rural regions.",
        submitted_url=None,
    )

    assert assessment["result_label"] == "unable_to_verify"
    assert assessment["result_label"] != "potentially_fake"
    assert assessment["result_label"] != "fake"
    assert "insufficient evidence" in assessment["explanation"].lower() or "inconclusive" in assessment["explanation"].lower()
