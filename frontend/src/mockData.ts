import { CapacityMeter, PayoffItem, EntityResolutionData, ValuationData, QuarantineState, WireInstructionData, WealthOnboardingData } from './types';

export const initialCapacityMeter: CapacityMeter = {
  screened_events_book: 2140,
  qualified_and_staged: 6,
  manual_discovery_absorbed_hrs: 46.2,
  wealth_admin_absorbed_hrs: 18.5,
  active_machine_inferences: 3,
  book_scale_volume: "$4.50 Billion",
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
    primary_guarantor: "Marcus Vance"
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
    noi_trailing_q1: 245000.00,
    submarket_cap_rate: 0.078,
    indicative_valuation: 3150000.00,
    estimated_net_equity: 1588250.00,
    known_hban_balances: 890000.00,
    total_hban_position: 2478250.00,
    tax_strategy_detected: "IRC Sec. 1031 Exchange (QI Routed)",
    loan_type: "SBA 7(a) Commercial Loan / T-120 Surveillance",
    status: "Document Parsing Complete",
    managing_member: "Arthur Pendelton",
    primary_guarantor: "Arthur Pendelton"
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
    noi_trailing_q1: 412000.00,
    submarket_cap_rate: 0.072,
    indicative_valuation: 5720000.00,
    estimated_net_equity: 2222600.00,
    known_hban_balances: 1450000.00,
    total_hban_position: 3672600.00,
    tax_strategy_detected: "Taxable Cash-Out",
    loan_type: "Healthcare Practice Facility Loan / T-45 Watchlist",
    status: "Monitoring Queue",
    managing_member: "Dr. Robert Vance, MD",
    primary_guarantor: "Dr. Robert Vance, MD"
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
  compliance_notes: "Awaiting Commercial RM verbal opt-in during T-12 client touchpoint per 15 U.S.C. Sec. 6801 (GLBA), 12 C.F.R. Sec. 1016.11, and SEC Regulation R Networking Arrangement (Ameriprise platform)."
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
      "Complete Reg BI Suitability Evaluation & FINRA Rule 2111 Risk Profile Questionnaire"
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
    fiduciary_disclaimer: "Scaffolding withheld. Under SEC Reg BI and GLBA, asset allocation scaffolding is unlocked only after affirmative client opt-in and licensed advisor risk discovery."
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
