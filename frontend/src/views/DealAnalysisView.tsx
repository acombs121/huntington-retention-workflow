import React, { useState, useEffect } from 'react';
import { EntityResolutionData, PayoffItem } from '../types';
import {
  FileText,
  Building2,
  User,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface DealAnalysisViewProps {
  deal: PayoffItem;
  entityData: EntityResolutionData;
  onBackToPipeline: () => void;
  onProceedToRetention: () => void;
}

export const DealAnalysisView: React.FC<DealAnalysisViewProps> = ({
  deal,
  entityData,
  onBackToPipeline,
  onProceedToRetention,
}) => {
  const [activeCitation, setActiveCitation] = useState<string | null>('borrower');
  const [selectedMember, setSelectedMember] = useState<string>(
    entityData.grounded_members?.[0]?.name || deal.primary_guarantor || 'Marcus Vance'
  );

  useEffect(() => {
    if (entityData.grounded_members?.length) {
      setSelectedMember(entityData.grounded_members[0].name);
    } else if (deal.primary_guarantor) {
      setSelectedMember(deal.primary_guarantor);
    }
  }, [entityData, deal]);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Breadcrumb & Navigation Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-10">
        <button
          onClick={onBackToPipeline}
          className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Commercial Pipeline</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#006738] dark:text-emerald-400 block">
              Commercial Credit &bull; Payoff Demand Statement &bull; Title Escrow
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {deal.borrower_entity}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800">
                {deal.id}
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              Verified title demand statement, beneficial ownership resolution, and collateral property valuation.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 lg:pt-0">
            <button
              onClick={onProceedToRetention}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm transition active:scale-[0.98]"
            >
              <span>Configure Retention &amp; Settlement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Inspection Workspace with Generous Whitespace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Document Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {/* Document Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                <FileText className="w-5 h-5 text-[#006738]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {entityData.document_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vault ID: {entityData.document_vault_id} &bull; Page {entityData.inspected_page} of {entityData.total_pages}
                </p>
              </div>
            </div>

            <span className="text-xs text-[#006738] dark:text-emerald-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              OCR Verified
            </span>
          </div>

          {/* Document Body with Grounded Bounding Boxes */}
          <div className="p-8 text-sm leading-relaxed text-slate-800 dark:text-slate-200 space-y-5 select-text">
            <div className="text-center font-bold text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-200 dark:border-slate-800">
              {deal.title_company.toUpperCase()} &bull; COMMERCIAL ESCROW DEMAND
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Attn: {deal.settlement_officer}, Commercial Escrow Officer &bull; Escrow File: <strong>{deal.escrow_file_number}</strong>
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Re: Payoff demand statement for commercial real estate loan encumbering{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{deal.property_name}, {deal.property_address}</span>.
            </p>

            {/* Bounding Box 1: Borrower Entity */}
            <div
              onClick={() => setActiveCitation('borrower')}
              className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                activeCitation === 'borrower'
                  ? 'border-[#006738] bg-[#E8F5E9]/60 dark:bg-emerald-950/40 shadow-sm'
                  : 'border-[#A7F3D0] dark:border-emerald-800/60 bg-[#E8F5E9]/20 dark:bg-emerald-950/20 hover:border-[#006738]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#006738] dark:text-emerald-300 font-bold mb-1 tracking-wider uppercase">
                <span>Verified Borrower Entity</span>
                <span className="text-xs">Confirmed</span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-100">
                Borrower: <strong>{entityData.borrower_entity.name}</strong>, an Ohio limited liability company, duly organized under the laws of the State of Ohio on April 12, 2018.
              </p>
            </div>

            {/* Bounding Box 2: Payoff Amount */}
            <div
              onClick={() => setActiveCitation('payoff')}
              className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                activeCitation === 'payoff'
                  ? 'border-[#006738] bg-[#E8F5E9]/60 dark:bg-emerald-950/40 shadow-sm'
                  : 'border-[#A7F3D0] dark:border-emerald-800/60 bg-[#E8F5E9]/20 dark:bg-emerald-950/20 hover:border-[#006738]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#006738] dark:text-emerald-300 font-bold mb-1 tracking-wider uppercase">
                <span>Verified Payoff &amp; Per Diem</span>
                <span className="text-xs">Confirmed</span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-100">
                Total Required Payoff to The Huntington National Bank as of September 5, 2026: <strong>${deal.existing_debt_upb.toLocaleString()}</strong>, with per diem interest of <strong>${deal.per_diem_interest.toFixed(0)}/day</strong> thereafter through scheduled closing.
              </p>
            </div>

            {/* Bounding Box 3: Guarantor */}
            <div
              onClick={() => {
                setActiveCitation('guarantor');
                const primaryName = entityData.grounded_members?.[0]?.name || 'Managing Member';
                setSelectedMember(primaryName);
              }}
              className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                activeCitation === 'guarantor'
                  ? 'border-[#006738] bg-[#E8F5E9]/60 dark:bg-emerald-950/40 shadow-sm'
                  : 'border-[#A7F3D0] dark:border-emerald-800/60 bg-[#E8F5E9]/20 dark:bg-emerald-950/20 hover:border-[#006738]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#006738] dark:text-emerald-300 font-bold mb-1 tracking-wider uppercase">
                <span>Verified Managing Guarantor</span>
                <span className="text-xs">Confirmed</span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-100">
                Incumbency Certification: <strong>{entityData.grounded_members?.[0]?.name || 'Managing Member'}</strong>, holding an undivided Managing Membership Interest with sole operating signatory authority for {deal.borrower_entity}.
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400">
              * Click any highlighted section above to inspect the corresponding entity record.
            </div>
          </div>
        </div>

        {/* Right Column: Verified Entity Resolution & Financial Grounding (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Entity Resolution Hierarchy Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#006738]" />
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                  Verified Beneficial Ownership
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#006738] dark:text-emerald-400 uppercase tracking-wider">
                EIN Verified
              </span>
            </div>

            {/* Member Cards */}
            <div className="space-y-3">
              {entityData.grounded_members.map((member) => {
                const isSelected = member.name === selectedMember;

                return (
                  <div
                    key={member.name}
                    onClick={() => setSelectedMember(member.name)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-[#006738] bg-[#E8F5E9]/50 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {member.name.includes('Trust') ? (
                          <Users className="w-4 h-4 text-slate-500" />
                        ) : (
                          <User className="w-4 h-4 text-[#006738]" />
                        )}
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {member.name}
                        </span>
                      </div>
                      {member.ownership_pct > 0 && (
                        <span className="text-xs font-bold text-[#006738] dark:text-emerald-400">
                          {member.ownership_pct}% Equity
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {member.role}
                    </div>

                    {member.known_hban_balance > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Known HBAN Deposits:</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          ${(member.known_hban_balance / 1000000).toFixed(2)}M
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Valuation Grounding Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#006738]" />
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                  Valuation Grounding
                </h2>
              </div>
              <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 uppercase tracking-wider">
                Submarket {(deal.submarket_cap_rate * 100).toFixed(1)}% Cap
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Trailing 12M NOI:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  ${deal.noi_trailing_q1.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Submarket Cap Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white">{(deal.submarket_cap_rate * 100).toFixed(2)}%</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Indicative Value:</span>
                <span className="font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                  ~${(deal.indicative_valuation / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Property valuation modeled from trailing 12-month net operating income against prevailing submarket commercial transaction comparables ({(deal.submarket_cap_rate * 100).toFixed(2)}% cap rate).
            </p>
          </div>

          {/* Bottom Next Step Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Ready to configure wire instructions &amp; retention accounts?
            </span>
            <button
              onClick={onProceedToRetention}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white transition active:scale-[0.98]"
            >
              <span>Proceed to Retention Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
