import React, { useState } from 'react';
import { EntityResolutionData, PayoffItem } from '../types';
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GitGraph,
} from 'lucide-react';
import { SignalGraphModal } from '../components/SignalGraphModal';
import { StaleRecordNotice } from '../components/StaleRecordNotice';
import { DocumentGroundingCard } from '../components/DocumentGroundingCard';

interface PrincipalRelationship {
  principalName: string;
  principalRole: string;
  tenureYears: number;
  startDate: string;
  tenureSummary: string;
  assignedRM: string;
  rmTitle: string;
  lastTouchpointDate: string;
  lastTouchpointType: string;
  lastTouchpointLocation: string;
  lastTouchpointNotes: string;
  cfpbComplaints: number;
  servicingDisputes: string;
  paymentRecord: string;
  complianceStanding: string;
  relationshipTier: string;
}

function getPrincipalRelationship(deal: PayoffItem, entityData: EntityResolutionData): PrincipalRelationship {
  if (deal.id === 'PO-2026-7492') {
    return {
      principalName: 'Arthur Pendelton',
      principalRole: 'President & Majority Shareholder (70% Equity)',
      tenureYears: 9,
      startDate: 'September 2017',
      tenureSummary: '9-year commercial relationship spanning SBA 7(a) facility, equipment line of credit, and commercial depository accounts.',
      assignedRM: deal.commercial_rm || 'Greg Miller',
      rmTitle: 'Vice President, Commercial Industrial Banking',
      lastTouchpointDate: 'August 10, 2026',
      lastTouchpointType: 'Quarterly Covenant & Capex Review',
      lastTouchpointLocation: 'Virtual (Microsoft Teams)',
      lastTouchpointNotes: 'Reviewed Q2 covenant compliance and machine tooling capital expenditure plans. Borrower noted potential real estate transaction under IRC §1031 like-kind exchange structure.',
      cfpbComplaints: 0,
      servicingDisputes: '1 resolved operational inquiry (Nov 2023, wire transfer cutoff inquiry resolved same day)',
      paymentRecord: '100% on-time debt service across 108 billing cycles',
      complianceStanding: 'Clean Record / Fully Resolved',
      relationshipTier: 'Pass (Tier 1) Prime Partner',
    };
  }

  if (deal.id === 'PO-2026-6104') {
    return {
      principalName: 'Dr. Robert Miller',
      principalRole: 'Managing Partner & Lead Physician',
      tenureYears: 6,
      startDate: 'March 2020',
      tenureSummary: '6-year commercial relationship covering healthcare practice acquisition debt, medical facility term loan, and commercial sweep depository.',
      assignedRM: deal.commercial_rm || 'Amanda Cross',
      rmTitle: 'Director, Healthcare Practice Banking',
      lastTouchpointDate: 'July 28, 2026',
      lastTouchpointType: 'Practice Facility Renewal Consultation',
      lastTouchpointLocation: 'Scioto Medical Pavilion, Columbus',
      lastTouchpointNotes: 'Opened renewal file #REN-6104. Borrower cited aggressive competing rate offers from Fifth Third; RM actively structuring rate-match retention package.',
      cfpbComplaints: 0,
      servicingDisputes: '1 billing clarification (April 2024, property tax escrow calculation adjusted within 48 hours)',
      paymentRecord: '100% on-time debt service across 72 billing cycles',
      complianceStanding: 'Clean Record / Fully Resolved',
      relationshipTier: 'Pass (Tier 2) Active Renewal',
    };
  }

  // Default: PO-2026-8821 (Vance Riverfront Properties IV, LLC)
  const primaryGrounded = entityData.grounded_members?.find(m => m.is_guarantor) || entityData.grounded_members?.[0];
  return {
    principalName: primaryGrounded?.name || deal.primary_guarantor || 'Marcus Vance',
    principalRole: primaryGrounded?.role || 'Managing Member & Majority Owner (85% Equity)',
    tenureYears: 14,
    startDate: 'May 2012',
    tenureSummary: '14-year foundational relationship. Originated with commercial treasury management and operating DDA (#..4109), expanding to CRE term financing (#CC-8821) in 2018.',
    assignedRM: deal.commercial_rm || 'Greg Miller',
    rmTitle: 'Senior Vice President, Commercial Real Estate Banking',
    lastTouchpointDate: 'August 18, 2026',
    lastTouchpointType: 'In-Person Annual Review & Executive Lunch',
    lastTouchpointLocation: 'Huntington Center, Columbus, OH',
    lastTouchpointNotes: 'Conducted annual review of High Street property operations and lease roll. Client noted strong cash flows; hinted at evaluating broader capital re-allocation in late Q3. Zero replacement debt solicited.',
    cfpbComplaints: 0,
    servicingDisputes: 'None on record (Zero title, escrow, or loan servicing disputes)',
    paymentRecord: '100% on-time debt service across 168 consecutive billing cycles',
    complianceStanding: 'Pristine Regulatory & Servicing Record',
    relationshipTier: 'Tier 1 Prime Standing',
  };
}

