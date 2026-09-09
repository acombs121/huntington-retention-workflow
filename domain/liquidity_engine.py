"""
Huntington Horizon: Commercial Liquidity Engine
Deep domain module for Commercial Real Estate loan payoff assessment.
"""
from datetime import datetime, timezone
from typing import Optional

from domain.models import (
    PayoffStatement,
    ValuationMetrics,
    StatutoryDepositoryRoute,
    SettlementWireInstruction,
    LiquidityAssessment,
)


class LiquidityEngine:
    """
    Consolidated domain engine responsible for property valuation triage,
    debt netting, statutory depository route selection, and settlement wire formulation.
    """
    DEFAULT_CLOSING_COST_RATE: float = 0.045
    DEFAULT_TITLE_ADDRESS: str = "175 S. 3rd St., Suite 500, Columbus, OH 43215"
    OFFICER_SIGNATURE: str = "Greg Miller, Vice President, Commercial Real Estate"
    OFFICER_CONTACT: str = "greg.miller@huntington.com | (614) 480-4401"
    HUNTINGTON_ABA: str = "044000024"

    @classmethod
    def resolve_sale_price(
        cls,
        payoff: PayoffStatement,
        override_price: Optional[float] = None
    ) -> float:
        """
        Resolves the transaction sale price. If an explicit contract sale price is provided,
        it takes precedence. Otherwise, resolves unstated sale price by capitalizing trailing
        Q1 Net Operating Income (NOI) against the submarket capitalization rate.
        """
        if override_price is not None:
            if override_price <= 0:
                raise ValueError("Sale price override must be positive (> 0)")
            return round(override_price, 2)
        if payoff.noi_trailing_q1 > 0 and payoff.submarket_cap_rate > 0:
            return round(payoff.noi_trailing_q1 / payoff.submarket_cap_rate, 2)
        return round(payoff.payoff_quote_amount, 2)

    @classmethod
    def assess(
        cls,
        payoff: PayoffStatement,
        sale_price: Optional[float] = None,
        tax_strategy: str = "cash_out",
        closing_cost_rate: float = DEFAULT_CLOSING_COST_RATE,
        timestamp: Optional[datetime] = None
    ) -> LiquidityAssessment:
        """
        Primary interface: Performs complete liquidity assessment for an inbound commercial payoff.
        Absorbs valuation math, statutory safe harbor tax rules, and wire instruction generation.
        """
        if tax_strategy not in ("cash_out", "1031_exchange"):
            raise ValueError(f"Unsupported tax strategy '{tax_strategy}'. Must be 'cash_out' or '1031_exchange'.")

        now = timestamp or datetime.now(timezone.utc)
        effective_sale_price = cls.resolve_sale_price(payoff, sale_price)

        # Financial valuation & netting arithmetic
        debt_payoff = round(payoff.payoff_quote_amount, 2)
        estimated_closing_costs = round(effective_sale_price * closing_cost_rate, 2)
        net_equity_proceeds = max(0.0, round(effective_sale_price - debt_payoff - estimated_closing_costs, 2))
        known_hban = round(payoff.known_hban_balances, 2)
        total_position = round(net_equity_proceeds + known_hban, 2)

        valuation = ValuationMetrics(
            sale_price=effective_sale_price,
            grounded_noi=round(payoff.noi_trailing_q1, 2),
            grounded_cap_rate=round(payoff.submarket_cap_rate, 4),
            debt_payoff=debt_payoff,
            estimated_closing_costs=estimated_closing_costs,
            net_equity_proceeds=net_equity_proceeds,
            known_hban_balances=known_hban,
            total_resolvable_position=total_position,
        )

        # Statutory Depository Route selection
        is_1031 = (tax_strategy == "1031_exchange")
        if is_1031:
            depository_route = StatutoryDepositoryRoute(
                strategy_type="IRC §1031 Like-Kind Exchange (Independent QI Safe Harbor)",
                strategy_product="Huntington 1031 Qualified Escrow Depository (Partnered with IPX1031)",
                yield_apy=4.75,
                statutory_basis="Treas. Reg. § 1.1031(k)-1(g)(3) Qualified Escrow Safe Harbor; Partner QI (IPX1031); In-House DST Cross-Sell Strictly Firewalled per § 1.1031(k)-1(k)(2).",
                routing_destination="Huntington Institutional QI Escrow Custody (Acct: QI-ESCROW-8821)",
                deposit_credit_pct=100.0,
                finra_rule_2040_compliant=True,
                occ_sr11_7_designation="Relationship Prioritization Triage Estimate",
            )
            wire_account_title = f"IPX1031 as QI for {payoff.seller_entity} / Huntington 1031 Escrow"
            wire_account_number = "HBAN-QI-8819-01"
            special_instructions = (
                "DO NOT DISBURSE OUTSIDE OF HUNTINGTON ESCROW. Segregated Qualified Escrow account under IPX1031 custody. "
                "Borrower DocuSign Seller Authorization required. Title authentication via Huntington callback line."
            )
            qi_partner = "IPX1031 (Investment Property Exchange Services, Inc.)"
        else:
            depository_route = StatutoryDepositoryRoute(
                strategy_type="Taxable Liquidity Event (Cash-Out)",
                strategy_product="Huntington Business Premier Insured Cash Sweep (ICS)",
                yield_apy=4.85,
                statutory_basis="12 U.S.C. § 1831f (EGRRCPA § 202 Reciprocal Deposits); Multi-Million FDIC Insurance via IntraFi Network; Commercial RM Deposit FTP Credit.",
                routing_destination="Huntington Business Premier Commercial ICS (Acct: HBAN-ICS-4401)",
                deposit_credit_pct=100.0,
                finra_rule_2040_compliant=True,
                occ_sr11_7_designation="Relationship Prioritization Triage Estimate",
            )
            wire_account_title = f"{payoff.seller_entity} / Business Premier ICS Sweep"
            wire_account_number = "HBAN-4401-9921-00"
            special_instructions = (
                "Disburse net seller equity directly into Huntington Business Premier ICS Sweep for FDIC passthrough protection. "
                "Pre-filled Seller Closing Authorization delivered via DocuSign to borrower with Bank Verification Letter."
            )
            qi_partner = None

        # Settlement Wire Instruction Letter assembly
        letter_id = f"HBAN-WIRE-{int(now.timestamp())}"
        letter_date = now.strftime("%B %d, %Y")
        attention = f"{payoff.settlement_officer}, Commercial Escrow Officer"

        settlement_wire = SettlementWireInstruction(
            letter_id=letter_id,
            date=letter_date,
            title_company=payoff.title_company,
            title_address=cls.DEFAULT_TITLE_ADDRESS,
            attention=attention,
            escrow_file=payoff.escrow_file_number,
            property=f"{payoff.property_name}, {payoff.property_address}",
            seller_entity=payoff.seller_entity,
            managing_member=payoff.managing_member,
            bank_name="The Huntington National Bank",
            aba_routing=cls.HUNTINGTON_ABA,
            account_title=wire_account_title,
            account_number=wire_account_number,
            special_instructions=special_instructions,
            indicative_net_disbursement=net_equity_proceeds,
            officer_signature=cls.OFFICER_SIGNATURE,
            officer_contact=cls.OFFICER_CONTACT,
            packet_type="Borrower Settlement Routing Packet & Official Bank Verification Letter",
            docusign_envelope_id=f"ENV-HBAN-20260904-{payoff.id.split('-')[-1]}",
            delivery_channel="Borrower Direct Execution (DocuSign Envelope) -> Seller Authorization to Title",
            alta_pillar_2_compliant=True,
            callback_verification_line="(614) 480-4401 (Direct Banker Authentication Line)",
            independent_qi_partner=qi_partner,
        )

        return LiquidityAssessment(
            payoff_id=payoff.id,
            borrower_entity=payoff.borrower_entity,
            property_name=payoff.property_name,
            valuation=valuation,
            depository_route=depository_route,
            settlement_wire=settlement_wire,
        )
