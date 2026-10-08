import hashlib
import hmac
import os
import secrets
from typing import Tuple


def hash_password(password: str, salt: str = None) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a secure random salt.
    Format returned: salt$hex_hash
    """
    if salt is None:
        salt = secrets.token_hex(16)
    
    hash_bytes = hashlib.pbkdf2_hmac(
        hash_name="sha256",
        password=password.encode("utf-8"),
        salt=salt.encode("utf-8"),
        iterations=100_000,
    )
    return f"{salt}${hash_bytes.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """
    Verifies a plain password against the stored salt$hex_hash format.
    Uses constant-time comparison to prevent timing attacks.
    """
    try:
        salt, expected_hash = stored_hash.split("$", 1)
        test_hash = hash_password(plain_password, salt=salt).split("$", 1)[1]
        return hmac.compare_digest(expected_hash, test_hash)
    except Exception:
        return False


def generate_secure_token(nbytes: int = 32) -> str:
    """Generates a cryptographically secure random token string."""
    return secrets.token_urlsafe(nbytes)
