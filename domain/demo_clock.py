"""Demo clock.

The dataset was authored for a demo day of 2026-09-04: the flagship deal's
`days_to_close` of 12 is exactly 2026-09-16 minus that date. Every other date
in the fixtures -- title demand receipt, prepayment quote request, exchange
coordination request, DocuSign envelope id -- was written relative to the same
day.

Nothing re-based them, so the countdown was a hardcoded integer sitting next to
a hardcoded date. The moment the wall clock passed 2026-09-04 the two stopped
agreeing, and after 2026-09-16 the flagship would have closed "in 12 days" in
the past. That is the kind of failure that surfaces *as wrong data* in front of
a board rather than as an error anyone would notice in testing.

This module shifts the transaction dates forward so the demo is evergreen:
`days_to_close` stays 12/24/45 and the dates always agree with it.

Deliberately an explicit allow-list, not a regex sweep. Plenty of dates in the
payload must NOT move -- the borrower entity's 2018 formation date, the SBA
note's 2029 maturity, the Ameriprise and SEI announcement dates -- and a
blanket shift would silently corrupt them.
"""
from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from typing import Any, Iterable

# The day the fixtures were written for.
DEMO_EPOCH = date(2026, 9, 4)

# Offsets in days from DEMO_EPOCH. Every entry is a date belonging to the three
# demo transactions; anything not listed here is left exactly as authored.
TRANSACTION_DATE_OFFSETS: dict[str, int] = {
    "2026-09-04": 0,    # demo day / agent evaluation timestamp
    "2026-09-16": 12,   # PO-2026-8821 closing  (days_to_close 12)
    "2026-09-28": 24,   # PO-2026-7492 closing  (days_to_close 24)
    "2026-10-19": 45,   # PO-2026-6104 closing  (days_to_close 45)
    "2026-08-28": -7,   # PO-2026-8821 title payoff demand received
    "2026-08-26": -9,   # PO-2026-8821 borrower prepayment quote request
    "2026-08-18": -17,  # PO-2026-7492 borrower 1031 coordination request
    "2026-08-15": -20,  # PO-2026-7492 title demand
    "2026-08-01": -34,  # PO-2026-6104 title inquiry
}

_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def _long_form(d: date) -> str:
    return f"{_MONTHS[d.month - 1]} {d.day}, {d.year}"


def build_substitutions(today: date | None = None) -> dict[str, str]:
    """Map every authored transaction date to its re-based equivalent.

    Covers the three spellings that appear in the fixtures: ISO `2026-09-16`,
    long form `September 16, 2026`, and the compact `20260904` used inside the
    DocuSign envelope identifier.
    """
    today = today or date.today()
    shift = (today - DEMO_EPOCH).days
    subs: dict[str, str] = {}
    if shift == 0:
        return subs
    for iso, offset in TRANSACTION_DATE_OFFSETS.items():
        authored = DEMO_EPOCH + timedelta(days=offset)
        assert authored.isoformat() == iso, f"offset table drift: {iso}"
        shifted = authored + timedelta(days=shift)
        subs[iso] = shifted.isoformat()
        subs[_long_form(authored)] = _long_form(shifted)
        subs[authored.strftime("%Y%m%d")] = shifted.strftime("%Y%m%d")
    return subs


def _compile(subs: dict[str, str]) -> re.Pattern[str]:
    """One alternation over every authored spelling, longest first."""
    keys = sorted(subs, key=len, reverse=True)
    return re.compile("|".join(re.escape(key) for key in keys))


def _rewrite(text: str, subs: dict[str, str], pattern: re.Pattern[str]) -> str:
    """Substitute in a single pass.

    Sequential str.replace chains: a shift of 12 days turns 2026-09-16 into
    2026-09-28, which is itself an authored date, which a later rule then
    pushed on to 2026-10-10. The flagship ended up 24 days out on a 12-day
    countdown -- the exact failure this module exists to prevent. One pass
    cannot re-match what it has already written.
    """
    return pattern.sub(lambda m: subs[m.group(0)], text)


def rebase(payload: Any, today: date | None = None) -> Any:
    """Return `payload` with every authored transaction date shifted to today's
    frame. Structure, types and key order are preserved; only string values and
    string keys are rewritten.
    """
    subs = build_substitutions(today)
    if not subs:
        return payload
    return _walk(payload, subs, _compile(subs))


def _walk(node: Any, subs: dict[str, str], pattern: re.Pattern[str]) -> Any:
    if isinstance(node, str):
        return _rewrite(node, subs, pattern)
    if isinstance(node, dict):
        return {_walk(k, subs, pattern): _walk(v, subs, pattern) for k, v in node.items()}
    if isinstance(node, list):
        return [_walk(v, subs, pattern) for v in node]
    if isinstance(node, tuple):
        return tuple(_walk(v, subs, pattern) for v in node)
    return node


def rebase_fixture(
    payload: dict[str, Any],
    live_fields: Iterable[str] = (),
    today: date | None = None,
) -> dict[str, Any]:
    """`rebase` for a payload that mixes authored dates with live ones.

    A wall-clock timestamp is indistinguishable from an authored date by string
    matching. On the eight days where today *is* one of the authored dates --
    2026-09-16 is one of them, twelve days after the epoch -- a blind re-base
    would rewrite a genuine "now" into the future and the record would lie
    about when it was written. Fields named here are captured before the walk
    and restored after it.
    """
    preserved = {key: payload[key] for key in live_fields if key in payload}
    rebased = rebase(payload, today)
    rebased.update(preserved)
    return rebased


def today_iso(today: date | None = None) -> str:
    return (today or date.today()).isoformat()


def now_iso(moment: datetime | None = None) -> str:
    return (moment or datetime.utcnow()).replace(microsecond=0).isoformat() + "Z"
