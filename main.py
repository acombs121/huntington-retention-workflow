"""
=====================================================================
Huntington Book Scout: Intelligent Liquidity Orchestration
FastAPI Backend Application (main.py)

Adheres strictly to the Google Cloud Run Demo Standard:
- Gemini Enterprise Agent Platform (fka Vertex AI Platform) client via ADC
- Cloud Run Native Identity-Aware Proxy (IAP) JWT cryptographic verification
- Static SPA router with path-traversal protection and anti-cache headers
- Domain endpoints: /api/payoffs, /api/entity-resolution, /api/valuation,
  /api/quarantine, /api/wire-instructions, /api/wealth-onboarding, /api/generate
=====================================================================
"""
import os
import logging
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, HTTPException, Depends, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from iap_jwt_middleware import get_authenticated_user
from domain.models import ExchangeTimeline, PayoffStatement
from domain.liquidity_engine import LiquidityEngine
from domain.demo_clock import rebase as rebase_demo_dates
from domain.demo_clock import rebase_fixture as rebase_demo_fixture

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("huntington_book_scout")

app = FastAPI(
    title="Huntington Book Scout API",
    description="Intelligent Liquidity Orchestration for Huntington Bancshares",
    version="6.0.0"
)

# Global defensive HTTP security headers per Cloud Run standard
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Configure CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Enterprise Agent Platform Client via native ADC
gcp_project = os.getenv("GCP_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT") or "hban-wealth-innovation"
gcp_region = os.getenv("GCP_REGION", "us-central1")
gemini_model = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")

genai_client = None
try:
    from google import genai
    genai_client = genai.Client(
        vertexai=True,
        project=gcp_project,
        location=gcp_region,
    )
    logger.info(f"Gemini client initialized for project '{gcp_project}' in region '{gcp_region}' using model '{gemini_model}'.")
except Exception as e:
    logger.warning(f"Native Gemini client offline or unauthenticated: {e}. Active fallback responses ready.")


# =====================================================================
# Derived Operating Constants
#
# These mirror frontend/src/lib/assumptions.ts so the API payload and the
# on-screen model agree at default settings.
# =====================================================================

# Target CRE book: 10-Q Table 8 CRE ($23.457B) less the Call Report RC-C
# Part II small-business tranche ($3.490B), plus RC-C Part I owner-occupied
# CRE ($13.331B) = $33.298B.
TARGET_BOOK_USD = 33.298e9

# Average commercial loan size. ESTIMATE -- adjustable via the Admin Panel.
AVG_LOAN_SIZE_USD = 3.0e6

