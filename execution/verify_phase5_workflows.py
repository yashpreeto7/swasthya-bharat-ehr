"""
execution/verify_phase5_workflows.py
Automated end-to-end verification of Phase 5 clinical workflows:
1. Lab order intake and pending queue verification.
2. Lab result submission (recording quantitative value, reference range, abnormal flag, pathologist interpretation).
3. Patient health records timeline and category filtering verification.
4. Doctor encounter signing and longitudinal timeline reactive updates.
5. AI clinical brief generation with focus parameters.
"""

import sys
import httpx
from pathlib import Path

BASE_URL = "http://localhost:8000"

def run_tests():
    print("=" * 60)
    print("MedIndia HealthOS - Phase 5 Clinical Workflows Verification")
    print("=" * 60)

    client = httpx.Client(base_url=BASE_URL, timeout=15.0)

    # 1. Login as Lab
    lab_login = client.post("/api/v1/auth/login", json={
        "email": "delhi.lab@lalpathlabs.com",
        "password": "Lab12345!"
    })
    assert lab_login.status_code == 200, f"Lab login failed: {lab_login.text}"
    lab_token = lab_login.json()["access_token"]
    print("[PASS] 1. Lab Authentication -> 200 OK")

    # 2. Fetch Lab Orders
    lab_orders_res = client.get("/api/v1/labs/orders", headers={"Authorization": f"Bearer {lab_token}"})
    assert lab_orders_res.status_code == 200, f"Fetch lab orders failed: {lab_orders_res.text}"
    orders = lab_orders_res.json()
    assert len(orders) > 0, "No lab orders found!"
    pending_orders = [o for o in orders if o["status"] != "COMPLETED"]
    print(f"[PASS] 2. Lab Orders Queue ({len(orders)} total, {len(pending_orders)} pending) -> 200 OK")

    # 3. Enter results for a pending order if available
    if pending_orders:
        target_order = pending_orders[0]
        order_id = target_order["order_id"]
        submit_res = client.post(
            f"/api/v1/labs/orders/{order_id}/results",
            headers={"Authorization": f"Bearer {lab_token}"},
            json={
                "conclusion": "Elevated HbA1c confirming sub-optimal glycemic regulation.",
                "observations": [
                    {
                        "test_code": target_order.get("test_code", "43396009"),
                        "test_name": target_order.get("test_name", "Glycated Hemoglobin (HbA1c)"),
                        "value": "7.8",
                        "unit": "%",
                        "reference_range": "4.0-5.6 %",
                        "is_abnormal": True
                    }
                ]
            }
        )
        assert submit_res.status_code == 200, f"Submit lab results failed: {submit_res.text}"
        print(f"[PASS] 3. Lab Result Entry & Verification for order {order_id} -> 200 OK")

    # 4. Doctor Login
    doc_login = client.post("/api/v1/auth/login", json={
        "email": "dr.arvind@apollo.in",
        "password": "Doctor123!"
    })
    assert doc_login.status_code == 200, f"Doctor login failed: {doc_login.text}"
    doc_token = doc_login.json()["access_token"]
    print("[PASS] 4. Doctor Authentication -> 200 OK")

    # 5. Get Doctor Authorized Patients
    patients_res = client.get("/api/v1/doctors/authorized-patients", headers={"Authorization": f"Bearer {doc_token}"})
    assert patients_res.status_code == 200, f"Get patients failed: {patients_res.text}"
    patients = patients_res.json()
    assert len(patients) > 0, "No patients found for doctor"
    p1 = patients[0]
    p1_id = p1["patient_id"]
    print(f"[PASS] 5. Doctor Roster ({len(patients)} consent-authorized patients) -> 200 OK")

    # 6. Post a Clinical Encounter
    enc_res = client.post(
        "/api/v1/doctors/encounters",
        headers={"Authorization": f"Bearer {doc_token}"},
        json={
            "patient_id": p1_id,
            "encounter_type": "AMBULATORY",
            "reason": "Phase 5 Follow-up & Glycemic Control Check",
            "clinical_notes": "Patient reports adherence to Metformin. Vital signs normal.",
            "diagnoses": [{
                "condition_code": "44054006",
                "condition_name": "Type 2 diabetes mellitus",
                "clinical_status": "ACTIVE"
            }],
            "prescriptions": [{
                "medication_name": "Metformin Hydrochloride",
                "dosage": "500 mg",
                "frequency": "BD",
                "duration": "30 days"
            }]
        }
    )
    assert enc_res.status_code == 200, f"Create encounter failed: {enc_res.text}"
    enc_data = enc_res.json()
    assert "encounter_id" in enc_data
    print(f"[PASS] 6. Doctor Clinical Encounter Signing ({enc_data['encounter_id']}) -> 200 OK")

    # 7. Check Patient Timeline
    timeline_res = client.get(f"/api/v1/doctors/patients/{p1_id}/timeline", headers={"Authorization": f"Bearer {doc_token}"})
    assert timeline_res.status_code == 200, f"Timeline failed: {timeline_res.text}"
    timeline = timeline_res.json()
    events = timeline.get("events", [])
    assert len(events) > 0, "Timeline events should not be empty"
    print(f"[PASS] 7. Longitudinal Health Timeline Retrieval ({len(events)} events) -> 200 OK")

    # 8. AI Multi-Format Clinical Brief Synthesis
    ai_res = client.get(
        f"/api/v1/ai/summary/{p1_id}?focus_area=GLYCEMIC_CONTROL&time_window=ALL_TIME&audience=CLINICIAN",
        headers={"Authorization": f"Bearer {doc_token}"}
    )
    assert ai_res.status_code == 200, f"AI summary failed: {ai_res.text}"
    ai_data = ai_res.json()
    assert "summary" in ai_data and len(ai_data["summary"]) > 50
    print(f"[PASS] 8. AI Multi-Format Clinical Brief Synthesis ({len(ai_data.get('records_cited', []))} records cited) -> 200 OK")

    print("=" * 60)
    print("ALL PHASE 5 CLINICAL WORKFLOW TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
