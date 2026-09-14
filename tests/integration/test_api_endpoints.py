"""
Integration Tests for Huntington Book Scout FastAPI Endpoints
Verifies multi-deal valuation, entity resolution, wire instructions, and GLBA quarantine gate.
"""
import json
from datetime import date, datetime, timedelta, timezone

import pytest
from starlette.testclient import TestClient

from main import app, detected_tax_strategy, resolve_tax_strategy

client = TestClient(app)


def log_call(payoff_id: str, client_directed_proceeds: bool = True):
    """Satisfy Gate 1.

    Cross-LOB consent is refused unless a consultative call has been logged
    against the deal, so every test that records consent has to place the call
    first. Returns the resulting compliance record.
    """
    resp = client.post("/api/consultative-call", json={
        "payoff_id": payoff_id,
        "call_completed": True,
        "client_directed_proceeds": client_directed_proceeds,
        "recorded_by": "Greg Miller (Commercial RM)",
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


def reset_deal(payoff_id: str):
    """Clear a deal's workflow record.

    Quarantine state is an in-memory dict shared across the whole session, so a
    test that logs a call or dispatches a packet has to put it back or it leaks
    into unrelated tests. Retracting the call cascades and resets everything.
    """
    client.post("/api/consultative-call", json={
        "payoff_id": payoff_id,
        "call_completed": False,
    })


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "huntington-book-scout"
    assert data["version"] == "6.0.0"


def test_version_alignment():
    """Asserts app.version == /api/health version == package.json version."""
    from pathlib import Path
    package_json_path = Path(__file__).resolve().parents[2] / "frontend" / "package.json"
    with open(package_json_path, "r", encoding="utf-8") as f:
        pkg_data = json.load(f)
    package_version = pkg_data["version"]

    response = client.get("/api/health")
    assert response.status_code == 200
    health_version = response.json()["version"]

    assert app.version == health_version == package_version == "6.0.0"


def test_valuation_default_vance_deal():
    response = client.post("/api/valuation", json={
        "payoff_id": "PO-2026-8821",
        "sale_price": 8500000.00,
        "noi": 637500.00,
        "cap_rate": 0.075,
        "debt_payoff": 5214800.00,
        "closing_cost_rate": 0.045,
        "tax_strategy": "cash_out"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["sale_price"] == 8500000.00
    assert data["net_equity_proceeds"] == 2902700.00
    assert "Business Premier" in data["strategy_product"]



def test_valuation_buckeye_tooling_sub_7m():
    """Verifies that non-Vance deals below $7M (e.g. $3.15M) pass validation and calculate accurately."""
    response = client.post("/api/valuation", json={
        "payoff_id": "PO-2026-7492",
        "sale_price": 3150000.00,
        "noi": 245700.00,
        "cap_rate": 0.078,
        "debt_payoff": 1420000.00,
        "closing_cost_rate": 0.045,
        "tax_strategy": "1031_exchange"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["sale_price"] == 3150000.00
    # 3,150,000 - 1,420,000 - (3,150,000 * 0.045 = 141,750) = 1,588,250
    assert data["net_equity_proceeds"] == 1588250.00
    assert "1031" in data["strategy_type"]


def test_entity_resolution_multi_deal_parameterization():
    """Verifies entity resolution returns borrower-specific topology, DLP status, and non-guarantor exclusion."""
    # Vance Riverfront Properties (PO-2026-8821)
    resp_vance = client.get("/api/entity-resolution?payoff_id=PO-2026-8821")
    assert resp_vance.status_code == 200
    data_v = resp_vance.json()
    assert data_v["borrower_entity"]["name"] == "Vance Riverfront Properties IV, LLC"
    assert "PASSED" in data_v["dlp_status"]
    assert "GLBA § 501(b)" in data_v["dlp_status"]
    
    elena = next(m for m in data_v["grounded_members"] if m["name"] == "Elena Vance")
    assert elena["is_guarantor"] is False
    assert "Excluded from Wealth Profiling" in elena["exclusion_status"]

    marcus = next(m for m in data_v["grounded_members"] if m["name"] == "Marcus Vance")
    assert marcus["is_guarantor"] is True
    assert marcus["exclusion_status"] == "Included / Full Commercial Profiling"

    # Buckeye Precision Tooling (PO-2026-7492)
    resp_buckeye = client.get("/api/entity-resolution?payoff_id=PO-2026-7492")
    assert resp_buckeye.status_code == 200
    data_b = resp_buckeye.json()
    assert data_b["borrower_entity"]["name"] == "Buckeye Precision Tooling Corp."
    assert "PASSED" in data_b["dlp_status"]
    assert any("Arthur Pendelton" in m["name"] and m["exclusion_status"] == "Included / Full Commercial Profiling" for m in data_b["grounded_members"])

    # Scioto Medical (PO-2026-6104)
    resp_scioto = client.get("/api/entity-resolution?payoff_id=PO-2026-6104")
    assert resp_scioto.status_code == 200
    data_s = resp_scioto.json()
    assert data_s["borrower_entity"]["name"] == "Columbus Medical Arts Center LLC"
    assert "PASSED" in data_s["dlp_status"]
    assert any("Dr. Robert Miller" in m["name"] and m["exclusion_status"] == "Included / Full Commercial Profiling" for m in data_s["grounded_members"])


def test_wire_instructions_deal_parameterization():
    """Verifies wire instructions use active deal entity, borrower-directed DocuSign packet, and QI routing.

    This previously asserted ``HBAN-QI-8819-01`` for Buckeye. ``8819`` is the
    suffix of the Vance escrow file at First American, so the assertion was
    locking in a defect: every exchange in the book resolved to one account
    number belonging to a different borrower's title order. The account number
    is now derived from the payoff id of the deal being settled.
    """
    # 1031 Exchange on Buckeye
    response = client.get("/api/wire-instructions?payoff_id=PO-2026-7492&strategy=1031_exchange&sale_price=3150000.00")
    assert response.status_code == 200
    data = response.json()
    assert "Buckeye Precision Tooling Corp." in data["account_title"]
    assert "HBAN-QI-7492-01" == data["account_number"]
    # The packet is signed by the seller, so it carries a destination and an
    # unfilled election -- never a bank-computed proceeds figure.
    assert "indicative_net_disbursement" not in data
    assert "seller" in data["amount_election_note"].lower()
    assert any("all net seller proceeds" in o.lower() for o in data["amount_election_options"])
    assert data["borrower_directed_packet"] is True
    assert "Borrower Settlement Routing Packet" in data["packet_type"]
    assert data["callback_verification_line"] == "(614) 480-4401 (Direct Banker Authentication Line)"
    # Composing a packet does not dispatch one, so no envelope exists yet.
    assert data["docusign_envelope_id"] is None
    assert data["independent_qi_partner"] == "IPX1031 (Investment Property Exchange Services, Inc.)"


    # Cash-Out on Vance
    vance_wire = client.get("/api/wire-instructions?payoff_id=PO-2026-8821&strategy=cash_out&sale_price=8500000.00")
    assert vance_wire.status_code == 200
    vw_data = vance_wire.json()
    assert vw_data["account_number"] == "HBAN-ICS-8821-00"
    assert vw_data["borrower_directed_packet"] is True
    assert vw_data["independent_qi_partner"] is None

    # Omitting the strategy falls back to the strategy the detection layer
    # concluded for that deal, not to a global cash-out default. Buckeye is
    # detected as an exchange, so the escrow route must survive the omission.
    buckeye_default = client.get("/api/wire-instructions?payoff_id=PO-2026-7492&sale_price=3150000.00")
    assert buckeye_default.status_code == 200
    assert buckeye_default.json()["account_number"] == "HBAN-QI-7492-01"

    # Vance is detected as "Taxable Cash-Out (1031 Eligible)". Eligibility is
    # not election: the substring "1031" appears in that label, and a naive
    # match would route the flagship cash-out deal into a qualified escrow.
    vance_default = client.get("/api/wire-instructions?payoff_id=PO-2026-8821&sale_price=8500000.00")
    assert vance_default.status_code == 200
    assert vance_default.json()["account_number"] == "HBAN-ICS-8821-00"


def test_detected_strategy_seeds_routing_and_is_overridable():
    """The detection layer's conclusion is the default; the banker can override it.

    `tax_strategy_detected` is shown on the pipeline screen, so if routing
    ignores it the screen and the settlement instruction disagree in front of
    the room. Detection seeds the decision. It does not make it: an exchange is
    the taxpayer's election, and a banker who knows the client has abandoned it
    must be able to say so.
    """
    assert detected_tax_strategy("PO-2026-7492") == "1031_exchange"
    assert detected_tax_strategy("PO-2026-8821") == "cash_out"
    assert detected_tax_strategy("PO-2026-6104") == "cash_out"

    # An unknown deal cannot be an exchange on the strength of no evidence.
    assert detected_tax_strategy("PO-9999-0000") == "cash_out"

    # Explicit request wins in both directions.
    assert resolve_tax_strategy("PO-2026-7492", "cash_out") == "cash_out"
    assert resolve_tax_strategy("PO-2026-8821", "1031_exchange") == "1031_exchange"

    # Anything that is not a recognised strategy is treated as "no preference
    # expressed" and falls through to detection, rather than silently routing.
    assert resolve_tax_strategy("PO-2026-7492", None) == "1031_exchange"
    assert resolve_tax_strategy("PO-2026-7492", "") == "1031_exchange"
    assert resolve_tax_strategy("PO-2026-7492", "offshore_haven") == "1031_exchange"

    # And the override survives the round trip through the wire endpoint.
    overridden = client.get(
        "/api/wire-instructions?payoff_id=PO-2026-7492&strategy=cash_out&sale_price=3150000.00"
    )
    assert overridden.status_code == 200
    assert overridden.json()["account_number"] == "HBAN-ICS-7492-00"


def test_valuation_uses_each_deals_own_financials_when_no_overrides_sent():
    """An omitted input must not substitute another borrower's economics.

    `sale_price`, `noi`, `cap_rate` and `debt_payoff` were required fields whose
    defaults were PO-2026-8821's figures, and the handler assigned them onto the
    payoff unconditionally. Asking for Buckeye's valuation therefore returned
    $2,902,700 of net proceeds -- the Vance number -- under Buckeye's name. The
    screen only looked correct because the frontend sends all four every time,
    and its own fallbacks were the same Vance literals.

    Buckeye: NOI $245,700 at a 7.80% cap is a $3,150,000 value; less $1,420,000
    of debt and 4.5% closing costs leaves $1,588,250.
    """
    buckeye = client.post("/api/valuation", json={"payoff_id": "PO-2026-7492"}).json()
    assert buckeye["grounded_noi"] == 245700.00
    assert buckeye["grounded_cap_rate"] == 0.078
    assert buckeye["debt_payoff"] == 1420000.00
    assert buckeye["sale_price"] == 3150000.00
    assert buckeye["estimated_closing_costs"] == 141750.00
    assert buckeye["net_equity_proceeds"] == 1588250.00

    vance = client.post("/api/valuation", json={"payoff_id": "PO-2026-8821"}).json()
    assert vance["net_equity_proceeds"] == 2902700.00

    # Two deals, two answers. A shared default would make these equal.
    assert buckeye["net_equity_proceeds"] != vance["net_equity_proceeds"]

    # Overrides still work -- that is what the sale-price slider sends.
    slid = client.post("/api/valuation", json={
        "payoff_id": "PO-2026-7492",
        "sale_price": 3500000.00,
    }).json()
    assert slid["sale_price"] == 3500000.00
    # The deal's own debt survives an override of an unrelated field.
    assert slid["debt_payoff"] == 1420000.00


def test_valuation_carries_the_exchange_clock_only_for_an_exchange():
    """/api/valuation exposes the 45/180-day deadlines the banker has to act inside.

    Buckeye closes on a date the demo clock rebases into today's frame, so the
    deadlines are asserted as offsets from the closing date the same response
    reports rather than as literals that rot the moment the clock moves.
    """
    buckeye = client.post("/api/valuation", json={"payoff_id": "PO-2026-7492"})
    assert buckeye.status_code == 200
    timeline = buckeye.json()["exchange_timeline"]
    assert timeline is not None

    closing = date.fromisoformat(timeline["relinquished_closing_date"])
    assert date.fromisoformat(timeline["identification_deadline"]) == closing + timedelta(days=45)
    assert date.fromisoformat(timeline["exchange_deadline"]) == closing + timedelta(days=180)
    assert "1031" in timeline["statutory_basis"]
    assert timeline["replacement_financing_owner"]

    # The closing date the timeline is built from must be the one the rest of
    # the app is showing, not the authored fixture date. A deadline derived
    # from a stale closing is not in the demo clock's allow-list, so nothing
    # downstream can correct it.
    queue = client.get("/api/payoffs").json()["payoff_items"]
    listed = next(d for d in queue if d["id"] == "PO-2026-7492")
    assert listed["scheduled_closing_date"] == timeline["relinquished_closing_date"]

    # A taxable sale has no statutory clock.
    vance = client.post("/api/valuation", json={"payoff_id": "PO-2026-8821"})
    assert vance.status_code == 200
    assert vance.json()["exchange_timeline"] is None


def test_call_disposition_names_the_route_the_client_was_offered():
    """The compliance record must not describe constructive receipt on an exchange.

    A single hardcoded ICS sentence recorded that the §1031 borrower directed
    proceeds into a sweep account titled to himself. That is the one act that
    voids the deferral, so the record both misstated the call and documented a
    disqualifying instruction.
    """
    try:
        buckeye = log_call("PO-2026-7492")
        disposition = buckeye["call_disposition"]
        assert "Qualified Escrow" in disposition
        assert "IPX1031" in disposition
        assert "not to pass through any account titled to the borrower" in disposition
        assert "ICS" not in disposition

        vance = log_call("PO-2026-8821")
        assert "Business Premier ICS" in vance["call_disposition"]
        assert "Qualified Escrow" not in vance["call_disposition"]

        # An explicit override is honoured here too: if the banker has switched
        # the deal to a taxable sale, the record must say so.
        reset_deal("PO-2026-7492")
        resp = client.post("/api/consultative-call", json={
            "payoff_id": "PO-2026-7492",
            "call_completed": True,
            "client_directed_proceeds": True,
            "recorded_by": "Greg Miller (Commercial RM)",
            "tax_strategy": "cash_out",
        })
        assert resp.status_code == 200
        assert "Business Premier ICS" in resp.json()["call_disposition"]
    finally:
        reset_deal("PO-2026-7492")
        reset_deal("PO-2026-8821")


def test_glba_quarantine_flow():
    """Verifies GLBA verbal consent recording, genuine SHA-256 audit hash, and deal isolation."""
    # Gate 1 first: consent cannot be recorded against a call that never happened.
    log_call("PO-2026-8821")

    # Record consent for Vance Riverfront deal
    post_resp = client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-8821",
        "verbal_consent_recorded": True,
        "recorded_by": "Greg Miller (Commercial RM)",
        "client_notes": "Test verbal consent."
    })
    assert post_resp.status_code == 200
    vance_data = post_resp.json()
    assert vance_data["quarantined"] is False
    assert vance_data["verbal_consent_recorded"] is True
    assert vance_data["audit_hash"].startswith("SHA256-")
    # Verify the SHA-256 hex digest contains 64 hex characters
    raw_hash = vance_data["audit_hash"].replace("SHA256-", "")
    assert len(raw_hash) == 64
    assert all(c in "0123456789abcdefABCDEF" for c in raw_hash)
    # Recording consent must not discard the Gate 1 record it depends on.
    assert vance_data["call_logged"] is True
    assert vance_data["call_timestamp"] is not None

    # Verify Buckeye Tooling remains quarantined (deal isolation)
    buckeye_resp = client.get("/api/quarantine?payoff_id=PO-2026-7492")
    assert buckeye_resp.status_code == 200
    assert buckeye_resp.json()["quarantined"] is True

    # Reset Vance consent
    reset_resp = client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-8821",
        "verbal_consent_recorded": False
    })
    assert reset_resp.status_code == 200
    assert reset_resp.json()["quarantined"] is True
    # Retracting a wealth referral does not un-ring the phone.
    assert reset_resp.json()["call_logged"] is True

    # Clear Gate 1 so the module's shared state does not leak into other tests.
    client.post("/api/consultative-call", json={
        "payoff_id": "PO-2026-8821", "call_completed": False,
    })


def test_consent_is_refused_before_a_call_is_logged():
    """Gate 2 must be unreachable until Gate 1 is satisfied.

    Enforced server-side rather than by disabling a button: a consent record
    whose only provenance is a clickable control cannot support a Regulation R
    referral log.
    """
    # Ensure a clean slate for this deal.
    client.post("/api/consultative-call", json={
        "payoff_id": "PO-2026-6104", "call_completed": False,
    })

    refused = client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-6104",
        "verbal_consent_recorded": True,
    })
    assert refused.status_code == 409
    assert "consultative call" in refused.json()["detail"].lower()

    # And the record is untouched by the refusal.
    state = client.get("/api/quarantine?payoff_id=PO-2026-6104").json()
    assert state["quarantined"] is True
    assert state["verbal_consent_recorded"] is False

    # Once the call is logged, the same request succeeds.
    log_call("PO-2026-6104")
    allowed = client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-6104",
        "verbal_consent_recorded": True,
    })
    assert allowed.status_code == 200
    assert allowed.json()["quarantined"] is False

    client.post("/api/consultative-call", json={
        "payoff_id": "PO-2026-6104", "call_completed": False,
    })


