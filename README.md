# SchemeShield AI

> **"Verify Before You Trust."**

## Overview

SchemeShield AI is an AI-powered civic technology platform designed to protect citizens from deceptive, duplicate, suspicious, and fraudulent government schemes. By analyzing welfare announcements, uploaded circulars, and application forms against official government gazettes, PIB Fact Check advisories, and authentic `.gov.in` / `.nic.in` directories, SchemeShield AI provides instant, transparent verification verdicts with clear evidence, threat scoring, and citizen guidance.

> **Independent Platform Notice:** SchemeShield AI is an independent verification platform and is not an official government website.

---

## Frontend Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly typed with comprehensive API and domain contracts)
- **Routing**: [React Router DOM v7](https://reactrouter.com/) (Declarative client routing with protected routes)
- **Icons**: [Lucide React](https://lucide.dev/) (Lightweight, accessible SVG iconography)
- **Styling**: Curated Vanilla CSS Design System with CSS Custom Properties, light-first palette, subtle glassmorphism, 2.5D elevation layers, and mobile-first responsive utilities.
- **Cost**: **₹0**. Zero paid APIs, zero external AI service subscriptions, and 100% open-access civic technology.

---

## Features

1. **Authentication UI**:
   - Modern Citizen Sign In (`/login`), Registration (`/signup`), and Password Recovery (`/forgot-password`).
   - Client-side validation, password strength meter, visibility toggles, and instant one-click demo profiles (Demo Citizen and Demo Verifier).
   - Session preservation in local storage with automatic redirect to previous destinations.

2. **Citizen Dashboard (`/dashboard`)**:
   - Comprehensive telemetry overview with verification counters, risk distribution, and weekly trends.
   - Quick Verify launcher, recent verifications table, and interactive UI state switcher (Active Data, Empty State, Error State) for testing.

3. **Scheme Verification (`/verify`)**:
   - Multi-mode input workspace: structured text form and document upload.
   - 5-stage animated analysis pipeline (parsing, gazette comparison, similarity scanning, domain check, result synthesis).

4. **Document Upload UI**:
   - Drag-and-drop file upload zone supporting PDF circulars, PNG, and JPG notices up to 10MB.
   - File validation, size checking, and automatic title extraction.

5. **Risk & Confidence Results (`/verification-result`)**:
   - Comprehensive evidence report displaying Overall Status (`TRUSTED`, `SUSPICIOUS`, `HIGH RISK`, `NEEDS REVIEW`).
   - 0–100 Threat Index meter, algorithmic confidence rating, and plain-language citizen verdict.
   - Detailed check breakdowns (NLP, OCR, Official Source, Duplicate Mimicry), similar scheme comparisons, and action recommendations.

6. **Scheme Explorer (`/schemes`)**:
   - Searchable catalog across 7 official categories: Education, Healthcare, Agriculture, Employment, Women & Child Development, Financial Assistance, Social Welfare.
   - Multi-criteria filtering (search, category, verification status, risk index) and sorting (A–Z, Recently reviewed, Lowest risk, Highest risk).
   - Reusable Scheme Details modal with DBT indicators, helpline numbers, and active fraud warnings.

7. **AI Assistant (`/assistant`)**:
   - Citizen guidance chat interface with recommended prompt chips.
   - Local mock conversational service providing structured advice on welfare rules, fees, and cyber safety citing official sources.
   - Auto-scroll, simulated typing indicator, and copy actions.

8. **Verification History (`/history`)**:
   - Searchable and filterable audit trail of previous scheme assessments.
   - Direct "View Result" navigation into `/verification-result` with zero UI duplication.
   - Single-item removal and clear-history controls.

9. **User Profile & Settings (`/profile`)**:
   - Multi-tab configuration suite: Profile Information, Preferences & Alerts, and Security & Password.
   - Account verification statistics, edit/save/cancel state management, and unified toast feedback.

---

## Demo Mode

SchemeShield AI is currently operating in **Frontend Demo Mode**. All data and verification operations are powered by centralized frontend mock datasets (`src/data/`) and service layers (`src/services/`).

- **No backend is required** to run, test, and explore every feature of the application.
- The UI includes subtle "Demo Mode" indicators to distinguish simulated workflows from live government APIs.
- The application never claims mock demo data is live or officially government-certified.

---

## Environment

Configure environment variables by creating a `.env.local` file from the provided template:

```bash
# Copy template
cp .env.example .env.local
```

### Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Base URL of the separate FastAPI backend service. |
| `VITE_ENABLE_MOCK_SERVICES` | `true` | When `true`, all requests route to local mock services with ₹0 cost. Set to `false` when connecting to a running backend. |

> **Security Note:** Never commit `.env` or `.env.local` files containing secrets or credentials. The project's `.gitignore` automatically excludes all environment files.

---

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (comes bundled with Node.js)

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Run lint check
npm run lint

# 5. Preview production build locally
npm run preview
```

---

## Backend Integration

The frontend has been engineered specifically for seamless integration with the teammate developing the separate `backend` branch (FastAPI / Python):

- **Service Layer Abstraction (`src/services/`)**:
  - `authService`: `login()`, `signup()`, `logout()`, `getCurrentUser()`
  - `verificationService`: `analyzeScheme()`, `uploadDocument()`, `getVerificationResult()`, `getVerificationById()`
  - `schemeService`: `getSchemes()`, `searchSchemes()`, `getSchemeById()`, `getCategories()`
  - `historyService`: `getHistory()`, `getHistoryItemById()`, `deleteHistoryItem()`, `clearHistory()`
  - `assistantService`: `sendMessage()`, `getPromptSuggestions()`
  - `profileService`: `getProfile()`, `updateProfile()`, `updatePreferences()`, `changePassword()`
- **Strong API Contracts (`src/types/api.ts` & `src/types/`)**:
  - Generic `ApiResponse<T>`, `ApiError`, `PaginatedApiResponse<T>`
  - Domain models: `VerificationRequest`, `VerificationResult`, `GovernmentScheme`, `User`, `AuthResponse`, `RiskScore`, `AnalysisCheck`, `EvidenceItem`
- When the FastAPI backend is ready, the service implementations in `src/services/` can be connected to `apiClient` without modifying any UI components or page layouts.

---

## Civic Tech License & Notice

SchemeShield AI is developed as an independent open-access civic technology initiative. It is not affiliated with or endorsed by any government entity.
