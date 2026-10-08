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
  "status": "completed",
  "risk_score": 75.0,
  "confidence_score": 65.0,
  "result_label": "potentially_fake",
  "explanation": "Critical scam indicators detected. The announcement exhibits patterns commonly associated with fraudulent campaigns...",
  "evidence": {
    "signals": [
      { "type": "official_source", "status": "non_trusted_domain" },
      { "type": "suspicious_language", "status": "detected" }
    ]
  },
  "created_at": "2026-10-08T11:40:00Z",
  "updated_at": "2026-10-08T11:40:00Z"
}
```

### 2. Verify Uploaded Document / Image (`POST /api/v1/verify/document`)
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `file` *(UploadFile, required)*: PDF, PNG, JPG/JPEG, WEBP, or TXT document (max 10 MB).
  - `scheme_name` *(string, optional)*: Claimed title if known.
- **Response:** [`DocumentVerificationResponse`](file:///c:/Users/sanik/SchemeShield-AI/backend/app/schemas/verification.py) with `ocr_metadata` detailing method (`plain_text`, `pdf_text`, or `ocr`), page count, character count, and full verification metrics.

### 3. Verify Scheme Announcement URL (`POST /api/v1/verify/url`)
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Request Body:**
  ```json
  {
    "url": "https://myscheme.gov.in/schemes/pmayg",
    "scheme_name": "Pradhan Mantri Awas Yojana"
  }
  ```
- **Response:** [`URLVerificationResponse`](file:///c:/Users/sanik/SchemeShield-AI/backend/app/schemas/verification.py) with SSRF validation, webpage text extraction, domain trust signal, and explainable verdict.

### 4. Get Single Verification Request
- **Endpoint:** `GET /api/v1/verify/{verification_id}`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Security:** Strict data isolation enforced. Users can only access their own verification records (`403 Forbidden` if accessed by another user).

### 4. Get Single Verification Request
- **Endpoint:** `GET /api/v1/verify/{verification_id}`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Security:** Strict data isolation enforced. Users can only access their own verification records (`403 Forbidden` if accessed by another user).

### 5. Get Verification Audit History (Filtered & Paginated)
- **Endpoint:** `GET /api/v1/verify/history`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Query Parameters:**
  - `page` *(int, default: 1)*: 1-indexed page number.
  - `page_size` *(int, default: 20, max: 100)*: Items per page.
  - `result_label` *(string, optional)*: Filter by verdict label (`genuine`, `suspicious`, `duplicate`, `potentially_fake`, `unable_to_verify`).
  - `status` *(string, optional)*: Filter by processing status (`completed`, `pending`, `failed`).
- **Response:** Paginated list of lightweight `VerificationHistoryItem` summaries (omits heavy raw text blobs for fast list rendering).

### 6. Get Citizen Verification Statistics
- **Endpoint:** `GET /api/v1/verify/stats`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Security:** Strict tenant isolation (only aggregates data belonging to the authenticated user).
- **Response (`VerificationStatsResponse`):**
  ```json
  {
    "total_verifications": 12,
    "completed_verifications": 12,
    "pending_verifications": 0,
    "failed_verifications": 0,
    "genuine_count": 6,
    "suspicious_count": 2,
    "duplicate_count": 1,
    "potentially_fake_count": 2,
    "unable_to_verify_count": 1,
    "average_risk_score": 38.5
  }
  ```
  *(Returns safe zero-values if user has zero submissions).*

---

## 👤 Citizen User Profile Endpoint (`/api/v1/users/me`)

- **Endpoint:** `GET /api/v1/users/me`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Purpose:** Secure profile retrieval for user dashboards and navigation headers.
- **Security Guarantee:** Never exposes internal database secrets, password hashes, or sensitive credentials.
- **Response (`UserResponse`):**
  ```json
  {
    "id": 1,
    "email": "citizen@example.com",
    "full_name": "Aarav Sharma",
    "is_active": true,
    "is_admin": false,
    "created_at": "2026-10-08T11:00:00Z"
  }
  ```

---

## 🤖 Local Rule-Based AI Assistant (`POST /api/v1/assistant/chat`)

SchemeShield AI includes a **100% local, zero-cost knowledge assistant** focused exclusively on government scheme verification education, risk literacy, and fraud awareness.

> [!IMPORTANT]
> **₹0 Local Architecture Guarantee:**
> - Runs completely on local deterministic rules and keyword-indexed domain knowledge.
> - **NO external generative AI APIs (No OpenAI, No Gemini, No Claude, No paid inference).**
> - Does NOT pretend to be an unconstrained generative chatbot.

### Supported Citizen Topics:
1. **How to Verify:** Step-by-step guidance on submitting scheme names, URLs, or documents.
2. **Risk Score Literacy:** Meaning of the 0–100 scale, scoring factors, and thresholds.
3. **Confidence Score Literacy:** Evidence quantity vs. risk assessment differentiation.
4. **Duplicate Scheme Guidance:** How variant claims and clone portals are detected.
5. **Suspicious Indicators:** Breakdown of common red flags and artificial urgency tactics.
6. **Government Domain Authority:** Why `.gov.in` and `.nic.in` domains provide verified provenance.
7. **OTP & Credential Defense:** Urgent instructions never to share OTPs, ATM PINs, or passwords.
8. **Upfront Fee Warnings:** Explanation of advance-fee fraud in fake welfare schemes.
9. **OCR Document Verification:** How text extraction works for flyers and newspaper clippings.
10. **Allowed Document Formats:** Accepted extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.txt`).
11. **"Unable to Verify" Guidance:** What citizens should do when evidence is inconclusive.

