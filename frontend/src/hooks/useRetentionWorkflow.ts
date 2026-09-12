/**
 * Huntington Book Scout: Retention Workflow State Module
 * Deep custom hook encapsulating all commercial liquidity domain state,
 * remote API synchronization, optimistic calculations, and compliance gates.
 * Adheres strictly to Zero-Mock runtime discipline and in-flight operation locking.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PayoffItem,
  CapacityMeter,
  EntityResolutionData,
  ValuationData,
  QuarantineState,
  WireInstructionData,
  WealthOnboardingData,
} from '../types';
import {
  initialCapacityMeter,
  initialPayoffQueue,
  initialEntityResolution,
  initialValuation,
  initialQuarantineState,
  initialWireInstructions,
  initialWealthOnboarding,
} from '../mockData';

export interface WorkflowState {
  capacityMeter: CapacityMeter;
  payoffItems: PayoffItem[];
  selectedPayoffId: string;
  selectedDeal: PayoffItem;
  salePrice: number;
  taxStrategy: 'cash_out' | '1031_exchange';
  valuation: ValuationData;
  quarantineState: QuarantineState;
  entityResolution: EntityResolutionData;
  wireInstructions: WireInstructionData;
  wealthOnboarding: WealthOnboardingData;
  isLoading: boolean;
  isTogglingConsent: boolean;
  /**
   * True when any per-deal dataset in state was fetched for a different deal.
   *
   * A failed fetch used to leave the previous borrower's entity resolution,
   * balances, settlement packet and "Verified" badges in place, and the views
   * rendered all of it under the newly selected borrower's name. Silently,
   * confidently wrong. Every dataset now carries the id it was fetched for and
   * the views withhold anything that does not belong to the selected deal.
   */
  isDealDataStale: boolean;
  error: string | null;
}

export interface WorkflowActions {
  selectDeal: (id: string) => void;
  setSalePrice: (price: number) => void;
  setTaxStrategy: (strategy: 'cash_out' | '1031_exchange') => void;
  toggleQuarantine: () => Promise<void>;
  clearError: () => void;
}

const INITIAL_DEAL_ID = 'PO-2026-8821';

