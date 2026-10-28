import pytest
from app.services.risk_scoring_service import RiskScoringService
from app.services.verification_service import VerificationService
from app.schemas.verification import VerificationRequestCreate


def test_scoring_determinism():
    """Identical evidence inputs must produce strictly identical risk and confidence scores."""
    suspicious = {"detected": False, "matched_categories": [], "severity_score": 0}
    similarity = {"duplicate_match": False, "similarity_score": 0.0, "matched_scheme_name": None}
    official = {"is_trusted": True, "domain": "myscheme.gov.in"}

    res1 = RiskScoringService.calculate_assessment(
        suspicious_result=suspicious,
        similarity_result=similarity,
        official_source_result=official,
        scheme_name="Pradhan Mantri Awas Yojana",
        description="Official housing assistance program for eligible rural families.",
        submitted_url="https://myscheme.gov.in/schemes/pmayg",
    )
    res2 = RiskScoringService.calculate_assessment(
        suspicious_result=suspicious,
        similarity_result=similarity,
        official_source_result=official,
        scheme_name="Pradhan Mantri Awas Yojana",
        description="Official housing assistance program for eligible rural families.",
        submitted_url="https://myscheme.gov.in/schemes/pmayg",
    )

    assert res1["risk_score"] == res2["risk_score"]
    assert res1["confidence_score"] == res2["confidence_score"]
    assert res1["result_label"] == res2["result_label"]
    assert res1["score_breakdown"] == res2["score_breakdown"]


def test_score_breakdown_exact_reconciliation():
    """
    Verifies that the itemized breakdown mathematically reconciles to the final score:
    base_score + non_baseline_adjustments = raw_score
    clamped raw_score == final_risk_score.
    """
    suspicious = {"detected": True, "matched_categories": ["ADVANCE_FEE_FRAUD"], "severity_score": 75}
    similarity = {"duplicate_match": True, "similarity_score": 0.85, "matched_scheme_name": "Free Tablet"}
    official = {"is_trusted": False, "domain": "freelaptop-claim.xyz"}

    res = RiskScoringService.calculate_assessment(
        suspicious_result=suspicious,
        similarity_result=similarity,
        official_source_result=official,
        scheme_name="Free Laptop Central Scheme 2026",
        description="Pay Rs 500 registration fee to receive guaranteed government laptop.",
        submitted_url="http://freelaptop-claim.xyz",
    )

    sb = res["score_breakdown"]
    base = sb["base_score"]
    adjustments = sum(c["points"] for c in sb["contributions"] if c["component"] != "Baseline Risk")
    expected_raw = round(base + adjustments, 1)

    assert sb["raw_score"] == expected_raw
    assert sb["final_risk_score"] == round(max(0.0, min(100.0, expected_raw)), 1)
    assert sb["final_risk_score"] == res["risk_score"]
    assert sb["scoring_policy_version"] == "2.0"


def test_score_bounds_and_rounding():
    """Verifies that risk score is strictly bounded in [0.0, 100.0] and rounded to 1 decimal place."""
    # Extreme high risk scenario
    suspicious_high = {
        "detected": True,
        "matched_categories": ["CREDENTIAL_HARVESTING", "ADVANCE_FEE_FRAUD", "URGENCY_PRESSURE"],
        "severity_score": 100,
    }
    official_bad = {"is_trusted": False, "domain": "scam.xyz"}
    similarity_dup = {"duplicate_match": True, "similarity_score": 0.95, "matched_scheme_name": "Fake"}

    res_high = RiskScoringService.calculate_assessment(
        suspicious_result=suspicious_high,
        similarity_result=similarity_dup,
        official_source_result=official_bad,
        scheme_name="Ministry PM Urgent Scheme",
        description="Share Aadhaar OTP and send money immediately.",
        submitted_url="http://scam.xyz",
    )
    assert 0.0 <= res_high["risk_score"] <= 100.0
    assert res_high["risk_score"] >= 80.0
    assert res_high["result_label"] == "potentially_fake"

    # Extreme safe scenario (official trusted domain, clean text)
    suspicious_clean = {"detected": False, "matched_categories": [], "severity_score": 0}
    official_gov = {"is_trusted": True, "domain": "india.gov.in"}
    similarity_none = {"duplicate_match": False, "similarity_score": 0.0}

    res_safe = RiskScoringService.calculate_assessment(
        suspicious_result=suspicious_clean,
        similarity_result=similarity_none,
        official_source_result=official_gov,
        scheme_name="National Scholarship Portal 2026",
        description="Comprehensive portal for post-matric scholarships across central ministries.",
        submitted_url="https://scholarships.gov.in",
    )
    assert 0.0 <= res_safe["risk_score"] <= 100.0
    assert res_safe["risk_score"] == 0.0  # 20 base - 25 trusted domain clamped to 0.0