### Assistant Safety & Anti-Fraud Guardrails:
- **Zero Credential Solicitations:** Assistant never asks citizens for passwords, OTPs, UPI PINs, or bank details.
- **Safety Intervention:** When citizen messages mention OTPs, bank accounts, or fees, the assistant immediately triggers an emphatic fraud warning.
- **No Government Affiliation Claim:** Clearly states SchemeShield is an independent verification platform.
- **No Absolute Guarantees:** Emphasizes that citizens must verify with official portals before acting.

### API Specification:
- **Endpoint:** `POST /api/v1/assistant/chat`
- **Authentication:** Required (`Authorization: Bearer <access_token>`)
- **Request:**
  ```json
  {
    "message": "How can I check whether a government scheme is genuine?"
  }
  ```
- **Response (`AssistantChatResponse`):**
  ```json
  {
    "response": "To verify a government scheme on SchemeShield AI:\n1. Use Text Verification...",
    "suggestions": [
      "What does the risk score mean?",
      "Why is a .gov.in domain useful?",
      "What documents can I upload?"
    ],
    "timestamp": "2026-10-08T12:00:00Z"
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

### Complete Test Coverage (86 Automated Tests):
- ✅ **Final Integration & Polish Suite (`test_final_integration.py` - 12 Tests):**
  1. `test_user_profile_authenticated` — Profile endpoint returns safe fields; no hash leakage.
  2. `test_user_profile_unauthenticated` — 401 Unauthorized for unauthenticated profile requests.
  3. `test_verification_history_filters_and_payload_structure` — Filtering history by verdict label and status.
  4. `test_verification_stats_empty_user` — Safe zero-value defaults for users with no history.
  5. `test_verification_stats_calculation_and_isolation` — Accurate metric calculation and strict user data isolation.
  6. `test_verification_stats_unauthenticated` — 401 Unauthorized check for stats endpoint.
  7. `test_assistant_chat_supported_questions` — Accurate answers across all 11 core verification topics.
  8. `test_assistant_chat_safety_on_credential_theft_query` — Emphatic fraud warning on OTP/credential queries.
  9. `test_assistant_chat_unsupported_question_fallback` — Graceful fallback to verification tool guidance.
  10. `test_assistant_chat_validation_and_unauthenticated` — Input length validation and auth enforcement.
  11. `test_openapi_and_docs_endpoints` — OpenAPI schema and Swagger documentation validity.
  12. `test_complete_citizen_verification_lifecycle_e2e` — Complete end-to-end citizen verification journey.
- ✅ **Authentication Suite (`test_auth.py` - 13 Tests):**
  13–25. Registration, duplicate email rejection, login, bcrypt verification, token expiration, profile lookup, and account isolation.
- ✅ **Scheme Management Suite (`test_schemes.py` - 9 Tests):**
  26–34. Public catalog listing, authorized creation, duplicate prevention, updates, deletes, and multi-parameter filtering.
- ✅ **Scheme Verification Suite (`test_verify.py` - 9 Tests):**
  35–43. Text verification submission, single lookup, cross-user forbidden isolation, paginated history, and domain trust analysis.
- ✅ **Document & OCR Verification Suite (`test_document_and_url.py` - 18 Tests):**
  44–61. Multipart uploads, PDF text extraction, OCR image mocks, SSRF blocking, dangerous schemes, and URL text extraction.
- ✅ **AI Engine & NLP Suite (`test_ai_engine.py` - 20 Tests):**
  62–81. Normalization, tokenization, TF-IDF vectorizer, duplicate detection, scam heuristic rules, and risk scoring.
- ✅ **Health Suite (`test_health.py` - 1 Test):**
  82. Live SQLite connectivity and health reporting.
- ✅ **Database & Session Suite (`test_database.py` - 3 Tests):**
  83–85. Engine connectivity, schema initialization, and session dependency lifecycles.
- ✅ **Startup Suite (`test_startup.py` - 1 Test):**
  86. FastAPI factory startup and route compilation.

---

## 🎯 Final Backend Architecture Status

### Completed Across Milestones 1 – 6:
- [x] **Milestone 1:** FastAPI foundation, SQLite + SQLAlchemy 2.0 ORM, 12-factor configuration, CORS, versioned routing (`/api/v1`), health endpoint.
- [x] **Milestone 2:** User authentication system (bcrypt salted passwords, PyJWT HMAC-SHA256 tokens, `/api/v1/auth/me`).
- [x] **Milestone 3:** Scheme catalog CRUD, filtering, search, VerificationRequest tracking, and official source domain service.
- [x] **Milestone 4:** Local NLP engine, pure-Python TF-IDF vectorizer, Cosine Similarity duplicate detector, heuristic scam scanner, explainable risk/confidence scoring.
- [x] **Milestone 5:** Multipart document upload, PDF text parsing (`pypdf`), local OCR (`pytesseract`), SSRF-guarded URL inspection (`httpx`, `BeautifulSoup`).
- [x] **Milestone 6 (Final):**
  - [x] Filterable verification history (`GET /api/v1/verify/history` with `result_label` and `status` query filters).
  - [x] Citizen verification statistics endpoint (`GET /api/v1/verify/stats`) with zero defaults and strict tenant isolation.
  - [x] Citizen user profile endpoint (`GET /api/v1/users/me`) with safe serialization.
  - [x] Local AI Knowledge Assistant (`POST /api/v1/assistant/chat`) with anti-fraud safety guardrails and zero external API dependencies.
  - [x] Hardened application-level limits (max text size, upload caps, message lengths).
  - [x] 86 automated tests passing with 100% success rate.
  - [x] Complete OpenAPI / Swagger interactive documentation at `/docs`.

---

## 📄 Document & Image OCR Verification (`/api/v1/verify/document`)

Citizens can upload photos of pamphlets, WhatsApp flyers, newspaper clippings, or PDF documents to verify legitimacy.

### Supported Formats & Limits:
- **Formats:** PDF (`.pdf`), PNG (`.png`), JPEG/JPG (`.jpg`, `.jpeg`), WebP (`.webp`), Text (`.txt`).
- **File Size Limit:** Default 10 MB (configurable via `MAX_UPLOAD_SIZE_MB`).
- **Temporary Storage & Cleanup:** Uploaded files are written with cryptographically randomized filenames to a non-public directory, processed, and immediately deleted via safe `finally` blocks. No binary file BLOBs are stored in SQLite.

### Local OCR Engine Setup:
- **PDF Documents:** Analyzed locally using `pypdf`. Embedded text layers are extracted directly without external dependencies.
- **Image Flyers & Scanned PDFs:** Processed locally using `pytesseract` and `Pillow`.
- **System Tesseract Installation:**
  If you intend to analyze image files (PNG/JPG), Tesseract OCR must be installed on the host operating system:
  - **Windows:** `winget install UB-Mannheim.TesseractOCR` (or download the installer from GitHub)
  - **Debian / Ubuntu:** `sudo apt-get update && sudo apt-get install -y tesseract-ocr`
  - **macOS:** `brew install tesseract`
  *(Note: If Tesseract is not installed on the system, text-based documents such as TXT and text-embedded PDFs will still process seamlessly, and the API returns a clear, actionable notification for images).*

### Distinction Between Confidence Metrics:
- **OCR Quality / Metadata:** Reflects character yield, extraction technique (`plain_text`, `pdf_text`, `ocr`), and document parsing notices.
- **Verification Confidence Score (`0 – 100`):** Reflects the volume and concordance of corroborating evidence found in the extracted text.
- **Risk Score (`0 – 100`):** Reflects the likelihood of fraud, credential theft, or scam tactics detected in the extracted text.

---

## 🌐 Safe Webpage URL Verification (`/api/v1/verify/url`)

Citizens can submit suspicious links circulating online to determine whether they belong to authentic government portals.

### Security & SSRF Protection:
- **Protocol Whitelisting:** Permitted protocols are strictly limited to `http` and `https`. Schemes like `file://`, `javascript:`, `data:`, or `ftp://` are immediately rejected with HTTP 400.
- **Server-Side Request Forgery (SSRF) Guard:**
  - Prevents the backend from making requests to internal or private infrastructure.
  - Hostnames resolving to loopback (`127.0.0.1`, `localhost`, `::1`), private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), or link-local ranges (`169.254.0.0/16`) are blocked before socket connection.