def test_retracting_the_call_cascades_to_consent():
    """A consent obtained on a call cannot outlive the retraction of that call."""
    log_call("PO-2026-7492")
    client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-7492",
        "verbal_consent_recorded": True,
    })
    assert client.get("/api/quarantine?payoff_id=PO-2026-7492").json()["quarantined"] is False

    client.post("/api/consultative-call", json={
        "payoff_id": "PO-2026-7492", "call_completed": False,
    })
    after = client.get("/api/quarantine?payoff_id=PO-2026-7492").json()
    assert after["call_logged"] is False
    assert after["quarantined"] is True, "consent survived the call it depended on"
    assert after["verbal_consent_recorded"] is False


def test_declined_call_records_the_ask_without_unlocking_the_packet():
    """A 'no' is a real outcome: logged, but it stages nothing."""
    record = log_call("PO-2026-7492", client_directed_proceeds=False)
    assert record["call_logged"] is True
    assert record["client_directed_proceeds"] is False
    assert "declined" in record["call_disposition"].lower()
    # Declining settlement routing does not by itself bar the wealth referral,
    # but it must not silently authorise it either.
    assert record["quarantined"] is True

    client.post("/api/consultative-call", json={
        "payoff_id": "PO-2026-7492", "call_completed": False,
    })