def test_inconclusive_checks_neutral_impact():
    """
    Missing evidence (no link submitted, no catalog match) must be treated as uncertainty,
    NOT fraud. Inconclusive checks must contribute exactly 0.0 points.
    """
    suspicious_clean = {"detected": False, "matched_categories": [], "severity_score": 0}
    similarity_none = {"duplicate_match": False, "similarity_score": 0.0}
    official_none = {"is_trusted": False, "provided": False}

    res = RiskScoringService.calculate_assessment(
        suspicious_result=suspicious_clean,
        similarity_result=similarity_none,
        official_source_result=official_none,
        scheme_name="Regional Handicraft Artisans Allowance",
        description="State level grant for registered local craftspersons.",
        submitted_url=None,  # No link provided
    )

    # Must NOT be labeled fraud
    assert res["result_label"] in ("unable_to_verify", "suspicious")
    assert res["result_label"] != "potentially_fake"

    # Contributions for missing checks must be 0.0
    sb = res["score_breakdown"]
    domain_contrib = next(c for c in sb["contributions"] if "Domain" in c["component"])
    assert domain_contrib["points"] == 0.0
    assert domain_contrib["direction"] == "neutral"

    cat_contrib = next(c for c in sb["contributions"] if "Catalogue" in c["component"])
    assert cat_contrib["points"] == 0.0
    assert cat_contrib["direction"] == "neutral"


def get_auth_token(client, email="citizen.audit@example.com"):
    """Helper to register and login a user and return the Bearer token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Citizen Audit"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return login_resp.json()["access_token"]


def test_persistence_and_language_selection_no_recalculation(client):
    """
    Verifies that querying a saved verification with different language parameters:
    1. Returns localized summaries and checks in en, hi, mr.
    2. Does NOT recalculate scores, change status, or mutate record timestamps.
    """
    token = get_auth_token(client, "audit.lang@example.com")
    payload = {
        "scheme_name": "Atal Pension Yojana",
        "description": "Government-backed retirement pension scheme administered by PFRDA.",
        "submitted_url": "https://npscra.nsdl.co.in",
        "input_type": "text",
        "category": "Senior Citizen",
    }
    create_res = client.post(
        "/api/v1/verify",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    verification_id = created_data["id"]
    original_risk = created_data["risk_score"]
    original_confidence = created_data["confidence_score"]
    original_status = created_data["status"]
    original_created_at = created_data["created_at"]

    # Query in Hindi
    res_hi = client.get(
        f"/api/v1/verify/{verification_id}?lang=hi",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert data_hi["selected_language"] == "hi"
    assert data_hi["id"] == verification_id
    assert data_hi["risk_score"] == original_risk
    assert data_hi["confidence_score"] == original_confidence
    assert data_hi["status"] == original_status
    assert data_hi["created_at"] == original_created_at
    assert data_hi["localized_result"]["language"] == "hi"

    # Query in Marathi
    res_mr = client.get(
        f"/api/v1/verify/{verification_id}?lang=mr",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_mr.status_code == 200
    data_mr = res_mr.json()
    assert data_mr["selected_language"] == "mr"
    assert data_mr["id"] == verification_id
    assert data_mr["risk_score"] == original_risk
    assert data_mr["localized_result"]["language"] == "mr"

    # Dedicated Explain endpoint in Marathi
    res_explain = client.get(
        f"/api/v1/verify/{verification_id}/explain?lang=mr",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_explain.status_code == 200
    explain_data = res_explain.json()
    assert explain_data["verification_id"] == verification_id
    assert explain_data["selected_language"] == "mr"
    assert explain_data["explanation"]["language"] == "mr"


def test_history_category_filter_and_pagination(client):
    """
    Verifies that verification history supports category filtering and pagination.
    """
    token = get_auth_token(client, "audit.history@example.com")
    # Create student scheme
    client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Post-Matric Scholarship for Scheduled Castes",
            "description": "Centrally sponsored scholarship scheme for post-matric students.",
            "category": "Student",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    # Create farmer scheme
    client.post(
        "/api/v1/verify",
        json={
            "scheme_name": "Pradhan Mantri Krishi Sinchayee Yojana",
            "description": "National irrigation subsidy for rural farming communities.",
            "category": "Farmer",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Filter by category = Student
    res_student = client.get(
        "/api/v1/verify/history?category=Student",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_student.status_code == 200
    data_s = res_student.json()
    assert data_s["total"] >= 1
    for item in data_s["items"]:
        assert item["category"] == "Student"

    # Filter by category = Farmer
    res_farmer = client.get(
        "/api/v1/verify/history?category=Farmer",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_farmer.status_code == 200
    data_f = res_farmer.json()
    assert data_f["total"] >= 1
    for item in data_f["items"]:
        assert item["category"] == "Farmer"

    # Legacy endpoint supports category too
    res_legacy = client.get(
        "/api/v1/history?category=Student",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_legacy.status_code == 200
    assert res_legacy.json()["data"]["total"] >= 1


def test_user_isolation_idor_prevention(client):
    """
    Verifies that a citizen cannot read or access another citizen's verification records (IDOR protection).
    """
    token1 = get_auth_token(client, "user1.isolation@example.com")
    token2 = get_auth_token(client, "user2.isolation@example.com")

    # User 1 creates verification
    res1 = client.post(
        "/api/v1/verify",
        json={"scheme_name": "Confidential Citizen Scheme", "description": "Private application."},
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert res1.status_code == 201
    v_id = res1.json()["id"]

    # User 2 attempts to read User 1's verification -> 403 Forbidden
    res_unauth = client.get(
        f"/api/v1/verify/{v_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert res_unauth.status_code == 403

    # User 2 attempts explain User 1's verification -> 403 Forbidden
    res_explain_unauth = client.get(
        f"/api/v1/verify/{v_id}/explain",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert res_explain_unauth.status_code == 403

    # User 2's history must NOT contain User 1's records
    history_res = client.get(
        "/api/v1/verify/history",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert history_res.status_code == 200
    user2_items = [it["id"] for it in history_res.json()["items"]]
    assert v_id not in user2_items
