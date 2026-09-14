"""
Unit Tests for Commercial Liquidity Engine
Verifies financial math, statutory deposit routing, and wire instruction formulation.
"""
from datetime import datetime
import json
import re

import pytest

from domain.models import PayoffStatement, LiquidityAssessment
from domain.liquidity_engine import LiquidityEngine


@pytest.fixture
def default_payoff() -> PayoffStatement:
    return PayoffStatement(
        id="PO-2026-8821",
        borrower_entity="Vance Riverfront Properties IV, LLC",
        property_name="Riverfront Commercial Commons",
        property_address="410 S. High Street, Columbus, OH 43215",
        title_company="First American Title Insurance Co.",
        settlement_officer="Karen Lindqvist",
        escrow_file_number="FA-2026-8819-COL",
        payoff_quote_amount=5214800.00,
        noi_trailing_q1=637500.00,
        submarket_cap_rate=0.075,
        known_hban_balances=2100000.00,
        managing_member="Marcus Vance",
        seller_entity="Vance Riverfront Properties IV, LLC",
    )


def test_unstated_sale_price_capitalization(default_payoff: PayoffStatement):
    """
    When sale_price is None, engine resolves unstated contract price by capitalizing
    trailing Q1 NOI against the submarket capitalization rate ($637,500 / 0.075 = $8,500,000).
    """
    fixed_time = datetime(2026, 9, 4, 12, 0, 0)
    assessment = LiquidityEngine.assess(default_payoff, sale_price=None, timestamp=fixed_time)

    assert assessment.valuation.sale_price == 8500000.00
    assert assessment.valuation.grounded_noi == 637500.00
    assert assessment.valuation.grounded_cap_rate == 0.075
    assert assessment.valuation.debt_payoff == 5214800.00
    assert assessment.valuation.estimated_closing_costs == 382500.00  # 4.5% of 8.5M
    assert assessment.valuation.net_equity_proceeds == 2902700.00   # 8.5M - 5.2148M - 382.5k
    assert assessment.valuation.known_hban_balances == 2100000.00
    assert assessment.valuation.total_resolvable_position == 5002700.00


def test_explicit_sale_price_override(default_payoff: PayoffStatement):
    """
    Providing an explicit sale price overrides cap-rate capitalization and recalculates
    closing costs and net equity proceeds accurately.
    """
    assessment = LiquidityEngine.assess(default_payoff, sale_price=9000000.00)

    assert assessment.valuation.sale_price == 9000000.00
    assert assessment.valuation.estimated_closing_costs == 405000.00  # 4.5% of 9M
    assert assessment.valuation.net_equity_proceeds == 3380200.00   # 9M - 5.2148M - 405k
    assert assessment.valuation.total_resolvable_position == 5480200.00


def test_statutory_depository_cash_out_route(default_payoff: PayoffStatement):
    """
    Default cash-out strategy routes into Huntington Business Premier ICS with 4.85% APY
    and 12 U.S.C. § 1831f statutory reciprocal deposit backing.
    """
    assessment = LiquidityEngine.assess(default_payoff, tax_strategy="cash_out")

    route = assessment.depository_route
    assert "Cash-Out" in route.strategy_type
    assert "Business Premier" in route.strategy_product
    assert route.yield_apy == 4.85
    assert "1831f" in route.statutory_basis
    assert route.finra_rule_2040_compliant is True

    wire = assessment.settlement_wire
    assert "Business Premier ICS Sweep" in wire.account_title
    assert wire.account_number == "HBAN-4401-9921-00"
    assert "Business Premier" in wire.special_instructions


def test_statutory_depository_1031_exchange_route(default_payoff: PayoffStatement):
    """
    1031 Exchange strategy routes into Huntington 1031 Qualified Escrow Depository with 4.75% APY
    and Treas. Reg. § 1.1031(k)-1(g)(3) Qualified Escrow Safe Harbor covenants.
    """
    assessment = LiquidityEngine.assess(default_payoff, tax_strategy="1031_exchange")

    route = assessment.depository_route
    assert "IRC §1031" in route.strategy_type
    assert "Qualified Escrow Depository" in route.strategy_product
    assert route.yield_apy == 4.75
    assert "1.1031(k)-1(g)(3)" in route.statutory_basis

    wire = assessment.settlement_wire
    assert "Huntington 1031 Escrow" in wire.account_title
    assert wire.account_number == "HBAN-QI-8819-01"
    assert "DO NOT DISBURSE OUTSIDE OF HUNTINGTON ESCROW" in wire.special_instructions


