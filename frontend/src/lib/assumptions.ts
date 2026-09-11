/**
 * Huntington Horizon — Business Case Assumption Model
 * ---------------------------------------------------
 * Single source of truth for every number that drives the Executive Analytics
 * view. Split deliberately into three provenance tiers so the room can see
 * which inputs are auditable and which are judgement:
 *
 *   VERIFIED  — traceable to Huntington's Q2 2026 10-Q or FFIEC Call Report.
 *   DERIVED   — arithmetic on VERIFIED inputs, with the derivation documented.
 *   ESTIMATE  — industry default or internal assumption. NOT sourced to
 *               Huntington. These are the dials the room should move.
 *
 * Everything here is a pure function. No React, no fetch, no side effects.
 */

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

export type Provenance = 'verified' | 'derived' | 'estimate';

export interface InputMeta {
  label: string;
  provenance: Provenance;
  source: string;
  /** Slider bounds, expressed in the same unit as the stored value. */
  min: number;
  max: number;
  step: number;
  /** 'percent' values are stored as fractions (0.225) but shown as 22.5%. */
  unit: 'percent' | 'days' | 'bps' | 'hours' | 'usd';
}

// ---------------------------------------------------------------------------
// Verified balance-sheet constants (Q2 2026, period ended June 30 2026)
// ---------------------------------------------------------------------------

/** 10-Q Table 8 — total commercial real estate. */
export const CRE_TOTAL = 23.457e9;

/** Call Report RC-C Part II — CRE originated at or under $1MM (small business). */
export const SMALL_BUSINESS_CRE = 3.490e9;

/** Call Report RC-C Part I — owner-occupied nonfarm nonresidential, booked in C&I. */
export const OWNER_OCCUPIED_CRE = 13.331e9;

/** Derived: investor CRE net of the small-business tranche this program excludes. */
export const TARGET_CRE_BOOK = CRE_TOTAL - SMALL_BUSINESS_CRE; // $19.97B

/** 10-Q Table 25 — Commercial Banking direct personnel costs, six months. */
export const CB_PERSONNEL_6MO = 393e6;

/** 10-Q Table 25 — Commercial Banking average full-time equivalent staff. */
export const CB_AVERAGE_FTE = 2689;

/** Derived: fully loaded annual cost of one Commercial Banking FTE. */
export const LOADED_FTE_COST = (CB_PERSONNEL_6MO * 2) / CB_AVERAGE_FTE; // ~$292,302

/** PRD §6.3 — annual enterprise operating budget. */
export const ENTERPRISE_RUN_RATE = 1.25e6;

/** Productive (non-PTO, non-admin) hours in one FTE-year. */
export const PRODUCTIVE_HOURS_PER_FTE = 1800;

// ---------------------------------------------------------------------------
// Assumption set
// ---------------------------------------------------------------------------

export interface Assumptions {
  /** Include owner-occupied CRE (the "sells the building AND the business" case). */
  includeOwnerOccupied: boolean;
  /** Share of the target book that pays off in a 12-month window. */
  turnover: number;
  /** Share of payoffs that are dispositions (sales) rather than refinances. */
  saleShare: number;
  /** Net-to-seller proceeds as a share of the payoff amount, at typical LTV. */
  equityRatio: number;
  /** Share of seller equity that leaves the bank absent intervention. */
  flightRate: number;
  /** Share of recaptured funds routed to Tier 1 (escrow / ICS) vs Tier 2 (AUM). */
  tier1Share: number;
  /** Tier 1 net interest margin. */
  tier1Bps: number;
  /** Tier 2 advisory fee. */
  tier2Bps: number;
  /** Average days Tier 1 balances actually sit on the balance sheet. */
  tier1DurationDays: number;
  /** Average commercial loan size, used to convert $ volume into work events. */
  avgLoanSize: number;
  /** Banker hours reclaimed per payoff event. */
  hoursSavedPerEvent: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  includeOwnerOccupied: true,
  turnover: 0.225,
  saleShare: 0.27,
  equityRatio: 0.57,
  flightRate: 0.78,
  tier1Share: 0.65,
  tier1Bps: 0.0085,
  tier2Bps: 0.0065,
  tier1DurationDays: 120,
  avgLoanSize: 3.0e6,
  hoursSavedPerEvent: 5,
};

/**
 * Every assumption except `includeOwnerOccupied` is a number, which lets UI controls
 * take a plain `(key, number)` setter instead of an escape-hatch cast.
 */
export type NumericAssumptionKey = keyof Omit<Assumptions, 'includeOwnerOccupied'>;