def test_no_envelope_exists_until_the_packet_is_sent():
    """Composing a packet is not sending one.

    The envelope id used to be minted by the assessment, so a string that reads
    as proof of delivery existed the moment a packet rendered. It is now written
    only by a dispatch.
    """
    log_call("PO-2026-8821")
    try:
        before = client.get("/api/quarantine?payoff_id=PO-2026-8821").json()
        assert before["packet_sent"] is False
        assert before["docusign_envelope_id"] is None
        assert before["packet_audit_hash"].endswith("PENDING")

        sent = client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-8821"})
        assert sent.status_code == 200
        record = sent.json()
        assert record["packet_sent"] is True
        assert record["docusign_envelope_id"].startswith("ENV-HBAN-")
        assert record["packet_sent_at"] is not None
        assert "Marcus Vance" in record["packet_recipient"]
        # A real digest, not the pending sentinel.
        assert not record["packet_audit_hash"].endswith("PENDING")
        assert len(record["packet_audit_hash"].removeprefix("SHA256-")) == 64
    finally:
        reset_deal("PO-2026-8821")


def test_packet_cannot_be_sent_before_a_call_is_logged():
    """The sequencing gate is server-side, not a disabled button."""
    reset_deal("PO-2026-6104")
    resp = client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-6104"})
    assert resp.status_code == 409
    assert "consultative call" in resp.json()["detail"].lower()

    state = client.get("/api/quarantine?payoff_id=PO-2026-6104").json()
    assert state["packet_sent"] is False
    assert state["docusign_envelope_id"] is None


