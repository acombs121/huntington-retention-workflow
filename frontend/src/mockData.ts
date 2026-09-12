import {
  CapacityMeter,
  PayoffItem,
  EntityResolutionData,
  ValuationData,
  QuarantineState,
  WireInstructionData,
  WealthOnboardingData,
  DetectionReasoningTrace,
  SpannerGraphData
} from './types';

export const detectionReasoningTraces: Record<string, DetectionReasoningTrace> = {
  "PO-2026-8821": {
    payoff_id: "PO-2026-8821",
    confidence_score: 94,
    urgency_tier: "Critical Flight Risk (T-12 Days)",
    classification: "Commercial Asset Sale / Taxable Cash-Out (High Flight Risk)",
    summary_verdict: "Detection agent confirmed a third-party asset sale: zero replacement financing anywhere in Huntington, and a prepayment premium quote the borrower asked us to price. An estimated $2,902,700.00 in net seller equity leaves the facility at closing. No exchange coordination has been requested, so the proceeds are presumed taxable -- but under either treatment the balance leaves, exposing the relationship to deposit flight within 48 hours.",
    model_agent: "gemini-3.7-flash (Multimodal Signal Fusion)",
    evaluation_timestamp: "2026-09-04T08:14:22Z",
    fused_signals: [
      {
        category: "Intake Topology & Channel",
        signal_name: "Third-Party Settlement Escrow Demand",
        source: "Inbound eFax via Microsoft Graph API / First American Title (Escrow #FA-2026-8819-COL)",
        observation: "Demand letter requests exact loan payoff calculation for closing scheduled on September 16, 2026. Signed by Commercial Escrow Officer Karen Lindqvist.",
        risk_impact: "+20% Baseline Disposition Probability",
        verdict: "EXTERNAL ESCROW OPENED"
      },
      {
        category: "Credit Core & Pipeline Recon",
        signal_name: "Replacement Facility Inquiry Cross-Check",
        source: "Commercial LOS & Core Loan Accounting",
        observation: "Cross-referenced all borrowing entities and guarantors across Huntington's 1,400 branches. Zero replacement loan applications, zero rate lock commitments, and zero pending term sheets.",
        risk_impact: "+35% Flight Probability (Excludes Refinance)",
        verdict: "ZERO REPLACEMENT FINANCING"
      },
      {
        category: "Servicing Request Pattern",
        signal_name: "Prepayment Premium Quote Requested",
        source: "Loan Servicing call log / payoff quote workflow",
        observation: "Borrower requested a yield-maintenance premium quote on 2026-08-26, nineteen days before the scheduled closing; the premium can only be computed by Huntington, so the request lands on our own servicing desk. No Qualified Intermediary has been named to the bank and no exchange coordination has been requested.",
        risk_impact: "+25% Flight Probability (Early Retirement Intent)",
        verdict: "EARLY PAYOFF PRICED"
      },
      {
        category: "Valuation & Liquidity Delta",
        signal_name: "Unencumbered Net Equity Proceeds",
        source: "Internal Liquidity Triage (NOI $637.5k @ 7.50% Cap Rate vs $5.18M UPB)",
        observation: "Triangulated property valuation of $8,500,000 leaves $2,902,700.00 in net liquid equity after the title payoff quote ($5,214,800.00 = $5,180,000.00 unpaid principal + $34,800.00 accrued interest and exit fees) and estimated closing costs ($382,500.00 at 4.5%).",
        risk_impact: "+14% Flight Urgency (High Liquidity Prize)",
        verdict: "$2.90M AT-RISK CAPITAL"
      }
    ],
    hypotheses: [
      {
        hypothesis: "Hypothesis A: Internal Debt Refinance or Extension",
        confidence_pct: 4,
        status: "REJECTED",
        rationale: "No replacement loan records in the LOS across Huntington's 21-state footprint. Demand originated by third-party title insurer representing external buyer."
      },
      {
        hypothesis: "Hypothesis B: IRC §1031 Tax-Deferred Exchange",
        confidence_pct: 12,
        status: "UNCONFIRMED",
        rationale: "No exchange coordination has been requested and no Qualified Intermediary has been named to the bank. Huntington is not a party to an exchange agreement and would not receive one, so this cannot be ruled out from bank-held data; the borrower also remains eligible to elect a 1031 prior to closing."
      },
      {
        hypothesis: "Hypothesis C: Third-Party Asset Sale with Liquid Cash-Out",
        confidence_pct: 94,
        status: "ACCEPTED",
        rationale: "Asset disposition confirmed by the inbound title closing demand, no replacement debt at Huntington, and a borrower-requested prepayment premium quote. Industry deposit-flight benchmark: 78% within 48-72 hours."
      }
    ],
    trace_steps: [
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
    payoff_id: "PO-2026-7492",
    confidence_score: 88,
    urgency_tier: "Qualified Escrow Flight (T-24 Days)",
    classification: "IRC §1031 Like-Kind Exchange (Identified QI Intermediary)",
    summary_verdict: "Detection agent identified active IRC §1031 exchange assignment naming Chicago Title Land Trust / IPX1031 as Qualified Intermediary. Because QI is assigned, net proceeds ($1,588,250.00) cannot touch borrower operating accounts; proceeds will wire to QI's custodial depository unless Huntington 1031 Qualified Escrow Depository is pre-staged.",
    model_agent: "gemini-3.7-flash (Multimodal Signal Fusion)",
    evaluation_timestamp: "2026-08-20T14:32:10Z",
    fused_signals: [
      {
        category: "Intake Topology & Channel",
        signal_name: "T-120 Surveillance & Title Demand Intake",
        source: "Chicago Title Insurance Co. (Escrow #CT-2026-4401-OH)",
        observation: "Payoff demand received at T-24 days for scheduled asset disposition closing on September 28, 2026.",
        risk_impact: "+20% Baseline Disposition Probability",
        verdict: "THIRD-PARTY ESCROW OPENED"
      },
      {
        category: "Credit Core & Pipeline Recon",
        signal_name: "Replacement Facility Inquiry",
        source: "Commercial LOS / SBA 7(a) Portfolio Queue",
        observation: "Existing SBA 7(a) commercial facility #SBA-7492. External buyer ('Midwest Precision Holdings LLC') securing debt with third-party institutional lender; no replacement loan with Huntington.",
        risk_impact: "+30% Flight Probability (External Financing)",
        verdict: "NO REPLACEMENT FINANCING"
      },
      {
        category: "Intermediary & Tax Identification",
        signal_name: "Identifiable Qualified Intermediary (QI)",
        source: "Multimodal Contract Exhibit C (Exchange Agreement)",
        observation: "Formal IRC §1031 Exchange Assignment naming Chicago Title Land Trust / IPX1031 as Qualified Intermediary. Proceeds are legally prohibited from touching borrower accounts directly.",
        risk_impact: "+28% Intermediary Flight Risk (Outside Escrow)",
        verdict: "QI INTERMEDIARY CONFIRMED"
      },
      {
        category: "Valuation & Liquidity Delta",
        signal_name: "Exchange Equity Volume",
        source: "Cap-Rate Triage Valuation ($3.15M est.) vs SBA Payoff ($1.42M)",
        observation: "Estimated exchange proceeds of $1,588,250.00 held under exchange safe harbor.",
        risk_impact: "+10% Institutional Depository Target",
        verdict: "$1.59M QI ESCROW TARGET"
      }
    ],
    hypotheses: [
      {
        hypothesis: "Hypothesis A: Internal SBA Refinance",
        confidence_pct: 3,
        status: "REJECTED",
        rationale: "Buyer is an outside acquirer using non-Huntington debt; SBA 7(a) payoff is final."
      },
      {
        hypothesis: "Hypothesis B: Taxable Cash-Out to Operating Account",
        confidence_pct: 9,
        status: "REJECTED",
        rationale: "Identified QI assignment legally prevents borrower constructive receipt."
      },
      {
        hypothesis: "Hypothesis C: 1031 Exchange Wire to Outside Intermediary Bank",
        confidence_pct: 88,
        status: "ACCEPTED",
        rationale: "Exchange documents identify QI. Without Huntington Qualified Escrow Depository, title wires funds to external QI depository bank."
      }
    ],
    trace_steps: [
      "[00:00.010] Ingested Chicago Title payoff notice (#CT-2026-4401-OH) during scheduled T-120 surveillance sweep.",
      "[00:00.038] Parsed exhibits: Identified buyer entity 'Midwest Precision Holdings LLC' and independent lender.",
      "[00:00.071] Detected IRC §1031 Exchange exhibit: 'Notice of Assignment to Qualified Intermediary' naming Chicago Title Land Trust / IPX1031.",
      "[00:00.104] Queried the LOS replacement pipeline: 0 applications for Buckeye Precision Tooling or Arthur Pendelton.",
      "[00:00.142] Evaluated intermediary classification: Identifiable intermediary present. Proceeds are 100% tax-deferred exchange equity ($1.59M).",
      "[00:00.180] Output composite confidence score: 88% (Intermediary Flight Risk). Pre-staged Huntington 1031 Qualified Escrow Depository."
    ]
  },
  "PO-2026-6104": {
    payoff_id: "PO-2026-6104",
    confidence_score: 58,
    urgency_tier: "Refinance Watchlist (T-45 Days)",
    classification: "Competitive Refinance Inquiry / Equity Restructuring",
    summary_verdict: "Detection agent flagged preliminary payoff inquiry from Commonwealth Land Title. The LOS indicates an active loan renewal discussion by Amanda Cross, but borrower is shopping competitive takeout terms with Fifth Third Bank. Moderate flight risk requires banker intervention to lock facility.",
    model_agent: "gemini-3.7-flash (Multimodal Signal Fusion)",
    evaluation_timestamp: "2026-08-05T11:20:00Z",
    fused_signals: [
      {
        category: "Intake Topology & Channel",
        signal_name: "Preliminary Payoff Demand Inquiry",
        source: "Commonwealth Land Title (Escrow #CLT-2026-9031-OH)",
        observation: "Preliminary request for payoff figures at T-45 days. Closing tentative for October 19, 2026.",
        risk_impact: "+15% Inquiry Signal",
        verdict: "PRELIMINARY INQUIRY"
      },
      {
        category: "Credit Core & Pipeline Recon",
        signal_name: "Active Pipeline & Term Sheet Comparison",
        source: "Commercial LOS / RM Amanda Cross",
        observation: "Active renewal application in the LOS under review; borrower noted receiving competitive loan package from Fifth Third Bank.",
        risk_impact: "+25% Competitive Takeout Risk",
        verdict: "PENDING INTERNAL REFI"
      },
      {
        category: "Intermediary & Tax Identification",
        signal_name: "Tax Strategy Audit",
        source: "Loan Purpose Documentation",
        observation: "Zero QI intermediary detected. Medical partner buyout restructure.",
        risk_impact: "+8% Unsettled Equity",
        verdict: "NO QI INTERMEDIARY"
      },
      {
        category: "Valuation & Liquidity Delta",
        signal_name: "Equity Restructure Position",
        source: "Triage NOI Valuation ($5.72M) vs UPB ($3.21M)",
        observation: "Estimated equity delta of $2,222,600.00.",
        risk_impact: "+10% Refinance Exposure",
        verdict: "$2.22M EQUITY RESTRUCTURE"
      }
    ],
    hypotheses: [
      {
        hypothesis: "Hypothesis A: Competitive Refinance Takeout",
        confidence_pct: 58,
        status: "ACCEPTED",
        rationale: "Borrower is comparing terms; title payoff inquiry indicates competitive lender may be preparing closing package."
      },
      {
        hypothesis: "Hypothesis B: Third-Party Sale",
        confidence_pct: 22,
        status: "UNCONFIRMED",
        rationale: "Preliminary title inquiry does not show a fully executed Purchase & Sale Agreement."
      },
      {
        hypothesis: "Hypothesis C: 1031 Exchange",
        confidence_pct: 5,
        status: "REJECTED",
        rationale: "Zero QI documents or exchange intention indicated."
      }
    ],
    trace_steps: [
      "[00:00.012] Ingested preliminary payoff inquiry from Commonwealth Land Title (#CLT-2026-9031-OH).",
      "[00:00.045] LOS cross-check: Found in-progress renewal file #REN-6104 assigned to Amanda Cross.",
      "[00:00.089] CRM activity note: Client requested payoff quote to evaluate competing refinance quote from Fifth Third.",
      "[00:00.120] Intermediary check: No Qualified Intermediary exhibits present.",
      "[00:00.155] Synthesized classification: Competitive Refinance Takeout Risk (58% confidence). Staged for RM defensive rate-lock outreach."
    ]
  }
};

export const initialCapacityMeter: CapacityMeter = {
  // Derived: $33.298B target CRE book / $3.0M average commercial loan size.
  screened_events_book: 11099,
  // Matches the three deals actually present in the payoff queue below.
  qualified_and_staged: 3,
  // 3 events x the 5 hr midpoint of the verified 4-6 hr manual band.
  manual_discovery_absorbed_hrs: 15.0,
  wealth_admin_absorbed_hrs: 18.5,
  active_machine_inferences: 3,
  // Verified: 10-Q Table 8 CRE less the Call Report small-business tranche, plus
  // owner-occupied CRE. Must stay in sync with main.py.
  book_scale_volume: "$33.30 Billion",
  historical_flight_risk_rate: "78%",
  branch_network_count: "1,400 Branches (21 States)",
  sba_ranking: "Top-2 National SBA 7(a) Lender",
  csa_leverage_ratio: "2x CSA Leverage (1 CSA : 4 PWAs)"
};

export const initialPayoffQueue: PayoffItem[] = [
  {
    id: "PO-2026-8821",
    borrower_entity: "Vance Riverfront Properties IV, LLC",
    property_name: "Riverfront Commercial Commons",
    property_address: "410 S. High Street, Columbus, OH 43215",
    property_type: "Class A Multi-Tenant Office / Mixed Commercial",
    title_company: "First American Title Insurance Co.",
    settlement_officer: "Karen Lindqvist",
    escrow_file_number: "FA-2026-8819-COL",
    payoff_statement_date: "2026-08-28",
    scheduled_closing_date: "2026-09-16",
    days_to_close: 12,
    priority_tier: "Critical (T-12)",
    existing_debt_upb: 5180000.00,
    per_diem_interest: 692.50,
    payoff_quote_amount: 5214800.00,
    credit_risk_rating: "Pass (Tier 2)",
    commercial_rm: "Greg Miller",
    assigned_pwa: "Sarah Jenkins",
    unstated_sale_price: true,
    noi_trailing_q1: 637500.00,
    submarket_cap_rate: 0.075,
    indicative_valuation: 8500000.00,
    estimated_net_equity: 2902700.00,
    known_hban_balances: 2100000.00,
    total_hban_position: 5002700.00,
    tax_strategy_detected: "Taxable Cash-Out (1031 Eligible)",
    loan_type: "Commercial Real Estate Loan / T-14 Payoff Demand",
    status: "Staged for Call",
    managing_member: "Marcus Vance",
    primary_guarantor: "Marcus Vance",
    flight_confidence_score: 94,
    flight_risk_classification: "Commercial Asset Sale / Taxable Cash-Out (High Flight Risk)",
    flight_risk_trace: detectionReasoningTraces["PO-2026-8821"]
  },
  {
    id: "PO-2026-7492",
    borrower_entity: "Buckeye Precision Tooling Corp.",
    property_name: "Buckeye Industrial Campus B",
    property_address: "1280 Dublin Road, Columbus, OH 43215",
    property_type: "Light Industrial / Advanced Manufacturing",
    title_company: "Chicago Title Insurance Co.",
    settlement_officer: "Mark Henderson",
    escrow_file_number: "CT-2026-4401-OH",
    payoff_statement_date: "2026-08-15",
    scheduled_closing_date: "2026-09-28",
    days_to_close: 24,
    priority_tier: "Upcoming (T-24)",
    existing_debt_upb: 1405000.00,
    per_diem_interest: 185.00,
    payoff_quote_amount: 1420000.00,
    credit_risk_rating: "Pass (Tier 1)",
    commercial_rm: "Greg Miller",
    assigned_pwa: "Sarah Jenkins",
    unstated_sale_price: false,
    noi_trailing_q1: 245700.00,
    submarket_cap_rate: 0.078,
    indicative_valuation: 3150000.00,
    estimated_net_equity: 1588250.00,
    known_hban_balances: 890000.00,
    total_hban_position: 2478250.00,
    tax_strategy_detected: "IRC Sec. 1031 Exchange (QI Routed)",
    loan_type: "SBA 7(a) Commercial Loan / T-120 Surveillance",
    status: "Document Parsing Complete",
    managing_member: "Arthur Pendelton",
    primary_guarantor: "Arthur Pendelton",
    flight_confidence_score: 88,
    flight_risk_classification: "IRC §1031 Like-Kind Exchange (Identified QI Intermediary)",
    flight_risk_trace: detectionReasoningTraces["PO-2026-7492"]
  },
  {
    id: "PO-2026-6104",
    borrower_entity: "Columbus Medical Arts Center LLC",
    property_name: "Scioto Medical Pavilion",
    property_address: "850 Bethel Road, Columbus, OH 43214",
    property_type: "Medical Office / Outpatient Surgical",
    title_company: "Commonwealth Land Title",
    settlement_officer: "David S. Vance",
    escrow_file_number: "CLT-2026-9031-OH",
    payoff_statement_date: "2026-08-01",
    scheduled_closing_date: "2026-10-19",
    days_to_close: 45,
    priority_tier: "Watchlist (T-45)",
    existing_debt_upb: 3210000.00,
    per_diem_interest: 420.00,
    payoff_quote_amount: 3240000.00,
    credit_risk_rating: "Pass (Tier 2)",
    commercial_rm: "Amanda Cross",
    assigned_pwa: "Brian Gallagher",
    unstated_sale_price: true,
    noi_trailing_q1: 411840.00,
    submarket_cap_rate: 0.072,
    indicative_valuation: 5720000.00,
    estimated_net_equity: 2222600.00,
    known_hban_balances: 1450000.00,
    total_hban_position: 3672600.00,
    tax_strategy_detected: "Taxable Cash-Out",
    loan_type: "Healthcare Practice Facility Loan / T-45 Watchlist",
    status: "Monitoring Queue",
    managing_member: "Dr. Robert Miller",
    primary_guarantor: "Dr. Robert Miller",
    flight_confidence_score: 58,
    flight_risk_classification: "Competitive Refinance Inquiry / Equity Restructuring",
    flight_risk_trace: detectionReasoningTraces["PO-2026-6104"]
  }
];

export const initialEntityResolution: EntityResolutionData = {
  payoff_id: "PO-2026-8821",
  document_name: "Credit Agreement & Incumbency Certificate #CC-8821.pdf",
  document_vault_id: "HBAN-CRE-VAULT-8821",
  total_pages: 14,
  inspected_page: 11,
  resolution_timestamp: "2026-09-04T14:15:00Z",
  dlp_status: "PASSED: Consumer credit bureaus, personal 1040s, and FinCEN CDD records purged pre-ingestion under GLBA Reg P & FCRA § 604.",
  borrower_entity: {
    name: "Vance Riverfront Properties IV, LLC",
    jurisdiction: "Ohio Limited Liability Company",
    filing_date: "2018-04-12",
    tax_classification: "Partnership / Pass-Through"
  },
  grounded_members: [
    {
      name: "Marcus Vance",
      role: "Managing Member / Majority Owner",
      ownership_pct: 85.0,
      is_guarantor: true,
      is_signatory: true,
      exclusion_status: "Included / Full Commercial Profiling",
      known_hban_accounts: ["Commercial DDA #..4401", "Operating Reserve #..9182"],
      known_hban_balance: 2100000.00,
      bounding_box: {
        ymin: 248,
        xmin: 120,
        ymax: 310,
        xmax: 680,
        text_snippet: "Marcus Vance, holding an undivided 85% Managing Membership Interest and sole operating signatory authority..."
      }
    },
    {
      name: "Elena Vance",
      role: "Member / 15% Equity Owner (Non-Guarantor)",
      ownership_pct: 15.0,
      is_guarantor: false,
      is_signatory: false,
      exclusion_status: "Excluded from Wealth Profiling (Non-Guarantor / GLBA Reg P & FCRA § 604)",
      known_hban_accounts: ["Joint Relationship Profile #JH-7712 (Quarantined)"],
      known_hban_balance: 0.00,
      bounding_box: {
        ymin: 330,
        xmin: 120,
        ymax: 390,
        xmax: 680,
        text_snippet: "Elena Vance, holding a 15% non-managing equity interest. Non-guarantor; programmatically excluded from profiling under GLBA Reg P and FCRA § 604."
      }
    },
    {
      name: "The Vance 2018 Family Trust",
      role: "Beneficial Estate Holding & Fiduciary Vehicle",
      ownership_pct: 0.0,
      is_guarantor: false,
      is_signatory: false,
      exclusion_status: "Fiduciary Entity / Staged for Estate Review",
      known_hban_accounts: [],
      known_hban_balance: 0.00,
      bounding_box: {
        ymin: 415,
        xmin: 120,
        ymax: 475,
        xmax: 680,
        text_snippet: "Underlying beneficial succession assigned to The Vance 2018 Family Trust, Marcus & Elena Vance Trustees..."
      }
    }
  ],
  unstated_sale_price_reasoning: {
    flag: true,
    agentic_finding: "Title payoff request omits purchase contract purchase price.",
    grounding_source: "Credit Vault Doc #CC-8821 trailing Q1 in-place NOI: $637,500.00",
    submarket_grounding: "Franklin County Q1 2026 Appraisal Benchmark cap rate: 7.50% (grounded dynamically via Vertex AI Search against internal commercial appraisal benchmarks).",
    capitalization_formula: "NOI / Cap Rate = $637,500 / 0.075 = $8,500,000.00 Indicative Triage Valuation.",
    occ_sr11_7_notice: "Designated strictly as 'Internal Liquidity Triage Heuristic for Relationship Prioritization' (OCC Bulletin 2011-12 / SR 11-7 Tier 3). Client-facing property valuation muzzled."
  }
};

export const initialValuation: ValuationData = {
  sale_price: 8500000.00,
  grounded_noi: 637500.00,
  grounded_cap_rate: 0.075,
  debt_payoff: 5214800.00,
  estimated_closing_costs: 382500.00,
  net_equity_proceeds: 2902700.00,
  known_hban_balances: 2100000.00,
  total_resolvable_position: 5002700.00,
  strategy_type: "Taxable Liquidity Event (Cash-Out)",
  strategy_product: "Huntington Business Premier Insured Cash Sweep (ICS)",
  yield_apy: 4.85,
  statutory_basis: "12 U.S.C. Sec. 1831f (EGRRCPA Sec. 202 Reciprocal Deposits); Multi-Million FDIC Insurance via IntraFi Network; Commercial RM Deposit FTP Credit.",
  routing_destination: "Huntington Business Premier Commercial ICS (Acct: HBAN-ICS-4401)",
  deposit_credit_pct: 100.0,
  finra_rule_2040_compliant: true,
  occ_sr11_7_designation: "Relationship Prioritization Triage Estimate"
};

export const initialQuarantineState: QuarantineState = {
  quarantined: true,
  verbal_consent_recorded: false,
  recorded_by: null,
  consent_timestamp: null,
  audit_hash: "SHA256-GLBA-HBAN-99418-PENDING",
  compliance_notes: "Awaiting Commercial RM verbal opt-in during T-12 client touchpoint. Advisor handoff is intra-institutional (Huntington-employed advisor, Huntington client); consent is captured as cross-line-of-business marketing consent and the SEC Regulation R referral record. Ameriprise platform NPI access governed as a service provider under 12 C.F.R. Sec. 1016.13; GLBA safeguards per 15 U.S.C. Sec. 6801."
};

export const initialWireInstructions: WireInstructionData = {
  letter_id: "HBAN-WIRE-20260904-8819",
  date: "September 4, 2026",
  title_company: "First American Title Insurance Company",
  title_address: "175 S. 3rd St., Suite 500, Columbus, OH 43215",
  attention: "Karen Lindqvist, Commercial Escrow Officer",
  escrow_file: "FA-2026-8819-COL",
  property: "Riverfront Commercial Commons, 410 S. High St., Columbus, OH 43215",
  seller_entity: "Vance Riverfront Properties IV, LLC",
  managing_member: "Marcus Vance",
  bank_name: "The Huntington National Bank",
  aba_routing: "044000024",
  account_title: "Vance Riverfront Properties IV LLC / Business Premier ICS Sweep",
  account_number: "HBAN-4401-9921-00",
  special_instructions: "Disburse net seller equity directly into Huntington Business Premier ICS Sweep for FDIC passthrough protection. Pre-filled Seller Closing Authorization delivered via DocuSign to borrower with Bank Verification Letter.",
  indicative_net_disbursement: 2902700.00,
  officer_signature: "Greg Miller, Vice President, Commercial Real Estate",
  officer_contact: "greg.miller@huntington.com | (614) 480-4401",
  packet_type: "Borrower Settlement Routing Packet & Official Bank Verification Letter",
  docusign_envelope_id: "ENV-HBAN-20260904-8821",
  delivery_channel: "Borrower Direct Execution (DocuSign Envelope) -> Seller Authorization to Title",
  alta_pillar_2_compliant: true,
  callback_verification_line: "(614) 480-4401 (Direct Banker Authentication Line)",
  independent_qi_partner: null
};

export const initialWealthOnboarding: WealthOnboardingData = {
  status: "Quarantined",
  quarantined: true,
  assigned_pwa: "Sarah Jenkins, CFP, Senior Private Wealth Advisor",
  target_client: "[QUARANTINED] Commercial Guarantor Profile (Affirmative Opt-In Required Under GLBA Reg P & FCRA § 604)",
  household_id: "HH-QUARANTINED-PENDING-CONSENT",
  staged_kyc_cip: {
    completion_percentage: 0,
    verified_fields: [
      { field: "Client Nonpublic Personal Information (NPI)", value: "[QUARANTINED - Firewalled at Commercial Bank Perimeter Pending Client Opt-In]", status: "Quarantined" },
      { field: "Taxpayer Identification & CDD", value: "[QUARANTINED UNDER GLBA REG P & FCRA § 604]", status: "Quarantined" },
      { field: "Residential & Banking Coordinates", value: "[QUARANTINED - Commercial Credit Vault Firewalled]", status: "Quarantined" }
    ],
    pending_advisor_actions: [
      "Commercial RM must document affirmative verbal opt-in consent from primary guarantor",
      "Execute GLBA Regulation P customer privacy disclosure",
      "Complete OCC Reg 9 fiduciary suitability review & investment objectives questionnaire (Reg BI / FINRA 2111 apply instead if routed to the HFA retail channel)"
    ]
  },
  sei_custodial_shell: {
    shell_id: "SEI-WP-HBAN-8821 (Locked)",
    account_title: "[QUARANTINED] Pending Client Opt-In Consent",
    custodian: "SEI Wealth Platform (SEI Data Cloud / Snowflake Zero-ETL) / Huntington Private Bank",
    clearing_status: "Locked Pending Consent (Snowflake Zero-ETL Data Share Quarantined)",
    cash_depository_link: "Huntington National Bank FDIC Pass-Through Sweep"
  },
  draft_ips_scaffolding: {
    mandate: "[WITHHELD PENDING ADVISOR SUITABILITY REVIEW]",
    horizon: "Unstated",
    liquidity_reserve_sleeve: "$0.00 (Locked)",
    asset_allocation_scaffold: [],
    fiduciary_disclaimer: "Scaffolding withheld. Under OCC Reg 9 fiduciary standards and GLBA, asset allocation scaffolding is unlocked only after affirmative client opt-in and licensed advisor risk discovery."
  },
  ongoing_servicing_dossier: {
    annual_reviews_automated: false,
    advisor_capacity_expansion: "80 relationships to 95-100 relationships per PWA (2x CSA operational leverage; sub-$3M routed to Centralized Wealth Hub)",
    features: [
      "Automated Quarterly Portfolio Rebalancing Dossier (Locked)",
      "Tax-Loss Harvesting Alerting Engine (Locked)",
      "Fiduciary Annual Meeting Preparation Briefing (Locked)",
      "Real-time Estate Plan & Trust Topology Sync via SEI Data Cloud (Locked)"
    ]
  }
};

export const mockSignalGraphs: Record<string, SpannerGraphData> = {
  "PO-2026-8821": {
    payoff_id: "PO-2026-8821",
    deal_name: "Marcus Vance / Vance Riverfront Properties IV, LLC",
    borrower_entity: "Vance Riverfront Properties IV, LLC",
    classification: "Commercial Asset Sale / Taxable Cash-Out (High Flight Risk)",
    confidence_score: 94,
    spanner_stats: {
      database: "huntington-commercial-graph",
      engine: "Google Cloud Spanner Graph (ISO GQL Engine)",
      instance: "spanner-us-east4-prod-a",
      query_latency_ms: 18.4,
      nodes_matched: 13,
      edges_traversed: 14,
      gql_query: `GRAPH HuntingtonCommercialGraph
MATCH (b:BorrowerEntity {id: 'VANCE-IV-LLC'})-[:HAS_BENEFICIAL_OWNER]->(p:Principal)
OPTIONAL MATCH (p)-[:GUARANTOR_OF]->(f:CreditFacility {id: 'FAC-8821'})
MATCH (f)<-[:PAYOFF_TARGET]-(d:TitleDemand {escrow_id: 'FA-2026-8819-COL'})
OPTIONAL MATCH (f)<-[:QUOTED_FOR]-(q:PrepaymentQuote)
OPTIONAL MATCH (b)-[:ASSIGNED_QI]->(qi:Intermediary)
RETURN b.legal_name, p.name, p.guaranty_status, p.glba_quarantined,
       q.requested_at, qi.id IS NOT NULL AS has_1031_qi, f.unpaid_balance`
    },
    nodes: [
      {
        id: "src_fax",
        label: "Inbound eFax Channel",
        tier: "source",
        status: "verified",
        badge: "INBOUND EFAX",
        subtitle: "Escrow #FA-2026-8819-COL",
        properties: {
          "Channel": "Microsoft Graph API eFax Intake",
          "Originator": "First American Title Insurance Co.",
          "Escrow Officer": "Karen Lindqvist",
          "Demand Date": "2026-08-28",
          "Closing Target": "2026-09-16 (T-12 Days)"
        },
        agent_relevance: "Triggering inbound demand document setting the strict 12-day retention window.",
        x: 90,
        y: 120
      },
      {
        id: "src_ncino",
        label: "Commercial LOS",
        tier: "source",
        status: "verified",
        badge: "LOS RECON",
        subtitle: "Facility #CC-8821",
        properties: {
          "LOS System": "Commercial Loan Origination System",
          "Active Applications": "0 In-Flight Records",
          "Rate Lock Commitments": "0 Found Across 1,400 Branches",
          "Recon Result": "No Replacement Debt"
        },
        agent_relevance: "Cross-references enterprise pipeline to disprove internal refinance or term extension.",
        x: 90,
        y: 260
      },
      {
        id: "src_afs",
        label: "Core Loan Accounting",
        tier: "source",
        status: "verified",
        badge: "CORE LEDGER",
        subtitle: "UPB $5,180,000.00",
        properties: {
          "Core Ledger": "Level III Commercial Loan Core Ledger",
          "Unpaid Principal": "$5,180,000.00",
          "Calculated Payoff Quote": "$5,214,800.00",
          "Per Diem Interest": "$692.50",
          "Risk Rating": "Pass (Tier 2)"
        },
        agent_relevance: "Supplies authoritative loan balances and per diems to ground equity calculations.",
        x: 90,
        y: 400
      },
      {
        id: "note_facility",
        label: "Commercial Note & Mortgage",
        tier: "contract",
        status: "active",
        badge: "LIEN FACILITY",
        subtitle: "Collateral: 410 S. High St.",
        properties: {
          "Instrument": "First Senior Commercial Mortgage",
          "Original Facility": "$6,500,000.00",
          "Collateral": "Riverfront Commercial Commons",
          "Lien Release": "Conditioned on $5,214,800.00 Payoff"
        },
        agent_relevance: "Primary collateralized debt facility being extinguished at closing.",
        x: 280,
        y: 200
      },
      {
        id: "payoff_demand",
        label: "Inbound Payoff Demand",
        tier: "contract",
        status: "active",
        badge: "TITLE DEMAND",
        subtitle: "Good-Through: 2026-09-16",
        properties: {
          "Escrow File Cited": "FA-2026-8819-COL (the requester's file number, not ours)",
          "Signed By": "Karen Lindqvist, Commercial Escrow Officer",
          "Borrower Authorization": "Signed by Marcus Vance, Managing Member",
          "Not Received": "Settlement statement, seller disbursement instructions, purchase contract"
        },
        agent_relevance: "The one instrument the payoff desk actually receives. It fixes the closing date and the settlement agent; it does not disclose the sale price or where the seller's net proceeds go.",
        x: 280,
        y: 360
      },
      {
        id: "entity_borrower",
        label: "Vance Riverfront Properties IV, LLC",
        tier: "entity",
        status: "verified",
        badge: "BORROWER ENTITY",
        subtitle: "Ohio LLC #4192081",
        properties: {
          "Jurisdiction": "Ohio Secretary of State",
          "Tax Classification": "Pass-Through Entity (Multi-Member)",
          "Formation Date": "2018-04-12",
          "Operating DDA": "Huntington Commercial Checking (*4109)"
        },
        agent_relevance: "Borrowing entity holding title to real estate; pass-through entity to beneficial owners.",
        x: 470,
        y: 200
      },
      {
        id: "entity_title",
        label: "First American Title Insurance Co.",
        tier: "entity",
        status: "verified",
        badge: "SETTLEMENT AGENT",
        subtitle: "Columbus Branch #14",
        properties: {
          "ALTA Identifier": "ALTA-OH-7721",
          "Escrow Location": "Downtown Columbus Commercial Unit",
          "Security Mandate": "ALTA Best Practices Pillar 2 Verified Call-Back"
        },
        agent_relevance: "Settlement agent receiving the official Huntington payoff verification letter.",
        x: 470,
        y: 360
      },
      {
        id: "principal_marcus",
        label: "Marcus Vance",
        tier: "principal",
        status: "verified",
        badge: "PRIMARY GUARANTOR (85%)",
        subtitle: "Managing Member & Sponsor",
        properties: {
          "Equity Stake": "85.0% Majority Interest",
          "Guaranty Type": "Full Joint & Several Personal Guarantee",
          "Known HBAN Liquidity": "$2,100,000.00 in Commercial / Private DDA",
          "Tier A Routing Basis": "$4.57M projected personal investable = $2.10M held at Huntington + $2.47M expected proceeds (85% member interest). Clears the $3M Private Bank service tier; the entity's $2.90M is not the routing input."
        },
        agent_relevance: "Primary commercial relationship sponsor targeted for RM outreach and wealth bridge.",
        x: 660,
        y: 160
      },
      {
        id: "principal_elena",
        label: "Elena Vance",
        tier: "principal",
        status: "quarantined",
        badge: "NPI QUARANTINED (15%)",
        subtitle: "Passive Member / Non-Guarantor",
        properties: {
          "Equity Stake": "15.0% Minority Interest",
          "Guaranty Status": "Non-Guarantor (No Commercial Guarantee)",
          "Source of Record": "LLC Operating Agreement, credit file (document extraction)",
          "CDD Coverage": "Below the 25% FinCEN beneficial-owner threshold; absent from BSA certification",
          "NPI Handling Status": "Quarantined pending opt-in (GLBA Reg P / FCRA § 604 framework)",
          "Exclusion Sentry": "Firewalled from Wealth Advisory CRM Pending Opt-In"
        },
        agent_relevance: "Exclusion Sentry boundary test. She sits below the 25% CDD threshold, so she appears only in the operating agreement, invisible to every structured system, and is firewalled from retail wealth systems.",
        x: 660,
        y: 320
      },
      {
        id: "sig_no_refi",
        label: "No Replacement Facility at Huntington",
        tier: "signal",
        status: "flagged",
        badge: "BEHAVIORAL SIGNAL",
        subtitle: "+35% Flight Risk Weight",
        properties: {
          "Core Query": "Core Ledger + LOS Cross-System Footprint Scan",
          "Scope of Visibility": "Huntington systems only (~1,400 offices)",
          "Pending Pipelines": "0 Applications / 0 Term Sheets",
          "Finding": "Rules out a replacement facility at Huntington",
          "Limitation": "External lender pipelines are not observable"
        },
        agent_relevance: "Rules out an internal refinance. An external refinance cannot be excluded from bank-held data alone; that requires the inbound title demand.",
        x: 850,
        y: 120
      },
      {
        id: "sig_prepay_quote",
        label: "Prepayment Premium Quote Requested",
        tier: "signal",
        status: "flagged",
        badge: "BORROWER REQUEST",
        subtitle: "+25% Disposition Weight",
        properties: {
          "Request Channel": "Borrower call to Loan Servicing, logged 2026-08-26",
          "Quote Issued": "Yield-maintenance premium, good through 2026-09-16",
          "Why We Can See It": "The premium can only be computed by Huntington, so the borrower has to ask us for it",
          "Finding": "Borrower is pricing an early retirement of the facility, not a renewal",
          "Limitation": "Confirms early payoff; on its own it does not separate a sale from an external refinance"
        },
        agent_relevance: "The earliest disposition signal that originates inside the bank. A borrower who intends to carry the loan to maturity has no reason to price a prepayment premium.",
        x: 850,
        y: 240
      },
      {
        id: "sig_equity_delta",
        label: "Est. Net Equity Prize: $2,902,700",
        tier: "signal",
        status: "flagged",
        badge: "LIQUIDITY PRIZE",
        subtitle: "Estimated at 7.50% Cap Rate",
        properties: {
          "Indicative Valuation": "$8,500,000.00 est. ($637.5k NOI capitalized @ 7.50%)",
          "Valuation Basis": "Cap-rate estimate; sale price not observed (no settlement statement)",
          "Payoff Extinguishment": "$5,214,800.00",
          "Estimated Closing Costs": "$382,500.00 (4.5% Standard Commercial Rate)",
          "Net Liquid Proceeds": "$2,902,700.00 At-Risk Seller Equity (estimated)"
        },
        agent_relevance: "Sizes the retention opportunity to drive urgency tiering. The valuation input is an estimate, so the figure is indicative rather than settled.",
        x: 850,
        y: 360
      },
      {
        id: "verdict_node",
        label: "Commercial Disposition / Taxable Cash-Out",
        tier: "verdict",
        status: "verified",
        badge: "94% AGENT CONFIDENCE",
        subtitle: "Urgency: Critical (T-12 Days)",
        properties: {
          "Composite Confidence": "94.2% Deterministic Graph Fusion",
          "Confidence Basis": "Anchored on the inbound title payoff demand and the borrower's own prepayment-quote request (T-12); maturity screening alone does not separate a sale from a refinance",
          "Urgency Window": "Critical (12 Calendar Days to Closing)",
          "Recommended Product": "Huntington Business Premier ICS (4.85% APY)",
          "Wealth Scaffolding": "Pre-Staged Series 7/66 Intake Shell (Quarantined)",
          "Proceeds Treatment": "Taxable cash-out presumed. No exchange coordination has been requested and the bank is not a party to any §1031 agreement, so this cannot be confirmed from bank-held data. Either path is deposit flight; it selects the product."
        },
        agent_relevance: "Final verdict grounding the Commercial RM T-12 phone briefing. Classification firms up when the title demand lands; the earlier signals set the watchlist.",
        x: 850,
        y: 490
      }
    ],
    edges: [
      { id: "e1", source: "src_fax", target: "payoff_demand", label: "INBOUND_DEMAND", type: "primary" },
      { id: "e2", source: "src_ncino", target: "note_facility", label: "CORE_RECON", type: "primary" },
      { id: "e3", source: "src_afs", target: "note_facility", label: "SERVICING_DATA", type: "primary" },
      { id: "e4", source: "payoff_demand", target: "entity_title", label: "ASSIGNED_ESCROW", type: "primary" },
      { id: "e5", source: "note_facility", target: "entity_borrower", label: "BORROWER_OBLIGOR", type: "primary" },
      { id: "e6", source: "entity_borrower", target: "principal_marcus", label: "BENEFICIAL_OWNER_85PCT", type: "primary" },
      { id: "e7", source: "entity_borrower", target: "principal_elena", label: "BENEFICIAL_OWNER_15PCT", type: "quarantined" },
      { id: "e8", source: "note_facility", target: "sig_no_refi", label: "PIPELINE_CHECK", type: "signal" },
      { id: "e9", source: "payoff_demand", target: "verdict_node", label: "ANCHORS_CLASSIFICATION", type: "verdict" },
      { id: "e10", source: "note_facility", target: "sig_equity_delta", label: "VALUATION_TRIAGE", type: "signal" },
      { id: "e11", source: "sig_no_refi", target: "verdict_node", label: "CONFIRMS_DISPOSITION", type: "verdict" },
      { id: "e12", source: "sig_prepay_quote", target: "verdict_node", label: "CONFIRMS_EARLY_PAYOFF", type: "verdict" },
      { id: "e13", source: "sig_equity_delta", target: "verdict_node", label: "SCALES_PRIORITY", type: "verdict" },
      { id: "e14", source: "note_facility", target: "sig_prepay_quote", label: "SERVICING_REQUEST", type: "signal" }
    ]
  },
  "PO-2026-7492": {
    payoff_id: "PO-2026-7492",
    deal_name: "Arthur Pendelton / Buckeye Precision Tooling Corp.",
    borrower_entity: "Buckeye Precision Tooling Corp.",
    classification: "IRC §1031 Like-Kind Exchange (Identified QI Intermediary)",
    confidence_score: 88,
    spanner_stats: {
      database: "huntington-commercial-graph",
      engine: "Google Cloud Spanner Graph (ISO GQL Engine)",
      instance: "spanner-us-east4-prod-a",
      query_latency_ms: 16.2,
      nodes_matched: 10,
      edges_traversed: 11,
      gql_query: `GRAPH HuntingtonCommercialGraph
MATCH (b:BorrowerEntity {id: 'BUCKEYE-TOOL-CORP'})-[:HAS_BENEFICIAL_OWNER]->(p:Principal)
MATCH (b)-[:OBLIGOR_ON]->(f:SBAFacility {id: 'SBA-7492'})
MATCH (f)<-[:PAYOFF_TARGET]-(d:TitleDemand {escrow_id: 'CT-2026-4401-OH'})
MATCH (b)-[:SUBMITTED]->(r:ExchangeCoordinationRequest)-[:NAMES_QI]->(qi:QualifiedIntermediary)
RETURN b.legal_name, p.name, qi.entity_name, r.logged_at, f.unpaid_balance`
    },
    nodes: [
      {
        id: "src_chicago_fax",
        label: "Chicago Title Demand",
        tier: "source",
        status: "verified",
        badge: "INBOUND DEMAND",
        subtitle: "Escrow #CT-2026-4401-OH",
        properties: {
          "Channel": "Scheduled T-120 Surveillance Sweep",
          "Title Company": "Chicago Title Insurance Co.",
          "Escrow Officer": "Mark Henderson",
          "Demand Date": "2026-08-15"
        },
        agent_relevance: "Payoff intake identifying commercial industrial asset disposition.",
        x: 90,
        y: 150
      },
      {
        id: "src_sba_core",
        label: "SBA 7(a) Core Accounting",
        tier: "source",
        status: "verified",
        badge: "SBA LEDGER",
        subtitle: "UPB $1,405,000.00",
        properties: {
          "Facility Type": "SBA 7(a) Commercial Loan",
          "Unpaid Principal": "$1,405,000.00",
          "Payoff Quote": "$1,420,000.00",
          "Risk Rating": "Pass (Tier 1)"
        },
        agent_relevance: "Authoritative SBA facility ledger data.",
        x: 90,
        y: 350
      },
      {
        id: "note_sba",
        label: "SBA 7(a) Term Loan & Security",
        tier: "contract",
        status: "active",
        badge: "TERM FACILITY",
        subtitle: "Payoff: $1,420,000.00",
        properties: {
          "Original Loan": "$2,200,000.00",
          "Collateral": "Buckeye Industrial Campus B (1280 Dublin Rd)",
          "Maturity": "2029-05-15"
        },
        agent_relevance: "SBA note being repaid by outside commercial acquirer.",
        x: 280,
        y: 200
      },
      {
        id: "contract_1031",
        label: "Borrower 1031 Coordination Request",
        tier: "contract",
        status: "active",
        badge: "RM CALL NOTE",
        subtitle: "Logged 2026-08-18 by Commercial RM",
        properties: {
          "Channel": "Inbound borrower call to the Commercial RM, logged in CRM",
          "Intermediary Named by Borrower": "IPX1031",
          "Document Status": "Exchange agreement not provided; the bank is not a party to it"
        },
        agent_relevance: "The bank learns of the exchange because the borrower asks for help with it, not because it receives the exchange agreement.",
        x: 660,
        y: 400
      },
      {
        id: "entity_buckeye",
        label: "Buckeye Precision Tooling Corp.",
        tier: "entity",
        status: "verified",
        badge: "BORROWER ENTITY",
        subtitle: "Ohio C-Corporation",
        properties: {
          "Tax Entity": "Commercial C-Corporation",
          "Industry": "Advanced Manufacturing / Machine Tooling",
          "Operating DDA": "Huntington Business Commercial Checking"
        },
        agent_relevance: "Operating corporate borrower selling manufacturing facility.",
        x: 470,
        y: 200
      },
      {
        id: "entity_qi",
        label: "IPX1031 / Chicago Title Trust",
        tier: "entity",
        status: "verified",
        badge: "QUALIFIED INTERMEDIARY",
        subtitle: "Statutory Escrow Intermediary",
        properties: {
          "Corporate Name": "Investment Property Exchange Services, Inc.",
          "Fiduciary Role": "IRC §1031 Qualified Intermediary",
          "Escrow Prerequisite": "Prohibits Direct Taxpayer Constructive Receipt"
        },
        agent_relevance: "Designated intermediary requiring Huntington 1031 Qualified Escrow Depository bridge.",
        x: 470,
        y: 360
      },
      {
        id: "principal_arthur",
        label: "Arthur Pendelton",
        tier: "principal",
        status: "verified",
        badge: "100% OWNER / GUARANTOR",
        subtitle: "President & Sole Shareholder",
        properties: {
          "Ownership": "100.0% Common Stock",
          "Guaranty": "Unconditional Personal SBA Guaranty",
          "Known HBAN Balances": "$890,000.00 Operating DDA"
        },
        agent_relevance: "Sole principal executing 1031 like-kind replacement property acquisition.",
        x: 660,
        y: 220
      },
      {
        id: "sig_qi_confirmed",
        label: "QI Named by Borrower",
        tier: "signal",
        status: "flagged",
        badge: "BORROWER-STATED",
        subtitle: "Qualified Escrow Opportunity",
        properties: {
          "Safe Harbor Sought": "Treas. Reg. § 1.1031(k)-1(g)(3) qualified escrow account",
          "Intermediary Named": "IPX1031 (stated by the borrower; not independently verified)",
          "Signal Impact": "Proceeds route to a qualified escrow rather than the operating DDA; the retention play is the escrow depository, not ICS"
        },
        agent_relevance: "Directs retention strategy toward Huntington 1031 Escrow Depository.",
        x: 850,
        y: 160
      },
      {
        id: "sig_escrow_target",
        label: "Exchange Proceeds: $1,588,250",
        tier: "signal",
        status: "flagged",
        badge: "ESCROW TARGET",
        subtitle: "Huntington Qualified Escrow Depository / QI: IPX1031 (4.75%)",
        properties: {
          "Indicative Valuation": "$3,150,000.00 est. ($245.7k NOI capitalized @ 7.80%)",
          "Debt Extinguishment": "$1,420,000.00",
          "Estimated Closing Costs": "$141,750.00 (4.5% Standard Commercial Rate)",
          "Net Exchange Proceeds": "$1,588,250.00 estimated safe-harbor proceeds"
        },
        agent_relevance: "High-yield escrow depository volume available for Huntington retention.",
        x: 850,
        y: 310
      },
      {
        id: "verdict_node_1031",
        label: "IRC §1031 Tax-Deferred Exchange",
        tier: "verdict",
        status: "verified",
        badge: "88% AGENT CONFIDENCE",
        subtitle: "Urgency: High (T-24 Days)",
        properties: {
          "Composite Confidence": "88.4% Multimodal Verification",
          "Target Solution": "Huntington 1031 Qualified Escrow Depository (4.75% APY)",
          "Partner Coordination": "IPX1031 Qualified Intermediary Agreement"
        },
        agent_relevance: "Pre-stages specialized 1031 escrow sweep routing package for settlement agent.",
        x: 850,
        y: 470
      }
    ],
    edges: [
      { id: "e1_7492", source: "entity_buckeye", target: "contract_1031", label: "SUBMITTED_REQUEST", type: "primary" },
      { id: "e2_7492", source: "src_sba_core", target: "note_sba", label: "CORE_LEDGER", type: "primary" },
      { id: "e3_7492", source: "note_sba", target: "entity_buckeye", label: "BORROWER_OBLIGOR", type: "primary" },
      { id: "e4_7492", source: "contract_1031", target: "entity_qi", label: "ASSIGNS_PROCEEDS_TO", type: "primary" },
      { id: "e5_7492", source: "entity_buckeye", target: "principal_arthur", label: "SOLE_OWNER_100PCT", type: "primary" },
      { id: "e6_7492", source: "contract_1031", target: "sig_qi_confirmed", label: "NAMES_INTERMEDIARY", type: "signal" },
      { id: "e7_7492", source: "note_sba", target: "sig_escrow_target", label: "EQUITY_RECON", type: "signal" },
      { id: "e8_7492", source: "sig_qi_confirmed", target: "verdict_node_1031", label: "SELECTS_ESCROW_PRODUCT", type: "verdict" },
      { id: "e9_7492", source: "sig_escrow_target", target: "verdict_node_1031", label: "QUALIFIES_ESCROW_DEP", type: "verdict" },
      { id: "e10_7492", source: "entity_qi", target: "sig_qi_confirmed", label: "QI_DESIGNATION", type: "primary" },
      { id: "e11_7492", source: "principal_arthur", target: "sig_escrow_target", label: "BENEFICIAL_INTEREST", type: "primary" }
    ]
  },
  "PO-2026-6104": {
    payoff_id: "PO-2026-6104",
    deal_name: "Dr. Robert Miller / Columbus Medical Arts Center LLC",
    borrower_entity: "Columbus Medical Arts Center LLC",
    classification: "Competitive Refinance Inquiry / Equity Restructuring",
    confidence_score: 58,
    spanner_stats: {
      database: "huntington-commercial-graph",
      engine: "Google Cloud Spanner Graph (ISO GQL Engine)",
      instance: "spanner-us-east4-prod-a",
      query_latency_ms: 19.1,
      nodes_matched: 9,
      edges_traversed: 10,
      gql_query: `GRAPH HuntingtonCommercialGraph
MATCH (b:BorrowerEntity {id: 'COL-MED-ARTS-LLC'})-[:HAS_BENEFICIAL_OWNER]->(p:Principal)
MATCH (b)-[:OBLIGOR_ON]->(f:CommercialMortgage {id: 'FAC-6104'})
MATCH (f)<-[:INQUIRY_FROM]-(t:TitleInquiry {escrow_id: 'CLT-2026-9031-OH'})
OPTIONAL MATCH (b)-[:APPLICATION_IN_PROGRESS]->(app:LoanApplication)
RETURN b.legal_name, p.name, f.unpaid_balance, app.status, app.proposed_rate`
    },
    nodes: [
      {
        id: "src_clt_inquiry",
        label: "Commonwealth Title Inquiry",
        tier: "source",
        status: "verified",
        badge: "TITLE INQUIRY",
        subtitle: "File #CLT-2026-9031-OH",
        properties: {
          "Inquiry Type": "Preliminary Payoff Demand Quote Request",
          "Title Insurer": "Commonwealth Land Title",
          "Settlement Officer": "David S. Vance",
          "Inquiry Date": "2026-08-01"
        },
        agent_relevance: "Preliminary quote request indicating active rate-shopping or debt restructuring.",
        x: 90,
        y: 150
      },
      {
        id: "src_recon_pipeline",
        label: "Huntington Pipeline Recon",
        tier: "source",
        status: "verified",
        badge: "INTERNAL RECON",
        subtitle: "Renewal File #REN-6104",
        properties: {
          "Commercial RM": "Amanda Cross",
          "CRM Note": "Client requested payoff quote to evaluate competing refinance quote",
          "Renewal Status": "Underwriting Review Pending Defensive Rate Match"
        },
        agent_relevance: "Identifies ongoing internal commercial relationship retention dialogue.",
        x: 90,
        y: 350
      },
      {
        id: "note_med",
        label: "Healthcare Practice Mortgage",
        tier: "contract",
        status: "active",
        badge: "EXISTING MORTGAGE",
        subtitle: "Payoff: $3,240,000.00",
        properties: {
          "Facility Balance": "$3,210,000.00 UPB",
          "Payoff Quote": "$3,240,000.00",
          "Collateral": "Scioto Medical Pavilion (850 Bethel Rd)"
        },
        agent_relevance: "Mortgage subject to takeout by competing regional lender.",
        x: 280,
        y: 200
      },
      {
        id: "contract_refi",
        label: "Competing Offer (Client-Reported)",
        tier: "contract",
        status: "active",
        badge: "CLIENT-REPORTED",
        subtitle: "Relayed to RM Amanda Cross",
        properties: {
          "Proposed Financing": "Commercial term loan (~$3.24M), as described by the client",
          "Cash Extraction": "$0.00 (client states pure debt replacement)",
          "Rate Differential": "Estimated -35 bps vs Existing Note"
        },
        agent_relevance: "Competitive threat as relayed by the client; Huntington does not hold the competitor's term sheet. The risk here is loan asset runoff, not liquid deposit flight.",
        x: 280,
        y: 360
      },
      {
        id: "entity_med",
        label: "Columbus Medical Arts Center LLC",
        tier: "entity",
        status: "verified",
        badge: "BORROWER ENTITY",
        subtitle: "Healthcare Practice Facility LLC",
        properties: {
          "Specialty": "Outpatient Surgical & Specialty Practice",
          "Jurisdiction": "Ohio",
          "Commercial Relationship": "12-Year Huntington Commercial Client"
        },
        agent_relevance: "Operating borrower entity evaluating capital structure options.",
        x: 470,
        y: 200
      },
      {
        id: "principal_dr_miller",
        label: "Dr. Robert Miller, MD",
        tier: "principal",
        status: "verified",
        badge: "100% MANAGING MEMBER",
        subtitle: "Physician & Sole Guarantor",
        properties: {
          "Role": "Managing Partner & Surgical Director",
          "Guaranty": "Unconditional Commercial Guaranty",
          "Known HBAN Deposits": "$1,450,000.00 Practice & Personal Accounts"
        },
        agent_relevance: "Primary borrower contact for RM defensive loan modification counter-proposal.",
        x: 660,
        y: 220
      },
      {
        id: "sig_rate_shopping",
        label: "Active Rate-Shopping Inquiry",
        tier: "signal",
        status: "flagged",
        badge: "REFINANCE SIGNAL",
        subtitle: "Term Extension Inquiry",
        properties: {
          "RM Intelligence": "Amanda Cross recorded competitor solicitation",
          "Signal Implication": "Loan Portfolio Runoff Risk",
          "Signal Impact": "+52% Refinance Probability"
        },
        agent_relevance: "Directs agent to recommend commercial credit retention rather than wealth triage.",
        x: 850,
        y: 160
      },
      {
        id: "sig_zero_equity",
        label: "Zero Net Equity Extracted ($0)",
        tier: "signal",
        status: "flagged",
        badge: "EQUITY CONSERVATION",
        subtitle: "No Liquid Cash-Out",
        properties: {
          "Payoff Quote": "$3,240,000.00",
          "Replacement Debt": "$3,240,000.00",
          "Liquid Equity Disbursed": "$0.00 Net Cash",
          "Signal Impact": "Excludes Deposit Flight Playbook"
        },
        agent_relevance: "Confirms lack of liquid wealth proceeds; flags deal as credit counter-offer priority.",
        x: 850,
        y: 310
      },
      {
        id: "verdict_node_refi",
        label: "Competitive Refinance / Term Extension",
        tier: "verdict",
        status: "verified",
        badge: "58% AGENT CONFIDENCE",
        subtitle: "Urgency: Watchlist (T-45 Days)",
        properties: {
          "Composite Confidence": "58.0% Competitive Refinance Risk",
          "Actionable Playbook": "Huntington Commercial Retention Pricing Match (SOFR + 195 bps)",
          "Primary Owner": "Amanda Cross (Commercial RM)"
        },
        agent_relevance: "Routes deal to Commercial RM watchlist for defensive pricing adjustment.",
        x: 850,
        y: 470
      }
    ],
    edges: [
      { id: "e1_6104", source: "src_clt_inquiry", target: "note_med", label: "PRELIMINARY_QUOTE", type: "primary" },
      { id: "e2_6104", source: "src_recon_pipeline", target: "contract_refi", label: "COMPETITIVE_INTEL", type: "primary" },
      { id: "e3_6104", source: "note_med", target: "entity_med", label: "BORROWER_OBLIGOR", type: "primary" },
      { id: "e4_6104", source: "entity_med", target: "principal_dr_miller", label: "SOLE_MEMBER_100PCT", type: "primary" },
      { id: "e5_6104", source: "contract_refi", target: "sig_rate_shopping", label: "RATE_SHOPPING_EVIDENCE", type: "signal" },
      { id: "e6_6104", source: "contract_refi", target: "sig_zero_equity", label: "BALANCE_MATCH", type: "signal" },
      { id: "e7_6104", source: "sig_rate_shopping", target: "verdict_node_refi", label: "CONFIRMS_REFINANCE", type: "verdict" },
      { id: "e8_6104", source: "sig_zero_equity", target: "verdict_node_refi", label: "REJECTS_DEPOSIT_FLIGHT", type: "verdict" },
      { id: "e9_6104", source: "principal_dr_miller", target: "sig_rate_shopping", label: "EVALUATING_OFFERS", type: "primary" },
      { id: "e10_6104", source: "note_med", target: "contract_refi", label: "TAKEOUT_TARGET", type: "primary" }
    ]
  }
};

