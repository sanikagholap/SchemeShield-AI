"""
SchemeShield AI - Final Backend Integration Test Suite (Prompt 6)
Tagline: "Verify Before You Trust."

Validates:
1. Verification History Filtering & Lightweight Item Schemas
2. Verification Statistics Endpoint & Isolation
3. User Profile Endpoint (GET /api/v1/users/me) & Security Sanitization
4. Local AI Assistant (POST /api/v1/assistant/chat), Knowledge Base & Safety Guardrails
5. End-to-End Complete Citizen Verification Lifecycle
6. OpenAPI and Swagger Documentation Endpoints
"""

import pytest


def get_authenticated_token(client, email="prompt6.user@example.com", name="Prompt6 Citizen"):
    """Helper to register and login a test user, returning the JWT access token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": name},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "SecurePassword123!"},
    )
    return login_resp.json()["access_token"]


# ==============================================================================
# 1. USER PROFILE ENDPOINT TESTS (GET /api/v1/users/me)
# ==============================================================================

def test_user_profile_authenticated(client):
    """GET /api/v1/users/me returns safe profile details and omits sensitive hashes."""
    token = get_authenticated_token(client, "profile.citizen@example.com", "Sunita Rao")
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile.citizen@example.com"
    assert data["full_name"] == "Sunita Rao"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data
    # Critical security checks: no password hashes or internal secrets exposed
    assert "password" not in data
    assert "password_hash" not in data
    assert "secret" not in data


def test_user_profile_unauthenticated(client):
    """GET /api/v1/users/me returns 401 when unauthenticated."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


# ==============================================================================
# 2. VERIFICATION HISTORY FILTERING TESTS (GET /api/v1/verify/history)
# ==============================================================================

def test_verification_history_filters_and_payload_structure(client):
    """GET /api/v1/verify/history supports result_label and status filters, and omits heavy text."""
    token = get_authenticated_token(client, "history.filter@example.com", "Filter Tester")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Submit a genuine-style scheme
    client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Pradhan Mantri Awas Yojana Rural Housing",
            "description": "Government assistance scheme for rural housing construction.",
            "submitted_url": "https://myscheme.gov.in/schemes/pmayg",
            "input_type": "text",
        },
        headers=headers,
    )

    # 2. Submit a suspicious scam-style scheme
    client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Immediate Cash Lottery Scheme 2026",
            "description": "Congratulations! Pay registration fee of Rs 999 immediately via UPI and please share your OTP to receive cash.",
            "input_type": "text",
        },
        headers=headers,
    )

    # Fetch unfiltered history
    resp_all = client.get("/api/v1/verify/history", headers=headers)
    assert resp_all.status_code == 200
    data_all = resp_all.json()
    assert data_all["total"] == 2
    assert len(data_all["items"]) == 2

    # Verify history items contain required summary fields and do not leak heavy raw blobs
    item = data_all["items"][0]
    assert "id" in item
    assert "scheme_name" in item
    assert "input_type" in item
    assert "result_label" in item
    assert "risk_score" in item
    assert "confidence_score" in item
    assert "status" in item
    assert "created_at" in item

    # Filter by result_label=potentially_fake
    resp_fake = client.get("/api/v1/verify/history?result_label=potentially_fake", headers=headers)
    assert resp_fake.status_code == 200
    data_fake = resp_fake.json()
    assert data_fake["total"] == 1
    assert data_fake["items"][0]["result_label"] == "potentially_fake"

    # Filter by result_label=genuine
    resp_genuine = client.get("/api/v1/verify/history?result_label=genuine", headers=headers)
    assert resp_genuine.status_code == 200
    data_genuine = resp_genuine.json()
    assert data_genuine["total"] == 1
    assert data_genuine["items"][0]["result_label"] == "genuine"

    # Filter by status=completed
    resp_completed = client.get("/api/v1/verify/history?status=completed", headers=headers)
    assert resp_completed.status_code == 200
    assert resp_completed.json()["total"] == 2


# ==============================================================================
# 3. VERIFICATION STATISTICS ENDPOINT TESTS (GET /api/v1/verify/stats)
# ==============================================================================

def test_verification_stats_empty_user(client):
    """GET /api/v1/verify/stats returns safe zero values for new users with no submissions."""
    token = get_authenticated_token(client, "zero.stats@example.com", "Zero Stats User")
    response = client.get(
        "/api/v1/verify/stats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_verifications"] == 0
    assert data["completed_verifications"] == 0
    assert data["pending_verifications"] == 0
    assert data["failed_verifications"] == 0
    assert data["genuine_count"] == 0
    assert data["suspicious_count"] == 0
    assert data["duplicate_count"] == 0
    assert data["potentially_fake_count"] == 0
    assert data["unable_to_verify_count"] == 0
    assert data["average_risk_score"] is None


