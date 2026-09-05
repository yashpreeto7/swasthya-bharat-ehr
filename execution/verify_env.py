#!/usr/bin/env python3
"""
execution/verify_env.py
Deterministic environment verification script for MedIndia HealthOS.
Validates Python, Node, npm, Docker, and .env configuration.
"""

import sys
import os
import shutil
import subprocess
import json
from pathlib import Path

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return res.returncode == 0, res.stdout.strip()
    except Exception as e:
        return False, str(e)

def main():
    root_dir = Path(__file__).resolve().parent.parent
    os.chdir(root_dir)

    report = {
        "status": "PASS",
        "checks": {},
        "warnings": []
    }

    # 1. Python version check
    py_ver = sys.version_info
    py_str = f"{py_ver.major}.{py_ver.minor}.{py_ver.micro}"
    if py_ver.major == 3 and py_ver.minor >= 10:
        report["checks"]["python"] = {"status": "OK", "version": py_str}
    else:
        report["checks"]["python"] = {"status": "FAIL", "version": py_str, "detail": "Python 3.10+ required"}
        report["status"] = "FAIL"

    # 2. Node.js check
    node_ok, node_ver = run_cmd("node --version")
    if node_ok:
        report["checks"]["node"] = {"status": "OK", "version": node_ver}
    else:
        report["checks"]["node"] = {"status": "FAIL", "detail": "Node.js not detected"}
        report["status"] = "FAIL"

    # 3. npm check
    npm_ok, npm_ver = run_cmd("npm --version")
    if npm_ok:
        report["checks"]["npm"] = {"status": "OK", "version": npm_ver}
    else:
        report["checks"]["npm"] = {"status": "FAIL", "detail": "npm not detected"}
        report["status"] = "FAIL"

    # 4. Docker check
    docker_ok, docker_ver = run_cmd("docker --version")
    if docker_ok:
        report["checks"]["docker"] = {"status": "OK", "version": docker_ver}
    else:
        report["checks"]["docker"] = {"status": "WARN", "detail": "Docker CLI not detected (optional for direct local development)"}
        report["warnings"].append("Docker not detected. Local SQLite fallback will be available.")

    # 5. Check .env file
    env_file = root_dir / ".env"
    if env_file.exists():
        report["checks"]["env_file"] = {"status": "OK", "path": str(env_file)}
    else:
        report["checks"]["env_file"] = {"status": "WARN", "detail": ".env missing, should copy from .env.example"}
        report["warnings"].append(".env file not found.")

    # 6. Check directory structure
    dirs = ["directives", "execution", ".tmp", ".agents"]
    dir_status = {}
    for d in dirs:
        dir_path = root_dir / d
        dir_status[d] = "EXISTS" if dir_path.exists() and dir_path.is_dir() else "MISSING"
    report["checks"]["directories"] = dir_status

    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "PASS" else 1

if __name__ == "__main__":
    sys.exit(main())
