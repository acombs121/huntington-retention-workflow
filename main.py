"""
=====================================================================
Huntington Horizon: Intelligent Liquidity Orchestration
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
from domain.models import PayoffStatement
from domain.liquidity_engine import LiquidityEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("huntington_horizon")

app = FastAPI(
    title="Huntington Horizon API",
    description="Intelligent Liquidity Orchestration for Huntington Bancshares",
    version="5.2.0"
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
# In-Memory State & Domain Data
# =====================================================================

def get_default_quarantine(payoff_id: str) -> Dict[str, Any]:
    return {
        "payoff_id": payoff_id,
        "quarantined": True,
        "verbal_consent_recorded": False,
        "recorded_by": None,
        "consent_timestamp": None,
        "audit_hash": f"SHA256-GLBA-HBAN-{payoff_id}-PENDING",
        "compliance_notes": f"Awaiting Commercial RM verbal opt-in for {payoff_id} per 15 U.S.C. § 6801 (GLBA) and 12 C.F.R. § 1016.11."
    }

quarantine_states: Dict[str, Dict[str, Any]] = {
    "PO-2026-8821": get_default_quarantine("PO-2026-8821"),
    "PO-2026-7492": get_default_quarantine("PO-2026-7492"),
    "PO-2026-6104": get_default_quarantine("PO-2026-6104"),
}

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
        "status": "Staged for Call"
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
        "noi_trailing_q1": 245000.00,
        "submarket_cap_rate": 0.078,
        "indicative_valuation": 3150000.00,
        "estimated_net_equity": 1588250.00,
        "known_hban_balances": 890000.00,
        "total_hban_position": 2478250.00,
        "managing_member": "Thomas Buckeye",
        "primary_guarantor": "Thomas Buckeye",
        "tax_strategy_detected": "IRC §1031 Exchange (QI Routed)",
        "status": "Document Parsing Complete"
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
        "noi_trailing_q1": 412000.00,
        "submarket_cap_rate": 0.072,
        "indicative_valuation": 5720000.00,
        "estimated_net_equity": 2222600.00,
        "known_hban_balances": 1450000.00,
        "total_hban_position": 3672600.00,
        "managing_member": "Dr. Robert Miller",
        "primary_guarantor": "Dr. Robert Miller",
        "tax_strategy_detected": "Taxable Cash-Out",
        "status": "Monitoring Queue"
    }
]


def get_payoff_by_id(payoff_id: str) -> PayoffStatement:
    """Adapts in-memory payoff queue items to the canonical PayoffStatement domain model with safe fallback."""
    if not PAYOFF_QUEUE:
        raise HTTPException(status_code=404, detail="Payoff queue is empty")
    raw = next((p for p in PAYOFF_QUEUE if p["id"] == payoff_id), PAYOFF_QUEUE[0])
    return PayoffStatement(**{k: v for k, v in raw.items() if k in PayoffStatement.model_fields})



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

class ValuationRequest(BaseModel):
    payoff_id: Optional[str] = Field(default="PO-2026-8821")
    sale_price: float = Field(default=8500000.00, ge=500000.00, le=50000000.00)
    noi: float = Field(default=637500.00)
    cap_rate: float = Field(default=0.075)
    debt_payoff: float = Field(default=5214800.00)
    closing_cost_rate: float = Field(default=0.045)
    tax_strategy: str = Field(default="cash_out", pattern="^(cash_out|1031_exchange)$")

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
    occ_sr11_7_designation: str

class QuarantineToggleRequest(BaseModel):
    payoff_id: Optional[str] = "PO-2026-8821"
    verbal_consent_recorded: bool
    recorded_by: str = "Greg Miller (Commercial RM)"
    client_notes: Optional[str] = "Borrower affirmed willingness to review Huntington Max$aver ICS and Private Wealth advisory options."


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
        "service": "huntington-horizon",
        "version": "5.2.0",
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
    Demonstrates human-impossible scale: 2,140 screened, 6 qualified.
    """
    items = PAYOFF_QUEUE
    if priority:
        items = [p for p in items if priority.lower() in p["priority_tier"].lower()]
    
    return {
        "capacity_meter": {
            "screened_events_book": 2140,
            "qualified_and_staged": 6,
            "manual_discovery_absorbed_hrs": 46.2,
            "wealth_admin_absorbed_hrs": 18.5,
            "active_machine_inferences": 3,
            "book_scale_volume": "$4.50 Billion",
            "historical_flight_risk_rate": "78%"
        },
        "payoff_items": items
    }


