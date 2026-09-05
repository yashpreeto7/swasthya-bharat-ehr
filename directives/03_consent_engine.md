# Directive 03: Consent Management Engine

## Goal
Implement a first-class, ABDM-aligned consent management system that controls access to sensitive EHR records:
- Specific doctor recipient
- Specific record categories (e.g. `DIAGNOSTIC_REPORT`, `PRESCRIPTION`, `CONDITION`, `ALL_RECORDS`)
- Specific purpose (e.g. `CONSULTATION`, `SECOND_OPINION`, `EMERGENCY`)
- Time-bounded duration (valid from/to with automatic expiration)
- Real-time patient revocation mechanism
- Mandatory backend access enforcement (not just a UI checkbox)

## Inputs & Prerequisites
- `Consent` database table with status (`REQUESTED`, `GRANTED`, `REVOKED`, `EXPIRED`)
- `AuditLog` table for tracking consent grant, access evaluation, and revocation
- Doctor and Patient IDs

## Execution Steps
1. **Consent Data Model**:
   - Fields: `id`, `patient_id`, `doctor_id`, `purpose`, `categories` (JSON array), `status`, `valid_from`, `valid_to`, `created_at`, `revoked_at`.
2. **Consent Gating Middleware / Dependency**:
   - `check_doctor_patient_consent(doctor_id, patient_id, category)`:
     - Query active consents where `doctor_id == current_user.doctor_id` AND `patient_id == target_patient_id` AND `status == 'GRANTED'`.
     - Check `valid_from <= now <= valid_to`.
     - Check `category in consent.categories or 'ALL_RECORDS' in consent.categories`.
     - If not found or expired -> raise 403 Forbidden ("Consent required to view records").
3. **Consent APIs**:
   - `POST /api/v1/consent/grant` (patient creates/grants consent)
   - `POST /api/v1/consent/{consent_id}/revoke` (patient immediately revokes consent)
   - `GET /api/v1/consent/patient` (patient views all granted/historical consents)
   - `GET /api/v1/consent/doctor` (doctor views consents granted to them)
4. **Audit Integration**:
   - Every time a doctor accesses a record using consent, record an audit event linking `consent_id`.

## Scripts Used
- `execution/test_consent_enforcement.py` — Simulates doctor querying patient record with no consent, valid consent, expired consent, and revoked consent.

## Outputs & Deliverables
- Functional consent engine enforcing data isolation.

## Edge Cases & Learnings
- When consent is revoked, any cached tokens or doctor sessions must immediately fail subsequent queries.
- Expiration check must use timezone-aware UTC timestamps.
