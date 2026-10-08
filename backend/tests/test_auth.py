from datetime import timedelta
import pytest
from app.utils.security import create_access_token
from app.database.connection import SessionLocal
from app.models.user import User


def test_successful_registration(client):
    """Verifies that a citizen can register with valid credentials."""
    payload = {
        "email": "aarav.sharma@example.com",
        "password": "Password123!",
        "full_name": "Aarav Sharma",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "user" in data
    assert data["message"] == "User registered successfully."
    user = data["user"]
    assert user["email"] == "aarav.sharma@example.com"
    assert user["full_name"] == "Aarav Sharma"
    assert user["is_active"] is True
    assert "id" in user
    assert "created_at" in user
    # Critical security check: password must not be in response
    assert "password" not in user
    assert "password_hash" not in user


def test_duplicate_email_registration(client):
    """Verifies that duplicate email registrations are rejected with HTTP 409 Conflict."""
    payload = {
        "email": "duplicate.test@example.com",
        "password": "Password123!",
        "full_name": "First Registration",
    }
    first_resp = client.post("/api/v1/auth/register", json=payload)
    assert first_resp.status_code == 201

    # Attempt to register again with same email
    second_resp = client.post("/api/v1/auth/register", json=payload)
    assert second_resp.status_code == 409
    error_data = second_resp.json()
    assert error_data["success"] is False
    assert "already exists" in error_data["error"]["message"].lower()


def test_invalid_email_registration(client):
    """Verifies that malformed emails are rejected with HTTP 422."""
    invalid_emails = [
        "notanemail",
        "missingatsign.com",
        "@nodomain.com",
        "spaces in@email.com",
    ]
    for email in invalid_emails:
        payload = {
            "email": email,
            "password": "ValidPassword123!",
            "full_name": "Invalid Email User",
        }
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 422, f"Expected 422 for invalid email: {email}"


def test_password_length_validation(client):
    """Verifies that passwords under 8 characters are rejected with HTTP 422."""
    payload = {
        "email": "shortpw@example.com",
        "password": "short",  # Only 5 characters
        "full_name": "Short Password User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_successful_login(client):
    """Verifies that valid credentials return a JWT access token and user info."""
    reg_payload = {
        "email": "login.success@example.com",
        "password": "CorrectPassword123!",
        "full_name": "Login Tester",
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201

    login_payload = {
        "email": "login.success@example.com",
        "password": "CorrectPassword123!",
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200

    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["expires_in_minutes"] > 0
    assert "user" in token_data
    assert token_data["user"]["email"] == "login.success@example.com"
    assert "password_hash" not in token_data["user"]


def test_login_incorrect_password(client):
    """Verifies that wrong password returns HTTP 401 with generic error."""
    reg_payload = {
        "email": "wrongpw@example.com",
        "password": "CorrectPassword123!",
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "wrongpw@example.com",
        "password": "WrongPassword456!",
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 401
    error_data = login_resp.json()
    assert error_data["success"] is False
    assert "invalid email or password" in error_data["error"]["message"].lower()


def test_login_nonexistent_email(client):
    """Verifies that unknown email returns HTTP 401 with generic error (no user enumeration)."""
    login_payload = {
        "email": "nonexistent.citizen@example.com",
        "password": "AnyPassword123!",
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 401
    error_data = login_resp.json()
    assert error_data["success"] is False
    assert "invalid email or password" in error_data["error"]["message"].lower()


def test_current_user_valid_token(client):
    """Verifies GET /api/v1/auth/me succeeds with a valid JWT."""
    reg_payload = {
        "email": "me.valid@example.com",
        "password": "ValidTokenPass123!",
        "full_name": "Me Valid Citizen",
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "me.valid@example.com", "password": "ValidTokenPass123!"},
    )
    token = login_resp.json()["access_token"]

    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    user_data = me_resp.json()["user"]
    assert user_data["email"] == "me.valid@example.com"
    assert user_data["full_name"] == "Me Valid Citizen"
    assert user_data["is_active"] is True


def test_current_user_without_token(client):
    """Verifies GET /api/v1/auth/me returns 401 when no token is provided."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    error_data = response.json()
    assert error_data["success"] is False


def test_current_user_invalid_token(client):
    """Verifies GET /api/v1/auth/me returns 401 when an invalid/tampered token is provided."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer completely.fake.and.invalid.token"},
    )
    assert response.status_code == 401
    error_data = response.json()
    assert error_data["success"] is False


def test_current_user_expired_token(client):
    """Verifies GET /api/v1/auth/me returns 401 when an expired token is provided."""
    # Register user first to get an ID
    reg_payload = {
        "email": "expired.user@example.com",
        "password": "Password123!",
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_resp.json()["user"]["id"]

    # Generate token that expired 10 seconds ago
    expired_token = create_access_token(
        data={"sub": str(user_id), "email": "expired.user@example.com"},
        expires_delta=timedelta(seconds=-10),
    )

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
    error_data = response.json()
    assert error_data["success"] is False
    assert "expired" in error_data["error"]["message"].lower()


def test_inactive_user_blocked(client):
    """Verifies that deactivated users cannot log in or access /me."""
    reg_payload = {
        "email": "inactive.citizen@example.com",
        "password": "Password123!",
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_resp.json()["user"]["id"]

    # Create token while active
    token = client.post("/api/v1/auth/login", json=reg_payload).json()["access_token"]

    # Deactivate the user directly in database
    db = SessionLocal()
    try:
        user = db.get(User, user_id)
        user.is_active = False
        db.commit()
    finally:
        db.close()

    # Login should now fail with 403 Forbidden
    login_attempt = client.post("/api/v1/auth/login", json=reg_payload)
    assert login_attempt.status_code == 403

    # Accessing /me should now fail with 403 Forbidden
    me_attempt = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_attempt.status_code == 403


def test_logout_endpoint(client):
    """Verifies logout requires authentication and returns success message."""
    # Logout without token -> 401
    no_token_resp = client.post("/api/v1/auth/logout")
    assert no_token_resp.status_code == 401

    # Register and login
    payload = {
        "email": "logout.citizen@example.com",
        "password": "Password123!",
    }
    client.post("/api/v1/auth/register", json=payload)
    token = client.post("/api/v1/auth/login", json=payload).json()["access_token"]

    # Logout with token -> 200
    logout_resp = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_resp.status_code == 200
    assert logout_resp.json()["success"] is True