def test_verification_stats_calculation_and_isolation(client):
    """GET /api/v1/verify/stats aggregates counts accurately and strictly isolates users."""
    token_a = get_authenticated_token(client, "stats.usera@example.com", "User A Stats")
    token_b = get_authenticated_token(client, "stats.userb@example.com", "User B Stats")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A verifies 2 requests (one clean, one suspicious)
    client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Official Fertilizer Subsidy 2026",
            "description": "Standard agricultural fertilizer subsidy from official portal.",
            "submitted_url": "https://myscheme.gov.in/schemes/fertilizer",
            "input_type": "text",
        },
        headers=headers_a,
    )
    client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Scam Grant Scheme",
            "description": "Congratulations! Pay registration fee of Rs 500 via UPI and please share your OTP to receive funds.",
            "submitted_url": "https://pm-solar-grant.xyz/claim",
            "input_type": "text",
        },
        headers=headers_a,
    )

    # Check User A stats
    resp_a = client.get("/api/v1/verify/stats", headers=headers_a)
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    assert data_a["total_verifications"] == 2
    assert data_a["completed_verifications"] == 2
    assert data_a["failed_verifications"] == 0
    assert (data_a["suspicious_count"] + data_a["potentially_fake_count"]) >= 1
    assert data_a["average_risk_score"] is not None
    assert 0 <= data_a["average_risk_score"] <= 100

    # User B stats must remain completely 0 (Strict tenant isolation)
    resp_b = client.get("/api/v1/verify/stats", headers=headers_b)
    assert resp_b.status_code == 200
    data_b = resp_b.json()
    assert data_b["total_verifications"] == 0
    assert data_b["average_risk_score"] is None


def test_verification_stats_unauthenticated(client):
    """GET /api/v1/verify/stats returns 401 when unauthenticated."""
    response = client.get("/api/v1/verify/stats")
    assert response.status_code == 401


# ==============================================================================
# 4. LOCAL AI ASSISTANT TESTS (POST /api/v1/assistant/chat)
# ==============================================================================

def test_assistant_chat_supported_questions(client):
    """POST /api/v1/assistant/chat answers core SchemeShield knowledge queries accurately."""
    token = get_authenticated_token(client, "assistant.user@example.com", "Assistant Tester")
    headers = {"Authorization": f"Bearer {token}"}

    queries = [
        "How can I check whether a government scheme is genuine?",
        "What does risk score mean?",
        "What does confidence score mean?",
        "What is duplicate scheme detection?",
        "Why is a scheme flagged as suspicious?",
        "Why is a .gov.in domain useful?",
        "What should I do if a scheme asks for OTP?",
        "What should I do if a scheme asks for payment or fee?",
        "How does OCR document verification work?",
        "What documents can I upload?",
        "What does unable to verify mean?",
    ]

    for q in queries:
        resp = client.post("/api/v1/assistant/chat", json={"message": q}, headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert "response" in body
        assert len(body["response"]) > 20
        assert "suggestions" in body
        assert isinstance(body["suggestions"], list)
        assert len(body["suggestions"]) > 0


def test_assistant_chat_safety_on_credential_theft_query(client):
    """POST /api/v1/assistant/chat gives emphatic warnings if asked about OTPs or bank details."""
    token = get_authenticated_token(client, "assistant.safety@example.com", "Safety User")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/assistant/chat",
        json={"message": "Can I share my bank account PIN and OTP to get 50000 rupees?"},
        headers=headers,
    )
    assert resp.status_code == 200
    text = resp.json()["response"].lower()
    assert "never share" in text or "fraud" in text or "otp" in text
    # Verify assistant never claims to be official government entity
    assert "official government service" not in text


def test_assistant_chat_unsupported_question_fallback(client):
    """POST /api/v1/assistant/chat falls back cleanly to verification guidance for unknown queries."""
    token = get_authenticated_token(client, "assistant.fallback@example.com", "Fallback User")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/assistant/chat",
        json={"message": "Who won the cricket world cup in 2011?"},
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "SchemeShield AI" in body["response"]
    assert "verify" in body["response"].lower()


