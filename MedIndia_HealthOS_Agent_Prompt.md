# MedIndia HealthOS — EHR Prototype

## Project Vision

Build a production-quality EHR prototype for a healthcare technology hiring task.

**MedIndia HealthOS** is a modern, secure, consent-driven Electronic Health Record (EHR) platform for India. The system connects patients, doctors, and diagnostic labs while demonstrating:

- ABDM-aligned interoperability
- FHIR R4
- SNOMED CT terminology
- Role-based access control
- Consent-based record sharing
- Auditability
- AI-assisted record understanding
- Patient reminders and notifications

> **Important:** This is a prototype, not an ABDM-certified production system. The goal is to demonstrate sound architecture and understanding of India's digital health ecosystem.

---

## Core Users

1. **Patient**
2. **Doctor**
3. **Laboratory Staff**

---

## 1. Authentication & Authorization

Implement:

- Login/register
- JWT-based authentication
- Role-based access control
- Roles:
  - `PATIENT`
  - `DOCTOR`
  - `LAB`
- Resource-level authorization
- Doctors can only access patients they are authorized to see.
- Labs can only access data required for laboratory workflows.

---

## 2. Patient Dashboard

Patients should be able to:

- View personal profile
- View ABHA/health identifier field
- View complete health timeline
- View diagnoses
- View allergies
- View medications
- View prescriptions
- View laboratory reports
- View appointments
- View previous consultations
- Manage consent
- See who currently has access to their records
- Revoke access where appropriate
- See sharing/access history
- Receive reminders

---

## 3. Doctor Dashboard

Doctors should be able to:

- View authorized patients
- Search/select a patient
- View the patient's longitudinal health timeline
- View consultations/encounters
- Record diagnoses
- Record symptoms/clinical findings
- Record prescriptions
- Order laboratory tests
- View lab results
- Add clinical notes
- See relevant patient history
- Use AI to generate a concise clinical summary
- Ask questions about the patient's history using grounded retrieval from the EHR

AI responses must clearly reference the underlying records used and must not invent medical history.

---

## 4. Lab Dashboard

Lab staff should be able to:

- View authorized lab orders
- See required patient/lab-order information
- Update test status
- Submit laboratory results
- Generate/store `DiagnosticReport` and `Observation`-style data
- Trigger notification when results are available

---

## 5. Consent System — Very Important

Consent is a major part of the application.

A patient should be able to grant access to a doctor for:

- Specific records or record categories
- A specific purpose
- A specific duration/expiry

### Example

A patient grants Doctor A access to laboratory reports and medical history for 30 days for a consultation.

The system should:

- Store consent
- Check consent before protected record access
- Allow revocation
- Track consent history
- Create audit logs for access

> Do not implement consent as only a UI checkbox. It must actually affect backend authorization.

---

## 6. Patient Reminders

Implement reminders as a first-class feature.

### Reminder Types

- Appointment reminder
- Medication reminder
- Lab test reminder
- Lab result available notification
- Follow-up appointment reminder

### Prototype Architecture

```text
EVENT
  ↓
SCHEDULER
  ↓
REMINDER SERVICE
  ↓
EMAIL / PUSH / SMS
```

For the prototype, cron/background jobs are acceptable.

Keep the architecture extensible so production can later use Redis, Celery, BullMQ, or another durable job queue.

Users should have a notification/reminder center showing upcoming and sent reminders.

---

## 7. ABDM / FHIR Interoperability

Design the backend so internal database models are separate from interoperability models.

### Target

**ABDM-aligned FHIR R4 architecture**

### Important FHIR Resources

Support or map toward:

- `Patient`
- `Practitioner`
- `Encounter`
- `Observation`
- `DiagnosticReport`
- `Condition`
- `MedicationRequest`
- `Appointment`
- `AllergyIntolerance`
- `Consent`

Create a FHIR adapter/mapping layer.

### Example Mappings

```text
Internal Patient
    ↓
FHIR Patient

Internal LabResult
    ↓
FHIR Observation / DiagnosticReport

Internal Diagnosis
    ↓
FHIR Condition

Internal Prescription
    ↓
FHIR MedicationRequest
```

### API Structure

Expose a clean API structure such as:

```text
/api/fhir/Patient
/api/fhir/Practitioner
/api/fhir/Encounter
/api/fhir/Observation
/api/fhir/DiagnosticReport
/api/fhir/Condition
/api/fhir/MedicationRequest
/api/fhir/Appointment
/api/fhir/Consent
```

The implementation does **not** need to be a complete ABDM integration. Focus on demonstrating correct architectural thinking and FHIR-compatible data representation.

---

## 8. SNOMED CT

Use SNOMED CT concepts where clinically appropriate instead of relying only on arbitrary diagnosis strings.

### Example

Instead of:

```json
{
  "diagnosis": "Diabetes"
}
```

Conceptually use:

```json
{
  "code": "...",
  "system": "SNOMED CT",
  "display": "Diabetes mellitus"
}
```

Build the data model so standardized clinical terminology can be used.

> **Do not invent SNOMED CT codes.** If actual codes are not available in the project, create a terminology abstraction/interface and use clearly marked demo/test concepts rather than pretending arbitrary numbers are valid SNOMED codes.

---

## 9. AI Features

AI is an assistant over the patient's existing EHR data, **not an autonomous doctor**.

### A. Clinical Summary

Generate a summary containing relevant:

- Medical history
- Diagnoses
- Medications
- Allergies
- Recent labs
- Encounters

Ground the output in actual records.

### B. Ask Patient History

Example questions:

```text
What were the patient's recent lab results?
When was the patient's last consultation?
What medications were prescribed recently?
```