def test_settlement_packet_carries_no_bank_computed_amount(default_payoff: PayoffStatement):
    """
    The packet is executed by the seller and submitted to the settlement agent as
    their own closing authorization, so anything on it is a figure the bank has
    asserted to the client. The net-equity estimate must never appear there:

      - it is an internal triage heuristic whose OCC 2011-12 / SR 11-7
        designation rests on the valuation being muzzled from client-facing use;
      - it is gross of the yield-maintenance premium and the seller's tax
        liability, so it is an upper bound that will not reconcile to the
        settlement statement.

    This asserts the absence structurally -- over the whole serialized model, not
    just the fields we remembered to check -- so a future field cannot quietly
    reintroduce the leak.
    """
    assessment = LiquidityEngine.assess(default_payoff, sale_price=8750000.00)
    wire = assessment.settlement_wire

    # The valuation itself is still computed; it belongs to the banker's
    # internal workspace, not to the client's instrument.
    assert assessment.valuation.net_equity_proceeds > 0

    assert not hasattr(wire, "indicative_net_disbursement")

    packet_blob = json.dumps(wire.model_dump())
    assert str(int(assessment.valuation.net_equity_proceeds)) not in packet_blob
    currency = re.search(r"\$\s*\d[\d,]*", packet_blob)
    assert currency is None, f"client-facing packet leaks a currency figure: {currency.group(0)!r}"


def test_settlement_packet_defers_the_amount_to_the_seller(default_payoff: PayoffStatement):
    """
    Removing the figure is only half the fix. The packet must positively state
    that the amount is the seller's to elect, and offer the all-proceeds route,
    or the escrow officer receives an instruction with no amount and no basis.
    """
    wire = LiquidityEngine.assess(default_payoff).settlement_wire

    assert "seller" in wire.amount_election_note.lower()
    assert "does not" in wire.amount_election_note.lower()
    assert len(wire.amount_election_options) == 2
    assert any("all net seller proceeds" in o.lower() for o in wire.amount_election_options)
    assert "elected by the seller" in wire.special_instructions


def test_non_negative_net_equity_floor(default_payoff: PayoffStatement):
    """
    Invariant: Under-water or short payoffs must floor net equity proceeds at 0.00.
    """
    assessment = LiquidityEngine.assess(default_payoff, sale_price=5000000.00)  # less than 5.2148M debt
    assert assessment.valuation.net_equity_proceeds == 0.00


def test_legacy_valuation_dict_compatibility(default_payoff: PayoffStatement):
    """
    Ensures the assessment maps directly to the legacy /api/valuation response schema.
    """
    assessment = LiquidityEngine.assess(default_payoff, sale_price=8500000.00, tax_strategy="cash_out")
    legacy_dict = assessment.to_legacy_valuation_dict()

    expected_keys = {
        "sale_price",
        "grounded_noi",
        "grounded_cap_rate",
        "debt_payoff",
        "estimated_closing_costs",
        "net_equity_proceeds",
        "known_hban_balances",
        "total_resolvable_position",
        "strategy_type",
        "strategy_product",
        "yield_apy",
        "statutory_basis",
        "routing_destination",
        "deposit_credit_pct",
        "finra_rule_2040_compliant",
        "model_risk_designation",
    }
    assert set(legacy_dict.keys()) == expected_keys
    assert legacy_dict["sale_price"] == 8500000.00
    assert legacy_dict["net_equity_proceeds"] == 2902700.00


def test_borrower_directed_wire_packet(default_payoff: PayoffStatement):
    """
    Verifies borrower-directed DocuSign delivery packet metadata and independent QI routing.
    """
    cash_out_assessment = LiquidityEngine.assess(default_payoff, tax_strategy="cash_out")
    co_wire = cash_out_assessment.settlement_wire
    assert co_wire.borrower_directed_packet is True
    assert "Borrower Settlement Routing Packet" in co_wire.packet_type
    # Assessing composes a draft. Only a dispatch issues an envelope, so the
    # engine must not mint an id that reads as evidence of delivery.
    assert co_wire.docusign_envelope_id is None
    assert co_wire.callback_verification_line == "(614) 480-4401 (Direct Banker Authentication Line)"
    assert co_wire.independent_qi_partner is None

    qi_assessment = LiquidityEngine.assess(default_payoff, tax_strategy="1031_exchange")
    qi_wire = qi_assessment.settlement_wire
    assert qi_wire.borrower_directed_packet is True
    assert qi_wire.independent_qi_partner == "IPX1031 (Investment Property Exchange Services, Inc.)"
    assert qi_wire.account_title == f"IPX1031 as QI for {default_payoff.seller_entity} / Huntington 1031 Escrow"


def test_input_validation_boundary_conditions(default_payoff: PayoffStatement):
    """
    Verifies that the LiquidityEngine enforces positive price overrides and valid tax strategies.
    """
    with pytest.raises(ValueError, match="Sale price override must be positive"):
        LiquidityEngine.assess(default_payoff, sale_price=-50000.00)

    with pytest.raises(ValueError, match="Sale price override must be positive"):
        LiquidityEngine.assess(default_payoff, sale_price=0.0)

    with pytest.raises(ValueError, match="Unsupported tax strategy"):
        LiquidityEngine.assess(default_payoff, tax_strategy="offshore_haven")


