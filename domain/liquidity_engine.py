"""
Huntington Book Scout: Commercial Liquidity Engine
Deep domain module for Commercial Real Estate loan payoff assessment.
"""
import re
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from domain.models import (
    PayoffStatement,
    ValuationMetrics,
    StatutoryDepositoryRoute,
    SettlementWireInstruction,
    ExchangeTimeline,
    LiquidityAssessment,
)

# IRC § 1031(a)(3). Neither is extendable and both run from the same closing.
IDENTIFICATION_WINDOW_DAYS = 45
EXCHANGE_WINDOW_DAYS = 180


def _deal_suffix(payoff_id: str) -> str:
    """The deal-scoped token used in settlement account identifiers.

    Taken from Huntington's own payoff id (`PO-2026-7492` -> `7492`), never from
    the escrow file number. The escrow file belongs to the title company -- the
    signal graph labels it "the requester's file number, not ours" -- and a
    Huntington account number must not embed a third party's identifier.

    This was previously a module constant, which meant every borrower's packet
    carried the same account string. On the 1031 route that put the Vance
    escrow file and payoff id onto a wire instruction the Buckeye principal
    signs.
    """
    match = re.search(r"(\d+)\s*$", payoff_id or "")
    return match.group(1) if match else "0000"


def _exchange_deadlines(closing_date: str) -> tuple[str, str]:
    """Return the 45-day identification and 180-day exchange deadlines, ISO-formatted.

    Both are measured from the closing on the relinquished property. If the
    closing date cannot be parsed the deadlines are returned empty rather than
    guessed -- a wrong statutory deadline is worse than an absent one.

    These are returned as ISO dates, matching `relinquished_closing_date`, and
    deliberately not pre-formatted for display. The consumer needs to do date
    arithmetic on them -- the banker's question is "how many days do I have",
    not "what does the deadline look like" -- and a domain layer that hands
    back "November 22, 2026" forces the caller to parse English back into a
    date before it can answer that. Formatting is the view's job.
    """
    try:
        closing = date.fromisoformat(closing_date)
    except (TypeError, ValueError):
        return "", ""
    ident = closing + timedelta(days=IDENTIFICATION_WINDOW_DAYS)
    final = closing + timedelta(days=EXCHANGE_WINDOW_DAYS)
    return ident.isoformat(), final.isoformat()


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

        `net_equity_proceeds` is sale price less the payoff quote less estimated closing
        costs. It is deliberately **gross of the yield-maintenance prepayment premium and
        of the seller's tax liability** -- capital gains and depreciation recapture on a
        taxable cash-out. Both are real, both reduce the amount that can actually be
        deposited, and neither is modelled here. Treat the result as an upper bound on
        retainable proceeds rather than a settlement figure, and say so wherever it is
        shown to a room.
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
        #
        # Every account identifier below is scoped to the deal. They used to be
        # module-level constants, which meant one account string served all
        # borrowers -- and on the 1031 route it was the Vance deal's string, so
        # the Buckeye principal was asked to sign a wire instruction carrying
        # another borrower's payoff id and the wrong title company's file number.
        suffix = _deal_suffix(payoff.id)
        is_1031 = (tax_strategy == "1031_exchange")
        exchange_timeline: Optional[ExchangeTimeline] = None

        if is_1031:
            qi_escrow_account = f"QI-ESCROW-{suffix}"
            depository_route = StatutoryDepositoryRoute(
                strategy_type="IRC §1031 Like-Kind Exchange (Independent QI Safe Harbor)",
                strategy_product="Huntington 1031 Qualified Escrow Depository (Partnered with IPX1031)",
                yield_apy=4.75,
                statutory_basis="Treas. Reg. § 1.1031(k)-1(g)(3) Qualified Escrow Safe Harbor, with the routine-financial-services carve-out at § 1.1031(k)-1(k)(2)(ii) confirming the bank is not a disqualified person; independent QI (IPX1031). In-house DST placement is firewalled separately, as a securities-conflict control rather than a tax requirement.",
                routing_destination=f"Huntington 1031 Qualified Escrow Depository / Independent QI: IPX1031 (Acct: {qi_escrow_account})",
                deposit_credit_pct=100.0,
                finra_rule_2040_compliant=True,
                model_risk_designation="Relationship Prioritization Triage Estimate",
            )
            wire_account_title = f"IPX1031 as QI for {payoff.seller_entity} / Huntington 1031 Escrow"
            wire_account_number = f"HBAN-QI-{suffix}-01"
            special_instructions = (
                "DO NOT DISBURSE OUTSIDE OF HUNTINGTON ESCROW. Segregated Qualified Escrow account under IPX1031 custody. "
                "Proceeds must not pass through any account titled to the taxpayer; constructive receipt voids the deferral. "
                "Amount is elected by the seller on this authorization; Huntington does not specify a proceeds figure. "
                "Borrower DocuSign Seller Authorization required. Title authentication via Huntington callback line."
            )
            qi_partner = "IPX1031 (Investment Property Exchange Services, Inc.)"

            identification_deadline, exchange_deadline = _exchange_deadlines(
                payoff.scheduled_closing_date
            )
            exchange_timeline = ExchangeTimeline(
                relinquished_closing_date=payoff.scheduled_closing_date,
                identification_deadline=identification_deadline,
                exchange_deadline=exchange_deadline,
                replacement_financing_action=(
                    "Offer acquisition financing on the replacement property. The exchange "
                    "obliges this client to buy inside the window or forfeit the deferral, so "
                    "the only open question is which bank writes the loan."
                ),
                replacement_financing_owner=payoff.commercial_rm,
            )
        else:
            depository_route = StatutoryDepositoryRoute(
                strategy_type="Taxable Liquidity Event (Cash-Out)",
                strategy_product="Huntington Business Premier Insured Cash Sweep (ICS)",
                yield_apy=4.85,
                statutory_basis="12 U.S.C. § 1831f (EGRRCPA § 202 Reciprocal Deposits); Multi-Million FDIC Insurance via IntraFi Network; Commercial RM Deposit FTP Credit.",
                routing_destination=f"Huntington Business Premier Commercial ICS (Acct: HBAN-ICS-{suffix})",
                deposit_credit_pct=100.0,
                finra_rule_2040_compliant=True,
                model_risk_designation="Relationship Prioritization Triage Estimate",
            )
            wire_account_title = f"{payoff.seller_entity} / Business Premier ICS Sweep"
            wire_account_number = f"HBAN-ICS-{suffix}-00"
            special_instructions = (
                "Route seller-elected proceeds to the Huntington Business Premier ICS Sweep account titled above "
                "for FDIC passthrough protection. Amount is elected by the seller on this authorization; Huntington "
                "does not specify a proceeds figure. Seller Closing Authorization accompanies this packet for "
                "borrower execution, together with Huntington's Bank Verification Letter."
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
            officer_signature=cls.OFFICER_SIGNATURE,
            officer_contact=cls.OFFICER_CONTACT,
            packet_type="Borrower Settlement Routing Packet & Official Bank Verification Letter",
            # docusign_envelope_id is deliberately left unset. Assessing a
            # payoff composes a draft; it does not dispatch one. The id is
            # written by the send action once an envelope actually exists.
            delivery_channel="Borrower Direct Execution (DocuSign Envelope) -> Seller Authorization to Title",
            borrower_directed_packet=True,
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
            exchange_timeline=exchange_timeline,
        )