Use RAG/retrieval over EHR data.

### C. Lab Report Explanation

Allow AI to explain laboratory values in simple language.

Clearly state that this is informational and not a diagnosis.

### AI Architecture

Keep the AI architecture provider/model agnostic.

Do not hard-code the entire system around one model provider.

---

## 10. Audit Logging

Every sensitive action should be auditable.

Track:

- Who accessed a record
- Which patient
- What action was performed
- When it happened
- Actor role
- Purpose, if applicable
- Consent used
- Success/failure

### Example

```json
{
  "actorId": "...",
  "actorRole": "DOCTOR",
  "patientId": "...",
  "action": "VIEW_LAB_RESULT",
  "timestamp": "...",
  "consentId": "..."
}
```

---

## 11. Security

Implement:

- Password hashing
- JWT authentication
- RBAC
- Resource-level authorization
- Consent checks
- Input validation
- API validation
- Secure secrets through environment variables
- Audit logs
- No sensitive information in normal application logs
- Proper error handling

Do not claim HIPAA or ABDM compliance. This is a prototype demonstrating security architecture.

---

## 12. Database

Prefer **PostgreSQL** for the core EHR because the data is highly relational.

### Core Entities

```text
User
Patient
Doctor / Practitioner
Lab
Encounter
Diagnosis / Condition
Allergy
Medication
Prescription
Appointment
LabOrder
Observation
DiagnosticReport
Consent
Notification
AuditLog
```

Use foreign keys and proper relationships.

### AI / RAG

Use a vector database such as **Qdrant** if required.

Structured PostgreSQL queries remain the source of truth.

Vector search is only for semantic retrieval.

---

## 13. Architecture

Start with a **modular monolith** instead of unnecessarily creating many microservices.

### Backend Modules

```text
auth/
patients/
practitioners/
encounters/
appointments/
labs/
prescriptions/
consent/
notifications/
audit/
fhir/
ai/
```

Keep modules cleanly separated so they can later become independent services if required.

---

## 14. Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy

### Database

- PostgreSQL

### AI / RAG

- OpenRouter or configurable LLM provider
- Qdrant if needed

### Background Jobs

Start with scheduled/background jobs.

Keep an abstraction for Redis/Celery/BullMQ-style production queues later.

### Authentication

- JWT

### Infrastructure

- Docker
- AWS-ready configuration

---

## 15. UI / UX

The UI should look like a serious healthcare product, not a generic CRUD dashboard.

Use:

- Clean medical dashboard
- Clear information hierarchy
- Patient timeline
- Doctor workspace
- Lab workflow
- Consent management page
- Notification center
- Audit/access history

Avoid unnecessary visual complexity.

Focus on usability and clarity.

---

## 16. End-to-End Demo Flow

The final application should support this demonstration:

1. Patient registers/logs in.
2. Patient profile and health record exist.
3. Doctor logs in.
4. Doctor selects an authorized patient.
5. Doctor views patient history.
6. Doctor creates an encounter.
7. Doctor records a diagnosis using standardized terminology.
8. Doctor prescribes medication.
9. Doctor orders a lab test.
10. Lab logs in and sees the authorized lab order.
11. Lab submits the result.
12. Patient receives a notification.
13. Patient views the lab report.
14. Patient grants a doctor access through the consent system.
15. Doctor can access the authorized information.
16. Doctor asks the AI about the patient's history.
17. AI retrieves relevant records and provides a grounded response.
18. The access appears in the audit log.
19. Appointment, medication, or follow-up reminders are generated.

---

## 17. Development Approach

Before writing large amounts of code:

1. Inspect the existing repository.
2. Determine whether a project already exists.
3. Create a clean monorepo/project structure if necessary.
4. Create `README.md`.
5. Create architecture documentation.
6. Create environment configuration.
7. Set up frontend.
8. Set up backend.
9. Set up PostgreSQL.
10. Create database schema/migrations.
11. Implement authentication.
12. Implement role-based authorization.
13. Implement patient/doctor/lab workflows.
14. Implement consent.
15. Implement FHIR mapping.
16. Implement SNOMED terminology abstraction.
17. Implement reminders/notifications.
18. Implement audit logging.
19. Implement AI/RAG.
20. Add tests.
21. Add Docker setup.
22. Make the project runnable locally with a simple command.

Do not over-engineer prematurely.

At every stage, prioritize a working end-to-end prototype over unnecessary infrastructure.

---

## 18. Code Quality

Use:

- TypeScript types
- Pydantic schemas
- Proper API separation
- Service/repository patterns where useful
- Environment variables
- Centralized error handling
- Validation
- Consistent naming
- Clear README
- Meaningful comments only where necessary

Avoid:

- Hardcoded secrets
- Massive files
- Duplicate business logic
- Fake security
- Fake compliance claims
- Fake SNOMED codes
- AI responses that invent patient data
- Excessive microservices

---

## 19. First Task

**Do NOT immediately implement every feature.**

First:

1. Inspect the existing repository.
2. Propose the project structure.
3. Identify what already exists.
4. Create the base project structure.
5. Set up frontend + backend + database.
6. Add README with the project vision and architecture.
7. Add environment variable templates.
8. Make sure the initial project runs successfully.

Then proceed incrementally toward the complete EHR prototype.

---

## Final Product Goal

The goal is to create a convincing, technically sound healthcare EHR prototype demonstrating:

> **EHR + ABDM-aligned FHIR + SNOMED CT + Consent + RBAC + Auditability + Patient Reminders + AI/RAG**

Build it as if it will be demonstrated in a technical interview where the interviewer may ask why each architectural decision was made.
