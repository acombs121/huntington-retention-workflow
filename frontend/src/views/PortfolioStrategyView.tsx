import React, { useState } from 'react';
import { WealthOnboardingData, ValuationData } from '../types';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface PortfolioStrategyViewProps {
  data: WealthOnboardingData;
  valuation: ValuationData;
  onBackToDossier: () => void;
}

export const PortfolioStrategyView: React.FC<PortfolioStrategyViewProps> = ({
  data,
  valuation,
  onBackToDossier,
}) => {
  const [delivered, setDelivered] = useState(false);

  const totalAmount = valuation.net_equity_proceeds;
  const ips = data.draft_ips_scaffolding;
  const clientDisplayName = data.target_client
    ? data.target_client.split('(')[0].trim()
    : 'Client';


  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Header & Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <button
            onClick={onBackToDossier}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-[#A7F3D0] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Wealth Dossier</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#006738] dark:text-[#A7F3D0]">
              Private Wealth Advisory &bull; Portfolio Allocation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Administrative Draft Scaffolding for Internal Advisor Review Only
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Investment Policy &amp; Portfolio Strategy (Internal Draft Scaffolding)
          </h1>
          
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Administrative draft scaffolding, liquidity schedules, and ongoing review framework for licensed advisor authorship and client suitability analysis ({clientDisplayName}).
          </p>
        </div>

        {/* Stage Scaffolding CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Allocating</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              ${(totalAmount / 1000000).toFixed(2)}M
            </div>
          </div>

          <button
            onClick={() => setDelivered(true)}
            disabled={delivered}
            className={`inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition active:scale-[0.98] ${
              delivered
                ? 'bg-[#E8F5E9] text-[#004724] border border-[#A7F3D0] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm'
            }`}
          >
            {delivered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#006738]" />
                <span>Staged for Advisor Authorship</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Stage Scaffolding for Advisor Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SEC Regulation Best Interest (Reg BI) & Fiduciary Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            SEC Regulation Best Interest (Reg BI) &amp; Fiduciary Notice
          </div>
          <p className="leading-relaxed">
            This asset allocation is <strong>administrative draft scaffolding only</strong> and does not constitute an investment recommendation or advice. Under SEC Reg BI and FINRA Rule 2111, a licensed Series 7/66/CFP advisor must conduct an independent client risk discovery interview, verify suitability, and author the final Investment Policy Statement prior to client presentation.
          </p>
        </div>
      </div>

      {delivered && (
        <div className="p-6 rounded-2xl bg-[#E8F5E9]/60 dark:bg-emerald-950/40 border border-[#A7F3D0] dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#006738] dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Administrative Scaffolding Successfully Staged
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Staged in SEI Wealth Platform for Sarah Jenkins (CFP) suitability evaluation and formal IPS authorship. Not dispatched to client.
              </div>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-white/80 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-[#A7F3D0] shrink-0">
            Pending Advisor Suitability Review
          </span>
        </div>
      )}

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Asset Allocation (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400">
                Mandate Scaffold
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {ips.mandate}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Portfolio</span>
              <span className="text-lg font-bold text-[#006738] dark:text-emerald-400 tabular-nums">
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Clean Visual Allocation Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Allocation Target</span>
              <span>100% Fully Deployed</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              <div style={{ width: '50%' }} className="bg-[#006738] h-full" title="50% Fixed Income" />
              <div style={{ width: '35%' }} className="bg-[#7ECF1C] h-full" title="35% Core Equities" />
              <div style={{ width: '15%' }} className="bg-slate-400 h-full" title="15% Direct Real Assets & Infrastructure" />
            </div>
            <div className="flex items-center gap-6 pt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006738]" />
                <span>Fixed Income (50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7ECF1C]" />
                <span>Core Equities (35%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Direct Real Assets &amp; Infrastructure (15%)</span>
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Table */}
          <div className="space-y-4 pt-2">
            {(ips?.asset_allocation_scaffold || []).map((sleeve) => {
              const sleeveAmount = (totalAmount * sleeve.target_pct) / 100;

              return (
                <div
                  key={sleeve.asset_class}
                  className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {sleeve.asset_class}
                    </span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 font-semibold tabular-nums">{sleeve.target_pct}%</span>
                      <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                        ${sleeveAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sleeve.rationale}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-[#E8F5E9]/50 dark:bg-emerald-950/20 border border-[#A7F3D0] dark:border-emerald-800 text-xs text-[#004724] dark:text-emerald-300 leading-relaxed">
            <strong className="font-bold uppercase tracking-wider">Fiduciary Disclaimer:</strong> {ips.fiduciary_disclaimer}
          </div>
        </div>

        {/* Right Column: Automated Ongoing Servicing (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Ongoing Servicing Capacity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#006738]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Advisor Capacity Leverage
                </h3>
              </div>
              <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                80 to 95–100 Limit
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Why this does not flood advisors: 2x Client Service Associate (CSA) operational leverage (1 CSA : 4 PWAs) and automated servicing expand senior PWA headroom to 95–100 accounts (+25%), while sub-$3M transactional liquidity routes to the Centralized Wealth Advisory Hub.
            </p>

            <div className="space-y-3">
              {(data?.ongoing_servicing_dossier?.features || []).map((feature, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-3 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#006738] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {feature}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Automated background cadence via Gemini 3.7 Flash
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Annual Servicing Saved:</span>
              <span className="font-bold text-[#006738] dark:text-emerald-400 tabular-nums">~60 hrs / year</span>
            </div>
          </div>

          {/* Quarterly Review Schedule Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Calendar className="w-5 h-5 text-[#006738]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Automated Review Cadence
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Q1 2027</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">Rebalance Audit</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Q2 2027</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">Tax Harvesting</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Q3 2027</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">IPS Drift Check</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Q4 2027</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">Annual Briefing</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

