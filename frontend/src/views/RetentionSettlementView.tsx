import React, { useState, useEffect, useMemo } from 'react';
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
  Send,
  AlertTriangle,
  ChevronDown,
  CalendarClock,
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
 *
 * This is built per deal rather than declared once. It used to be a module
 * constant naming Marcus Vance, Riverfront Commons, First American and a 4.85%
 * ICS sweep -- so on the Buckeye exchange the banker was handed a script that
 * greeted the wrong person about the wrong building held at the wrong title
 * company, and offered a product that would have voided the client's tax
 * deferral. Every one of those is a deal attribute, so every one of them is
 * read from the deal.
 */
const buildCallScript = (
  deal: PayoffItem | undefined,
  taxStrategy: 'cash_out' | '1031_exchange',
  yieldApy: number,
): { beat: string; line: string }[] => {
  const firstName = (deal?.primary_guarantor || 'Marcus Vance').split(' ')[0];
  const banker = deal?.commercial_rm || 'Greg Miller';
  const property = deal?.property_name || 'the property';
  const titleCompany = deal?.title_company || 'the title company';
  const entity = deal?.borrower_entity || 'your entity';
  const isExchange = taxStrategy === '1031_exchange';

  // The middle beat is the one that has to diverge. On a taxable sale the offer
  // is a sweep account titled to the borrower; on an exchange that same account
  // is constructive receipt and would collapse the deferral, so the offer is
  // the qualified escrow instead -- and, more valuable to both sides, the
  // acquisition financing the 180-day window obliges the client to arrange.
  const proceedsBeat = isExchange
    ? {
        beat: 'Protect the exchange — the account matters more than the rate',
        line:
          'Because this is a like-kind exchange, the proceeds cannot touch an account with your ' +
          'name on it at any point — that is constructive receipt and it would collapse the ' +
          'deferral. We can hold them in our qualified escrow alongside your intermediary, ' +
          `currently ${yieldApy.toFixed(2)}% APY, so the funds stay compliant and still earn ` +
          'while you are inside the identification window.',
      }
    : {
        beat: 'Offer closing safety — not a product pitch',
        line:
          'The piece I want to make easy is where your net proceeds actually sit on settlement day. ' +
          'We can have a Business Premier account with Insured Cash Sweep open and ready before you ' +
          'close, so the funds land in an account titled to your LLC with FDIC passthrough across the ' +
          `IntraFi network — currently ${yieldApy.toFixed(2)}% APY. Nothing sits uninsured over a weekend.`,
      };

  const script = [
    {
      beat: 'Open — name the reason, plainly',
      line:
        `${firstName}, it's ${banker} at Huntington. The payoff quote request came across my desk on the ` +
        `${property} facility, so it looks like you have the property under contract. ` +
        'Congratulations. I wanted to get ahead of the closing mechanics with you rather than have ' +
        'them land on you the week of settlement.',
    },
    proceedsBeat,
    {
      beat: 'Hand control to the client — the bank never instructs title',
      line:
        `If that's useful, I'll send the routing packet to you by DocuSign — to you, not to ` +
        `${titleCompany}. You execute it and submit it as your own seller closing authorization. We include ` +
        "Huntington's bank verification letter and a direct callback line so their escrow officer " +
        'can verify it independently before they move a dollar.',
    },
  ];

  // On an exchange the client is contractually obliged to buy inside 180 days.
  // That is a loan somebody is going to write, and the conversation is useless
  // if it happens after he has arranged it elsewhere.
  if (isExchange) {
    script.push({
      beat: 'Name the next transaction — the client is already committed to it',
      line:
        'One more thing while the clock is running. You have forty-five days from closing to ' +
        'identify the replacement property and a hundred and eighty to complete the purchase, so ' +
        `you will be financing an acquisition either way. I would like ${entity} to have our terms ` +
        'in hand before you are up against the identification date. Can I get our team started on ' +
        'that now?',
    });
  }

  script.push({
    beat: 'The introduction — after closing, and only if he opens the door',
    line:
      "Last thing, and only if it's helpful. Once you're through closing and you know what you're " +
      'doing with the proceeds, I can introduce you to one of our wealth advisors. No need to ' +
      "decide anything now — I'd rather do it after settlement. Would you like me to make that " +
      'introduction?',
  });

  return script;
};

