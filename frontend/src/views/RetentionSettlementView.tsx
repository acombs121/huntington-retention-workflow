import React, { useState } from 'react';
import { ValuationData, QuarantineState, WireInstructionData, PayoffItem } from '../types';
import { StaleRecordNotice } from '../components/StaleRecordNotice';
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
  CheckCircle2,
  FileCheck,
  Phone,
  AlertTriangle,
} from 'lucide-react';

/**
 * The suggested talk track for the consultative call.
 *
 * Two rules govern the wording. First, no figure from this screen appears in
 * it: the valuation is an internal relationship-sizing estimate, not an
 * appraisal, and asserting it to the borrower would turn a triage number into
 * something that looks like a bank opinion of value. Second, the wealth
 * introduction is offered after closing and only as a question -- pitching
 * advisory services to a sponsor days from settlement is the behaviour the
 * whole consent gate exists to prevent.
 */
const CALL_SCRIPT: { beat: string; line: string }[] = [
  {
    beat: 'Open — name the reason, plainly',
    line:
      "Marcus, it's Greg Miller at Huntington. The payoff quote request came across my desk on the " +
      'Riverfront Commons facility, so it looks like you have the property under contract. ' +
      'Congratulations. I wanted to get ahead of the closing mechanics with you rather than have ' +
      'them land on you the week of settlement.',
  },
  {
    beat: 'Offer closing safety — not a product pitch',
    line:
      'The piece I want to make easy is where your net proceeds actually sit on settlement day. ' +
      'We can have a Business Premier account with Insured Cash Sweep open and ready before you ' +
      'close, so the funds land in an account titled to your LLC with FDIC passthrough across the ' +
      'IntraFi network — currently 4.85% APY. Nothing sits uninsured over a weekend.',
  },
  {
    beat: 'Hand control to the client — the bank never instructs title',
    line:
      "If that's useful, I'll send the routing packet to you by DocuSign — to you, not to First " +
      'American. You execute it and submit it as your own seller closing authorization. We include ' +
      "Huntington's bank verification letter and a direct callback line so their escrow officer " +
      'can verify it independently before they move a dollar.',
  },
  {
    beat: 'The introduction — after closing, and only if he opens the door',
    line:
      "Last thing, and only if it's helpful. Once you're through closing and you know what you're " +
      'doing with the proceeds, I can introduce you to one of our wealth advisors. No need to ' +
      "decide anything now — I'd rather do it after settlement. Would you like me to make that " +
      'introduction?',
  },
];

/** Things that turn a good call into a finding. */
const CALL_GUARDRAILS: string[] = [
  'Do not quote a property value or a net-proceeds figure. The number on this screen is an internal triage estimate, not an appraisal or an underwriting opinion.',
  'Do not name co-investors, guarantors, or other principals surfaced by entity resolution.',
  'Do not condition payoff terms, pricing, or an extension on where the proceeds land — anti-tying, 12 U.S.C. § 1972.',
  'Do not present the wealth introduction as a requirement, and do not schedule it before closing.',
];

