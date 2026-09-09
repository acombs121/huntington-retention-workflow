import React, { useState, useEffect } from 'react';
import { Settings, X, ExternalLink, Palette, FileText, Layers, Server, ShieldCheck, Cpu, User, RefreshCw, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';

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
  overviewUrl?: string;
  citationsUrl?: string;
  onViewExecutive?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  appName = 'Huntington Horizon',
  brandKitUrl = '/brand_kit.html',
  demoScriptUrl = '/demo_script.html',
  overviewUrl = '/overview.html',
  citationsUrl = '/citations.html',
  onViewExecutive,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
                      href={overviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#006738] dark:hover:border-[#006738] bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white dark:bg-slate-700 text-[#006738] shadow-sm">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">Overview</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Standalone single-page executive overview</div>
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

                {/* Section 2: Live Platform Telemetry */}
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

                {/* Section 3: User Identity */}
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