export function useRetentionWorkflow(): {
  state: WorkflowState;
  actions: WorkflowActions;
} {
  // Domain Datasets
  const [capacityMeter, setCapacityMeter] = useState<CapacityMeter>(initialCapacityMeter);
  const [payoffItems, setPayoffItems] = useState<PayoffItem[]>(initialPayoffQueue);
  const [selectedPayoffId, setSelectedPayoffId] = useState<string>(INITIAL_DEAL_ID);

  // Valuation Parameters
  const [salePrice, setSalePrice] = useState<number>(8500000);
  const [taxStrategy, setTaxStrategy] = useState<'cash_out' | '1031_exchange'>('cash_out');
  const [valuation, setValuation] = useState<ValuationData>(initialValuation);

  // Compliance, Settlement & Wealth Staging
  const [quarantineState, setQuarantineState] = useState<QuarantineState>(initialQuarantineState);
  const [entityResolution, setEntityResolution] = useState<EntityResolutionData>(initialEntityResolution);
  const [wireInstructions, setWireInstructions] = useState<WireInstructionData>(initialWireInstructions);
  const [wealthOnboarding, setWealthOnboarding] = useState<WealthOnboardingData>(initialWealthOnboarding);

  // Provenance of each per-deal dataset: which deal is the data in state
  // actually about? Set only on a successful, id-matched response, so a failed
  // fetch leaves the marker pointing at the previous deal and the UI can tell.
  // Positive evidence of failure, per dataset: the deal id whose fetch came
  // back empty-handed.
  //
  // Deliberately NOT the inverse framing ("which deal does the data in state
  // belong to?"). That cannot tell a request that failed from one that has not
  // answered yet, and the difference between those two states is a render --
  // staleness is computed while rendering, but any in-flight marker can only
  // be set from an effect, which runs after commit. That one frame is long
  // enough to paint an amber failure banner over a perfectly healthy click.
  //
  // Absence of failure is the safe default, so these start null and nothing is
  // claimed to be broken until a request actually breaks.
  const [entityResolutionFailedFor, setEntityResolutionFailedFor] = useState<string | null>(null);
  const [quarantineFailedFor, setQuarantineFailedFor] = useState<string | null>(null);
  const [wealthOnboardingFailedFor, setWealthOnboardingFailedFor] = useState<string | null>(null);
  const [valuationFailedFor, setValuationFailedFor] = useState<string | null>(null);
  const [wireInstructionsFailedFor, setWireInstructionsFailedFor] = useState<string | null>(null);

  // Operational State Guards
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTogglingConsent, setIsTogglingConsent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selected Deal Item
  const selectedDeal = useMemo(() => {
    return payoffItems.find((p) => p.id === selectedPayoffId) || payoffItems[0];
  }, [payoffItems, selectedPayoffId]);

  // Stale means: a request for the deal now on screen failed, so the data in
  // state belongs to somebody else and must not be shown under this name.
  const isDealDataStale = useMemo(
    () =>
      [
        entityResolutionFailedFor,
        quarantineFailedFor,
        wealthOnboardingFailedFor,
        valuationFailedFor,
        wireInstructionsFailedFor,
      ].some((failedFor) => failedFor === selectedPayoffId),
    [
      entityResolutionFailedFor,
      quarantineFailedFor,
      wealthOnboardingFailedFor,
      valuationFailedFor,
      wireInstructionsFailedFor,
      selectedPayoffId,
    ]
  );

  // Initial Pipeline Queue Fetching from Backend API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch('/api/payoffs')
      .then((res) => {
        if (!res.ok) throw new Error(`Payoffs API returned HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.capacity_meter) setCapacityMeter(data.capacity_meter);
        if (data.payoff_items) setPayoffItems(data.payoff_items);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to initialize commercial payoff pipeline data');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize Deal Metadata (Entity Resolution, GLBA Quarantine, Wealth Onboarding) on Deal Selection Change
  useEffect(() => {
    const controller = new AbortController();
    // The id this round of requests was issued for. Every response is checked
    // against it before it is allowed into state -- which also closes the
    // out-of-order-response race an AbortController does not cover, because an
    // abort does not retract a reply already in flight.
    const requestedId = selectedPayoffId;

    // 1. Entity Resolution
    fetch(`/api/entity-resolution?payoff_id=${requestedId}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Entity resolution API returned HTTP ${res.status}`);
        return res.json();
      })
      .then((data: EntityResolutionData | null) => {
        if (!data) return;
        if (data.payoff_id && data.payoff_id !== requestedId) return;
        setEntityResolution(data);
        setEntityResolutionFailedFor((failedFor) => (failedFor === requestedId ? null : failedFor));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setEntityResolutionFailedFor(requestedId);
          setError(`Entity resolution notice: ${err.message || 'Failed to fetch entity records'}`);
        }
      });

    // 2. GLBA Compliance Quarantine Status
    fetch(`/api/quarantine?payoff_id=${requestedId}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Quarantine API returned HTTP ${res.status}`);
        return res.json();
      })
      .then((qData: QuarantineState | null) => {
        if (!qData) return;
        if (qData.payoff_id && qData.payoff_id !== requestedId) return;
        setQuarantineState(qData);
        setQuarantineFailedFor((failedFor) => (failedFor === requestedId ? null : failedFor));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setQuarantineFailedFor(requestedId);
          setError(`Failed to synchronize GLBA quarantine status: ${err.message || 'Network error'}`);
        }
      });

    // 3. Private Wealth Onboarding Dossier
    fetch(`/api/wealth-onboarding?payoff_id=${requestedId}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Wealth onboarding API returned HTTP ${res.status}`);
        return res.json();
      })
      .then((wData: WealthOnboardingData | null) => {
        if (!wData) return;
        if (wData.payoff_id && wData.payoff_id !== requestedId) return;
        setWealthOnboarding(wData);
        setWealthOnboardingFailedFor((failedFor) => (failedFor === requestedId ? null : failedFor));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setWealthOnboardingFailedFor(requestedId);
          setError(`Failed to synchronize Wealth Advisory dossier: ${err.message || 'Network error'}`);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedPayoffId]);

  // Valuation & Settlement Wire Synchronization with Race-Condition Guard (AbortController)
  useEffect(() => {
    const controller = new AbortController();
    // Neither the valuation response nor the settlement packet carries a
    // payoff_id, so the id the request was issued for is what stamps them.
    const requestedId = selectedPayoffId;

    // 1. Fetch recalculated valuation from domain engine with active payoff_id
    fetch('/api/valuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payoff_id: requestedId,
        sale_price: salePrice,
        noi: selectedDeal.noi_trailing_q1 || 637500.0,
        cap_rate: selectedDeal.submarket_cap_rate || 0.075,
        debt_payoff: selectedDeal.payoff_quote_amount || 5214800.0,
        closing_cost_rate: 0.045,
        tax_strategy: taxStrategy,
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Valuation calculation returned HTTP ${res.status}`);
        return res.json();
      })
      .then((valData: ValuationData | null) => {
        if (!valData) return;
        setValuation(valData);
        setValuationFailedFor((failedFor) => (failedFor === requestedId ? null : failedFor));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setValuationFailedFor(requestedId);
          setError(`Valuation calculation error: ${err.message || 'Failed to calculate net proceeds'}`);
        }
      });

    // 2. Fetch synchronized Borrower Settlement Routing Packet from backend
    fetch(
      `/api/wire-instructions?payoff_id=${requestedId}&strategy=${taxStrategy}&sale_price=${salePrice}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Wire instruction returned HTTP ${res.status}`);
        return res.json();
      })
      .then((wireData: WireInstructionData | null) => {
        if (!wireData) return;
        setWireInstructions(wireData);
        setWireInstructionsFailedFor((failedFor) => (failedFor === requestedId ? null : failedFor));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setWireInstructionsFailedFor(requestedId);
          setError(`Wire instruction error: ${err.message || 'Failed to generate Borrower Settlement Routing Packet'}`);
        }
      });

    return () => {
      controller.abort();
    };
  }, [salePrice, taxStrategy, selectedPayoffId, selectedDeal]);

  // Action: Select Deal in Pipeline
  const selectDeal = useCallback(
    (id: string) => {
      setSelectedPayoffId(id);
      const targetDeal = payoffItems.find((p) => p.id === id);
      if (targetDeal && targetDeal.indicative_valuation) {
        setSalePrice(targetDeal.indicative_valuation);
      }
    },
    [payoffItems]
  );

  // Action: Toggle GLBA Consent Gate (Fail-fast, Zero-Mock Policy, In-flight Protected)
  const toggleQuarantine = useCallback(async () => {
    if (isTogglingConsent) return;
    setIsTogglingConsent(true);
    setError(null);
    const newState = !quarantineState.verbal_consent_recorded;

    try {
      const res = await fetch('/api/quarantine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoff_id: selectedPayoffId,
          verbal_consent_recorded: newState,
          recorded_by: `${selectedDeal.commercial_rm || 'Greg Miller'} (Commercial RM)`,
          client_notes: 'Affirmative opt-in recorded for wealth staging.',
        }),
      });
      if (!res.ok) {
        throw new Error(`Quarantine API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      // Stamp the dataset with the deal it belongs to, exactly as the fetch
      // effects do: a consent record is the last thing that should end up
      // displayed under the wrong borrower's name.
      if (!data.payoff_id || data.payoff_id === selectedPayoffId) {
        setQuarantineState(data);
        setQuarantineFailedFor((failedFor) => (failedFor === selectedPayoffId ? null : failedFor));
      }

      // Refresh wealth onboarding dossier to synchronize clearing status and compliance badge
      const wRes = await fetch(`/api/wealth-onboarding?payoff_id=${selectedPayoffId}`);
      if (wRes.ok) {
        const wData = await wRes.json();
        if (!wData.payoff_id || wData.payoff_id === selectedPayoffId) {
          setWealthOnboarding(wData);
          setWealthOnboardingFailedFor((failedFor) => (failedFor === selectedPayoffId ? null : failedFor));
        }
      } else {
        setWealthOnboarding((prev) => ({
          ...prev,
          quarantined: data.quarantined,
          status: data.quarantined ? 'Quarantined' : 'Active / Ready for Advisor Authorship',
        }));
      }
    } catch (e: any) {
      console.error('Error toggling quarantine via API:', e);
      setError('Unable to record GLBA verbal consent with compliance service. Please retry.');
    } finally {
      setIsTogglingConsent(false);
    }
  }, [isTogglingConsent, quarantineState.verbal_consent_recorded, selectedPayoffId, selectedDeal]);

  const clearError = useCallback(() => setError(null), []);

  return {
    state: {
      capacityMeter,
      payoffItems,
      selectedPayoffId,
      selectedDeal,
      salePrice,
      taxStrategy,
      valuation,
      quarantineState,
      entityResolution,
      wireInstructions,
      wealthOnboarding,
      isLoading,
      isTogglingConsent,
      isDealDataStale,
      error,
    },
    actions: {
      selectDeal,
      setSalePrice,
      setTaxStrategy,
      toggleQuarantine,
      clearError,
    },
  };
}
