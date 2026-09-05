# MedIndia HealthOS — Complete Agent Handoff & Continuity Guide

> **Target Audience**: Any AI Agent (Antigravity, Claude Code, etc.) or Human Engineer taking over or continuing development of this repository across sessions, accounts, or context resets.
> **Status**: Production-Ready Prototype & Verified Monorepo (14/14 Backend Tests Passing, Frontend Next.js 14 Build Passing).
> **Last Verified**: September 2026

---

## 1. Executive Summary & Purpose

**MedIndia HealthOS** is an open, standards-compliant, ABDM-aligned Electronic Health Record (EHR) and Health Information Exchange platform tailored for the Indian healthcare ecosystem. It provides an interoperable clinical operating system connecting:

1. **Patients** (with national ABHA addresses, granular consent controls, and medical record access).
2. **Doctors / Practitioners** (with registered NMC/MCI credentials, SNOMED CT coded diagnosis/prescription workflows, and grounded AI clinical brief copilot).
3. **Diagnostic Laboratories** (NABL-compliant diagnostic entry, observation ranges, and ABDM care context publishing).
4. **ABDM Health Information Provider (HIP)**: Care context discovery, OTP-based linking challenge, and FHIR R4 document delivery.
5. **ABDM Health Information User (HIU)**: Consent-driven health data requests and multi-facility clinical timeline aggregation.

---

## 2. Architectural Blueprint (3-Layer Pattern: `Agents.md`)

This repository is strictly organized according to the **3-Layer Architecture** described in `Agents.md`:

```
EHR Task/
├── directives/                # LAYER 1: Standard Operating Procedures (SOPs)
│   ├── 00_architecture_overview.md
│   ├── 01_abdm_integration_sop.md
│   ├── 02_snomed_ct_coding_sop.md
│   ├── 03_consent_manager_sop.md
│   ├── 04_ai_clinical_copilot_sop.md
│   ├── 05_database_schema_sop.md
│   ├── 06_security_audit_sop.md
│   ├── 07_frontend_ux_sop.md
│   └── 08_testing_verification_sop.md
│
├── backend/                   # LAYER 2: Modular FastAPI Monolith
│   ├── app/
│   │   ├── api/               # API Routers & Dependencies
│   │   │   ├── v1/            # Core Endpoints (auth, patients, doctors, labs, consent, abdm, ai, audit, reminders, terminology)
│   │   │   ├── fhir/          # ABDM FHIR R4 standard endpoints (/api/fhir/*)
│   │   │   ├── deps.py        # RBAC and Consent Verification Security Gate
│   │   │   └── router.py      # Master API router
│   │   ├── core/              # Config, Async DB Engine, Security (bcrypt/JWT), Audit Logger
│   │   ├── fhir/              # ABDM FHIR R4 Serializers (Patient, Encounter, Condition, etc.)
│   │   ├── models/            # 15 SQLAlchemy Relational Entities (entities.py)
│   │   ├── schemas/           # Pydantic Schemas for DTOs and Validation
│   │   ├── services/          # Grounded AI Clinical Synthesizer & Reminder Engine
│   │   ├── terminology/       # Authentic SNOMED CT Concept Catalog and Search
│   │   └── main.py            # FastAPI Application Entrypoint & DB Table Lifecycle
│   ├── pyproject.toml / requirements.txt
│   └── .env.example
│
├── frontend/                  # LAYER 2: Modern Next.js 14 App Router + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Multi-Portal Interactive App (Doctor, Patient, Lab, Consent, ABDM, FHIR, Audit)
│   │   │   ├── layout.tsx     # Root layout with Inter font and clinical theming
│   │   │   └── globals.css    # Tailwind & modern clinical design tokens
│   │   └── lib/               # Utility functions and API client
│   └── package.json
│
├── execution/                 # LAYER 3: Deterministic Python Execution Scripts
│   ├── run_dev.py             # Single-command runner starting backend (8000) & frontend (3000)
│   ├── seed_demo_data.py      # Populates complete realistic Indian clinical dataset
│   └── verify_backend_api.py  # 14-point automated integration & security test suite
│
├── .agents/skills/            # Installed Skills (ABDM, Planning, PubMed, OpenFDA, Superpowers)
├── Task.md                    # Active task definition
├── task_plan.md               # Manus-style task planning memory
├── findings.md                # Key technical decisions and discoveries
├── progress.md                # Active milestone tracking
└── HANDOFF.md                 # THIS FILE (Complete Agent Handoff)
```

