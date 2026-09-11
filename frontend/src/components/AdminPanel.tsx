import React, { useState, useEffect } from 'react';
import { Settings, X, ExternalLink, Palette, FileText, Server, ShieldCheck, Cpu, User, RefreshCw, CheckCircle2, TrendingUp, ArrowRight, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useAssumptions } from '../context/AssumptionsContext';
import {
  ASSUMPTION_META,
  DEFAULT_ASSUMPTIONS,
  NumericAssumptionKey,
  Provenance,
  computeRoi,
  formatAssumption,
  formatBps,
  formatUsdCompact,
} from '../lib/assumptions';

interface SystemHealth {
  status: string;
  project?: string;
  model?: string;
  platform?: string;
  version?: string;
}

interface UserProfile {
  email?: string;
  hd?: string;
  sub?: string;
}

export interface AdminPanelProps {
  appName?: string;
  brandKitUrl?: string;
  demoScriptUrl?: string;
  citationsUrl?: string;
  onViewExecutive?: () => void;
}

const PROVENANCE_STYLES: Record<Provenance, { label: string; className: string }> = {
  verified: {
    label: 'Verified',
    className:
      'bg-[#E8F5E9] text-[#006738] border-[#A7F3D0] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  derived: {
    label: 'Derived',
    className:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900',
  },
  estimate: {
    label: 'Estimate',
    className:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
  },
};

interface AssumptionDialProps {
  assumptionKey: NumericAssumptionKey;
  value: number;
  onChange: (value: number) => void;
  isDefault: boolean;
}

/**
 * One slider per model input. The provenance badge and the source tooltip are the
 * point of this control: an executive can see at a glance which numbers came from
 * Huntington's own filings and which are our judgement, and move the latter live.
 */
