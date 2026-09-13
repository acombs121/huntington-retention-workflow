from typing import Dict, Any

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