interface RetentionSettlementViewProps {
  deal?: PayoffItem;
  valuation: ValuationData;
  /** Valuation / settlement packet in state belong to a different deal. */
  isDealDataStale?: boolean;
  onSalePriceChange: (price: number) => void;
  taxStrategy: 'cash_out' | '1031_exchange';
  onTaxStrategyChange: (strategy: 'cash_out' | '1031_exchange') => void;
  quarantineState: QuarantineState;
  onToggleQuarantine: () => void;
  /** Gate 1. Records the consultative call that authorises everything below it. */
  onLogConsultativeCall: (clientDirectedProceeds?: boolean) => void;
  wireInstructions: WireInstructionData;
  onBackToAnalysis: () => void;
  onProceedToAdvisorRouting: () => void;
  isTogglingConsent?: boolean;
  isLoggingCall?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export const RetentionSettlementView: React.FC<RetentionSettlementViewProps> = ({
  deal,
  valuation,
  isDealDataStale = false,
  onSalePriceChange,
  taxStrategy,
  onTaxStrategyChange,
  quarantineState,
  onToggleQuarantine,
  onLogConsultativeCall,
  wireInstructions,
  onBackToAnalysis,
  onProceedToAdvisorRouting,
  isTogglingConsent = false,
  isLoggingCall = false,
  error = null,
  onClearError,
}) => {
  const [copied, setCopied] = useState(false);

  // Gate 1. Everything client-facing on this screen hangs off it.
  const callLogged = quarantineState.call_logged === true;
  const clientDirected = quarantineState.client_directed_proceeds === true;
  // The packet names the client's entity and an account title, so it may only
  // exist once the client has actually asked for it on the call.
  const packetUnlocked = callLogged && clientDirected;
  const borrowerName = wireInstructions?.managing_member || 'the borrower';

  const baseValuation =
    valuation.grounded_noi > 0 && valuation.grounded_cap_rate > 0
      ? valuation.grounded_noi / valuation.grounded_cap_rate
      : valuation.sale_price;
  const minSlider = Math.max(500000, Math.round((baseValuation * 0.85) / 50000) * 50000);
  const maxSlider = Math.round((baseValuation * 1.15) / 50000) * 50000;
  const midSlider = Math.round((minSlider + maxSlider) / 2 / 50000) * 50000;

  const handleCopy = () => {
    const text = `THE HUNTINGTON NATIONAL BANK - BORROWER SETTLEMENT ROUTING PACKET
DocuSign Envelope ID: ${wireInstructions.docusign_envelope_id || 'Pending envelope creation'}
Callback Authentication Line: ${wireInstructions.callback_verification_line || '(614) 480-4401 (Direct Banker Authentication Line)'}

Bank: ${wireInstructions.bank_name}
ABA Routing: ${wireInstructions.aba_routing}
Account Title: ${wireInstructions.account_title}
Account Number: ${wireInstructions.account_number}
Escrow File: ${wireInstructions.escrow_file}

AMOUNT TO ROUTE -- completed by seller. Huntington does not populate a proceeds figure.
  [ ] All net seller proceeds due to seller at closing
  [ ] $______________  (remainder disbursed per seller instruction)

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

        <div className="max-w-3xl space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-[#006738] dark:text-emerald-400 block">
            Commercial Banking &bull; Treasury &amp; Settlement Operations
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Liquidity Retention &amp; Settlement
            </h1>
            {!isDealDataStale && (
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800">
                Estimated Proceeds: ${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Detected: {deal?.tax_strategy_detected?.split('(')[0]?.trim() || 'Taxable Cash-Out'} ({deal?.flight_confidence_score || 94}% Match)
            </span>
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

      {/* Every figure below -- proceeds, settlement account, consent state --
          comes from a per-deal fetch. If any of them belongs to a different
          borrower, none of it is shown. A settlement packet rendered under the
          wrong name is the worst artefact this screen can produce. */}
      {isDealDataStale && (
        <StaleRecordNotice
          dealName={deal?.borrower_entity}
          what="the settlement and consent record"
        />
      )}

      {/* ===================================================================
          STEP 1 -- THE CONSULTATIVE CALL

          This card is deliberately first. A payoff detection is an inference
          drawn from the bank's own documents; it is not permission to act. The
          account title, the DocuSign envelope and the wealth referral below all
          descend from a conversation, so the conversation is what the screen
          leads with -- and until it is logged, none of them render.
          =================================================================== */}
      {!isDealDataStale && (
        <div
          className={`rounded-2xl border shadow-sm overflow-hidden ${
            callLogged
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-300/70 dark:border-amber-800/60'
          }`}
        >
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Phone
                className={`w-4 h-4 ${
                  callLogged
                    ? 'text-[#006738] dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-500'
                }`}
              />
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Step 1 &middot; Consultative Call
                </h2>
                <span className="text-[11px] text-slate-400 block font-normal mt-0.5">
                  {wireInstructions.officer_signature || 'Greg Miller, Vice President'} &rarr;{' '}
                  {borrowerName}
                  {deal?.borrower_entity ? ` · ${deal.borrower_entity}` : ''}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                callLogged
                  ? 'text-[#006738] dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-500'
              }`}
            >
              {callLogged ? 'Call Logged' : 'Not Yet Contacted'}
            </span>
          </div>

          {!callLogged ? (
            <div className="p-6 space-y-5">
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Book Scout has <strong className="text-slate-700 dark:text-slate-300">identified</strong>{' '}
                this payoff from documents the bank already holds. Nothing has been opened, staged, or
                sent. Place the call below; the settlement packet is generated only if{' '}
                {borrowerName} asks for it.
              </p>

              <div className="space-y-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Suggested Script
                </div>
                {CALL_SCRIPT.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold flex items-center justify-center tabular-nums">
                      {i + 1}
                    </span>
                    <div className="space-y-1.5 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400">
                        {s.beat}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 italic">
                        &ldquo;{s.line}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-300/70 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 dark:text-amber-500">
                    Do not say
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {CALL_GUARDRAILS.map((g, i) => (
                    <li
                      key={i}
                      className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/80 flex gap-2"
                    >
                      <span className="shrink-0">&bull;</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onLogConsultativeCall(true)}
                  disabled={isLoggingCall}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white shadow-xs transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>
                    {isLoggingCall ? 'Recording…' : 'Log Call — Client Directed Proceeds to Huntington'}
                  </span>
                </button>
                {/* A declined call is a real outcome and worth recording: it
                    proves the ask was made and leaves the packet locked. */}
                <button
                  type="button"
                  onClick={() => onLogConsultativeCall(false)}
                  disabled={isLoggingCall}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Log Call — Client Declined
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006738] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Consultative call logged
                    {quarantineState.call_timestamp
                      ? ` — ${new Date(quarantineState.call_timestamp).toLocaleTimeString()}`
                      : ''}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {quarantineState.call_disposition}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Recorded by {quarantineState.call_recorded_by}
                  </div>
                  {quarantineState.call_audit_hash && (
                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 break-all pt-1">
                      {quarantineState.call_audit_hash}
                    </div>
                  )}
                </div>
              </div>

              {!clientDirected && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 p-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {borrowerName} declined Huntington settlement routing. No account is staged and no
                  settlement packet is generated. The relationship record still shows the ask was
                  made.
                </div>
              )}

              <button
                type="button"
                onClick={() => onLogConsultativeCall(true)}
                disabled={isLoggingCall}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-emerald-400 transition disabled:opacity-50"
              >
                {isLoggingCall ? 'Working…' : 'Retract call record'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main 2-Column Staging Layout with Generous Whitespace */}
      {!isDealDataStale && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Financial Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card 1: Indicative Valuation Slider */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                  Indicative Valuation Slider
                </h2>
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

            {/* Instant Math Breakdown: Unboxed Stat Strip */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Existing Debt</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm mt-0.5 block">
                  ${(valuation.debt_payoff / 1000000).toFixed(2)}M
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Closing Costs</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm mt-0.5 block">
                  ${(valuation.estimated_closing_costs / 1000).toFixed(0)}k
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#006738] dark:text-emerald-400 uppercase font-bold block">
                  Net Seller Equity
                </span>
                <span className="font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums text-sm mt-0.5 block">
                  ${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              Full net seller equity of ${(valuation.net_equity_proceeds / 1000000).toFixed(2)}M flows directly into liquid cash-out settlement structure.
            </div>

            {/* Disclosure. The netting above stops at closing costs. */}
            <div className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              Gross of the yield-maintenance prepayment premium and of the seller's
              capital-gains and depreciation-recapture liability. Both reduce the amount
              actually available to deposit, so this is an upper bound on retainable
              proceeds rather than a settlement figure.
            </div>

            {/* Internal triage estimate only. Never assert this value to the client. */}
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
              <span className="font-bold uppercase tracking-wider">Internal triage estimate.</span>{' '}
              Indicative relationship-sizing figure derived from trailing NOI and submarket cap
              rate. This is not a bank appraisal, an underwriting valuation, or a USPAP opinion of
              value, and must not be asserted to the borrower.
            </div>
          </div>

          {/* Card 2: Detected Retention Structure (Business Premier ICS) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                  Detected Retention Structure
                </h2>
                <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
                  Algorithm Classification: Taxable Cash-Out (94% Confidence)
                </span>
              </div>
              <span className="text-xs font-bold text-[#006738] dark:text-emerald-400 uppercase tracking-wider">
                Yield: {valuation.yield_apy}% APY
              </span>
            </div>

            {taxStrategy === 'cash_out' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#006738]/30 dark:border-emerald-600/30 bg-emerald-50/25 dark:bg-emerald-950/20 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#006738] dark:text-emerald-400 shrink-0" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Huntington Business Premier Insured Cash Sweep (ICS)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Direct commercial depository sweep providing multi-million FDIC insurance passthrough via IntraFi Network.
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      packetUnlocked
                        ? 'bg-[#006738] text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {packetUnlocked ? 'Staged' : 'Eligible — Not Opened'}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-400">Target Depository</span>
                    {packetUnlocked ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        HBAN-4401-9921-00 (Business Premier ICS)
                      </span>
                    ) : (
                      // An account number implies an account exists. Opening one
                      // requires the customer to apply -- CIP/CDD under 31 C.F.R.
                      // 1020.220, a signature card and beneficial-ownership
                      // certification. None of that can follow from a detection.
                      <span className="font-medium text-slate-400 dark:text-slate-500 italic text-right">
                        Assigned on client instruction
                      </span>
                    )}
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">FDIC Protection</span>
                    <span className="font-semibold text-[#006738] dark:text-emerald-400">100% Principal Insured up to $50M</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Statutory Authority</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">12 U.S.C. § 1831f (EGRRCPA § 202 Reciprocal)</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Banker Credit</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">Commercial RM Deposit FTP Credit Allocated</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Need 1031 tax deferral instead?
                  </span>
                  <button
                    type="button"
                    onClick={() => onTaxStrategyChange('1031_exchange')}
                    className="text-xs font-semibold text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-emerald-400 transition"
                  >
                    Switch to 1031 QI Escrow &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#006738] dark:text-emerald-400 shrink-0" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        1031 Qualified Intermediary Escrow Depository
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Independent partner QI network (IPX1031 Partnered) for tax-deferred exchange escrow.
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Manual Override
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">QI Partner</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Investment Property Exchange Services (IPX1031)</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Safe Harbor</span>
                    <span className="font-semibold text-[#006738] dark:text-emerald-400">Treas. Reg. § 1.1031(k)-1(k) Compliant</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Timeline Restriction</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">45-day ID / 180-day exchange window</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Revert to algorithmic detection:
                  </span>
                  <button
                    type="button"
                    onClick={() => onTaxStrategyChange('cash_out')}
                    className="text-xs font-semibold text-[#006738] hover:underline dark:text-emerald-400 transition"
                  >
                    &larr; Switch back to Cash-Out (Default)
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Borrower Settlement Routing Packet & Consent Gate (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card 1: Settlement Routing Packet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            
            {/* Packet Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Settlement Routing Packet
                  </h3>
                </div>
              </div>
              
              {packetUnlocked ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                    {wireInstructions.docusign_envelope_id || 'Pending envelope creation'}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#006738] dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  Locked
                </span>
              )}
            </div>

            {!packetUnlocked ? (
              /* No packet exists before the call. This is not a redaction of
                 something already generated -- there is nothing to redact. */
              <div className="p-6">
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/20 p-6 text-center space-y-2">
                  <Lock className="w-5 h-5 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    No settlement packet has been generated
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {callLogged && !clientDirected
                      ? `${borrowerName} declined Huntington settlement routing on the logged call. No account is titled and no envelope is created.`
                      : 'The packet names the client\u2019s entity and an account title, and is delivered to the client for their signature. It is generated only after the consultative call in Step 1, and only if the client directs proceeds to Huntington.'}
                  </p>
                </div>
              </div>
            ) : (
            /* Wire Instruction Dossier */
            <div className="p-6 text-xs space-y-4 text-slate-800 dark:text-slate-200 select-text">
              
              {/* Target & Property Summary */}
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Title Company / Escrow</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">
                    {wireInstructions.title_company}
                  </span>
                  <span className="text-slate-400 text-[11px] block">
                    Attn: {wireInstructions.attention} &bull; File #{wireInstructions.escrow_file}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Property / Seller</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                    {wireInstructions.property}
                  </span>
                  <span className="text-slate-400 text-[11px] block truncate max-w-[200px]">
                    {wireInstructions.seller_entity}
                  </span>
                </div>
              </div>

              {/* Wire Table with Hairline Dividers */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Receiving Depository</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{wireInstructions.bank_name}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">ABA / Routing</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{wireInstructions.aba_routing}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Account Title</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{wireInstructions.account_title}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Account Number</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{wireInstructions.account_number}</span>
                </div>
                {/* Amount to Route -- elected by the seller, never by the bank.
                    There is deliberately no figure here. See the comment on
                    SettlementWireInstruction in domain/models.py for why: the
                    net-equity number is an internal triage estimate, it is gross
                    of the prepayment premium and the seller's tax liability, and
                    it would not reconcile to the settlement statement. */}
                <div className="py-3 space-y-2">
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-bold text-slate-900 dark:text-white">Amount to Route</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 dark:text-amber-500 shrink-0">
                      Completed by seller
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {(wireInstructions.amount_election_options || []).map((option, i) => (
                      <div key={option} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-[3px] w-3 h-3 shrink-0 rounded-[3px] border border-slate-400 dark:border-slate-600"
                        />
                        <span className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          {option}
                          {i === 1 && (
                            <>
                              {': '}
                              <span className="tabular-nums text-slate-500 dark:text-slate-400">$</span>
                              <span
                                aria-hidden="true"
                                className="inline-block w-20 mx-1 border-b border-slate-400 dark:border-slate-600 align-baseline"
                              />
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  {wireInstructions.amount_election_note && (
                    <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 pt-0.5">
                      {wireInstructions.amount_election_note}
                    </p>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Instructions: </span>
                {wireInstructions.special_instructions}
              </div>

              {/* Quiet Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>Banker: <strong className="text-slate-600 dark:text-slate-300">{wireInstructions.officer_signature}</strong></div>
                <div>Callback Authentication: <strong className="text-slate-600 dark:text-slate-300">{wireInstructions.callback_verification_line || '(614) 480-4401'}</strong></div>
              </div>
            </div>
            )}
          </div>

          {/* Card 2: Cross-LOB Consent Gate & Reg R Referral Record */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                  Cross-LOB Consent Gate &amp; Reg R Referral Record
                </h2>
                <span className="text-[11px] text-slate-400 block font-normal mt-0.5">
                  SEC Regulation R Networking &mdash; Referral Record
                </span>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${quarantineState.quarantined ? 'text-slate-400' : 'text-[#006738] dark:text-emerald-400'}`}>
                {quarantineState.quarantined ? 'Quarantined' : 'Verified'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {quarantineState.quarantined ? (
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <Unlock className="w-4 h-4 text-[#006738] dark:text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {quarantineState.quarantined ? 'Awaiting Client Consent' : 'Client Consent Recorded'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {quarantineState.consent_timestamp ? `Logged: ${new Date(quarantineState.consent_timestamp).toLocaleTimeString()}` : 'Recorded by Greg Miller'}
                  </div>
                </div>
              </div>

              <button
                onClick={onToggleQuarantine}
                disabled={isTogglingConsent || !callLogged}
                title={
                  !callLogged
                    ? 'Log the consultative call in Step 1 first. The referral record must reference the call on which the client asked for the introduction.'
                    : undefined
                }
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  quarantineState.quarantined
                    ? 'bg-[#006738] hover:bg-[#1B5630] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isTogglingConsent
                  ? 'Recording...'
                  : quarantineState.quarantined
                    ? 'Record Client Opt-In'
                    : 'Reset Gate'}
              </button>
            </div>

            {!callLogged && (
              <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 flex gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                <span>
                  Blocked until the Step 1 call is logged. A Regulation R referral record has to be
                  able to point at the conversation on which the client asked for the introduction.
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
      )}

      {/* Bottom Dual-Sided Handoff Banner */}
      {!isDealDataStale && !quarantineState.quarantined && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#E8F5E9]/70 dark:bg-emerald-950/40 border border-[#A7F3D0] dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#006738] text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-base font-bold text-slate-900 dark:text-white">
                Client Verbal Consent Recorded &mdash; Cross-Line-of-Business Marketing Consent
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {wireInstructions?.managing_member || 'The commercial client'} has authorized Private Wealth engagement. Pre-verified KYC documentation and custodial onboarding shell are ready for wealth advisory intake. Voluntary control: the advisor handoff is intra-institutional, so this is not a Reg P prerequisite. It also serves as the Regulation R referral record.
              </p>
            </div>
          </div>

          <button
            onClick={onProceedToAdvisorRouting}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm transition active:scale-[0.98] whitespace-nowrap self-start sm:self-auto"
          >
            <span>Proceed to Advisor Routing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