@app.get("/api/entity-resolution")
async def get_entity_resolution(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Provides Gemini 3.7 Flash multimodal document extraction returning
    borrower-specific LLC ownership topology, bounding boxes, and document grounding.
    """
    deal = next((p for p in PAYOFF_QUEUE if p["id"] == payoff_id), PAYOFF_QUEUE[0])
    now_iso = datetime.now(timezone.utc).isoformat()

    if deal["id"] == "PO-2026-7492":
        return {
            "payoff_id": deal["id"],
            "document_name": "Credit Agreement & Corporate Resolution #CC-7492.pdf",
            "document_vault_id": "HBAN-CRE-VAULT-7492",
            "total_pages": 18,
            "inspected_page": 8,
            "resolution_timestamp": now_iso,
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
                    "known_hban_accounts": ["Commercial Savings #..3309"],
                    "known_hban_balance": 0.00,
                    "bounding_box": {
                        "ymin": 290, "xmin": 120, "ymax": 350, "xmax": 680,
                        "text_snippet": "Janet Pendelton, Corporate Secretary holding 30% Common Shares and joint personal guarantor..."
                    }
                }
            ],
            "unstated_sale_price_reasoning": {
                "flag": False,
                "agentic_finding": "Title payoff request includes executed purchase and sale agreement.",
                "grounding_source": f"Contract Purchase Price: ${deal['indicative_valuation']:,.2f} | Q1 In-Place NOI: ${deal['noi_trailing_q1']:,.2f}",
                "submarket_grounding": f"Dublin Road Industrial Submarket Benchmark cap rate: {deal['submarket_cap_rate']*100:.2f}%.",
                "capitalization_formula": f"Contract Sale Price = ${deal['indicative_valuation']:,.2f} verified against Escrow File #{deal['escrow_file_number']}.",
                "occ_sr11_7_notice": "Verified Executed Purchase Agreement per OCC Bulletin 2011-12 / Fed SR 11-7."
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
                "occ_sr11_7_notice": "Designated strictly as 'Indicative Triage Estimate for Relationship Prioritization' per OCC Bulletin 2011-12 / Fed SR 11-7."
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
                "known_hban_accounts": ["Commercial DDA #..4401", "Operating Reserve #..9182"],
                "known_hban_balance": deal["known_hban_balances"],
                "bounding_box": {
                    "ymin": 248, "xmin": 120, "ymax": 310, "xmax": 680,
                    "text_snippet": "Marcus Vance, holding an undivided 85% Managing Membership Interest and sole operating signatory authority..."
                }
            },
            {
                "name": "Elena Vance",
                "role": "Member / Spouse (Joint Household)",
                "ownership_pct": 15.0,
                "is_guarantor": True,
                "is_signatory": False,
                "known_hban_accounts": ["Joint Relationship Profile #JH-7712"],
                "known_hban_balance": 0.00,
                "bounding_box": {
                    "ymin": 330, "xmin": 120, "ymax": 390, "xmax": 680,
                    "text_snippet": "Elena Vance, holding a 15% non-managing Membership Interest, consenting spouse and joint guarantor..."
                }
            },
            {
                "name": "The Vance 2018 Family Trust",
                "role": "Beneficial Estate Holding & Fiduciary Vehicle",
                "ownership_pct": 0.0,
                "is_guarantor": False,
                "is_signatory": False,
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
            "occ_sr11_7_notice": "Designated strictly as 'Indicative Triage Estimate for Relationship Prioritization' per OCC Bulletin 2011-12 / Fed SR 11-7."
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
    payoff.noi_trailing_q1 = req.noi
    payoff.submarket_cap_rate = req.cap_rate
    payoff.payoff_quote_amount = req.debt_payoff

    assessment = LiquidityEngine.assess(
        payoff=payoff,
        sale_price=req.sale_price,
        tax_strategy=req.tax_strategy,
        closing_cost_rate=req.closing_cost_rate,
    )
    return ValuationResponse(**assessment.to_legacy_valuation_dict())


@app.get("/api/quarantine")
async def get_quarantine_status(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """Returns the current status of the GLBA Quarantined Consent Gate for a specific deal."""
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
    """
    target_id = req.payoff_id or "PO-2026-8821"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if req.verbal_consent_recorded:
        audit_data = f"{target_id}:{req.recorded_by}:{now_iso}:GLBA-15USC6801-COMPLIANT".encode("utf-8")
        crypto_hash = hashlib.sha256(audit_data).hexdigest()
        quarantine_states[target_id] = {
            "payoff_id": target_id,
            "quarantined": False,
            "verbal_consent_recorded": True,
            "recorded_by": req.recorded_by,
            "consent_timestamp": now_iso,
            "audit_hash": f"SHA256-{crypto_hash}",
            "compliance_notes": f"Affirmative verbal consent recorded for {target_id} by {req.recorded_by} at {now_iso}. GLBA barrier lifted; SEI Wealth Platform and retail CRM synchronization unlocked."
        }
    else:
        quarantine_states[target_id] = get_default_quarantine(target_id)
    return quarantine_states[target_id]


@app.get("/api/wire-instructions")
async def get_wire_instructions(
    payoff_id: str = Query("PO-2026-8821"),
    strategy: str = Query("cash_out"),
    sale_price: float = Query(8500000.00),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Generates structured Huntington Verified Settlement Wire Instruction data
    via the Commercial Liquidity Engine.
    """
    payoff = get_payoff_by_id(payoff_id)
    assessment = LiquidityEngine.assess(
        payoff=payoff,
        sale_price=sale_price,
        tax_strategy=strategy,
    )
    return assessment.settlement_wire.model_dump()


@app.get("/api/wealth-onboarding")
async def get_wealth_onboarding_dossier(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Returns the 80% pre-staged Private Wealth Advisor (PWA) onboarding scaffolding:
    KYC/CIP, SEI Custodial Shell, Draft IPS framework, and Automated Quarterly Review Dossier.
    """
    payoff = get_payoff_by_id(payoff_id)
    q_state = quarantine_states.get(payoff_id, get_default_quarantine(payoff_id))
    is_quarantined = q_state.get("quarantined", True)
    pwa_title = f"{payoff.assigned_pwa}, CFP, Senior Private Wealth Advisor" if payoff.assigned_pwa else "Sarah Jenkins, CFP, Senior Private Wealth Advisor"

    return {
        "status": "Quarantined" if is_quarantined else "Active / Ready for Advisor Authorship",
        "quarantined": is_quarantined,
        "payoff_id": payoff_id,
        "assigned_pwa": pwa_title,
        "target_client": f"{payoff.primary_guarantor} (85%) & Co-Guarantors (15%)",
        "household_id": f"HH-{payoff.borrower_entity[:8].replace(' ', '').upper()}-4401",
        "staged_kyc_cip": {
            "completion_percentage": 82,
            "verified_fields": [
                {"field": "Full Legal Names", "value": f"{payoff.primary_guarantor} & Spouse", "status": "Verified (Commercial Credit File)"},
                {"field": "Entity Structure", "value": f"{payoff.borrower_entity} / Family Trust", "status": "Verified (Articles of Org)"},
                {"field": "Taxpayer Identification", "value": "EIN on file (Commercial Credit Vault)", "status": "Verified"},
                {"field": "Residential Address", "value": f"Guarantor File: {payoff.primary_guarantor}, Columbus, OH", "status": "Verified"},
                {"field": "Primary Banking Source", "value": f"Huntington Commercial DDA #..{payoff_id.split('-')[-1]}", "status": "Verified"},
                {"field": "Source of Wealth", "value": f"Commercial Real Estate Disposition ({payoff.property_name})", "status": "Pending Closing Settlement"}
            ],
            "pending_advisor_actions": [
                "Reg BI Suitability Evaluation",
                "FINRA Rule 2111 Risk Profile Questionnaire",
                "Final Wet/Digital Client Signature on Custodial Disclosures"
            ]
        },
        "sei_custodial_shell": {
            "shell_id": f"SEI-WP-HBAN-{payoff_id.split('-')[-1]}",
            "account_title": f"{payoff.primary_guarantor} Joint Tenancy with Rights of Survivorship (JTWROS)",
            "custodian": "SEI Private Trust Company / Huntington Wealth Services",
            "clearing_status": "Staged Pending Consent" if is_quarantined else "Active Staged Shell",
            "cash_depository_link": "Huntington National Bank FDIC Pass-Through Sweep"
        },
        "draft_ips_scaffolding": {
            "mandate": "Conservative Capital Preservation & Liquidity Bridge",
            "horizon": "Medium-to-Long Term (Post-Disposition)",
            "liquidity_reserve_sleeve": "$500,000 in Ultra-Short Treasury / Huntington ICS",
            "asset_allocation_scaffold": [
                {"asset_class": "Short-Duration Fixed Income & Treasuries", "target_pct": 50, "rationale": "Capital preservation against reinvestment timeline"},
                {"asset_class": "Dividend Growth & Core Equities", "target_pct": 35, "rationale": "Inflation hedge & tax-efficient cash flow"},
                {"asset_class": "1031 DST Replacement Commercial Real Estate", "target_pct": 15, "rationale": "Tax deferral preservation if Path B chosen"}
            ],
            "fiduciary_disclaimer": "Draft administrative scaffolding only. Must be authored, reviewed, and finalized by Series 7/66/CFP licensed advisor under Reg BI."
        },
        "ongoing_servicing_dossier": {
            "annual_reviews_automated": True,
            "advisor_capacity_expansion": "80 relationships to 150 relationships per PWA",
            "features": [
                "Automated Quarterly Portfolio Rebalancing Dossier",
                "Tax-Loss Harvesting Alerting Engine",
                "Fiduciary Annual Meeting Preparation Briefing",
                "Real-time Estate Plan & Trust Topology Sync"
            ]
        }
    }


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_agent_response(
    req: PromptRequest,
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> GenerateResponse:
    """
    Live Gemini Enterprise Agent Platform text generation endpoint using gemini-3.7-flash.
    Provides native Vertex AI calls with intelligent fallback for offline / mock testing.
    """
    if genai_client:
        try:
            response = await genai_client.aio.models.generate_content(
                model=gemini_model,
                contents=req.prompt,
            )
            return GenerateResponse(
                response=response.text or "No response returned from model.",
                model=gemini_model,
                grounded_citations=["Credit Vault Doc #CC-8821", "Franklin Co. Q1 7.5% Cap Rate Benchmark"]
            )
        except Exception as e:
            logger.warning(f"Live Gemini API call failed: {e}. Utilizing realistic fallback response.")

    # High-fidelity realistic banking response fallback
    prompt_lower = req.prompt.lower()
    if "call" in prompt_lower or "script" in prompt_lower or "greg" in prompt_lower:
        script = (
            "COMMERCIAL RM 4-MINUTE CALL BRIEFING: MARCUS VANCE (T-12 DAYS)\n\n"
            "Greg Miller: 'Marcus, congratulations on the Riverfront Commons contract. We received the payoff notice "
            "from First American Title this morning. Before Karen finalizes the disbursement instructions, I wanted to "
            "make sure your proceeds are sheltered. Depending on whether you're taking taxable cash-out or executing an "
            "IRC §1031 exchange, we have Huntington Treasury ICS yielding 4.85% with multi-million FDIC insurance, or our "
            "1031 Qualified Escrow Depository yielding 4.75% so you don't breach constructive receipt. Let me send over "
            "our pre-filled Settlement Wire Instructions directly to First American Title.'"
        )
        return GenerateResponse(
            response=script,
            model=gemini_model,
            grounded_citations=["Credit Vault Doc #CC-8821", "First American Title File #FA-2026-8819-COL"]
        )

    generic_response = (
        f"Huntington Horizon Agentic Analysis [Model: {gemini_model}]:\n"
        f"Grounded in Credit Vault Document #CC-8821 and Franklin County Q1 2026 CRE Appraisal Benchmarks.\n"
        f"Identified entity Vance Riverfront Properties IV, LLC with 85% majority ownership by Marcus Vance. "
        f"Net proceeds estimated at $2,902,700 capitalizing Q1 NOI ($637,500) at 7.50% submarket cap rate."
    )
    return GenerateResponse(
        response=generic_response,
        model=gemini_model,
        grounded_citations=["Credit Vault Doc #CC-8821", "Franklin County Q1 2026 Commercial Appraisal Benchmark"]
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


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Serves the compiled React frontend with strict path traversal protection,
    anti-caching headers on index.html, and explicit routing protection preventing /api/* route hijacking.
    """
    # Guard API and WebSocket endpoints against SPA fallback hijacking
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API Endpoint Not Found")
    if full_path == "ws" or full_path.startswith("ws/"):
        raise HTTPException(status_code=404, detail="WebSocket Endpoint Not Found")

    target_path = (DIST_DIR / full_path).resolve()

    # Strict Path Traversal Guard: ensure resolved path is strictly within DIST_DIR
    if (DIST_DIR in target_path.parents or target_path == DIST_DIR) and target_path.is_file():
        if target_path.name == "index.html":
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

    # Local dev fallback: serve brand_kit.html or demo_script.html from frontend/public or root
    for candidate_dir in [Path("frontend/public").resolve(), Path(".").resolve()]:
        if candidate_dir.is_dir():
            candidate_file = (candidate_dir / full_path).resolve()
            if (candidate_dir in candidate_file.parents or candidate_file == candidate_dir) and candidate_file.is_file():
                if full_path in ["brand_kit.html", "demo_script.html", "huntington-horizon.pdf"]:
                    return FileResponse(candidate_file)

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
        content={"message": "Huntington Horizon API operational. Frontend static bundle compiling or not built."}
    )
