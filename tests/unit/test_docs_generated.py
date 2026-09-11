"""Guard against the Admin Panel HTML drifting from its Markdown source.

An adversarial audit found that the hand-maintained HTML copies of
CITATIONS.md and DEMO_SCRIPT.md had become *less honest* than the Markdown:
supersession banners dropped, estimates rendered as verified, an open
regulatory-risk section deleted, and the strongest evidence section omitted.

The HTML is now generated. This test fails if someone edits the generated
files by hand, or edits the Markdown without regenerating -- either of which
would let the two drift apart again.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
BUILDER = REPO / "scripts" / "build_docs.py"
GENERATED = [
    REPO / "frontend" / "public" / "citations.html",
    REPO / "frontend" / "public" / "demo_script.html",
]


def test_generated_docs_are_up_to_date() -> None:
    """`build_docs.py --check` must report no stale output."""
    result = subprocess.run(
        [sys.executable, str(BUILDER), "--check"],
        capture_output=True,
        text=True,
        cwd=REPO,
    )
    assert result.returncode == 0, (
        "Generated documentation is out of date with its Markdown source.\n"
        "Run: python3 scripts/build_docs.py\n\n"
        f"{result.stdout}{result.stderr}"
    )


@pytest.mark.parametrize("path", GENERATED, ids=lambda p: p.name)
def test_generated_docs_carry_the_do_not_edit_banner(path: Path) -> None:
    """The banner is the only thing telling a future editor where to work."""
    head = path.read_text(encoding="utf-8")[:600]
    assert "GENERATED FILE - DO NOT EDIT BY HAND" in head
    assert "scripts/build_docs.py" in head


@pytest.mark.parametrize("path", GENERATED, ids=lambda p: p.name)
def test_generated_docs_are_free_of_retracted_figures(path: Path) -> None:
    """Figures the audit retracted must not reappear in a shipped document.

    "$4.5 Billion" is permitted only inside an explicit supersession notice,
    which is how CITATIONS.md records the correction.
    """
    text = path.read_text(encoding="utf-8")

    forbidden = [
        "$3.51B",          # at-risk outflow, superseded by $899.4M
        "2,140",           # unsourced nightly scan count, superseded by 11,099
        "~46 Hours",       # invented absorbed load, superseded by ~15
        "Salesforce FSC",  # console that does not exist
        "Executive Briefing",              # screen that does not exist
        "Select Wealth Advisor",           # button that does not exist
        "Sale Price Slider",               # wrong name, wrong screen
        "AFS Core",        # unevidenced vendor system
        "nCino",           # unevidenced vendor system
        "ACBS",            # unevidenced vendor system
    ]
    found = [token for token in forbidden if token in text]
    assert not found, f"{path.name} contains retracted content: {found}"

    for line in text.splitlines():
        if "$4.5 Billion" in line or "$4.5B" in line:
            assert "Supersedes" in line or "superseded" in line.lower(), (
                f"{path.name}: the retracted $4.5B figure appears outside a "
                f"supersession notice:\n  {line.strip()[:200]}"
            )


def test_preflight_checklist_ships_unchecked() -> None:
    """A checklist that is complete on open asserts a check nobody performed."""
    text = (REPO / "frontend" / "public" / "demo_script.html").read_text(encoding="utf-8")
    assert 'type="checkbox">' in text, "expected pre-flight checkboxes"
    assert "checkbox\" checked" not in text and "checkbox checked" not in text, (
        "pre-flight checkboxes must ship unchecked"
    )