const AssumptionDial: React.FC<AssumptionDialProps> = ({
  assumptionKey,
  value,
  onChange,
  isDefault,
}) => {
  const meta = ASSUMPTION_META[assumptionKey];
  const badge = PROVENANCE_STYLES[meta.provenance];

  return (
    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
            {meta.label}
          </div>
          <span
            className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}
            title={meta.source}
          >
            {badge.label}
          </span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">
            {formatAssumption(assumptionKey, value)}
          </div>
          {!isDefault && (
            <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              overridden
            </div>
          )}
        </div>
      </div>
      <input
        type="range"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={meta.label}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#006738]"
      />
    </div>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  appName = 'Huntington Horizon',
  brandKitUrl = '/brand_kit.html',
  demoScriptUrl = '/demo_script.html',
  citationsUrl = '/citations.html',
  onViewExecutive,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    assumptions,
    setAssumption,
    setNumericAssumption,
    reset,
    isModified,
    funnel,
    capacity,
    statedYield,
    effectiveYield,
  } = useAssumptions();

  // Break-even is independent of the recapture rate, so any probe value works here.
  const { breakevenRecapturePct } = computeRoi(assumptions, 10);

  const dialOrder: NumericAssumptionKey[] = [
    'turnover',
    'saleShare',
    'equityRatio',
    'flightRate',
    'tier1DurationDays',
    'tier1Share',
    'tier1Bps',
    'tier2Bps',
    'avgLoanSize',
    'hoursSavedPerEvent',
  ];

  // Fetch runtime diagnostics when the admin panel opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      fetch('/api/health').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/user').then((res) => (res.ok ? res.json() : null)),
    ]).then(([healthRes, userRes]) => {
      if (!isMounted) return;
      if (healthRes.status === 'fulfilled' && healthRes.value) {
        setHealth(healthRes.value);
      }
      if (userRes.status === 'fulfilled' && userRes.value) {
        setUser(userRes.value);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle ESC key to dismiss panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* 1. Small Gear Icon Trigger (Place on the far right of the top navigation bar) */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Open Admin Panel"
        title="Admin Panel &amp; Telemetry"
      >
        <Settings className="w-4 h-4 transition-transform duration-200 hover:rotate-45" />
      </button>

      {/* 2. Slide-Over Drawer and Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#006738] animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                      Admin Panel
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {appName} - Telemetry and Quick Links
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                {/* Section 1: Quick Links */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-3">
                    Reference Materials
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <a
                      href={brandKitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#006738] dark:hover:border-[#006738] bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white dark:bg-slate-700 text-[#006738] shadow-sm">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">Brand Kit</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Design tokens and component preview</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#006738] transition" />
                    </a>

                    <a
                      href={demoScriptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#006738] dark:hover:border-[#006738] bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white dark:bg-slate-700 text-[#006738] shadow-sm">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">Workflow &amp; Operating Guide</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Standard operating procedures &amp; banking workflows</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#006738] transition" />
                    </a>

                    <a
                      href={citationsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#006738] dark:hover:border-[#006738] bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white dark:bg-slate-700 text-[#006738] shadow-sm">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">Citations &amp; Evidence</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Verified SEC filings, statutory safe harbors &amp; benchmarks</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#006738] transition" />
                    </a>

                    {onViewExecutive && (
                      <button
                        onClick={() => {
                          onViewExecutive();
                          setIsOpen(false);
                        }}
                        className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#006738] dark:hover:border-[#006738] bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-white dark:bg-slate-700 text-[#006738] shadow-sm">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">Executive Analytics &amp; Sensitivity</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">ROI model, $1.25M run-rate defense &amp; CRO matrix</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006738] transition" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 2: Business Case Assumptions
                    These dials exist so the business case can be interrogated live in the
                    room rather than defended from a static slide. Every figure in Executive
                    Analytics reads from this same model. */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Business Case Assumptions
                    </h3>
                    <button
                      onClick={reset}
                      disabled={!isModified}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#006738] dark:hover:text-emerald-400 disabled:opacity-40 disabled:hover:text-slate-500 transition"
                      title="Restore every dial to the documented default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>

                  {/* Verified denominator. Not adjustable: it comes from the filings. */}
                  <div className="p-3 rounded-lg border border-[#A7F3D0] dark:border-emerald-900 bg-[#E8F5E9]/60 dark:bg-emerald-950/30 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          Target Loan Book
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Q2 2026 10-Q Table 8, net of the small-business tranche
                        </div>
                      </div>
                      <div className="text-sm font-extrabold tabular-nums text-[#006738] dark:text-emerald-400">
                        {formatUsdCompact(funnel.targetBook)}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[#A7F3D0]/60 dark:border-emerald-900/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assumptions.includeOwnerOccupied}
                        onChange={(e) => setAssumption('includeOwnerOccupied', e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-[#006738] cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        Include owner-occupied CRE ($13.3B, booked inside C&amp;I per Call Report
                        RC-C Part I)
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    {dialOrder.map((key) => (
                      <AssumptionDial
                        key={key}
                        assumptionKey={key}
                        value={assumptions[key] as number}
                        onChange={(v) => setNumericAssumption(key, v)}
                        isDefault={assumptions[key] === DEFAULT_ASSUMPTIONS[key]}
                      />
                    ))}
                  </div>

                  {/* Live consequence of the dials above */}
                  <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-2">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Resulting Model
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Equity at risk / yr</span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatUsdCompact(funnel.atRiskEquity)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Blended yield (duration-adj.)
                      </span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatBps(effectiveYield)}
                        <span className="font-normal text-slate-400">
                          {' '}
                          vs {formatBps(statedYield)}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Break-even recapture
                      </span>
                      <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">
                        {isFinite(breakevenRecapturePct)
                          ? `${breakevenRecapturePct.toFixed(1)}%`
                          : 'unreachable'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">
                        Capacity value ({capacity.low.fteEquivalent.toFixed(1)}&ndash;
                        {capacity.high.fteEquivalent.toFixed(1)} FTE)
                      </span>
                      <span className="font-bold tabular-nums text-[#006738] dark:text-emerald-400">
                        {formatUsdCompact(capacity.low.annualValue)}&ndash;
                        {formatUsdCompact(capacity.high.annualValue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Live Platform Telemetry */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
                      Diagnostic Telemetry
                    </h3>
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                  </div>

                  <div className="space-y-2">
                    {/* AI Platform */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Cpu className="w-4 h-4 text-[#006738]" />
                        <span className="text-xs font-medium">AI Platform</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Gemini Enterprise Agent Platform
                      </span>
                    </div>

                    {/* Model Baseline */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Server className="w-4 h-4 text-[#006738]" />
                        <span className="text-xs font-medium">Model Baseline</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#006738] dark:bg-emerald-950/60 dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800">
                        {health?.model || 'gemini-3.7-flash'}
                      </span>
                    </div>

                    {/* GCP Project */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Server className="w-4 h-4 text-[#006738]" />
                        <span className="text-xs font-medium">GCP Project</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {health?.project || 'hban-wealth-innovation'}
                      </span>
                    </div>

                    {/* Cloud Run Native IAP Status */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-[#006738]" />
                        <span className="text-xs font-medium">Cloud Run IAP</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006738] dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active Direct
                      </span>
                    </div>

                    {/* Runtime Service Account */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-medium">Runtime SA</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        huntington-horizon-sa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 4: User Identity */}
                {user?.email && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-3">
                      Authenticated Principal
                    </h3>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                      <div className="text-xs font-medium text-slate-900 dark:text-white break-all">
                        {user.email}
                      </div>
                      {user.hd && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Hosted Domain: {user.hd}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold tracking-wider uppercase text-[11px]">HBAN-HORIZON-V5.2</span>
                <span>Enterprise Banking Platform</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
