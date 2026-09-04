"""
Integration Tests for Huntington Horizon FastAPI Endpoints
Verifies multi-deal valuation, entity resolution, wire instructions, and GLBA quarantine gate.
"""
import pytest
from starlette.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "huntington-horizon"


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
    assert "Max$aver" in data["strategy_product"]


def test_valuation_buckeye_tooling_sub_7m():
    """Verifies that non-Vance deals below $7M (e.g. $3.15M) pass validation and calculate accurately."""
    response = client.post("/api/valuation", json={
        "payoff_id": "PO-2026-7492",
        "sale_price": 3150000.00,
        "noi": 245000.00,
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
    """Verifies entity resolution returns borrower-specific topology for each deal."""
    # Buckeye Precision Tooling
    resp_buckeye = client.get("/api/entity-resolution?payoff_id=PO-2026-7492")
    assert resp_buckeye.status_code == 200
    data_b = resp_buckeye.json()
    assert data_b["borrower_entity"]["name"] == "Buckeye Precision Tooling Corp."
    assert any("Arthur Pendelton" in m["name"] for m in data_b["grounded_members"])

    # Scioto Medical
    resp_scioto = client.get("/api/entity-resolution?payoff_id=PO-2026-6104")
    assert resp_scioto.status_code == 200
    data_s = resp_scioto.json()
    assert data_s["borrower_entity"]["name"] == "Columbus Medical Arts Center LLC"
    assert any("Dr. Robert Miller" in m["name"] for m in data_s["grounded_members"])


def test_wire_instructions_deal_parameterization():
    """Verifies wire instructions use active deal entity and statutory routing."""
    response = client.get("/api/wire-instructions?payoff_id=PO-2026-7492&strategy=1031_exchange&sale_price=3150000.00")
    assert response.status_code == 200
    data = response.json()
    assert "Buckeye Precision Tooling Corp." in data["account_title"]
    assert "HBAN-QI-8819-01" == data["account_number"]
    assert data["indicative_net_disbursement"] == 1588250.00


def test_glba_quarantine_flow():
    """Verifies GLBA verbal consent recording and status reflection."""
    post_resp = client.post("/api/quarantine", json={
        "verbal_consent_recorded": True,
        "recorded_by": "Greg Miller (Commercial RM)",
        "client_notes": "Test verbal consent."
    })
    assert post_resp.status_code == 200
    assert post_resp.json()["quarantined"] is False

    get_resp = client.get("/api/quarantine")
    assert get_resp.status_code == 200
    assert get_resp.json()["quarantined"] is False

    # Reset
    reset_resp = client.post("/api/quarantine", json={
        "verbal_consent_recorded": False
    })
    assert reset_resp.status_code == 200
    assert reset_resp.json()["quarantined"] is True
