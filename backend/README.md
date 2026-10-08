# SchemeShield AI — Backend

> **Tagline:** *"Verify Before You Trust."*

Backend REST API and AI verification architecture for **SchemeShield AI**, an open platform designed to empower citizens to detect and prevent fraudulent, duplicate, suspicious, or maliciously modified government welfare schemes.

---

## 📌 Project Architecture & Branching Model

This repository is organized into **two independent development branches**:

| Branch | Domain | Scope & Status |
| :--- | :--- | :--- |
| **`frontend`** | User Interface | Developed independently on the `frontend` branch by the frontend teammate (React/SPA). |
| **`backend`** *(Current)* | REST API & Core Services | FastAPI, SQLite, SQLAlchemy models, Pydantic validation, JWT authentication, and modular AI pipeline interfaces. |

> [!IMPORTANT]
> **Branch Rule**: This branch strictly contains **backend code only**. No UI, HTML, CSS, or React components are included. The frontend teammate connects directly to this service via versioned REST APIs (`/api/v1/*`).

---

## 🛠️ Technology Stack (₹0 Cost Stack)

- **Language:** Python 3.10+ (tested on Python 3.14)
- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/) (high performance, asynchronous REST API)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/) (standard production-ready worker)
- **Database:** [SQLite](https://sqlite.org/) via [SQLAlchemy 2.0](https://www.sqlalchemy.org/) ORM (zero-cost, embedded, zero configuration)
- **Validation & Settings:** [Pydantic v2](https://docs.pydantic.dev/) and `pydantic-settings`
- **Security & Auth:** [bcrypt](https://pypi.org/project/bcrypt/) (salted password hashing) & [PyJWT](https://pyjwt.readthedocs.io/) (cryptographically signed HMAC-SHA256 JWT tokens)
- **Testing:** [pytest](https://pytest.org/) and `fastapi.testclient`
- **No Paid APIs:** Designed from the ground up to operate with zero reliance on paid external APIs (no OpenAI, Gemini, Firebase, Supabase, or third-party paid services required).

---

## 📂 Project Structure

```text
backend/
│
├── app/
│   ├── __init__.py               # Package descriptor
│   ├── main.py                   # FastAPI application factory, lifespan & CORS
│   ├── config.py                 # Pydantic BaseSettings & env configuration
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── base.py               # DeclarativeBase & TimestampMixin
│   │   └── connection.py         # SQLite engine, SessionLocal & get_db dependency
│   │
│   ├── dependencies/             # Reusable API Dependencies
│   │   ├── __init__.py
│   │   └── auth.py               # get_current_user JWT token extraction & verification
│   │
│   ├── models/                   # SQLAlchemy Declarative Models
│   │   ├── __init__.py           # Model aggregator for metadata auto-registration
│   │   ├── user.py               # User model with security (password_hash) & relationships
│   │   ├── scheme.py             # GovernmentScheme and SavedScheme models
│   │   ├── verification.py       # Verification, VerificationEvidence, VerificationHistory
│   │   └── conversation.py       # AIConversation model for assistant history
│   │
│   ├── schemas/                  # Pydantic Data Validation & Serialization
│   │   ├── __init__.py
│   │   ├── common.py             # APIResponse envelope, ErrorResponse, HealthResponse
│   │   ├── auth.py               # Registration, Login, Token, User schemas
│   │   ├── verification.py       # Verification request, evidence & report schemas
│   │   ├── scheme.py             # Official scheme details & listing schemas
│   │   ├── history.py            # User verification history schemas
│   │   └── assistant.py          # Conversational assistant request/response schemas
│   │
│   ├── routes/                   # Modular REST API Controllers
│   │   ├── __init__.py
│   │   ├── health.py             # GET /api/health endpoint
│   │   ├── api_v1.py             # Aggregates all /api/v1 versioned endpoints
│   │   ├── auth.py               # /api/v1/auth routes (register, login, me, logout)
│   │   ├── verification.py       # /api/v1/verification routes
│   │   ├── schemes.py            # /api/v1/schemes routes
│   │   ├── history.py            # /api/v1/history routes
│   │   └── assistant.py          # /api/v1/assistant routes
│   │
│   ├── services/                 # Business Logic & Service Pipelines
│   │   ├── __init__.py
│   │   ├── auth_service.py       # User registration, bcrypt check & lookup
│   │   ├── nlp_service.py        # Natural Language Processing & linguistic analysis
│   │   ├── duplicate_detection_service.py # Cosine / semantic scheme duplicate detector
│   │   ├── suspicious_detector_service.py # Fraud heuristic & scam red-flag scanner
│   │   ├── ocr_service.py        # Open-source document/image OCR text extractor
│   │   ├── official_source_service.py     # .gov.in domain & registry validation
│   │   └── risk_scoring_service.py        # Multi-factor risk & confidence scoring
│   │
│   └── utils/                    # Centralized Utilities
│       ├── __init__.py
│       ├── logger.py             # Standardized application logging
│       ├── exceptions.py         # Custom exceptions & sanitized error handlers
│       ├── security.py           # bcrypt password hashing & PyJWT token utilities
│       └── file_handler.py       # Safe upload validation & path handling
│
├── tests/                        # Automated Test Suite
│   ├── __init__.py
│   ├── conftest.py               # Test client fixture & isolated test DB
│   ├── test_auth.py              # Full authentication test suite (13 test cases)
│   ├── test_health.py            # Health endpoint verification
│   ├── test_startup.py           # App boot & OpenAPI / Swagger verification
│   └── test_database.py          # Schema creation & connectivity verification
│
├── uploads/                      # Upload directory for scheme documents/images
│   └── .gitkeep
│
├── .env.example                  # Environment configuration template
├── .gitignore                    # Backend git ignore rules
├── requirements.txt              # Production and testing dependencies
└── README.md                     # Backend documentation
```

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
- Python 3.10+ installed
- Git

### 2. Create and Activate Virtual Environment

From the project root:

```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables

Copy the example file to `.env`:

```bash
# From repository root
cp backend/.env.example .env
```

Key environment settings:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `"SchemeShield AI"` | Name of the project |
| `PROJECT_TAGLINE` | `"Verify Before You Trust."` | Official project slogan |
| `ENVIRONMENT` | `"development"` | Active runtime environment |
| `DATABASE_URL` | `"sqlite:///./schemeshield.db"` | Zero-cost SQLite database file |
| `SECRET_KEY` | *(Development string)* | General application secret key |
| `JWT_SECRET_KEY` | *(Development string)* | HMAC secret key used to sign JWTs |
| `JWT_ALGORITHM` | `"HS256"` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT token validity (24 hours) |
| `CORS_ORIGINS` | `["http://localhost:3000", ...]` | Allowed frontend development origins |
| `UPLOAD_DIR` | `"uploads"` | Directory for uploaded files |
| `MAX_UPLOAD_SIZE_MB`| `10` | Maximum file upload size in MB |

---

## 🚀 Running the FastAPI Application

Start the local development server using Uvicorn:

```bash
# From the repository root with PYTHONPATH set:
# Windows (PowerShell)
$env:PYTHONPATH="backend"; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Linux / macOS
PYTHONPATH=backend uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Alternatively, from inside the `backend` directory:

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, the server will be live at:
- **Base URL:** `http://127.0.0.1:8000`
- **Health Check:** `http://127.0.0.1:8000/api/health`
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`

---

## 🔐 Authentication API Specification (For Frontend Teammate)

The authentication system is completely decoupled and ready for the frontend teammate to connect with login, signup, and profile pages.

### Architectural Decision: Registration vs Login Flow
- **Registration returns HTTP 201 Created with the safe user object** (excluding tokens and passwords).
- **Users then log in via `/api/v1/auth/login` to obtain an access token.**
- *Rationale:* This standard separation of concerns prevents session pollution during account creation, aligns with clean OAuth2 / REST principles, and makes account verification flows trivial to attach in the future.

---

### 1. Register Citizen Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Status Code:** `201 Created`

**Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "SecurePassword123!",
  "full_name": "Aarav Sharma"
}
```
*Validation:*
- `email`: Required, valid email format.
- `password`: Required, minimum 8 characters, maximum 128 characters.
- `full_name`: Optional string.

**Success Response (`201 Created`):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 1,
    "email": "citizen@example.com",
    "full_name": "Aarav Sharma",
    "is_active": true,
    "is_admin": false,
    "created_at": "2026-10-08T11:00:00Z"
  }
}
```

**Conflict Error (`409 Conflict`):**
```json
{
  "success": false,
  "error": {
    "message": "An account with this email address already exists.",
    "status_code": 409,
    "details": {}
  }
}
```

---

### 2. Login & Obtain JWT Token
- **Endpoint:** `POST /api/v1/auth/login`
- **Status Code:** `200 OK`

**Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (`200 OK`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in_minutes": 1440,
  "user": {
    "id": 1,
    "email": "citizen@example.com",
    "full_name": "Aarav Sharma",
    "is_active": true,
    "is_admin": false,
    "created_at": "2026-10-08T11:00:00Z"
  }
}
```

**Authentication Error (`401 Unauthorized`):**
*(Note: Returns identical message for unknown email or wrong password to prevent user enumeration attacks)*
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password.",
    "status_code": 401,
    "details": {}
  }
}
```

---

### 3. Get Current Authenticated Citizen Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Status Code:** `200 OK`
- **Headers Required:**
  ```http
  Authorization: Bearer <access_token>
  ```

**Success Response (`200 OK`):**
```json
{
  "user": {
    "id": 1,
    "email": "citizen@example.com",
    "full_name": "Aarav Sharma",
    "is_active": true,
    "is_admin": false,
    "created_at": "2026-10-08T11:00:00Z"
  }
}
```

**Missing or Invalid Token Error (`401 Unauthorized`):**
```json
{
  "success": false,
  "error": {
    "message": "Authentication token is missing. Please provide a Bearer token.",
    "status_code": 401,
    "details": {}
  }
}
```

---

### 4. Logout Session
- **Endpoint:** `POST /api/v1/auth/logout`
- **Status Code:** `200 OK`
- **Headers Required:**
  ```http
  Authorization: Bearer <access_token>
  ```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "User session closed successfully."
}
```