def test_packet_cannot_be_sent_when_the_borrower_declined():
    """A logged 'no' must not be a route to an envelope."""
    log_call("PO-2026-7492", client_directed_proceeds=False)
    try:
        resp = client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-7492"})
        assert resp.status_code == 409
        assert "declined" in resp.json()["detail"].lower()
        state = client.get("/api/quarantine?payoff_id=PO-2026-7492").json()
        assert state["docusign_envelope_id"] is None
    finally:
        reset_deal("PO-2026-7492")


def test_recalling_an_envelope_clears_the_dispatch_record():
    log_call("PO-2026-8821")
    try:
        client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-8821"})
        recalled = client.post(
            "/api/settlement-packet", json={"payoff_id": "PO-2026-8821", "send": False}
        )
        assert recalled.status_code == 200
        record = recalled.json()
        assert record["packet_sent"] is False
        assert record["docusign_envelope_id"] is None
        assert record["packet_audit_hash"].endswith("PENDING")
        # Recalling an envelope does not un-log the call that authorised it.
        assert record["call_logged"] is True
    finally:
        reset_deal("PO-2026-8821")


def test_retracting_the_call_cascades_to_the_dispatched_packet():
    """The packet is downstream of the conversation, so it cannot outlive it."""
    log_call("PO-2026-8821")
    client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-8821"})
    assert client.get("/api/quarantine?payoff_id=PO-2026-8821").json()["packet_sent"] is True

    reset_deal("PO-2026-8821")
    after = client.get("/api/quarantine?payoff_id=PO-2026-8821").json()
    assert after["call_logged"] is False
    assert after["packet_sent"] is False
    assert after["docusign_envelope_id"] is None


def test_re_logging_a_call_as_declined_voids_a_dispatched_packet():
    """He cannot be left holding a request to sign a routing he just refused."""
    log_call("PO-2026-8821")
    try:
        client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-8821"})
        # Same call record, corrected disposition.
        declined = client.post("/api/consultative-call", json={
            "payoff_id": "PO-2026-8821",
            "call_completed": True,
            "client_directed_proceeds": False,
        }).json()
        assert declined["call_logged"] is True
        assert declined["packet_sent"] is False
        assert declined["docusign_envelope_id"] is None
    finally:
        reset_deal("PO-2026-8821")


def test_retracting_consent_does_not_recall_a_sent_envelope():
    """Gate 2 and Gate 1b are separate facts with separate retraction paths."""
    log_call("PO-2026-8821")
    try:
        client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-8821"})
        client.post("/api/quarantine", json={
            "payoff_id": "PO-2026-8821", "verbal_consent_recorded": True,
        })
        withdrawn = client.post("/api/quarantine", json={
            "payoff_id": "PO-2026-8821", "verbal_consent_recorded": False,
        }).json()
        assert withdrawn["verbal_consent_recorded"] is False
        # The borrower is still holding the envelope; pretending otherwise
        # would make the record disagree with the world.
        assert withdrawn["packet_sent"] is True
        assert withdrawn["docusign_envelope_id"].startswith("ENV-HBAN-")
    finally:
        reset_deal("PO-2026-8821")


def test_demo_reset_closes_every_gate_on_every_deal():
    """The reset is the start state, not a partial rollback.

    Advances one deal all the way through -- call, dispatched envelope,
    cross-LOB consent -- and dirties a second, then asserts both come back
    fully gated. A reset that only cleaned the deal on screen would leave a
    live envelope id behind on the deal the presenter had switched away from.
    """
    try:
        log_call("PO-2026-8821")
        sent = client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-8821"}).json()
        assert sent["docusign_envelope_id"].startswith("ENV-HBAN-")
        consented = client.post("/api/quarantine", json={
            "payoff_id": "PO-2026-8821", "verbal_consent_recorded": True,
        }).json()
        assert consented["quarantined"] is False

        log_call("PO-2026-7492")

        resp = client.post("/api/demo/reset")
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["reset"] is True
        assert "PO-2026-8821" in body["deals_reset"]
        assert "PO-2026-7492" in body["deals_reset"]
        assert "PO-2026-6104" in body["deals_reset"]

        for payoff_id in body["deals_reset"]:
            # Read back through the API rather than trusting the reset's own
            # echo: the point of the test is what the next request sees.
            state = client.get(f"/api/quarantine?payoff_id={payoff_id}").json()
            assert state["call_logged"] is False, payoff_id
            assert state["call_timestamp"] is None, payoff_id
            assert state["client_directed_proceeds"] is False, payoff_id
            assert state["call_disposition"] is None, payoff_id
            assert state["packet_sent"] is False, payoff_id
            assert state["packet_sent_at"] is None, payoff_id
            assert state["packet_recipient"] is None, payoff_id
            assert state["docusign_envelope_id"] is None, payoff_id
            assert state["quarantined"] is True, payoff_id
            assert state["verbal_consent_recorded"] is False, payoff_id
            assert state["recorded_by"] is None, payoff_id
            assert state["consent_timestamp"] is None, payoff_id
            # The audit hashes must go back to their pending sentinels, not
            # keep a digest for an event that no longer exists.
            assert state["call_audit_hash"].endswith("-PENDING"), payoff_id
            assert state["packet_audit_hash"].endswith("-PENDING"), payoff_id
            assert state["audit_hash"].endswith("-PENDING"), payoff_id

        # And the gate genuinely re-arms: consent is refused again.
        refused = client.post("/api/quarantine", json={
            "payoff_id": "PO-2026-8821", "verbal_consent_recorded": True,
        })
        assert refused.status_code == 409
    finally:
        reset_deal("PO-2026-8821")
        reset_deal("PO-2026-7492")


