import pytest
from app.services.multilingual_service import MultilingualExplanationService, multilingual_service


def test_multilingual_invariants_and_translations():
    """
    Verifies that multilingual explanations strictly preserve risk_score, confidence_score,
    and result_label while producing accurate English, Hindi, and Marathi text.
    """
    result = multilingual_service.generate_multilingual_explanation(
        result_label="genuine",
        risk_score=0.12,
        confidence_score=0.95,
        scheme_name="PM Kisan Samman Nidhi",
    )

    # Invariants
    assert result["scores"]["risk_score"] == 0.12
    assert result["scores"]["confidence_score"] == 0.95
    assert result["scores"]["result_label"] == "genuine"

    # Languages present
    assert "en" in result["translations"]
    assert "hi" in result["translations"]
    assert "mr" in result["translations"]

    en = result["translations"]["en"]
    hi = result["translations"]["hi"]
    mr = result["translations"]["mr"]

    # English checks
    assert "PM Kisan Samman Nidhi" in en["summary"]
    assert len(en["recommendations"]) == 3

    # Hindi checks
    assert "PM Kisan Samman Nidhi" in hi["summary"]
    assert "सत्यापित" in hi["summary"]
    assert len(hi["recommendations"]) == 3

    # Marathi checks
    assert "PM Kisan Samman Nidhi" in mr["summary"]
    assert "अधिकृत" in mr["summary"] or "शासकीय" in mr["summary"]
    assert len(mr["recommendations"]) == 3


def test_localized_labels_across_languages():
    """Checks translation lookup for all 5 risk labels."""
    labels = ["genuine", "suspicious", "potentially_fake", "duplicate", "unable_to_verify"]
    for lab in labels:
        en_label = MultilingualExplanationService.get_localized_label(lab, "en")
        hi_label = MultilingualExplanationService.get_localized_label(lab, "hi")
        mr_label = MultilingualExplanationService.get_localized_label(lab, "mr")

        assert en_label and isinstance(en_label, str)
        assert hi_label and isinstance(hi_label, str)
        assert mr_label and isinstance(mr_label, str)
        assert en_label != hi_label
        assert en_label != mr_label


def test_all_checks_and_outcomes_trilingual():
    """
    Verifies that all 4 verification checks across all 4 outcome states
    (pass, warning, fail, inconclusive) provide complete, non-empty text in en, hi, mr.
    """
    check_ids = [
        "official_source_check",
        "linguistic_scam_pattern_check",
        "catalogue_similarity_check",
        "document_or_url_integrity_check",
    ]
    outcomes = ["pass", "warning", "fail", "inconclusive"]
    languages = ["en", "hi", "mr"]

    for cid in check_ids:
        # Check titles
        for lang in languages:
            title = MultilingualExplanationService.CHECK_TITLES.get(cid, {}).get(lang)
            assert title and len(title.strip()) > 0, f"Missing title for check {cid} in {lang}"

        for res in outcomes:
            # Check findings
            for lang in languages:
                finding = MultilingualExplanationService.CHECK_FINDINGS.get(cid, {}).get(res, {}).get(lang)
                assert finding and len(finding.strip()) > 0, f"Missing finding for check {cid}.{res} in {lang}"

            # Check actions
            for lang in languages:
                action = MultilingualExplanationService.CHECK_ACTIONS.get(cid, {}).get(res, {}).get(lang)
                assert action and len(action.strip()) > 0, f"Missing action for check {cid}.{res} in {lang}"


def test_status_meanings_and_recommendations_trilingual():
    """
    Verifies citizen-facing status meanings and safety recommendations for all labels in en, hi, mr.
    """
    labels = ["genuine", "suspicious", "potentially_fake", "duplicate", "unable_to_verify"]
    languages = ["en", "hi", "mr"]

    for lab in labels:
        for lang in languages:
            meaning = MultilingualExplanationService.get_status_meaning(lab, lang)
            assert meaning and len(meaning.strip()) > 0, f"Missing status meaning for {lab} in {lang}"

            recoms = MultilingualExplanationService.get_recommendations(lab, lang)
            assert isinstance(recoms, list) and len(recoms) >= 3, f"Expected >= 3 recommendations for {lab} in {lang}"
            for r in recoms:
                assert r and len(r.strip()) > 0


