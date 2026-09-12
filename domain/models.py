"""
Huntington Book Scout: Domain Models
Explicit domain types for Commercial Liquidity Orchestration.
Follows ubiquitous language documented in docs/CONTEXT.md.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel


class PayoffStatement(BaseModel):
    """
    The formal demand document received from a title company or escrow officer.
    """
    id: str = "PO-2026-8821"
    borrower_entity: str = "Vance Riverfront Properties IV, LLC"
    property_name: str = "Riverfront Commercial Commons"
    property_address: str = "410 S. High Street, Columbus, OH 43215"
    property_type: str = "Class A Multi-Tenant Office / Mixed Commercial"
    title_company: str = "First American Title Insurance Co."
    settlement_officer: str = "Karen Lindqvist"
    escrow_file_number: str = "FA-2026-8819-COL"
    payoff_statement_date: str = "2026-08-28"
    scheduled_closing_date: str = "2026-09-16"
    days_to_close: int = 12
    priority_tier: str = "Critical (T-12)"
    existing_debt_upb: float = 5180000.00
    per_diem_interest: float = 692.50
    payoff_quote_amount: float = 5214800.00
    credit_risk_rating: str = "Pass (Tier 2)"
    commercial_rm: str = "Greg Miller"
    assigned_pwa: str = "Sarah Jenkins"
    unstated_sale_price: bool = True
    noi_trailing_q1: float = 637500.00
    submarket_cap_rate: float = 0.075
    known_hban_balances: float = 2100000.00
    managing_member: str = "Marcus Vance"
    primary_guarantor: Optional[str] = None
    seller_entity: Optional[str] = None

    def model_post_init(self, __context):
        if not self.primary_guarantor:
            self.primary_guarantor = self.managing_member
        if not self.seller_entity:
            self.seller_entity = self.borrower_entity


class ValuationMetrics(BaseModel):
    """
    Computed financial parameters for the commercial real estate liquidity event.
    """
    sale_price: float
    grounded_noi: float
    grounded_cap_rate: float
    debt_payoff: float
    estimated_closing_costs: float
    net_equity_proceeds: float
    known_hban_balances: float
    total_resolvable_position: float


class StatutoryDepositoryRoute(BaseModel):
    """
    Designated institutional deposit destination preserving client wealth under tax code.
    """
    strategy_type: str
    strategy_product: str
    yield_apy: float
    statutory_basis: str
    routing_destination: str
    deposit_credit_pct: float = 100.0
    finra_rule_2040_compliant: bool = True
    occ_sr11_7_designation: str = "Relationship Prioritization Triage Estimate"


class SettlementWireInstruction(BaseModel):
    """
    Verified bank settlement account routing packet delivered to borrower for seller title authorization,
    accompanied by official bank verification letter for ALTA Pillar 2 callback authentication.
    """
    letter_id: str
    date: str
    title_company: str
    title_address: str
    attention: str
    escrow_file: str
    property: str
    seller_entity: str
    managing_member: str
    bank_name: str = "The Huntington National Bank"
    aba_routing: str = "044000024"
    account_title: str
    account_number: str
    special_instructions: str
    indicative_net_disbursement: float
    officer_signature: str
    officer_contact: str
    packet_type: str = "Borrower Settlement Routing Packet & Official Bank Verification Letter"
    docusign_envelope_id: str = "ENV-HBAN-20260904-8821"
    delivery_channel: str = "Borrower Direct Execution (DocuSign Envelope) -> Seller Authorization to Title"
    alta_pillar_2_compliant: bool = True
    callback_verification_line: str = "(614) 480-4401 (Direct Banker Authentication Line)"
    independent_qi_partner: Optional[str] = None


class LiquidityAssessment(BaseModel):
    """
    Consolidated domain evaluation of a commercial payoff event.
    Combines valuation triage, statutory depository routing, and verified wire instructions.
    """
    payoff_id: str
    borrower_entity: str
    property_name: str
    valuation: ValuationMetrics
    depository_route: StatutoryDepositoryRoute
    settlement_wire: SettlementWireInstruction

    def to_legacy_valuation_dict(self) -> Dict[str, Any]:
        """
        Maps to the legacy /api/valuation response schema for HTTP backward compatibility.
        """
        return {
            "sale_price": self.valuation.sale_price,
            "grounded_noi": self.valuation.grounded_noi,
            "grounded_cap_rate": self.valuation.grounded_cap_rate,
            "debt_payoff": self.valuation.debt_payoff,
            "estimated_closing_costs": self.valuation.estimated_closing_costs,
            "net_equity_proceeds": self.valuation.net_equity_proceeds,
            "known_hban_balances": self.valuation.known_hban_balances,
            "total_resolvable_position": self.valuation.total_resolvable_position,
            "strategy_type": self.depository_route.strategy_type,
            "strategy_product": self.depository_route.strategy_product,
            "yield_apy": self.depository_route.yield_apy,
            "statutory_basis": self.depository_route.statutory_basis,
            "routing_destination": self.depository_route.routing_destination,
            "deposit_credit_pct": self.depository_route.deposit_credit_pct,
            "finra_rule_2040_compliant": self.depository_route.finra_rule_2040_compliant,
            "occ_sr11_7_designation": self.depository_route.occ_sr11_7_designation,
        }


class FusedSignal(BaseModel):
    category: str
    signal_name: str
    source: str
    observation: str
    risk_impact: str
    verdict: str


class HypothesisEvaluation(BaseModel):
    hypothesis: str
    confidence_pct: int
    status: str
    rationale: str


class DetectionReasoningTrace(BaseModel):
    payoff_id: str
    confidence_score: int
    urgency_tier: str
    classification: str
    summary_verdict: str
    model_agent: str = "gemini-3.7-flash (Multimodal Signal Fusion)"
    evaluation_timestamp: str
    fused_signals: list[FusedSignal]
    hypotheses: list[HypothesisEvaluation]
    trace_steps: list[str]