- **Resource Limits:**
  - Connection timeout: 5.0 seconds.
  - Max response buffer: 1 MB.
  - Extracted text cap: 8,000 characters.
- **HTML Boilerplate Stripping:** Scripts, styling, SVG icons, headers, footers, and navigation elements are stripped to isolate the primary announcement text.
- **Graceful Fallback:** If destination web content cannot be reached (timeout or SSRF block), the domain's authority is still evaluated, and the report clearly indicates that live page content was not fetched.

---

## 🧠 Local Scheme Verification Engine Architecture

SchemeShield AI implements a **100% local, zero-cost, privacy-preserving AI/NLP verification engine**. It does **not** send citizen submissions or sensitive documents to external closed-source AI APIs (e.g. OpenAI, Gemini) and requires no paid cloud infrastructure.

```text
Citizen Submission (Text, Document/Image, URL)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ OCR / PDF Parser │    │ SSRF URL Fetcher │
│ (pypdf, Pillow)  │    │ (httpx, BS4)     │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
       ┌───────────────────────────────┐
       │   NLP & Text Preprocessor     │
       │ (NFKD, HTML, Acronyms, StopW) │
       └──────────────┬────────────────┘
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
 ┌─────────────┐┌─────────────┐┌──────────────┐
 │ TF-IDF      ││ Scam Heuristic││ Domain Trust│
 │ Similarity  ││ Rules Engine││ Evaluation   │
 └──────┬──────┘└──────┬──────┘└──────┬───────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
        ┌──────────────────────────────┐
        │  Risk & Confidence Synthesizer│
        │   (0-100 Bounded Scores)     │
        └──────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │ Citizen Explanation & Evidence│
       │  (Verdict Label + JSON Audit) │
       └───────────────────────────────┘
```

