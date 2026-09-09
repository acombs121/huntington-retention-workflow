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
  Sliders,
  Calculator,
  Building2,
  Cpu,
  ArrowLeft,
} from 'lucide-react';

interface ExecutiveAnalyticsViewProps {
  capacityMeter: CapacityMeter;
  onBackToPipeline?: () => void;
}

export const ExecutiveAnalyticsView: React.FC<ExecutiveAnalyticsViewProps> = ({
  capacityMeter,
  onBackToPipeline,
}) => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'sensitivity' | 'governance'>('kpis');
  const [captureRate, setCaptureRate] = useState<number>(10);

  // Financial Sensitivities across $4.5B Commercial Loan Book (PRD Sec. 6.2)
  const bookVolume = 4500000000;
  const flightRate = 0.78;
  const atRiskFlight = bookVolume * flightRate;
  const retainedLiquidity = bookVolume * (captureRate / 100);

  // Tier 1: Treasury ICS & 1031 Escrow (65% @ 85 bps Net NIM)
  const tier1Liquidity = retainedLiquidity * 0.65;
  const tier1Nim = tier1Liquidity * 0.0085;

  // Tier 2: Wealth AUM (35% @ 65 bps Advisory Fee)
  const tier2Aum = retainedLiquidity * 0.35;
  const tier2Fee = tier2Aum * 0.0065;

  const grossAnnualValue = tier1Nim + tier2Fee;
  const enterpriseRunRate = 1250000;
  const netAnnualRoi = grossAnnualValue - enterpriseRunRate;
  const paybackMonths = (enterpriseRunRate / grossAnnualValue) * 12;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {onBackToPipeline && (
            <button
              onClick={onBackToPipeline}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-[#A7F3D0] transition mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Payoff Pipeline</span>
            </button>
          )}
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
            1,400 branches in 21 states &bull; Top-2 SBA 7(a) lender. 100% automated payoff capture.
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
            80 to 95–100 accounts
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            2x CSA operational leverage (1 CSA : 4 PWAs); sub-$3M routed to Centralized Wealth Hub.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-[#006738] dark:text-emerald-400">
            +25% capacity &bull; zero net headcount
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
            Ameriprise Reg R &amp; FINRA 2040 compliant
          </div>
        </div>

      </div>

      {/* Tab Content: Sensitivity Model & CFO Operating Cost Defense */}
      {(activeTab === 'kpis' || activeTab === 'sensitivity') && (
        <div className="space-y-8">
          {/* Interactive Sensitivity Model */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  Interactive Sensitivity Model &bull; PRD &sect;6.2
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  Financial ROI Model: Franchise Liquidity Retention Sensitivity
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Simulate economic return on deposit retention across Huntington's $4.50B annual commercial loan payoff volume.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-[#A7F3D0]">
                Live Scenario Modeling
              </span>
            </div>

            {/* Slider & Quick-Preset Controls */}
            <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#006738] text-white shadow-sm">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Retention Capture Rate Slider
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Baseline: $4.50B Payoffs &bull; ~{(flightRate * 100).toFixed(0)}% (${(atRiskFlight / 1000000000).toFixed(2)}B) Historical 72h Flight Rate
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCaptureRate(5)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      captureRate === 5
                        ? 'bg-[#006738] text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    5% (Ultra-Conservative)
                  </button>
                  <button
                    onClick={() => setCaptureRate(10)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      captureRate === 10
                        ? 'bg-[#006738] text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    10% (Target)
                  </button>
                  <button
                    onClick={() => setCaptureRate(15)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      captureRate === 15
                        ? 'bg-[#006738] text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    15% (Management Goal)
                  </button>
                </div>
              </div>

              {/* Range Input Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="0.5"
                  value={captureRate}
                  onChange={(e) => setCaptureRate(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#006738]"
                />
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>3.0% Minimum Floor</span>
                  <span className="text-[#006738] dark:text-emerald-400 font-extrabold text-sm">
                    {captureRate.toFixed(1)}% Active Capture Rate
                  </span>
                  <span>20.0% Extended Upside</span>
                </div>
              </div>

              {/* Dynamic 4-Column Metric Summary Banner */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500">Retained Liquidity</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                    ${(retainedLiquidity / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-[11px] text-slate-400">across $4.5B book</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500">Gross Annual Value</div>
                  <div className="text-lg font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                    ${(grossAnnualValue / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[11px] text-slate-400">NIM + Wealth AUM fees</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500">Net Annual ROI</div>
                  <div className="text-lg font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                    +${(netAnnualRoi / 1000000).toFixed(2)}M / yr
                  </div>
                  <div className="text-[11px] text-slate-400">after ($1.25M) run-rate</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500">Payback Horizon</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {paybackMonths.toFixed(1)} Months
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Sub-annual recovery</div>
                </div>
              </div>
            </div>

            {/* 2-Column Layer A vs Layer B Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Layer A */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#006738]" />
                    Layer A: Commercial Retention Alone
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                    +${(tier1Nim / 1000000).toFixed(2)}M NIM
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tier 1: 65% of captured liquidity routed into Huntington Commercial ICS Sweeps or 1031 Qualified Escrow Depositories at 85 bps Net NIM before 72h flight occurs.
                </p>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">At-Risk Principal Book:</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">$4,500,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Active Capture Rate:</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">{captureRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Tier 1 Retained (65%):</span>
                    <span className="font-bold text-[#006738] dark:text-emerald-400 tabular-nums">${(tier1Liquidity / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-sm">
                    <span>Net Interest Margin (85 bps):</span>
                    <span className="text-[#006738] dark:text-emerald-400 tabular-nums">+${Math.round(tier1Nim).toLocaleString()} / yr</span>
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
                    +${(tier2Fee / 1000).toFixed(0)}k Advisory Fee
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tier 2: 35% of captured liquidity converted into fee-generating Private Wealth AUM at 65 bps with 2x CSA operational leverage (80 &rarr; 95&ndash;100 accounts; sub-$3M routed to Centralized Wealth Hub).
                </p>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Retained Base Liquidity:</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">${(retainedLiquidity / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Wealth Allocation (35%):</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">${(tier2Aum / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Advisor Capacity Headroom:</span>
                    <span className="font-bold text-[#006738] dark:text-emerald-400 tabular-nums">80 &rarr; 95–100 Accounts (2x CSA Leverage)</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-sm">
                    <span>Advisory Fee (65 bps):</span>
                    <span className="text-[#006738] dark:text-emerald-400 tabular-nums">+${Math.round(tier2Fee).toLocaleString()} / yr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CFO Enterprise Operating Budget Defense Table (PRD Sec. 6.3) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  CFO Cost Defense &bull; PRD &sect;6.3
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  Enterprise Operating Cost Breakdown ($1,250,000 Run-Rate Defense)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fully componentized infrastructure, cloud architecture, and dedicated staffing to satisfy CFO scrutiny.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                $1.25M Annual Budget
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Component &amp; Service Layer</th>
                    <th className="py-3 px-4 text-right">Annual Cost</th>
                    <th className="py-3 px-4">Scope &amp; Architecture Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-[#006738] shrink-0" />
                      Gemini Multimodal Ingestion &amp; Vertex AI Search
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                      $15,000
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                      ~2,140 document ingestion inferences, grounding queries, and embeddings.
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-[#006738] shrink-0" />
                      Cloud Spanner (Multi-Region HA Graph) &amp; Pub/Sub
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                      $65,000
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                      Real-time commercial-to-personal household topology and event streaming.
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#006738] shrink-0" />
                      Apigee X API Gateway &amp; Salesforce FSC Connectors
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                      $180,000
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                      Enterprise API management, mutual TLS, and CRM bidirectional synchronization.
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#006738] shrink-0" />
                      Dedicated Platform Engineering &amp; MLOps Pod
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                      $650,000
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                      2 dedicated platform engineers (maintenance, CI/CD, prompt regression testing).
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#006738] shrink-0" />
                      Model Risk Governance, SOC2 &amp; Security Audits
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                      $340,000
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                      Annual OCC SR 11-7 validation, penetration testing, and VPC-SC compliance.
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold">
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white">
                      Total Annual Enterprise Operating Budget
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#006738] dark:text-emerald-400 text-sm tabular-nums font-black">
                      $1,250,000
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      Fully-loaded production enterprise run-rate defense.
                    </td>
                  </tr>
                </tfoot>
              </table>
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
                Statutory and regulatory audit clearance across six institutional defense domains.
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-[#A7F3D0] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006738]" />
              6 of 6 Audit Cleared
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Reg 1 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ALTA Pillar 2 &amp; UCC Article 4A
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bank delivers verified routing packet directly to borrower via DocuSign; borrower submits as Seller Closing Authorization to title. Title executes dual-call verification to (614) 480-4401, eliminating lender standing liability and wire fraud risks.
              </p>
            </div>

            {/* Reg 2 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  GLBA Pre-Ingestion DLP &amp; FCRA &sect; 604
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated Cloud DLP scrubs non-guarantor PII prior to pipeline ingestion (e.g. Elena Vance excluded from wealth profiling per GLBA Reg P &amp; FCRA &sect; 604). Data quarantined until RM records verbal opt-in at payoff closing.
              </p>
            </div>

            {/* Reg 3 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  SEC Reg R &amp; FINRA 2040 (Ameriprise)
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Huntington Advisors operates on Ameriprise platform via SEC Regulation R Networking Arrangement. Non-registered commercial RMs receive deposit FTP credit only; zero securities commissions or fee splitting under FINRA Rule 2040.
              </p>
            </div>

            {/* Reg 4 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  IRC &sect; 1031 Safe Harbor (Treas. Reg. 1.1031)
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Partnered with independent national Qualified Intermediary (IPX1031). Bank acts strictly as Qualified Escrow Depository while programmatically firewalling in-house DST securities placement to preserve safe harbor under Treas. Reg. &sect; 1.1031(k)-1(k).
              </p>
            </div>

            {/* Reg 5 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  OCC Bulletin 2011-12 / SR 11-7 (Tier 3)
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Output is legally designated as internal operational triage heuristic and administrative drafting, not automated appraisal or underwriting. Client-facing valuation displays are muzzled to prevent lender liability.
              </p>
            </div>

            {/* Reg 6 */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  SEI Wealth Platform &amp; SEI Data Cloud
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Huntington Private Bank integration via SEI Data Cloud (Snowflake Secure Data Sharing Zero-ETL). Verified entity topologies stream directly into Private Bank IPS modeling without legacy on-premise Trust 3000 batch files.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

