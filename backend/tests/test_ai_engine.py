import pytest
from app.models.scheme import Scheme
from app.services.duplicate_detection_service import (
    DuplicateDetectionService,
    LocalTfidfVectorizer,
)
from app.services.nlp_service import NLPAnalysisService
from app.services.official_source_service import OfficialSourceVerificationService
from app.services.risk_scoring_service import RiskScoringService
from app.services.suspicious_detector_service import SuspiciousDetectorService
from app.services.verification_service import VerificationService


# =============================================================================
# 1. TEXT NORMALIZATION & NLP TESTS
# =============================================================================

def test_nlp_text_normalization():
    nlp = NLPAnalysisService()

    # Empty / None handling
    assert nlp.normalize_text("") == ""
    assert nlp.normalize_text(None) == ""

    # Casing and extra whitespace
    raw = "   PRADHAN    MANTRI   AWAS   YOJANA   "
    assert nlp.normalize_text(raw) == "pradhan mantri awas yojana"

    # Punctuation and HTML entities
    html_raw = "Apply &amp; Get &#36;5000! Visit: https://fake-link.com NOW!!!"
    normalized = nlp.normalize_text(html_raw)
    assert "fake link" not in normalized  # URLs stripped
    assert "apply" in normalized
    assert "5000" in normalized
    assert "!" not in normalized


def test_nlp_tokenization_and_stopwords():
    nlp = NLPAnalysisService()

    text = "The quick brown fox is applying for a government scheme"
    tokens_no_stops = nlp.tokenize(text, remove_stopwords=True)
    assert "the" not in tokens_no_stops
    assert "is" not in tokens_no_stops
    assert "for" not in tokens_no_stops
    assert "scheme" in tokens_no_stops
    assert "government" in tokens_no_stops

    tokens_all = nlp.tokenize(text, remove_stopwords=False)
    assert "the" in tokens_all


def test_nlp_ngrams_and_keywords():
    nlp = NLPAnalysisService()
    tokens = ["pradhan", "mantri", "kisan", "samman", "nidhi"]
    bigrams = nlp.extract_ngrams(tokens, n=2)
    assert "pradhan mantri" in bigrams
    assert "kisan samman" in bigrams
    assert len(bigrams) == 4


# =============================================================================
# 2. LOCAL TF-IDF & DUPLICATE SIMILARITY TESTS
# =============================================================================

def test_local_tfidf_vectorizer():
    vectorizer = LocalTfidfVectorizer(ngram_range=(1, 2))
    corpus = [
        "pradhan mantri awas yojana housing for all",
        "pradhan mantri awas yojana urban housing",
        "completely unrelated agricultural fertilizer subsidy",
    ]
    vectors = vectorizer.fit_transform(corpus)
    assert len(vectors) == 3

    # Documents 0 and 1 should have high similarity
    sim_0_1 = vectorizer.cosine_similarity(vectors[0], vectors[1])
    assert sim_0_1 > 0.50

    # Documents 0 and 2 should have near zero similarity
    sim_0_2 = vectorizer.cosine_similarity(vectors[0], vectors[2])
    assert sim_0_2 < 0.20


def test_duplicate_detection_empty_candidates():
    service = DuplicateDetectionService()
    res = service.compare_schemes("PM Kisan", "Income support for farmers", [])
    assert res["duplicate_match"] is False
    assert res["similarity_score"] == 0.0
    assert res["similarity_tier"] == "none"


def test_duplicate_detection_high_similarity():
    service = DuplicateDetectionService()
    candidate = Scheme(
        id=101,
        name="Pradhan Mantri Kisan Samman Nidhi",
        description="Direct income benefit of Rs 6000 per year for small and marginal landholder farmer families.",
        eligibility="All landholding farmers families",
        benefits="Rs 6000 per annum in three equal installments",
        department="Ministry of Agriculture",
    )

    # Near-identical submission
    res = service.compare_schemes(
        submitted_name="PM Kisan Samman Nidhi Yojana",
        submitted_description="Direct income support of Rs 6000 per year for farmer families.",
        candidate_schemes=[candidate],
    )
    assert res["similarity_score"] >= 0.70
    assert res["duplicate_match"] is True
    assert res["matched_scheme_id"] == 101
    assert res["similarity_tier"] == "high"


def test_duplicate_detection_unrelated_scheme():
    service = DuplicateDetectionService()
    candidate = Scheme(
        id=202,
        name="National Solar Mission Rooftop Grid Subsidy",
        description="Subsidy for installation of solar rooftop PV systems on residential buildings.",
        department="Ministry of New and Renewable Energy",
    )

    res = service.compare_schemes(
        submitted_name="Free Sewing Machine Welfare Scheme",
        submitted_description="Empowering women tailoring training support.",
        candidate_schemes=[candidate],
    )
    assert res["similarity_score"] < 0.35
    assert res["duplicate_match"] is False
    assert res["similarity_tier"] == "low"


