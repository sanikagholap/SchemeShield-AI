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

## 🏛️ Scheme Management API Specification (`/api/v1/schemes`)

SchemeShield AI maintains reference records of verified and cataloged government welfare schemes for comparison, duplicate detection, and citizen awareness.

### 1. List & Search Schemes (Public)
- **Endpoint:** `GET /api/v1/schemes`
- **Authentication:** Optional (Public)
- **Query Parameters:**
  - `search` *(string, optional)*: Keyword search across scheme title and description.
  - `category` *(string, optional)*: Filter by category (e.g. `Agriculture`, `Education`, `Housing`).
  - `state` *(string, optional)*: Filter by state (e.g. `Central`, `Maharashtra`, `Punjab`).
  - `department` *(string, optional)*: Filter by governing ministry or department.
  - `page` *(int, default: 1)*: Page number (1-indexed).
  - `page_size` *(int, default: 20)*: Number of items per page.

**Example Response (`200 OK`):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "PM Kisan Samman Nidhi",
      "description": "Direct income support of Rs 6,000 per year for farmer families.",
      "department": "Ministry of Agriculture & Farmers Welfare",
      "category": "Agriculture",
      "eligibility": "Small and marginal landholding farmer families.",
      "benefits": "Rs 6,000 annually in three equal installments.",
      "application_process": "Online via pmkisan.gov.in portal.",
      "official_url": "https://pmkisan.gov.in",
      "source_name": "myScheme Portal",
      "source_domain": "pmkisan.gov.in",
      "state": "Central",
      "launch_year": 2019,
      "is_active": true,
      "created_at": "2026-10-08T11:30:00Z",
      "updated_at": "2026-10-08T11:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### 2. Get Single Scheme (Public)
- **Endpoint:** `GET /api/v1/schemes/{scheme_id}`
- **Authentication:** Optional (Public)
- **Status:** `200 OK` (or `404 Not Found`)

### 3. Create Scheme (Protected)
- **Endpoint:** `POST /api/v1/schemes`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Status:** `201 Created`
- **Request Body:** Requires `name` (unique). Accepts all optional descriptive fields.

### 4. Update Scheme (Protected)
- **Endpoint:** `PATCH /api/v1/schemes/{scheme_id}`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Status:** `200 OK`
- **Request Body:** All fields optional.

### 5. Delete Scheme (Protected)
- **Endpoint:** `DELETE /api/v1/schemes/{scheme_id}`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Status:** `200 OK`

---

## 🔍 Scheme Verification API Specification (`/api/v1/verify`)

Citizens can submit suspicious schemes, social media messages, or flyers for multi-factor verification.

### 1. Submit Verification Request
- **Endpoint:** `POST /api/v1/verify`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Status Code:** `201 Created`

**Request Body:**
```json
{
  "scheme_name": "Pradhan Mantri Free Smartphone Scheme",
  "description": "WhatsApp forward claiming government delivers free smartphones after Rs 299 payment.",
  "submitted_url": "https://pm-freemobile-registration.xyz",
  "input_type": "url"
}
```

**Success Response (`201 Created`):**
```json
{
  "id": 1,
  "user_id": 1,
  "input_type": "url",
  "scheme_name": "Pradhan Mantri Free Smartphone Scheme",
  "description": "WhatsApp forward claiming government delivers free smartphones after Rs 299 payment.",
  "submitted_url": "https://pm-freemobile-registration.xyz",
  "extracted_text": null,
  "status": "pending",
  "risk_score": null,
  "confidence_score": null,
  "result_label": null,
  "explanation": "Verification request registered. Awaiting analysis by verification engine.",
  "created_at": "2026-10-08T11:40:00Z",
  "updated_at": "2026-10-08T11:40:00Z"
}
```
*Note: Status starts as `pending`. No fake AI scores are fabricated.*

### 2. Get Single Verification Request
- **Endpoint:** `GET /api/v1/verify/{verification_id}`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Security:** Strict data isolation enforced. Users can only access their own verification records (`403 Forbidden` if accessed by another user).

### 3. Get Verification Audit History
- **Endpoint:** `GET /api/v1/verify/history`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Query Parameters:**
  - `page` *(int, default: 1)*
  - `page_size` *(int, default: 20)*
- **Response:** Paginated list of user's own verification requests sorted newest first.

---


## 🧪 Running Automated Tests

