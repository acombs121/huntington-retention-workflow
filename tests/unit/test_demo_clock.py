"""The demo clock: the countdown and the closing date must never disagree.

`days_to_close` used to be a hardcoded integer sitting next to a hardcoded
closing date. Those two agreed on exactly one day -- 2026-09-04 -- and the
moment the wall clock passed it the demo began asserting a countdown its own
dates contradicted. After 2026-09-16 the flagship would have been closing "in
12 days" in the past.

These tests pin the three properties that make the re-base safe: it is an
allow-list, it is exact, and it leaves live timestamps alone.
"""
from __future__ import annotations

from datetime import date, timedelta

import pytest

from domain.demo_clock import (
    DEMO_EPOCH,
    TRANSACTION_DATE_OFFSETS,
    build_substitutions,
    rebase,
    rebase_fixture,
)


def _fixture() -> dict:
    """A miniature of the real payload: authored dates plus dates that must not move."""
    return {
        "payoff_id": "PO-2026-8821",
        "payoff_statement_date": "2026-08-28",
        "scheduled_closing_date": "2026-09-16",
        "days_to_close": 12,
        "evaluation_timestamp": "2026-09-04T08:14:22Z",
        "docusign_envelope_id": "ENV-HBAN-20260904-8821",
        "observation": "Closing scheduled on September 16, 2026.",
        "borrower_entity": {
            # Neither of these belongs to the transaction. They are facts about
            # the borrower and the note, and a blanket date sweep would corrupt
            # both.
            "filing_date": "2018-04-12",
            "trust": "The Vance 2018 Family Trust",
        },
        "sba_note": {"Maturity": "2029-05-15"},
    }


def test_offset_table_is_internally_consistent() -> None:
    """The `assert` guard inside build_substitutions must hold for every entry.

    If someone edits a date string without editing its offset, the table stops
    describing the fixtures and the re-base silently produces the wrong day.
    """
    for iso, offset in TRANSACTION_DATE_OFFSETS.items():
        assert (DEMO_EPOCH + timedelta(days=offset)).isoformat() == iso

    # And the guard actually fires when the table is wrong.
    import domain.demo_clock as clock

    original = dict(clock.TRANSACTION_DATE_OFFSETS)
    clock.TRANSACTION_DATE_OFFSETS["2026-09-16"] = 13
    try:
        with pytest.raises(AssertionError):
            build_substitutions(DEMO_EPOCH + timedelta(days=1))
    finally:
        clock.TRANSACTION_DATE_OFFSETS.clear()
        clock.TRANSACTION_DATE_OFFSETS.update(original)


def test_on_the_epoch_the_payload_is_returned_untouched() -> None:
    """Zero shift must be a genuine no-op, not a rewrite that happens to match."""
    payload = _fixture()
    assert rebase(payload, today=DEMO_EPOCH) == payload
    assert build_substitutions(DEMO_EPOCH) == {}


@pytest.mark.parametrize("shift", [1, 8, 12, 45, 365, -3])
def test_the_closing_date_moves_by_exactly_the_shift(shift: int) -> None:
    today = DEMO_EPOCH + timedelta(days=shift)
    out = rebase(_fixture(), today=today)

    closing = date.fromisoformat(out["scheduled_closing_date"])
    assert closing == date(2026, 9, 16) + timedelta(days=shift)

    # The countdown is the point of the exercise: it must still be true today.
    assert out["days_to_close"] == 12
    assert (closing - today).days == out["days_to_close"]

    # Statement date keeps its seven-day lead on the epoch.
    assert date.fromisoformat(out["payoff_statement_date"]) == date(2026, 8, 28) + timedelta(days=shift)


def test_every_spelling_of_a_date_moves_together() -> None:
    """ISO, long form and the compact envelope id are the same day three ways."""
    out = rebase(_fixture(), today=DEMO_EPOCH + timedelta(days=8))
    assert out["scheduled_closing_date"] == "2026-09-24"
    assert "September 24, 2026" in out["observation"]
    assert out["docusign_envelope_id"] == "ENV-HBAN-20260912-8821"
    assert out["evaluation_timestamp"] == "2026-09-12T08:14:22Z"


@pytest.mark.parametrize("shift", [1, 8, 12, 45, 365])
def test_dates_outside_the_allow_list_are_never_rewritten(shift: int) -> None:
    """The entity's formation year and the note's maturity are not transaction dates."""
    out = rebase(_fixture(), today=DEMO_EPOCH + timedelta(days=shift))
    assert out["borrower_entity"]["filing_date"] == "2018-04-12"
    assert out["borrower_entity"]["trust"] == "The Vance 2018 Family Trust"
    assert out["sba_note"]["Maturity"] == "2029-05-15"


def test_live_timestamps_survive_the_rebase() -> None:
    """On eight days a year, today *is* an authored date.

    2026-09-16 is one of them. A letter genuinely written that day would have
    had its own date shifted twelve days into the future -- a document that
    lies about when it was issued. `rebase_fixture` is the guard.
    """
    today = date(2026, 9, 16)
    packet = {
        "date": "September 16, 2026",
        "letter_id": "HBAN-WIRE-1789250251",
        "docusign_envelope_id": "ENV-HBAN-20260904-8821",
    }

    naive = rebase(packet, today=today)
    assert naive["date"] == "September 28, 2026", "precondition: the trap is real"

    guarded = rebase_fixture(packet, live_fields=("letter_id", "date"), today=today)
    assert guarded["date"] == "September 16, 2026"
    assert guarded["letter_id"] == "HBAN-WIRE-1789250251"
    # The authored date inside the envelope id still moves.
    assert guarded["docusign_envelope_id"] == "ENV-HBAN-20260916-8821"


def test_structure_and_non_string_values_are_preserved() -> None:
    out = rebase(_fixture(), today=DEMO_EPOCH + timedelta(days=30))
    assert list(out) == list(_fixture())
    assert isinstance(out["days_to_close"], int)
    assert out["payoff_id"] == "PO-2026-8821"