# =============================================================================
# 3. SUSPICIOUS PATTERN DETECTOR TESTS
# =============================================================================

def test_suspicious_pattern_otp_theft():
    service = SuspiciousDetectorService()
    text = "Dear citizen, to receive your scheme grant please share your OTP and bank password immediately."
    res = service.scan_for_red_flags(text)
    assert res["detected"] is True
    assert "CREDENTIAL_HARVESTING" in res["matched_categories"]
    assert res["severity_score"] >= 35


def test_suspicious_pattern_advance_fee_fraud():
    service = SuspiciousDetectorService()
    text = "Pay registration fee of Rs 499 to personal UPI id claim@paytm to activate your subsidy."
    res = service.scan_for_red_flags(text)
    assert res["detected"] is True
    assert "ADVANCE_FEE_FRAUD" in res["matched_categories"]
    assert res["severity_score"] >= 30


def test_suspicious_pattern_guarantees_and_urgency():
    service = SuspiciousDetectorService()
    text = "100% guaranteed cash! Offer expires in 2 hours! Forward to 10 friends on WhatsApp!"
    res = service.scan_for_red_flags(text)
    assert res["detected"] is True
    assert "UNREALISTIC_GUARANTEES" in res["matched_categories"]
    assert "ARTIFICIAL_URGENCY" in res["matched_categories"]
    assert "UNOFFICIAL_CHANNELS" in res["matched_categories"]
    assert res["severity_score"] >= 50


def test_suspicious_pattern_clean_government_text():
    service = SuspiciousDetectorService()
    text = (
        "Pradhan Mantri Awas Yojana provides financial assistance for construction "
        "of pucca houses to eligible rural and urban households without standard shelter."
    )
    res = service.scan_for_red_flags(text)
    assert res["detected"] is False
    assert len(res["matched_categories"]) == 0
    assert res["severity_score"] == 0


# =============================================================================
# 4. OFFICIAL SOURCE DOMAIN TESTS
# =============================================================================

def test_official_source_signals():
    service = OfficialSourceVerificationService()

    # Trusted .gov.in
    gov_res = service.evaluate_domain_trust("https://rural.gov.in/schemes/pmay-g")
    assert gov_res["is_trusted"] is True
    assert gov_res["is_official_tld"] is True

    # Trusted .nic.in
    nic_res = service.evaluate_domain_trust("https://pmkisan.nic.in/")
    assert nic_res["is_trusted"] is True

    # Untrusted commercial / scam domain
    scam_res = service.evaluate_domain_trust("https://sarkari-yojana-apply.online/free-cash")
    assert scam_res["is_trusted"] is False
    assert scam_res["source_category"] == "unverified_third_party"

    # Malformed / empty
    empty_res = service.evaluate_domain_trust("")
    assert empty_res["is_trusted"] is False


# =============================================================================
# 5. RISK SCORING & CONFIDENCE BOUNDS & RESULT LABELS
# =============================================================================

def test_risk_scoring_bounds_and_critical_red_flags():
    scoring = RiskScoringService()

    # Critical scam with credential theft
    suspicious = {
        "detected": True,
        "severity_score": 75,
        "matched_categories": ["CREDENTIAL_HARVESTING", "ADVANCE_FEE_FRAUD"],
        "reasons": ["OTP theft detected", "Registration fee requested"],
    }
    similarity = {"duplicate_match": False, "similarity_score": 0.1, "top_matches": []}
    official = {"is_trusted": False, "source_category": "unverified_third_party"}

    assessment = scoring.calculate_assessment(
        suspicious_result=suspicious,
        similarity_result=similarity,
        official_source_result=official,
        scheme_name="Fake Benefit PM Yojana",
        description="Share your OTP and pay registration fee of Rs 500 now to unlock your grant.",
        submitted_url="https://fake-pm.xyz",
    )

    assert 0 <= assessment["risk_score"] <= 100
    assert 0 <= assessment["confidence_score"] <= 100
    assert assessment["risk_score"] >= 80.0
    assert assessment["result_label"] == "potentially_fake"
    assert "evidence" in assessment
    assert len(assessment["evidence"]["signals"]) == 3


def test_risk_scoring_genuine_with_official_source():
    scoring = RiskScoringService()

    suspicious = {"detected": False, "severity_score": 0, "matched_categories": [], "reasons": []}
    similarity = {"duplicate_match": False, "similarity_score": 0.2, "top_matches": [{"scheme_id": 1}]}
    official = {"is_trusted": True, "source_category": "verified_government_portal"}

    assessment = scoring.calculate_assessment(
        suspicious_result=suspicious,
        similarity_result=similarity,
        official_source_result=official,
        scheme_name="National Apprenticeship Promotion Scheme",
        description="Government initiative promoting apprenticeship training by sharing stipend support with employers.",
        submitted_url="https://apprenticeshipindia.gov.in",
    )

    assert assessment["risk_score"] <= 25.0
    assert assessment["confidence_score"] >= 55.0
    assert assessment["result_label"] == "genuine"