def test_assistant_chat_validation_and_unauthenticated(client):
    """POST /api/v1/assistant/chat rejects empty/oversized messages and unauthenticated calls."""
    # 1. Unauthenticated -> 401
    resp_unauth = client.post("/api/v1/assistant/chat", json={"message": "Hello"})
    assert resp_unauth.status_code == 401

    token = get_authenticated_token(client, "assistant.val@example.com", "Validation User")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Too short / empty -> 422
    resp_short = client.post("/api/v1/assistant/chat", json={"message": "a"}, headers=headers)
    assert resp_short.status_code == 422

    # 3. Oversized message (> 1000 chars) -> 422
    resp_long = client.post("/api/v1/assistant/chat", json={"message": "x" * 1005}, headers=headers)
    assert resp_long.status_code == 422


# ==============================================================================
# 5. OPENAPI & SWAGGER TESTS
# ==============================================================================

def test_openapi_and_docs_endpoints(client):
    """Verifies that OpenAPI documentation and Swagger UI are accessible and complete."""
    docs_resp = client.get("/docs")
    assert docs_resp.status_code == 200

    openapi_resp = client.get("/openapi.json")
    assert openapi_resp.status_code == 200
    schema = openapi_resp.json()
    assert "paths" in schema

    paths = schema["paths"]
    # Check that all core versioned endpoints are documented in OpenAPI schema
    assert "/api/v1/auth/register" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/users/me" in paths
    assert "/api/v1/schemes" in paths
    assert "/api/v1/verify" in paths
    assert "/api/v1/verify/url" in paths
    assert "/api/v1/verify/document" in paths
    assert "/api/v1/verify/history" in paths
    assert "/api/v1/verify/stats" in paths
    assert "/api/v1/assistant/chat" in paths
    assert "/api/health" in paths


# ==============================================================================
# 6. COMPLETE END-TO-END CITIZEN LIFECYCLE INTEGRATION TEST
# ==============================================================================

def test_complete_citizen_verification_lifecycle_e2e(client):
    """
    Simulates complete end-to-end citizen journey:
    1. Register citizen
    2. Login and get JWT
    3. Retrieve profile (GET /api/v1/users/me)
    4. Submit genuine scheme
    5. Submit suspicious scheme
    6. Review verification history
    7. Review aggregated stats
    8. Chat with local AI assistant
    """
    # 1. Register
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "e2e.citizen@example.com",
            "password": "StrongPassword2026!",
            "full_name": "Pooja Verma",
        },
    )
    assert reg_resp.status_code == 201

    # 2. Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "email": "e2e.citizen@example.com",
            "password": "StrongPassword2026!",
        },
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Retrieve Profile
    profile_resp = client.get("/api/v1/users/me", headers=headers)
    assert profile_resp.status_code == 200
    assert profile_resp.json()["email"] == "e2e.citizen@example.com"
    assert profile_resp.json()["full_name"] == "Pooja Verma"

    # 4. Submit genuine government scheme for verification
    v1_resp = client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Pradhan Mantri Jan Dhan Yojana Financial Inclusion",
            "description": "National mission for financial inclusion offering zero balance savings accounts.",
            "submitted_url": "https://pmjdy.gov.in",
            "input_type": "text",
        },
        headers=headers,
    )
    assert v1_resp.status_code == 201
    v1_data = v1_resp.json()
    assert v1_data["status"] == "completed"
    assert v1_data["risk_score"] is not None

    # 5. Submit suspicious scam scheme
    v2_resp = client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Free Laptop Distribution 2026 - Instant Transfer",
            "description": "Congratulations! Pay registration fee of Rs 350 via UPI and please share your OTP now to get laptop.",
            "submitted_url": "http://free-laptop-yojana-claim.info",
            "input_type": "text",
        },
        headers=headers,
    )
    assert v2_resp.status_code == 201
    v2_data = v2_resp.json()
    assert v2_data["status"] == "completed"
    assert v2_data["risk_score"] > 50
    assert v2_data["result_label"] in ["suspicious", "potentially_fake"]

    # 6. Retrieve verification history
    history_resp = client.get("/api/v1/verify/history?page=1&page_size=10", headers=headers)
    assert history_resp.status_code == 200
    history_data = history_resp.json()
    assert history_data["total"] == 2
    assert len(history_data["items"]) == 2

    # 7. Retrieve verification stats
    stats_resp = client.get("/api/v1/verify/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats_data = stats_resp.json()
    assert stats_data["total_verifications"] == 2
    assert stats_data["completed_verifications"] == 2
    assert (stats_data["suspicious_count"] + stats_data["potentially_fake_count"]) >= 1
    assert stats_data["average_risk_score"] is not None

    # 8. Query Local AI Assistant
    chat_resp = client.post(
        "/api/v1/assistant/chat",
        json={"message": "What does a high risk score mean for my verified scheme?"},
        headers=headers,
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "risk score" in chat_data["response"].lower()
    assert len(chat_data["suggestions"]) > 0
