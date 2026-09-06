# MedIndia HealthOS — Task Tracker & Blueprint

## Project Vision
Production-grade EHR prototype for India demonstrating:
- **ABDM & FHIR R4 Interoperability**
- **SNOMED CT Standardized Terminology**
- **First-Class Consent-Gated Access Control**
- **Role-Based Access Control (Patient, Doctor, Lab)**
- **Auditability & Transparent Access Logs**
- **Automated Patient Reminders & Notification Center**
- **Grounded AI Clinical Copilot (Summary, RAG Q&A, Lab Explainer)**

---

## 3-Layer Operating Model (`Agents.md`)
- **Layer 1 (Directive)**: Markdown SOPs in `directives/`
- **Layer 2 (Orchestration)**: AI Agent routing, decisions, self-annealing
- **Layer 3 (Execution)**: Deterministic Python scripts in `execution/`

---

## Phase Checklist & Roadmap

- [x] **Phase 0: Environment & Architecture Instantiation**
  - [x] Instantiate 3-layer architecture (`directives/`, `execution/`, `.tmp/`, `.env`)
  - [x] Install 22 specialized agent skills from `PERSONALAGENT` into `.agents/skills`
  - [x] Create `.gitignore` and `.env.example`
  - [x] Create deterministic environment verification script (`execution/verify_env.py`)
  - [x] Initialize git repository

- [x] **Phase 1: Project Scaffolding & Core Architecture (`directives/01_project_scaffolding.md`)**
  - [x] Initialize modular monolith FastAPI backend (`backend/app/`)
  - [x] Initialize Next.js 14+ frontend with Tailwind CSS (`frontend/`)
  - [x] Set up async SQLAlchemy database engine (PostgreSQL + SQLite dev fallback)
  - [x] Add Docker Compose setup (`docker-compose.yml`)
  - [x] Add project `README.md` and architecture documentation

- [x] **Phase 2: Authentication & RBAC (`directives/02_auth_and_rbac.md`)**
  - [x] User registration, native bcrypt password hashing, and JWT auth
  - [x] Roles: `PATIENT`, `DOCTOR`, `LAB`
  - [x] Resource-level authorization dependencies in FastAPI
  - [x] Login/registration profiles seeded

- [x] **Phase 3: Consent Management Engine (`directives/03_consent_engine.md`)**
  - [x] Consent data model (purpose, categories, duration, validity window)
  - [x] Backend consent verification dependency for doctor record access
  - [x] Patient consent management UI (grant, view history, revoke)
  - [x] Access rejection on missing, expired, or revoked consent (HTTP 403)

- [x] **Phase 4: FHIR R4 & SNOMED CT Terminology (`directives/04_fhir_and_snomed.md`)**
  - [x] ABDM-aligned FHIR R4 resource mapper (`Patient`, `Practitioner`, `Encounter`, `Condition`, `Observation`, `DiagnosticReport`, `MedicationRequest`, `Consent`)
  - [x] SNOMED CT terminology dictionary and validation abstraction
  - [x] `/api/fhir/*` interoperability endpoints

- [x] **Phase 5: Clinical Workflows (`directives/05_clinical_workflows.md`)**
  - [x] Patient Dashboard: longitudinal health timeline, diagnoses, medications, labs, appointments
  - [x] Doctor Dashboard: authorized patient selector, encounter notes, SNOMED diagnosis, prescriptions, lab ordering
  - [x] Lab Dashboard: order queue, test status tracking, numerical/qualitative result entry

- [x] **Phase 6: Reminders & Notifications (`directives/06_reminders_and_notifications.md`)**
  - [x] Background reminder dispatcher (appointment, medication, lab result notifications)
  - [x] Extensible queue architecture
  - [x] In-app notification center UI

- [x] **Phase 7: AI Clinical Copilot (`directives/07_ai_clinical_copilot.md`)**
  - [x] Concise grounded clinical summaries with record ID citations
  - [x] RAG-powered Q&A over patient history citing record IDs
  - [x] Patient-friendly lab report explainer with medical disclaimers
  - [x] Provider-agnostic LLM interface with deterministic local fallback

- [x] **Phase 8: Audit Logging, Security & Verification (`directives/08_audit_and_security.md`)**
  - [x] Immutable access audit log
  - [x] Patient-facing access history view
  - [x] Security hardening and automated test suite (`execution/verify_backend_api.py`)
  - [x] End-to-end verification passed (16/16 checkpoints green)

- [x] **Phase 9: UI/UX Pro Max Revamp & End-to-End Clinical Verification**
  - [x] Modern frosted healthcare shell with role-segmented navigation
  - [x] Ergonomic rounded-xl/2xl design tokens and true dark/light mode toggle
  - [x] Doctor Encounters with patient selector and reactive Signed History feed
  - [x] Zero-hallucination Clinical AI Copilot with multi-format briefs & focus controls
  - [x] Patient Health Records timeline with multi-category filtering
  - [x] Diagnostic Lab testing queue and NABL ISO 15189 verified reports archive
  - [x] Phase 5 automated workflow verification (8/8 PASS)
  - [x] Browser automation walkthrough recorded and verified

- [x] **Phase 10: Zero-Break Resilience & AI Copilot Restoration**
  - [x] Diagnosed backend runner crash and started FastAPI daemon on port 8000 via `uv run uvicorn`
  - [x] Hoisted demo datasets to top-level module scope, eliminating TDZ `ReferenceError`
  - [x] Seeded default non-empty patient state (4 verified Indian personas)
  - [x] Dual-mode offline/online fallback in `generateAiSummary` and `askAiAssistant`
  - [x] Horizontal 1-click patient switcher pills in AI Copilot console
  - [x] 6-second auto-reconnect heartbeat synchronization
  - [x] SNOMED CT search parsing normalization
  - [x] In-browser validation of AI briefs, quick clinical questions, and persona switching