def test_demo_reset_is_idempotent_on_an_untouched_deal():
    """Resetting a pristine deal is a no-op, not an error."""
    before = client.get("/api/quarantine?payoff_id=PO-2026-6104").json()
    assert client.post("/api/demo/reset").status_code == 200
    after = client.get("/api/quarantine?payoff_id=PO-2026-6104").json()
    assert after == before


def test_wealth_onboarding_deal_parameterization():
    """Verifies wealth onboarding dossier redacts NPI when quarantined, and reveals verified data when consent is recorded."""
    # 1. Quarantined check (default state)
    vance_resp = client.get("/api/wealth-onboarding?payoff_id=PO-2026-8821")
    assert vance_resp.status_code == 200
    vance_data = vance_resp.json()
    assert vance_data["quarantined"] is True
    assert vance_data["status"] == "Quarantined"
    assert "[QUARANTINED]" in vance_data["target_client"]
    assert "(Locked)" in vance_data["sei_custodial_shell"]["shell_id"]
    assert vance_data["draft_ips_scaffolding"]["asset_allocation_scaffold"] == []

    # 2. Record consent for Vance
    log_call("PO-2026-8821")
    client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-8821",
        "verbal_consent_recorded": True,
        "recorded_by": "Greg Miller (Commercial RM)",
        "client_notes": "Affirmative consent recorded."
    })
    vance_unlocked = client.get("/api/wealth-onboarding?payoff_id=PO-2026-8821").json()
    assert vance_unlocked["quarantined"] is False
    assert vance_unlocked["status"] == "Active / Ready for Advisor Authorship"
    assert "Marcus Vance" in vance_unlocked["target_client"]
    assert vance_unlocked["sei_custodial_shell"]["shell_id"] == "SEI-WP-HBAN-8821"
    assert vance_unlocked["draft_ips_scaffolding"]["asset_allocation_scaffold"] == []
    # The staged relationship is Private Bank / SEI, so the disclaimer must cite the bank
    # fiduciary standard (OCC Reg 9) rather than Reg BI, which governs retail brokerage.
    # Reg R is about referral compensation and is deliberately NOT cited here.
    disclaimer = vance_unlocked["draft_ips_scaffolding"]["fiduciary_disclaimer"]
    assert "OCC Reg 9" in disclaimer
    assert "authored by the licensed advisor" in disclaimer
    # Investment authorship must remain with the advisor, never the commercial bank.
    assert "not generated by the commercial bank" in disclaimer

    # Reset Vance consent
    client.post("/api/quarantine", json={"payoff_id": "PO-2026-8821", "verbal_consent_recorded": False})

    # 3. Record consent for Buckeye (Arthur Pendelton)
    log_call("PO-2026-7492")
    client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-7492",
        "verbal_consent_recorded": True,
        "recorded_by": "Greg Miller"
    })
    buckeye_unlocked = client.get("/api/wealth-onboarding?payoff_id=PO-2026-7492").json()
    assert buckeye_unlocked["quarantined"] is False
    assert "Arthur Pendelton" in buckeye_unlocked["target_client"]
    assert buckeye_unlocked["sei_custodial_shell"]["shell_id"] == "SEI-WP-HBAN-7492"

    # Reset Buckeye consent
    client.post("/api/quarantine", json={"payoff_id": "PO-2026-7492", "verbal_consent_recorded": False})

    # 4. Record consent for Scioto Medical (Dr. Robert Miller)
    log_call("PO-2026-6104")
    client.post("/api/quarantine", json={
        "payoff_id": "PO-2026-6104",
        "verbal_consent_recorded": True,
        "recorded_by": "Greg Miller"
    })
    med_unlocked = client.get("/api/wealth-onboarding?payoff_id=PO-2026-6104").json()
    assert med_unlocked["quarantined"] is False
    assert "Dr. Robert Miller" in med_unlocked["target_client"]
    assert med_unlocked["sei_custodial_shell"]["shell_id"] == "SEI-WP-HBAN-6104"
    assert "Brian Gallagher" in med_unlocked["assigned_pwa"]

    # Reset Scioto consent
    client.post("/api/quarantine", json={"payoff_id": "PO-2026-6104", "verbal_consent_recorded": False})


def test_wealth_dossier_does_not_present_escrowed_exchange_proceeds_as_investable():
    """An exchange has no investable balance at the moment the dossier opens.

    Tier 2 wealth release fires at closing + 30 days, which on Buckeye lands
    before the 45-day identification deadline. The proceeds are therefore still
    in qualified escrow and legally committed to a purchase the client has not
    yet named.

    The dossier previously described them the same way it describes a taxable
    sale: a $500,000 ICS liquidity sleeve, a capital-preservation mandate, and
    an FDIC pass-through sweep. Each of those is an invitation to allocate money
    that cannot be allocated, and the sweep is titled to the client -- which is
    constructive receipt, the one act that voids the deferral.
    """
    try:
        for pid in ("PO-2026-7492", "PO-2026-8821"):
            log_call(pid)
            client.post("/api/quarantine", json={
                "payoff_id": pid,
                "verbal_consent_recorded": True,
                "recorded_by": "Greg Miller",
            })

        exchange = client.get("/api/wealth-onboarding?payoff_id=PO-2026-7492").json()
        assert exchange["quarantined"] is False

        depository = exchange["sei_custodial_shell"]["cash_depository_link"]
        assert "Qualified Escrow" in depository
        assert "Sweep" not in depository

        ips = exchange["draft_ips_scaffolding"]
        assert "$500,000" not in ips["liquidity_reserve_sleeve"]
        assert "$0.00" in ips["liquidity_reserve_sleeve"]
        assert "Capital Preservation" not in ips["mandate"]
        assert "Replacement Property" in ips["mandate"]

        wealth_source = next(
            f for f in exchange["staged_kyc_cip"]["verified_fields"]
            if f["field"] == "Source of Wealth"
        )
        assert "1031" in wealth_source["value"]
        assert "deferred, not realized" in wealth_source["value"]

        # The cash-out deal is genuinely a liquidity event, so it keeps the
        # sweep and the preservation mandate. If this half regresses, the fix
        # above has been applied to both branches instead of one.
        cash_out = client.get("/api/wealth-onboarding?payoff_id=PO-2026-8821").json()
        assert "Sweep" in cash_out["sei_custodial_shell"]["cash_depository_link"]
        assert "$500,000" in cash_out["draft_ips_scaffolding"]["liquidity_reserve_sleeve"]
        assert "Capital Preservation" in cash_out["draft_ips_scaffolding"]["mandate"]
    finally:
        for pid in ("PO-2026-7492", "PO-2026-8821"):
            reset_deal(pid)


