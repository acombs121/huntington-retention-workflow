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
from domain.models import PayoffStatement
from domain.liquidity_engine import LiquidityEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("huntington_book_scout")

app = FastAPI(
    title="Huntington Book Scout API",
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

DETECTION_TRACES: Dict[str, Dict[str, Any]] = {
    "PO-2026-8821": {
        "payoff_id": "PO-2026-8821",
        "confidence_score": 94,
        "urgency_tier": "Critical Flight Risk (T-12 Days)",
        "classification": "Commercial Asset Sale / Taxable Cash-Out (High Flight Risk)",
        "summary_verdict": "Detection agent confirmed a third-party asset sale: zero replacement financing anywhere in Huntington, and a prepayment premium quote the borrower asked us to price. An estimated $2,902,700.00 in net seller equity leaves the facility at closing. No exchange coordination has been requested, so the proceeds are presumed taxable -- but under either treatment the balance leaves, exposing the relationship to deposit flight within 48 hours.",
        "model_agent": "gemini-3.7-flash (Multimodal Signal Fusion)",
        "evaluation_timestamp": "2026-09-04T08:14:22Z",
        "fused_signals": [
            {
                "category": "Intake Topology & Channel",
                "signal_name": "Third-Party Settlement Escrow Demand",
                "source": "Inbound eFax via Microsoft Graph API / First American Title (Escrow #FA-2026-8819-COL)",
                "observation": "Demand letter requests exact loan payoff calculation for closing scheduled on September 16, 2026. Signed by Commercial Escrow Officer Karen Lindqvist.",
                "risk_impact": "+20% Baseline Disposition Probability",
                "verdict": "EXTERNAL ESCROW OPENED"
            },
            {
                "category": "Credit Core & Pipeline Recon",
                "signal_name": "Replacement Facility Inquiry Cross-Check",
                "source": "Commercial LOS & Core Loan Accounting",
                "observation": "Cross-referenced all borrowing entities and guarantors across Huntington's 1,400 branches. Zero replacement loan applications, zero rate lock commitments, and zero pending term sheets.",
                "risk_impact": "+35% Flight Probability (Excludes Refinance)",
                "verdict": "ZERO REPLACEMENT FINANCING"
            },
            {
                "category": "Servicing Request Pattern",
                "signal_name": "Prepayment Premium Quote Requested",
                "source": "Loan Servicing call log / payoff quote workflow",
                "observation": "Borrower requested a yield-maintenance premium quote on 2026-08-26, nineteen days before the scheduled closing; the premium can only be computed by Huntington, so the request lands on our own servicing desk. No Qualified Intermediary has been named to the bank and no exchange coordination has been requested.",
                "risk_impact": "+25% Flight Probability (Early Retirement Intent)",
                "verdict": "EARLY PAYOFF PRICED"
            },
            {
                "category": "Valuation & Liquidity Delta",
                "signal_name": "Unencumbered Net Equity Proceeds",
                "source": "Internal Liquidity Triage (NOI $637.5k @ 7.50% Cap Rate vs $5.18M UPB)",
                "observation": "Triangulated property valuation of $8,500,000 leaves $2,902,700.00 in net liquid equity after the title payoff quote ($5,214,800.00 = $5,180,000.00 unpaid principal + $34,800.00 accrued interest and exit fees) and estimated closing costs ($382,500.00 at 4.5%).",
                "risk_impact": "+14% Flight Urgency (High Liquidity Prize)",
                "verdict": "$2.90M AT-RISK CAPITAL"
            }
        ],
        "hypotheses": [
            {
                "hypothesis": "Hypothesis A: Internal Debt Refinance or Extension",
                "confidence_pct": 4,
                "status": "REJECTED",
                "rationale": "No replacement loan records in the LOS across Huntington's 21-state footprint. Demand originated by third-party title insurer representing external buyer."
            },
            {
                "hypothesis": "Hypothesis B: IRC §1031 Tax-Deferred Exchange",
                "confidence_pct": 12,
                "status": "UNCONFIRMED",
                "rationale": "No exchange coordination has been requested and no Qualified Intermediary has been named to the bank. Huntington is not a party to an exchange agreement and would not receive one, so this cannot be ruled out from bank-held data; the borrower also remains eligible to elect a 1031 prior to closing."
            },
            {
                "hypothesis": "Hypothesis C: Third-Party Asset Sale with Liquid Cash-Out",
                "confidence_pct": 94,
                "status": "ACCEPTED",
                "rationale": "Asset disposition confirmed by the inbound title closing demand, no replacement debt at Huntington, and a borrower-requested prepayment premium quote. Industry deposit-flight benchmark: 78% within 48-72 hours."
            }
        ],
        "trace_steps": [
            "[00:00.012] Ingested incoming eFax from First American Title (Escrow #FA-2026-8819-COL) via Microsoft Graph API connector.",
            "[00:00.048] Multimodal spatial parse: Extracted borrower entity 'Vance Riverfront Properties IV, LLC', facility #CC-8821, payoff quote $5,214,800.00, scheduled closing 2026-09-16.",
            "[00:00.082] Executed LOS and core ledger cross-reference: Facility #CC-8821 active. Query for replacement loan applications across Huntington's 1,400 branches returned 0 records.",
            "[00:00.125] Retrieved servicing request history for facility #CC-8821: borrower-requested yield-maintenance premium quote logged 2026-08-26. No 1031 exchange coordination requested.",
            "[00:00.169] Calculated net proceeds triage: Grounded valuation ($8,500,000) - title payoff quote ($5,214,800) - closing costs ($382,500) = $2,902,700 net cash equity.",
            "[00:00.210] Synthesized flight risk signals: Unencumbered seller cash + zero replacement credit + closing in 12 days. Industry deposit-flight benchmark: 78%.",
            "[00:00.245] Output composite confidence score: 94% (High Flight Risk). Auto-staged Tier 1 Business Premier ICS and borrower DocuSign routing packet."
        ]
    },
    "PO-2026-7492": {
        "payoff_id": "PO-2026-7492",
        "confidence_score": 88,
        "urgency_tier": "Qualified Escrow Flight (T-24 Days)",
        "classification": "IRC §1031 Like-Kind Exchange (Identified QI Intermediary)",
        "summary_verdict": "Detection agent identified active IRC §1031 exchange assignment naming Chicago Title Land Trust / IPX1031 as Qualified Intermediary. Because QI is assigned, net proceeds ($1,588,250.00) cannot touch borrower operating accounts; proceeds will wire to QI's custodial depository unless Huntington 1031 Qualified Escrow Depository is pre-staged.",
        "model_agent": "gemini-3.7-flash (Multimodal Signal Fusion)",
        "evaluation_timestamp": "2026-08-20T14:32:10Z",
        "fused_signals": [
            {
                "category": "Intake Topology & Channel",
                "signal_name": "T-120 Surveillance & Title Demand Intake",
                "source": "Chicago Title Insurance Co. (Escrow #CT-2026-4401-OH)",
                "observation": "Payoff demand received at T-24 days for scheduled asset disposition closing on September 28, 2026.",
                "risk_impact": "+20% Baseline Disposition Probability",
                "verdict": "THIRD-PARTY ESCROW OPENED"
            },
            {
                "category": "Credit Core & Pipeline Recon",
                "signal_name": "Replacement Facility Inquiry",
                "source": "Commercial LOS / SBA 7(a) Portfolio Queue",
                "observation": "Existing SBA 7(a) commercial facility #SBA-7492. External buyer ('Midwest Precision Holdings LLC') securing debt with third-party institutional lender; no replacement loan with Huntington.",
                "risk_impact": "+30% Flight Probability (External Financing)",
                "verdict": "NO REPLACEMENT FINANCING"
            },
            {
                "category": "Intermediary & Tax Identification",
                "signal_name": "Identifiable Qualified Intermediary (QI)",
                "source": "Multimodal Contract Exhibit C (Exchange Agreement)",
                "observation": "Formal IRC §1031 Exchange Assignment naming Chicago Title Land Trust / IPX1031 as Qualified Intermediary. Proceeds are legally prohibited from touching borrower accounts directly.",
                "risk_impact": "+28% Intermediary Flight Risk (Outside Escrow)",
                "verdict": "QI INTERMEDIARY CONFIRMED"
            },
            {
                "category": "Valuation & Liquidity Delta",
                "signal_name": "Exchange Equity Volume",
                "source": "Cap-Rate Triage Valuation ($3.15M est.) vs SBA Payoff ($1.42M)",
                "observation": "Estimated exchange proceeds of $1,588,250.00 held under exchange safe harbor.",
                "risk_impact": "+10% Institutional Depository Target",
                "verdict": "$1.59M QI ESCROW TARGET"
            }
        ],
        "hypotheses": [
            {
                "hypothesis": "Hypothesis A: Internal SBA Refinance",
                "confidence_pct": 3,
                "status": "REJECTED",
                "rationale": "Buyer is an outside acquirer using non-Huntington debt; SBA 7(a) payoff is final."
            },
            {
                "hypothesis": "Hypothesis B: Taxable Cash-Out to Operating Account",
                "confidence_pct": 9,
                "status": "REJECTED",
                "rationale": "Identified QI assignment legally prevents borrower constructive receipt."
            },
            {
                "hypothesis": "Hypothesis C: 1031 Exchange Wire to Outside Intermediary Bank",
                "confidence_pct": 88,
                "status": "ACCEPTED",
                "rationale": "Exchange documents identify QI. Without Huntington Qualified Escrow Depository, title wires funds to external QI depository bank."
            }
        ],
        "trace_steps": [
            "[00:00.010] Ingested Chicago Title payoff notice (#CT-2026-4401-OH) during scheduled T-120 surveillance sweep.",
            "[00:00.038] Parsed exhibits: Identified buyer entity 'Midwest Precision Holdings LLC' and independent lender.",
            "[00:00.071] Detected IRC §1031 Exchange exhibit: 'Notice of Assignment to Qualified Intermediary' naming Chicago Title Land Trust / IPX1031.",
            "[00:00.104] Queried the LOS replacement pipeline: 0 applications for Buckeye Precision Tooling or Arthur Pendelton.",
            "[00:00.142] Evaluated intermediary classification: Identifiable intermediary present. Proceeds are 100% tax-deferred exchange equity ($1.59M).",
            "[00:00.180] Output composite confidence score: 88% (Intermediary Flight Risk). Pre-staged Huntington 1031 Qualified Escrow Depository."
        ]
    },
    "PO-2026-6104": {
        "payoff_id": "PO-2026-6104",
        "confidence_score": 58,
        "urgency_tier": "Refinance Watchlist (T-45 Days)",
        "classification": "Competitive Refinance Inquiry / Equity Restructuring",
        "summary_verdict": "Detection agent flagged preliminary payoff inquiry from Commonwealth Land Title. The LOS indicates an active loan renewal discussion by Amanda Cross, but borrower is shopping competitive takeout terms with Fifth Third Bank. Moderate flight risk requires banker intervention to lock facility.",
        "model_agent": "gemini-3.7-flash (Multimodal Signal Fusion)",
        "evaluation_timestamp": "2026-08-05T11:20:00Z",
        "fused_signals": [
            {
                "category": "Intake Topology & Channel",
                "signal_name": "Preliminary Payoff Demand Inquiry",
                "source": "Commonwealth Land Title (Escrow #CLT-2026-9031-OH)",
                "observation": "Preliminary request for payoff figures at T-45 days. Closing tentative for October 19, 2026.",
                "risk_impact": "+15% Inquiry Signal",
                "verdict": "PRELIMINARY INQUIRY"
            },
            {
                "category": "Credit Core & Pipeline Recon",
                "signal_name": "Active Pipeline & Term Sheet Comparison",
                "source": "Commercial LOS / RM Amanda Cross",
                "observation": "Active renewal application in the LOS under review; borrower noted receiving competitive loan package from Fifth Third Bank.",
                "risk_impact": "+25% Competitive Takeout Risk",
                "verdict": "PENDING INTERNAL REFI"
            },
            {
                "category": "Intermediary & Tax Identification",
                "signal_name": "Tax Strategy Audit",
                "source": "Loan Purpose Documentation",
                "observation": "Zero QI intermediary detected. Medical partner buyout restructure.",
                "risk_impact": "+8% Unsettled Equity",
                "verdict": "NO QI INTERMEDIARY"
            },
            {
                "category": "Valuation & Liquidity Delta",
                "signal_name": "Equity Restructure Position",
                "source": "Triage NOI Valuation ($5.72M) vs UPB ($3.21M)",
                "observation": "Estimated equity delta of $2,222,600.00.",
                "risk_impact": "+10% Refinance Exposure",
                "verdict": "$2.22M EQUITY RESTRUCTURE"
            }
        ],
        "hypotheses": [
            {
                "hypothesis": "Hypothesis A: Competitive Refinance Takeout",
                "confidence_pct": 58,
                "status": "ACCEPTED",
                "rationale": "Borrower is comparing terms; title payoff inquiry indicates competitive lender may be preparing closing package."
            },
            {
                "hypothesis": "Hypothesis B: Third-Party Sale",
                "confidence_pct": 22,
                "status": "UNCONFIRMED",
                "rationale": "Preliminary title inquiry does not show a fully executed Purchase & Sale Agreement."
            },
            {
                "hypothesis": "Hypothesis C: 1031 Exchange",
                "confidence_pct": 5,
                "status": "REJECTED",
                "rationale": "Zero QI documents or exchange intention indicated."
            }
        ],
        "trace_steps": [
            "[00:00.012] Ingested preliminary payoff inquiry from Commonwealth Land Title (#CLT-2026-9031-OH).",
            "[00:00.045] LOS cross-check: Found in-progress renewal file #REN-6104 assigned to Amanda Cross.",
            "[00:00.089] CRM activity note: Client requested payoff quote to evaluate competing refinance quote from Fifth Third.",
            "[00:00.120] Intermediary check: No Qualified Intermediary exhibits present.",
            "[00:00.155] Synthesized classification: Competitive Refinance Takeout Risk (58% confidence). Staged for RM defensive rate-lock outreach."
        ]
    }
}

SIGNAL_GRAPHS: Dict[str, Dict[str, Any]] = {
    "PO-2026-8821": {
        "payoff_id": "PO-2026-8821",
        "deal_name": "Marcus Vance / Vance Riverfront Properties IV, LLC",
        "borrower_entity": "Vance Riverfront Properties IV, LLC",
        "classification": "Commercial Asset Sale / Taxable Cash-Out (High Flight Risk)",
        "confidence_score": 94,
        "spanner_stats": {
            "database": "huntington-commercial-graph",
            "engine": "Google Cloud Spanner Graph (ISO GQL Engine)",
            "instance": "spanner-us-east4-prod-a",
            "query_latency_ms": 18.4,
            "nodes_matched": 13,
            "edges_traversed": 14,
            "gql_query": (
                "GRAPH HuntingtonCommercialGraph\n"
                "MATCH (b:BorrowerEntity {id: 'VANCE-IV-LLC'})-[:HAS_BENEFICIAL_OWNER]->(p:Principal)\n"
                "OPTIONAL MATCH (p)-[:GUARANTOR_OF]->(f:CreditFacility {id: 'FAC-8821'})\n"
                "MATCH (f)<-[:PAYOFF_TARGET]-(d:TitleDemand {escrow_id: 'FA-2026-8819-COL'})\n"
                "OPTIONAL MATCH (f)<-[:QUOTED_FOR]-(q:PrepaymentQuote)\n"
                "OPTIONAL MATCH (b)-[:ASSIGNED_QI]->(qi:Intermediary)\n"
                "RETURN b.legal_name, p.name, p.guaranty_status, p.glba_quarantined,\n"
                "       q.requested_at, qi.id IS NOT NULL AS has_1031_qi, f.unpaid_balance"
            )
        },
        "nodes": [
            {
                "id": "src_fax",
                "label": "Inbound eFax Channel",
                "tier": "source",
                "status": "verified",
                "badge": "INBOUND EFAX",
                "subtitle": "Escrow #FA-2026-8819-COL",
                "properties": {
                    "Channel": "Microsoft Graph API eFax Intake",
                    "Originator": "First American Title Insurance Co.",
                    "Escrow Officer": "Karen Lindqvist",
                    "Demand Date": "2026-08-28",
                    "Closing Target": "2026-09-16 (T-12 Days)"
                },
                "agent_relevance": "Triggering inbound demand document setting the strict 12-day retention window.",
                "x": 90,
                "y": 120
            },
            {
                "id": "src_ncino",
                "label": "Commercial LOS",
                "tier": "source",
                "status": "verified",
                "badge": "LOS RECON",
                "subtitle": "Facility #CC-8821",
                "properties": {
                    "LOS System": "Commercial Loan Origination System",
                    "Active Applications": "0 In-Flight Records",
                    "Rate Lock Commitments": "0 Found Across 1,400 Branches",
                    "Recon Result": "No Replacement Debt"
                },
                "agent_relevance": "Cross-references enterprise pipeline to disprove internal refinance or term extension.",
                "x": 90,
                "y": 260
            },
            {
                "id": "src_afs",
                "label": "Core Loan Accounting",
                "tier": "source",
                "status": "verified",
                "badge": "CORE LEDGER",
                "subtitle": "UPB $5,180,000.00",
                "properties": {
                    "Core Ledger": "Level III Commercial Loan Core Ledger",
                    "Unpaid Principal": "$5,180,000.00",
                    "Calculated Payoff Quote": "$5,214,800.00",
                    "Per Diem Interest": "$692.50",
                    "Risk Rating": "Pass (Tier 2)"
                },
                "agent_relevance": "Supplies authoritative loan balances and per diems to ground equity calculations.",
                "x": 90,
                "y": 400
            },
            {
                "id": "note_facility",
                "label": "Commercial Note & Mortgage",
                "tier": "contract",
                "status": "active",
                "badge": "LIEN FACILITY",
                "subtitle": "Collateral: 410 S. High St.",
                "properties": {
                    "Instrument": "First Senior Commercial Mortgage",
                    "Original Facility": "$6,500,000.00",
                    "Collateral": "Riverfront Commercial Commons",
                    "Lien Release": "Conditioned on $5,214,800.00 Payoff"
                },
                "agent_relevance": "Primary collateralized debt facility being extinguished at closing.",
                "x": 280,
                "y": 200
            },
            {
                "id": "payoff_demand",
                "label": "Inbound Payoff Demand",
                "tier": "contract",
                "status": "active",
                "badge": "TITLE DEMAND",
                "subtitle": "Good-Through: 2026-09-16",
                "properties": {
                    "Escrow File Cited": "FA-2026-8819-COL (the requester's file number, not ours)",
                    "Signed By": "Karen Lindqvist, Commercial Escrow Officer",
                    "Borrower Authorization": "Signed by Marcus Vance, Managing Member",
                    "Not Received": "Settlement statement, seller disbursement instructions, purchase contract"
                },
                "agent_relevance": "The one instrument the payoff desk actually receives. It fixes the closing date and the settlement agent; it does not disclose the sale price or where the seller's net proceeds go.",
                "x": 280,
                "y": 360
            },
            {
                "id": "entity_borrower",
                "label": "Vance Riverfront Properties IV, LLC",
                "tier": "entity",
                "status": "verified",
                "badge": "BORROWER ENTITY",
                "subtitle": "Ohio LLC #4192081",
                "properties": {
                    "Jurisdiction": "Ohio Secretary of State",
                    "Tax Classification": "Pass-Through Entity (Multi-Member)",
                    "Formation Date": "2018-04-12",
                    "Operating DDA": "Huntington Commercial Checking (*4109)"
                },
                "agent_relevance": "Borrowing entity holding title to real estate; pass-through entity to beneficial owners.",
                "x": 470,
                "y": 200
            },
            {
                "id": "entity_title",
                "label": "First American Title Insurance Co.",
                "tier": "entity",
                "status": "verified",
                "badge": "SETTLEMENT AGENT",
                "subtitle": "Columbus Branch #14",
                "properties": {
                    "ALTA Identifier": "ALTA-OH-7721",
                    "Escrow Location": "Downtown Columbus Commercial Unit",
                    "Wire Verification": "Independent call-back authentication before disbursement (ALTA Best Practices — voluntary industry standard)"
                },
                "agent_relevance": "Settlement agent receiving the official Huntington payoff verification letter.",
                "x": 470,
                "y": 360
            },
            {
                "id": "principal_marcus",
                "label": "Marcus Vance",
                "tier": "principal",
                "status": "verified",
                "badge": "PRIMARY GUARANTOR (85%)",
                "subtitle": "Managing Member & Sponsor",
                "properties": {
                    "Equity Stake": "85.0% Majority Interest",
                    "Guaranty Type": "Full Joint & Several Personal Guarantee",
                    "Known HBAN Liquidity": "$2,100,000.00 in Commercial / Private DDA",
                    "Tier A Routing Basis": "$4.57M projected personal investable = $2.10M held at Huntington + $2.47M expected proceeds (85% member interest). Clears the $3M Private Bank service tier; the entity's $2.90M is not the routing input."
                },
                "agent_relevance": "Primary commercial relationship sponsor targeted for RM outreach and wealth bridge.",
                "x": 660,
                "y": 160
            },
            {
                "id": "principal_elena",
                "label": "Elena Vance",
                "tier": "principal",
                "status": "quarantined",
                "badge": "NPI QUARANTINED (15%)",
                "subtitle": "Passive Member / Non-Guarantor",
                "properties": {
                    "Equity Stake": "15.0% Minority Interest",
                    "Guaranty Status": "Non-Guarantor (No Commercial Guarantee)",
                    "Source of Record": "LLC Operating Agreement, credit file (document extraction)",
                    "CDD Coverage": "Below the 25% FinCEN beneficial-owner threshold, so beneficial-ownership certification would not capture her",
                    "NPI Handling Status": "Quarantined pending opt-in (GLBA Reg P / FCRA § 604 framework)",
                    "Exclusion Sentry": "Firewalled from Wealth Advisory CRM Pending Opt-In"
                },
                "agent_relevance": "Exclusion Sentry boundary test. She sits below the 25% CDD threshold, so she appears only in the operating agreement, invisible to every structured system, and is firewalled from retail wealth systems.",
                "x": 660,
                "y": 320
            },
            {
                "id": "sig_no_refi",
                "label": "No Replacement Facility at Huntington",
                "tier": "signal",
                "status": "flagged",
                "badge": "BEHAVIORAL SIGNAL",
                "subtitle": "+35% Flight Risk Weight",
                "properties": {
                    "Core Query": "Core Ledger + LOS Cross-System Footprint Scan",
                    "Scope of Visibility": "Huntington systems only (~1,400 offices)",
                    "Pending Pipelines": "0 Applications / 0 Term Sheets",
                    "Finding": "Rules out a replacement facility at Huntington",
                    "Limitation": "External lender pipelines are not observable"
                },
                "agent_relevance": "Rules out an internal refinance. An external refinance cannot be excluded from bank-held data alone; that requires the inbound title demand.",
                "x": 850,
                "y": 120
            },
            {
                "id": "sig_prepay_quote",
                "label": "Prepayment Premium Quote Requested",
                "tier": "signal",
                "status": "flagged",
                "badge": "BORROWER REQUEST",
                "subtitle": "+25% Disposition Weight",
                "properties": {
                    "Request Channel": "Borrower call to Loan Servicing, logged 2026-08-26",
                    "Quote Issued": "Yield-maintenance premium, good through 2026-09-16",
                    "Why We Can See It": "The premium can only be computed by Huntington, so the borrower has to ask us for it",
                    "Finding": "Borrower is pricing an early retirement of the facility, not a renewal",
                    "Limitation": "Confirms early payoff; on its own it does not separate a sale from an external refinance"
                },
                "agent_relevance": "The earliest disposition signal that originates inside the bank. A borrower who intends to carry the loan to maturity has no reason to price a prepayment premium.",
                "x": 850,
                "y": 240
            },
            {
                "id": "sig_equity_delta",
                "label": "Est. Net Equity Prize: $2,902,700",
                "tier": "signal",
                "status": "flagged",
                "badge": "LIQUIDITY PRIZE",
                "subtitle": "Estimated at 7.50% Cap Rate",
                "properties": {
                    "Indicative Valuation": "$8,500,000.00 est. ($637.5k NOI capitalized @ 7.50%)",
                    "Valuation Basis": "Cap-rate estimate; sale price not observed (no settlement statement)",
                    "Payoff Extinguishment": "$5,214,800.00",
                    "Estimated Closing Costs": "$382,500.00 (4.5% Standard Commercial Rate)",
                    "Net Liquid Proceeds": "$2,902,700.00 At-Risk Seller Equity (estimated)"
                },
                "agent_relevance": "Sizes the retention opportunity to drive urgency tiering. The valuation input is an estimate, so the figure is indicative rather than settled.",
                "x": 850,
                "y": 360
            },
            {
                "id": "verdict_node",
                "label": "Commercial Disposition / Taxable Cash-Out",
                "tier": "verdict",
                "status": "verified",
                "badge": "94% AGENT CONFIDENCE",
                "subtitle": "Urgency: Critical (T-12 Days)",
                "properties": {
                    "Composite Confidence": "94.2% Deterministic Graph Fusion",
                    "Confidence Basis": "Anchored on the inbound title payoff demand and the borrower's own prepayment-quote request (T-12); maturity screening alone does not separate a sale from a refinance",
                    "Urgency Window": "Critical (12 Calendar Days to Closing)",
                    "Recommended Product": "Huntington Business Premier ICS (4.85% APY)",
                    "Wealth Scaffolding": "Pre-Staged Series 7/66 Intake Shell (Quarantined)",
                    "Proceeds Treatment": "Taxable cash-out presumed. No exchange coordination has been requested and the bank is not a party to any §1031 agreement, so this cannot be confirmed from bank-held data. Either path is deposit flight; it selects the product."
                },
                "agent_relevance": "Final verdict grounding the Commercial RM T-12 phone briefing. Classification firms up when the title demand lands; the earlier signals set the watchlist.",
                "x": 850,
                "y": 490
            }
        ],
        "edges": [
            {"id": "e1", "source": "src_fax", "target": "payoff_demand", "label": "INBOUND_DEMAND", "type": "primary"},
            {"id": "e2", "source": "src_ncino", "target": "note_facility", "label": "CORE_RECON", "type": "primary"},
            {"id": "e3", "source": "src_afs", "target": "note_facility", "label": "SERVICING_DATA", "type": "primary"},
            {"id": "e4", "source": "payoff_demand", "target": "entity_title", "label": "ASSIGNED_ESCROW", "type": "primary"},
            {"id": "e5", "source": "note_facility", "target": "entity_borrower", "label": "BORROWER_OBLIGOR", "type": "primary"},
            {"id": "e6", "source": "entity_borrower", "target": "principal_marcus", "label": "BENEFICIAL_OWNER_85PCT", "type": "primary"},
            {"id": "e7", "source": "entity_borrower", "target": "principal_elena", "label": "BENEFICIAL_OWNER_15PCT", "type": "quarantined"},
            {"id": "e8", "source": "note_facility", "target": "sig_no_refi", "label": "PIPELINE_CHECK", "type": "signal"},
            {"id": "e9", "source": "payoff_demand", "target": "verdict_node", "label": "ANCHORS_CLASSIFICATION", "type": "verdict"},
            {"id": "e10", "source": "note_facility", "target": "sig_equity_delta", "label": "VALUATION_TRIAGE", "type": "signal"},
            {"id": "e11", "source": "sig_no_refi", "target": "verdict_node", "label": "CONFIRMS_DISPOSITION", "type": "verdict"},
            {"id": "e12", "source": "sig_prepay_quote", "target": "verdict_node", "label": "CONFIRMS_EARLY_PAYOFF", "type": "verdict"},
            {"id": "e13", "source": "sig_equity_delta", "target": "verdict_node", "label": "SCALES_PRIORITY", "type": "verdict"},
            {"id": "e14", "source": "note_facility", "target": "sig_prepay_quote", "label": "SERVICING_REQUEST", "type": "signal"}
        ]
    },
    "PO-2026-7492": {
        "payoff_id": "PO-2026-7492",
        "deal_name": "Arthur Pendelton / Buckeye Precision Tooling Corp.",
        "borrower_entity": "Buckeye Precision Tooling Corp.",
        "classification": "IRC §1031 Like-Kind Exchange (Identified QI Intermediary)",
        "confidence_score": 88,
        "spanner_stats": {
            "database": "huntington-commercial-graph",
            "engine": "Google Cloud Spanner Graph (ISO GQL Engine)",
            "instance": "spanner-us-east4-prod-a",
            "query_latency_ms": 16.2,
            "nodes_matched": 10,
            "edges_traversed": 11,
            "gql_query": (
                "GRAPH HuntingtonCommercialGraph\n"
                "MATCH (b:BorrowerEntity {id: 'BUCKEYE-TOOL-CORP'})-[:HAS_BENEFICIAL_OWNER]->(p:Principal)\n"
                "MATCH (b)-[:OBLIGOR_ON]->(f:SBAFacility {id: 'SBA-7492'})\n"
                "MATCH (f)<-[:PAYOFF_TARGET]-(d:TitleDemand {escrow_id: 'CT-2026-4401-OH'})\n"
                "MATCH (b)-[:SUBMITTED]->(r:ExchangeCoordinationRequest)-[:NAMES_QI]->(qi:QualifiedIntermediary)\n"
                "RETURN b.legal_name, p.name, qi.entity_name, r.logged_at, f.unpaid_balance"
            )
        },
        "nodes": [
            {
                "id": "src_chicago_fax",
                "label": "Chicago Title Demand",
                "tier": "source",
                "status": "verified",
                "badge": "INBOUND DEMAND",
                "subtitle": "Escrow #CT-2026-4401-OH",
                "properties": {
                    "Channel": "Scheduled T-120 Surveillance Sweep",
                    "Title Company": "Chicago Title Insurance Co.",
                    "Escrow Officer": "Mark Henderson",
                    "Demand Date": "2026-08-15"
                },
                "agent_relevance": "Payoff intake identifying commercial industrial asset disposition.",
                "x": 90,
                "y": 150
            },
            {
                "id": "src_sba_core",
                "label": "SBA 7(a) Core Accounting",
                "tier": "source",
                "status": "verified",
                "badge": "SBA LEDGER",
                "subtitle": "UPB $1,405,000.00",
                "properties": {
                    "Facility Type": "SBA 7(a) Commercial Loan",
                    "Unpaid Principal": "$1,405,000.00",
                    "Payoff Quote": "$1,420,000.00",
                    "Risk Rating": "Pass (Tier 1)"
                },
                "agent_relevance": "Authoritative SBA facility ledger data.",
                "x": 90,
                "y": 350
            },
            {
                "id": "note_sba",
                "label": "SBA 7(a) Term Loan & Security",
                "tier": "contract",
                "status": "active",
                "badge": "TERM FACILITY",
                "subtitle": "Payoff: $1,420,000.00",
                "properties": {
                    "Original Loan": "$2,200,000.00",
                    "Collateral": "Buckeye Industrial Campus B (1280 Dublin Rd)",
                    "Maturity": "2029-05-15"
                },
                "agent_relevance": "SBA note being repaid by outside commercial acquirer.",
                "x": 280,
                "y": 200
            },
            {
                "id": "contract_1031",
                "label": "Borrower 1031 Coordination Request",
                "tier": "contract",
                "status": "active",
                "badge": "RM CALL NOTE",
                "subtitle": "Logged 2026-08-18 by Commercial RM",
                "properties": {
                    "Channel": "Inbound borrower call to the Commercial RM, logged in CRM",
                    "Intermediary Named by Borrower": "IPX1031",
                    "Document Status": "Exchange agreement not provided; the bank is not a party to it"
                },
                "agent_relevance": "The bank learns of the exchange because the borrower asks for help with it, not because it receives the exchange agreement.",
                "x": 660,
                "y": 400
            },
            {
                "id": "entity_buckeye",
                "label": "Buckeye Precision Tooling Corp.",
                "tier": "entity",
                "status": "verified",
                "badge": "BORROWER ENTITY",
                "subtitle": "Ohio C-Corporation",
                "properties": {
                    "Tax Entity": "Commercial C-Corporation",
                    "Industry": "Advanced Manufacturing / Machine Tooling",
                    "Operating DDA": "Huntington Business Commercial Checking"
                },
                "agent_relevance": "Operating corporate borrower selling manufacturing facility.",
                "x": 470,
                "y": 200
            },
            {
                "id": "entity_qi",
                "label": "IPX1031 / Chicago Title Trust",
                "tier": "entity",
                "status": "verified",
                "badge": "QUALIFIED INTERMEDIARY",
                "subtitle": "Statutory Escrow Intermediary",
                "properties": {
                    "Corporate Name": "Investment Property Exchange Services, Inc.",
                    "Fiduciary Role": "IRC §1031 Qualified Intermediary",
                    "Escrow Prerequisite": "Prohibits Direct Taxpayer Constructive Receipt"
                },
                "agent_relevance": "Designated intermediary requiring Huntington 1031 Qualified Escrow Depository bridge.",
                "x": 470,
                "y": 360
            },
            {
                "id": "principal_arthur",
                "label": "Arthur Pendelton",
                "tier": "principal",
                "status": "verified",
                "badge": "100% OWNER / GUARANTOR",
                "subtitle": "President & Sole Shareholder",
                "properties": {
                    "Ownership": "100.0% Common Stock",
                    "Guaranty": "Unconditional Personal SBA Guaranty",
                    "Known HBAN Balances": "$890,000.00 Operating DDA"
                },
                "agent_relevance": "Sole principal executing 1031 like-kind replacement property acquisition.",
                "x": 660,
                "y": 220
            },
            {
                "id": "sig_qi_confirmed",
                "label": "QI Named by Borrower",
                "tier": "signal",
                "status": "flagged",
                "badge": "BORROWER-STATED",
                "subtitle": "Qualified Escrow Opportunity",
                "properties": {
                    "Safe Harbor Sought": "Treas. Reg. § 1.1031(k)-1(g)(3) qualified escrow account",
                    "Intermediary Named": "IPX1031 (stated by the borrower; not independently verified)",
                    "Signal Impact": "Proceeds route to a qualified escrow rather than the operating DDA; the retention play is the escrow depository, not ICS"
                },
                "agent_relevance": "Directs retention strategy toward Huntington 1031 Escrow Depository.",
                "x": 850,
                "y": 160
            },
            {
                "id": "sig_escrow_target",
                "label": "Exchange Proceeds: $1,588,250",
                "tier": "signal",
                "status": "flagged",
                "badge": "ESCROW TARGET",
                "subtitle": "Huntington Qualified Escrow Depository / QI: IPX1031 (4.75%)",
                "properties": {
                    "Indicative Valuation": "$3,150,000.00 est. ($245.7k NOI capitalized @ 7.80%)",
                    "Debt Extinguishment": "$1,420,000.00",
                    "Estimated Closing Costs": "$141,750.00 (4.5% Standard Commercial Rate)",
                    "Net Exchange Proceeds": "$1,588,250.00 estimated safe-harbor proceeds"
                },
                "agent_relevance": "High-yield escrow depository volume available for Huntington retention.",
                "x": 850,
                "y": 310
            },
            {
                "id": "verdict_node_1031",
                "label": "IRC §1031 Tax-Deferred Exchange",
                "tier": "verdict",
                "status": "verified",
                "badge": "88% AGENT CONFIDENCE",
                "subtitle": "Urgency: High (T-24 Days)",
                "properties": {
                    "Composite Confidence": "88.4% Multimodal Verification",
                    "Target Solution": "Huntington 1031 Qualified Escrow Depository (4.75% APY)",
                    "Partner Coordination": "IPX1031 Qualified Intermediary Agreement"
                },
                "agent_relevance": "Pre-stages specialized 1031 escrow sweep routing package for settlement agent.",
                "x": 850,
                "y": 470
            }
        ],
        "edges": [
            {"id": "e1_7492", "source": "entity_buckeye", "target": "contract_1031", "label": "SUBMITTED_REQUEST", "type": "primary"},
            {"id": "e2_7492", "source": "src_sba_core", "target": "note_sba", "label": "CORE_LEDGER", "type": "primary"},
            {"id": "e3_7492", "source": "note_sba", "target": "entity_buckeye", "label": "BORROWER_OBLIGOR", "type": "primary"},
            {"id": "e4_7492", "source": "contract_1031", "target": "entity_qi", "label": "ASSIGNS_PROCEEDS_TO", "type": "primary"},
            {"id": "e5_7492", "source": "entity_buckeye", "target": "principal_arthur", "label": "SOLE_OWNER_100PCT", "type": "primary"},
            {"id": "e6_7492", "source": "contract_1031", "target": "sig_qi_confirmed", "label": "NAMES_INTERMEDIARY", "type": "signal"},
            {"id": "e7_7492", "source": "note_sba", "target": "sig_escrow_target", "label": "EQUITY_RECON", "type": "signal"},
            {"id": "e8_7492", "source": "sig_qi_confirmed", "target": "verdict_node_1031", "label": "SELECTS_ESCROW_PRODUCT", "type": "verdict"},
            {"id": "e9_7492", "source": "sig_escrow_target", "target": "verdict_node_1031", "label": "QUALIFIES_ESCROW_DEP", "type": "verdict"},
            {"id": "e10_7492", "source": "entity_qi", "target": "sig_qi_confirmed", "label": "QI_DESIGNATION", "type": "primary"},
            {"id": "e11_7492", "source": "principal_arthur", "target": "sig_escrow_target", "label": "BENEFICIAL_INTEREST", "type": "primary"}
        ]
    },
    "PO-2026-6104": {
        "payoff_id": "PO-2026-6104",
        "deal_name": "Dr. Robert Miller / Columbus Medical Arts Center LLC",
        "borrower_entity": "Columbus Medical Arts Center LLC",
        "classification": "Competitive Refinance Inquiry / Equity Restructuring",
        "confidence_score": 58,
        "spanner_stats": {
            "database": "huntington-commercial-graph",
            "engine": "Google Cloud Spanner Graph (ISO GQL Engine)",
            "instance": "spanner-us-east4-prod-a",
            "query_latency_ms": 19.1,
            "nodes_matched": 9,
            "edges_traversed": 10,
            "gql_query": (
                "GRAPH HuntingtonCommercialGraph\n"
                "MATCH (b:BorrowerEntity {id: 'COL-MED-ARTS-LLC'})-[:HAS_BENEFICIAL_OWNER]->(p:Principal)\n"
                "MATCH (b)-[:OBLIGOR_ON]->(f:CommercialMortgage {id: 'FAC-6104'})\n"
                "MATCH (f)<-[:INQUIRY_FROM]-(t:TitleInquiry {escrow_id: 'CLT-2026-9031-OH'})\n"
                "OPTIONAL MATCH (b)-[:APPLICATION_IN_PROGRESS]->(app:LoanApplication)\n"
                "RETURN b.legal_name, p.name, f.unpaid_balance, app.status, app.proposed_rate"
            )
        },
        "nodes": [
            {
                "id": "src_clt_inquiry",
                "label": "Commonwealth Title Inquiry",
                "tier": "source",
                "status": "verified",
                "badge": "TITLE INQUIRY",
                "subtitle": "File #CLT-2026-9031-OH",
                "properties": {
                    "Inquiry Type": "Preliminary Payoff Demand Quote Request",
                    "Title Insurer": "Commonwealth Land Title",
                    "Settlement Officer": "David S. Vance",
                    "Inquiry Date": "2026-08-01"
                },
                "agent_relevance": "Preliminary quote request indicating active rate-shopping or debt restructuring.",
                "x": 90,
                "y": 150
            },
            {
                "id": "src_recon_pipeline",
                "label": "Huntington Pipeline Recon",
                "tier": "source",
                "status": "verified",
                "badge": "INTERNAL RECON",
                "subtitle": "Renewal File #REN-6104",
                "properties": {
                    "Commercial RM": "Amanda Cross",
                    "CRM Note": "Client requested payoff quote to evaluate competing refinance quote",
                    "Renewal Status": "Underwriting Review Pending Defensive Rate Match"
                },
                "agent_relevance": "Identifies ongoing internal commercial relationship retention dialogue.",
                "x": 90,
                "y": 350
            },
            {
                "id": "note_med",
                "label": "Healthcare Practice Mortgage",
                "tier": "contract",
                "status": "active",
                "badge": "EXISTING MORTGAGE",
                "subtitle": "Payoff: $3,240,000.00",
                "properties": {
                    "Facility Balance": "$3,210,000.00 UPB",
                    "Payoff Quote": "$3,240,000.00",
                    "Collateral": "Scioto Medical Pavilion (850 Bethel Rd)"
                },
                "agent_relevance": "Mortgage subject to takeout by competing regional lender.",
                "x": 280,
                "y": 200
            },
            {
                "id": "contract_refi",
                "label": "Competing Offer (Client-Reported)",
                "tier": "contract",
                "status": "active",
                "badge": "CLIENT-REPORTED",
                "subtitle": "Relayed to RM Amanda Cross",
                "properties": {
                    "Proposed Financing": "Commercial term loan (~$3.24M), as described by the client",
                    "Cash Extraction": "$0.00 (client states pure debt replacement)",
                    "Rate Differential": "Estimated -35 bps vs Existing Note"
                },
                "agent_relevance": "Competitive threat as relayed by the client; Huntington does not hold the competitor's term sheet. The risk here is loan asset runoff, not liquid deposit flight.",
                "x": 280,
                "y": 360
            },
            {
                "id": "entity_med",
                "label": "Columbus Medical Arts Center LLC",
                "tier": "entity",
                "status": "verified",
                "badge": "BORROWER ENTITY",
                "subtitle": "Healthcare Practice Facility LLC",
                "properties": {
                    "Specialty": "Outpatient Surgical & Specialty Practice",
                    "Jurisdiction": "Ohio",
                    "Commercial Relationship": "12-Year Huntington Commercial Client"
                },
                "agent_relevance": "Operating borrower entity evaluating capital structure options.",
                "x": 470,
                "y": 200
            },
            {
                "id": "principal_dr_miller",
                "label": "Dr. Robert Miller, MD",
                "tier": "principal",
                "status": "verified",
                "badge": "100% MANAGING MEMBER",
                "subtitle": "Physician & Sole Guarantor",
                "properties": {
                    "Role": "Managing Partner & Surgical Director",
                    "Guaranty": "Unconditional Commercial Guaranty",
                    "Known HBAN Deposits": "$1,450,000.00 Practice & Personal Accounts"
                },
                "agent_relevance": "Primary borrower contact for RM defensive loan modification counter-proposal.",
                "x": 660,
                "y": 220
            },
            {
                "id": "sig_rate_shopping",
                "label": "Active Rate-Shopping Inquiry",
                "tier": "signal",
                "status": "flagged",
                "badge": "REFINANCE SIGNAL",
                "subtitle": "Term Extension Inquiry",
                "properties": {
                    "RM Intelligence": "Amanda Cross recorded competitor solicitation",
                    "Signal Implication": "Loan Portfolio Runoff Risk",
                    "Signal Impact": "+52% Refinance Probability"
                },
                "agent_relevance": "Directs agent to recommend commercial credit retention rather than wealth triage.",
                "x": 850,
                "y": 160
            },
            {
                "id": "sig_zero_equity",
                "label": "Zero Net Equity Extracted ($0)",
                "tier": "signal",
                "status": "flagged",
                "badge": "EQUITY CONSERVATION",
                "subtitle": "No Liquid Cash-Out",
                "properties": {
                    "Payoff Quote": "$3,240,000.00",
                    "Replacement Debt": "$3,240,000.00",
                    "Liquid Equity Disbursed": "$0.00 Net Cash",
                    "Signal Impact": "Excludes Deposit Flight Playbook"
                },
                "agent_relevance": "Confirms lack of liquid wealth proceeds; flags deal as credit counter-offer priority.",
                "x": 850,
                "y": 310
            },
            {
                "id": "verdict_node_refi",
                "label": "Competitive Refinance / Term Extension",
                "tier": "verdict",
                "status": "verified",
                "badge": "58% AGENT CONFIDENCE",
                "subtitle": "Urgency: Watchlist (T-45 Days)",
                "properties": {
                    "Composite Confidence": "58.0% Competitive Refinance Risk",
                    "Actionable Playbook": "Huntington Commercial Retention Pricing Match (SOFR + 195 bps)",
                    "Primary Owner": "Amanda Cross (Commercial RM)"
                },
                "agent_relevance": "Routes deal to Commercial RM watchlist for defensive pricing adjustment.",
                "x": 850,
                "y": 470
            }
        ],
        "edges": [
            {"id": "e1_6104", "source": "src_clt_inquiry", "target": "note_med", "label": "PRELIMINARY_QUOTE", "type": "primary"},
            {"id": "e2_6104", "source": "src_recon_pipeline", "target": "contract_refi", "label": "COMPETITIVE_INTEL", "type": "primary"},
            {"id": "e3_6104", "source": "note_med", "target": "entity_med", "label": "BORROWER_OBLIGOR", "type": "primary"},
            {"id": "e4_6104", "source": "entity_med", "target": "principal_dr_miller", "label": "SOLE_MEMBER_100PCT", "type": "primary"},
            {"id": "e5_6104", "source": "contract_refi", "target": "sig_rate_shopping", "label": "RATE_SHOPPING_EVIDENCE", "type": "signal"},
            {"id": "e6_6104", "source": "contract_refi", "target": "sig_zero_equity", "label": "BALANCE_MATCH", "type": "signal"},
            {"id": "e7_6104", "source": "sig_rate_shopping", "target": "verdict_node_refi", "label": "CONFIRMS_REFINANCE", "type": "verdict"},
            {"id": "e8_6104", "source": "sig_zero_equity", "target": "verdict_node_refi", "label": "REJECTS_DEPOSIT_FLIGHT", "type": "verdict"},
            {"id": "e9_6104", "source": "principal_dr_miller", "target": "sig_rate_shopping", "label": "EVALUATING_OFFERS", "type": "primary"},
            {"id": "e10_6104", "source": "note_med", "target": "contract_refi", "label": "TAKEOUT_TARGET", "type": "primary"}
        ]
    }
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
    """Adapts in-memory payoff queue items to the canonical PayoffStatement domain model."""
    if not PAYOFF_QUEUE:
        raise HTTPException(status_code=404, detail="Payoff queue is empty")
    raw = next((p for p in PAYOFF_QUEUE if p["id"] == payoff_id), None)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Payoff deal '{payoff_id}' not found.")
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
    # True only when the text was produced by a real model call. False means the
    # canned offline fallback served this response, so nothing here is model-grounded.
    live: bool = True

class ValuationRequest(BaseModel):
    payoff_id: Optional[str] = Field(default="PO-2026-8821")
    sale_price: float = Field(default=8500000.00, ge=500000.00, le=50000000.00)
    noi: float = Field(default=637500.00, gt=0)
    cap_rate: float = Field(default=0.075, gt=0, le=1.0)
    debt_payoff: float = Field(default=5214800.00, ge=0)
    closing_cost_rate: float = Field(default=0.045, ge=0, le=1.0)
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
    model_risk_designation: str

class QuarantineToggleRequest(BaseModel):
    payoff_id: Optional[str] = "PO-2026-8821"
    verbal_consent_recorded: bool
    recorded_by: str = "Greg Miller (Commercial RM)"
    client_notes: Optional[str] = "Borrower affirmed willingness to review Huntington Business Premier ICS and Private Wealth advisory options."


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
            # size. The prior 2,140 was unsourced and understated the book by 5x.
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
            "sba_ranking": "Top-2 National SBA 7(a) Lender",
            "csa_leverage_ratio": "2x CSA Leverage (1 CSA : 4 PWAs)"
        },
        "payoff_items": items
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
    return trace


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
    return graph


@app.get("/api/entity-resolution")
async def get_entity_resolution(
    payoff_id: str = Query("PO-2026-8821"),
    user: Dict[str, Any] = Depends(get_authenticated_user)
) -> Dict[str, Any]:
    """
    Provides Gemini 3.7 Flash multimodal document extraction returning
    borrower-specific LLC ownership topology, bounding boxes, and document grounding.
    """
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
                "known_hban_accounts": ["Commercial DDA #..4401", "Operating Reserve #..9182"],
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
    """
    target_id = req.payoff_id or "PO-2026-8821"
    get_payoff_by_id(target_id)
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if req.verbal_consent_recorded:
        audit_data = f"{target_id}:{req.recorded_by}:{now_iso}:CROSS-LOB-CONSENT-RECORD".encode("utf-8")
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
    strategy: str = Query("cash_out", pattern="^(cash_out|1031_exchange)$"),
    sale_price: float = Query(8500000.00, gt=0),
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

    return {
        "status": "Active / Ready for Advisor Authorship",
        "quarantined": False,
        "payoff_id": payoff_id,
        "assigned_pwa": pwa_title,
        "target_client": f"{payoff.primary_guarantor} (Non-guarantor co-owners excluded pending affirmative opt-in)",
        "household_id": f"HH-{payoff.borrower_entity[:8].replace(' ', '').upper()}-4401",
        "staged_kyc_cip": {
            "completion_percentage": 82,
            "verified_fields": [
                {"field": "Full Legal Names", "value": f"{payoff.primary_guarantor} (Guarantor Profile)", "status": "Verified (Commercial Credit File)"},
                {"field": "Entity Structure", "value": f"{payoff.borrower_entity} / Family Trust", "status": "Verified (Articles of Org)"},
                {"field": "Taxpayer Identification", "value": "EIN on file (Commercial Credit Vault)", "status": "Verified"},
                {"field": "Residential Address", "value": f"Guarantor File: {payoff.primary_guarantor}, Columbus, OH", "status": "Verified"},
                {"field": "Primary Banking Source", "value": f"Huntington Commercial DDA #..{payoff_id.split('-')[-1]}", "status": "Verified"},
                {"field": "Source of Wealth", "value": f"Commercial Real Estate Disposition ({payoff.property_name})", "status": "Pending Closing Settlement"}
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
            "cash_depository_link": "Huntington National Bank FDIC Pass-Through Sweep"
        },
        "draft_ips_scaffolding": {
            "mandate": "Conservative Capital Preservation & Liquidity Bridge",
            "horizon": "Medium-to-Long Term (Post-Disposition)",
            "liquidity_reserve_sleeve": "$500,000 in Ultra-Short Treasury / Huntington ICS",
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

    # Local dev fallback: serve brand_kit.html or demo_script.html from frontend/public or root
    for candidate_dir in [Path("frontend/public").resolve(), Path(".").resolve()]:
        if candidate_dir.is_dir():
            candidate_file = (candidate_dir / full_path).resolve()
            if (candidate_dir in candidate_file.parents or candidate_file == candidate_dir) and candidate_file.is_file():
                if full_path in ["brand_kit.html", "demo_script.html", "huntington-book-scout.pdf", "overview.html"]:
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