def test_limitations_and_uncertainty_trilingual():
    """
    Verifies legal/methodological limitations and missing-evidence impact explanations in all languages.
    """
    for lang in ["en", "hi", "mr"]:
        limits = MultilingualExplanationService.get_limitations(lang)
        assert len(limits) >= 3
        for lim in limits:
            assert lim and len(lim.strip()) > 0

        # Missing evidence uncertainty
        uncertainty_msg = MultilingualExplanationService.format_missing_evidence_impact(
            evidence_coverage="partial",
            submitted_url=None,
            text_length=50,
            lang=lang,
        )
        assert uncertainty_msg and len(uncertainty_msg.strip()) > 0


def test_bundle_completeness_validation():
    """
    Verifies that complete trilingual bundles pass completeness validation,
    and missing fields are detected and flagged as incomplete.
    """
    complete_bundle = MultilingualExplanationService.generate_trilingual_bundle(
        risk_score=25.0,
        confidence_score=75.0,
        result_label="genuine",
        scheme_name="PM Kisan",
        submitted_url="https://pmkisan.gov.in",
        text_length=150,
        contributions=[{
            "component": "Baseline Risk",
            "points": 20.0,
            "direction": "neutral",
            "description": "Baseline",
            "description_hi": "आधार",
            "description_mr": "आधार",
        }],
        checks=[{
            "check_id": "official_source_check",
            "name": "Official Source",
            "result": "pass",
            "finding": "Verified portal",
            "score_contribution": -25.0,
            "confidence": 0.9,
            "coverage": "complete",
            "recommended_action": "Safe",
            "explanation": {"en": "Portal", "hi": "पोर्टल", "mr": "पोर्टल"},
        }],
        evidence_coverage="complete",
    )

    is_complete, missing = MultilingualExplanationService.validate_bundle_completeness(complete_bundle)
    assert is_complete is True
    assert len(missing) == 0
    assert complete_bundle["en"]["localization_completeness"] == "complete"
    assert complete_bundle["hi"]["localization_completeness"] == "complete"
    assert complete_bundle["mr"]["localization_completeness"] == "complete"

    # Incomplete bundle test
    broken_bundle = dict(complete_bundle)
    broken_bundle["mr"] = dict(broken_bundle["mr"])
    broken_bundle["mr"]["summary"] = ""
    is_comp_broken, missing_fields = MultilingualExplanationService.validate_bundle_completeness(broken_bundle)
    assert is_comp_broken is False
    assert "mr.summary" in missing_fields


def test_localized_error_messages():
    """
    Verifies that citizen-facing error messages are translated in en, hi, mr.
    """
    error_codes = ["unauthorized", "forbidden", "not_found", "validation_error", "server_error", "inconclusive"]
    for code in error_codes:
        en_err = MultilingualExplanationService.get_localized_error(code, "en")
        hi_err = MultilingualExplanationService.get_localized_error(code, "hi")
        mr_err = MultilingualExplanationService.get_localized_error(code, "mr")

        assert en_err and len(en_err.strip()) > 0
        assert hi_err and len(hi_err.strip()) > 0
        assert mr_err and len(mr_err.strip()) > 0
        assert en_err != hi_err
        assert en_err != mr_err


def test_resolve_language_behavior():
    """
    Verifies language code normalization and 422 error on unsupported languages.
    """
    from app.utils.exceptions import AppException

    assert MultilingualExplanationService.resolve_language("EN") == "en"
    assert MultilingualExplanationService.resolve_language(None, "HI") == "hi"
    assert MultilingualExplanationService.resolve_language("mr") == "mr"

    with pytest.raises(AppException) as exc_info:
        MultilingualExplanationService.resolve_language("fr")
    assert exc_info.value.status_code == 422

