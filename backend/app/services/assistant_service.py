import re
from typing import Any, Dict, List, Tuple

from app.services.nlp_service import NLPAnalysisService
from app.utils.logger import logger


class AssistantService:
    """
    Local, deterministic, rule-and-knowledge-based AI Assistant for SchemeShield AI.
    Operates at zero cost without external paid LLMs (OpenAI, Gemini, etc.).
    Provides accurate, safe, citizen-friendly guidance on scheme verification,
    scam detection, and platform features.
    """

    KNOWLEDGE_BASE: List[Dict[str, Any]] = [
        {
            "id": "verify_how_to",
            "keywords": ["how to verify", "how do i verify", "check whether", "how can i check", "verify a scheme", "verify scheme"],
            "response": (
                "You can verify a government scheme on SchemeShield AI in three easy ways:\n"
                "1. Text: Paste the scheme announcement, social media message, or claimed details into 'Verify Scheme'.\n"
                "2. Document / Flyer: Upload a photo, flyer, screenshot, or PDF of the scheme notice.\n"
                "3. URL: Submit the website link circulating with the scheme announcement.\n\n"
                "Our local verification engine analyzes duplicate records, scam keywords, and domain trust to generate an explainable risk assessment."
            ),
            "suggestions": [
                "What does risk score mean?",
                "What does confidence score mean?",
                "What documents can I upload?",
            ],
        },
        {
            "id": "risk_score_meaning",
            "keywords": ["risk score", "what is risk score", "risk mean", "how is risk calculated"],
            "response": (
                "The Risk Score (0–100) measures the likelihood that a scheme announcement is fraudulent or misleading:\n"
                "• 0–25 (Low Risk): Content aligns with official government portal communication patterns.\n"
                "• 26–49 (Moderate Risk): Contains ambiguous wording or originates from an unverified third-party source.\n"
                "• 50–69 (Elevated Risk): Displays known warning signs or uncorroborated financial claims.\n"
                "• 70–100 (High Risk): Contains severe fraud red flags such as requests for OTPs, fees, or private credentials."
            ),
            "suggestions": [
                "What does confidence score mean?",
                "What should I do if a scheme asks for OTP?",
                "Why is a scheme marked suspicious?",
            ],
        },
        {
            "id": "confidence_score_meaning",
            "keywords": ["confidence score", "what is confidence score", "confidence mean"],
            "response": (
                "The Confidence Score (0–100) reflects the quantity and clarity of observable evidence available during verification:\n"
                "• High Confidence (>60): Clear, detailed text, verifiable URLs, or catalog matches corroborate the analysis.\n"
                "• Low Confidence (<35): The submission contained very short or vague information with no corroborating links.\n\n"
                "Note: Risk and Confidence are independent. A scheme can have High Risk with Low Confidence if severe red flags are found in brief text."
            ),
            "suggestions": [
                "What does 'unable to verify' mean?",
                "What does risk score mean?",
                "How do I verify a government scheme?",
            ],
        },
        {
            "id": "duplicate_scheme",
            "keywords": ["duplicate scheme", "what is duplicate", "cloned scheme", "copy scheme"],
            "response": (
                "A 'Duplicate' label means the submitted text or claim is highly similar (over 70% match) to an existing government welfare program in our catalog.\n\n"
                "Important: A duplicate label does NOT automatically mean fraud. It indicates that the announcement may be quoting an authentic scheme or circulating an unauthorized variant. Always cross-check the official portal."
            ),
            "suggestions": [
                "Why is a .gov.in domain useful?",
                "How do I verify a government scheme?",
                "What does risk score mean?",
            ],
        },
        {
            "id": "suspicious_reasons",
            "keywords": ["why is a scheme suspicious", "suspicious scheme", "suspicious mean", "warning signs"],
            "response": (
                "A scheme is flagged as 'Suspicious' when it contains common scam warning patterns, such as:\n"
                "• Unrealistic guarantees (e.g., '100% instant cash approval' or 'free laptops for all citizens').\n"
                "• Artificial urgency (e.g., 'offer closes in 2 hours' or 'limited slots').\n"
                "• Private forwarding instructions (e.g., 'forward to 10 WhatsApp groups to activate grant').\n"
                "• Hosting on unverified commercial domains (.online, .xyz) while claiming to be an official PM welfare scheme."
            ),
            "suggestions": [
                "What should I do if a scheme asks for OTP?",
                "What should I do if a scheme asks for payment?",
                "Why is a .gov.in domain useful?",
            ],
        },
        {
            "id": "gov_in_domain",
            "keywords": ["gov in", "nic in", "government domain", "official domain", "trusted domain"],
            "response": (
                "Domains ending in .gov.in or .nic.in are reserved exclusively for authorized ministries and departments of the Government of India.\n\n"
                "However, having a .gov.in link is only one positive trust signal. Always check whether the link is authentic and matches the actual portal name. A non-government website (like news portals or NGOs) is not automatically fake, but should be corroborated."
            ),
            "suggestions": [
                "How do I verify a government scheme?",
                "Why is a scheme suspicious?",
                "What does risk score mean?",
            ],
        },
        {
            "id": "otp_request",
            "keywords": ["otp", "one time password", "share otp", "asks for otp", "pin", "password"],
            "response": (
                "⚠️ CRITICAL FRAUD ALERT: Never share your OTP, UPI PIN, bank password, or CVV.\n\n"
                "Legitimate government welfare schemes and Direct Benefit Transfer (DBT) programs NEVER ask citizens to share OTPs or banking PINs to disburse benefits. Any message or person requesting your OTP to 'activate' or 'release' a scheme is attempting financial fraud."
            ),
            "suggestions": [
                "What should I do if a scheme asks for payment?",
                "Why is a scheme suspicious?",
                "How do I verify a government scheme?",
            ],
        },
        {
            "id": "payment_fee_request",
            "keywords": ["registration fee", "processing fee", "payment", "send money", "transfer money", "upi id"],
            "response": (
                "⚠️ FRAUD WARNING: Be extremely cautious if a scheme asks for an upfront registration or processing fee.\n\n"
                "Most Central and State welfare programs are free to apply for. Scammers frequently demand 'token amounts' (e.g., Rs 199, Rs 499) to personal UPI accounts or mobile numbers claiming to release larger funds. Official application fees, if any, are collected only through authorized treasury portals."
            ),
            "suggestions": [
                "What should I do if a scheme asks for OTP?",
                "What does risk score mean?",
                "Why is a scheme suspicious?",
            ],
        },
        {
            "id": "ocr_verification",
            "keywords": ["ocr", "how does ocr work", "flyer", "image verification", "screenshot"],
            "response": (
                "SchemeShield AI uses Optical Character Recognition (OCR) and PDF parsing to read text directly from uploaded scheme flyers, posters, or WhatsApp screenshots.\n\n"
                "Once the text is extracted locally on the server, it is automatically passed through our NLP engine to scan for duplicate claims, scam phrases, and official references—without sending your files to any external paid API."
            ),
            "suggestions": [
                "What documents can I upload?",
                "How do I verify a government scheme?",
                "What does confidence score mean?",
            ],
        },
        {
            "id": "allowed_documents",
            "keywords": ["what documents", "file formats", "supported formats", "upload format", "upload file"],
            "response": (
                "You can upload the following file formats for verification:\n"
                "• PDF Documents (.pdf)\n"
                "• Image Flyers & Screenshots (.png, .jpg, .jpeg, .webp)\n"
                "• Plain Text Files (.txt)\n\n"
                "Maximum file size is 10 MB. All uploaded files are processed in a secure temporary environment and immediately deleted after analysis."
            ),
            "suggestions": [
                "How does OCR verification work?",
                "How do I verify a government scheme?",
                "What does risk score mean?",
            ],
        },
        {
            "id": "unable_to_verify",
            "keywords": ["unable to verify", "inconclusive", "cannot verify"],
            "response": (
                "The 'Unable to Verify' verdict means the available evidence was insufficient to reach a definitive conclusion.\n\n"
                "This typically occurs when:\n"
                "• The submitted message is very short or vague (under 20 words).\n"
                "• No official link or reference was provided.\n"
                "• No duplicate scheme exists in our catalog.\n\n"
                "To get a more decisive verification, try submitting the full message text, an official flyer, or a website link."
            ),
            "suggestions": [
                "How do I verify a government scheme?",
                "What does confidence score mean?",
                "What does risk score mean?",
            ],
        },
    ]

    FALLBACK_RESPONSE = (
        "I am SchemeShield AI's Assistant. I can help answer questions about government scheme verification, "
        "fraud red flags, risk scores, and platform features.\n\n"
        "To check whether a specific scheme or WhatsApp forward is authentic, please use SchemeShield's "
        "'Verify Scheme' feature by submitting its text, document flyer, or website link."
    )

    FALLBACK_SUGGESTIONS = [
        "How do I verify a government scheme?",
        "What does risk score mean?",
        "What should I do if a scheme asks for OTP?",
        "What documents can I upload?",
    ]

    def __init__(self):
        self.nlp = NLPAnalysisService()
        logger.info("Initialized local AssistantService with deterministic knowledge base.")

    def answer_query(self, message: str) -> Dict[str, Any]:
        """
        Processes a citizen inquiry against the local knowledge base.
        Returns explainable response and suggested follow-ups.
        Enforces strict safety guardrails.
        """
        if not message or not message.strip():
            return {
                "response": "Please ask a question regarding government schemes, scam verification, or SchemeShield AI.",
                "suggestions": self.FALLBACK_SUGGESTIONS[:3],
            }

        cleaned = self.nlp.normalize_text(message)

        # 1. Check for immediate safety triggers (citizen asking if they should give OTP/PIN/password)
        if any(term in cleaned for term in ["otp", "pin", "password", "cvv"]):
            # Deliver prominent safety warning
            otp_entry = next((item for item in self.KNOWLEDGE_BASE if item["id"] == "otp_request"), None)
            if otp_entry:
                return {
                    "response": otp_entry["response"],
                    "suggestions": otp_entry["suggestions"],
                }

        # 2. Match against knowledge base keywords
        best_match = None
        highest_score = 0

        for item in self.KNOWLEDGE_BASE:
            score = 0
            for kw in item["keywords"]:
                norm_kw = self.nlp.normalize_text(kw)
                if norm_kw in cleaned:
                    score += 2
                elif any(word in cleaned.split() for word in norm_kw.split() if len(word) > 3):
                    score += 1

            if score > highest_score:
                highest_score = score
                best_match = item

        if best_match and highest_score >= 1:
            return {
                "response": best_match["response"],
                "suggestions": best_match["suggestions"],
            }

        # 3. Fallback guidance
        return {
            "response": self.FALLBACK_RESPONSE,
            "suggestions": self.FALLBACK_SUGGESTIONS,
        }


assistant_service = AssistantService()
