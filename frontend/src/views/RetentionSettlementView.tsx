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
}) => {
  const [copied, setCopied] = useState(false);
  const [showCallScript, setShowCallScript] = useState(false);

  const handleCopy = () => {
    const text = `HUNTINGTON NATIONAL BANK - SETTLEMENT WIRE INSTRUCTIONS
Bank: ${wireInstructions.bank_name}
ABA Routing: ${wireInstructions.aba_routing}
Account Title: ${wireInstructions.account_title}
Account Number: ${wireInstructions.account_number}
Escrow File: ${wireInstructions.escrow_file}
Net Disbursement: $${valuation.net_equity_proceeds.toLocaleString()}
Special Instructions: ${wireInstructions.special_instructions}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              Configure deposit retention structures, generate Title Company wire instruction letters, and record client consent.
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

      {/* Optional Collapsible RM Call Script */}
      {showCallScript && (
        <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm">
            <span className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-[#006738]" />
              Commercial RM Client Call Guide (Greg Miller to Marcus Vance)
            </span>
            <span className="text-xs uppercase font-semibold text-slate-400">Relationship Touchpoint</span>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>1. Acknowledge Closing:</strong> &quot;Marcus, congratulations on going into escrow on the Riverfront Commons property. We just received the payoff demand from Karen at First American Title.&quot;
            </p>
            <p>
              <strong>2. Protect Net Proceeds ($3.28M):</strong> &quot;Rather than letting your ~$3.28M in net equity sit in a standard escrow checking account, we have pre-staged our {taxStrategy === '1031_exchange' ? 'Huntington 1031 Qualified Escrow Depository' : 'Huntington Commercial Max$aver ICS Sweep'}. That gives you {valuation.yield_apy}% APY with multi-million FDIC passthrough protection.&quot;
            </p>
            <p>
              <strong>3. Secure Verbal Consent (GLBA Gate):</strong> &quot;To coordinate smoothly with our Private Wealth group so you don&apos;t have to re-submit financial statements, do I have your permission to share your entity structure with Sarah Jenkins on our Wealth team?&quot;
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
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                  Indicative Valuation Slider
                </h2>
              </div>
              <span className="text-base font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                ${(valuation.sale_price / 1000000).toFixed(2)}M
              </span>
            </div>

            <input
              type="range"
              min="8500000"
              max="9000000"
              step="50000"
              value={valuation.sale_price}
              onChange={(e) => onSalePriceChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#006738]"
            />

            <div className="flex justify-between text-xs text-slate-400">
              <span>$8.50M (Base Cap Rate)</span>
              <span>$8.75M</span>
              <span>$9.00M (Premium)</span>
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

          {/* Card 2: Strategy Fork (Max$aver vs 1031 Escrow) */}
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
                    Taxable Disposition
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#006738] dark:text-emerald-400 font-bold">
                  Max$aver ICS (4.85% APY)
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
                    Tax-Deferred Safe Harbor
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#006738] dark:text-emerald-400 font-bold">
                  1031 QI Escrow (4.75% APY)
                </div>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                {valuation.strategy_product}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {valuation.statutory_basis}
              </p>
            </div>
          </div>

          {/* Card 3: GLBA Verbal Consent Gate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                GLBA Consent Barrier (15 U.S.C. Sec. 6801)
              </h2>
              <span className={`text-xs font-bold uppercase tracking-wider ${quarantineState.quarantined ? 'text-slate-500' : 'text-[#006738]'}`}>
                {quarantineState.quarantined ? 'Quarantined' : 'Verified'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Customer privacy regulations prohibit automatic data transfer between commercial credit files and private wealth advisory without affirmative verbal consent.
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
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition ${
                  quarantineState.quarantined
                    ? 'bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                }`}
              >
                {quarantineState.quarantined ? 'Record Client Opt-In' : 'Reset Gate'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Title Wire Instruction Letter (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          
          {/* Letter Toolbar */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-[#006738]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Official Title Wire Instruction Letter
              </h3>
            </div>
            
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition text-slate-700 dark:text-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#006738]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Letter'}</span>
            </button>
          </div>

          {/* Letterhead & Official Text */}
          <div className="p-8 text-xs space-y-5 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 select-text leading-relaxed">
            
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="text-base font-extrabold tracking-widest text-[#006738] uppercase">
                THE HUNTINGTON NATIONAL BANK
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Commercial Real Estate Capital Services &bull; 17 S. High St., Columbus, OH 43215
              </div>
            </div>

            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>Date: {wireInstructions.date}</span>
              <span>Ref: {wireInstructions.letter_id}</span>
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
                <span className="text-slate-500 dark:text-slate-400">Receiving Bank:</span>
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

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>Authorized Signatory: <strong>{wireInstructions.officer_signature}</strong></div>
              <div>Contact: {wireInstructions.officer_contact}</div>
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
                Marcus Vance has authorized Private Wealth engagement. Pre-verified KYC documentation and custodial onboarding shell are ready for wealth advisory intake.
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