/** Things that turn a good call into a finding. */
const CALL_GUARDRAILS: string[] = [
  'Do not quote a property value or a net-proceeds figure. The number on this screen is an internal triage estimate, not an appraisal or an underwriting opinion.',
  'Do not name co-investors, guarantors, or other principals surfaced by entity resolution.',
  'Do not condition payoff terms, pricing, or an extension on where the proceeds land — anti-tying, 12 U.S.C. § 1972.',
  'Do not present the wealth introduction as a requirement, and do not schedule it before closing.',
];

/**
 * Render an ISO date for display.
 *
 * Parsed as local calendar parts rather than handed to `new Date(iso)`, which
 * treats a bare `YYYY-MM-DD` as UTC midnight and therefore renders the previous
 * day for anyone west of Greenwich. A statutory deadline shown one day early is
 * a number a banker will act on.
 */
const formatDeadline = (iso: string): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Whole calendar days from today until an ISO date; negative once past. */
const daysUntil = (iso: string): number | null => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  // Both floored to local midnight so the result is a count of dates, not of
  // elapsed 24-hour periods -- otherwise the number changes at an arbitrary
  // time of day rather than at midnight.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

interface RetentionSettlementViewProps {
  deal?: PayoffItem;
  valuation: ValuationData;
  /** Valuation / settlement packet in state belong to a different deal. */
  isDealDataStale?: boolean;
  onSalePriceChange: (price: number) => void;
  taxStrategy: 'cash_out' | '1031_exchange';
  /** What the detection layer concluded, independent of any manual override.
   *  Needed so the two strategy cards can say which of them is the detected
   *  one; the labels were previously fixed to the shape of a single deal. */
  detectedTaxStrategy: 'cash_out' | '1031_exchange';
  onTaxStrategyChange: (strategy: 'cash_out' | '1031_exchange') => void;
  quarantineState: QuarantineState;
  onToggleQuarantine: () => void;
  /** Gate 1. Records the consultative call that authorises everything below it. */
  onLogConsultativeCall: (clientDirectedProceeds?: boolean) => void;
  onSendSettlementPacket?: (send?: boolean) => void;
  wireInstructions: WireInstructionData;
  onBackToAnalysis: () => void;
  onProceedToAdvisorRouting: () => void;
  isTogglingConsent?: boolean;
  isLoggingCall?: boolean;
  isSendingPacket?: boolean;
  error?: string | null;
  onClearError?: () => void;
  /**
   * Bumped on a demo reset. Server state is reset by the API; this exists so
   * purely local view state (the expanded call script) goes back to its start
   * position too, rather than leaving the screen half-way through a run.
   */
  demoResetNonce?: number;
}

