import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface StaleRecordNoticeProps {
  /** The borrower whose record was *requested*, never the one still in state. */
  dealName?: string;
  /** What could not be loaded, in plain words. */
  what?: string;
}

/**
 * Shown when a per-deal fetch failed and the data still sitting in state
 * belongs to a different borrower.
 *
 * The failure this prevents is the worst one a demo can have: the views used
 * to keep the previous deal's entity resolution, balances, settlement packet
 * and "Verified" badges, and render all of it under the newly selected
 * borrower's name. Nothing on screen said anything was wrong. An empty state
 * that says what happened is recoverable; a confident wrong answer is not.
 *
 * Deliberately not a spinner: the request finished. It failed.
 */
export const StaleRecordNotice: React.FC<StaleRecordNoticeProps> = ({
  dealName,
  what = 'this record',
}) => (
  <div
    role="status"
    data-testid="stale-record-notice"
    className="rounded-2xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 p-6 sm:p-8 flex items-start gap-4"
  >
    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
    <div className="space-y-1.5">
      <div className="text-sm font-bold text-slate-900 dark:text-white">
        {what.charAt(0).toUpperCase() + what.slice(1)} could not be loaded
        {dealName ? ` for ${dealName.replace(/\.$/, '')}` : ''}.
      </div>
      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        The request to the service did not complete, so nothing is shown here. The figures
        and verification badges that were on screen belong to the previously selected deal
        and are deliberately withheld rather than re-displayed under this borrower's name.
        Reselect the deal to retry.
      </p>
    </div>
  </div>
);
