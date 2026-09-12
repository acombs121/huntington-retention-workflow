"""
Integration Tests for Huntington Book Scout FastAPI Endpoints
Verifies multi-deal valuation, entity resolution, wire instructions, and GLBA quarantine gate.
"""
import json

import pytest
from starlette.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "huntington-book-scout"
    assert data["version"] == "6.0.0"


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
    """Verifies wire instructions use active deal entity, borrower-directed DocuSign packet, and QI routing."""
    # 1031 Exchange on Buckeye
    response = client.get("/api/wire-instructions?payoff_id=PO-2026-7492&strategy=1031_exchange&sale_price=3150000.00")
    assert response.status_code == 200
    data = response.json()
    assert "Buckeye Precision Tooling Corp." in data["account_title"]
    assert "HBAN-QI-8819-01" == data["account_number"]
    assert data["indicative_net_disbursement"] == 1588250.00
    assert data["borrower_directed_packet"] is True
    assert "Borrower Settlement Routing Packet" in data["packet_type"]
    assert data["callback_verification_line"] == "(614) 480-4401 (Direct Banker Authentication Line)"
    assert data["docusign_envelope_id"].startswith("ENV-HBAN-")
    assert data["independent_qi_partner"] == "IPX1031 (Investment Property Exchange Services, Inc.)"


    # Cash-Out on Vance
    vance_wire = client.get("/api/wire-instructions?payoff_id=PO-2026-8821&strategy=cash_out&sale_price=8500000.00")
    assert vance_wire.status_code == 200
    vw_data = vance_wire.json()
    assert vw_data["borrower_directed_packet"] is True
    assert vw_data["independent_qi_partner"] is None


def test_glba_quarantine_flow():
    """Verifies GLBA verbal consent recording, genuine SHA-256 audit hash, and deal isolation."""
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
    assert data["capacity_meter"]["sba_ranking"] == "Top-2 National SBA 7(a) Lender"
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


def test_flight_risk_trace_endpoint_vance():
    """Verifies Detection Agent Reasoning Trace for PO-2026-8821 (Vance cash-out disposition)."""
    resp = client.get("/api/flight-risk-trace?payoff_id=PO-2026-8821")
    assert resp.status_code == 200
    data = resp.json()
    assert data["payoff_id"] == "PO-2026-8821"
    assert data["confidence_score"] == 94
    assert "Taxable Cash-Out" in data["classification"]
    assert len(data["fused_signals"]) >= 4
    
    # Verify signal fusion elements distinguishing refi vs 1031 vs cash-out
    signals = {s["signal_name"]: s for s in data["fused_signals"]}
    assert "Replacement Facility Inquiry Cross-Check" in signals
    assert "ZERO REPLACEMENT FINANCING" in signals["Replacement Facility Inquiry Cross-Check"]["verdict"]
    # Wave 2: the third signal used to be an OCR "audit" of title-demand exhibits
    # A-E. A payoff lender does not receive those. It is now the borrower's own
    # prepayment-premium quote request, which originates at Huntington's servicing
    # desk and is therefore genuinely observable.
    assert "Prepayment Premium Quote Requested" in signals
    prepay = signals["Prepayment Premium Quote Requested"]
    assert "EARLY PAYOFF PRICED" in prepay["verdict"]
    assert "Loan Servicing" in prepay["source"]

    # Guard the whole class: nothing in this payload may claim the bank reads an
    # instrument it is not a party to.
    blob = json.dumps(data)
    for never_received in (
        "Exhibits A-E",
        "executed purchase and sale agreement",
        "Settlement form indicates direct disbursement",
    ):
        assert never_received not in blob, f"payoff desk never receives: {never_received}"

    
    # Verify hypothesis elimination
    hypotheses = {h["hypothesis"]: h for h in data["hypotheses"]}
    refi_hypo = next(h for k, h in hypotheses.items() if "Refinance" in k)
    assert refi_hypo["status"] == "REJECTED"
    assert refi_hypo["confidence_pct"] <= 10

    cash_out_hypo = next(h for k, h in hypotheses.items() if "Cash-Out" in k)
    assert cash_out_hypo["status"] == "ACCEPTED"
    assert cash_out_hypo["confidence_pct"] == 94

    assert len(data["trace_steps"]) >= 5


def test_flight_risk_trace_endpoint_buckeye_1031():
    """Verifies Detection Agent Reasoning Trace for PO-2026-7492 (Buckeye 1031 exchange with QI)."""
    resp = client.get("/api/flight-risk-trace?payoff_id=PO-2026-7492")
    assert resp.status_code == 200
    data = resp.json()
    assert data["payoff_id"] == "PO-2026-7492"
    assert data["confidence_score"] == 88
    assert "1031" in data["classification"]

    signals = {s["signal_name"]: s for s in data["fused_signals"]}
    assert "Identifiable Qualified Intermediary (QI)" in signals
    assert "QI INTERMEDIARY CONFIRMED" in signals["Identifiable Qualified Intermediary (QI)"]["verdict"]

    hypo_1031 = next(h for h in data["hypotheses"] if "1031" in h["hypothesis"])
    assert hypo_1031["status"] == "ACCEPTED"
    assert hypo_1031["confidence_pct"] == 88


def test_flight_risk_trace_endpoint_scioto_refinance():
    """Verifies Detection Agent Reasoning Trace for PO-2026-6104 (Scioto refinance inquiry)."""
    resp = client.get("/api/flight-risk-trace?payoff_id=PO-2026-6104")
    assert resp.status_code == 200
    data = resp.json()
    assert data["payoff_id"] == "PO-2026-6104"
    assert data["confidence_score"] == 58
    assert "Refinance" in data["classification"]


def test_flight_risk_trace_404_not_found():
    """Verifies that requesting an unknown deal payoff_id returns HTTP 404."""
    resp = client.get("/api/flight-risk-trace?payoff_id=PO-UNKNOWN-9999")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


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





