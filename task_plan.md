# Task Plan: MedIndia HealthOS EHR Prototype

## Status Summary
- **Current Phase**: Phase 0 Complete -> Ready for Phase 1 (Project Scaffolding)
- **Active Goals**:
  1. Complete project scaffolding (FastAPI backend + Next.js frontend + SQLite/PostgreSQL database)
  2. Implement core authentication and RBAC
  3. Implement consent-gated backend authorization
  4. Implement ABDM FHIR R4 mapping & SNOMED CT terminology

## User Intent & Requirements
- Build a production-grade EHR prototype for India based on `MedIndia_HealthOS_Agent_Prompt.md`.
- Operate strictly within the 3-Layer Architecture defined in `Agents.md`.
- Prioritize working end-to-end prototype, modular monolith backend, clean modern medical UI, grounded AI copilot, and robust consent gating.

## Phase Breakdown

### Phase 0: System & Architecture Instantiation [DONE]
- [x] Instantiate `Agents.md` 3-layer architecture (`directives/`, `execution/`, `.tmp/`, `.env`)
- [x] Install 22 specialized agent skills from `PERSONALAGENT` into `.agents/skills`
- [x] Create `.gitignore` and `.env.example`
- [x] Implement deterministic environment verification script (`execution/verify_env.py`)
- [x] Initialize git repository

### Phase 1: Modular Monolith Scaffolding [NEXT]
- [ ] Create FastAPI backend with modular structure: `auth`, `patients`, `doctors`, `labs`, `encounters`, `consent`, `fhir`, `reminders`, `ai`, `audit`
- [ ] Create Next.js 14+ frontend with Tailwind CSS and medical design tokens
- [ ] Configure async SQLAlchemy database models and migrations
- [ ] Create `docker-compose.yml` for PostgreSQL + backend + frontend
- [ ] Verify health endpoints

### Phase 2: Authentication & RBAC
- [ ] JWT authentication with bcrypt password hashing
- [ ] Patient, Doctor, Lab roles and route guards
- [ ] Resource-level access policies

### Phase 3: Consent Management Engine
- [ ] Consent data model with purpose, category, and time-window
- [ ] Consent-gated authorization dependency in FastAPI
- [ ] Patient consent management and access revocation UI

### Phase 4: FHIR R4 & SNOMED CT Terminology
- [ ] FHIR R4 resource mapper (`Patient`, `Condition`, `Observation`, `DiagnosticReport`, etc.)
- [ ] SNOMED CT concept catalog and validation abstraction
- [ ] `/api/fhir/*` endpoints

### Phase 5: Clinical Workflows
- [ ] Patient timeline view
- [ ] Doctor encounter and prescription workspace
- [ ] Lab order processing and result entry

### Phase 6: Patient Reminders & Notification Subsystem
- [ ] Multi-channel reminder scheduler (appointments, medications, lab results)
- [ ] In-app notification center

### Phase 7: AI Clinical Copilot & Grounded RAG
- [ ] Concise clinical summaries with record ID citations
- [ ] Grounded Q&A over patient medical history
- [ ] Patient-friendly lab report explainer

### Phase 8: Audit Logging, Security Hardening & End-to-End Testing
- [ ] Immutable audit log of all sensitive patient record accesses
- [ ] Automated integration test suite
- [ ] End-to-end demo flow verification
