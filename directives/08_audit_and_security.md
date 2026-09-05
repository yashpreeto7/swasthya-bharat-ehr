# Directive 08: Audit Logging & Security Controls

## Goal
Implement auditable logging and healthcare-grade security controls across all sensitive operations:
- Immutable audit log tracking actor, role, patient, action, timestamp, consent ID, purpose, and result
- Secure password hashing (bcrypt / passlib) and JWT verification
- Prevention of sensitive health data leakage into standard server logs
- Centralized exception and error handling preventing stack trace leakage
- Comprehensive end-to-end automated testing for RBAC, consent bypass prevention, and FHIR validation

## Inputs & Prerequisites
- `AuditLog` database model
- FastAPI dependency injection pipeline
- Audit logging utility `app/core/audit_logger.py`

## Execution Steps
1. **Audit Log Data Model**:
   - Fields: `id`, `actor_id`, `actor_role`, `patient_id`, `action` (e.g., `VIEW_HEALTH_RECORD`, `VIEW_LAB_RESULT`, `CREATE_ENCOUNTER`, `GRANT_CONSENT`, `REVOKE_CONSENT`), `consent_id` (nullable), `purpose` (nullable), `status` (`SUCCESS`, `DENIED`), `ip_address`, `timestamp`.
2. **Audit Logging Service**:
   - `log_security_event(...)`: Appends immutable audit entry on sensitive accesses (doctor viewing record, lab submitting results, patient granting/revoking consent).
3. **Security Middleware & Protections**:
   - Input validation via strict Pydantic v2 schemas.
   - CORS middleware restricted to designated origins.
   - No patient identifiable or clinical information in normal console stdout logs.
4. **Audit APIs**:
   - `GET /api/v1/audit/patient`: Allows patient to see who accessed their records, when, and under which consent.
   - `GET /api/v1/audit/system`: Admin / doctor compliance view.

## Scripts Used
- `execution/verify_audit_trail.py` — Runs a sequence of actions and asserts that audit events are properly emitted with correct actor and consent linkages.

## Outputs & Deliverables
- Fully audited EHR data access logs accessible by patients for radical transparency.

## Edge Cases & Learnings
- Failed unauthorized access attempts must also be logged as `DENIED` events to detect potential security breaches.
