# Execution Scripts

Deterministic Python scripts that handle the actual work for MedIndia HealthOS per the 3-Layer Architecture in `Agents.md`.

## Principles
- **Reliable**: Scripts produce deterministic output for identical input.
- **Testable**: Each script can be run independently via CLI (`python execution/<script>.py`).
- **Self-Annealing**: When an execution script fails, inspect the stack trace, fix the script, re-test, and update the associated directive.
- **Structured Output**: Print JSON/structured reports to stdout; diagnostic logs to stderr.
- **Safe Secrets**: Always read configuration and keys from `.env` using `python-dotenv` or `os.environ`.

## Execution Scripts Index

- `verify_env.py` — Deterministically checks runtime tools (Python, Node, npm, Docker) and configuration.
- `init_project.py` — Scaffolds the modular monolith backend and Next.js frontend.
- `seed_demo_data.py` — Populates realistic clinical scenarios (patients, doctors, labs, records, SNOMED codes, consents).
- `run_dev.py` — Starts backend and frontend development servers.
- `test_suite.py` — Runs backend unit tests, consent verification, and FHIR schema validation.
