# SchemeShield AI

> **"Verify Before You Trust."**

An AI-powered civic technology platform designed to help citizens identify potentially fake, duplicate, suspicious, or modified government schemes through official-source cross-referencing, OCR analysis, and threat scoring.

---

## ⚠️ Repository Architecture & Branch Separation

This repository follows a strict multi-branch structure:

- **`frontend` (this branch)**: Contains the complete React + TypeScript + Vite frontend client, reusable design system, and simulated service layer.
- **`backend` (separate branch)**: Developed independently by another teammate (FastAPI, Python ML/NLP/OCR pipelines, databases).

> **Important**: This frontend branch contains **NO backend code**, **NO server code**, and **NO paid APIs**. It runs 100% free and locally with simulated service interfaces ready for backend integration.

---

## 🛡️ Core Capabilities

- **Fake Scheme Detection**: Identifies non-existent welfare programs and fraudulent schemes designed to steal money or data.
- **Duplicate & Alteration Detection**: Uncovers altered guidelines or exaggerated claims attached to real schemes.
- **Official-Source Cross-Verification**: Semantically matches claims against genuine `.gov.in` / `.nic.in` records and PIB Fact Check advisories.
- **OCR Document Tampering**: Structure prepared for analyzing circular images and PDF sanction letters.
- **Threat & Confidence Scoring**: Explains the 0–100 Risk Index and algorithmic confidence.
- **Citizen AI Assistant**: Interactive guidance on welfare eligibility, fees, and cyber safety.

---

## 💻 Tech Stack (₹0 Cost / Free & Open Source)

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React (MIT Open Source)
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, modern typography, glassmorphism, responsive utilities, and elevation tokens.

---

## 📁 Frontend Architecture

```
src/
├── assets/            # Static media and brand visual assets
├── components/
│   ├── common/        # BrandLogo, StatCard
│   ├── layout/        # Navbar, Sidebar, Footer, AppLayout
│   └── ui/            # Button, Input, Textarea, Select, Card, Badge, Modal,
│                      # Tooltip, LoadingIndicator, ProgressIndicator,
│                      # StatusIndicator, RiskIndicator, SectionHeading, PageContainer
├── pages/             # LandingPage, VerifyPage, VerificationResultPage, SchemesPage,
│                      # AssistantPage, DashboardPage, HistoryPage, ProfilePage, Auth
├── routes/            # AppRoutes configuration
├── services/          # Centralized API service layer (auth, verification, scheme, assistant, history)
├── hooks/             # useVerification, useDebounce
├── types/             # TypeScript domain models (verification, scheme, auth, assistant)
├── data/              # Mock datasets (authentic schemes, sample scam alerts, history)
├── utils/             # Formatters, domain validator, scam keyword analysis
├── styles/            # variables.css, base.css, components.css, index.css
└── App.tsx            # Main application root
```

---

## 🚦 Available Routes

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | Landing Page | Hero, security visual, How It Works, 6 feature cards, metrics |
| `/verify` | Verify Scheme | Text, OCR document upload, and URL verification engine |
| `/verification-result` | Verification Result | Comprehensive evidence report, threat meter, and discrepancy flags |
| `/schemes` | Explore Schemes | Searchable directory of authentic government schemes |
| `/assistant` | AI Assistant | Citizen AI chat advisory with official citations |
| `/dashboard` | Dashboard | Verifier workbench, telemetry metrics, scam waves |
| `/history` | Verification History | Past verification audit trail with filtering |
| `/profile` | Citizen Profile | Citizen credentials and alert settings |
| `/login` | Citizen Login | Authentication portal |
| `/signup` | Citizen Sign Up | Citizen registration |
| `/forgot-password` | Forgot Password | Password recovery flow |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build Validation

```bash
npm run build
```

---

## 📜 Civic Tech Disclaimer

SchemeShield AI is an independent, non-governmental civic research and AI technology project. It is not affiliated with, authorized by, or an official representation of the Government of India or any state government. Verification results are algorithmic assessments intended to assist citizens in spotting fraud.
