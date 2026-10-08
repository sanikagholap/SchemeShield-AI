import ipaddress
import re
import socket
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlparse

from bs4 import BeautifulSoup
import httpx

from app.config import get_settings
from app.utils.exceptions import AppException
from app.utils.logger import logger

settings = get_settings()


class URLInspectionService:
    """
    Service providing secure URL validation, SSRF protection, safe content fetching,
    and HTML text extraction without external headless browsers or paid APIs.
    """

    ALLOWED_SCHEMES = {"http", "https"}
    BLOCKED_HOSTNAMES = {
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1",
        "broadcasthost",
        "local",
        "internal",
        "intranet",
    }

    def __init__(self):
        self.timeout = settings.URL_FETCH_TIMEOUT_SECONDS
        self.max_bytes = settings.MAX_URL_RESPONSE_BYTES
        self.max_text_len = settings.MAX_EXTRACTED_TEXT_LENGTH
        logger.info(
            f"Initialized URLInspectionService (timeout={self.timeout}s, max_bytes={self.max_bytes})"
        )

    def validate_url_syntax(self, url: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates URL format, scheme, and presence of a valid hostname.
        Returns: (is_valid, hostname, error_message)
        """
        if not url or not url.strip():
            return False, None, "URL cannot be empty."

        cleaned_url = url.strip()
        try:
            parsed = urlparse(cleaned_url)
        except Exception as exc:
            return False, None, f"Malformed URL format: {str(exc)}"

        if not parsed.scheme or parsed.scheme.lower() not in self.ALLOWED_SCHEMES:
            return (
                False,
                None,
                f"Invalid or prohibited URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted.",
            )

        hostname = parsed.hostname
        if not hostname or not hostname.strip():
            return False, None, "URL must include a valid host or domain name."

        return True, hostname.lower(), None

    def is_ssrf_safe_host(self, hostname: str) -> Tuple[bool, Optional[str]]:
        """
        Guards against Server-Side Request Forgery (SSRF) by inspecting hostnames
        and resolving IP addresses against private, loopback, and reserved ranges.
        """
        host_lower = hostname.lower().strip()

        # Reject known literal loopback/internal hosts
        if host_lower in self.BLOCKED_HOSTNAMES or host_lower.endswith(".local") or host_lower.endswith(".internal"):
            return False, f"Access to internal or local hostname '{hostname}' is strictly prohibited."

        # Attempt to resolve IP address
        try:
            addr_info = socket.getaddrinfo(host_lower, None)
        except socket.gaierror as exc:
            logger.debug(f"DNS resolution failed for '{host_lower}': {exc}")
            return False, f"Could not resolve host '{hostname}' via DNS."
        except Exception as exc:
            logger.warning(f"Unexpected error resolving host '{host_lower}': {exc}")
            return False, f"Hostname resolution error: {str(exc)}"

        # Check all resolved IP addresses
        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            try:
                ip_obj = ipaddress.ip_address(ip_str)
                if (
                    ip_obj.is_loopback
                    or ip_obj.is_private
                    or ip_obj.is_link_local
                    or ip_obj.is_multicast
                    or ip_obj.is_reserved
                    or ip_obj.is_unspecified
                ):
                    logger.warning(f"SSRF guard blocked host '{host_lower}' resolving to restricted IP {ip_str}")
                    return (
                        False,
                        f"Host '{hostname}' resolves to a restricted/private network address ({ip_str}).",
                    )
            except ValueError:
                continue

        return True, None

    def fetch_and_extract_page(self, url: str) -> Dict[str, Any]:
        """
        Safely fetches web page content and extracts readable text.
        Guards against SSRF, limits response size, and strips HTML boilerplate.
        """
        is_valid, hostname, syntax_err = self.validate_url_syntax(url)
        if not is_valid:
            raise AppException(syntax_err, status_code=400)

        is_safe, ssrf_err = self.is_ssrf_safe_host(hostname)
        if not is_safe:
            logger.warning(f"SSRF check rejected URL '{url}': {ssrf_err}")
            return {
                "url": url,
                "hostname": hostname,
                "is_safe": False,
                "page_fetched": False,
                "content_extracted": False,
                "extracted_text": "",
                "page_title": None,
                "warning": ssrf_err,
            }

        headers = {
            "User-Agent": "SchemeShield-Verification-Bot/1.0 (+https://github.com/sanikagholap/SchemeShield-AI)",
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        }

        try:
            with httpx.Client(
                timeout=self.timeout,
                follow_redirects=True,
                headers=headers,
            ) as client:
                response = client.get(url)

                if response.status_code >= 400:
                    return {
                        "url": url,
                        "hostname": hostname,
                        "is_safe": True,
                        "page_fetched": False,
                        "content_extracted": False,
                        "extracted_text": "",
                        "page_title": None,
                        "warning": f"Web server responded with HTTP error status {response.status_code}.",
                    }

                # Enforce response content size cap
                content_bytes = response.content[: self.max_bytes]
                html_text = content_bytes.decode(response.encoding or "utf-8", errors="replace")

                # Parse and clean HTML content
                title, clean_text = self._parse_html_text(html_text)

                return {
                    "url": url,
                    "hostname": hostname,
                    "is_safe": True,
                    "page_fetched": True,
                    "content_extracted": bool(clean_text),
                    "extracted_text": clean_text,
                    "page_title": title,
                    "warning": None,
                }

        except httpx.TimeoutException:
            logger.info(f"Timeout while fetching URL '{url}'")
            return {
                "url": url,
                "hostname": hostname,
                "is_safe": True,
                "page_fetched": False,
                "content_extracted": False,
                "extracted_text": "",
                "page_title": None,
                "warning": "Connection timed out while fetching webpage content.",
            }
        except httpx.RequestError as exc:
            logger.info(f"Network error requesting URL '{url}': {exc}")
            return {
                "url": url,
                "hostname": hostname,
                "is_safe": True,
                "page_fetched": False,
                "content_extracted": False,
                "extracted_text": "",
                "page_title": None,
                "warning": f"Unable to reach web server: {str(exc)}",
            }
        except Exception as exc:
            logger.error(f"Unexpected error inspecting URL '{url}': {exc}")
            return {
                "url": url,
                "hostname": hostname,
                "is_safe": True,
                "page_fetched": False,
                "content_extracted": False,
                "extracted_text": "",
                "page_title": None,
                "warning": "Unexpected error during webpage content processing.",
            }

    def _parse_html_text(self, html_content: str) -> Tuple[Optional[str], str]:
        """
        Strips scripts, styling, navigation, and boilerplate from HTML.
        Returns (page_title, clean_readable_text).
        """
        if not html_content or not html_content.strip():
            return None, ""

        try:
            soup = BeautifulSoup(html_content, "html.parser")

            # Extract title if available
            title = soup.title.string.strip() if (soup.title and soup.title.string) else None

            # Remove clutter tags
            for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header", "aside", "iframe"]):
                tag.decompose()

            # Extract clean text
            raw_text = soup.get_text(separator=" ", strip=True)
            clean_text = re.sub(r"\s+", " ", raw_text).strip()

            # Bound text length
            if len(clean_text) > self.max_text_len:
                clean_text = clean_text[: self.max_text_len] + "..."

            return title, clean_text
        except Exception as exc:
            logger.debug(f"Error parsing HTML text: {exc}")
            # Fallback simple tag stripping
            clean = re.sub(r"<[^>]+>", " ", html_content)
            clean = re.sub(r"\s+", " ", clean).strip()
            return None, clean[: self.max_text_len]


url_inspection_service = URLInspectionService()