def test_user_endpoint():
    """Verifies /api/user returns authenticated user profile."""
    resp = client.get("/api/user")
    assert resp.status_code == 200
    data = resp.json()
    assert "email" in data or "name" in data or "id" in data or "sub" in data


def test_generate_endpoint():
    """Verifies /api/generate produces agentic AI responses with grounded citations."""
    resp = client.post("/api/generate", json={
        "prompt": "Marcus Vance relationship call script"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "response" in data
    assert len(data["response"]) > 0
    assert "grounded_citations" in data
    assert len(data["grounded_citations"]) > 0
    assert isinstance(data["live"], bool)

    # A canned fallback must never present itself as a live inference. The model label
    # and the citations must both disclose the fallback whenever live is False.
    if data["live"]:
        assert "[OFFLINE FALLBACK]" not in data["model"]
    else:
        assert "[OFFLINE FALLBACK]" in data["model"]
        assert all("Offline fallback" in c for c in data["grounded_citations"])


def test_generate_endpoint_fallback_is_disclosed():
    """Without a configured Gemini client the response must be explicitly flagged non-live."""
    import main as main_module

    original = main_module.genai_client
    main_module.genai_client = None
    try:
        resp = client.post("/api/generate", json={"prompt": "summarize the deal"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["live"] is False
        assert data["model"] == f"{main_module.gemini_model} [OFFLINE FALLBACK]"
        assert data["grounded_citations"] == [
            "Offline fallback response — pre-written, not grounded by a live model call"
        ]
        assert "OFFLINE FALLBACK" in data["response"]
    finally:
        main_module.genai_client = original


def test_payoffs_queue_endpoint():
    """Verifies payoff queue returns pipeline items and capacity meter."""
    resp = client.get("/api/payoffs")
    assert resp.status_code == 200
    data = resp.json()
    assert "capacity_meter" in data
    # Verified against Q2 2026 10-Q Table 8 and FFIEC Call Report RC-C, not a
    # round marketing number. See docs/CITATIONS.md §4a.
    assert data["capacity_meter"]["book_scale_volume"] == "$33.30 Billion"
    assert data["capacity_meter"]["branch_network_count"] == "1,400 Branches (21 States)"
    # No numeric placement is claimed: the Call Report's small-business
    # schedule is keyed to original loan amount, not SBA program participation.
    assert "sba_ranking" not in data["capacity_meter"]
    position = data["capacity_meter"]["sba_position"]
    assert "Among the top national SBA 7(a) lenders" in position
    assert not any(token in position for token in ("Top-2", "#1", "#2", "No. 1"))
    assert data["capacity_meter"]["csa_leverage_ratio"] == "2x CSA Leverage (1 CSA : 4 PWAs)"
    assert len(data["payoff_items"]) == 3
    assert data["payoff_items"][0]["id"] == "PO-2026-8821"


def test_capacity_meter_reconciles_with_the_visible_queue():
    """
    Every counter on the telemetry strip must be checkable against what is on
    screen. The payload previously advertised 6 qualified deals against a
    3-row queue, which a board member could disprove by counting.
    """
    data = client.get("/api/payoffs").json()
    meter = data["capacity_meter"]
    staged = len(data["payoff_items"])

    assert meter["qualified_and_staged"] == staged
    assert meter["active_machine_inferences"] == staged
    # 4-6 banker-hour manual band per liquidity event, 5 hr midpoint.
    assert meter["manual_discovery_absorbed_hrs"] == pytest.approx(staged * 5.0)
    # $33.298B target CRE book / $3.0M average commercial loan size.
    assert meter["screened_events_book"] == 11099


def test_invalid_deal_id_returns_404():
    """Verifies that non-existent deal IDs return HTTP 404 across all endpoints."""
    invalid_id = "PO-INVALID-9999"

    resp = client.get(f"/api/entity-resolution?payoff_id={invalid_id}")
    assert resp.status_code == 404

    resp = client.get(f"/api/quarantine?payoff_id={invalid_id}")
    assert resp.status_code == 404

    resp = client.post("/api/quarantine", json={"payoff_id": invalid_id, "verbal_consent_recorded": True})
    assert resp.status_code == 404

    resp = client.get(f"/api/wire-instructions?payoff_id={invalid_id}")
    assert resp.status_code == 404

    resp = client.get(f"/api/wealth-onboarding?payoff_id={invalid_id}")
    assert resp.status_code == 404

    resp = client.post("/api/valuation", json={
        "payoff_id": invalid_id,
        "noi": 500000.0,
        "cap_rate": 0.07,
        "debt_payoff": 1000000.0
    })
    assert resp.status_code == 404


def test_validation_errors_return_422():
    """Verifies parameter boundary validation returning HTTP 422."""
    # Invalid wire strategy
    resp = client.get("/api/wire-instructions?payoff_id=PO-2026-8821&strategy=invalid_strat")
    assert resp.status_code == 422

    # Negative wire sale price
    resp = client.get("/api/wire-instructions?payoff_id=PO-2026-8821&sale_price=-1000.0")
    assert resp.status_code == 422

    # Negative NOI in valuation
    resp = client.post("/api/valuation", json={
        "payoff_id": "PO-2026-8821",
        "noi": -1000.0,
        "cap_rate": 0.075,
        "debt_payoff": 5000000.0
    })
    assert resp.status_code == 422

    # Cap rate <= 0 in valuation
    resp = client.post("/api/valuation", json={
        "payoff_id": "PO-2026-8821",
        "noi": 500000.0,
        "cap_rate": 0.0,
        "debt_payoff": 5000000.0
    })
    assert resp.status_code == 422

    # Cap rate > 1.0 in valuation
    resp = client.post("/api/valuation", json={
        "payoff_id": "PO-2026-8821",
        "noi": 500000.0,
        "cap_rate": 1.5,
        "debt_payoff": 5000000.0
    })
    assert resp.status_code == 422


def test_wealth_onboarding_rejects_substandard_credit_risk():
    """Verifies the credit-policy gate rejecting non-Pass credit risk deals."""
    from main import PAYOFF_QUEUE
    substandard_deal = dict(PAYOFF_QUEUE[0])
    substandard_deal["id"] = "PO-2026-SUBSTD"
    substandard_deal["credit_risk_rating"] = "Special Mention (Tier 4)"
    PAYOFF_QUEUE.append(substandard_deal)

    try:
        resp = client.get("/api/wealth-onboarding?payoff_id=PO-2026-SUBSTD")
        assert resp.status_code == 422
        assert "Huntington credit-policy gating" in resp.json()["detail"]
    finally:
        PAYOFF_QUEUE.remove(substandard_deal)


def test_payoffs_queue_contains_confidence_scores():
    """Verifies that GET /api/payoffs returns flight confidence scores for all items."""
    resp = client.get("/api/payoffs")
    assert resp.status_code == 200
    items = resp.json()["payoff_items"]
    assert len(items) >= 3
    for item in items:
        assert "flight_confidence_score" in item
        assert isinstance(item["flight_confidence_score"], (int, float))
        assert "flight_risk_classification" in item


def test_signal_graph_endpoint_vance():
    """Verifies Spanner Signal Graph grounding for Marcus Vance (PO-2026-8821)."""
    resp = client.get("/api/signal-graph?payoff_id=PO-2026-8821")
    assert resp.status_code == 200
    data = resp.json()
    assert data["payoff_id"] == "PO-2026-8821"
    assert data["confidence_score"] == 94
    assert "Cash-Out" in data["classification"]
    assert data["spanner_stats"]["database"] == "huntington-commercial-graph"
    assert "ISO GQL" in data["spanner_stats"]["engine"]
    assert len(data["nodes"]) >= 10
    assert len(data["edges"]) >= 10

    # Verify Elena Vance is quarantined. The badge says NPI rather than GLBA:
    # a passive member of a commercial LLC is arguably not a GLBA "consumer",
    # so the frameworks are cited as the governing standard, not as a trigger.
    elena = next(n for n in data["nodes"] if n["id"] == "principal_elena")
    assert elena["status"] == "quarantined"
    assert "QUARANTINED" in elena["badge"]
    assert "GLBA" not in elena["badge"]
    # Her provenance must stay disclosed: 15% is below the FinCEN CDD threshold,
    # so she exists only in the operating agreement, not in BSA records.
    assert "25%" in elena["properties"]["CDD Coverage"]
    assert "Operating Agreement" in elena["properties"]["Source of Record"]

    # The refinance signal must stay scoped to Huntington's own systems.
    no_refi = next(n for n in data["nodes"] if n["id"] == "sig_no_refi")
    assert "Huntington" in no_refi["label"]
    assert "not observable" in no_refi["properties"]["Limitation"]

    # Verify verdict node, and that the 94% is tied to the title demand.
    verdict = next(n for n in data["nodes"] if n["tier"] == "verdict")
    assert "Cash-Out" in verdict["label"]
    assert "T-12" in verdict["properties"]["Confidence Basis"]
    # The tax treatment is a presumption, not a finding: the bank never sees the
    # exchange agreement. It must say so on the node itself.
    assert "presumed" in verdict["properties"]["Proceeds Treatment"]

    # Wave 2: the inbound demand node describes only what the payoff desk gets.
    demand = next(n for n in data["nodes"] if n["id"] == "payoff_demand")
    assert demand["label"] == "Inbound Payoff Demand"
    assert "Not Received" in demand["properties"]
    assert "Wire Target" not in demand["properties"]

    # The 25-point signal now originates at Huntington's own servicing desk.
    prepay = next(n for n in data["nodes"] if n["id"] == "sig_prepay_quote")
    assert "+25%" in prepay["subtitle"]
    assert "Limitation" in prepay["properties"]

    # Guard the class across every deal's graph payload.
    for payoff_id in ("PO-2026-8821", "PO-2026-7492", "PO-2026-6104"):
        blob = json.dumps(client.get(f"/api/signal-graph?payoff_id={payoff_id}").json())
        for never_received in (
            "Exhibits A-E",
            "ExchangeAgreement",
            "Exhibit C to Settlement Escrow Instructions",
            "Escrow Settlement Order",
            "Competitive Refinance Term Sheet",
        ):
            assert never_received not in blob, f"{payoff_id}: payoff desk never receives {never_received}"



def test_signal_graph_endpoint_buckeye_1031():
    """Verifies Spanner Signal Graph grounding for Buckeye Precision Tooling (PO-2026-7492)."""
    resp = client.get("/api/signal-graph?payoff_id=PO-2026-7492")
    assert resp.status_code == 200
    data = resp.json()
    assert data["payoff_id"] == "PO-2026-7492"
    assert data["confidence_score"] == 88
    assert "1031" in data["classification"]
    assert any(n["id"] == "entity_qi" for n in data["nodes"])
    assert any("1031" in n["label"] for n in data["nodes"])


def test_signal_graph_endpoint_scioto_refinance():
    """Verifies Spanner Signal Graph grounding for Columbus Medical Arts (PO-2026-6104)."""
    resp = client.get("/api/signal-graph?payoff_id=PO-2026-6104")
    assert resp.status_code == 200
    data = resp.json()
    assert data["payoff_id"] == "PO-2026-6104"
    assert data["confidence_score"] == 58
    assert "Refinance" in data["classification"]
    assert any("Refinance" in n["label"] for n in data["nodes"])


def test_signal_graph_404_not_found():
    """Verifies that requesting an unknown deal payoff_id returns HTTP 404."""
    resp = client.get("/api/signal-graph?payoff_id=PO-INVALID-9999")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Wave 5 -- the clock, the account number, and deal 2's own entity
# ---------------------------------------------------------------------------


def test_served_dates_track_the_wall_clock():
    """The countdown must be true on the day the demo is given, not on one day in 2026.

    `days_to_close` was a hardcoded integer next to a hardcoded closing date.
    They agreed only on 2026-09-04. Whatever today is, the served closing date
    must be exactly `days_to_close` away from it.
    """
    items = client.get("/api/payoffs").json()["payoff_items"]
    assert {i["id"]: i["days_to_close"] for i in items} == {
        "PO-2026-8821": 12,
        "PO-2026-7492": 24,
        "PO-2026-6104": 45,
    }
    today = date.today()
    for item in items:
        closing = date.fromisoformat(item["scheduled_closing_date"])
        assert (closing - today).days == item["days_to_close"], item["id"]
        # The payoff demand was received before the closing, always.
        assert date.fromisoformat(item["payoff_statement_date"]) < closing


def test_dates_that_are_not_transaction_dates_stay_put():
    """The borrower's formation year and the note's maturity are not on the clock."""
    vance = client.get("/api/entity-resolution?payoff_id=PO-2026-8821").json()
    assert vance["borrower_entity"]["filing_date"] == "2018-04-12"
    assert any("Vance 2018 Family Trust" in m["name"] for m in vance["grounded_members"])

    graph = client.get("/api/signal-graph?payoff_id=PO-2026-7492").json()
    note = next(n for n in graph["nodes"] if n["id"] == "note_sba")
    assert note["properties"]["Maturity"] == "2029-05-15"


def test_settlement_packet_is_dated_today_and_carries_no_envelope_until_sent():
    """The letter date is a live stamp; the envelope is issued only on dispatch."""
    packet = client.get("/api/wire-instructions?payoff_id=PO-2026-8821").json()
    # The engine stamps the letter from UTC; the re-base keys off the local day.
    assert packet["date"] == datetime.now(timezone.utc).strftime("%B %d, %Y")
    assert packet["docusign_envelope_id"] is None

    log_call("PO-2026-8821")
    try:
        sent = client.post("/api/settlement-packet", json={"payoff_id": "PO-2026-8821"})
        assert sent.status_code == 200
        assert sent.json()["docusign_envelope_id"] == f"ENV-HBAN-{date.today():%Y%m%d}-8821"
    finally:
        client.post("/api/consultative-call", json={"payoff_id": "PO-2026-8821", "call_completed": False})


def test_one_borrower_one_operating_dda():
    """The dossier must name the account entity resolution actually resolved.

    It used to build the number from the payoff id, which yielded "#..8821" --
    the facility number, not a deposit account -- while entity resolution named
    a third number for the same borrower.
    """
    expected = {
        "PO-2026-8821": "#..4109",
        "PO-2026-7492": "#..1102",
        "PO-2026-6104": "#..9012",
    }
    for payoff_id, dda in expected.items():
        entity = client.get(f"/api/entity-resolution?payoff_id={payoff_id}").json()
        accounts = [a for m in entity["grounded_members"] for a in m["known_hban_accounts"]]
        assert any(dda in a for a in accounts), f"{payoff_id}: {accounts}"

        log_call(payoff_id)
        client.post("/api/quarantine", json={"payoff_id": payoff_id, "verbal_consent_recorded": True,
                                             "recorded_by": "Greg Miller (Commercial RM)"})
        try:
            dossier = client.get(f"/api/wealth-onboarding?payoff_id={payoff_id}").json()
            source = next(
                f for f in dossier["staged_kyc_cip"]["verified_fields"]
                if f["field"] == "Primary Banking Source"
            )
            assert source["value"].endswith(dda), source["value"]
            # The facility number is not a deposit account.
            suffix = payoff_id.split("-")[-1]
            assert f"DDA #..{suffix}" not in source["value"]
        finally:
            client.post("/api/quarantine", json={"payoff_id": payoff_id, "verbal_consent_recorded": False})
            client.post("/api/consultative-call", json={"payoff_id": payoff_id, "call_completed": False})


def test_deal_two_graph_agrees_with_its_own_entity_resolution():
    """Buckeye is an S-corp owned 70/30, in both places that describe it."""
    entity = client.get("/api/entity-resolution?payoff_id=PO-2026-7492").json()
    assert entity["borrower_entity"]["tax_classification"] == "Subchapter S Corporation"
    owners = {m["name"]: m for m in entity["grounded_members"]}
    assert owners["Arthur Pendelton"]["ownership_pct"] == 70.0
    assert owners["Janet Pendelton"]["ownership_pct"] == 30.0

    graph = client.get("/api/signal-graph?payoff_id=PO-2026-7492").json()
    buckeye = next(n for n in graph["nodes"] if n["id"] == "entity_buckeye")
    arthur = next(n for n in graph["nodes"] if n["id"] == "principal_arthur")
    assert buckeye["subtitle"] == "Ohio S-Corporation"
    assert buckeye["properties"]["Tax Entity"] == "Subchapter S Corporation"
    assert arthur["badge"] == "70% OWNER / GUARANTOR"
    assert arthur["properties"]["Ownership"] == "70.0% Voting Common"
    # Janet is surfaced as a property rather than a node: the node and edge
    # counts on the chips are hardcoded and must keep matching the arrays.
    assert "Janet Pendelton" in arthur["properties"]["Co-Shareholder"]

    blob = json.dumps(graph)
    for retracted in ("C-Corporation", "Sole Shareholder", "100.0% Common Stock", "SOLE_OWNER_100PCT"):
        assert retracted not in blob, retracted

    # The corporation holds title, so the corporation is the exchanging
    # taxpayer. Naming the wrong taxpayer is what actually blows up a 1031.
    assert "exchanging taxpayer" in buckeye["agent_relevance"]
    exchange_edges = [e for e in graph["edges"] if e["target"] == "sig_escrow_target"]
    assert all(e["source"] != "principal_arthur" for e in exchange_edges)


def test_graph_chips_match_the_arrays_they_describe():
    """nodes_matched / edges_traversed are hardcoded; they must not drift."""
    for payoff_id in ("PO-2026-8821", "PO-2026-7492", "PO-2026-6104"):
        graph = client.get(f"/api/signal-graph?payoff_id={payoff_id}").json()
        stats = graph["spanner_stats"]
        assert stats["nodes_matched"] == len(graph["nodes"]), payoff_id
        assert stats["edges_traversed"] == len(graph["edges"]), payoff_id


def test_document_routes_require_authentication(monkeypatch):
    """Verifies that reference document routes enforce authentication in production."""
    monkeypatch.setenv("K_SERVICE", "huntington-book-scout")
    for doc in ("demo_script.html", "brand_kit.html", "citations.html"):
        res = client.get(f"/{doc}")
        assert res.status_code == 401
        assert "Unauthorized" in res.json()["detail"]






