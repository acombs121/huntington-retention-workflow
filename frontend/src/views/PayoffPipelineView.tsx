import React, { useState, useEffect } from 'react';
import { PayoffItem } from '../types';
import {
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Database,
  FileText,
  GitGraph,
} from 'lucide-react';
import { SignalGraphModal } from '../components/SignalGraphModal';

interface FactorItem {
  title: string;
  description: string;
}

interface PathwayItem {
  label: string;
  confidenceScore: number;
  detail: string;
}

interface DealTraceAnalysis {
  classificationTitle: string;
  summaryText: string;
  factors: FactorItem[];
  pathways: PathwayItem[];
}

function getTopFactorsForDeal(deal: PayoffItem): DealTraceAnalysis {
  if (deal.id === 'PO-2026-8821') {
    return {
      classificationTitle: 'Commercial Sale / Taxable Cash-Out',
      summaryText: 'Confirmed third-party asset sale with $2.90M net seller equity and zero replacement debt, creating an immediate 48-hour deposit flight risk.',
      factors: [
        {
          title: 'Zero Replacement Debt Found',
          description: 'nCino and AFS Core check across 1,400 branches found zero renewal or replacement credit applications, ruling out an internal refinance.',
        },
        {
          title: 'Direct Cash Disbursement (No QI Intermediary)',
          description: 'Title settlement instructions confirm funds wire directly to borrower operating account; zero Qualified Intermediary detected, ruling out a 1031 exchange.',
        },
        {
          title: 'Inbound Title Payoff Demand',
          description: 'First American Title requested final payoff calculation for escrow closing scheduled in 12 days.',
        },
        {
          title: 'High Net Liquid Proceeds ($2.90M)',
          description: '$8.50M valuation leaves $2.90M net cash after debt payoff and closing costs, at immediate risk of external wire departure.',
        },
      ],
      pathways: [
        { label: 'Internal Refinance', confidenceScore: 4, detail: '0 loans in nCino' },
        { label: '1031 Exchange', confidenceScore: 12, detail: 'No QI intermediary' },
        { label: 'Unknown', confidenceScore: 2, detail: 'Verified escrow exhibits' },
      ],
    };
  }

  if (deal.id === 'PO-2026-7492') {
    return {
      classificationTitle: 'IRC §1031 Like-Kind Exchange',
      summaryText: 'Multimodal OCR confirmed an identified Qualified Intermediary. Exchange proceeds cannot touch borrower accounts directly and must be routed to Huntington Qualified Escrow Depository.',
      factors: [
        {
          title: 'Identified Qualified Intermediary (QI)',
          description: 'Multimodal OCR detected formal exchange assignment naming Chicago Title Land Trust / IPX1031 as intermediary.',
        },
        {
          title: 'No Replacement Debt Facility',
          description: 'Outside acquirer is using non-Huntington debt; SBA 7(a) loan payoff is final with no renewal.',
        },
        {
          title: 'Title Payoff Demand Received',
          description: 'Chicago Title requested payoff calculation for closing scheduled on September 28.',
        },
        {
          title: '$1.59M Exchange Equity Target',
          description: 'Appraised $3.15M valuation vs. $1.42M debt payoff leaves $1.59M target for Qualified Escrow Depository.',
        },
      ],
      pathways: [
        { label: 'Internal Refinance', confidenceScore: 3, detail: 'Outside buyer debt' },
        { label: '1031 Exchange', confidenceScore: 88, detail: 'IPX1031 assigned' },
        { label: 'Unknown', confidenceScore: 9, detail: 'QI restricts receipt' },
      ],
    };
  }

  if (deal.id === 'PO-2026-6104') {
    return {
      classificationTitle: 'Competitive Refinance Inquiry',
      summaryText: 'Preliminary payoff inquiry received while a renewal discussion is active in nCino. Borrower is shopping competitive takeout terms with Fifth Third Bank.',
      factors: [
        {
          title: 'Competitive Takeout Threat',
          description: 'Borrower requested payoff figures to evaluate a competing commercial loan quote from Fifth Third Bank.',
        },
        {
          title: 'Active In-Progress Renewal File',
          description: 'nCino shows renewal file #REN-6104 assigned to Amanda Cross, confirming initial intent to retain debt.',
        },
        {
          title: 'Preliminary Payoff Inquiry',
          description: 'Commonwealth Land Title requested preliminary payoff figures at T-45 days.',
        },
        {
          title: '$2.22M Equity Restructure Position',
          description: 'Triage valuation of $5.72M vs $3.21M UPB provides substantial restructuring leverage.',
        },
      ],
      pathways: [
        { label: 'Internal Refinance', confidenceScore: 58, detail: 'Renewal file #REN-6104' },
        { label: '1031 Exchange', confidenceScore: 5, detail: 'No QI exchange exhibits' },
        { label: 'Unknown', confidenceScore: 22, detail: 'Preliminary inquiry only' },
      ],
    };
  }

  const equityM = (deal.estimated_net_equity / 1000000).toFixed(2);
  const is1031 = deal.tax_strategy_detected?.includes('1031');
  return {
    classificationTitle: is1031 ? 'IRC §1031 Exchange' : 'Commercial Payoff Event',
    summaryText: `Detection agent verified payoff notice for ${deal.borrower_entity}. Monitored against core credit pipeline and intermediary records.`,
    factors: [
      {
        title: 'Replacement Debt Pipeline Check',
        description: 'Queried 1,400 Huntington branches in nCino/AFS; zero replacement loan files found.',
      },
      {
        title: is1031 ? 'Qualified Intermediary Detected' : 'Direct Cash Disbursement',
        description: is1031 ? 'Identified QI assignment in escrow instructions.' : 'No QI detected; funds scheduled for direct borrower receipt.',
      },
      {
        title: 'Title Payoff Notice',
        description: `Demand from ${deal.title_company} for closing on ${deal.scheduled_closing_date}.`,
      },
      {
        title: `Net Equity Sizing ($${equityM}M)`,
        description: `$${equityM}M in estimated net equity at risk of external wire departure.`,
      },
    ],
    pathways: [
      { label: 'Internal Refinance', confidenceScore: 5, detail: 'No loan in nCino' },
      { label: '1031 Exchange', confidenceScore: is1031 ? 88 : 10, detail: is1031 ? 'QI detected' : 'No QI detected' },
      { label: 'Unknown', confidenceScore: 4, detail: 'Verified escrow exhibits' },
    ],
  };
}

