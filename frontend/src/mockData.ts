import { CapacityMeter, PayoffItem, EntityResolutionData, ValuationData, QuarantineState, WireInstructionData, WealthOnboardingData } from './types';

export const initialCapacityMeter: CapacityMeter = {
  screened_events_book: 2140,
  qualified_and_staged: 6,
  manual_discovery_absorbed_hrs: 46.2,
  wealth_admin_absorbed_hrs: 18.5,
  active_machine_inferences: 3,
  book_scale_volume: "$4.50 Billion",
  historical_flight_risk_rate: "78%"
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
    status: "Staged for Call"
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
    status: "Document Parsing Complete"
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
    status: "Monitoring Queue"
  }
];

export const initialEntityResolution: EntityResolutionData = {
  payoff_id: "PO-2026-8821",
  document_name: "Credit Agreement & Incumbency Certificate #CC-8821.pdf",
  document_vault_id: "HBAN-CRE-VAULT-8821",
  total_pages: 14,
  inspected_page: 11,
  resolution_timestamp: "2026-09-04T14:15:00Z",
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
      role: "Member / Spouse (Joint Household)",
      ownership_pct: 15.0,
      is_guarantor: true,
      is_signatory: false,
      known_hban_accounts: ["Joint Relationship Profile #JH-7712"],
      known_hban_balance: 0.00,
      bounding_box: {
        ymin: 330,
        xmin: 120,
        ymax: 390,
        xmax: 680,
        text_snippet: "Elena Vance, holding a 15% non-managing Membership Interest, consenting spouse and joint guarantor..."
      }
    },
    {
      name: "The Vance 2018 Family Trust",
      role: "Beneficial Estate Holding & Fiduciary Vehicle",
      ownership_pct: 0.0,
      is_guarantor: false,
      is_signatory: false,
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
    occ_sr11_7_notice: "Designated strictly as 'Indicative Triage Estimate for Relationship Prioritization' per OCC Bulletin 2011-12 / Fed SR 11-7."
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
  strategy_product: "Huntington Commercial Max$aver Insured Cash Sweep (ICS)",
  yield_apy: 4.85,
  statutory_basis: "12 U.S.C. Sec. 1831f (EGRRCPA Sec. 202 Reciprocal Deposits); Multi-Million FDIC Insurance via IntraFi Network.",
  routing_destination: "Huntington Max$aver Commercial ICS (Acct: HBAN-ICS-4401)",
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
  compliance_notes: "Awaiting Commercial RM verbal opt-in during T-12 client touchpoint per 15 U.S.C. Sec. 6801 (GLBA) and 12 C.F.R. Sec. 1016.11."
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
  account_title: "Vance Riverfront Properties IV LLC / Max$aver ICS Sweep",
  account_number: "HBAN-4401-9921-00",
  special_instructions: "Disburse net seller equity directly into Huntington Max$aver ICS Sweep for FDIC passthrough protection.",
  indicative_net_disbursement: 2902700.00,
  officer_signature: "Greg Miller, Vice President, Commercial Real Estate",
  officer_contact: "greg.miller@huntington.com | (614) 480-4401"
};

export const initialWealthOnboarding: WealthOnboardingData = {
  status: "Quarantined",
  quarantined: true,
  assigned_pwa: "Sarah Jenkins, CFP, Senior Private Wealth Advisor",
  target_client: "Marcus Vance (85%) & Elena Vance (15%)",
  household_id: "HH-VANCE-4401",
  staged_kyc_cip: {
    completion_percentage: 82,
    verified_fields: [
      { field: "Full Legal Names", value: "Marcus Vance & Elena Vance", status: "Verified (Commercial Credit File)" },
      { field: "Entity Structure", value: "Ohio Single-Asset LLC / Vance 2018 Family Trust", status: "Verified (Articles of Org)" },
      { field: "Taxpayer Identification", value: "EIN on file (Credit Vault #CC-8821)", status: "Verified" },
      { field: "Residential Address", value: "2410 Bexley Park Rd, Columbus, OH 43209", status: "Verified" },
      { field: "Primary Banking Source", value: "Huntington Commercial DDA #..4401", status: "Verified" },
      { field: "Source of Wealth", value: "Commercial Real Estate Disposition (Riverfront Commons)", status: "Pending Closing Settlement" }
    ],
    pending_advisor_actions: [
      "Reg BI Suitability Evaluation",
      "FINRA Rule 2111 Risk Profile Questionnaire",
      "Final Wet/Digital Client Signature on Custodial Disclosures"
    ]
  },
  sei_custodial_shell: {
    shell_id: "SEI-WP-HBAN-99418",
    account_title: "Marcus Vance & Elena Vance Joint Tenancy with Rights of Survivorship (JTWROS)",
    custodian: "SEI Private Trust Company / Huntington Wealth Services",
    clearing_status: "Staged Pending Consent",
    cash_depository_link: "Huntington National Bank FDIC Pass-Through Sweep"
  },
  draft_ips_scaffolding: {
    mandate: "Conservative Capital Preservation & Liquidity Bridge",
    horizon: "Medium-to-Long Term (Post-Disposition)",
    liquidity_reserve_sleeve: "$500,000 in Ultra-Short Treasury / Huntington ICS",
    asset_allocation_scaffold: [
      { asset_class: "Short-Duration Fixed Income & Treasuries", target_pct: 50, rationale: "Capital preservation against reinvestment timeline" },
      { asset_class: "Dividend Growth & Core Equities", target_pct: 35, rationale: "Inflation hedge & tax-efficient cash flow" },
      { asset_class: "Sec. 1031 DST Replacement Real Estate", target_pct: 15, rationale: "Tax deferral preservation if Path B chosen" }
    ],
    fiduciary_disclaimer: "Draft administrative scaffolding only. Must be authored, reviewed, and finalized by Series 7/66/CFP licensed advisor under Reg BI."
  },
  ongoing_servicing_dossier: {
    annual_reviews_automated: true,
    advisor_capacity_expansion: "80 relationships -> 150 relationships per PWA",
    features: [
      "Automated Quarterly Portfolio Rebalancing Dossier",
      "Tax-Loss Harvesting Alerting Engine",
      "Fiduciary Annual Meeting Preparation Briefing",
      "Real-time Estate Plan & Trust Topology Sync"
    ]
  }
};