interface DealAnalysisViewProps {
  deal: PayoffItem;
  entityData: EntityResolutionData;
  /** The entity record in state belongs to a different deal; withhold it. */
  isDealDataStale?: boolean;
  onBackToPipeline: () => void;
  onProceedToRetention: () => void;
}

export const DealAnalysisView: React.FC<DealAnalysisViewProps> = ({
  deal,
  entityData,
  isDealDataStale = false,
  onBackToPipeline,
  onProceedToRetention,
}) => {
  const [isSignalGraphOpen, setIsSignalGraphOpen] = useState(false);
  // Which extraction region is highlighted. Keyed off the deal so selecting a
  // different borrower cannot leave a previous borrower's name selected.
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionDealId, setRegionDealId] = useState<string>(deal.id);
  if (regionDealId !== deal.id) {
    setRegionDealId(deal.id);
    setSelectedRegion(null);
  }
  const groundedMembers = entityData.grounded_members ?? [];
  const activeRegion = selectedRegion ?? groundedMembers[0]?.name ?? null;
  const relationship = getPrincipalRelationship(deal, entityData);

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 md:py-12 space-y-8">
      
      {/* Editorial Header */}
      <div className="pb-6 border-b border-slate-200/80 dark:border-palette-surface-3">
        <button
          onClick={onBackToPipeline}
          className="group inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-palette-ink transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Commercial Pipeline</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-palette-ink">
                {deal.borrower_entity}
              </h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-palette-surface-2 text-slate-500 dark:text-palette-ink-3">
                {deal.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-palette-ink-4 mt-1">
              {deal.property_name} &bull; {deal.property_address}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSignalGraphOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-palette-surface-3 bg-white dark:bg-palette-surface hover:bg-slate-50 dark:hover:bg-palette-surface-2 text-xs font-bold text-slate-700 dark:text-palette-ink transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
            title={`Inspect Cloud Spanner Signal Graph for ${deal.borrower_entity}`}
          >
            <GitGraph className="w-4 h-4 text-[#006738] dark:text-palette-accent" />
            <span>Spanner Signal Graph</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Deal & Liquidity Reality (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Title & Payoff Demand */}
          <div className="bg-white dark:bg-palette-surface border border-slate-200/80 dark:border-palette-surface-3 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400 dark:text-palette-ink-3" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-palette-ink">
                  Title Payoff Demand
                </h2>
              </div>
              {/* The DLP attestation belongs to the entity-resolution record. If
                  that record is not this deal's, the badge is not this deal's
                  either. */}
              {!isDealDataStale && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#006738] dark:text-palette-accent">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>DLP Verified</span>
                </span>
              )}
            </div>

            {/* Hero Payoff Balance */}
            <div className="pt-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-palette-ink-4 block">
                Total Payoff Balance
              </span>
              <div className="text-3xl font-bold text-slate-900 dark:text-palette-ink tabular-nums tracking-tight mt-0.5">
                ${deal.existing_debt_upb.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 dark:text-palette-ink-4 mt-1">
                ${deal.per_diem_interest.toFixed(0)}/day per diem &bull; Closing {deal.scheduled_closing_date}
              </p>
            </div>

            {/* Clean Key-Value Grid */}
            <div className="pt-4 border-t border-slate-100 dark:border-palette-surface-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-palette-ink-4 block">Property</span>
                <span className="font-semibold text-slate-800 dark:text-palette-ink mt-0.5 block">
                  {deal.property_name}
                </span>
                <span className="text-slate-500 dark:text-palette-ink-3 text-[11px]">
                  {deal.property_address}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-palette-ink-4 block">Title &amp; Escrow</span>
                <span className="font-semibold text-slate-800 dark:text-palette-ink mt-0.5 block">
                  {deal.title_company}
                </span>
                <span className="text-slate-500 dark:text-palette-ink-3 text-[11px]">
                  File #{deal.escrow_file_number} &bull; {deal.settlement_officer}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Principal Relationship (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Everything in this column comes from the per-deal entity record.
              If that record is the previous borrower's, show nothing rather
              than showing their relationship history under this name. */}
          {isDealDataStale && (
            <StaleRecordNotice
              dealName={deal.borrower_entity}
              what="the relationship record"
            />
          )}

          {!isDealDataStale && (<>
          {/* Card 2: Relationship to Principal */}
          <div className="bg-white dark:bg-palette-surface border border-slate-200/80 dark:border-palette-surface-3 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-palette-surface-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-palette-ink">
                Principal Relationship
              </h2>
              <span className="text-xs font-semibold text-[#006738] dark:text-palette-accent">
                {relationship.relationshipTier}
              </span>
            </div>

            {/* Principal & Tenure Hero */}
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-palette-ink">
                  {relationship.principalName}
                </h3>
                <p className="text-xs text-slate-400 dark:text-palette-ink-4">
                  RM: {relationship.assignedRM}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-bold text-[#006738] dark:text-palette-accent tabular-nums block">
                  {relationship.tenureYears} Years
                </span>
                <span className="text-[10px] text-slate-400 dark:text-palette-ink-4 block">
                  Since {relationship.startDate}
                </span>
              </div>
            </div>

            {/* Touchpoint summary */}
            <div className="pt-3 border-t border-slate-100 dark:border-palette-surface-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-palette-ink-4">Last Touchpoint</span>
                <span className="text-slate-600 dark:text-palette-ink-2 font-medium">{relationship.lastTouchpointDate}</span>
              </div>
              <p className="text-slate-500 dark:text-palette-ink-3">
                {relationship.lastTouchpointType} &bull; {relationship.lastTouchpointLocation}
              </p>
            </div>

            {/* Standing summary */}
            <div className="pt-3 border-t border-slate-100 dark:border-palette-surface-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-palette-ink-4">Payment Record</span>
                <span className="text-[#006738] dark:text-palette-accent font-semibold">100% On-Time</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-palette-ink-4">Regulatory &amp; Disputes</span>
                <span className="text-slate-600 dark:text-palette-ink-2 font-medium">0 on file</span>
              </div>
            </div>
          </div>
          </>)}

        </div>

      </div>

      {/* Document grounding, full width.

          The page is shown at full size through a window rather than
          shrunk to fit a column -- a letter page scaled into a sidebar is
          unreadable, and an unreadable exhibit proves nothing. At this
          width the clause can actually be read from across a boardroom,
          which is the entire point of showing it. */}
      {isDealDataStale ? (
        <StaleRecordNotice
          dealName={deal.borrower_entity}
          what="the ownership record and its source document"
        />
      ) : (
        <DocumentGroundingCard
          entityData={entityData}
          selectedMemberName={activeRegion}
          onSelectMember={setSelectedRegion}
        />
      )}

      {/* Liquidity & Net Proceeds, full width.

          This is the conclusion the two columns above argue toward -- the
          payoff and its documentary grounding on one side, the people and the
          relationship on the other -- and it is the number the routing
          decision is actually made on, so it reads better as a full-width
          band than as the tail of one column. It also keeps the two columns
          close to even now that Document Grounding has been added to the
          left. */}
          <div className="bg-white dark:bg-palette-surface border border-slate-200/80 dark:border-palette-surface-3 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-palette-ink">
                Liquidity &amp; Net Proceeds
              </h2>
              <span className="text-xs font-semibold text-[#006738] dark:text-palette-accent">
                {(deal.submarket_cap_rate * 100).toFixed(1)}% Cap Rate
              </span>
            </div>

            {/* Hero Value */}
            <div className="pt-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-palette-ink-4 block">
                {deal.unstated_sale_price ? 'Indicative Valuation' : 'Estimated Net Equity'}
              </span>
              <div className="text-3xl font-bold text-[#006738] dark:text-palette-accent tabular-nums tracking-tight mt-0.5">
                ~${((deal.unstated_sale_price ? deal.indicative_valuation : deal.estimated_net_equity) / 1000000).toFixed(2)}M
              </div>
            </div>

            {/* Financial Line Items */}
            <div className="pt-4 border-t border-slate-100 dark:border-palette-surface-3 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-palette-ink-4 block">Trailing Q1 NOI</span>
                <span className="font-semibold text-slate-800 dark:text-palette-ink tabular-nums mt-0.5 block">
                  ${deal.noi_trailing_q1.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-palette-ink-4 block">Cap Rate Benchmark</span>
                <span className="font-semibold text-slate-800 dark:text-palette-ink mt-0.5 block">
                  {(deal.submarket_cap_rate * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-palette-ink-4 block">
                  {deal.unstated_sale_price ? 'Valuation Basis' : 'Contract Price'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-palette-ink mt-0.5 block">
                  {deal.unstated_sale_price ? 'Internal Triage Only' : `$${(deal.indicative_valuation / 1000000).toFixed(2)}M`}
                </span>
              </div>
            </div>

            {/* Disclosure, not a defect. Net proceeds here are sale price less
                the payoff quote less closing costs -- nothing else. */}
            <p className="pt-1 text-[11px] leading-relaxed text-slate-400 dark:text-palette-ink-4">
              Gross of the yield-maintenance prepayment premium and of the seller's tax
              liability on a taxable disposition. Both reduce the amount actually available
              to deposit; treat this as an upper bound, not a settlement figure.
            </p>
          </div>

      {/* Bottom Action */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={onProceedToRetention}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#006738] hover:bg-[#1B5630] dark:bg-palette-accent-deep dark:hover:bg-[#28845e] text-white shadow-sm transition active:scale-[0.98]"
        >
          <span>Route to Wealth Advisor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cloud Spanner Signal Grounding Graph Modal */}
      <SignalGraphModal
        isOpen={isSignalGraphOpen}
        onClose={() => setIsSignalGraphOpen(false)}
        activePayoffId={deal.id}
      />

    </div>
  );
};