### 1. NLP Preprocessing Pipeline (`NLPAnalysisService`)
- **Safe Unicode Normalization:** Applies NFKD decomposition and ASCII conversion to resist homograph/unicode obfuscation tricks.
- **Noise Reduction:** Strips raw URL patterns and HTML tags while extracting textual content.
- **Acronym Expansion:** Deterministically expands common welfare scheme acronyms (e.g. `PM` -> `Pradhan Mantri`) to maximize lexical recall.
- **Deterministic Tokenization:** Filters curated stop-words and short tokens, providing n-gram extraction (unigrams and bigrams).

### 2. Scheme Similarity & Duplicate Detection (`DuplicateDetectionService`)
- **Algorithm:** Pure-Python `LocalTfidfVectorizer` paired with sparse Cosine Similarity. Zero compiled C-extensions required; immune to system DLL execution restrictions.
- **Corpus Comparison:** Compares submitted titles and descriptions against stored reference schemes (`Scheme` table).
- **Thresholds:**
  - `HIGH_SIMILARITY_THRESHOLD = 0.70` (potential duplicate claim or direct variant).
  - `MODERATE_SIMILARITY_THRESHOLD = 0.35` (thematic overlap; shares terminology).
- **Nuance:** Similarity does *not* imply fraud; it indicates catalog duplication or known scheme variants.