---

## 🧪 Running Automated Tests

Run the complete test suite with `pytest`:

```bash
# Windows (PowerShell)
$env:PYTHONPATH="backend"; pytest backend/tests -v

# Linux / macOS
PYTHONPATH=backend pytest backend/tests -v
```

### Test Coverage (18 Automated Tests):
- ✅ **Authentication Suite (`test_auth.py`):**
  1. `test_successful_registration` — Valid citizen registration and safe response fields.
  2. `test_duplicate_email_registration` — Rejection of duplicate email with 409 Conflict.
  3. `test_invalid_email_registration` — Rejection of invalid email patterns with 422.
  4. `test_password_length_validation` — Rejection of passwords < 8 characters with 422.
  5. `test_successful_login` — Credential validation and JWT Bearer token generation.
  6. `test_login_incorrect_password` — Generic 401 response on wrong password.
  7. `test_login_nonexistent_email` — Generic 401 response on unknown email (prevents enumeration).
  8. `test_current_user_valid_token` — Retrieval of user profile using valid JWT.
  9. `test_current_user_without_token` — 401 response when token header is omitted.
  10. `test_current_user_invalid_token` — 401 response on forged or malformed token.
  11. `test_current_user_expired_token` — 401 response when token expiration is exceeded.
  12. `test_inactive_user_blocked` — 403 Forbidden for deactivated accounts.
  13. `test_logout_endpoint` — Validates authenticated session termination.