function getConfidenceColorClass(score: number): string {
  if (score >= 90) {
    // Huntington brand dark green for highest confidence (e.g. 94%) - not darker
    return 'bg-[#006738] text-white border-[#00542e] hover:bg-[#1B5630] dark:bg-[#006738] dark:border-emerald-700 dark:text-white';
  }
  if (score >= 80) {
    // Softer forest/sage green (e.g. 88%)
    return 'bg-[#2e7456] text-white border-[#245e46] hover:bg-[#256247] dark:bg-[#2e7456] dark:border-emerald-800 dark:text-white';
  }
  if (score >= 70) {
    // Muted green-slate transition
    return 'bg-[#457165] text-white border-[#385e54] hover:bg-[#3d6056] dark:bg-[#457165] dark:border-slate-600 dark:text-slate-100';
  }
  if (score >= 60) {
    // Light slate transition
    return 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200';
  }
  // Faint inactive button gray for lowest confidence (e.g. 58%) - zero yellow
  return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700';
}

function formatCreditTier(rating: string): string {
  const match = rating.match(/Tier\s*\d+/i);
  if (match) return match[0];
  return rating.replace(/^pass\s*\(?/i, '').replace(/\)$/, '').trim() || rating;
}

interface PayoffPipelineViewProps {
  items: PayoffItem[];
  selectedId: string;
  onSelectDeal: (id: string) => void;
  userName?: string;
  scannedCount?: number;
}

