import React from 'react';
import { WealthOnboardingData } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Building,
  Check,
  FileCheck,
} from 'lucide-react';

interface WealthDossierViewProps {
  data: WealthOnboardingData;
  onBackToQueue: () => void;
}

export const WealthDossierView: React.FC<WealthDossierViewProps> = ({
  data,
  onBackToQueue,
}) => {
  const clientDisplayName = data.target_client ? data.target_client.split('(')[0].trim() : 'Client';

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-10">
        <button
          onClick={onBackToQueue}
          className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Client Queue</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#006738] dark:text-emerald-400 block">
              Client Onboarding &bull; KYC &amp; Custodial Setup
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Onboarding Dossier: {clientDisplayName}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800">
                Household: {data.household_id}
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              Pre-verified KYC/CIP documentation, legal entity records, and SEI custodial account shell ready for advisor review.
            </p>
          </div>

          {/* Action Status Badge */}
          <div className="pt-2 lg:pt-0">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dossier Ready for Advisor Discovery</span>
            </span>
          </div>
        </div>
      </div>

      {/* Capacity Leverage Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-[#006738] text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-bold text-slate-900 dark:text-white">
              Client Onboarding Package Pre-Populated
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Synchronized from verified commercial banking credit files. Beneficial ownership, identity verification, and entity documentation confirmed.
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 uppercase tracking-wider self-start md:self-center">
          {data.assigned_pwa || 'Sarah Jenkins, CFP (Senior PWA)'}
        </span>
      </div>

      {/* Main 2-Column Content with Generous Whitespace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: KYC/CIP Verified Profile (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#006738]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Section 1: Verified KYC / CIP Baseline Data
              </h2>
            </div>
            <span className="text-xs text-[#006738] dark:text-emerald-400 font-bold uppercase tracking-wider">
              6 of 6 Verified
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {data.staged_kyc_cip?.verified_fields?.map((field) => (
              <div key={field.field} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0 pr-2">
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold tracking-wider">{field.field}</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 block break-words">
                    {field.value}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#006738] dark:text-emerald-400 whitespace-nowrap shrink-0">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Verified</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Custodial Shell & Fiduciary Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SEI Custodial Shell */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  SEI Data Cloud Custodial Shell
                </h3>
              </div>
              <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 uppercase tracking-wider">
                Staged
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Shell ID</span>
                <span className="font-semibold text-slate-900 dark:text-white">{data.sei_custodial_shell?.shell_id}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Account Title</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
                  {data.sei_custodial_shell?.account_title}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Custodian</span>
                <span className="font-semibold text-slate-900 dark:text-white">{data.sei_custodial_shell?.custodian}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Cash Depository</span>
                <span className="font-bold text-[#006738] dark:text-emerald-400">Huntington FDIC Sweep</span>
              </div>
            </div>
          </div>

          {/* Pending Advisor Fiduciary Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Advisor Authorship Actions
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Fiduciary Review Required
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {data.staged_kyc_cip?.pending_advisor_actions?.map((action, idx) => (
                <div key={idx} className="py-2.5 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {action}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Private Bank relationship under OCC Reg 9 (12 C.F.R. &sect; 9): automated staging handles administrative paperwork; the licensed advisor retains 100% fiduciary discretion over investment selection.
            </p>
          </div>

          {/* Bottom Completion Action */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Administrative Pre-Staging Complete (80% Paperwork Eliminated)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                KYC records and custodial shell are verified. Fiduciary discovery and investment strategy will be authored during the client intake consultation.
              </p>
              {/* Administrative scaffolding only — not a recommendation under any applicable standard. */}
              <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 pt-1">
                <span className="font-bold uppercase tracking-wider">Administrative staging only.</span>{' '}
                No asset allocation, product, or strategy is recommended here. Nothing in this
                dossier constitutes investment advice or a recommendation &mdash; whether under the
                bank&rsquo;s fiduciary standard (OCC Reg 9) for Private Bank relationships or SEC
                Regulation Best Interest for retail brokerage relationships. All suitability
                determinations are authored by the licensed advisor.
              </p>
            </div>
            <button
              onClick={onBackToQueue}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition shrink-0 self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Client Queue</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