- ✅ **Health Suite (`test_health.py`):**
  14. `test_health_check_endpoint` — Validates GET /api/health and SQLite connectivity.
- ✅ **Database Suite (`test_database.py`):**
  15. `test_database_connection_live` — Verifies engine connectivity.
  16. `test_database_tables_initialized` — Verifies all 7 database tables are created.
  17. `test_database_session_dependency` — Verifies get_db session lifecycle.
- ✅ **Startup Suite (`test_startup.py`):**
  18. `test_application_startup` — Verifies FastAPI startup, Swagger `/docs`, and route mounting.

---

## 🎯 Current Backend Scope & Roadmap

### Completed in Milestones 1 & 2:
- [x] Production-grade modular backend architecture.
- [x] Zero-cost SQLite database integration with SQLAlchemy 2.0 ORM.
- [x] User model with `password_hash` column and unique email constraint.
- [x] Relational models for Schemes, Verifications, Evidence, History, and Conversations.
- [x] **Secure authentication system:**
  - [x] Citizen registration (`POST /api/v1/auth/register`)
  - [x] Citizen login (`POST /api/v1/auth/login`)
  - [x] Protected profile endpoint (`GET /api/v1/auth/me`)
  - [x] Logout endpoint (`POST /api/v1/auth/logout`)
  - [x] `bcrypt` password hashing & verification
  - [x] Cryptographically signed JWT access tokens (`PyJWT`)
  - [x] Centralized error handling and constant-time credentials verification
- [x] Pluggable services architecture for future AI modules.
- [x] 18 unit and integration tests passing.

### Future Backend Milestones:
- **NLP Analysis Engine:** Local open-source entity extraction, linguistic urgency detection.
- **Duplicate Detection Engine:** Local TF-IDF/embedding similarity search against verified scheme repository.
- **Suspicious Content Detection:** Heuristic rule engines scanning for scam indicators (registration fees, fake domains).
- **OCR Pipeline:** Integration with open-source OCR (Tesseract / pytesseract) for flyer processing.
- **Official Source Verification:** Domain validation (`.gov.in`, `.nic.in`) and official gazette cross-checks.
- **Risk Scoring Algorithm:** Weighted synthesis of all pipeline signals into a 0.0–1.0 risk index.