---

## 3. Demo Personas & Pre-Seeded Credentials

All accounts are pre-seeded in the database via `execution/seed_demo_data.py`:

| Role | Name | Email | Password | Identifier / Credentials |
| :--- | :--- | :--- | :--- | :--- |
| **Doctor** | Dr. Arvind Swaminathan | `dr.arvind@apollo.in` | `Doctor123!` | NMC: `MCI-74892`, Apollo Indraprastha Hospital |
| **Patient 1** | Rajesh Sharma | `rajesh.sharma@example.in` | `Password123!` | ABHA: `91-4405-2026-0001`, Address: `rajesh.sharma@abdm` |
| **Patient 2** | Priya Patel | `priya.patel@example.in` | `Password123!` | ABHA: `91-3836-2026-0002`, Address: `priya.patel@abdm` |
| **Diagnostic Lab** | Delhi Central Diagnostic Hub | `delhi.lab@lalpathlabs.com` | `Lab12345!` | NABL License: `NABL-DL-2026-891`, Dr. Lal PathLabs |

---

## 4. Key Endpoints & API Reference

The backend exposes an interactive OpenAPI specification at `http://localhost:8000/docs`:

### Authentication & Profiles (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Issues JWT access token with user role (`DOCTOR`, `PATIENT`, `LAB_STAFF`).
- `GET /api/v1/auth/me`: Current authenticated user profile with linked entity ID.

### ABDM Gateway Simulator (`/api/v1/abdm`)
- `POST /api/v1/abdm/hip/patient/care-context/discover`: Discovers patient care contexts by ABHA ID.
- `POST /api/v1/abdm/hip/link/token/generate`: Generates OTP challenge for linking patient records.
- `POST /api/v1/abdm/hip/link/token/confirm`: Verifies OTP and links care context to ABHA.
- `POST /api/v1/abdm/hiu/consent/request`: Requests patient consent for health information access.
- `POST /api/v1/abdm/hiu/health-information/fetch`: Retrieves encrypted FHIR R4 Document Bundle of linked clinical records.

### Clinical & Diagnostic Operations
- `GET /api/v1/doctors/patients`: List patients authorized under active consent.
- `GET /api/v1/doctors/patients/{patient_id}/timeline`: Consent-gated unified clinical timeline.
- `POST /api/v1/doctors/encounters`: Create clinical encounter with SNOMED-coded conditions.
- `POST /api/v1/doctors/prescriptions`: Issue medication prescription.
- `GET /api/v1/labs/orders`: Review pending lab test requisitions.
- `POST /api/v1/labs/results`: Record quantitative observation results with reference ranges and publish.

### SNOMED CT & FHIR R4
- `GET /api/v1/terminology/snomed/search?q={term}`: Autocomplete search against authentic SNOMED CT concept catalog.
- `GET /api/fhir/Patient/{id}`: FHIR R4 Patient resource.
- `GET /api/fhir/Bundle/Patient/{id}`: ABDM-compliant FHIR R4 Bundle containing all patient clinical resources.

### Consent Engine & Transparency Audit
- `GET /api/v1/consent/my-consents`: Patient views all active, pending, and revoked consents.
- `POST /api/v1/consent/request`: Request consent for a specific category, purpose, and time window.
- `POST /api/v1/consent/{id}/approve` / `reject` / `revoke`: Patient real-time consent controls.
- `GET /api/v1/audit/logs`: Patient immutable audit log detailing every access event (who, when, what resource, purpose).

### Grounded Clinical AI Copilot (`/api/v1/ai`)
- `POST /api/v1/ai/clinical-brief`: Synthesizes concise clinical brief from past records, **strictly citing record IDs** (`[Condition#...]`, `[Observation#...]`).
- `POST /api/v1/ai/chat`: Clinical history Q&A grounded strictly in patient data with zero hallucinations.
- `POST /api/v1/ai/lab-explainer`: Translates abnormal lab results into patient-friendly layperson terminology.

---

## 5. Security & Consent Verification Gate

Consent enforcement is implemented in `backend/app/api/deps.py:verify_consent_access`:

```python
async def verify_consent_access(
    patient_id: str,
    category: str,
    purpose: str,
    db: AsyncSession,
    current_user: User
) -> bool:
    # 1. Patients always have access to their own data
    # 2. Doctors must have an active, non-expired, category-matched consent
    # 3. Unauthorized access triggers HTTP 403 Forbidden and logs an 'UNAUTHORIZED' AuditLog entry
```

