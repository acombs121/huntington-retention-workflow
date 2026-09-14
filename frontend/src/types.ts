export type PersonaType = 'commercial_rm' | 'wealth_advisor';

export interface CapacityMeter {
  screened_events_book: number;
  qualified_and_staged: number;
  manual_discovery_absorbed_hrs: number;
  wealth_admin_absorbed_hrs: number;
  active_machine_inferences: number;
  book_scale_volume: string;
  historical_flight_risk_rate: string;
  branch_network_count?: string;
  sba_position?: string;
  csa_leverage_ratio?: string;
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
  loan_type?: string;
  flight_confidence_score?: number;
  flight_risk_classification?: string;
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
  exclusion_status?: string;
}

export interface EntityResolutionData {
  payoff_id: string;
  document_name: string;
  document_vault_id: string;
  total_pages: number;
  inspected_page: number;
  resolution_timestamp: string;
  dlp_status?: string;
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
    model_risk_notice: string;
  };
}

/** The two statutory deadlines an IRC §1031 exchange runs against, plus the
 *  financing action they create.
 *
 *  Both deadlines are derived server-side from the closing on the relinquished
 *  property and arrive as ISO dates, not display strings, because the banker's
 *  question is "how many days do I have" rather than "what is the date".
 *  Formatting and the days-remaining arithmetic both belong to the view. */
export interface ExchangeTimeline {
  relinquished_closing_date: string;
  /** ISO date, or empty string when the closing date could not be parsed.
   *  The server returns blank rather than guessing -- a plausible-looking
   *  wrong statutory deadline is worse than a visibly absent one. */
  identification_deadline: string;
  exchange_deadline: string;
  identification_days_from_closing: number;
  exchange_days_from_closing: number;
  statutory_basis: string;
  replacement_financing_action: string;
  replacement_financing_owner: string;
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
  model_risk_designation: string;

  /** Null on a taxable sale, which has no statutory clock. The exchange panel
   *  keys off this null rather than off the strategy string, so the panel and
   *  the deadlines it renders can never disagree. */
  exchange_timeline?: ExchangeTimeline | null;
}

export interface QuarantineState {
  /** Present on every API response; the views use it to reject a record
   *  fetched for a different deal. Optional because the seed object predates it. */
  payoff_id?: string;

  /** Gate 1 -- the consultative call. Nothing client-facing exists until a
   *  banker has spoken to the borrower. Optional for the same reason as
   *  payoff_id: the seed object predates these fields. */
  call_logged?: boolean;
  call_timestamp?: string | null;
  call_recorded_by?: string | null;
  client_directed_proceeds?: boolean;
  call_audit_hash?: string;
  call_disposition?: string | null;

  /** Gate 1b -- packet dispatch. The envelope id is issued by the send action
   *  and by nothing else, so a present id means an envelope really went out.
   *  There is no "executed" state: whether the borrower signed arrives by
   *  DocuSign Connect webhook and is not ours to assert. */
  packet_sent?: boolean;
  packet_sent_at?: string | null;
  packet_sent_by?: string | null;
  packet_recipient?: string | null;
  docusign_envelope_id?: string | null;
  packet_audit_hash?: string;

  /** Gate 2 -- cross-LOB consent for the wealth referral. */
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
  /**
   * No bank-computed disbursement amount exists on this packet, by design. The
   * seller signs it and submits it as their own closing authorization, so any
   * figure here is one the bank asserted to the client. The net-equity estimate
   * is an internal triage heuristic, is gross of the prepayment premium and the
   * seller's tax liability, and would not reconcile to the settlement
   * statement. The bank supplies the destination; the seller elects the amount.
   */
  amount_election_note?: string;
  amount_election_options?: string[];
  officer_signature: string;
  officer_contact: string;
  packet_type?: string;
  /** Always null. The computed packet is a draft; the envelope id is issued by
   *  the send action and read from QuarantineState.docusign_envelope_id. */
  docusign_envelope_id?: string | null;
  delivery_channel?: string;
  borrower_directed_packet?: boolean;
  callback_verification_line?: string;
  independent_qi_partner?: string | null;
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
  /** Present on every API response; see QuarantineState.payoff_id. */
  payoff_id?: string;
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

export interface SpannerGraphNode {
  id: string;
  label: string;
  tier: 'source' | 'contract' | 'entity' | 'principal' | 'signal' | 'verdict';
  status: 'verified' | 'quarantined' | 'active' | 'flagged';
  badge: string;
  subtitle?: string;
  properties: Record<string, string>;
  agent_relevance: string;
  x: number;
  y: number;
}

export interface SpannerGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'primary' | 'quarantined' | 'signal' | 'verdict';
}

export interface SpannerGraphData {
  payoff_id: string;
  deal_name: string;
  borrower_entity: string;
  classification: string;
  confidence_score: number;
  spanner_stats: {
    database: string;
    engine: string;
    instance: string;
    query_latency_ms: number;
    nodes_matched: number;
    edges_traversed: number;
    gql_query: string;
  };
  nodes: SpannerGraphNode[];
  edges: SpannerGraphEdge[];
}

