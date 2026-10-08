import re
from typing import Any, Dict, List, Pattern

from app.utils.logger import logger


class SuspiciousDetectorService:
    """
    Transparent, rule-based suspicious-pattern detector.
    Analyzes submitted scheme messages and announcements for common scam patterns,
    advance-fee fraud, credential theft, and artificial urgency triggers.
    Note: This is a deterministic heuristic rules engine, NOT a black-box ML model.
    """

    # Structured detection rule definitions: category -> (severity, weight, pattern, reason)
    RULE_DEFINITIONS: List[Dict[str, Any]] = [
        {
            "category": "CREDENTIAL_HARVESTING",
            "severity": "critical",
            "weight": 35,
            "patterns": [
                r"\b(enter|share|provide|send)\s+(your\s+)?(otp|one[-\s]time[-\s]password)\b",
                r"\b(share|enter|send|provide)\s+(your\s+)?(atm\s+)?(pin|upi[-\s]pin)\b",
                r"\b(enter|provide|share)\s+(your\s+)?(bank\s+)?(password|netbanking\s+password)\b",
                r"\b(card\s+number|cvv\s+number|3[-\s]digit\s+cvv|card\s+expiry)\b",
            ],
            "reason": "Requests for OTP, banking PIN, passwords, or CVV are severe fraud indicators. Legitimate government schemes NEVER ask citizens for secret credentials.",
        },
        {
            "category": "ADVANCE_FEE_FRAUD",
            "severity": "high",
            "weight": 30,
            "patterns": [
                r"\b(pay|transfer|deposit|send)\s+(a\s+)?(registration|processing|application|token)\s+(fee|charge|amount)\s+(of\s+)?(rs\.?|inr|rupees)?\s*\d+",
                r"\b(registration|processing|application)\s+fee\s+of\s+(rs\.?|inr|rupees)?\s*\d+\b",
                r"\b(pay|transfer)\s+(to\s+)?(personal\s+)?(upi\s+id|gpay|phonepe|paytm\s+number)\b",
                r"\b(refundable|advance)\s+security\s+(deposit|amount)\b",
            ],
            "reason": "Demands for upfront registration or processing fees to release welfare benefits are a hallmark of advance-fee scam operations.",
        },
        {
            "category": "UNREALISTIC_GUARANTEES",
            "severity": "high",
            "weight": 25,
            "patterns": [
                r"\b(100%|completely)?\s*(guaranteed|instant)\s+(approval|cash|disbursement|money|income)\b",
                r"\b(congratulations|selected)\s+(you\s+have\s+won|for\s+free\s+cash|eligible\s+for\s+unconditional)\b",
                r"\b(free\s+iphone|free\s+smartphone|free\s+car|free\s+laptop\s+for\s+everyone)\b",
                r"\b(no\s+eligibility\s+criteria|no\s+documents\s+required\s+direct\s+money)\b",
            ],
            "reason": "Unrealistic promises of guaranteed cash prizes, unconditional laptops, or 100% instant approval contradict official administrative guidelines.",
        },
        {
            "category": "ARTIFICIAL_URGENCY",
            "severity": "medium",
            "weight": 15,
            "patterns": [
                r"\b(valid\s+only\s+today|offer\s+expires\s+in\s+\d+\s*(hours?|minutes?)|limited\s+slots?\s+left)\b",
                r"\b(act\s+immediately\s+or\s+lose|act\s+fast\s+before\s+deadline\s+closes\s+today)\b",
                r"\b(first\s+come\s+first\s+served\s+hurry\s+up)\b",
            ],
            "reason": "Artificial urgency triggers attempt to pressure citizens into hasty actions without independently verifying official sources.",
        },
        {
            "category": "UNOFFICIAL_CHANNELS",
            "severity": "medium",
            "weight": 15,
            "patterns": [
                r"\b(forward\s+to\s+\d+\s+(people|contacts|groups|friends)|share\s+on\s+whatsapp\s+to\s+activate)\b",
                r"\b(join\s+telegram\s+(channel|group)\s+for\s+payment|contact\s+on\s+whatsapp\s+number)\b",
                r"\b(click\s+(here\s+)?to\s+claim\s+now|claim\s+via\s+whatsapp)\b",
            ],
            "reason": "Requests to forward messages to WhatsApp groups or contact private Telegram channels are characteristic of viral phishing campaigns.",
        },
    ]

    def __init__(self):
        # Precompile regular expressions for optimal evaluation performance
        self._compiled_rules = []
        for rule in self.RULE_DEFINITIONS:
            compiled_patterns = [
                re.compile(p, re.IGNORECASE) for p in rule["patterns"]
            ]
            self._compiled_rules.append({
                "category": rule["category"],
                "severity": rule["severity"],
                "weight": rule["weight"],
                "compiled_patterns": compiled_patterns,
                "reason": rule["reason"],
            })
        logger.info(f"Initialized SuspiciousDetectorService with {len(self._compiled_rules)} rule categories.")

    def scan_for_red_flags(self, content: str) -> Dict[str, Any]:
        """
        Scans scheme text content against all rule categories.
        Returns matched indicators, categories, raw severity score, and human-readable reasons.
        """
        if not content or not content.strip():
            return {
                "detected": False,
                "severity_score": 0,
                "matched_categories": [],
                "matched_indicators": [],
                "reasons": [],
            }

        matched_categories = []
        matched_indicators = []
        reasons = []
        total_weight = 0

        for rule in self._compiled_rules:
            category_matched = False
            for pattern in rule["compiled_patterns"]:
                match = pattern.search(content)
                if match:
                    category_matched = True
                    indicator = match.group(0).strip()
                    matched_indicators.append(
                        {
                            "category": rule["category"],
                            "severity": rule["severity"],
                            "matched_text": indicator,
                        }
                    )

            if category_matched:
                matched_categories.append(rule["category"])
                total_weight += rule["weight"]
                reasons.append(rule["reason"])

        # Cap severity score at 100
        severity_score = min(total_weight, 100)

        return {
            "detected": len(matched_categories) > 0,
            "severity_score": severity_score,
            "matched_categories": matched_categories,
            "matched_indicators": matched_indicators,
            "reasons": reasons,
        }
