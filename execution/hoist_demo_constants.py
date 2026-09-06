"""
execution/hoist_demo_constants.py
Hoists demo constant datasets (DEMO_LAB_REPORTS, DEMO_PATIENT_TIMELINE_EVENTS,
DEMO_PENDING_LAB_ORDERS, sampleAiPrompts, sampleClinicalQnA) to module scope
before Home() to avoid Temporal Dead Zone (TDZ) ReferenceError.
"""

from pathlib import Path

PAGE_PATH = Path("frontend/src/app/page.tsx")

def hoist():
    content = PAGE_PATH.read_text(encoding="utf-8")

    # Locate start of DEMO_LAB_REPORTS
    start_str = "  // ── RICH DEMO LAB REPORTS DATASET (NABL ISO 15189 ACCREDITED) ──"
    # Locate end before return (
    end_str = "  return ("

    start_idx = content.find(start_str)
    end_idx = content.find(end_str)

    if start_idx == -1 or end_idx == -1:
        print(f"Error finding bounds: start_idx={start_idx}, end_idx={end_idx}")
        return

    demo_block = content[start_idx:end_idx]

    # Remove demo_block from inside Home()
    content = content[:start_idx] + "\n" + content[end_idx:]

    # Place demo_block right before export default function Home()
    home_decl = "export default function Home() {"
    content = content.replace(
        home_decl,
        f"{demo_block}\n\n{home_decl}"
    )

    PAGE_PATH.write_text(content, encoding="utf-8")
    print("Successfully hoisted demo datasets to module scope!")

if __name__ == "__main__":
    hoist()