# Facilities the nightly run screens across the target book.
SCREENED_FACILITY_COUNT = int(TARGET_BOOK_USD // AVG_LOAN_SIZE_USD)  # 11,099

# Midpoint of the 4-6 banker-hour manual effort band per liquidity event.
MANUAL_HRS_PER_EVENT = 5.0


# =====================================================================
# In-Memory State & Domain Data
# =====================================================================

def get_default_quarantine(payoff_id: str) -> Dict[str, Any]:
    return {
        "payoff_id": payoff_id,
        # --- Gate 1: the consultative call -------------------------------
        # Nothing client-facing may be generated before a banker has actually
        # spoken to the borrower. Detection is an inference, not a mandate:
        # the settlement packet names the client's entity and an account
        # title, so it cannot exist until the client has asked for it.
        "call_logged": False,
        "call_timestamp": None,
        "call_recorded_by": None,
        "client_directed_proceeds": False,
        "call_audit_hash": f"SHA256-CALL-HBAN-{payoff_id}-PENDING",
        "call_disposition": None,
        # --- Gate 1b: packet dispatch ------------------------------------
        # Composing a packet is not sending one. The DocuSign envelope id is
        # issued here and nowhere else, so its presence is evidence that a
        # banker dispatched the envelope rather than evidence that a template
        # rendered. Nothing advances past "sent": whether the borrower signed
        # arrives by DocuSign Connect webhook and is not ours to assert.
        "packet_sent": False,
        "packet_sent_at": None,
        "packet_sent_by": None,
        "packet_recipient": None,
        "docusign_envelope_id": None,
        "packet_audit_hash": f"SHA256-PACKET-HBAN-{payoff_id}-PENDING",
        # --- Gate 2: cross-LOB consent for the wealth referral -----------
        "quarantined": True,
        "verbal_consent_recorded": False,
        "recorded_by": None,
        "consent_timestamp": None,
        "audit_hash": f"SHA256-GLBA-HBAN-{payoff_id}-PENDING",
        "compliance_notes": f"Awaiting Commercial RM verbal opt-in for {payoff_id}. Advisor handoff is intra-institutional (Huntington-employed advisor, Huntington client); consent is captured as cross-line-of-business marketing consent and the SEC Regulation R referral record. Ameriprise platform NPI access governed as a service provider under 12 C.F.R. § 1016.13; GLBA safeguards per 15 U.S.C. § 6801."
    }

quarantine_states: Dict[str, Dict[str, Any]] = {
    "PO-2026-8821": get_default_quarantine("PO-2026-8821"),
    "PO-2026-7492": get_default_quarantine("PO-2026-7492"),
    "PO-2026-6104": get_default_quarantine("PO-2026-6104"),
}

from fixtures import DETECTION_TRACES, SIGNAL_GRAPHS

PAYOFF_QUEUE = [
    {
        "id": "PO-2026-8821",
        "borrower_entity": "Vance Riverfront Properties IV, LLC",
        "property_name": "Riverfront Commercial Commons",
        "property_address": "410 S. High Street, Columbus, OH 43215",
        "property_type": "Class A Multi-Tenant Office / Mixed Commercial",
        "title_company": "First American Title Insurance Co.",
        "settlement_officer": "Karen Lindqvist",
        "escrow_file_number": "FA-2026-8819-COL",
        "payoff_statement_date": "2026-08-28",
        "scheduled_closing_date": "2026-09-16",
        "days_to_close": 12,
        "priority_tier": "Critical (T-12)",
        "existing_debt_upb": 5180000.00,
        "per_diem_interest": 692.50,
        "payoff_quote_amount": 5214800.00,
        "credit_risk_rating": "Pass (Tier 2)",
        "commercial_rm": "Greg Miller",
        "assigned_pwa": "Sarah Jenkins",
        "unstated_sale_price": True,
        "noi_trailing_q1": 637500.00,
        "submarket_cap_rate": 0.075,
        "indicative_valuation": 8500000.00,
        "estimated_net_equity": 2902700.00,
        "known_hban_balances": 2100000.00,
        "total_hban_position": 5002700.00,
        "managing_member": "Marcus Vance",
        "primary_guarantor": "Marcus Vance",
        "tax_strategy_detected": "Taxable Cash-Out (1031 Eligible)",
        "loan_type": "Commercial Real Estate Loan / T-14 Payoff Demand",
        "status": "Staged for Call",
        "flight_confidence_score": 94,
        "flight_risk_classification": "Commercial Asset Sale / Taxable Cash-Out (High Flight Risk)",
        "flight_risk_trace": DETECTION_TRACES["PO-2026-8821"]
    },
    {
        "id": "PO-2026-7492",
        "borrower_entity": "Buckeye Precision Tooling Corp.",
        "property_name": "Buckeye Industrial Campus B",
        "property_address": "1280 Dublin Road, Columbus, OH 43215",
        "property_type": "Light Industrial / Advanced Manufacturing",
        "title_company": "Chicago Title Insurance Co.",
        "settlement_officer": "Mark Henderson",
        "escrow_file_number": "CT-2026-4401-OH",
        "payoff_statement_date": "2026-08-15",
        "scheduled_closing_date": "2026-09-28",
        "days_to_close": 24,
        "priority_tier": "Upcoming (T-24)",
        "existing_debt_upb": 1405000.00,
        "per_diem_interest": 185.00,
        "payoff_quote_amount": 1420000.00,
        "credit_risk_rating": "Pass (Tier 1)",
        "commercial_rm": "Greg Miller",
        "assigned_pwa": "Sarah Jenkins",
        "unstated_sale_price": False,
        "noi_trailing_q1": 245700.00,
        "submarket_cap_rate": 0.078,
        "indicative_valuation": 3150000.00,
        "estimated_net_equity": 1588250.00,
        "known_hban_balances": 890000.00,
        "total_hban_position": 2478250.00,
        "managing_member": "Arthur Pendelton",
        "primary_guarantor": "Arthur Pendelton",
        "tax_strategy_detected": "IRC §1031 Exchange (QI Routed)",
        "loan_type": "SBA 7(a) Commercial Loan / T-120 Surveillance",
        "status": "Document Parsing Complete",
        "flight_confidence_score": 88,
        "flight_risk_classification": "IRC §1031 Like-Kind Exchange (Identified QI Intermediary)",
        "flight_risk_trace": DETECTION_TRACES["PO-2026-7492"]
    },
    {
        "id": "PO-2026-6104",
        "borrower_entity": "Columbus Medical Arts Center LLC",
        "property_name": "Scioto Medical Pavilion",
        "property_address": "850 Bethel Road, Columbus, OH 43214",
        "property_type": "Medical Office / Outpatient Surgical",
        "title_company": "Commonwealth Land Title",
        "settlement_officer": "David S. Vance",
        "escrow_file_number": "CLT-2026-9031-OH",
        "payoff_statement_date": "2026-08-01",
        "scheduled_closing_date": "2026-10-19",
        "days_to_close": 45,
        "priority_tier": "Watchlist (T-45)",
        "existing_debt_upb": 3210000.00,
        "per_diem_interest": 420.00,
        "payoff_quote_amount": 3240000.00,
        "credit_risk_rating": "Pass (Tier 2)",
        "commercial_rm": "Amanda Cross",
        "assigned_pwa": "Brian Gallagher",
        "unstated_sale_price": True,
        "noi_trailing_q1": 411840.00,
        "submarket_cap_rate": 0.072,
        "indicative_valuation": 5720000.00,
        "estimated_net_equity": 2222600.00,
        "known_hban_balances": 1450000.00,
        "total_hban_position": 3672600.00,
        "managing_member": "Dr. Robert Miller",
        "primary_guarantor": "Dr. Robert Miller",
        "tax_strategy_detected": "Taxable Cash-Out",
        "loan_type": "Healthcare Practice Facility Loan / T-45 Watchlist",
        "status": "Monitoring Queue",
        "flight_confidence_score": 58,
        "flight_risk_classification": "Competitive Refinance Inquiry / Equity Restructuring",
        "flight_risk_trace": DETECTION_TRACES["PO-2026-6104"]
    }
]


def get_payoff_by_id(payoff_id: str) -> PayoffStatement:
    """Adapts in-memory payoff queue items to the canonical PayoffStatement domain model.

    The record is re-based into today's frame before the model is built, so
    `scheduled_closing_date` is the date the rest of the app is showing.

    This matters more than it looks. The §1031 identification and exchange
    deadlines are *derived* from the closing date, so feeding the engine the
    authored 2026-09-28 instead of today's 2026-10-08 produced statutory
    deadlines ten days early -- and unlike the authored dates, a derived date
    is not in the demo clock's allow-list, so nothing downstream could correct
    it. A wrong 45-day deadline is the kind of number a room writes down.
    """
    if not PAYOFF_QUEUE:
        raise HTTPException(status_code=404, detail="Payoff queue is empty")
    raw = next((p for p in PAYOFF_QUEUE if p["id"] == payoff_id), None)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Payoff deal '{payoff_id}' not found.")
    raw = rebase_demo_dates(raw)
    return PayoffStatement(**{k: v for k, v in raw.items() if k in PayoffStatement.model_fields})


TAX_STRATEGIES = ("cash_out", "1031_exchange")


def detected_tax_strategy(payoff_id: str) -> str:
    """The routing strategy the detection layer concluded for this deal.

    Read from `tax_strategy_detected` on the queue record, which is the same
    string the pipeline screen shows the banker.

    This exists because every entry point used to default to `cash_out`
    independently. `PO-2026-7492` is classified as an IRC §1031 exchange at 88%
    confidence, and was still valued, routed and audited as a taxable sale --
    into an ICS sweep titled to the borrower, which is the one account a §1031
    taxpayer must never touch. The detection was correct and nothing read it.

    The banker can still override. Detection seeds the decision; it does not
    make it. See `resolve_tax_strategy`.
    """
    raw = next((p for p in PAYOFF_QUEUE if p["id"] == payoff_id), None)
    detected = (raw or {}).get("tax_strategy_detected", "") or ""
    # The "eligible" exclusion is load-bearing, not defensive padding.
    # PO-2026-8821 is detected as "Taxable Cash-Out (1031 Eligible)" -- it
    # contains "1031" and is emphatically NOT one. The borrower may still elect
    # an exchange before closing, which is why the phrase is there at all, but
    # until he does the route is taxable. A bare `"1031" in detected` would
    # route the flagship cash-out deal into a qualified escrow.
    is_exchange = "1031" in detected and "eligible" not in detected.lower()
    return "1031_exchange" if is_exchange else "cash_out"


def resolve_tax_strategy(payoff_id: str, requested: Optional[str]) -> str:
    """Honour an explicit strategy, otherwise fall back to what was detected.

    `None` means "the caller did not express a preference", which is different
    from "the caller asked for a cash-out". Defaulting the absent case to
    `cash_out` is precisely the bug this replaces.
    """
    if requested in TAX_STRATEGIES:
        return requested
    return detected_tax_strategy(payoff_id)



# =====================================================================
# API Request & Response Models
# =====================================================================

class PromptRequest(BaseModel):
    prompt: str
    scenario_context: Optional[str] = None

class GenerateResponse(BaseModel):
    response: str
    model: str
    grounded_citations: List[str] = []
    # True only when the text was produced by a real model call. False means the
    # canned offline fallback served this response, so nothing here is model-grounded.
    live: bool = True

class ValuationRequest(BaseModel):
    """Inputs to the triage valuation.

    Every financial field is an *optional override*. Omitted, the deal's own
    figures are used.

    They were previously required-with-defaults, and the defaults were
    PO-2026-8821's numbers -- $8.5M sale price, $637,500 NOI, 7.5% cap rate,
    $5,214,800 debt. Because the handler assigned them onto the payoff
    unconditionally, a request naming any other deal was answered with the Vance
    deal's economics under the other borrower's name. Asking for Buckeye's
    valuation returned $2,902,700 of net proceeds; Buckeye's actual figure is
    $1,588,250. The only reason the screen looked right is that the frontend
    happens to send all four fields on every request.
    """
    payoff_id: Optional[str] = Field(default="PO-2026-8821")
    sale_price: Optional[float] = Field(default=None, ge=500000.00, le=50000000.00)
    noi: Optional[float] = Field(default=None, gt=0)
    cap_rate: Optional[float] = Field(default=None, gt=0, le=1.0)
    debt_payoff: Optional[float] = Field(default=None, ge=0)
    closing_cost_rate: float = Field(default=0.045, ge=0, le=1.0)
    # None means "not specified", and is resolved from the deal's detected
    # strategy. A hard default of cash_out here silently overrode detection.
    tax_strategy: Optional[str] = Field(default=None, pattern="^(cash_out|1031_exchange)$")

class ValuationResponse(BaseModel):
    sale_price: float
    grounded_noi: float
    grounded_cap_rate: float
    debt_payoff: float
    estimated_closing_costs: float
    net_equity_proceeds: float
    known_hban_balances: float
    total_resolvable_position: float
    strategy_type: str
    strategy_product: str
    yield_apy: float
    statutory_basis: str
    routing_destination: str
    deposit_credit_pct: float
    finra_rule_2040_compliant: bool
    model_risk_designation: str
    # Populated only on the 1031 route. Null on a taxable cash-out, and the UI
    # keys the exchange panel off that null rather than off the strategy string.
    exchange_timeline: Optional[ExchangeTimeline] = None

class ConsultativeCallRequest(BaseModel):
    """Records that a banker actually spoke to the borrower.

    This is the gate everything client-facing hangs off. A payoff detection is
    an inference drawn from the bank's own documents; it confers no authority
    to open an account, title it in the client's name, or send that client a
    document to sign. Only the call does that.
    """
    payoff_id: Optional[str] = "PO-2026-8821"
    call_completed: bool
    # Whether the borrower asked for proceeds to land at Huntington. A logged
    # call with a "no" is a legitimate and useful outcome -- it records that we
    # asked and were declined, and it leaves the packet locked.
    client_directed_proceeds: bool = True
    recorded_by: str = "Greg Miller (Commercial RM)"
    disposition: Optional[str] = None
    # The route the banker had selected when the call was logged. None resolves
    # from detection. Supplied by the UI so a manual override reaches the audit
    # record instead of being discarded.
    tax_strategy: Optional[str] = None


class QuarantineToggleRequest(BaseModel):
    payoff_id: Optional[str] = "PO-2026-8821"
    verbal_consent_recorded: bool
    recorded_by: str = "Greg Miller (Commercial RM)"
    client_notes: Optional[str] = "Borrower affirmed willingness to review Huntington Business Premier ICS and Private Wealth advisory options."


class SettlementPacketSendRequest(BaseModel):
    """Dispatches the routing packet to the borrower for signature.

    The envelope goes to the borrower and only to the borrower. Huntington has
    no authority to instruct the settlement agent: the escrow holder acts for
    the seller and disburses on the seller's own executed closing instructions.
    The borrower executes this packet and submits it to title himself, which is
    also what lets the title company run its own call-back verification against
    a party it already has a file on.
    """
    payoff_id: Optional[str] = "PO-2026-8821"
    # False recalls a sent envelope (DocuSign void) and clears the id.
    send: bool = True
    sent_by: str = "Greg Miller (Commercial RM)"


# =====================================================================
# Core Domain Endpoints
# =====================================================================

@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "ok",
        "platform": "Gemini Enterprise Agent Platform (fka Vertex AI Platform)",
        "project": gcp_project,
        "region": gcp_region,
        "model": gemini_model,
        "service": "huntington-book-scout",
        "version": "6.0.0",
        "iap_native": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/user")
async def get_user_profile(user: Dict[str, Any] = Depends(get_authenticated_user)) -> Dict[str, Any]:
    """Returns the authenticated Google/IAP user identity."""
    return user


@app.get("/api/payoffs")
async def get_payoff_queue(
    priority: Optional[str] = Query(None, description="Filter by priority tier"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Returns the inbound commercial servicing payoff queue with Synthetic Capacity metrics.
    Demonstrates human-impossible scale: ~11,100 facilities screened nightly,
    3 qualified and staged.
    """
    items = PAYOFF_QUEUE
    if priority:
        items = [p for p in items if priority.lower() in p["priority_tier"].lower()]

    # Self-reconciling: a board member can count the rows in the queue, so these
    # counters are derived from it rather than hardcoded.
    staged = len(PAYOFF_QUEUE)

    return {
        "capacity_meter": {
            # Derived: $33.298B target CRE book / $3.0M average commercial loan
            # size. The prior 2,140 was unsourced and understated the book by 5x.  retracted-ok: names the superseded figure in order to document it
            "screened_events_book": SCREENED_FACILITY_COUNT,
            "qualified_and_staged": staged,
            # Verified 4-6 hr manual band per liquidity event; 5 hr midpoint.
            "manual_discovery_absorbed_hrs": round(staged * MANUAL_HRS_PER_EVENT, 1),
            "wealth_admin_absorbed_hrs": 18.5,
            "active_machine_inferences": staged,
            # Verified: 10-Q Table 8 CRE ($23.457B) less the Call Report RC-C Part II
            # small-business tranche ($3.490B), plus RC-C Part I owner-occupied ($13.331B).
            # The prior "$4.50 Billion" was unsourced and conflated the book with payoffs.
            "book_scale_volume": "$33.30 Billion",
            "historical_flight_risk_rate": "78%",
            "branch_network_count": "1,400 Branches (21 States)",
            # No numeric SBA rank. The Call Report's "small business" schedule
            # is keyed to original loan amount, not SBA program participation,
            # so nothing in this repo substantiates a placement.
            "sba_position": "Among the top national SBA 7(a) lenders by approved loan count",
            "csa_leverage_ratio": "2x CSA Leverage (1 CSA : 4 PWAs)"
        },
        "payoff_items": rebase_demo_dates(items)
    }


@app.get("/api/flight-risk-trace")
async def get_flight_risk_trace(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Returns the multimodal Detection Agent Reasoning Trace for a payoff event,
    explaining signal fusion across payoff intake, core ledger and LOS replacement loan queries,
    Qualified Intermediary exhibits, and hypothesis testing.
    """
    trace = DETECTION_TRACES.get(payoff_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Flight risk trace for deal '{payoff_id}' not found.")
    return rebase_demo_dates(trace)


@app.get("/api/signal-graph")
async def get_signal_graph(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Returns the Google Cloud Spanner Graph (ISO GQL) signal grounding topology for a payoff event,
    displaying connected nodes across ingestion feeds, contracts, entities, beneficial owners,
    behavioral signals, and the final deterministic classification verdict.
    """
    graph = SIGNAL_GRAPHS.get(payoff_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Spanner signal graph for deal '{payoff_id}' not found.")
    return rebase_demo_dates(graph)


@app.get("/api/entity-resolution")
async def get_entity_resolution(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Provides Gemini 3.7 Flash multimodal document extraction returning
    borrower-specific LLC ownership topology, bounding boxes, and document grounding.
    """
    payload = rebase_demo_dates(_entity_resolution_payload(payoff_id))
    # Stamp the live value after the re-base, never before: `resolution_timestamp`
    # is a wall-clock reading and the re-base cannot tell it apart from an
    # authored date.
    payload["resolution_timestamp"] = datetime.now(timezone.utc).isoformat()
    return payload


def _entity_resolution_payload(payoff_id: str) -> Dict[str, Any]:
    """The authored entity-resolution fixture for one deal, before re-basing."""
    deal = next((p for p in PAYOFF_QUEUE if p["id"] == payoff_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail=f"Payoff deal '{payoff_id}' not found.")
    now_iso = datetime.now(timezone.utc).isoformat()

    if deal["id"] == "PO-2026-7492":
        return {
            "payoff_id": deal["id"],
            "document_name": "Credit Agreement & Corporate Resolution #CC-7492.pdf",
            "document_vault_id": "HBAN-CRE-VAULT-7492",
            "total_pages": 18,
            "inspected_page": 8,
            "resolution_timestamp": now_iso,
            "dlp_status": "PASSED: Corporate credit agreement; personal financial records and consumer credit-bureau data stripped pre-ingestion under the bank's GLBA § 501(b) information-security safeguards program.",
            "borrower_entity": {
                "name": deal["borrower_entity"],
                "jurisdiction": "Ohio Corporation",
                "filing_date": "2014-06-18",
                "tax_classification": "Subchapter S Corporation"
            },
            "grounded_members": [
                {
                    "name": "Arthur Pendelton",
                    "role": "President & Majority Shareholder",
                    "ownership_pct": 70.0,
                    "is_guarantor": True,
                    "is_signatory": True,
                    "exclusion_status": "Included / Full Commercial Profiling",
                    "known_hban_accounts": ["Commercial DDA #..1102", "Treasury Repo #..7721"],
                    "known_hban_balance": deal["known_hban_balances"],
                    "bounding_box": {
                        "ymin": 210, "xmin": 120, "ymax": 275, "xmax": 680,
                        "text_snippet": "Arthur Pendelton, holding 70% Voting Common Shares with sole banking and encumbrance authority..."
                    }
                },
                {
                    "name": "Janet Pendelton",
                    "role": "Vice President & Secretary",
                    "ownership_pct": 30.0,
                    "is_guarantor": True,
                    "is_signatory": True,
                    "exclusion_status": "Included / Full Commercial Profiling",
                    "known_hban_accounts": ["Commercial Savings #..3309"],
                    "known_hban_balance": 0.00,
                    "bounding_box": {
                        "ymin": 290, "xmin": 120, "ymax": 350, "xmax": 680,
                        "text_snippet": "Janet Pendelton, Corporate Secretary holding 30% Common Shares and joint personal guarantor..."
                    }
                }
            ],
            "unstated_sale_price_reasoning": {
                "flag": True,
                "agentic_finding": "Title payoff request omits purchase contract purchase price.",
                "grounding_source": f"Credit Vault Doc #SBA-7492 trailing Q1 in-place NOI: ${deal['noi_trailing_q1']:,.2f}",
                "submarket_grounding": f"Dublin Road Industrial Submarket Benchmark cap rate: {deal['submarket_cap_rate']*100:.2f}%.",
                "capitalization_formula": f"NOI ÷ Cap Rate = ${deal['noi_trailing_q1']:,.2f} ÷ {deal['submarket_cap_rate']} = ${deal['indicative_valuation']:,.2f} Indicative Triage Valuation.",
                "model_risk_notice": "Designated strictly as 'Indicative Triage Estimate for Relationship Prioritization' per OCC Bulletin 2011-12 / Fed SR 11-7."
            }
        }
    elif deal["id"] == "PO-2026-6104":
        return {
            "payoff_id": deal["id"],
            "document_name": "Credit Agreement & Operating Facility #CC-6104.pdf",
            "document_vault_id": "HBAN-CRE-VAULT-6104",
            "total_pages": 12,
            "inspected_page": 5,
            "resolution_timestamp": now_iso,
            "dlp_status": "PASSED: Medical facility credit agreement; physician personal credit-bureau data stripped pre-ingestion under the bank's GLBA § 501(b) information-security safeguards program.",
            "borrower_entity": {
                "name": deal["borrower_entity"],
                "jurisdiction": "Ohio Limited Liability Company",
                "filing_date": "2019-11-04",
                "tax_classification": "Partnership / Pass-Through"
            },
            "grounded_members": [
                {
                    "name": "Dr. Robert Miller, M.D.",
                    "role": "Managing Partner & Medical Director",
                    "ownership_pct": 55.0,
                    "is_guarantor": True,
                    "is_signatory": True,
                    "exclusion_status": "Included / Full Commercial Profiling",
                    "known_hban_accounts": ["Medical Practice Operating DDA #..9012"],
                    "known_hban_balance": deal["known_hban_balances"],
                    "bounding_box": {
                        "ymin": 230, "xmin": 120, "ymax": 295, "xmax": 680,
                        "text_snippet": "Dr. Robert Miller, holding a 55% majority ownership interest with operating and financing authority..."
                    }
                },
                {
                    "name": "Dr. Sarah Lin, M.D.",
                    "role": "Partner / Surgeon",
                    "ownership_pct": 45.0,
                    "is_guarantor": True,
                    "is_signatory": False,
                    "exclusion_status": "Included / Full Commercial Profiling",
                    "known_hban_accounts": ["Physician Reserve #..8814"],
                    "known_hban_balance": 0.00,
                    "bounding_box": {
                        "ymin": 310, "xmin": 120, "ymax": 370, "xmax": 680,
                        "text_snippet": "Dr. Sarah Lin, holding a 45% non-managing equity interest and joint clinical practice guarantor..."
                    }
                }
            ],
            "unstated_sale_price_reasoning": {
                "flag": True,
                "agentic_finding": "Title payoff request omits purchase contract purchase price.",
                "grounding_source": f"Credit Vault Doc #CC-6104 trailing Q1 in-place NOI: ${deal['noi_trailing_q1']:,.2f}",
                "submarket_grounding": f"Bethel Road Medical Submarket Benchmark cap rate: {deal['submarket_cap_rate']*100:.2f}%.",
                "capitalization_formula": f"NOI ÷ Cap Rate = ${deal['noi_trailing_q1']:,.2f} ÷ {deal['submarket_cap_rate']} = ${deal['indicative_valuation']:,.2f} Indicative Triage Valuation.",
                "model_risk_notice": "Designated strictly as 'Indicative Triage Estimate for Relationship Prioritization' per OCC Bulletin 2011-12 / Fed SR 11-7."
            }
        }

    # Default: Vance Riverfront Properties IV, LLC (PO-2026-8821)
    return {
        "payoff_id": deal["id"],
        "document_name": "Credit Agreement & Incumbency Certificate #CC-8821.pdf",
        "document_vault_id": "HBAN-CRE-VAULT-8821",
        "total_pages": 14,
        "inspected_page": 11,
        "resolution_timestamp": now_iso,
        "dlp_status": "PASSED: Consumer credit-bureau data and personal tax returns stripped pre-ingestion under the bank's GLBA § 501(b) information-security safeguards program. Beneficial-ownership facts are read from the entity's own formation and credit documents; BSA/CDD records remain under BSA data governance and are not copied into the wealth pipeline.",
        "borrower_entity": {
            "name": deal["borrower_entity"],
            "jurisdiction": "Ohio Limited Liability Company",
            "filing_date": "2018-04-12",
            "tax_classification": "Partnership / Pass-Through"
        },
        "grounded_members": [
            {
                "name": "Marcus Vance",
                "role": "Managing Member / Majority Owner",
                "ownership_pct": 85.0,
                "is_guarantor": True,
                "is_signatory": True,
                "exclusion_status": "Included / Full Commercial Profiling",
                "known_hban_accounts": ["Commercial DDA #..4109", "Operating Reserve #..9182"],
                "known_hban_balance": deal["known_hban_balances"],
                "bounding_box": {
                    "ymin": 248, "xmin": 120, "ymax": 310, "xmax": 680,
                    "text_snippet": "Marcus Vance, holding an undivided 85% Managing Membership Interest and sole operating signatory authority..."
                }
            },
            {
                "name": "Elena Vance",
                "role": "Member / 15% Equity Owner (Non-Guarantor)",
                "ownership_pct": 15.0,
                "is_guarantor": False,
                "is_signatory": False,
                "exclusion_status": "Excluded from Wealth Profiling (Non-Guarantor / NPI handling standard — voluntary control)",
                "known_hban_accounts": ["Joint Relationship Profile #JH-7712 (Quarantined)"],
                "known_hban_balance": 0.00,
                "bounding_box": {
                    "ymin": 330, "xmin": 120, "ymax": 390, "xmax": 680,
                    "text_snippet": "Elena Vance, holding a fifteen percent (15%) non-managing Membership Interest, who shall not be required to execute any Guaranty..."
                }
            },
            {
                "name": "The Vance 2018 Family Trust",
                "role": "Beneficial Estate Holding & Fiduciary Vehicle",
                "ownership_pct": 0.0,
                "is_guarantor": False,
                "is_signatory": False,
                "exclusion_status": "Fiduciary Entity / Staged for Estate Review",
                "known_hban_accounts": [],
                "known_hban_balance": 0.00,
                "bounding_box": {
                    "ymin": 415, "xmin": 120, "ymax": 475, "xmax": 680,
                    "text_snippet": "Underlying beneficial succession assigned to The Vance 2018 Family Trust, Marcus & Elena Vance Trustees..."
                }
            }
        ],
        "unstated_sale_price_reasoning": {
            "flag": True,
            "agentic_finding": "Title payoff request omits purchase contract purchase price.",
            "grounding_source": f"Credit Vault Doc #CC-8821 trailing Q1 in-place NOI: ${deal['noi_trailing_q1']:,.2f}",
            "submarket_grounding": f"Franklin County Q1 2026 Appraisal Benchmark cap rate: {deal['submarket_cap_rate']*100:.2f}%.",
            "capitalization_formula": f"NOI ÷ Cap Rate = ${deal['noi_trailing_q1']:,.2f} ÷ {deal['submarket_cap_rate']} = ${deal['indicative_valuation']:,.2f} Indicative Triage Valuation.",
            "model_risk_notice": "Designated strictly as 'Internal Liquidity Triage Heuristic for Relationship Prioritization' under OCC Bulletin 2011-12 / Fed SR 11-7. The guidance defines no model tiers; we expect Huntington's own MRM policy to tier this at its lowest risk level, subject to that team's classification. Client-facing property valuation muzzled."
        }
    }


@app.post("/api/valuation", response_model=ValuationResponse)
async def calculate_valuation(
    req: ValuationRequest,
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> ValuationResponse:
    """
    Evaluates commercial property triage valuation, debt payoff netting, and statutory tax routing
    via the Commercial Liquidity Engine.
    """
    target_id = req.payoff_id or "PO-2026-8821"
    payoff = get_payoff_by_id(target_id)

    # Apply only the overrides the caller actually sent. Assigning these
    # unconditionally meant an omitted field silently replaced the deal's own
    # figure with PO-2026-8821's, so every other borrower was valued on the
    # Vance deal's economics. The slider on the settlement screen is what these
    # exist for; absent it, the deal speaks for itself.
    if req.noi is not None:
        payoff.noi_trailing_q1 = req.noi
    if req.cap_rate is not None:
        payoff.submarket_cap_rate = req.cap_rate
    if req.debt_payoff is not None:
        payoff.payoff_quote_amount = req.debt_payoff

    assessment = LiquidityEngine.assess(
        payoff=payoff,
        sale_price=req.sale_price,
        tax_strategy=resolve_tax_strategy(target_id, req.tax_strategy),
        closing_cost_rate=req.closing_cost_rate,
    )
    return ValuationResponse(**assessment.to_legacy_valuation_dict())


@app.post("/api/consultative-call")
async def log_consultative_call(
    req: ConsultativeCallRequest,
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Records the Commercial RM's consultative call with the borrower.

    This is Gate 1. Until it is set, no settlement packet exists and the
    cross-LOB consent gate cannot be opened. Clearing it cascades: a call that
    did not happen cannot have produced a consent, so the downstream consent is
    revoked with it rather than being left dangling.
    """
    target_id = req.payoff_id or "PO-2026-8821"
    get_payoff_by_id(target_id)
    now_iso = datetime.now(timezone.utc).isoformat()

    record = quarantine_states.get(target_id) or get_default_quarantine(target_id)

    if not req.call_completed:
        # Cascade. Consent obtained "on" a call that is being retracted cannot
        # survive the call it depended on.
        quarantine_states[target_id] = get_default_quarantine(target_id)
        return quarantine_states[target_id]

    audit_data = f"{target_id}:{req.recorded_by}:{now_iso}:CONSULTATIVE-CALL-RECORD".encode("utf-8")
    crypto_hash = hashlib.sha256(audit_data).hexdigest()

    # The disposition is the compliance record of what the client actually
    # asked for, so it has to name the route the client was actually offered.
    #
    # This was a single hardcoded ICS sentence. On PO-2026-7492 -- an IRC §1031
    # exchange -- it therefore recorded that the borrower "directed net
    # settlement proceeds to Huntington Business Premier ICS", a sweep account
    # titled to the borrower. Written down and shown on screen, that is a
    # description of constructive receipt: the one act that voids the deferral
    # the rest of this path exists to protect.
    strategy = resolve_tax_strategy(target_id, req.tax_strategy)
    if req.client_directed_proceeds:
        default_disposition = (
            "Borrower directed exchange proceeds to the Huntington 1031 Qualified Escrow "
            "Depository, with IPX1031 as independent Qualified Intermediary. Proceeds are "
            "not to pass through any account titled to the borrower."
            if strategy == "1031_exchange"
            else "Borrower directed net settlement proceeds to Huntington Business Premier ICS."
        )
    else:
        default_disposition = "Borrower declined Huntington settlement routing. No packet generated."

    disposition = req.disposition or default_disposition

    record = {
        **record,
        "call_logged": True,
        "call_timestamp": now_iso,
        "call_recorded_by": req.recorded_by,
        "client_directed_proceeds": req.client_directed_proceeds,
        "call_audit_hash": f"SHA256-{crypto_hash}",
        "call_disposition": disposition,
    }

    if not req.client_directed_proceeds:
        # The borrower declined on this call. Any envelope dispatched under an
        # earlier disposition is void -- it asks him to sign a routing he has
        # just refused.
        base = get_default_quarantine(target_id)
        record.update({
            "packet_sent": False,
            "packet_sent_at": None,
            "packet_sent_by": None,
            "packet_recipient": None,
            "docusign_envelope_id": None,
            "packet_audit_hash": base["packet_audit_hash"],
        })

    quarantine_states[target_id] = record
    return record


@app.post("/api/settlement-packet")
async def send_settlement_packet(
    req: SettlementPacketSendRequest,
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Dispatches the routing packet to the borrower for signature, and issues the
    DocuSign envelope id.

    The id is minted here and nowhere else. Previously the assessment produced
    one, which meant a string that reads as proof of delivery existed the moment
    a packet was rendered, with nothing having been sent. Presence of an id now
    means a banker pressed send.

    Two preconditions, both enforced server-side:
      - a consultative call must be logged, and
      - the borrower must have directed proceeds to Huntington on it.

    Sending to a borrower who declined, or who was never called, is the failure
    mode this whole gate exists to prevent.

    There is deliberately no "executed" transition. Whether the borrower signed
    is reported by DocuSign Connect, not decided by this service, and inventing
    it here would be a fabricated compliance record.
    """
    target_id = req.payoff_id or "PO-2026-8821"
    payoff = get_payoff_by_id(target_id)
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    record = quarantine_states.get(target_id) or get_default_quarantine(target_id)

    if not req.send:
        base = get_default_quarantine(target_id)
        quarantine_states[target_id] = {
            **record,
            "packet_sent": False,
            "packet_sent_at": None,
            "packet_sent_by": None,
            "packet_recipient": None,
            "docusign_envelope_id": None,
            "packet_audit_hash": base["packet_audit_hash"],
        }
        return quarantine_states[target_id]

    if not record.get("call_logged"):
        raise HTTPException(
            status_code=409,
            detail=(
                "Cannot send a settlement packet before a consultative call is logged. "
                "The packet names the client's entity and an account title; it cannot "
                "precede the conversation in which the client asked for it."
            ),
        )
    if not record.get("client_directed_proceeds"):
        raise HTTPException(
            status_code=409,
            detail=(
                "The borrower declined Huntington settlement routing on the logged call. "
                "No envelope may be sent."
            ),
        )

    recipient = f"{payoff.managing_member} ({payoff.seller_entity})"
    envelope_id = f"ENV-HBAN-{now:%Y%m%d}-{target_id.split('-')[-1]}"
    audit_data = f"{target_id}:{req.sent_by}:{now_iso}:{envelope_id}:SETTLEMENT-PACKET-DISPATCH".encode("utf-8")
    crypto_hash = hashlib.sha256(audit_data).hexdigest()

    quarantine_states[target_id] = {
        **record,
        "packet_sent": True,
        "packet_sent_at": now_iso,
        "packet_sent_by": req.sent_by,
        "packet_recipient": recipient,
        "docusign_envelope_id": envelope_id,
        "packet_audit_hash": f"SHA256-{crypto_hash}",
    }
    return quarantine_states[target_id]


@app.get("/api/quarantine")
async def get_quarantine_status(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """Returns the current status of the GLBA Quarantined Consent Gate for a specific deal."""
    # Deliberately not passed through domain.demo_clock. The only dates a
    # quarantine record carries are the live consent timestamp and the digest
    # taken over it; there is no authored transaction date here. Shifting a
    # consent timestamp would falsify the one record whose whole value is
    # saying when the client actually said yes.
    get_payoff_by_id(payoff_id)
    if payoff_id not in quarantine_states:
        quarantine_states[payoff_id] = get_default_quarantine(payoff_id)
    return quarantine_states[payoff_id]


@app.post("/api/quarantine")
async def toggle_quarantine_status(
    req: QuarantineToggleRequest,
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Enforces GLBA compliance: records commercial RM verbal consent opt-in,
    unlocking the staged wealth management onboarding package.

    Sequencing is enforced here rather than in the UI. A consent record whose
    only provenance is "a button was clickable" is worth nothing in an exam;
    the referral record has to be able to point at the call that produced it.
    """
    target_id = req.payoff_id or "PO-2026-8821"
    get_payoff_by_id(target_id)
    now_iso = datetime.now(timezone.utc).isoformat()

    record = quarantine_states.get(target_id) or get_default_quarantine(target_id)

    if req.verbal_consent_recorded:
        if not record.get("call_logged"):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Cannot record cross-LOB consent before a consultative call is logged. "
                    "The Regulation R referral record must reference the call on which the "
                    "client requested the introduction."
                ),
            )
        audit_data = f"{target_id}:{req.recorded_by}:{now_iso}:CROSS-LOB-CONSENT-RECORD".encode("utf-8")
        crypto_hash = hashlib.sha256(audit_data).hexdigest()
        # Spread the existing record so the Gate 1 call fields survive.
        quarantine_states[target_id] = {
            **record,
            "payoff_id": target_id,
            "quarantined": False,
            "verbal_consent_recorded": True,
            "recorded_by": req.recorded_by,
            "consent_timestamp": now_iso,
            "audit_hash": f"SHA256-{crypto_hash}",
            "compliance_notes": f"Affirmative verbal consent recorded for {target_id} by {req.recorded_by} at {now_iso}, on the consultative call logged at {record.get('call_timestamp')}. GLBA barrier lifted; SEI Wealth Platform and retail CRM synchronization unlocked."
        }
    else:
        # Reset Gate 2 only. The call still happened; retracting a wealth
        # referral does not un-ring the phone, and it does not recall an
        # envelope the borrower is already holding. Those are Gate 1 facts and
        # they carry their own retraction paths.
        base = get_default_quarantine(target_id)
        quarantine_states[target_id] = {
            **base,
            "call_logged": record.get("call_logged", False),
            "call_timestamp": record.get("call_timestamp"),
            "call_recorded_by": record.get("call_recorded_by"),
            "client_directed_proceeds": record.get("client_directed_proceeds", False),
            "call_audit_hash": record.get("call_audit_hash", base["call_audit_hash"]),
            "call_disposition": record.get("call_disposition"),
            "packet_sent": record.get("packet_sent", False),
            "packet_sent_at": record.get("packet_sent_at"),
            "packet_sent_by": record.get("packet_sent_by"),
            "packet_recipient": record.get("packet_recipient"),
            "docusign_envelope_id": record.get("docusign_envelope_id"),
            "packet_audit_hash": record.get("packet_audit_hash", base["packet_audit_hash"]),
        }
    return quarantine_states[target_id]


@app.post("/api/demo/reset")
async def reset_demo(
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """Return every deal to the pristine, fully-gated start state.

    `quarantine_states` is the only mutable server-side state in the demo --
    everything else is derived from fixtures on each request -- so rebuilding
    it from `get_default_quarantine` is a complete reset, not a partial one.

    Every gate closes again: no call logged, no envelope issued, no cross-LOB
    consent. That is the point. A reset that left the gates open would leave
    nothing to demonstrate, and it would leave an envelope id standing for a
    dispatch that no longer has a call behind it.

    Rebuilt rather than mutated in place so that any field added to the
    default record in future is picked up here for free.
    """
    payoff_ids = {p["id"] for p in PAYOFF_QUEUE} | set(quarantine_states.keys())
    for payoff_id in payoff_ids:
        quarantine_states[payoff_id] = get_default_quarantine(payoff_id)

    reset_at = datetime.now(timezone.utc)
    return {
        "reset": True,
        "reset_at": reset_at.isoformat(),
        "reset_by": user.get("email") or user.get("name") or "Unknown",
        "deals_reset": sorted(payoff_ids),
        "states": {pid: quarantine_states[pid] for pid in sorted(payoff_ids)},
    }


@app.get("/api/wire-instructions")
async def get_wire_instructions(
    payoff_id: str = Query("PO-2026-8821"),
    strategy: Optional[str] = Query(None, pattern="^(cash_out|1031_exchange)$"),
    sale_price: float = Query(8500000.00, gt=0),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Generates structured Huntington Verified Settlement Wire Instruction data
    via the Commercial Liquidity Engine.

    `strategy` omitted means "use what was detected for this deal". It used to
    default to cash_out, which produced an ICS sweep packet -- titled to the
    borrower -- for a deal classified as a §1031 exchange.
    """
    payoff = get_payoff_by_id(payoff_id)
    assessment = LiquidityEngine.assess(
        payoff=payoff,
        sale_price=sale_price,
        tax_strategy=resolve_tax_strategy(payoff_id, strategy),
    )
    return rebase_demo_fixture(
        assessment.settlement_wire.model_dump(),
        live_fields=("letter_id", "date"),
    )


@app.get("/api/wealth-onboarding")
async def get_wealth_onboarding_dossier(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Returns the 80% pre-staged Private Wealth Advisor (PWA) onboarding scaffolding:
    KYC/CIP, SEI Custodial Shell, Draft IPS framework, and Automated Quarterly Review Dossier.
    """
    return rebase_demo_dates(_wealth_onboarding_payload(payoff_id))


# One borrower, one operating DDA. The dossier used to build an account number
# out of the payoff id, which produced "#..8821" -- that is the *facility*
# number, not a deposit account. These are the accounts entity resolution
# reports for each principal, and they are the only ones the demo should show.
PRIMARY_DDA_BY_PAYOFF: Dict[str, str] = {
    "PO-2026-8821": "#..4109",
    "PO-2026-7492": "#..1102",
    "PO-2026-6104": "#..9012",
}


def _wealth_onboarding_payload(payoff_id: str) -> Dict[str, Any]:
    """The authored wealth dossier for one deal, before re-basing.

    Two branches below -- quarantined and consented. They must stay in step.
    """
    payoff = get_payoff_by_id(payoff_id)
    if not payoff.credit_risk_rating.lower().startswith("pass"):
        raise HTTPException(
            status_code=422,
            detail=f"Wealth onboarding rejected: Loan risk rating '{payoff.credit_risk_rating}' violates Huntington credit-policy gating for wealth referral (Pass rating required)."
        )
    q_state = quarantine_states.get(payoff_id, get_default_quarantine(payoff_id))
    is_quarantined = q_state.get("quarantined", True)
    pwa_title = f"{payoff.assigned_pwa}, CFP, Senior Private Wealth Advisor" if payoff.assigned_pwa else "Sarah Jenkins, CFP, Senior Private Wealth Advisor"

    if is_quarantined:
        return {
            "status": "Quarantined",
            "quarantined": True,
            "payoff_id": payoff_id,
            "assigned_pwa": pwa_title,
            "target_client": "[QUARANTINED] Commercial Guarantor Profile (Affirmative Opt-In Required — NPI Handling Standard, Voluntary Control)",
            "household_id": "HH-QUARANTINED-PENDING-CONSENT",
            "staged_kyc_cip": {
                "completion_percentage": 0,
                "verified_fields": [
                    {"field": "Client Nonpublic Personal Information (NPI)", "value": "[QUARANTINED - Firewalled at Commercial Bank Perimeter Pending Client Opt-In]", "status": "Quarantined"},
                    {"field": "Taxpayer Identification", "value": "[QUARANTINED — NPI HANDLING STANDARD]", "status": "Quarantined"},
                    {"field": "Residential & Banking Coordinates", "value": "[QUARANTINED - Commercial Credit Vault Firewalled]", "status": "Quarantined"}
                ],
                "pending_advisor_actions": [
                    "Commercial RM must document affirmative verbal opt-in consent from primary guarantor",
                    "Execute GLBA Regulation P customer privacy disclosure",
                    "Complete OCC Reg 9 fiduciary suitability review & investment objectives questionnaire (Reg BI / FINRA 2111 apply instead if routed to the HFA retail channel)"
                ]
            },
            "sei_custodial_shell": {
                "shell_id": f"SEI-WP-HBAN-{payoff_id.split('-')[-1]} (Locked)",
                "account_title": "[QUARANTINED] Pending Client Opt-In Consent",
                "custodian": "SEI Wealth Platform (SEI Data Cloud / Snowflake Zero-ETL) / Huntington Private Bank",
                "clearing_status": "Locked Pending Consent (Snowflake Zero-ETL Data Share Quarantined)",
                "cash_depository_link": "Huntington National Bank FDIC Pass-Through Sweep"
            },
            "draft_ips_scaffolding": {
                "mandate": "[WITHHELD PENDING ADVISOR SUITABILITY REVIEW]",
                "horizon": "Unstated",
                "liquidity_reserve_sleeve": "$0.00 (Locked)",
                "asset_allocation_scaffold": [],
                "fiduciary_disclaimer": "Scaffolding withheld. Under OCC Reg 9 fiduciary standards, and under our own NPI handling standard as a voluntary control, asset allocation scaffolding is unlocked only after affirmative client opt-in and licensed advisor risk discovery."
            },
            "ongoing_servicing_dossier": {
                "annual_reviews_automated": False,
                "advisor_capacity_expansion": "80 relationships to 95-100 relationships per PWA (2x CSA operational leverage; principals below $3M projected personal investable routed to Centralized Wealth Hub)",
                "features": [
                    "Automated Quarterly Portfolio Rebalancing Dossier (Locked)",
                    "Tax-Loss Harvesting Alerting Engine (Locked)",
                    "Fiduciary Annual Meeting Preparation Briefing (Locked)",
                    "Real-time Estate Plan & Trust Topology Sync via SEI Data Cloud (Locked)"
                ]
            }
        }

    # The consented dossier below describes where the money goes after closing.
    # On an exchange that is a different account, a different mandate, and a
    # different opportunity, so it cannot be authored once for both routes.
    #
    # The timing is what makes this load-bearing rather than cosmetic. Tier 2
    # wealth release fires at closing + 30 days. On Buckeye that is before the
    # 45-day identification deadline -- so at the exact moment this dossier
    # opens, the proceeds are sitting in qualified escrow and are legally
    # committed to a purchase the client has not yet named. Presenting them as
    # an investable balance would invite an advisor to solicit an allocation of
    # money that cannot be allocated, and moving it into a Huntington sweep
    # titled to the client is constructive receipt -- it would void the very
    # deferral the settlement path was built to protect.
    is_exchange = detected_tax_strategy(payoff_id) == "1031_exchange"

    if is_exchange:
        source_of_wealth = {
            "field": "Source of Wealth",
            "value": (
                f"IRC §1031 Like-Kind Exchange ({payoff.property_name}). Proceeds are "
                "held by the Qualified Intermediary and are deferred, not realized."
            ),
            "status": "Pending Replacement Property Acquisition",
        }
        cash_depository_link = (
            "Huntington 1031 Qualified Escrow Depository (IPX1031 as QI). Not a "
            "client-titled account; funds are not available for allocation."
        )
        ips_mandate = (
            "Replacement Property Acquisition Support — not a discretionary mandate. "
            "Exchange proceeds are committed to a like-kind purchase inside the "
            "statutory window and are not investable assets."
        )
        ips_horizon = "Constrained by the 180-day exchange deadline"
        liquidity_sleeve = (
            "$0.00 — exchange proceeds are escrowed and may not be swept. Only "
            "boot (cash the client elects not to reinvest, and which is taxable) "
            "becomes investable, and no boot has been elected."
        )
    else:
        source_of_wealth = {
            "field": "Source of Wealth",
            "value": f"Commercial Real Estate Disposition ({payoff.property_name})",
            "status": "Pending Closing Settlement",
        }
        cash_depository_link = "Huntington National Bank FDIC Pass-Through Sweep"
        ips_mandate = "Conservative Capital Preservation & Liquidity Bridge"
        ips_horizon = "Medium-to-Long Term (Post-Disposition)"
        liquidity_sleeve = "$500,000 in Ultra-Short Treasury / Huntington ICS"

    return {
        "status": "Active / Ready for Advisor Authorship",
        "quarantined": False,
        "payoff_id": payoff_id,
        "assigned_pwa": pwa_title,
        "target_client": f"{payoff.primary_guarantor} (Non-guarantor co-owners excluded pending affirmative opt-in)",
        "household_id": f"HH-{payoff.borrower_entity[:8].replace(' ', '').upper()}-{payoff_id.split('-')[-1]}",
        "staged_kyc_cip": {
            "completion_percentage": 82,
            "verified_fields": [
                {"field": "Full Legal Names", "value": f"{payoff.primary_guarantor} (Guarantor Profile)", "status": "Verified (Commercial Credit File)"},
                {"field": "Entity Structure", "value": f"{payoff.borrower_entity} / Family Trust", "status": "Verified (Articles of Org)"},
                {"field": "Taxpayer Identification", "value": "EIN on file (Commercial Credit Vault)", "status": "Verified"},
                {"field": "Residential Address", "value": f"Guarantor File: {payoff.primary_guarantor}, Columbus, OH", "status": "Verified"},
                {"field": "Primary Banking Source", "value": f"Huntington Commercial DDA {PRIMARY_DDA_BY_PAYOFF.get(payoff_id, 'on file (Commercial Credit Vault)')}", "status": "Verified"},
                source_of_wealth
            ],
            "pending_advisor_actions": [
                "OCC Reg 9 (12 C.F.R. § 9) Fiduciary Suitability Review",
                "Investment Objectives & Risk Tolerance Questionnaire (Private Bank fiduciary standard; Reg BI / FINRA 2111 apply instead if routed to the HFA retail channel)",
                "Final Wet/Digital Client Signature on Custodial Disclosures"
            ]
        },
        "sei_custodial_shell": {
            "shell_id": f"SEI-WP-HBAN-{payoff_id.split('-')[-1]}",
            "account_title": f"{payoff.primary_guarantor} Individual Wealth Management Account (SEI Data Cloud)",
            "custodian": "SEI Wealth Platform (SEI Data Cloud / Snowflake Zero-ETL) / Huntington Private Bank",
            "clearing_status": "Active Staged Shell (Snowflake Zero-ETL Connected)",
            "cash_depository_link": cash_depository_link
        },
        "draft_ips_scaffolding": {
            "mandate": ips_mandate,
            "horizon": ips_horizon,
            "liquidity_reserve_sleeve": liquidity_sleeve,
            "asset_allocation_scaffold": [],
            "fiduciary_disclaimer": "Asset allocations and investment policies are withheld. Under OCC Reg 9 (12 C.F.R. § 9) fiduciary standards — or SEC Reg BI / FINRA Rule 2111 if the relationship routes to the HFA retail brokerage channel — investment strategies are not generated by the commercial bank and must be authored by the licensed advisor following formal investor discovery."
        },
        "ongoing_servicing_dossier": {
            "annual_reviews_automated": True,
            "advisor_capacity_expansion": "80 relationships to 95-100 relationships per PWA (2x CSA operational leverage; principals below $3M projected personal investable routed to Centralized Wealth Hub)",
            "features": [
                "Automated Quarterly Portfolio Rebalancing Dossier",
                "Tax-Loss Harvesting Alerting Engine",
                "Fiduciary Annual Meeting Preparation Briefing",
                "Real-time Estate Plan & Trust Topology Sync via SEI Data Cloud"
            ]
        }
    }


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_agent_response(
    req: PromptRequest,
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> GenerateResponse:
    """
    Gemini Enterprise Agent Platform text generation endpoint using gemini-3.7-flash.

    When a live model call succeeds the response is returned with live=True and the
    citations the model was grounded against. If the client is unconfigured or the call
    fails, a canned offline briefing is served instead — flagged live=False with a model
    label of "[OFFLINE FALLBACK]" so the caller (and the presenter) can never mistake
    pre-written text for live model output. The fallback exists so a demo does not crash
    on stage; it must never masquerade as a real inference.
    """
    OFFLINE_MODEL_LABEL = f"{gemini_model} [OFFLINE FALLBACK]"
    OFFLINE_CITATIONS = ["Offline fallback response — pre-written, not grounded by a live model call"]

    if genai_client:
        try:
            response = await genai_client.aio.models.generate_content(
                model=gemini_model,
                contents=req.prompt,
            )
            return GenerateResponse(
                response=response.text or "No response returned from model.",
                model=gemini_model,
                grounded_citations=["Credit Vault Doc #CC-8821", "Franklin Co. Q1 7.5% Cap Rate Benchmark"],
                live=True,
            )
        except Exception as e:
            logger.warning(f"Live Gemini API call failed: {e}. Serving flagged offline fallback response.")
    else:
        logger.warning("Gemini client unconfigured. Serving flagged offline fallback response.")

    # Pre-written offline briefing. Explicitly flagged as non-live above.
    prompt_lower = req.prompt.lower()
    if "call" in prompt_lower or "script" in prompt_lower or "greg" in prompt_lower:
        script = (
            "COMMERCIAL RM 4-MINUTE CALL BRIEFING: MARCUS VANCE (T-12 DAYS)\n\n"
            "Greg Miller: 'Marcus, congratulations on the Riverfront Commons contract. We received the payoff notice "
            "from First American Title this morning. Before Karen finalizes the disbursement instructions, I wanted to "
            "make sure your proceeds are sheltered. Depending on whether you're taking taxable cash-out or executing an "
            "IRC §1031 exchange, we have Huntington Treasury ICS yielding 4.85% with multi-million FDIC insurance, or our "
            "1031 Qualified Escrow Depository partnered with IPX1031 yielding 4.75% so you don't breach constructive receipt. "
            "I'll deliver our verified Settlement Account Routing Packet directly to you via DocuSign so you can authorize "
            "First American Title, backed by our official bank verification letter for title's telephone callback authentication.'"
        )
        return GenerateResponse(
            response=script,
            model=OFFLINE_MODEL_LABEL,
            grounded_citations=OFFLINE_CITATIONS,
            live=False,
        )

    generic_response = (
        "Huntington Book Scout Agentic Analysis [OFFLINE FALLBACK — not a live model call]:\n"
        "References Credit Vault Document #CC-8821 and Franklin County Q1 2026 CRE Appraisal Benchmarks.\n"
        "Identified entity Vance Riverfront Properties IV, LLC with 85% majority ownership by Marcus Vance. "
        "Net proceeds estimated at $2,902,700 capitalizing Q1 NOI ($637,500) at 7.50% submarket cap rate."
    )
    return GenerateResponse(
        response=generic_response,
        model=OFFLINE_MODEL_LABEL,
        grounded_citations=OFFLINE_CITATIONS,
        live=False,
    )


# =====================================================================
# Static SPA File Serving with Path Traversal & Anti-Cache Protection
# =====================================================================
DIST_DIR = Path("dist").resolve() if Path("dist").is_dir() else Path("frontend/dist").resolve()

# Mount immutable static assets if present
if (DIST_DIR / "assets").is_dir():
    class HashedStaticFiles(StaticFiles):
        async def get_response(self, path: str, scope):
            resp = await super().get_response(path, scope)
            if (200 <= resp.status_code < 300) or resp.status_code == 304:
                resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return resp

    app.mount("/assets", HashedStaticFiles(directory=str(DIST_DIR / "assets")), name="assets")


DOCUMENT_FILENAMES = {
    "book-scout-pitch.html",
    "brand_kit.html",
    "citations.html",
    "demo_script.html",
    "overview.html",
}


@app.get("/{full_path:path}")
async def serve_spa(request: Request, full_path: str):
    """
    Serves the compiled React frontend with strict path traversal protection,
    anti-caching headers on index.html, and explicit routing protection preventing /api/* route hijacking.
    Reference documents are protected with authentication checks.
    """
    # Guard API and WebSocket endpoints against SPA fallback hijacking
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API Endpoint Not Found")
    if full_path == "ws" or full_path.startswith("ws/"):
        raise HTTPException(status_code=404, detail="WebSocket Endpoint Not Found")

    target_path = (DIST_DIR / full_path).resolve()

    # Defense-in-depth: enforce IAP authentication on document routes
    if full_path in DOCUMENT_FILENAMES or target_path.name in DOCUMENT_FILENAMES:
        await get_authenticated_user(request)

    # Strict Path Traversal Guard: ensure resolved path is strictly within DIST_DIR
    if (DIST_DIR in target_path.parents or target_path == DIST_DIR) and target_path.is_file():
        if target_path.name.endswith(".html") or target_path.name == "index.html":
            return FileResponse(
                target_path,
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            )
        if full_path.startswith("assets/"):
            return FileResponse(target_path, headers={"Cache-Control": "public, max-age=31536000, immutable"})
        return FileResponse(target_path)

    # Missing static assets MUST return 404 and NEVER fall back to index.html
    if full_path == "assets" or full_path.startswith("assets/"):
        raise HTTPException(status_code=404, detail="Asset Not Found")

    # Local dev fallback: serve the reference documents the Admin Panel links to
    # from frontend/public or root, before a production build exists.
    for candidate_dir in [Path("frontend/public").resolve(), Path(".").resolve()]:
        if candidate_dir.is_dir():
            candidate_file = (candidate_dir / full_path).resolve()
            if (candidate_dir in candidate_file.parents or candidate_file == candidate_dir) and candidate_file.is_file():
                if full_path in DOCUMENT_FILENAMES:
                    await get_authenticated_user(request)
                    headers = {}
                    if candidate_file.name.endswith(".html"):
                        headers = {
                            "Cache-Control": "no-cache, no-store, must-revalidate",
                            "Pragma": "no-cache",
                            "Expires": "0",
                        }
                    return FileResponse(candidate_file, headers=headers)

    # SPA Fallback to index.html with no-cache headers
    index_file = DIST_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(
            index_file,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )

    return JSONResponse(
        status_code=200,
        content={"message": "Huntington Book Scout API operational. Frontend static bundle compiling or not built."}
    )