### 3. Suspicious Scam Pattern Detection (`SuspiciousDetectorService`)
- Heuristic regular-expression rules scanning for known fraud tactics across 5 categories:
  1. **`CREDENTIAL_HARVESTING`** (Critical): Requests for OTP, banking PINs, netbanking passwords, or CVV. Legitimate government portals never solicit private citizen credentials.
  2. **`ADVANCE_FEE_FRAUD`** (High): Demands for upfront "registration fees", "processing fees", or personal UPI transfers.
  3. **`UNREALISTIC_GUARANTEES`** (High): Claims of 100% unconditional instant cash, free electronics, or prize drawings.
  4. **`ARTIFICIAL_URGENCY`** (Medium): Pressuring citizens with "offer expires in 2 hours" or "limited slots".
  5. **`UNOFFICIAL_CHANNELS`** (Medium): Directing citizens to private Telegram channels or demanding WhatsApp forwards.
- Returns matched indicators, severity scores, and citizen-friendly explanations.

### 4. Official Domain Trust Signal (`OfficialSourceVerificationService`)
- Safely parses submitted URLs to verify hostname against trusted patterns (`.gov.in`, `.nic.in`, `myscheme.gov.in`).
- **Critical Principles:**
  - An official government domain is a **positive corroboration signal**, but does not alone guarantee the authenticity of message text.
  - A non-government domain does **not** automatically label a scheme as fake; third-party news outlets, blogs, and NGOs frequently report on genuine programs.

### 5. Risk Score & Confidence Score Definitions
- **Risk Score (`0 – 100`):**
  - Measures the likelihood of deception, fraud, or policy violation.
  - `0`: Extremely low risk.
  - `100`: Extremely high risk (blatant credential harvesting or fee scam).
  - Baseline starts at neutral 20. Boosted by suspicious red flags (+30 to +80 floor) and untrusted domain claims (+10 to +20). Reduced by verified `.gov.in` domain (-25).
- **Confidence Score (`0 – 100`):**
  - Measures the quantity and consistency of observable evidence.
  - Boosted by sufficient text length (>= 120 chars), presence of a verifiable URL, catalog candidate matches, and concordant fraud signals.
  - Lowered when input is sparse, ambiguous, or lacks corroborating sources.
  - **Important:** Risk and Confidence are independent metrics. A submission can have *High Risk with Low Confidence*, or *Low Risk with High Confidence*.

### 6. Result Label Hierarchy
- **`potentially_fake`:** Triggered when `risk_score >= 65.0` or critical red flags (`CREDENTIAL_HARVESTING`, `ADVANCE_FEE_FRAUD`) are present.
- **`duplicate`:** Triggered when duplicate similarity is high (`>= 0.70`) with an existing catalog record and risk is low (< 50).
- **`suspicious`:** Triggered when `risk_score >= 40.0` or non-government domains circulate unverified welfare promises.
- **`genuine`:** Requires all 4 conditions:
  1. Hosted on a verified government portal (`.gov.in` or `.nic.in`).
  2. Zero suspicious red flags detected.
  3. Low risk score (`<= 25.0`).
  4. High confidence score (`>= 55.0`).
- **`unable_to_verify`:** Default outcome when evidence is insufficient (`confidence < 30.0` or text < 15 chars) or third-party claims cannot be conclusively corroborated.

---

## ⚖️ Important Disclaimer

> [!CAUTION]
> **SchemeShield AI is an independent educational/project platform. It is not an official Government of India website or service and does not itself certify government schemes.**
> - SchemeShield AI is **NOT** affiliated with, endorsed by, certified by, or officially representative of the Government of India, the National Informatics Centre (NIC), Digital India, or any state ministry.
> - Analysis results, risk scores, and verdicts produced by SchemeShield AI are heuristic evaluations generated for informational and awareness purposes only.
> - Citizens are strongly advised to always consult authoritative government portals (such as [myScheme.gov.in](https://www.myscheme.gov.in), [india.gov.in](https://www.india.gov.in), or individual ministerial domains) before submitting applications or making financial decisions.