export const PayoffPipelineView: React.FC<PayoffPipelineViewProps> = ({
  items,
  selectedId,
  onSelectDeal,
  userName,
  scannedCount = 2140,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'high_urgency' | 'pass_tier'>('all');
  const [activeTraceDeal, setActiveTraceDeal] = useState<PayoffItem | null>(null);
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);
  const [isSignalGraphOpen, setIsSignalGraphOpen] = useState(false);

  const [resolvedUserName, setResolvedUserName] = useState<string>(() => {
    return localStorage.getItem('horizon_user_name') || userName || 'Greg';
  });

  useEffect(() => {
    fetch('/api/user')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.name && !data.name.toLowerCase().includes('mock') && !data.name.toLowerCase().includes('developer')) {
          const first = data.name.split(' ')[0];
          if (first) setResolvedUserName(first);
        }
      })
      .catch(() => {});
  }, []);

  const displayName = userName || resolvedUserName;
  const urgentCount = 2;

  // Close modal on Escape key press and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTraceDeal(null);
      }
    };
    if (activeTraceDeal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeTraceDeal]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.borrower_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'high_urgency') return item.days_to_close > 0 && item.days_to_close <= 14;
    if (filterMode === 'pass_tier') return item.credit_risk_rating.toLowerCase().includes('pass');
    return true;
  });

  const totalPrincipal = items.reduce((sum, item) => sum + item.existing_debt_upb, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16 space-y-12">
      
      {/* Personalized Clean Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Good Morning, {displayName}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white">{scannedCount.toLocaleString()} relationships</span> scanned overnight,{' '}
              <span className="font-semibold text-[#006738] dark:text-emerald-400">{urgentCount} require your attention</span>.
            </p>
          </div>

          {/* Large Swiss Statistical Summary */}
          <div className="flex items-center gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block">
                Active Payoffs
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {items.length}
              </div>
            </div>
            <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block">
                Portfolio Balance
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                ${(totalPrincipal / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with Generous Spacing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by borrower entity, collateral, or payoff reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006738] focus:border-transparent transition shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#006738]" />
            Filter
          </span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition ${
              filterMode === 'all'
                ? 'bg-[#006738] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
            }`}
          >
            All Demands ({items.length})
          </button>
          <button
            onClick={() => setFilterMode('high_urgency')}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition ${
              filterMode === 'high_urgency'
                ? 'bg-[#006738] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
            }`}
          >
            Critical Flight (T-14 Days)
          </button>
          <button
            onClick={() => setFilterMode('pass_tier')}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition ${
              filterMode === 'pass_tier'
                ? 'bg-[#006738] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
            }`}
          >
            Pass Tier 1/2 Prime
          </button>
        </div>
      </div>

      {/* Main Swiss Pipeline Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6 sm:px-8">Borrower &amp; Collateral</th>
                <th className="py-4 px-6">Payoff Balance</th>
                <th className="py-4 px-6">Closing Window</th>
                <th className="py-4 px-6">Confidence Score</th>
                <th className="py-4 px-6">Credit Tier</th>
                <th className="py-4 px-6 sm:px-8 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No commercial payoff events match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = item.id === selectedId;
                  const isUrgent = item.days_to_close > 0 && item.days_to_close <= 14;
                  const confidence = item.flight_confidence_score ?? (isUrgent ? 94 : 88);

                return (
                  <tr
                    key={item.id}
                    className={`transition cursor-pointer align-middle ${
                      isSelected
                        ? 'bg-[#E8F5E9]/50 dark:bg-emerald-950/20'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                    onClick={() => onSelectDeal(item.id)}
                  >
                    {/* Borrower & Property */}
                    <td className="py-5 px-6 sm:px-8 align-middle">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white text-base">
                          {item.borrower_entity}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium space-y-0.5">
                          <div>{item.property_name}</div>
                          <div className="font-semibold text-slate-700 dark:text-slate-200">
                            {item.flight_risk_classification ? item.flight_risk_classification.split('/')[0].split('(')[0].trim() : item.property_type}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Payoff Balance */}
                    <td className="py-5 px-6 font-bold text-slate-900 dark:text-white tabular-nums text-base align-middle">
                      ${item.existing_debt_upb.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </td>

                    {/* Closing Window */}
                    <td className="py-5 px-6 align-middle">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Clock className={`w-4 h-4 ${isUrgent ? 'text-[#006738]' : 'text-slate-400'}`} />
                        <span className={isUrgent ? 'text-[#006738] dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {item.days_to_close === 1 ? '18 Hours (Imminent)' : `${item.days_to_close} Days`}
                        </span>
                      </div>
                    </td>

                    {/* Confidence Score (Clickable Detection Agent Reasoning Trace) */}
                    <td className="py-5 px-6 align-middle">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTraceDeal(item);
                        }}
                        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${getConfidenceColorClass(confidence)}`}
                        title={`Click to inspect Detection Agent reasoning trace for ${item.borrower_entity}`}
                      >
                        <span className="tabular-nums font-extrabold">{confidence}%</span>
                        <span className="text-[11px] opacity-90 font-medium">Score</span>
                        <ArrowRight className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                      </button>
                    </td>

                    {/* Credit Tier */}
                    <td className="py-5 px-6 align-middle">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006738] dark:text-emerald-400 whitespace-nowrap">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{formatCreditTier(item.credit_risk_rating)}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-5 px-6 sm:px-8 text-center whitespace-nowrap align-middle">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDeal(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm transition active:scale-[0.98] whitespace-nowrap"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overnight Autonomous Agent Telemetry Section (Starts Collapsed at Bottom) */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
        {/* Collapsed Header / Toggle Trigger */}
        <button
          type="button"
          onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
          className="w-full px-6 sm:px-8 py-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors focus:outline-none cursor-pointer"
          aria-expanded={isTelemetryExpanded}
        >
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            Overnight Agent Telemetry &amp; Ingestion Audit
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              {isTelemetryExpanded ? 'Hide Telemetry' : 'Inspect Telemetry'}
            </span>
            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform">
              {isTelemetryExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {/* Collapsible Content Body */}
        {isTelemetryExpanded && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 animate-fadeIn bg-[#FAFBFD] dark:bg-slate-900/60">
            {/* Top Operational Metrics Bar: Unboxed Stat Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scanned</span>
                  <Database className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {scannedCount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">AFS Core &amp; nCino Commercial</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classified</span>
                  <Layers className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                  3 Staged
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">1 Sale, 1 &sect;1031, 1 Refi</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Multimodal OCR</span>
                  <FileText className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  14 Files
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Gemini 3.7 Flash Grounding</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Absorbed Load</span>
                  <Clock className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-[#006738] dark:text-emerald-400 tabular-nums">
                  ~46 Hours
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Synthetic Capacity Leverage</div>
              </div>
            </div>

            {/* Spanner Graph Grounding Console Trigger Banner */}
            <div className="bg-white dark:bg-slate-800/90 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#008559]/10 dark:bg-emerald-500/10 border border-[#008559]/20 flex items-center justify-center text-[#008559] dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
                  <GitGraph className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Google Cloud Spanner Graph Grounding
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#008559]/10 text-[#008559] dark:text-emerald-400 border border-[#008559]/20">
                      ISO GQL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Deterministic ontological graph topology grounding autonomous agents across borrowing entities, beneficial owners, credit facilities, and title escrow signals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignalGraphOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#008559] hover:bg-[#006738] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <GitGraph className="w-4 h-4" />
                <span>Inspect Spanner Grounding Graph</span>
              </button>
            </div>

            {/* Trace Logs Terminal Box */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800 shadow-inner space-y-2">
              <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>ORCHESTRATION ENGINE RUN #20260909-034102 &bull; LOG LEVEL: INFO</span>
                <span className="text-emerald-400 font-bold">EXECUTION: SUCCESS (0 ERRORS)</span>
              </div>
              <div className="leading-relaxed space-y-1.5 pt-1 text-[11.5px]">
                <div><span className="text-slate-500">[03:41:02.104]</span> <span className="text-emerald-400">[INGESTION_AGENT]</span> Connecting to AFS Core Level 3 via Pub/Sub queue <code>afs.servicing.events</code>...</div>
                <div><span className="text-slate-500">[03:41:04.281]</span> <span className="text-emerald-400">[INGESTION_AGENT]</span> Retrieved 2,140 active loan facilities across 1,400 branch directories.</div>
                <div><span className="text-slate-500">[03:41:18.940]</span> <span className="text-emerald-400">[DETECTION_AGENT]</span> Fusing Fedwire clearing telemetry &amp; title insurance payoff demand queue...</div>
                <div><span className="text-slate-500">[03:41:22.015]</span> <span className="text-emerald-400">[DETECTION_AGENT]</span> 2,137 non-event facilities confirmed (scheduled amortization, routine servicing).</div>
                <div><span className="text-slate-500">[03:41:24.320]</span> <span className="text-amber-400">[CLASSIFICATION_AGENT]</span> Flagged 3 active payoff demands requiring liquidity event triage:</div>
                <div className="pl-6 text-slate-400">&bull; PO-2026-8821 ($5,180,000 UPB, First American Title, T-12 days)</div>
                <div className="pl-6 text-slate-400">&bull; PO-2026-7492 ($1,405,000 UPB, Chicago Title, T-24 days)</div>
                <div className="pl-6 text-slate-400">&bull; PO-2026-6104 ($3,210,000 UPB, Commonwealth Land Title, T-45 days)</div>
                <div><span className="text-slate-500">[03:41:26.540]</span> <span className="text-emerald-400">[CLASSIFICATION_AGENT]</span> Analyzing PO-2026-8821: Zero replacement debt in nCino; direct cash disbursement to LLC operating account.</div>
                <div><span className="text-slate-500">[03:41:28.112]</span> <span className="text-emerald-400">[CLASSIFICATION_AGENT]</span> Classification: <strong>Commercial Sale / Taxable Cash-Out</strong> &bull; Flight Risk Confidence: 94%.</div>
                <div><span className="text-slate-500">[03:41:31.420]</span> <span className="text-cyan-400">[ENTITY_AGENT]</span> Invoking Gemini 3.7 Flash Multimodal Layout OCR on credit vault document <code>doc_vault/incumbency_cert_8821.pdf</code>...</div>
                <div><span className="text-slate-500">[03:41:33.890]</span> <span className="text-cyan-400">[ENTITY_AGENT]</span> Resolved Beneficial Ownership: Marcus Vance (85% Ownership, Primary Guarantor).</div>
                <div><span className="text-slate-500">[03:41:34.102]</span> <span className="text-purple-400">[COMPLIANCE_GATE]</span> GLBA Reg P &amp; FCRA § 604 Rule: Elena Vance (15% non-guarantor) programmatically quarantined from profiling.</div>
                <div><span className="text-slate-500">[03:41:36.450]</span> <span className="text-emerald-400">[ENRICHMENT_AGENT]</span> Synthesizing Executive 1-Pager: Net equity proceeds sized at $2,900,000 after $5,180,000 debt payoff and closing fees.</div>
                <div><span className="text-slate-500">[03:41:38.220]</span> <span className="text-emerald-400">[ENRICHMENT_AGENT]</span> Identified commercial RM relationship: Greg Miller (Columbus Central Commercial Team, 12-yr account tenure).</div>
                <div><span className="text-slate-500">[03:41:40.812]</span> <span className="text-blue-400">[ROUTING_AGENT]</span> Evaluating 14 Private Wealth Advisors in Columbus Wealth Market against capacity, specialty, and performance:</div>
                <div className="pl-6 text-slate-400">&bull; Match 1: Sarah Jenkins (Score: 98% &bull; Book: 84 accounts &bull; Headroom: Available &bull; Specialty: CRE Liquidity)</div>
                <div><span className="text-slate-500">[03:41:44.204]</span> <span className="text-blue-400">[ROUTING_AGENT]</span> Capacity verification: Sarah Jenkins manages 84 families; well within 95–100 capacity threshold under 2x CSA leverage.</div>
                <div><span className="text-slate-500">[03:41:48.090]</span> <span className="text-emerald-400">[OUTREACH_AGENT]</span> Pre-generating warm intro email for commercial banker Greg Miller to Marcus Vance &amp; Sarah Jenkins.</div>
                <div><span className="text-slate-500">[03:42:04.918]</span> <span className="text-emerald-400">[ORCHESTRATION_ENGINE]</span> Overnight batch completed in 4m 18s. Horizon dashboard updated for morning review.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Radically Simplified Detection Agent Reasoning Trace Modal */}
      {activeTraceDeal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveTraceDeal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="trace-modal-title"
        >
          <div
            className="relative w-full max-w-4xl lg:max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#006738] dark:text-emerald-400">
                    Detection Agent Reasoning
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="text-xs text-slate-400 font-medium">gemini-3.7-flash</span>
                </div>
                <h2
                  id="trace-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1"
                >
                  {activeTraceDeal.borrower_entity}
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ref: {activeTraceDeal.id} &bull; {activeTraceDeal.property_name}
                </div>
              </div>

              <button
                onClick={() => setActiveTraceDeal(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition -mr-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* At-a-Glance Body */}
            {(() => {
              const analysis = getTopFactorsForDeal(activeTraceDeal);
              return (
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left Column: Event Classification & Alternatives */}
                    <div className="space-y-5">
                      {/* Verdict Callout */}
                      <div className="bg-[#E8F5E9]/60 dark:bg-emerald-950/30 border border-[#A7F3D0] dark:border-emerald-800/60 rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-400 mb-1">
                              Event Classification: {analysis.classificationTitle}
                            </div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                              {analysis.summaryText}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-2xl sm:text-3xl font-black text-[#006738] dark:text-emerald-400 tabular-nums leading-none">
                              {activeTraceDeal.flight_confidence_score ?? (activeTraceDeal.days_to_close <= 14 ? 94 : 88)}%
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                              Confidence
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Potential Alternatives */}
                      <div className="space-y-2.5">
                        <div className="text-xs uppercase font-bold tracking-wider text-[#006738] dark:text-emerald-400">
                          Potential Alternatives
                        </div>
                        <div className="space-y-2.5">
                          {analysis.pathways.map((p, i) => (
                            <div
                              key={i}
                              className={`p-3.5 rounded-xl border text-left transition ${
                                p.confidenceScore >= 80
                                  ? 'bg-[#E8F5E9]/40 dark:bg-emerald-950/20 border-[#A7F3D0]/70 dark:border-emerald-800/60'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">{p.label}</span>
                                <span
                                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border tabular-nums ${getConfidenceColorClass(
                                    p.confidenceScore
                                  )}`}
                                >
                                  {p.confidenceScore}%
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{p.detail}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Top Factors */}
                    <div className="space-y-2.5">
                      <div className="text-xs uppercase font-bold tracking-wider text-[#006738] dark:text-emerald-400">
                        Top Factors Driving Confidence Score
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {analysis.factors.map((factor, idx) => (
                          <div
                            key={idx}
                            className="py-3 space-y-1"
                          >
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {factor.title}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {factor.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400">
                Grounded in nCino Commercial LOS, AFS Core &amp; title escrow exhibits.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTraceDeal(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectDeal(activeTraceDeal.id);
                    setActiveTraceDeal(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold bg-[#006738] hover:bg-[#1B5630] text-white shadow-xs transition whitespace-nowrap"
                >
                  <span>Inspect Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Spanner Signal Grounding Graph Modal */}
      <SignalGraphModal
        isOpen={isSignalGraphOpen}
        onClose={() => setIsSignalGraphOpen(false)}
        activePayoffId={selectedId}
        onSelectPayoffId={(dealId) => {
          onSelectDeal(dealId);
        }}
      />

    </div>
  );
};
