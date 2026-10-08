from typing import Optional
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.utils.exceptions import UnauthorizedException, ForbiddenException
from app.utils.security import decode_access_token
from app.utils.logger import logger

# HTTPBearer security scheme extracts "Bearer <token>" from Authorization header
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency validating the JWT access token and resolving the current User.
    Raises:
    - 401 Unauthorized if token is missing, expired, or invalid.
    - 403 Forbidden if the authenticated user account is deactivated.
    """
    if credentials is None:
        raise UnauthorizedException("Authentication token is missing. Please provide a Bearer token.")

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        logger.warning("Token verification failed: token signature has expired.")
        raise UnauthorizedException("Authentication token has expired. Please log in again.")
    except jwt.InvalidTokenError as exc:
        logger.warning(f"Token verification failed: invalid token ({str(exc)})")
        raise UnauthorizedException("Could not validate credentials: invalid or malformed token.")

    # Extract subject (user ID)
    subject = payload.get("sub")
    if subject is None:
        raise UnauthorizedException("Could not validate credentials: token missing subject claim.")

    try:
        user_id = int(subject)
    except (ValueError, TypeError):
        raise UnauthorizedException("Could not validate credentials: malformed user identifier.")

    user = AuthService.get_user_by_id(db, user_id)
    if user is None:
        logger.warning(f"Token validation failed: user id={user_id} does not exist.")
        raise UnauthorizedException("User associated with this token does not exist.")

    if not user.is_active:
        logger.warning(f"Inactive user blocked from protected endpoint: user id={user.id}")
        raise ForbiddenException("Account is currently deactivated.")

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency ensuring the authenticated user is currently active.
    """
    if not current_user.is_active:
        raise ForbiddenException("Account is deactivated.")
    return current_user