export const ASSUMPTION_META: Record<NumericAssumptionKey, InputMeta> = {
  turnover: {
    label: '12-Month Book Turnover',
    provenance: 'derived',
    source:
      'Call Report RC-C Part I, Memo 4: $31.69B of $191.19B matures within 12 months = 16.6% all-book. ' +
      'CRE carries balloon structures rather than 30-year amortization, so a 1.36x premium is applied. ' +
      'Memo 3 ("three months or less", $97.3B) is a REPRICING bucket, not maturity — using it overstates turnover ~10x.',
    min: 0.10,
    max: 0.40,
    step: 0.005,
    unit: 'percent',
  },
  saleShare: {
    label: 'Disposition Share of Payoffs',
    provenance: 'estimate',
    source:
      'Industry default. Share of CRE payoffs that are property sales rather than refinances. ' +
      'Cross-checkable against Trepp CMBS payoff-at-maturity data and MBA maturity volumes. ' +
      'Not sourced to Huntington.',
    min: 0.10,
    max: 0.50,
    step: 0.01,
    unit: 'percent',
  },
  equityRatio: {
    label: 'Net Seller Equity Ratio',
    provenance: 'estimate',
    source:
      'Industry default. Net-to-seller proceeds as a share of the payoff amount at roughly 60% LTV, ' +
      'after ~4.5% closing costs. Not sourced to Huntington.',
    min: 0.30,
    max: 0.80,
    step: 0.01,
    unit: 'percent',
  },
  flightRate: {
    label: '72-Hour Flight Rate',
    provenance: 'estimate',
    source:
      'HIGHEST-SENSITIVITY INPUT. Share of seller equity that leaves the institution absent intervention. ' +
      'Framed against a 70-85% industry benchmark band. Huntington has not published this figure and ' +
      'the demo does not ask for it.',
    min: 0.50,
    max: 0.95,
    step: 0.01,
    unit: 'percent',
  },
  tier1Share: {
    label: 'Tier 1 Allocation (Escrow / ICS)',
    provenance: 'estimate',
    source: 'Program design assumption. Remainder routes to Tier 2 wealth AUM.',
    min: 0.0,
    max: 1.0,
    step: 0.05,
    unit: 'percent',
  },
  tier1Bps: {
    label: 'Tier 1 Net Interest Margin',
    provenance: 'estimate',
    source:
      'Internal estimate. Sanity-checkable against the 3.28% Commercial Banking net interest margin ' +
      'disclosed in 10-Q Table 25, net of funding cost.',
    min: 0.0,
    max: 0.02,
    step: 0.0005,
    unit: 'bps',
  },
  tier2Bps: {
    label: 'Tier 2 Advisory Fee',
    provenance: 'estimate',
    source: 'Internal estimate for the blended managed-money fee on retained wealth AUM.',
    min: 0.0,
    max: 0.02,
    step: 0.0005,
    unit: 'bps',
  },
  tier1DurationDays: {
    label: 'Tier 1 Average Duration',
    provenance: 'estimate',
    source:
      'CRITICAL CORRECTION. Tier 1 balances are 1031 exchange escrow and treasury float. ' +
      'A 1031 exchange has a statutory 180-day maximum. These are transient balances, not standing ' +
      'deposits, so an annual margin rate cannot be applied to them at face value.',
    min: 30,
    max: 365,
    step: 5,
    unit: 'days',
  },
  avgLoanSize: {
    label: 'Average Commercial Loan Size',
    provenance: 'estimate',
    source:
      'Used only to convert dollar payoff volume into a count of banker work events. ' +
      'Call Report RC-C Part II reports a $250,312 average for the small-business CRE tranche, ' +
      'which this program excludes.',
    min: 1.0e6,
    max: 10.0e6,
    step: 0.25e6,
    unit: 'usd',
  },
  hoursSavedPerEvent: {
    label: 'Banker Hours Reclaimed per Event',
    provenance: 'estimate',
    source:
      'The single assumption behind the capacity case. Unlike the revenue inputs, Huntington can ' +
      'validate this internally in a week by timing the current manual payoff workflow.',
    min: 1,
    max: 12,
    step: 0.5,
    unit: 'hours',
  },
};

// ---------------------------------------------------------------------------
// Funnel: loan book -> equity actually at risk
// ---------------------------------------------------------------------------

export interface Funnel {
  targetBook: number;
  payoffVolume: number;
  dispositionVolume: number;
  sellerEquity: number;
  atRiskEquity: number;
}

export function computeFunnel(a: Assumptions): Funnel {
  const targetBook = TARGET_CRE_BOOK + (a.includeOwnerOccupied ? OWNER_OCCUPIED_CRE : 0);
  const payoffVolume = targetBook * a.turnover;
  const dispositionVolume = payoffVolume * a.saleShare;
  const sellerEquity = dispositionVolume * a.equityRatio;
  const atRiskEquity = sellerEquity * a.flightRate;
  return { targetBook, payoffVolume, dispositionVolume, sellerEquity, atRiskEquity };
}

// ---------------------------------------------------------------------------
// Yields
// ---------------------------------------------------------------------------

/** Blended yield ignoring duration — the figure the original model used. */
export function statedBlendedYield(a: Assumptions): number {
  return a.tier1Share * a.tier1Bps + (1 - a.tier1Share) * a.tier2Bps;
}

/**
 * Blended yield with Tier 1 duration applied. Tier 2 (AUM) is genuinely sticky
 * and carries a full year; Tier 1 escrow float does not.
 */
