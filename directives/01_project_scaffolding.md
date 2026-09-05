# Directive 01: Project Scaffolding & Environment Setup

## Goal
Scaffold the foundational modular monolith repository structure for MedIndia HealthOS:
- Backend: FastAPI application with modular architecture (`backend/`)
- Frontend: Next.js + React + TypeScript + Tailwind CSS application (`frontend/`)
- Database: Async SQLAlchemy engine with models and migration support
- Docker: Multi-stage Dockerfile and `docker-compose.yml` for PostgreSQL + backend + frontend
- Root scripts: Unified dev runners and README documentation

## Inputs & Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- `.env` configured with development credentials
- Port availability: Backend (8000), Frontend (3000), PostgreSQL (5432)

## Execution Steps
1. **Environment Verification**:
   - Run `python execution/verify_env.py` to assert Python, Node, npm, and Docker availability.
2. **Backend Structure**:
   - Create `backend/` directory structure:
     ```text
     backend/
     ├── app/
     │   ├── api/
     │   │   ├── v1/
     │   │   │   ├── auth.py
     │   │   │   ├── patients.py
     │   │   │   ├── doctors.py
     │   │   │   ├── labs.py
     │   │   │   ├── encounters.py
     │   │   │   ├── consent.py
     │   │   │   ├── fhir.py
     │   │   │   ├── reminders.py
     │   │   │   ├── ai.py
     │   │   │   └── audit.py
     │   │   └── router.py
     │   ├── core/
     │   │   ├── config.py
     │   │   ├── security.py
     │   │   ├── database.py
     │   │   └── audit_logger.py
     │   ├── models/
     │   ├── schemas/
     │   ├── services/
     │   ├── terminology/
     │   │   └── snomed.py
     │   └── main.py
     ├── requirements.txt
     └── tests/
     ```
3. **Frontend Structure**:
   - Initialize `frontend/` using Next.js with TypeScript and Tailwind CSS.
   - Configure modern healthcare design tokens (slate/indigo/teal clinical palette, glassmorphism, responsive navigation).
4. **Database Scaffolding**:
   - Configure SQLAlchemy models for core entities:
     - `User`, `Patient`, `Practitioner`, `Lab`, `Encounter`, `Condition`, `Prescription`, `LabOrder`, `Observation`, `DiagnosticReport`, `Consent`, `Notification`, `AuditLog`.
5. **Docker Setup**:
   - Provide `docker-compose.yml` defining PostgreSQL 16 container, backend service, and frontend service.
6. **Documentation**:
   - Provide comprehensive root `README.md` detailing architecture, setup steps, and API routes.

## Scripts Used
- `execution/verify_env.py` — Deterministically checks runtime dependencies.
- `execution/init_project.py` — Bootstraps backend and frontend packages.

## Outputs & Deliverables
- Functional FastAPI backend returning `{"status": "healthy", "app": "MedIndia HealthOS"}` on `/api/health`.
- Functional Next.js frontend serving responsive landing page with portal selection (Patient / Doctor / Lab).
- Ready-to-run `docker-compose.yml`.

## Edge Cases & Learnings
- On Windows systems, ensure path separators and background processes are handled cleanly.
- Keep local dev frictionless by supporting SQLite file storage when PostgreSQL is not running locally.
