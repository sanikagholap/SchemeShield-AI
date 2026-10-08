from typing import Any, Dict, List


class RiskScoringService:
    """
    Transparent risk scoring and confidence assessment engine.
    Combines rule-based suspicious indicators, TF-IDF duplicate similarity,
    and official-source domain verification into explainable metrics (0-100).
    """

    @staticmethod
    def calculate_assessment(
        suspicious_result: Dict[str, Any],
        similarity_result: Dict[str, Any],
        official_source_result: Dict[str, Any],
        scheme_name: str,
        description: str,
        submitted_url: str = None,
    ) -> Dict[str, Any]:
        """
        Synthesizes multiple independent signals into:
        - risk_score: 0-100 (0 = lowest risk, 100 = highest risk)
        - confidence_score: 0-100 (0 = lowest evidence, 100 = highest evidence)
        - result_label: genuine, suspicious, duplicate, potentially_fake, unable_to_verify
        - explanation: human-readable synthesis for citizens
        - structured_evidence: detailed audit trace
        """
        # =====================================================================
        # 1. RISK SCORE COMPUTATION (0 to 100)
        # =====================================================================
        # Start at a neutral baseline for unverified public claims
        risk = 20.0

        # Signal A: Suspicious text and fraud red flags
        matched_categories = suspicious_result.get("matched_categories", [])
        severity_score = suspicious_result.get("severity_score", 0)

        if suspicious_result.get("detected"):
            # Add proportional risk from detected scam indicators
            risk += severity_score * 0.70

            # Guaranteed floor for critical red flags
            if "CREDENTIAL_HARVESTING" in matched_categories:
                risk = max(risk, 80.0)
            if "ADVANCE_FEE_FRAUD" in matched_categories:
                risk = max(risk, 70.0)

        # Signal B: Official Source Domain check
        url_provided = bool(submitted_url and submitted_url.strip())
        is_trusted_domain = official_source_result.get("is_trusted", False)

        if url_provided:
            if is_trusted_domain:
                # Verified official government portal significantly decreases risk
                risk -= 25.0
            else:
                # Non-government domain claiming government welfare benefits increases risk
                claimed_gov = any(
                    kw in f"{scheme_name} {description}".lower()
                    for kw in ["pm ", "yojana", "pradhan mantri", "sarkari", "ministry", "central scheme"]
                )
                if claimed_gov:
                    risk += 20.0
                else:
                    risk += 10.0

        # Signal C: Duplicate / Cloned Scheme Check
        duplicate_match = similarity_result.get("duplicate_match", False)
        similarity_score = similarity_result.get("similarity_score", 0.0)

        # If a scheme looks almost identical to an official scheme but is distributed via an untrusted URL
        if duplicate_match and url_provided and not is_trusted_domain:
            risk += 15.0

        # Bound risk strictly between 0 and 100
        risk_score = round(max(0.0, min(100.0, risk)), 1)

        # =====================================================================
        # 2. CONFIDENCE SCORE COMPUTATION (0 to 100)
        # =====================================================================
        # Confidence reflects the quantity and clarity of observable evidence
        confidence = 10.0

        combined_text = f"{scheme_name} {description or ''}".strip()
        text_length = len(combined_text)

        # Content volume score
        if text_length >= 120:
            confidence += 35.0
        elif text_length >= 40:
            confidence += 25.0
        else:
            confidence += 10.0

        # URL presence score
        if url_provided:
            confidence += 20.0

        # Catalog comparison score (if comparison had candidate data)
        if similarity_result.get("top_matches"):
            confidence += 20.0

        # Concordance bonus: if strong suspicious patterns were detected
        if len(matched_categories) >= 2:
            confidence += 15.0

        confidence_score = round(max(0.0, min(100.0, confidence)), 1)

        # =====================================================================
        # 3. RESULT LABEL ASSIGNMENT
        # =====================================================================
        # Follows strict deterministic rules:
        # genuine, suspicious, duplicate, potentially_fake, unable_to_verify
        if confidence_score < 30.0 or text_length < 15:
            result_label = "unable_to_verify"
            primary_reason = (
                "Insufficient evidence provided to perform a conclusive verification. "
                "Please submit additional text, full announcement details, or an official link."
            )
        elif risk_score >= 65.0 or "CREDENTIAL_HARVESTING" in matched_categories or "ADVANCE_FEE_FRAUD" in matched_categories:
            result_label = "potentially_fake"
            primary_reason = (
                "Critical scam indicators detected. The announcement exhibits patterns commonly associated "
                "with fraudulent campaigns, such as requests for secret credentials, registration fees, or unrealistic guarantees."
            )
        elif duplicate_match and risk_score < 50.0:
            result_label = "duplicate"
            matched_name = similarity_result.get("matched_scheme_name") or "an existing catalog record"
            primary_reason = (
                f"The submitted information closely duplicates or closely mirrors '{matched_name}'. "
                "Please consult the original scheme portal to confirm authoritative terms."
            )
        elif risk_score >= 40.0:
            result_label = "suspicious"
            primary_reason = (
                "Suspicious characteristics identified. The scheme contains warning indicators or originates from an "
                "unverified third-party link claiming government affiliation."
            )
        elif is_trusted_domain and confidence_score >= 55.0 and risk_score <= 25.0 and not suspicious_result.get("detected"):
            result_label = "genuine"
            primary_reason = (
                "Consistent with official government communications. Hosted on a verified government portal with "
                "no suspicious red flags detected."
            )
        else:
            result_label = "unable_to_verify"
            primary_reason = (
                "Evidence is inconclusive. While no overt fraud triggers were found, "
                "independent official government domain corroboration was not established."
            )

        # =====================================================================
        # 4. STRUCTURED EVIDENCE SUMMARY
        # =====================================================================
        signals: List[Dict[str, Any]] = [
            {
                "type": "official_source",
                "status": "trusted_government_domain" if is_trusted_domain else ("non_trusted_domain" if url_provided else "no_url_submitted"),
                "details": official_source_result,
            },
            {
                "type": "duplicate_similarity",
                "status": similarity_result.get("similarity_tier", "none"),
                "similarity_score": similarity_result.get("similarity_score", 0.0),
                "matched_scheme_name": similarity_result.get("matched_scheme_name"),
                "reason": similarity_result.get("reason"),
            },
            {
                "type": "suspicious_language",
                "status": "detected" if suspicious_result.get("detected") else "clean",
                "matched_categories": matched_categories,
                "reasons": suspicious_result.get("reasons", []),
            },
        ]

        structured_evidence = {
            "signals": signals,
            "metrics": {
                "risk_score": risk_score,
                "confidence_score": confidence_score,
                "result_label": result_label,
            },
            "disclaimer": (
                "SchemeShield AI is an independent verification platform. Analysis is based on heuristic "
                "and pattern analysis and does not constitute official legal or governmental certification."
            ),
        }

        return {
            "risk_score": risk_score,
            "confidence_score": confidence_score,
            "result_label": result_label,
            "explanation": primary_reason,
            "evidence": structured_evidence,
        }