export const RetentionSettlementView: React.FC<RetentionSettlementViewProps> = ({
  deal,
  valuation,
  isDealDataStale = false,
  onSalePriceChange,
  taxStrategy,
  detectedTaxStrategy,
  onTaxStrategyChange,
  quarantineState,
  onToggleQuarantine,
  onLogConsultativeCall,
  onSendSettlementPacket,
  wireInstructions,
  onBackToAnalysis,
  onProceedToAdvisorRouting,
  isTogglingConsent = false,
  isLoggingCall = false,
  isSendingPacket = false,
  error = null,
  onClearError,
  demoResetNonce = 0,
}) => {
  const [copied, setCopied] = useState(false);

  // Rebuilt whenever the deal or the route changes. The APY comes from the
  // valuation rather than a literal, so the rate the banker reads aloud is the
  // one the settlement instruction actually routes to.
  const callScript = useMemo(
    () => buildCallScript(deal, taxStrategy, valuation.yield_apy),
    [deal, taxStrategy, valuation.yield_apy],
  );

  // The talk track is reference material, not the point of the screen. Closed
  // by default so the card leads with the state of the relationship and the
  // two things the banker can actually do; opened when the script is wanted.
  const [scriptOpen, setScriptOpen] = useState(false);

  // A reset returns the screen to its start position, and the start position
  // has the script closed. Also collapses on a deal switch: an open script
  // belongs to the borrower it was opened for.
  useEffect(() => {
    setScriptOpen(false);
  }, [demoResetNonce, deal?.id]);

  // True when the banker has moved off what detection concluded.
  //
  // The two strategy cards below used to assert this statically -- the 1031
  // card was always badged "Manual Override" and cash-out was always "(Default)"
  // -- which was right only on a deal detected as a cash-out. On Buckeye, where
  // detection concluded an exchange, the correct route was labelled as a manual
  // deviation and the deviation was labelled as the default.
  const isStrategyOverridden = taxStrategy !== detectedTaxStrategy;

  // The statutory clock, or null on a taxable sale.
  //
  // Keyed off the server's null rather than off `taxStrategy === '1031_exchange'`
  // deliberately. The strategy toggle changes instantly; the valuation behind it
  // is a round trip. Keying the panel off the toggle would render an exchange
  // clock over the previous deal's deadlines for the duration of that fetch.
  const exchangeTimeline = valuation.exchange_timeline ?? null;

  // Gate 1. Everything client-facing on this screen hangs off it.
  const callLogged = quarantineState.call_logged === true;
  const clientDirected = quarantineState.client_directed_proceeds === true;
  // The packet names the client's entity and an account title, so it may only
  // exist once the client has actually asked for it on the call.
  const packetUnlocked = callLogged && clientDirected;

  // Gate 1b. A composed packet is a draft. The envelope id is read from the
  // workflow record, never from the computed packet, because only a real send
  // writes one -- that is what makes its presence mean something.
  const packetSent = quarantineState.packet_sent === true;
  const envelopeId = quarantineState.docusign_envelope_id || null;
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
${envelopeId
  ? `DocuSign Envelope ID: ${envelopeId}\nSent to: ${quarantineState.packet_recipient || borrowerName}`
  : 'DRAFT -- not sent. No DocuSign envelope has been created.'}
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

              {/* The talk track and its guardrails are reference material the
                  banker opens when wanted. Collapsed by default so the card
                  leads with the two actions, but the trigger names what is
                  inside -- the guardrails are not hidden, only folded. */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setScriptOpen((open) => !open)}
                  aria-expanded={scriptOpen}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition"
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                    Suggested script &amp; compliance guardrails
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 tabular-nums hidden sm:inline">
                      {callScript.length} beats · {CALL_GUARDRAILS.length} do-not-say rules
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        scriptOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>

                {scriptOpen && (
                  <div className="p-4 space-y-5 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-4">
                      {callScript.map((s, i) => (
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
                  </div>
                )}
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

            {/* Where the money goes. This asserted a cash-out unconditionally,
                so on an exchange it told the banker that proceeds legally
                barred from a client-titled account would flow into one. */}
            <div className="pt-2 text-[11px] text-slate-400">
              {taxStrategy === '1031_exchange' ? (
                <>
                  Estimated exchange proceeds of $
                  {(valuation.net_equity_proceeds / 1000000).toFixed(2)}M are deferred, not
                  realized. They route to the qualified escrow and must not pass through any
                  account titled to the taxpayer.
                </>
              ) : (
                <>
                  Full net seller equity of $
                  {(valuation.net_equity_proceeds / 1000000).toFixed(2)}M flows directly into
                  liquid cash-out settlement structure.
                </>
              )}
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
                {/* Read from the deal. This was the literal string "Taxable
                    Cash-Out (94% Confidence)", which on Buckeye sat directly
                    above an escrow route and contradicted the pipeline screen
                    that had classified the same deal as a §1031 exchange. */}
                <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
                  Algorithm Classification: {deal?.tax_strategy_detected || 'Not classified'}
                  {typeof deal?.flight_confidence_score === 'number' && (
                    <> ({Math.round(deal.flight_confidence_score)}% Confidence)</>
                  )}
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
                      // Read from the packet the server generated. This was the
                      // literal "HBAN-4401-9921-00", which no longer matches
                      // anything the engine emits and was the same string on
                      // every borrower in the book.
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {wireInstructions.account_number} (Business Premier ICS)
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
                    {isStrategyOverridden
                      ? 'Detection concluded a 1031 exchange:'
                      : 'Need 1031 tax deferral instead?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onTaxStrategyChange('1031_exchange')}
                    className="text-xs font-semibold text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-emerald-400 transition"
                  >
                    {isStrategyOverridden
                      ? 'Revert to 1031 QI Escrow'
                      : 'Switch to 1031 QI Escrow'}{' '}
                    &rarr;
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
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isStrategyOverridden
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-[#006738] text-white'
                    }`}
                  >
                    {isStrategyOverridden ? 'Manual Override' : 'Detected'}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-400">Qualified Escrow</span>
                    {packetUnlocked ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {wireInstructions.account_number}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400 dark:text-slate-500 italic text-right">
                        Assigned on client instruction
                      </span>
                    )}
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">QI Partner</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Investment Property Exchange Services (IPX1031)</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Safe Harbor</span>
                    <span className="font-semibold text-[#006738] dark:text-emerald-400">Treas. Reg. § 1.1031(k)-1(k) Compliant</span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-400">Timeline Restriction</span>
                    {/* The generic "45-day ID / 180-day exchange window" is the
                        rule, not this deal's dates. A banker cannot act on a
                        rule; the panel below turns it into two dates and a
                        countdown. */}
                    <span className="font-medium text-slate-600 dark:text-slate-300 text-right">
                      {exchangeTimeline && exchangeTimeline.identification_deadline
                        ? `Identify by ${formatDeadline(exchangeTimeline.identification_deadline)} · close by ${formatDeadline(exchangeTimeline.exchange_deadline)}`
                        : '45-day ID / 180-day exchange window'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {isStrategyOverridden
                      ? 'Revert to algorithmic detection:'
                      : 'Client abandoned the exchange?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onTaxStrategyChange('cash_out')}
                    className="text-xs font-semibold text-[#006738] hover:underline dark:text-emerald-400 transition"
                  >
                    &larr;{' '}
                    {isStrategyOverridden
                      ? 'Switch back to Cash-Out (Detected)'
                      : 'Override to Taxable Cash-Out'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Statutory Exchange Clock.
              Rendered only when the server computed a timeline, which it does
              only for an exchange. Two things live here that existed nowhere in
              the product before: the dates the client is actually working
              against, and the loan those dates oblige him to take out. */}
          {exchangeTimeline && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
                  <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">
                    Statutory Exchange Clock
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  From closing {formatDeadline(exchangeTimeline.relinquished_closing_date)}
                </span>
              </div>

              {exchangeTimeline.identification_deadline ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: `${exchangeTimeline.identification_days_from_closing}-Day Identification`,
                      iso: exchangeTimeline.identification_deadline,
                      note: 'Replacement property must be identified in writing.',
                    },
                    {
                      label: `${exchangeTimeline.exchange_days_from_closing}-Day Exchange`,
                      iso: exchangeTimeline.exchange_deadline,
                      note: 'Purchase must complete or the deferral is lost.',
                    },
                  ].map(({ label, iso, note }) => {
                    const remaining = daysUntil(iso);
                    return (
                      <div
                        key={label}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1"
                      >
                        <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">
                          {label}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white tabular-nums text-sm block">
                          {formatDeadline(iso)}
                        </span>
                        {remaining !== null && (
                          <span
                            className={`text-[11px] font-semibold tabular-nums block ${
                              remaining < 0
                                ? 'text-slate-400'
                                : remaining <= 14
                                  ? 'text-amber-600 dark:text-amber-500'
                                  : 'text-[#006738] dark:text-emerald-400'
                            }`}
                          >
                            {remaining < 0
                              ? `Elapsed ${Math.abs(remaining)} days ago`
                              : `${remaining} days remaining`}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block pt-0.5">
                          {note}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // The server returns blank deadlines rather than guessing from
                // an unparseable closing date. Say so instead of showing dashes.
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  No scheduled closing date on file, so the statutory deadlines
                  cannot be computed. Both windows run from the closing on the
                  relinquished property.
                </div>
              )}

              {/* The largest item in the scenario, and the one the deck never
                  named. The client is contractually obliged to buy inside the
                  window -- the only open question is which bank writes it. */}
              <div className="p-4 rounded-xl border border-[#006738]/30 dark:border-emerald-600/30 bg-emerald-50/25 dark:bg-emerald-950/20 space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-[#006738] dark:text-emerald-400 uppercase font-bold tracking-wider">
                    Next Action — Replacement Property Financing
                  </span>
                  {exchangeTimeline.replacement_financing_owner && (
                    <span className="shrink-0 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {exchangeTimeline.replacement_financing_owner}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {exchangeTimeline.replacement_financing_action}
                </p>
              </div>

              <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
                {exchangeTimeline.statutory_basis}
              </p>
            </div>
          )}

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
                  {packetSent ? (
                    <span className="text-[11px] font-medium text-slate-400 hidden sm:inline tabular-nums">
                      {envelopeId}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20">
                      Draft — not sent
                    </span>
                  )}
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

              {/* Dispatch. Composing this packet did not send it; the envelope
                  id below is written by the server on send and by nothing else. */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {!packetSent ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => onSendSettlementPacket?.(true)}
                      disabled={isSendingPacket}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#006738] hover:bg-[#00562f] disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSendingPacket ? 'Creating envelope\u2026' : `Send to ${borrowerName} for Signature`}
                    </button>
                    <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      The envelope goes to {borrowerName}, not to the settlement agent.
                      Huntington cannot instruct the escrow holder: it acts for the seller
                      and disburses on the seller&rsquo;s own executed closing instructions.{' '}
                      {borrowerName} executes this packet and submits it to{' '}
                      {wireInstructions.title_company || 'the title company'} himself.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400">
                        <Send className="w-3.5 h-3.5" />
                        Sent &mdash; awaiting borrower signature
                      </span>
                      <button
                        onClick={() => onSendSettlementPacket?.(false)}
                        disabled={isSendingPacket}
                        className="text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline underline-offset-2 disabled:opacity-50"
                      >
                        Recall envelope
                      </button>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-400">Envelope</dt>
                        <dd className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{envelopeId}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-400">Recipient</dt>
                        <dd className="font-semibold text-slate-700 dark:text-slate-200 text-right">
                          {quarantineState.packet_recipient || borrowerName}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-400">Dispatched</dt>
                        <dd className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                          {quarantineState.packet_sent_at
                            ? new Date(quarantineState.packet_sent_at).toLocaleString()
                            : '\u2014'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-400">Sent by</dt>
                        <dd className="font-semibold text-slate-700 dark:text-slate-200 text-right">
                          {quarantineState.packet_sent_by || '\u2014'}
                        </dd>
                      </div>
                    </dl>
                    {quarantineState.packet_audit_hash && (
                      <div className="text-[10px] text-slate-400 break-all font-mono">
                        {quarantineState.packet_audit_hash}
                      </div>
                    )}
                    <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Execution status is not asserted here. Whether {borrowerName} has
                      signed is reported by DocuSign Connect against the envelope above;
                      this service records only that the envelope was dispatched.
                    </p>
                  </div>
                )}
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
