import React, { useState } from 'react';
import { PayoffItem } from '../types';
import { Search, Filter, ArrowRight, Building2, Clock, CheckCircle2 } from 'lucide-react';

interface PayoffPipelineViewProps {
  items: PayoffItem[];
  selectedId: string;
  onSelectDeal: (id: string) => void;
}

export const PayoffPipelineView: React.FC<PayoffPipelineViewProps> = ({
  items,
  selectedId,
  onSelectDeal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'high_urgency' | 'pass_tier'>('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.borrower_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'high_urgency') return item.days_to_close <= 2;
    if (filterMode === 'pass_tier') return item.credit_risk_rating.toLowerCase().includes('pass');
    return true;
  });

  const totalPrincipal = items.reduce((sum, item) => sum + item.existing_debt_upb, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16 space-y-12">
      
      {/* Swiss Editorial Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#006738] dark:text-emerald-400 block">
              Commercial Banking &bull; Liquidity Surveillance
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Commercial Payoff Pipeline
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              Surveillance on active payoff demands, upcoming loan maturities, and deposit retention opportunities across Huntington commercial relationships.
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
            Imminent Flight (&lt; 48 Hours)
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
                <th className="py-4 px-6">Flight Risk</th>
                <th className="py-4 px-6">Credit Tier</th>
                <th className="py-4 px-6 sm:px-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No commercial payoff events match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = item.id === selectedId;
                  const isUrgent = item.days_to_close <= 2;

                return (
                  <tr
                    key={item.id}
                    className={`transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8F5E9]/50 dark:bg-emerald-950/20'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                    onClick={() => onSelectDeal(item.id)}
                  >
                    {/* Borrower & Property */}
                    <td className="py-5 px-6 sm:px-8">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#006738] dark:text-emerald-400 mt-0.5">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2.5 text-base">
                            <span>{item.borrower_entity}</span>
                            {item.id === 'PO-2026-8821' && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs uppercase font-bold tracking-wider bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#006738] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800">
                                Intercepted
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {item.property_name} &bull; {item.property_type}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 tracking-wide">
                            Reference: {item.id} &bull; {item.title_company}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Payoff Balance */}
                    <td className="py-5 px-6 font-bold text-slate-900 dark:text-white tabular-nums text-base">
                      ${item.existing_debt_upb.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      <span className="block text-xs font-normal text-slate-400 mt-0.5">
                        Per Diem: ${item.per_diem_interest.toFixed(0)}/day
                      </span>
                    </td>

                    {/* Closing Window */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Clock className={`w-4 h-4 ${isUrgent ? 'text-[#006738]' : 'text-slate-400'}`} />
                        <span className={isUrgent ? 'text-[#006738] dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {item.days_to_close === 1 ? '18 Hours (Imminent)' : `${item.days_to_close} Days`}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-1 tracking-wide">
                        Closing: {item.scheduled_closing_date}
                      </span>
                    </td>

                    {/* Flight Risk */}
                    <td className="py-5 px-6">
                      {isUrgent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#004724] text-white">
                          <span>Critical 78% Flight</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <span>Standard</span>
                        </span>
                      )}
                    </td>

                    {/* Risk Rating */}
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006738] dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{item.credit_risk_rating}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-5 px-6 sm:px-8 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDeal(item.id);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wide bg-[#006738] hover:bg-[#1B5630] text-white shadow-sm transition active:scale-[0.98]"
                      >
                        <span>Inspect Deal</span>
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

    </div>
  );
};