def test_risk_scoring_duplicate_detection():
    scoring = RiskScoringService()

    suspicious = {"detected": False, "severity_score": 0, "matched_categories": [], "reasons": []}
    similarity = {
        "duplicate_match": True,
        "matched_scheme_name": "Pradhan Mantri Awas Yojana",
        "similarity_score": 0.85,
        "similarity_tier": "high",
        "reason": "High similarity detected",
        "top_matches": [{"scheme_id": 10, "scheme_name": "Pradhan Mantri Awas Yojana"}],
    }
    official = {"is_trusted": False, "source_category": "unverified_third_party"}

    assessment = scoring.calculate_assessment(
        suspicious_result=suspicious,
        similarity_result=similarity,
        official_source_result=official,
        scheme_name="Pradhan Mantri Awas Yojana Housing",
        description="Pucca house construction subsidy for economically weaker section families.",
    )

    assert assessment["result_label"] == "duplicate"
    assert "Pradhan Mantri Awas Yojana" in assessment["explanation"]


def test_risk_scoring_insufficient_evidence():
    scoring = RiskScoringService()

    suspicious = {"detected": False, "severity_score": 0, "matched_categories": [], "reasons": []}
    similarity = {"duplicate_match": False, "similarity_score": 0.0, "top_matches": []}
    official = {"is_trusted": False}

    # Very sparse text
    assessment = scoring.calculate_assessment(
        suspicious_result=suspicious,
        similarity_result=similarity,
        official_source_result=official,
        scheme_name="Free Cash",
        description="",
    )

    assert assessment["result_label"] == "unable_to_verify"


# =============================================================================
# 6. END-TO-END VERIFICATION SERVICE INTEGRATION
# =============================================================================

def test_verification_service_compute_similarity():
    service = VerificationService()
    sim = service.compute_similarity("PM Kisan Samman Nidhi", "Pradhan Mantri Kisan Samman Nidhi")
    assert sim > 0.40

    sim_zero = service.compute_similarity("", "PM Kisan")
    assert sim_zero == 0.0


# =============================================================================
# 7. FASTAPI API ROUTE INTEGRATION TESTS
# =============================================================================

def get_auth_token(client, email="ai.test.user@example.com"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "AI Test Citizen"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return login_resp.json()["access_token"]


def test_api_verify_scam_submission(client):
    """Citizen submits message requesting OTP & registration fee -> potentially_fake."""
    token = get_auth_token(client, "scam.report@example.com")
    payload = {
        "scheme_name": "PM Free Solar Loan Scheme",
        "description": "Congratulations! Pay registration fee of Rs 499 to claim grant. Please share your OTP to confirm approval.",
        "submitted_url": "https://pm-solar-subsidy.xyz/apply",
        "input_type": "text",
    }
    response = client.post(
        "/api/v1/verify",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "completed"
    assert data["result_label"] == "potentially_fake"
    assert data["risk_score"] >= 70.0
    assert data["confidence_score"] >= 40.0
    assert "signals" in data["evidence"]
    assert len(data["evidence"]["signals"]) == 3


def test_api_verify_genuine_submission(client):
    """Citizen submits an announcement hosted on a verified gov.in portal."""
    token = get_auth_token(client, "genuine.check@example.com")
    payload = {
        "scheme_name": "National Apprenticeship Promotion Scheme",
        "description": "Government program incentivizing industry apprenticeship training by sharing stipend support with eligible registered establishments.",
        "submitted_url": "https://apprenticeshipindia.gov.in/schemes",
        "input_type": "url",
    }
    response = client.post(
        "/api/v1/verify",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "completed"
    assert data["result_label"] == "genuine"
    assert data["risk_score"] <= 25.0
    assert data["confidence_score"] >= 55.0


def test_api_verify_error_handling_graceful(client, monkeypatch):
    """Simulates an unexpected processing crash to verify safe 500 response without stack traces."""
    from app.services.verification_service import verification_service

    def mock_broken_process(db, request):
        from app.utils.exceptions import AppException
        request.status = "failed"
        request.explanation = "Verification processing failed due to an unexpected server error."
        db.commit()
        raise AppException("Verification processing failed. Please check submitted input or try again.", status_code=500)

    monkeypatch.setattr(verification_service, "process_verification", mock_broken_process)

    token = get_auth_token(client, "failure.test@example.com")
    payload = {
        "scheme_name": "Test Failure Handling Scheme",
        "description": "Checking error handling gracefully.",
    }
    response = client.post(
        "/api/v1/verify",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 500
    err_body = response.json()
    assert err_body["success"] is False
    assert "Verification processing failed" in err_body["error"]["message"]