export function effectiveBlendedYield(a: Assumptions): number {
  const tier1 = a.tier1Share * a.tier1Bps * (a.tier1DurationDays / 365);
  const tier2 = (1 - a.tier1Share) * a.tier2Bps;
  return tier1 + tier2;
}

// ---------------------------------------------------------------------------
// Revenue case
// ---------------------------------------------------------------------------

export interface RoiResult {
  /** Dollars of at-risk equity kept, at the given recapture rate. */
  retained: number;
  tier1Balance: number;
  tier1Revenue: number;
  tier2Balance: number;
  tier2Revenue: number;
  grossAnnualValue: number;
  netAnnualRoi: number;
  isAccretive: boolean;
  /** Months of gross value required to cover the annual run-rate. */
  recoveryMonths: number;
  /** Recapture rate (as a percentage, 0-100) at which net ROI reaches zero. */
  breakevenRecapturePct: number;
}

/**
 * @param recapturePct Share of at-risk equity retained, 0-100.
 *   NOTE: this is a share of the AT-RISK POOL, not of the whole loan book.
 *   The prior model applied it to the full book, which overstated the result
 *   by roughly two orders of magnitude.
 */
export function computeRoi(
  a: Assumptions,
  recapturePct: number,
  runRate: number = ENTERPRISE_RUN_RATE,
): RoiResult {
  const { atRiskEquity } = computeFunnel(a);
  const retained = atRiskEquity * (recapturePct / 100);

  const tier1Balance = retained * a.tier1Share;
  const tier1Revenue = tier1Balance * a.tier1Bps * (a.tier1DurationDays / 365);

  const tier2Balance = retained * (1 - a.tier1Share);
  const tier2Revenue = tier2Balance * a.tier2Bps;

  const grossAnnualValue = tier1Revenue + tier2Revenue;
  const netAnnualRoi = grossAnnualValue - runRate;

  const recoveryMonths = grossAnnualValue > 0 ? (runRate / grossAnnualValue) * 12 : Infinity;

  const yieldPerDollar = effectiveBlendedYield(a);
  const capacityAtFullRecapture = atRiskEquity * yieldPerDollar;
  const breakevenRecapturePct =
    capacityAtFullRecapture > 0 ? (runRate / capacityAtFullRecapture) * 100 : Infinity;

  return {
    retained,
    tier1Balance,
    tier1Revenue,
    tier2Balance,
    tier2Revenue,
    grossAnnualValue,
    netAnnualRoi,
    isAccretive: netAnnualRoi >= 0,
    recoveryMonths,
    breakevenRecapturePct,
  };
}

// ---------------------------------------------------------------------------
// Capacity case
// ---------------------------------------------------------------------------

export interface CapacityResult {
  /** Payoff events per year implied by the funnel. */
  events: number;
  hoursSaved: number;
  fteEquivalent: number;
  annualValue: number;
  clearsRunRate: boolean;
}

export function computeCapacity(
  a: Assumptions,
  hoursSavedPerEvent: number = a.hoursSavedPerEvent,
  runRate: number = ENTERPRISE_RUN_RATE,
): CapacityResult {
  const { payoffVolume } = computeFunnel(a);
  const events = a.avgLoanSize > 0 ? payoffVolume / a.avgLoanSize : 0;
  const hoursSaved = events * hoursSavedPerEvent;
  const fteEquivalent = hoursSaved / PRODUCTIVE_HOURS_PER_FTE;
  const annualValue = fteEquivalent * LOADED_FTE_COST;
  return {
    events,
    hoursSaved,
    fteEquivalent,
    annualValue,
    clearsRunRate: annualValue >= runRate,
  };
}

/** Conservative / aggressive bracket for the headline capacity claim. */
export const CAPACITY_BAND_HOURS = { low: 4, high: 6 } as const;

export interface CapacityBand {
  low: CapacityResult;
  mid: CapacityResult;
  high: CapacityResult;
}

export function computeCapacityBand(a: Assumptions): CapacityBand {
  return {
    low: computeCapacity(a, CAPACITY_BAND_HOURS.low),
    mid: computeCapacity(a, a.hoursSavedPerEvent),
    high: computeCapacity(a, CAPACITY_BAND_HOURS.high),
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatUsdCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}k`;
  return `$${Math.round(value).toLocaleString()}`;
}

export function formatBps(rate: number): string {
  return `${(rate * 10000).toFixed(1)} bps`;
}

export function formatAssumption(key: keyof Assumptions, value: number | boolean): string {
  if (typeof value === 'boolean') return value ? 'Included' : 'Excluded';
  const meta = ASSUMPTION_META[key as keyof typeof ASSUMPTION_META];
  if (!meta) return String(value);
  switch (meta.unit) {
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'bps':
      return formatBps(value);
    case 'days':
      return `${value.toFixed(0)} days`;
    case 'hours':
      return `${value} hrs`;
    case 'usd':
      return formatUsdCompact(value);
    default:
      return String(value);
  }
}
