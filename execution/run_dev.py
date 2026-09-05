"""
execution/run_dev.py
Unified development runner for MedIndia HealthOS.
Spawns FastAPI backend (port 8000) and Next.js frontend (port 3000) concurrently.
"""

import sys
import os
import subprocess
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 60)
    print("  MedIndia HealthOS — Launching Development Environment")
    print("=" * 60)

    # 1. Seed demo data if not yet seeded
    seed_cmd = [sys.executable, str(ROOT_DIR / "execution" / "seed_demo_data.py")]
    print("[1/3] Verifying database and demo scenario data...")
    subprocess.run(seed_cmd, cwd=ROOT_DIR)

    # 2. Launch Backend (FastAPI on port 8000)
    backend_cmd = [
        sys.executable, "-m", "uvicorn", "backend.app.main:app",
        "--host", "0.0.0.0", "--port", "8000", "--reload"
    ]
    print("[2/3] Starting FastAPI Backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(backend_cmd, cwd=ROOT_DIR)

    # 3. Launch Frontend (Next.js on port 3000)
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    print("[3/3] Starting Next.js Frontend on http://localhost:3000 ...")
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)

    print("\n" + "=" * 60)
    print("  System Online!")
    print("  - Frontend UI:  http://localhost:3000")
    print("  - Backend API:  http://localhost:8000")
    print("  - API Docs:     http://localhost:8000/docs")
    print("  - FHIR Specs:   http://localhost:8000/api/fhir/Patient/{id}")
    print("  Press Ctrl+C to terminate both servers.")
    print("=" * 60 + "\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
