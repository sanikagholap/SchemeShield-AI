from typing import Any, Dict, List, Optional
from urllib.parse import urlparse
import re

from app.config import get_settings
from app.utils.logger import logger

settings = get_settings()


class OfficialSourceVerificationService:
    """
    Service responsible for cross-referencing schemes and domains against
    trusted government databases, official .gov.in / .nic.in domain registries,
    and configurable authorized portal lists.
    """

    def __init__(self, trusted_domains: Optional[List[str]] = None):
        self.trusted_domains: List[str] = (
            [d.lower() for d in trusted_domains]
            if trusted_domains is not None
            else [d.lower() for d in settings.TRUSTED_GOVERNMENT_DOMAINS]
        )
        logger.info(f"Initialized OfficialSourceVerificationService with {len(self.trusted_domains)} trusted domains.")

    def extract_domain(self, domain_or_url: str) -> str:
        """
        Extracts clean lowercase hostname from a URL or raw domain string.
        """
        if not domain_or_url:
            return ""

        input_str = domain_or_url.strip()
        if not re.match(r"^[a-zA-Z]+://", input_str):
            input_str = f"https://{input_str}"

        parsed = urlparse(input_str)
        host = parsed.netloc or parsed.path
        # Strip port numbers and leading 'www.'
        host = host.split(":")[0].lower()
        if host.startswith("www."):
            host = host[4:]
        return host

    def is_trusted_domain(self, domain_or_url: str) -> bool:
        """
        Evaluates whether a domain matches a configured trusted source or official government TLD.
        Note: Verification indicates domain authority match, not individual page validity.
        """
        domain = self.extract_domain(domain_or_url)
        if not domain:
            return False

        # Direct match in configured trusted domains
        for trusted in self.trusted_domains:
            if domain == trusted or domain.endswith(f".{trusted}"):
                return True

        # Official Indian Government TLD match (.gov.in or .nic.in)
        if domain.endswith(".gov.in") or domain.endswith(".nic.in"):
            return True

        return False

    def evaluate_domain_trust(self, domain_or_url: str) -> Dict[str, Any]:
        """
        Returns structured trust analysis for a given URL or domain without external network requests.
        """
        domain = self.extract_domain(domain_or_url)
        is_trusted = self.is_trusted_domain(domain_or_url)
        is_official_tld = domain.endswith(".gov.in") or domain.endswith(".nic.in")

        return {
            "input": domain_or_url,
            "extracted_domain": domain,
            "is_trusted": is_trusted,
            "is_official_tld": is_official_tld,
            "source_category": "official_government" if is_trusted else "unverified_third_party",
        }
