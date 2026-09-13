from typing import Dict, Any

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
                "subtitle": "Ohio S-Corporation",
                "properties": {
                    "Tax Entity": "Subchapter S Corporation",
                    "Industry": "Advanced Manufacturing / Machine Tooling",
                    "Operating DDA": "Huntington Business Commercial Checking"
                },
                "agent_relevance": "Operating corporate borrower selling the manufacturing facility. The corporation holds title, so the corporation -- not Arthur personally -- is the exchanging taxpayer on any IRC §1031 replacement.",
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
                "badge": "70% OWNER / GUARANTOR",
                "subtitle": "President & Majority Shareholder",
                "properties": {
                    "Ownership": "70.0% Voting Common",
                    "Co-Shareholder": "Janet Pendelton, 30% common, joint personal guarantor",
                    "Guaranty": "Unconditional Personal SBA Guaranty",
                    "Known HBAN Balances": "$890,000.00 Operating DDA"
                },
                "agent_relevance": "Majority shareholder and personal guarantor. His interest in the replacement property runs through his stock in the corporation, which holds title and is the exchanging taxpayer.",
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
            {"id": "e5_7492", "source": "entity_buckeye", "target": "principal_arthur", "label": "BENEFICIAL_OWNER_70PCT", "type": "primary"},
            {"id": "e6_7492", "source": "contract_1031", "target": "sig_qi_confirmed", "label": "NAMES_INTERMEDIARY", "type": "signal"},
            {"id": "e7_7492", "source": "note_sba", "target": "sig_escrow_target", "label": "EQUITY_RECON", "type": "signal"},
            {"id": "e8_7492", "source": "sig_qi_confirmed", "target": "verdict_node_1031", "label": "SELECTS_ESCROW_PRODUCT", "type": "verdict"},
            {"id": "e9_7492", "source": "sig_escrow_target", "target": "verdict_node_1031", "label": "QUALIFIES_ESCROW_DEP", "type": "verdict"},
            {"id": "e10_7492", "source": "entity_qi", "target": "sig_qi_confirmed", "label": "QI_DESIGNATION", "type": "primary"},
            {"id": "e11_7492", "source": "entity_buckeye", "target": "sig_escrow_target", "label": "EXCHANGING_TAXPAYER", "type": "primary"}
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
