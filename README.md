# SchemeShield AI
> **Tagline:** *"Verify Before You Trust."*

AI-powered platform for detecting and preventing fraudulent, duplicate, suspicious, and modified government schemes and scams.

---

## 🌿 Repository Structure & Development Branches

This repository maintains **two separate development branches**:

1. **`frontend` branch** — Client-side web application developed independently by the frontend teammate.
2. **`backend` branch** *(This branch)* — REST API, SQLite database, and AI service foundation developed with FastAPI and SQLAlchemy.

For detailed backend documentation, setup guides, API specifications, and testing instructions, please refer to:
👉 **[`backend/README.md`](./backend/README.md)**

---

## ⚡ Quick Backend Start

```bash
# 1. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Windows
# source .venv/bin/activate    # On Linux/macOS

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Configure environment
cp backend/.env.example .env

# 4. Run tests
$env:PYTHONPATH="backend"; pytest backend/tests -v

# 5. Start FastAPI development server
$env:PYTHONPATH="backend"; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Health Check:** `http://127.0.0.1:8000/api/health`
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`
