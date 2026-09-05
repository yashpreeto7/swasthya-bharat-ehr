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

- [ ] **Phase 1: Project Scaffolding & Core Architecture (`directives/01_project_scaffolding.md`)**
  - [ ] Initialize modular monolith FastAPI backend (`backend/app/`)
  - [ ] Initialize Next.js 14+ frontend with Tailwind CSS (`frontend/`)
  - [ ] Set up async SQLAlchemy database engine (PostgreSQL + SQLite dev fallback)
  - [ ] Add Docker Compose setup (`docker-compose.yml`)
  - [ ] Add project `README.md` and architecture documentation

- [ ] **Phase 2: Authentication & RBAC (`directives/02_auth_and_rbac.md`)**
  - [ ] User registration, password hashing (bcrypt), and JWT auth
  - [ ] Roles: `PATIENT`, `DOCTOR`, `LAB`
  - [ ] Resource-level authorization dependencies in FastAPI
  - [ ] Login/registration UI portal

- [ ] **Phase 3: Consent Management Engine (`directives/03_consent_engine.md`)**
  - [ ] Consent data model (purpose, categories, duration, validity window)
  - [ ] Backend consent verification dependency for doctor record access
  - [ ] Patient consent management UI (grant, view history, revoke)
  - [ ] Access rejection on missing, expired, or revoked consent

- [ ] **Phase 4: FHIR R4 & SNOMED CT Terminology (`directives/04_fhir_and_snomed.md`)**
  - [ ] ABDM-aligned FHIR R4 resource mapper (`Patient`, `Practitioner`, `Encounter`, `Condition`, `Observation`, `DiagnosticReport`, `MedicationRequest`, `Consent`)
  - [ ] SNOMED CT terminology dictionary and validation abstraction
  - [ ] `/api/fhir/*` interoperability endpoints

- [ ] **Phase 5: Clinical Workflows (`directives/05_clinical_workflows.md`)**
  - [ ] Patient Dashboard: longitudinal health timeline, diagnoses, medications, labs, appointments
  - [ ] Doctor Dashboard: authorized patient selector, encounter notes, SNOMED diagnosis, prescriptions, lab ordering
  - [ ] Lab Dashboard: order queue, test status tracking, numerical/qualitative result entry

- [ ] **Phase 6: Reminders & Notifications (`directives/06_reminders_and_notifications.md`)**
  - [ ] Background reminder dispatcher (appointment, medication, lab result notifications)
  - [ ] Extensible queue architecture
  - [ ] In-app notification center UI

- [ ] **Phase 7: AI Clinical Copilot (`directives/07_ai_clinical_copilot.md`)**
  - [ ] Concise grounded clinical summaries
  - [ ] RAG-powered Q&A over patient history citing record IDs
  - [ ] Patient-friendly lab report explainer with medical disclaimers
  - [ ] Provider-agnostic LLM interface with deterministic local fallback

- [ ] **Phase 8: Audit Logging, Security & Verification (`directives/08_audit_and_security.md`)**
  - [ ] Immutable access audit log
  - [ ] Patient-facing access history view
  - [ ] Security hardening and automated test suite (`execution/test_suite.py`)
  - [ ] End-to-end demo flow walkthrough
