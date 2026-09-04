export type PersonaType = 'commercial_rm' | 'wealth_advisor';

export interface CapacityMeter {
  screened_events_book: number;
  qualified_and_staged: number;
  manual_discovery_absorbed_hrs: number;
  wealth_admin_absorbed_hrs: number;
  active_machine_inferences: number;
  book_scale_volume: string;
  historical_flight_risk_rate: string;
}

export interface PayoffItem {
  id: string;
  borrower_entity: string;
  property_name: string;
  property_address: string;
  property_type: string;
  title_company: string;
  settlement_officer: string;
  escrow_file_number: string;
  payoff_statement_date: string;
  scheduled_closing_date: string;
  days_to_close: number;
  priority_tier: string;
  existing_debt_upb: number;
  per_diem_interest: number;
  payoff_quote_amount: number;
  credit_risk_rating: string;
  commercial_rm: string;
  assigned_pwa: string;
  unstated_sale_price: boolean;
  noi_trailing_q1: number;
  submarket_cap_rate: number;
  indicative_valuation: number;
  estimated_net_equity: number;
  known_hban_balances: number;
  total_hban_position: number;
  tax_strategy_detected: string;
  status: string;
  managing_member?: string;
  primary_guarantor?: string;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  text_snippet: string;
}

export interface GroundedMember {
  name: string;
  role: string;
  ownership_pct: number;
  is_guarantor: boolean;
  is_signatory: boolean;
  known_hban_accounts: string[];
  known_hban_balance: number;
  bounding_box: BoundingBox;
}

export interface EntityResolutionData {
  payoff_id: string;
  document_name: string;
  document_vault_id: string;
  total_pages: number;
  inspected_page: number;
  resolution_timestamp: string;
  borrower_entity: {
    name: string;
    jurisdiction: string;
    filing_date: string;
    tax_classification: string;
  };
  grounded_members: GroundedMember[];
  unstated_sale_price_reasoning: {
    flag: boolean;
    agentic_finding: string;
    grounding_source: string;
    submarket_grounding: string;
    capitalization_formula: string;
    occ_sr11_7_notice: string;
  };
}

export interface ValuationData {
  sale_price: number;
  grounded_noi: number;
  grounded_cap_rate: number;
  debt_payoff: number;
  estimated_closing_costs: number;
  net_equity_proceeds: number;
  known_hban_balances: number;
  total_resolvable_position: number;
  strategy_type: string;
  strategy_product: string;
  yield_apy: number;
  statutory_basis: string;
  routing_destination: string;
  deposit_credit_pct: number;
  finra_rule_2040_compliant: boolean;
  occ_sr11_7_designation: string;
}

export interface QuarantineState {
  quarantined: boolean;
  verbal_consent_recorded: boolean;
  recorded_by: string | null;
  consent_timestamp: string | null;
  audit_hash: string;
  compliance_notes: string;
}

export interface WireInstructionData {
  letter_id: string;
  date: string;
  title_company: string;
  title_address: string;
  attention: string;
  escrow_file: string;
  property: string;
  seller_entity: string;
  managing_member: string;
  bank_name: string;
  aba_routing: string;
  account_title: string;
  account_number: string;
  special_instructions: string;
  indicative_net_disbursement: number;
  officer_signature: string;
  officer_contact: string;
}

export interface KYCField {
  field: string;
  value: string;
  status: string;
}

export interface IPSAllocation {
  asset_class: string;
  target_pct: number;
  rationale: string;
}

export interface WealthOnboardingData {
  status: string;
  quarantined: boolean;
  assigned_pwa: string;
  target_client: string;
  household_id: string;
  staged_kyc_cip: {
    completion_percentage: number;
    verified_fields: KYCField[];
    pending_advisor_actions: string[];
  };
  sei_custodial_shell: {
    shell_id: string;
    account_title: string;
    custodian: string;
    clearing_status: string;
    cash_depository_link: string;
  };
  draft_ips_scaffolding: {
    mandate: string;
    horizon: string;
    liquidity_reserve_sleeve: string;
    asset_allocation_scaffold: IPSAllocation[];
    fiduciary_disclaimer: string;
  };
  ongoing_servicing_dossier: {
    annual_reviews_automated: boolean;
    advisor_capacity_expansion: string;
    features: string[];
  };
}
