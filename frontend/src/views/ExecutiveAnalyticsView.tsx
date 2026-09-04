import React, { useState } from 'react';
import { CapacityMeter } from '../types';
import {
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
  DollarSign,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface ExecutiveAnalyticsViewProps {
  capacityMeter: CapacityMeter;
}

export const ExecutiveAnalyticsView: React.FC<ExecutiveAnalyticsViewProps> = ({
  capacityMeter,
}) => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'sensitivity' | 'governance'>('kpis');

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-widest text-[#006738] dark:text-[#A7F3D0]">
            Executive Analytics &bull; Portfolio Governance
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Executive Analytics &amp; Corporate Governance
          </h1>
          
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Franchise-scale deposit retention metrics, capacity leverage economics, and institutional regulatory defense matrix.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'kpis'
                ? 'bg-white dark:bg-slate-700 text-[#006738] dark:text-[#A7F3D0] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Core Metrics
          </button>
          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'sensitivity'
                ? 'bg-white dark:bg-slate-700 text-[#006738] dark:text-[#A7F3D0] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Layer A vs B Model
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'governance'
                ? 'bg-white dark:bg-slate-700 text-[#006738] dark:text-[#A7F3D0] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            CRO Defense
          </button>
        </div>
      </div>

      {/* 4 Primary Franchise Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Book-Scale Volume</span>
            <TrendingUp className="w-4 h-4 text-[#006738]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {capacityMeter.book_scale_volume}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Annual commercial payoffs. 100% automated payoff request capture.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            ~78% flight cliff within 72h
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Commercial Discovery</span>
            <Clock className="w-4 h-4 text-[#006738]" />
          </div>
          <div className="text-3xl font-extrabold text-[#006738] dark:text-[#A7F3D0] tabular-nums tracking-tight">
            ~7 hrs to 4 min
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Entity extraction, NOI capitalization, and valuation automated.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            {capacityMeter.manual_discovery_absorbed_hrs}h banker load absorbed
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>PWA Relationship Limit</span>
            <Users className="w-4 h-4 text-[#006738]" />
          </div>
          <div className="text-3xl font-extrabold text-[#006738] dark:text-[#A7F3D0] tabular-nums tracking-tight">
            80 to 150 accounts
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Ongoing servicing automated, enabling advisor capacity expansion.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-[#006738] dark:text-emerald-400">
            Zero net new headcount
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Exclusion Sentry</span>
            <ShieldCheck className="w-4 h-4 text-[#006738]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
            2,140 to 6 qualified
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Automated screening against Pass Tier 1/2 credit and KYC thresholds.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            FINRA 2040 compliant triage
          </div>
        </div>

      </div>

      {/* Tab Content: Sensitivity Model */}
      {(activeTab === 'kpis' || activeTab === 'sensitivity') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400">
                Economic Modeling
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                Financial ROI Model: Layer A (Commercial) vs Layer B (Wealth)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Economic return on deposit retention across a representative $180M commercial payoff sample.
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-[#A7F3D0]">
              Annualized Value
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Layer A */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#006738]" />
                  Layer A: Commercial Retention Alone
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                  +$2.18M NIM
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Captures seller proceeds into Huntington Commercial Max$aver ICS Sweeps or 1031 Qualified Escrow Depositories at 4.85% APY before wire flight occurs.
              </p>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">At-Risk Principal:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">$180,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Target Retention Rate:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">25.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Retained Deposits:</span>
                  <span className="font-bold text-[#006738] dark:text-emerald-400 tabular-nums">$45,000,000</span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-sm">
                  <span>Net Interest Margin (NIM):</span>
                  <span className="text-[#006738] dark:text-emerald-400 tabular-nums">$2,182,500 / yr</span>
                </div>
              </div>
            </div>

            {/* Layer B */}
            <div className="p-6 rounded-2xl border border-[#A7F3D0] dark:border-emerald-800 bg-[#E8F5E9]/40 dark:bg-emerald-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#006738]" />
                  Layer B: Dual-Sided Wealth Conversion
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                  +$135k Fee + $1.31M NIM
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Converts commercial liquidity into long-term fee-generating wealth advisory relationships without exceeding advisor capacity limits.
              </p>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Retained Base Deposits:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">$45,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Wealth Conversion Rate:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">40.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">New Wealth AUM:</span>
                  <span className="font-bold text-[#006738] dark:text-emerald-400 tabular-nums">$18,000,000</span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-sm">
                  <span>Recurring AUM Fee (75 bps):</span>
                  <span className="text-[#006738] dark:text-emerald-400 tabular-nums">+$135,000 / yr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: CRO Regulatory Defense */}
      {(activeTab === 'kpis' || activeTab === 'governance') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400">
                Institutional Defense
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                Chief Risk Officer (CRO) Compliance Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Statutory and regulatory audit clearance across four institutional domains.
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-[#A7F3D0] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006738]" />
              100% Audit Cleared
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Reg 1 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  FINRA Rule 2040 (Non-Fee Splitting)
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Guarantees commercial bankers receive no securities referral commissions or transaction-based compensation. Shadow credit is applied strictly to commercial deposit retention.
              </p>
            </div>

            {/* Reg 2 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  GLBA Sec. 502(e) &amp; 12 C.F.R. Sec. 1016.11
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Technical privacy firewall prevents cross-division customer data leakage. Data remains quarantined until RM records client verbal opt-in during closing touchpoint.
              </p>
            </div>

            {/* Reg 3 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  IRC Sec. 1031 &amp; Treas. Reg. Sec. 1.1031(k)-1(g)(3)
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated 1031 detector prevents disqualifying constructive receipt by routing exchange proceeds into a Huntington Qualified Escrow Depository rather than operating checking.
              </p>
            </div>

            {/* Reg 4 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  OCC Bulletin 2011-12 (SR 11-7)
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Model Risk Management (MRM): Output is legally designated as relationship triage prioritization and administrative document drafting, not automated credit underwriting.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

