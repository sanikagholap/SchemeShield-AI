from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.schemas.auth import UserRegisterRequest, UserLoginRequest
from app.utils.exceptions import ConflictException, UnauthorizedException, ForbiddenException
from app.utils.security import hash_password, verify_password
from app.utils.logger import logger


class AuthService:
    """
    Service layer handling business logic for citizen registration,
    credential verification, and user management.
    """

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Queries a user by normalized email address."""
        stmt = select(User).where(User.email == email.lower().strip())
        return db.scalars(stmt).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Queries a user by their primary key ID."""
        return db.get(User, user_id)

    @staticmethod
    def register_user(db: Session, payload: UserRegisterRequest) -> User:
        """
        Registers a new citizen account with a securely hashed password.
        Raises ConflictException if the email is already in use.
        """
        normalized_email = payload.email.lower().strip()

        # Check for existing account
        existing_user = AuthService.get_user_by_email(db, normalized_email)
        if existing_user:
            logger.warning(f"Registration conflict: account with email {normalized_email} already exists.")
            raise ConflictException("An account with this email address already exists.")

        # Hash password securely using bcrypt
        password_hash = hash_password(payload.password)

        clean_full_name = payload.full_name.strip() if payload.full_name else None

        new_user = User(
            email=normalized_email,
            password_hash=password_hash,
            full_name=clean_full_name,
            is_active=True,
            is_admin=False,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"Successfully registered new user: id={new_user.id}, email={new_user.email}")
        return new_user

    @staticmethod
    def authenticate_user(db: Session, payload: UserLoginRequest) -> User:
        """
        Authenticates citizen credentials.
        Returns the User if valid, otherwise raises UnauthorizedException or ForbiddenException.
        Uses a constant failure response to prevent email enumeration attacks.
        """
        normalized_email = payload.email.lower().strip()
        user = AuthService.get_user_by_email(db, normalized_email)

        # Constant error for both unknown email and wrong password
        invalid_credentials_msg = "Invalid email or password."

        if not user:
            logger.info(f"Failed login attempt: non-existent email '{normalized_email}'")
            raise UnauthorizedException(invalid_credentials_msg)

        if not verify_password(payload.password, user.password_hash):
            logger.info(f"Failed login attempt: incorrect password for user id={user.id}")
            raise UnauthorizedException(invalid_credentials_msg)

        if not user.is_active:
            logger.warning(f"Login denied: inactive user id={user.id}")
            raise ForbiddenException("Account is currently deactivated. Please contact support.")

        logger.info(f"Successful authentication for user id={user.id}, email={user.email}")
        return user