Run the complete test suite with `pytest`:

```bash
# Windows (PowerShell)
$env:PYTHONPATH="backend"; pytest backend/tests -v

# Linux / macOS
PYTHONPATH=backend pytest backend/tests -v
```

### Test Coverage (36 Automated Tests):
- ✅ **Authentication Suite (`test_auth.py` - 13 Tests):**
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
- ✅ **Scheme Management Suite (`test_schemes.py` - 9 Tests):**
  14. `test_scheme_listing_public` — Public retrieval of schemes.
  15. `test_create_scheme_authenticated` — Scheme creation with auth token.
  16. `test_create_scheme_unauthenticated` — 401 Unauthorized check.
  17. `test_create_duplicate_scheme_name` — 409 Conflict check.
  18. `test_get_scheme_by_id` — Retrieval of single scheme by ID.
  19. `test_get_scheme_not_found` — 404 Not Found check.
  20. `test_update_scheme` — Field updates via PATCH.
  21. `test_delete_scheme` — Safe scheme deletion.
  22. `test_scheme_filtering_and_search` — Filters for search, category, state, and department.
- ✅ **Scheme Verification Suite (`test_verify.py` - 9 Tests):**
  23. `test_submit_verification_request_authenticated` — Submitting verification request with 'pending' status.
  24. `test_submit_verification_unauthenticated` — 401 Unauthorized check.
  25. `test_submit_verification_invalid_input` — 422 input validation check.
  26. `test_get_verification_by_id` — Citizen retrieving own verification record.
  27. `test_get_verification_not_found` — 404 Not Found check.
  28. `test_user_cannot_access_another_users_verification` — 403 Forbidden cross-user data isolation.
  29. `test_get_verification_history` — Paginated user verification history (newest first).
  30. `test_verification_history_unauthenticated` — 401 Unauthorized check.
  31. `test_official_source_domain_evaluation` — Official domain trust analysis (.gov.in, .nic.in, myscheme.gov.in).
- ✅ **Health Suite (`test_health.py` - 1 Test):**
  32. `test_health_check_endpoint` — Validates GET /api/health and SQLite connectivity.
- ✅ **Database Suite (`test_database.py` - 3 Tests):**
  33. `test_database_connection_live` — Verifies engine connectivity.
  34. `test_database_tables_initialized` — Verifies all 9 database tables are created.
  35. `test_database_session_dependency` — Verifies get_db session lifecycle.
- ✅ **Startup Suite (`test_startup.py` - 1 Test):**
  36. `test_application_startup` — Verifies FastAPI startup, Swagger `/docs`, and route mounting.

---

## 🎯 Current Backend Scope & Roadmap

### Completed in Milestones 1, 2, & 3:
- [x] Production-grade modular backend architecture.
- [x] Zero-cost SQLite database integration with SQLAlchemy 2.0 ORM.
- [x] User model with `password_hash` column and unique email constraint.
- [x] Full JWT Authentication system (`register`, `login`, `me`, `logout`).
- [x] **Government Scheme Storage & Management (`/api/v1/schemes`):**
  - [x] Full CRUD operations with authentication on modifications.
  - [x] Multi-parameter filtering (keyword search, category, state, department, is_active).
  - [x] Standardized pagination metadata.
- [x] **Scheme Verification Requests (`/api/v1/verify`):**
  - [x] Submission pipeline with 'pending' status initialization.
  - [x] Strict user data isolation (`403 Forbidden` on foreign records).
  - [x] Chronological user verification history (newest first).
  - [x] Configurable trusted government domains verification (`myscheme.gov.in`, `.gov.in`, `.nic.in`).
- [x] Clean service stubs ready for local NLP/ML pipelines in Prompt 4.
- [x] 36 comprehensive automated tests passing with 100% success rate.

### Future Backend Milestones (Prompt 4+):
- **NLP Analysis Engine:** Local open-source entity extraction, linguistic urgency detection.
- **Duplicate Detection Engine:** Local TF-IDF/embedding similarity search against verified scheme repository.
- **Suspicious Content Detection:** Heuristic rule engines scanning for scam indicators (registration fees, fake domains).
- **OCR Pipeline:** Integration with open-source OCR (Tesseract / pytesseract) for flyer processing.
- **Risk Scoring Algorithm:** Weighted synthesis of all pipeline signals into a 0.0–1.0 risk index.

