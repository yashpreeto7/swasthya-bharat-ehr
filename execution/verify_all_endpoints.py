import urllib.request
import json

def run_tests():
    print("Testing API endpoints with seeded credentials...")
    base_url = "http://127.0.0.1:8000"

    # 1. Patient Login & Timeline
    req = urllib.request.Request(
        f"{base_url}/api/v1/auth/login",
        data=json.dumps({"email": "rajesh.sharma@example.in", "password": "Password123!"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        pt_token = json.loads(resp.read().decode())["access_token"]
        print("[OK] Patient login succeeded")

    req = urllib.request.Request(
        f"{base_url}/api/v1/patients/me/timeline",
        headers={"Authorization": f"Bearer {pt_token}"}
    )
    with urllib.request.urlopen(req) as resp:
        tl = json.loads(resp.read().decode())
        events = tl.get("events", [])
        print(f"[OK] Patient timeline returned {len(events)} events")
        for ev in events:
            print(f"   [{ev.get('event_type')}] {ev.get('title')} ({ev.get('timestamp')})")

    # 2. Doctor Login & Directory Patients
    req = urllib.request.Request(
        f"{base_url}/api/v1/auth/login",
        data=json.dumps({"email": "dr.arvind@apollo.in", "password": "Doctor123!"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        doc_token = json.loads(resp.read().decode())["access_token"]
        print("[OK] Doctor login succeeded")

    req = urllib.request.Request(
        f"{base_url}/api/v1/doctors/all-patients",
        headers={"Authorization": f"Bearer {doc_token}"}
    )
    with urllib.request.urlopen(req) as resp:
        patients = json.loads(resp.read().decode())
        print(f"[OK] Doctor directory returned {len(patients)} patients")

    # 3. AI Summary with query params
    if patients:
        pid = patients[0]["patient_id"]
        req = urllib.request.Request(
            f"{base_url}/api/v1/ai/summary/{pid}?focus_area=glycemic_control&time_window=90_days&audience=endocrinologist",
            headers={"Authorization": f"Bearer {doc_token}"}
        )
        with urllib.request.urlopen(req) as resp:
            summary_data = json.loads(resp.read().decode())
            print(f"[OK] AI Summary generated ({len(summary_data.get('records_cited', []))} records cited):")
            print(f"   {summary_data.get('summary')[:120]}...")

    # 4. Lab Technician Login & Lab Orders
    req = urllib.request.Request(
        f"{base_url}/api/v1/auth/login",
        data=json.dumps({"email": "delhi.lab@lalpathlabs.com", "password": "Lab12345!"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        lab_token = json.loads(resp.read().decode())["access_token"]
        print("[OK] Lab login succeeded")

    req = urllib.request.Request(
        f"{base_url}/api/v1/labs/orders",
        headers={"Authorization": f"Bearer {lab_token}"}
    )
    with urllib.request.urlopen(req) as resp:
        orders = json.loads(resp.read().decode())
        print(f"[OK] Lab orders returned {len(orders)} orders")

    # 5. ABDM Discovery & Link Confirm
    req = urllib.request.Request(
        f"{base_url}/api/v1/abdm/hip/discover",
        data=json.dumps({"abha_id": "91-4405-2026-0001"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        disc = json.loads(resp.read().decode())
        print(f"[OK] ABDM Discovery succeeded for patient_id: {disc.get('patient_id')}")

    req = urllib.request.Request(
        f"{base_url}/api/v1/abdm/hip/link/confirm",
        data=json.dumps({"patient_id": disc.get("patient_id"), "otp": "123456"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        link_res = json.loads(resp.read().decode())
        print(f"[OK] ABDM Link confirm result: {link_res.get('status')} - Care contexts linked: {len(link_res.get('care_contexts', []))}")

    print("ALL ENDPOINT VERIFICATIONS PASSED!")

if __name__ == "__main__":
    run_tests()
