from typing import Any, Dict, List, Optional
from app.services.multilingual_service import MultilingualExplanationService, multilingual_service


class RiskScoringService:
    """
    Transparent risk scoring and confidence assessment engine.
    Combines rule-based suspicious indicators, TF-IDF duplicate similarity,
    and official-source domain verification into explainable metrics (0-100),
    providing comprehensive trilingual justifications and structured evidence.
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
        - scoring_policy_version: "2.0"
        - evidence_coverage: "complete", "partial", or "missing"
        - score_breakdown: itemized reproducible calculation
        - trilingual_explanations: full explanations in en, hi, mr
        - evidence: detailed audit trace
        """
        combined_text = f"{scheme_name or ''} {description or ''}".strip()
        text_length = len(combined_text)
        url_provided = bool(submitted_url and submitted_url.strip())
        is_trusted_domain = official_source_result.get("is_trusted", False)
        matched_categories = suspicious_result.get("matched_categories", [])
        severity_score = suspicious_result.get("severity_score", 0)
        is_suspicious_detected = bool(suspicious_result.get("detected"))
        duplicate_match = bool(similarity_result.get("duplicate_match", False))
        similarity_score = float(similarity_result.get("similarity_score", 0.0))

        # Check for government affiliation claims in text
        claimed_gov = any(
            kw in combined_text.lower()
            for kw in ["pm ", "yojana", "pradhan mantri", "sarkari", "ministry", "central scheme"]
        )

        # =====================================================================
        # 1. RISK SCORE COMPUTATION & ITEMIZED CONTRIBUTIONS
        # =====================================================================
        base_score = 20.0
        current_risk = base_score
        contributions: List[Dict[str, Any]] = []

        # Baseline
        contributions.append({
            "component": "Baseline Risk",
            "points": 20.0,
            "direction": "increase",
            "description": "Standard baseline risk assigned to unverified public announcements.",
            "description_hi": "गैर-सत्यापित सार्वजनिक घोषणाओं के लिए 20.0 अंकों का तटस्थ आधार स्तर।",
            "description_mr": "अपडताळणीकृत सार्वजनिक घोषणांसाठी 20.0 गुणांचा तटस्थ आधारभूत स्तर.",
        })

        # Signal A: Linguistic scam patterns
        if is_suspicious_detected:
            scam_delta = round(severity_score * 0.70, 1)
            if "CREDENTIAL_HARVESTING" in matched_categories and (current_risk + scam_delta) < 80.0:
                scam_delta = round(80.0 - current_risk, 1)
            elif "ADVANCE_FEE_FRAUD" in matched_categories and (current_risk + scam_delta) < 70.0:
                scam_delta = round(70.0 - current_risk, 1)

            current_risk += scam_delta
            contributions.append({
                "component": "Linguistic Scam Indicators",
                "points": scam_delta,
                "direction": "increase",
                "description": f"Detected high-risk scam patterns: {', '.join(matched_categories)}.",
                "description_hi": f"पहचाने गए उच्च जोखिम वाले भ्रामक संकेत: {', '.join(matched_categories)}।",
                "description_mr": f"आढळलेले उच्च जोखमीचे संशयास्पद संकेत: {', '.join(matched_categories)}.",
            })
        else:
            contributions.append({
                "component": "Linguistic Scam Indicators",
                "points": 0.0,
                "direction": "neutral",
                "description": "No overt scam keywords, fee solicitations, or credential harvesting detected.",
                "description_hi": "कोई प्रत्यक्ष भ्रामक शब्द, शुल्क की मांग या क्रेडेंशियल चोरी नहीं पाई गई।",
                "description_mr": "कोणतेही उघड फसवणुकीचे शब्द, पैशांची मागणी किंवा ओळखपत्र मागितलेले नाही.",
            })

        # Signal B: Official source domain check
        if url_provided:
            if is_trusted_domain:
                current_risk -= 25.0
                contributions.append({
                    "component": "Official Government Domain",
                    "points": -25.0,
                    "direction": "decrease",
                    "description": f"Hosted on a verified government portal ({official_source_result.get('domain', '')}) ending in .gov.in/.nic.in.",
                    "description_hi": f"आधिकारिक सरकारी पोर्टल ({official_source_result.get('domain', '')}) पर होस्ट किया गया है।",
                    "description_mr": f"अधिकृत शासकीय पोर्टलवर ({official_source_result.get('domain', '')}) होस्ट केले आहे.",
                })
            else:
                domain_delta = 20.0 if claimed_gov else 10.0
                current_risk += domain_delta
                desc_en = (
                    f"Non-government domain ({official_source_result.get('domain', '')}) claiming official government welfare benefits."
                    if claimed_gov
                    else f"Third-party external web link ({official_source_result.get('domain', '')})."
                )
                desc_hi = (
                    f"गैर-सरकारी डोमेन ({official_source_result.get('domain', '')}) सरकारी योजना के लाभ देने का दावा कर रहा है।"
                    if claimed_gov
                    else f"तीसरे पक्ष का बाहरी वेब लिंक ({official_source_result.get('domain', '')})।"
                )
                desc_mr = (
                    f"अशासकीय डोमेन ({official_source_result.get('domain', '')}) शासकीय योजनेच्या लाभाचा दावा करत आहे."
                    if claimed_gov
                    else f"त्रयस्थ बाह्य वेब लिंक ({official_source_result.get('domain', '')})."
                )
                contributions.append({
                    "component": "Domain Authenticity",
                    "points": domain_delta,
                    "direction": "increase",
                    "description": desc_en,
                    "description_hi": desc_hi,
                    "description_mr": desc_mr,
                })
        else:
            contributions.append({
                "component": "Official Government Domain",
                "points": 0.0,
                "direction": "neutral",
                "description": "No web link submitted for domain corroboration (treated as evidence uncertainty, not fraud).",
                "description_hi": "डोमेन सत्यापन के लिए कोई वेब लिंक नहीं दिया गया (इसे अनिश्चितता माना गया, धोखाधड़ी नहीं)।",
                "description_mr": "डोमेन पडताळणीसाठी कोणतीही लिंक दिली नाही (ही पुराव्याची कमतरता मानली, फसवणूक नव्हे).",
            })

        # Signal C: Duplicate / Cloned Scheme Check
        if duplicate_match and url_provided and not is_trusted_domain:
            current_risk += 15.0
            contributions.append({
                "component": "Catalogue Impersonation",
                "points": 15.0,
                "direction": "increase",
                "description": f"Content closely mirrors genuine scheme '{similarity_result.get('matched_scheme_name')}' on an unauthorized third-party URL.",
                "description_hi": f"सामग्री वास्तविक योजना '{similarity_result.get('matched_scheme_name')}' की नकल करती है लेकिन अनधिकृत यूआरएल पर है।",
                "description_mr": f"मजकूर खऱ्या '{similarity_result.get('matched_scheme_name')}' योजनेची नक्कल करतो परंतु अनधिकृत लिंकवर आहे.",
            })
        elif duplicate_match:
            contributions.append({
                "component": "Catalogue Similarity",
                "points": 0.0,
                "direction": "neutral",
                "description": f"High textual similarity ({similarity_score:.0%}) to existing catalog scheme '{similarity_result.get('matched_scheme_name')}'.",
                "description_hi": f"मौजूदा योजना '{similarity_result.get('matched_scheme_name')}' से उच्च समानता ({similarity_score:.0%})।",
                "description_mr": f"विद्यमान योजना '{similarity_result.get('matched_scheme_name')}' शी उच्च साम्य ({similarity_score:.0%}).",
            })
        else:
            contributions.append({
                "component": "Catalogue Verification",
                "points": 0.0,
                "direction": "neutral",
                "description": "No direct match in central scheme catalogue (unindexed or state scheme, not proof of fraud).",
                "description_hi": "केंद्रीय सूची में कोई सीधा मिलान नहीं मिला (यह अनिश्चितता है, धोखाधड़ी का प्रमाण नहीं)।",
                "description_mr": "केंद्रीय सूचीमध्ये थेट जुळणी आढळली नाही (हा फसवणुकीचा पुरावा नाही).",
            })

        risk_score = round(max(0.0, min(100.0, current_risk)), 1)

        # =====================================================================
        # 2. CONFIDENCE SCORE COMPUTATION (0 to 100)
        # =====================================================================
        confidence = 10.0
        if text_length >= 120:
            confidence += 35.0
        elif text_length >= 40:
            confidence += 25.0
        else:
            confidence += 10.0

        if url_provided:
            confidence += 20.0

        if similarity_result.get("top_matches"):
            confidence += 20.0

        if len(matched_categories) >= 2:
            confidence += 15.0

        confidence_score = round(max(0.0, min(100.0, confidence)), 1)

        # =====================================================================
        # 3. RESULT LABEL ASSIGNMENT
        # =====================================================================
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
        elif is_trusted_domain and confidence_score >= 55.0 and risk_score <= 25.0 and not is_suspicious_detected:
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
        # 4. EVIDENCE COVERAGE & 4 STRUCTURED VERIFICATION CHECKS
        # =====================================================================
        if url_provided and text_length >= 40:
            evidence_coverage = "complete"
        elif not url_provided and text_length < 25:
            evidence_coverage = "missing"
        else:
            evidence_coverage = "partial"

        # Check 1: Official Source Domain
        if not url_provided:
            chk1_res = "inconclusive"
            chk1_delta = 0.0
            chk1_reason = "No official link provided."
            chk1_finding = "No web link provided for domain authentication. Absence of link indicates uncertainty, not fraud."
            chk1_action = "Always verify schemes on official government websites ending with .gov.in or .nic.in before applying."
        elif is_trusted_domain:
            chk1_res = "pass"
            chk1_delta = -25.0
            chk1_reason = "Domain verified under official .gov.in / .nic.in registry."
            chk1_finding = f"Domain '{official_source_result.get('domain', '')}' is verified in the official government registry."
            chk1_action = "Official government portal verified. You may proceed safely on this portal."
        else:
            chk1_res = "fail" if claimed_gov else "warning"
            chk1_delta = 20.0 if claimed_gov else 10.0
            chk1_reason = "Non-government domain claiming government welfare benefits." if claimed_gov else "Third-party external domain."
            chk1_finding = f"Domain '{official_source_result.get('domain', submitted_url)}' is not in the official government registry."
            chk1_action = "Do not enter personal credentials or send payments on unofficial third-party domains."

        official_source_check = {
            "check_id": "official_source_check",
            "name": "Official Government Source Verification",
            "result": chk1_res,
            "finding": chk1_finding,
            "evidence_url": submitted_url if url_provided else None,
            "score_contribution": chk1_delta,
            "score_reason": chk1_reason,
            "confidence": round(float(official_source_result.get("confidence", 85.0 if is_trusted_domain else (70.0 if url_provided else 30.0))) / 100.0, 2),
            "coverage": "complete" if url_provided else "missing",
            "recommended_action": chk1_action,
            "explanation": {
                "en": chk1_finding,
                "hi": "प्रस्तुत लिंक आधिकारिक .gov.in या .nic.in रजिस्ट्री के तहत एक सत्यापित सरकारी डोमेन पर जाती है।" if chk1_res == "pass" else ("लिंक आधिकारिक मंत्रालय दावे करती है लेकिन एक अविश्वसनीय या संदिग्ध तीसरे पक्ष की वेबसाइट पर आधारित है।" if chk1_res == "fail" else ("लिंक किसी आधिकारिक सरकारी पोर्टल के बजाय एक असत्यापित निजी या वाणिज्यिक डोमेन पर जाती है।" if chk1_res == "warning" else "सत्यापन के लिए कोई आधिकारिक यूआरएल या डोमेन लिंक प्रदान नहीं किया गया था। यह साक्ष्य की कमी है, सीधे धोखाधड़ी नहीं।")),
                "mr": "सादर केलेली लिंक अधिकृत .gov.in किंवा .nic.in नोंदणी अंतर्गत पडताळलेल्या सरकारी डोमेनशी जोडलेली आहे." if chk1_res == "pass" else ("लिंक अधिकृत मंत्रालयाचे दावे करते परंतु ती अविश्वासार्ह किंवा संशयास्पद त्रयस्थ संकेतस्थळावर होस्ट केलेली आहे." if chk1_res == "fail" else ("लिंक अधिकृत सरकारी पोर्टलऐवजी अपडताळणीकृत खाजगी किंवा व्यावसायिक डोमेनवर नेणारी आहे." if chk1_res == "warning" else "पडताळणीसाठी कोणतीही अधिकृत लिंक दिली नव्हती. ही केवळ पुराव्याची कमतरता आहे, थेट फसवणूक नव्हे.")),
            },
        }

        # Check 2: Linguistic Scam Patterns
        if is_suspicious_detected:
            has_crit = any(c in matched_categories for c in ["CREDENTIAL_HARVESTING", "ADVANCE_FEE_FRAUD"])
            chk2_res = "fail" if has_crit else "warning"
            chk2_delta = scam_delta
            chk2_reason = f"Detected high-risk patterns: {', '.join(matched_categories)}."
            chk2_finding = f"Suspicious scam indicators detected: {', '.join(matched_categories)}."
            chk2_action = "Never pay fees, share OTP/Aadhaar/passwords, or act under artificial deadlines for government schemes."
        elif text_length < 15:
            chk2_res = "inconclusive"
            chk2_delta = 0.0
            chk2_reason = "Text too brief for reliable scam pattern linguistic analysis."
            chk2_finding = "Text description is too brief to analyze for deceptive or fraudulent language."
            chk2_action = "Provide the full scheme description or official notification text for complete analysis."
        else:
            chk2_res = "pass"
            chk2_delta = 0.0
            chk2_reason = "No suspicious linguistic scam patterns detected."
            chk2_finding = "No fee solicitations, credential requests, or artificial urgency found. Clean text alone is not proof of authenticity."
            chk2_action = "Continue verification with official sources; lack of scam keywords does not alone prove authenticity."

        linguistic_scam_pattern_check = {
            "check_id": "linguistic_scam_pattern_check",
            "name": "Linguistic Scam & Pressure Tactic Detection",
            "result": chk2_res,
            "finding": chk2_finding,
            "evidence_url": None,
            "score_contribution": chk2_delta,
            "score_reason": chk2_reason,
            "confidence": 0.90 if is_suspicious_detected else (0.80 if text_length >= 40 else 0.40),
            "coverage": "complete" if text_length >= 40 else ("partial" if text_length >= 15 else "missing"),
            "recommended_action": chk2_action,
            "explanation": {
                "en": chk2_finding,
                "hi": "संदेश में कोई प्रत्यक्ष शुल्क मांग, क्रेडेंशियल अनुरोध या अनुचित जल्दबाजी नहीं मिली। स्वच्छ भाषा अकेले प्रामाणिकता का प्रमाण नहीं है।" if chk2_res == "pass" else ("गंभीर भ्रामक या धोखाधड़ी वाले संकेत मिले: शुल्क की मांग, पासवर्ड या बैंकिंग विवरण का अनुरोध।" if chk2_res == "fail" else ("संदेश में संशयास्पद भाषा, कृत्रिम तात्कालिकता या अवास्तविक वित्तीय वादे पाए गए।" if chk2_res == "warning" else "पाठ विश्लेषण के लिए सामग्री बहुत संक्षिप्त है।")),
                "mr": "मजकुरात पैशांची मागणी, गुप्त माहिती विचारणे किंवा कृत्रिम घाई आढळली नाही. संशयास्पद शब्दांचा अभाव म्हणजे थेट सत्यतेचा पुरावा नव्हे." if chk2_res == "pass" else ("गंभीर संशयास्पद किंवा फसवणुकीचे घटक आढळले: पैशांची मागणी, पासवर्ड किंवा बँकेचा तपशील विचारणे." if chk2_res == "fail" else ("संदेशात संशयास्पद भाषा, कृत्रिम घाई किंवा अवास्तव आर्थिक आश्वासने आढळली." if chk2_res == "warning" else "मजकूर विश्लेषणासाठी माहिती खूप अपुरी आहे.")),
            },
        }

        # Check 3: Catalogue Similarity
        if duplicate_match and url_provided and not is_trusted_domain:
            chk3_res = "fail"
            chk3_delta = 15.0
            chk3_reason = "Cloned government scheme hosted on an unauthorized third-party URL."
            chk3_finding = f"Closely duplicates known official scheme '{similarity_result.get('matched_scheme_name')}' ({similarity_score:.0%}), but hosted on an untrusted domain."
            chk3_action = "Suspected impersonation clone. Access the legitimate scheme directly via official portals."
        elif duplicate_match:
            chk3_res = "warning"
            chk3_delta = 0.0
            chk3_reason = "High similarity to an existing scheme catalog record."
            chk3_finding = f"High similarity to existing scheme '{similarity_result.get('matched_scheme_name')}' ({similarity_score:.0%})."
            chk3_action = "Verify whether this is a genuine re-announcement or duplicate entry."
        elif similarity_score >= 0.35:
            chk3_res = "pass"
            chk3_delta = 0.0
            chk3_reason = "Related scheme identified in national scheme catalogue."
            chk3_finding = f"Related scheme identified in national repository: '{similarity_result.get('matched_scheme_name')}' ({similarity_score:.0%})."
            chk3_action = "Compare official guidelines from the identified matching scheme."
        else:
            chk3_res = "inconclusive"
            chk3_delta = 0.0
            chk3_reason = "No close match found in the central catalogue. Scheme may be newly launched or state-specific."
            chk3_finding = "No matching scheme found in central catalogue. Scheme may be newly launched, state-specific, or unindexed. Not proof of fraud."
            chk3_action = "Absence from central catalogue is not proof of fraud. Check state department portals."

        catalogue_similarity_check = {
            "check_id": "catalogue_similarity_check",
            "name": "National Scheme Catalogue Cross-Reference",
            "result": chk3_res,
            "finding": chk3_finding,
            "evidence_url": similarity_result.get("matched_scheme_url"),
            "score_contribution": chk3_delta,
            "score_reason": chk3_reason,
            "confidence": 0.85 if duplicate_match else 0.70,
            "coverage": "complete" if similarity_result.get("top_matches") else "partial",
            "recommended_action": chk3_action,
            "explanation": {
                "en": chk3_finding,
                "hi": f"प्रस्तुत जानकारी आधिकारिक योजना '{similarity_result.get('matched_scheme_name')}' से काफी मिलती है।" if chk3_res in ("pass", "warning") else ("यह योजना किसी प्रामाणिक सरकारी योजना की अनधिकृत नकल प्रतीत होती है।" if chk3_res == "fail" else "केंद्रीय योजना सूची में कोई सीधा मिलान नहीं मिला। योजना नई या राज्य-विशिष्ट हो सकती है; यह धोखाधड़ी का प्रमाण नहीं है।"),
                "mr": f"सादर केलेली माहिती अधिकृत '{similarity_result.get('matched_scheme_name')}' योजनेशी जुळणारी आहे." if chk3_res in ("pass", "warning") else ("ही योजना खऱ्या शासकीय योजनेची अनधिकृत नक्कल असल्याचे दिसते." if chk3_res == "fail" else "केंद्रीय योजनेच्या सूचीमध्ये थेट जुळणी आढळली नाही. योजना नवीन किंवा राज्यस्तरीय असू शकते; हा फसवणुकीचा पुरावा नव्हे."),
            },
        }

        # Check 4: Document or URL Integrity
        if url_provided:
            is_https = submitted_url.lower().startswith("https://")
            if is_trusted_domain and is_https:
                chk4_res = "pass"
                chk4_delta = 0.0
                chk4_reason = "Secure HTTPS connection to an authenticated government domain."
                chk4_finding = "Secure HTTPS protocol verified on official government domain."
                chk4_action = "Resource integrity verified."
            elif not is_https:
                chk4_res = "warning"
                chk4_delta = 5.0
                chk4_reason = "Insecure HTTP connection without transport encryption."
                chk4_finding = "The submitted link does not use secure HTTPS encryption."
                chk4_action = "Do not submit sensitive personal details or documents over unencrypted connections."
            else:
                chk4_res = "warning"
                chk4_delta = 0.0
                chk4_reason = "External non-governmental web link."
                chk4_finding = "External non-governmental web resource."
                chk4_action = "Verify digital signatures and domain authenticity before downloading files."
        else:
            chk4_res = "inconclusive"
            chk4_delta = 0.0
            chk4_reason = "No document or URL submitted for cryptographic or integrity verification."
            chk4_finding = "No document or URL link submitted for cryptographic or protocol validation."
            chk4_action = "Submit an official document PDF or direct URL for full integrity analysis."

        document_or_url_integrity_check = {
            "check_id": "document_or_url_integrity_check",
            "name": "Document & Web Resource Integrity",
            "result": chk4_res,
            "finding": chk4_finding,
            "evidence_url": submitted_url if url_provided else None,
            "score_contribution": chk4_delta,
            "score_reason": chk4_reason,
            "confidence": 0.75 if url_provided else 0.30,
            "coverage": "complete" if url_provided else "missing",
            "recommended_action": chk4_action,
            "explanation": {
                "en": chk4_finding,
                "hi": "आधिकारिक डोमेन पर सुरक्षित HTTPS प्रोटोकॉल सत्यापित।" if chk4_res == "pass" else ("लिंक में सुरक्षित HTTPS एन्क्रिप्शन नहीं है।" if chk4_res == "fail" else ("बाहरी गैर-सरकारी वेब संसाधन।" if chk4_res == "warning" else "क्रिप्टोग्राफिक या प्रोटोकॉल सत्यापन के लिए कोई दस्तावेज़ या यूआरएल सबमिट नहीं किया गया।")),
                "mr": "अधिकृत डोमेनवर सुरक्षित HTTPS प्रोटोकॉल पडताळला." if chk4_res == "pass" else ("लिंकमध्ये सुरक्षित HTTPS एन्क्रिप्शन नाही." if chk4_res == "fail" else ("बाह्य अशासकीय वेब स्रोत." if chk4_res == "warning" else "तांत्रिक किंवा प्रोटोकॉल पडताळणीसाठी कोणताही दस्तऐवज किंवा लिंक सादर केली नाही.")),
            },
        }

        checks = [
            official_source_check,
            linguistic_scam_pattern_check,
            catalogue_similarity_check,
            document_or_url_integrity_check,
        ]

        raw_score = round(
            base_score + sum(c.get("points", 0.0) for c in contributions if c.get("component") != "Baseline Risk"), 1
        )
        score_breakdown = {
            "base_score": base_score,
            "contributions": contributions,
            "raw_score": raw_score,
            "final_risk_score": risk_score,
            "confidence_score": confidence_score,
            "evidence_coverage": evidence_coverage,
            "scoring_policy_version": "2.0",
            "inconclusive_checks_impact": "Inconclusive checks contribute 0.0 points to risk score and do not penalize the citizen.",
        }

        # =====================================================================
        # 5. GENERATE TRILINGUAL BUNDLE
        # =====================================================================
        trilingual_bundle = MultilingualExplanationService.generate_trilingual_bundle(
            risk_score=risk_score,
            confidence_score=confidence_score,
            result_label=result_label,
            scheme_name=scheme_name or "Submitted Scheme",
            submitted_url=submitted_url,
            text_length=text_length,
            contributions=contributions,
            checks=checks,
            evidence_coverage=evidence_coverage,
        )

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
                "status": "detected" if is_suspicious_detected else "clean",
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
            "scoring_policy_version": "2.0",
            "evidence_coverage": evidence_coverage,
            "checks": checks,
            "score_breakdown": score_breakdown,
            "trilingual_explanations": trilingual_bundle,
            "disclaimer": (
                "SchemeShield AI is an independent verification platform. Analysis is based on heuristic "
                "and pattern analysis and does not constitute official legal or governmental certification."
            ),
        }

        loc_status = trilingual_bundle.get("en", {}).get("localization_completeness", "complete") if trilingual_bundle else "complete"
        return {
            "risk_score": risk_score,
            "confidence_score": confidence_score,
            "result_label": result_label,
            "explanation": primary_reason,
            "evidence": structured_evidence,
            "scoring_policy_version": "2.0",
            "evidence_coverage": evidence_coverage,
            "score_breakdown": score_breakdown,
            "trilingual_explanations": trilingual_bundle,
            "localization_completeness": loc_status,
        }


risk_scoring_service = RiskScoringService()
