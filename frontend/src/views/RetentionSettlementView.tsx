import React, { useState } from 'react';
import { ValuationData, QuarantineState, WireInstructionData } from '../types';
import {
  Sliders,
  Landmark,
  Building,
  Lock,
  Unlock,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

interface RetentionSettlementViewProps {
  valuation: ValuationData;
  onSalePriceChange: (price: number) => void;
  taxStrategy: 'cash_out' | '1031_exchange';
  onTaxStrategyChange: (strategy: 'cash_out' | '1031_exchange') => void;
  quarantineState: QuarantineState;
  onToggleQuarantine: () => void;
  wireInstructions: WireInstructionData;
  onBackToAnalysis: () => void;
  onHandoffToWealth: () => void;
  isTogglingConsent?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export const RetentionSettlementView: React.FC<RetentionSettlementViewProps> = ({
  valuation,
  onSalePriceChange,
  taxStrategy,
  onTaxStrategyChange,
  quarantineState,
  onToggleQuarantine,
  wireInstructions,
  onBackToAnalysis,
  onHandoffToWealth,
  isTogglingConsent = false,
  error = null,
  onClearError,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCallScript, setShowCallScript] = useState(false);

  const baseValuation =
    valuation.grounded_noi > 0 && valuation.grounded_cap_rate > 0
      ? valuation.grounded_noi / valuation.grounded_cap_rate
      : valuation.sale_price;
  const minSlider = Math.max(500000, Math.round((baseValuation * 0.85) / 50000) * 50000);
  const maxSlider = Math.round((baseValuation * 1.15) / 50000) * 50000;
  const midSlider = Math.round((minSlider + maxSlider) / 2 / 50000) * 50000;

  const handleCopy = () => {
    const text = `THE HUNTINGTON NATIONAL BANK - BORROWER SETTLEMENT ROUTING PACKET
DocuSign Envelope ID: ${wireInstructions.docusign_envelope_id || 'ENV-HBAN-20260904-8821'}
ALTA Pillar 2 Callback Authentication Line: ${wireInstructions.callback_verification_line || '(614) 480-4401 (Direct Banker Authentication Line)'}

Bank: ${wireInstructions.bank_name}
ABA Routing: ${wireInstructions.aba_routing}
Account Title: ${wireInstructions.account_title}
Account Number: ${wireInstructions.account_number}
Escrow File: ${wireInstructions.escrow_file}
Net Disbursement: $${valuation.net_equity_proceeds.toLocaleString()}
Special Instructions: ${wireInstructions.special_instructions}
Authorized Banker: ${wireInstructions.officer_signature}`;
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.warn('Clipboard write failed:', err);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Breadcrumb & Navigation Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-10">
        <button
          onClick={onBackToAnalysis}
          className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Deal Analysis</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#006738] dark:text-emerald-400 block">
              Commercial Banking &bull; Treasury &amp; Settlement Operations
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Liquidity Retention &amp; Settlement
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800">
                Proceeds: ${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              Configure deposit retention structures, generate borrower DocuSign routing packets with official bank verification letters, and record client consent.
            </p>
          </div>

          {/* Talk Track Quick Access */}
          <div className="pt-2 lg:pt-0">
            <button
              onClick={() => setShowCallScript(!showCallScript)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#006738]" />
              <span>{showCallScript ? 'Hide Relationship Call Guide' : 'View Relationship Call Guide'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm flex items-center justify-between shadow-sm">
          <span>{error}</span>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 hover:underline ml-4"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Optional Collapsible RM Call Script */}
      {showCallScript && (
        <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm">
            <span className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-[#006738]" />
              Commercial RM Client Call Guide ({wireInstructions?.officer_signature?.split(',')[0] || 'Relationship Manager'} to {wireInstructions?.managing_member || 'Client'})
            </span>
            <span className="text-xs uppercase font-semibold text-slate-400">Horizon 2.0 Consultative Script</span>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>1. Acknowledge Closing:</strong> &quot;{wireInstructions?.managing_member?.split(' ')[0] || 'Client'}, congratulations on going into escrow on {wireInstructions?.property?.split(',')[0] || 'the property'}. We received the payoff demand from {wireInstructions?.attention?.split(',')[0] || 'the settlement officer'} at {wireInstructions?.title_company || 'Title'}.&quot;
            </p>
            <p>
              <strong>2. Protect Net Proceeds (${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M) &amp; Borrower Routing:</strong> &quot;Rather than letting your ~${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M in net equity sit in a standard escrow checking account, we have pre-staged our {taxStrategy === '1031_exchange' ? 'Huntington 1031 Qualified Escrow Depository partnered with IPX1031' : 'Huntington Business Premier ICS Sweep'}. That gives you {valuation.yield_apy}% APY with multi-million FDIC passthrough protection. I am sending our verified Settlement Account Routing Packet directly to you via DocuSign so you can authorize Title, with our official bank verification letter attached for their telephone callback authentication.&quot;
            </p>
            <p>
              <strong>3. Secure Verbal Consent (GLBA Barrier &amp; Ameriprise Reg R):</strong> &quot;To coordinate smoothly with our Private Wealth group so you don&apos;t have to re-submit financial statements, do I have your permission to share your entity structure with Sarah Jenkins on our Wealth team?&quot;
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Staging Layout with Generous Whitespace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Financial Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Card 1: Dynamic Sale Price Slider */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#006738]" />
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                    Indicative Valuation Slider
                  </h2>
                  <span className="text-[11px] text-slate-400 block font-normal">
                    (Internal Triage Heuristic &mdash; Do Not Assert to Client)
                  </span>
                </div>
              </div>
              <span className="text-base font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                ${(valuation.sale_price / 1000000).toFixed(2)}M
              </span>
            </div>

            <input
              type="range"
              min={minSlider}
              max={maxSlider}
              step={25000}
              value={valuation.sale_price}
              onChange={(e) => onSalePriceChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#006738]"
            />

            <div className="flex justify-between text-xs text-slate-400">
              <span>${(minSlider / 1000000).toFixed(2)}M (Conservative)</span>
              <span>${(midSlider / 1000000).toFixed(2)}M</span>
              <span>${(maxSlider / 1000000).toFixed(2)}M (Premium)</span>
            </div>

            {/* Instant Math Breakdown */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Existing Debt</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                  ${(valuation.debt_payoff / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Closing Costs</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                  ${(valuation.estimated_closing_costs / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#E8F5E9]/60 dark:bg-emerald-950/40 border border-[#A7F3D0] dark:border-emerald-800">
                <span className="text-xs text-[#006738] dark:text-emerald-300 uppercase font-bold block mb-1">
                  Net Seller Equity
                </span>
                <span className="font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums text-sm">
                  ${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Strategy Fork (Business Premier ICS vs 1031 Escrow) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                Retention Strategy Fork
              </h2>
              <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 uppercase tracking-wider">
                Yield: {valuation.yield_apy}% APY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Path A */}
              <button
                onClick={() => onTaxStrategyChange('cash_out')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  taxStrategy === 'cash_out'
                    ? 'border-[#006738] bg-[#E8F5E9]/50 dark:bg-emerald-950/20 shadow-sm ring-1 ring-[#006738]'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Path A: Cash-Out</span>
                    <Landmark className="w-4 h-4 text-[#006738]" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Taxable Commercial Retention
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#006738] dark:text-emerald-400 font-bold">
                  Business Premier ICS (4.85% APY)
                </div>
              </button>

              {/* Path B */}
              <button
                onClick={() => onTaxStrategyChange('1031_exchange')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  taxStrategy === '1031_exchange'
                    ? 'border-[#006738] bg-[#E8F5E9]/50 dark:bg-emerald-950/20 shadow-sm ring-1 ring-[#006738]'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Path B: 1031 Exchange</span>
                    <Building className="w-4 h-4 text-[#006738]" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Independent Partner QI Network
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#006738] dark:text-emerald-400 font-bold">
                  1031 QI Escrow (4.75% APY)
                </div>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  {valuation.strategy_product}
                </span>
                {taxStrategy === '1031_exchange' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-300 border border-emerald-300">
                    IPX1031 Partnered
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {valuation.statutory_basis}
              </p>
              {taxStrategy === '1031_exchange' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-amber-800 dark:text-amber-300">
                  <strong>Treas. Reg. &sect; 1.1031(k)-1(k) Anti-Disqualification Firewall:</strong> In-house DST placement and private wealth securities cross-selling are programmatically blocked during the 180-day window to preserve the routine banking safe harbor.
                </div>
              )}
            </div>
          </div>

          {/* Card 3: GLBA Verbal Consent Gate & Ameriprise Regulation R */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                  GLBA Privacy Gate &amp; Ameriprise Barrier
                </h2>
                <span className="text-[11px] text-slate-400 block font-medium">
                  15 U.S.C. &sect; 6801 &bull; SEC Regulation R Networking Arrangement
                </span>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${quarantineState.quarantined ? 'text-slate-500' : 'text-[#006738]'}`}>
                {quarantineState.quarantined ? 'Quarantined' : 'Verified'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Because Huntington Advisors operates on Ameriprise Financial's platform, the retail broker-dealer is legally a non-affiliated third party. Commercial credit data cannot transfer without affirmative verbal consent. Commercial RM receives 100% hard-dollar commercial deposit FTP credit (zero securities fee splitting under FINRA Rule 2040).
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {quarantineState.quarantined ? (
                  <Lock className="w-5 h-5 text-slate-500" />
                ) : (
                  <Unlock className="w-5 h-5 text-[#006738]" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {quarantineState.quarantined ? 'Awaiting Client Consent' : 'Client Consent Recorded'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {quarantineState.consent_timestamp ? `Logged: ${new Date(quarantineState.consent_timestamp).toLocaleTimeString()}` : 'Recorded by Greg Miller'}
                  </div>
                </div>
              </div>

              <button
                onClick={onToggleQuarantine}
                disabled={isTogglingConsent}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  quarantineState.quarantined
                    ? 'bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                }`}
              >
                {isTogglingConsent
                  ? 'Recording...'
                  : quarantineState.quarantined
                    ? 'Record Client Opt-In'
                    : 'Reset Gate'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Borrower Settlement Routing Packet & Bank Verification Letter (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          
          {/* Letter Toolbar */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-[#006738]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Borrower Settlement Routing Packet
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  DocuSign Envelope &bull; ALTA Pillar 2 Bank Verification Letter
                </span>
              </div>
            </div>
            
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#006738]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Packet'}</span>
            </button>
          </div>

          {/* Letterhead & Official Text */}
          <div className="p-8 text-xs space-y-5 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 select-text leading-relaxed">
            
            {/* ALTA Pillar 2 Compliance Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-[#A7F3D0] dark:border-emerald-800 text-[11px] text-[#004724] dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>ALTA Pillar 2 &amp; UCC Article 4A Execution Standard</span>
                <span className="font-mono text-[10px] bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300">
                  {wireInstructions.docusign_envelope_id || 'ENV-HBAN-20260904-8821'}
                </span>
              </div>
              <p>
                Lenders lack legal standing over net seller proceeds. This routing packet is delivered directly to the borrower via DocuSign to execute as the official Seller Closing Authorization to Title, accompanied by our verified Account Verification Letter for title telephone callback.
              </p>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="text-base font-extrabold tracking-widest text-[#006738] uppercase">
                THE HUNTINGTON NATIONAL BANK
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Commercial Capital Markets &bull; Settlement Operations &bull; 17 S. High St., Columbus, OH 43215
              </div>
            </div>

            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>Date: {wireInstructions.date}</span>
              <span>Packet Ref: {wireInstructions.letter_id}</span>
            </div>

            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm">{wireInstructions.title_company}</div>
              <div className="text-slate-500 dark:text-slate-400">{wireInstructions.title_address}</div>
              <div className="text-slate-500 dark:text-slate-400">Attn: {wireInstructions.attention}</div>
              <div className="text-slate-500 dark:text-slate-400">Escrow File No: {wireInstructions.escrow_file}</div>
            </div>

            <p>
              Regarding the closing and disposition of <strong>{wireInstructions.property}</strong> by{' '}
              <strong>{wireInstructions.seller_entity}</strong> ({wireInstructions.managing_member}):
            </p>

            {/* Wire Table */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Receiving Depository:</span>
                <span className="font-bold text-slate-900 dark:text-white">{wireInstructions.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">ABA / Routing:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{wireInstructions.aba_routing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account Title:</span>
                <span className="font-bold text-[#006738] dark:text-emerald-400">{wireInstructions.account_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account Number:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{wireInstructions.account_number}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Net Equity Disbursement:</span>
                <span className="font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                  ${valuation.net_equity_proceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#E8F5E9]/50 dark:bg-emerald-950/30 border border-[#A7F3D0] dark:border-emerald-800 text-xs text-[#004724] dark:text-emerald-200">
              <strong>Special Instructions:</strong> {wireInstructions.special_instructions}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div>Authorized Banker: <strong>{wireInstructions.officer_signature}</strong></div>
              <div>Title Callback Authentication Line: <strong>{wireInstructions.callback_verification_line || '(614) 480-4401 (Direct Banker Authentication Line)'}</strong></div>
              <div className="text-[11px] text-slate-400 mt-1">Official Huntington Bank Account Verification Letter attached to DocuSign envelope for title escrow callback validation.</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Dual-Sided Handoff Banner */}
      {!quarantineState.quarantined && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#E8F5E9]/70 dark:bg-emerald-950/40 border border-[#A7F3D0] dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#006738] text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-base font-bold text-slate-900 dark:text-white">
                Client Verbal Consent Verified (GLBA Sec. 502(e))
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {wireInstructions?.managing_member || 'The commercial client'} has authorized Private Wealth engagement. Pre-verified KYC documentation and custodial onboarding shell are ready for wealth advisory intake.
              </p>
            </div>
          </div>

          <button
            onClick={onHandoffToWealth}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm transition active:scale-[0.98] whitespace-nowrap self-start sm:self-auto"
          >
            <span>Proceed to Private Wealth Intake (Sarah Jenkins)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
