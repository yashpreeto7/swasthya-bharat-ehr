# Directive 06: Patient Reminders & Notification System

## Goal
Implement a first-class, extensible patient notification and reminder subsystem:
- Appointment reminders
- Medication intake reminders
- Lab test reminders
- Lab report available notifications
- Follow-up consultation reminders
- In-app notification center for Patients and Doctors

## Inputs & Prerequisites
- `Notification` and `Reminder` database models
- Background worker / scheduler loop (extensible towards Redis/Celery/BullMQ)

## Execution Steps
1. **Data Model**:
   - Fields: `id`, `user_id`, `patient_id`, `type` (`MEDICATION`, `APPOINTMENT`, `LAB_TEST`, `LAB_RESULT_AVAILABLE`, `FOLLOW_UP`), `title`, `message`, `scheduled_time`, `status` (`SCHEDULED`, `SENT`, `DISMISSED`), `channel` (`IN_APP`, `SMS`, `EMAIL`).
2. **Scheduler Service**:
   - Lightweight async scheduler checking pending reminders due for delivery.
   - Dispatches notification to patient's in-app inbox and logs simulated dispatch to SMS/Email.
3. **Notification APIs**:
   - `GET /api/v1/notifications` (list recent notifications for current user)
   - `POST /api/v1/notifications/{id}/read` (mark notification as read)
   - `POST /api/v1/reminders/schedule` (schedule a custom or protocol-driven reminder)
4. **UI Notification Center**:
   - Real-time badge counter, dropdown notification drawer, and filterable reminder list.

## Scripts Used
- `execution/trigger_reminders.py` — Deterministically evaluates due reminders and generates notifications.

## Outputs & Deliverables
- Working background reminder pipeline with API and frontend notification center.

## Edge Cases & Learnings
- Do not block user request threads with notification generation; use async event dispatching.
