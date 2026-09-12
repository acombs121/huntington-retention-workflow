import React from 'react';
import { QuarantineState, ValuationData, PayoffItem, WealthOnboardingData } from '../types';
import { UserCheck, Building2, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface WealthQueueViewProps {
  deal?: PayoffItem;
  wealthOnboarding?: WealthOnboardingData;
  quarantineState: QuarantineState;
  valuation: ValuationData;
  onOpenDossier: () => void;
  onSwitchToCommercial: () => void;
}

export const WealthQueueView: React.FC<WealthQueueViewProps> = ({
  deal,
  wealthOnboarding,
  quarantineState,
  valuation,
  onOpenDossier,
  onSwitchToCommercial,
}) => {
  const isUnlocked = !quarantineState.quarantined;
  const clientName = wealthOnboarding?.target_client
    ? wealthOnboarding.target_client.split('(')[0].trim()
    : deal?.primary_guarantor || 'Marcus Vance';

  const propertyName = deal?.property_name || 'Commercial Property';
  const commercialRM = deal?.commercial_rm || 'Greg Miller';
  const borrowerEntity = deal?.borrower_entity || 'Commercial Entity';
  const assignedPwa = wealthOnboarding?.assigned_pwa || (deal?.assigned_pwa ? `${deal.assigned_pwa}, CFP` : 'Sarah Jenkins, CFP');

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#006738] dark:text-emerald-400 block">
              Private Wealth Management &bull; Client Referral Intake
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Private Wealth Client Queue
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              Commercial banking relationships with upcoming liquidity dispositions and verified client consent for wealth advisory engagement.
            </p>
          </div>

          {/* Large Swiss Statistical Summary */}
          <div className="flex items-center gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block">
                Available Inflow
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                ${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block">
                Fiduciary Gate
              </span>
              <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isUnlocked ? 'text-[#006738] dark:text-emerald-400' : 'text-slate-500'}`}>
                {isUnlocked ? 'Unlocked' : 'Quarantined'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Opportunity Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#006738]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Qualified Relationships (Passed Sentry &amp; Consent)
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Assigned PWA: {assignedPwa}
          </span>
        </div>

        {isUnlocked ? (
          <div className="p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {clientName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Consent Verified
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                  {propertyName} Disposition
                </span>
                <span>&bull;</span>
                <span>
                  Net Proceeds: <strong className="text-slate-900 dark:text-white tabular-nums">${valuation.net_equity_proceeds.toLocaleString()}</strong>
                </span>
                <span>&bull;</span>
                <span>Originating RM: {commercialRM}</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-[#006738] dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  82% KYC/CIP Pre-Populated
                </span>
                <span>&bull;</span>
                <span className="font-medium">SEI Custodial Shell Staged</span>
                <span>&bull;</span>
                <span className="font-medium">Draft IPS Ready for Authorship</span>
              </div>
            </div>

            <button
              onClick={onOpenDossier}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-xs font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white shadow-xs transition active:scale-[0.98] whitespace-nowrap self-start lg:self-center"
            >
              <span>Open Onboarding Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-16 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
              <Lock className="w-7 h-7 text-[#006738]" />
            </div>
            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Relationship Quarantined by NPI Privacy Barrier
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                The commercial payoff for {borrowerEntity} is active, but verbal opt-in consent has not yet been recorded by Commercial RM {commercialRM}.
              </p>
            </div>
            <button
              onClick={onSwitchToCommercial}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-wide bg-[#006738] text-white hover:bg-[#1B5630] shadow-sm transition active:scale-[0.98]"
            >
              <span>Switch to {commercialRM} to Record Consent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
