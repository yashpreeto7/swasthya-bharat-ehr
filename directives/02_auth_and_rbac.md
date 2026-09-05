# Directive 02: Authentication & Role-Based Access Control (RBAC)

## Goal
Implement secure authentication and resource-level authorization for MedIndia HealthOS:
- JWT tokens with configurable expiration
- Password hashing using bcrypt / argon2
- Strict RBAC: `PATIENT`, `DOCTOR`, `LAB`
- Resource-level authorization guards preventing unauthorized horizontal/vertical privilege escalation

## Inputs & Prerequisites
- User and role database tables
- `JWT_SECRET_KEY` and `JWT_ALGORITHM` in `.env`
- FastAPI dependency injection pipeline

## Execution Steps
1. **User Models & Schemas**:
   - Create `User` model with `email`, `hashed_password`, `role`, `is_active`, `full_name`.
   - Link `User` to `PatientProfile`, `PractitionerProfile`, or `LabProfile`.
2. **Security Utilities**:
   - `get_password_hash()`, `verify_password()`.
   - `create_access_token(data, expires_delta)`.
3. **FastAPI Auth Dependencies**:
   - `get_current_user`: extracts and validates JWT from Authorization Bearer header.
   - `require_role(role)`: asserts token role matches allowed roles.
   - `verify_patient_access(patient_id, current_user, db)`:
     - If user is PATIENT: can only access their own record.
     - If user is DOCTOR: must have an active valid Consent record for `patient_id`.
     - If user is LAB: can only access lab orders assigned to their lab.
4. **Auth Endpoints**:
   - `POST /api/v1/auth/register` (register as Patient/Doctor/Lab)
   - `POST /api/v1/auth/login` (returns Bearer JWT and user profile)
   - `GET /api/v1/auth/me` (current authenticated context)

## Scripts Used
- `execution/test_auth_rbac.py` — Tests JWT lifecycle, role gates, and unauthorized access attempts.

## Outputs & Deliverables
- Fully working authentication system with token issue, verification, and role gating.

## Edge Cases & Learnings
- Role mismatch must immediately yield 403 Forbidden with clear diagnostic message.
- Doctors must never bypass consent check when retrieving patient health records.
