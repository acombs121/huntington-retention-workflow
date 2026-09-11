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
  AlertTriangle,
} from 'lucide-react';
import { useAssumptions } from '../context/AssumptionsContext';
import {
  ENTERPRISE_RUN_RATE,
  LOADED_FTE_COST,
  CB_AVERAGE_FTE,
  CAPACITY_BAND_HOURS,
  computeRoi,
  formatBps,
  formatUsdCompact,
} from '../lib/assumptions';

interface ExecutiveAnalyticsViewProps {
  capacityMeter: CapacityMeter;
  onBackToPipeline?: () => void;
}

export const ExecutiveAnalyticsView: React.FC<ExecutiveAnalyticsViewProps> = ({
  capacityMeter,
  onBackToPipeline,
}) => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'sensitivity' | 'governance'>('kpis');

  const { assumptions, funnel, capacity, statedYield, effectiveYield } = useAssumptions();

  // The slider now moves RECAPTURE of the at-risk equity pool, not a "capture rate"
  // applied to the entire loan book. The prior formulation multiplied the full $4.5B
  // by the slider value, which silently assumed every dollar of the book was in play.
  const [recaptureRate, setRecaptureRate] = useState<number>(25);

  const roi = computeRoi(assumptions, recaptureRate);
  const {
    retained: retainedLiquidity,
    tier1Balance: tier1Liquidity,
    tier1Revenue: tier1Nim,
    tier2Balance: tier2Aum,
    tier2Revenue: tier2Fee,
    grossAnnualValue,
    netAnnualRoi,
    isAccretive,
    recoveryMonths,
    breakevenRecapturePct,
  } = roi;

  const enterpriseRunRate = ENTERPRISE_RUN_RATE;
  const flightRate = assumptions.flightRate;

  // Render a loss honestly rather than displaying it with a hardcoded "+" in brand green.
  const netRoiSign = isAccretive ? '+' : '\u2212';
  const netRoiColor = isAccretive
    ? 'text-[#006738] dark:text-emerald-400'
    : 'text-[#9C3B2E] dark:text-red-400';
  const recoveryLabel = !isFinite(recoveryMonths)
    ? 'No recovery at this recapture rate'
    : recoveryMonths <= 12
      ? 'Sub-annual recovery'
      : 'Exceeds 12-month recovery';
  const recoveryLabelColor = isAccretive
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-[#9C3B2E] dark:text-red-400';

  // Capacity case: the headline. Derived entirely from Huntington's own 10-Q Table 25
  // segment disclosure, so it requires no internal data to defend.
  const capacityLow = capacity.low.annualValue;
  const capacityHigh = capacity.high.annualValue;
  const capacityClears = capacityLow >= enterpriseRunRate;

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
        
        {/* Metric 1 — the headline. Deliberately NOT the retained-liquidity number.
            This figure is derived only from Huntington's published segment data, so it
            survives scrutiny without asking the bank to disclose anything. */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-[#006738]/30 dark:border-emerald-800/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Reclaimed Capacity Value</span>
            <TrendingUp className="w-4 h-4 text-[#006738]" />
          </div>
          <div className="text-3xl font-extrabold text-[#006738] dark:text-[#A7F3D0] tabular-nums tracking-tight">
            {formatUsdCompact(capacityLow)}&ndash;{formatUsdCompact(capacityHigh)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {capacity.low.fteEquivalent.toFixed(1)}&ndash;{capacity.high.fteEquivalent.toFixed(1)} FTE
            of banker time returned across ~{Math.round(capacity.mid.events).toLocaleString()} annual
            payoff events, at ${Math.round(LOADED_FTE_COST).toLocaleString()} fully loaded per FTE.
          </p>
          <div
            className={`pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold ${
              capacityClears
                ? 'text-[#006738] dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {capacityClears ? 'Clears' : 'Below'} the $1.25M run-rate on time savings alone
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
            {capacityMeter.screened_events_book.toLocaleString()} to{' '}
            {capacityMeter.qualified_and_staged} qualified
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Automated screening against Pass Tier 1/2 credit and KYC thresholds.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            SEC Reg R referral controls enforced at screening
          </div>
        </div>

      </div>

      {/* Tab Content: Sensitivity Model & CFO Operating Cost Defense */}
      {(activeTab === 'kpis' || activeTab === 'sensitivity') && (
        <div className="space-y-8">
          {/* PRIMARY CASE: reclaimed capacity.
              Placed above the liquidity model on purpose. Every input here traces to a
              published Huntington disclosure, so it can be defended in the room without
              asking anyone to reveal internal performance data. */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#006738]/30 dark:border-emerald-800/50 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Primary Business Case
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  Reclaimed Capacity: {formatUsdCompact(capacityLow)}&ndash;
                  {formatUsdCompact(capacityHigh)} per Year
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Built entirely from Huntington's Q2 2026 10-Q segment disclosure. No internal
                  data required.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 bg-[#E8F5E9] dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-[#A7F3D0] shrink-0">
                Publicly Sourced
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-[11px] uppercase font-semibold text-slate-400">
                  Loaded Cost / FTE
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  ${Math.round(LOADED_FTE_COST).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  $393M direct personnel &divide; {CB_AVERAGE_FTE.toLocaleString()} avg FTE (Table 25)
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-slate-400">
                  Annual Payoff Events
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  ~{Math.round(capacity.mid.events).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {formatUsdCompact(funnel.payoffVolume)} payoff volume at{' '}
                  {formatUsdCompact(assumptions.avgLoanSize)} avg loan
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-slate-400">
                  FTE Equivalent Freed
                </div>
                <div className="text-xl font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums mt-0.5">
                  {capacity.low.fteEquivalent.toFixed(1)}&ndash;
                  {capacity.high.fteEquivalent.toFixed(1)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  at {CAPACITY_BAND_HOURS.low}&ndash;{CAPACITY_BAND_HOURS.high} hrs saved per event
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-slate-400">
                  vs. $1.25M Run-Rate
                </div>
                <div
                  className={`text-xl font-extrabold tabular-nums mt-0.5 ${
                    capacityClears
                      ? 'text-[#006738] dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {capacityClears ? '+' : '\u2212'}
                  {formatUsdCompact(Math.abs(capacityLow - enterpriseRunRate))}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  at the conservative {CAPACITY_BAND_HOURS.low}-hour end
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">
                  Only one input here is an assumption:
                </span>{' '}
                hours reclaimed per payoff event. Huntington can validate it internally in a week
                by timing the current manual workflow. Everything else &mdash; the loan book, the
                turnover rate, the personnel cost, the FTE count &mdash; comes from the 10-Q and
                the Call Report.
              </p>
            </div>
          </div>

          {/* UPSIDE CASE: retained liquidity. */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  Upside Case &bull; Assumption-Dependent
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  Retained Liquidity: Sensitivity to Recapture
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Presented as upside, not as the base case. The result swings on four inputs that
                  no public source can settle. Adjust them in the Admin Panel.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900 shrink-0">
                Live Scenario Modeling
              </span>
            </div>

            {/* Funnel: from the verified book down to the money actually in play. */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-6 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                From Loan Book to Equity Actually at Risk
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  {
                    label: 'Target commercial real estate book',
                    detail: assumptions.includeOwnerOccupied
                      ? 'CRE ex small-business, plus owner-occupied'
                      : 'CRE ex small-business',
                    value: funnel.targetBook,
                    tone: 'verified' as const,
                  },
                  {
                    label: `Pays off within 12 months (${(assumptions.turnover * 100).toFixed(1)}%)`,
                    detail: 'Call Report RC-C Part I, Memo 4',
                    value: funnel.payoffVolume,
                    tone: 'derived' as const,
                  },
                  {
                    label: `Disposition, not refinance (${(assumptions.saleShare * 100).toFixed(0)}%)`,
                    detail: 'Industry default',
                    value: funnel.dispositionVolume,
                    tone: 'estimate' as const,
                  },
                  {
                    label: `Net seller equity (${(assumptions.equityRatio * 100).toFixed(0)}%)`,
                    detail: 'Industry default at ~60% LTV',
                    value: funnel.sellerEquity,
                    tone: 'estimate' as const,
                  },
                  {
                    label: `Leaves absent intervention (${(flightRate * 100).toFixed(0)}%)`,
                    detail: 'Benchmark band, not a Huntington figure',
                    value: funnel.atRiskEquity,
                    tone: 'estimate' as const,
                  },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-baseline justify-between gap-4 py-1.5 ${
                      i === arr.length - 1
                        ? 'border-t border-slate-200 dark:border-slate-700 pt-2.5 mt-1'
                        : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <span
                        className={`font-semibold ${
                          i === arr.length - 1
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {row.label}
                      </span>
                      <span
                        className={`ml-2 text-[10px] uppercase font-bold tracking-wider ${
                          row.tone === 'verified'
                            ? 'text-[#006738] dark:text-emerald-400'
                            : row.tone === 'derived'
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {row.tone}
                      </span>
                      <div className="text-[11px] text-slate-400">{row.detail}</div>
                    </div>
                    <span
                      className={`tabular-nums shrink-0 ${
                        i === arr.length - 1
                          ? 'text-base font-extrabold text-slate-900 dark:text-white'
                          : 'font-semibold text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {formatUsdCompact(row.value)}
                    </span>
                  </div>
                ))}
              </div>
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
                      Recapture Rate Slider
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Share of the {formatUsdCompact(funnel.atRiskEquity)} at-risk equity pool the
                      program keeps &mdash; not a share of the whole loan book.
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { value: 10, label: '10% (Conservative)' },
                    {
                      value: Math.round(breakevenRecapturePct * 10) / 10,
                      label: `${breakevenRecapturePct.toFixed(0)}% (Break-Even)`,
                    },
                    { value: 50, label: '50% (Stretch)' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setRecaptureRate(preset.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        recaptureRate === preset.value
                          ? 'bg-[#006738] text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Range Input Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={recaptureRate}
                  onChange={(e) => setRecaptureRate(parseFloat(e.target.value))}
                  aria-label="Recapture rate"
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#006738]"
                />
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>0%</span>
                  <span className="text-[#006738] dark:text-emerald-400 font-extrabold text-sm">
                    {recaptureRate.toFixed(1)}% of at-risk equity recaptured
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* Duration correction. This is the single largest overstatement in the
                  original model and it is disclosed rather than buried. */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold">Duration correction applied.</span> Tier 1 balances
                  are 1031 exchange escrow and treasury float, which a statutory 180-day exchange
                  window caps at roughly {assumptions.tier1DurationDays} days on average. Applying
                  an annual margin to transient float overstates revenue. Blended yield is{' '}
                  <span className="font-bold tabular-nums">{formatBps(effectiveYield)}</span>, not
                  the <span className="tabular-nums line-through">{formatBps(statedYield)}</span>{' '}
                  an undiscounted model would show. Break-even sits at{' '}
                  <span className="font-bold tabular-nums">
                    {breakevenRecapturePct.toFixed(1)}%
                  </span>{' '}
                  recapture.
                </p>
              </div>

              {/* Dynamic 4-Column Metric Summary Banner: Unboxed Stat Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <div className="text-[11px] uppercase font-semibold text-slate-400">Retained Liquidity</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {formatUsdCompact(retainedLiquidity)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    of {formatUsdCompact(funnel.atRiskEquity)} at risk
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase font-semibold text-slate-400">Gross Annual Value</div>
                  <div className="text-xl font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums mt-0.5">
                    {formatUsdCompact(grossAnnualValue)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">duration-adjusted NIM + fees</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase font-semibold text-slate-400">Net Annual ROI</div>
                  <div className={`text-xl font-extrabold tabular-nums mt-0.5 ${netRoiColor}`}>
                    {netRoiSign}{formatUsdCompact(Math.abs(netAnnualRoi))} / yr
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">after ($1.25M) run-rate</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase font-semibold text-slate-400">Cost Recovery</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {isFinite(recoveryMonths) ? `${recoveryMonths.toFixed(1)} Months` : '\u2014'}
                  </div>
                  <div className={`text-[11px] font-semibold mt-0.5 ${recoveryLabelColor}`}>{recoveryLabel}</div>
                </div>
              </div>
            </div>

            {/* 2-Column Layer A vs Layer B Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Layer A */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                    Layer A: Commercial Retention Alone
                  </h3>
                  <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 tabular-nums">
                    +${(tier1Nim / 1000000).toFixed(2)}M NIM
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tier 1: {(assumptions.tier1Share * 100).toFixed(0)}% of recaptured liquidity
                  routed into Commercial ICS Sweeps or 1031 Escrow Depositories at{' '}
                  {formatBps(assumptions.tier1Bps)} net NIM &mdash; earned only for the{' '}
                  {assumptions.tier1DurationDays} days the float actually sits.
                </p>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs pt-1">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Equity At Risk (annual)</span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{formatUsdCompact(funnel.atRiskEquity)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Active Recapture Rate</span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{recaptureRate.toFixed(1)}%</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Tier 1 Retained ({(assumptions.tier1Share * 100).toFixed(0)}%)</span>
                    <span className="font-bold text-[#006738] dark:text-emerald-400 tabular-nums">{formatUsdCompact(tier1Liquidity)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Duration Factor</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                      &times;{(assumptions.tier1DurationDays / 365).toFixed(2)} ({assumptions.tier1DurationDays}/365)
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between font-bold text-sm">
                    <span className="text-slate-900 dark:text-white">Net Interest Margin ({formatBps(assumptions.tier1Bps)})</span>
                    <span className="text-[#006738] dark:text-emerald-400 tabular-nums">+${Math.round(tier1Nim).toLocaleString()} / yr</span>
                  </div>
                </div>
              </div>

              {/* Layer B */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                    Layer B: Dual-Sided Wealth Conversion
                  </h3>
                  <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 tabular-nums">
                    +{formatUsdCompact(tier2Fee)} Fee
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tier 2: {((1 - assumptions.tier1Share) * 100).toFixed(0)}% converted into Private
                  Wealth AUM at {formatBps(assumptions.tier2Bps)} with 2x CSA operational leverage
                  (80 &rarr; 95&ndash;100 accounts). Unlike Tier 1 escrow, AUM is sticky and carries
                  a full year.
                </p>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs pt-1">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Retained Base Liquidity</span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{formatUsdCompact(retainedLiquidity)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Wealth Allocation ({((1 - assumptions.tier1Share) * 100).toFixed(0)}%)</span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{formatUsdCompact(tier2Aum)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Advisor Headroom</span>
                    <span className="font-semibold text-[#006738] dark:text-emerald-400">80 &rarr; 95–100 Accounts (2x CSA)</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-bold text-sm">
                    <span className="text-slate-900 dark:text-white">Advisory Fee ({formatBps(assumptions.tier2Bps)})</span>
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
                      ~12,500 multimodal document inferences/yr (&asymp;2,500 liquidity events &times; 5 docs), grounding queries, and embeddings.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Reg 1 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ALTA Pillar 2 &amp; UCC Article 4A
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Bank delivers verified routing packet directly to borrower via DocuSign; borrower submits to title with dual-call telephone verification line.
              </p>
            </div>

            {/* Reg 2 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  GLBA Pre-Ingestion DLP &amp; FCRA &sect; 604
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated Cloud DLP scrubs non-guarantor PII prior to pipeline ingestion. Data quarantined until RM records verbal opt-in.
              </p>
            </div>

            {/* Reg 3 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Channel-Matched Referral Governance
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Non-registered commercial RMs receive deposit FTP credit plus a nominal, non-contingent referral fee only &mdash; zero securities fee-splitting under <strong>FINRA Rule 2040</strong>. The governing regime follows the destination channel:
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1 pl-3">
                <li>
                  &bull; <strong className="text-slate-700 dark:text-slate-300">$3M+ &rarr; Private Bank PWA (SEI):</strong> bank fiduciary activity under <strong>OCC Reg 9 (12 C.F.R. &sect; 9)</strong> and the Exchange Act &sect; 3(a)(4)(B)(ii) trust exception (Reg R Rule 721). Reg BI does not apply.
                </li>
                <li>
                  &bull; <strong className="text-slate-700 dark:text-slate-300">Sub-$3M &rarr; Centralized Wealth Hub (HFA / Ameriprise):</strong> retail brokerage under <strong>Reg BI</strong> and FINRA 2111, with Ameriprise as supervising broker-dealer. RM referral governed by Reg R Rule 700.
                </li>
              </ul>
            </div>


            {/* Reg 4 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  IRC &sect; 1031 Safe Harbor (Treas. Reg. 1.1031)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Bank acts strictly as Qualified Escrow Depository while programmatically firewalling in-house DST securities placement during 180-day window.
              </p>
            </div>

            {/* Reg 5 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  OCC Bulletin 2011-12 / SR 11-7 (Tier 3)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Designated as internal triage heuristic and administrative drafting, not automated appraisal or underwriting. Client valuation muzzled.
              </p>
            </div>

            {/* Reg 6 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  SEI Wealth Platform &amp; SEI Data Cloud
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Huntington Private Bank integration via SEI Data Cloud (Snowflake Secure Data Sharing Zero-ETL) directly into Private Bank IPS modeling.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

