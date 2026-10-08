# SchemeShield AI — Backend

> **Tagline:** *"Verify Before You Trust."*

Backend REST API and AI verification architecture for **SchemeShield AI**, an open platform designed to empower citizens to detect and prevent fraudulent, duplicate, suspicious, or maliciously modified government welfare schemes.

---

## 📌 Project Architecture & Branching Model

This repository is organized into **two independent development branches**:

| Branch | Domain | Scope & Status |
| :--- | :--- | :--- |
| **`frontend`** | User Interface | Developed independently on the `frontend` branch by the frontend teammate (React/SPA). |
| **`backend`** *(Current)* | REST API & Core Services | FastAPI, SQLite, SQLAlchemy models, Pydantic validation, and modular AI pipeline interfaces. |

> [!IMPORTANT]
> **Branch Rule**: This branch strictly contains **backend code only**. No UI, HTML, CSS, or React components are included. The frontend teammate connects directly to this service via versioned REST APIs (`/api/v1/*`).

---

## 🛠️ Technology Stack (₹0 Cost Stack)

- **Language:** Python 3.10+ (tested on Python 3.14)
- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/) (high performance, asynchronous REST API)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/) (standard production-ready worker)
- **Database:** [SQLite](https://sqlite.org/) via [SQLAlchemy 2.0](https://www.sqlalchemy.org/) ORM (zero-cost, embedded, zero configuration)
- **Validation & Settings:** [Pydantic v2](https://docs.pydantic.dev/) and `pydantic-settings`
- **Testing:** [pytest](https://pytest.org/) and `fastapi.testclient`
- **No Paid APIs:** Designed from the ground up to operate with zero reliance on paid external APIs (no OpenAI, Gemini, or third-party paid services required).

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
│   ├── models/                   # SQLAlchemy Declarative Models
│   │   ├── __init__.py           # Model aggregator for metadata auto-registration
│   │   ├── user.py               # User model with security & relationships
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
│   │   ├── auth.py               # /api/v1/auth routes
│   │   ├── verification.py       # /api/v1/verification routes
│   │   ├── schemes.py            # /api/v1/schemes routes
│   │   ├── history.py            # /api/v1/history routes
│   │   └── assistant.py          # /api/v1/assistant routes
│   │
│   ├── services/                 # AI & Verification Service Pipeline Stubs
│   │   ├── __init__.py
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
│       ├── security.py           # PBKDF2-HMAC password hashing & secure tokens
│       └── file_handler.py       # Safe upload validation & path handling
│
├── tests/                        # Automated Test Suite
│   ├── __init__.py
│   ├── conftest.py               # Test client fixture & isolated test DB
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
| `SECRET_KEY` | *(Development string)* | Secret key for JWT signing |
| `CORS_ORIGINS` | `["http://localhost:3000", ...]` | Allowed frontend origins |
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

---

## 📖 Interactive API Documentation

FastAPI automatically generates interactive OpenAPI documentation:

- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI Schema:** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## 🧪 Running Automated Tests

Run the test suite with `pytest`:

```bash
# Windows (PowerShell)
$env:PYTHONPATH="backend"; pytest backend/tests -v

# Linux / macOS
PYTHONPATH=backend pytest backend/tests -v
```

Tests cover:
- ✅ **Health Check Endpoint (`GET /api/health`):** Validates HTTP 200, system health status, and live database connectivity.
- ✅ **Application Boot & Docs:** Validates Swagger UI, ReDoc, and OpenAPI schema generation.
- ✅ **Database Initialization:** Validates SQLite connectivity, session generation, and creation of all foundation tables (`users`, `government_schemes`, `verifications`, `verification_evidence`, `verification_history`, `saved_schemes`, `ai_conversations`).

---

## 🛡️ API Endpoints Summary

### Health Check
- `GET /api/health` — System status, version, and database connectivity.

### Version 1 API Architecture (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new citizen account |
| `POST` | `/api/v1/auth/login` | Authenticate user and receive JWT |
| `POST` | `/api/v1/verification/analyze` | Submit scheme text or URL for verification |
| `POST` | `/api/v1/verification/upload` | Upload document/image for OCR analysis |
| `GET` | `/api/v1/verification/{id}` | Retrieve verification verdict & evidence report |
| `GET` | `/api/v1/schemes` | Search and filter verified government schemes |
| `GET` | `/api/v1/schemes/{id}` | Get official details for a government scheme |
| `GET` | `/api/v1/history` | Retrieve user verification history |
| `POST` | `/api/v1/assistant/chat` | AI-assisted citizen advisory chat |

---

## 🎯 Current Backend Scope & Future Roadmap

### Completed in this Milestone (Foundation):
- [x] Production-grade modular backend architecture.
- [x] Zero-cost SQLite database integration with SQLAlchemy 2.0 ORM.
- [x] Relational models for Users, Schemes, Verifications, Evidence, History, and Conversations.
- [x] Centralized Pydantic v2 configuration and environment management.
- [x] Standardized API response format and sanitized exception handlers (no internal DB error leaks).
- [x] CORS configuration for decoupled frontend branch integration.
- [x] File upload directories and file security validation.
- [x] Pluggable services architecture for future AI modules.
- [x] Automated test suite verifying health, boot, and DB schema.

### Future Backend Milestones:
- **Authentication Implementation:** JWT token issuance, password validation, protected routes.
- **NLP Analysis Engine:** Local open-source entity extraction, linguistic urgency detection.
- **Duplicate Detection Engine:** Local TF-IDF/embedding similarity search against verified scheme repository.
- **Suspicious Content Detection:** Heuristic rule engines scanning for scam indicators (registration fees, fake domains).
- **OCR Pipeline:** Integration with open-source OCR (Tesseract / pytesseract) for flyer processing.
- **Official Source Verification:** Domain validation (`.gov.in`, `.nic.in`) and official gazette cross-checks.
- **Risk Scoring Algorithm:** Weighted synthesis of all pipeline signals into a 0.0–1.0 risk index.