---

## 6. How to Run and Test the Application

### 1. Run Complete Development Environment (Backend + Frontend)
```bash
python execution/run_dev.py
```
- **Backend API**: http://localhost:8000 (Swagger docs: http://localhost:8000/docs)
- **Frontend App**: http://localhost:3000

### 2. Run Automated Backend Integration Test Suite
```bash
.\.venv\Scripts\python execution\verify_backend_api.py
```
*Result*: 14/14 automated tests pass (Auth, RBAC, Consent Gating, FHIR Serializers, SNOMED Search, AI Grounding, ABDM HIP/HIU, Audit Logging).

### 3. Verify Frontend Production Build
```bash
cd frontend
npm run build
```
*Result*: Compiles statically with zero TypeScript or Tailwind warnings.

### 4. Re-seed Demo Database (if needed)
```bash
.\.venv\Scripts\python execution\seed_demo_data.py
```

---

## 7. Installed Skills in Workspace (`.agents/skills/`)

| Skill | Purpose |
| :--- | :--- |
| `abdm-hip-hiu-fhir` | ABDM M1, M2, M3 standards, FHIR R4 NRCES profiles, and Care Context linking. |
| `brainstorming` | Idea refinement, trade-off analysis, and feature specification. |
| `superpowers` | Development superpowers: TDD, systematic debugging, plan execution, verification. |
| `planning-with-files` | Manus-style disk memory (`task_plan.md`, `findings.md`, `progress.md`). |
| `clinical_trials_database` | Clinical trials query capability for Indian/global trials. |
| `openfda_database` | Drug interactions, adverse event tracking, and FDA safety data. |
| `pubmed_database` | Biomedical literature search for evidence-based clinical copilot expansion. |
| `ui-ux-pro-max` & `impeccable` | Healthcare UI/UX design intelligence and aesthetic polish. |
| `security-and-hardening` | OWASP compliance, RBAC, encrypted FHIR payloads, and audit trails. |
| `verification-loop` | Automated multi-phase quality and build verification before completion. |

---

## 8. Technical Gotchas & Solutions Recorded

1. **PassLib bcrypt wrap-bug**: PassLib 1.7.4 fails on `bcrypt>=4.1.0` during internal 72-byte detection.
   - *Solution*: Replaced PassLib wrapper in `backend/app/core/security.py` with direct native `bcrypt` calls (`bcrypt.hashpw` and `bcrypt.checkpw`).
2. **Pydantic V2 Email Validation**: Pydantic `EmailStr` requires the `email-validator` library.
   - *Solution*: Installed `email-validator>=2.0.0` in `.venv` and recorded in `requirements.txt`.
3. **Database Portability**: SQLite (`sqlite+aiosqlite:///.tmp/medindia_dev.db`) is configured as the zero-dependency local default, with instant fallback to PostgreSQL via `DATABASE_URL` in `.env`.
4. **ABDM Simulation Integrity**: Production ABDM requires RSA-2048 encryption and NDHM Gateway digital signatures (`X-HIP-ID`, `X-HIU-ID`). The simulator implements identical payloads, care contexts, and token workflows so shifting to production credentials only requires swapping base URLs and keys.

---

## 9. Recommended Future Superpowers & Next Steps

When resuming or adding new capabilities, the following features are primed for implementation:

1. **Emergency "Break-Glass" Consent Protocol**:
   - Allow emergency doctors to bypass normal consent under critical trauma conditions, automatically flagging an urgent notification and escalation audit record to the patient and hospital ombudsman.
2. **Voice-to-SNOMED Clinical Dictation**:
   - Web Audio API microphone recording in the Doctor Portal, streaming audio to an AI transcription model and parsing entities directly into SNOMED CT coded conditions and LOINC lab requests.
3. **Offline-First Sync for Rural Primary Health Centres (PHCs)**:
   - Client-side IndexedDB or embedded SQLite cache allowing rural medical officers to enter clinical records without active internet, auto-syncing with ABDM when connectivity resumes.
4. **NHA Sandbox Live Bridge**:
   - Provide an optional config toggle (`ABDM_SANDBOX_MODE=true`) connecting directly to the live National Health Authority (NHA) Sandbox Gateway (`dev.abdm.gov.in`).
