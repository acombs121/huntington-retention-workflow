import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Assumptions,
  DEFAULT_ASSUMPTIONS,
  CapacityBand,
  Funnel,
  NumericAssumptionKey,
  computeCapacityBand,
  computeFunnel,
  effectiveBlendedYield,
  statedBlendedYield,
} from '../lib/assumptions';

interface AssumptionsContextValue {
  assumptions: Assumptions;
  setAssumption: <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => void;
  /** Narrower setter for the numeric dials, so sliders need no type cast. */
  setNumericAssumption: (key: NumericAssumptionKey, value: number) => void;
  reset: () => void;
  /** True when any dial has been moved off the documented default. */
  isModified: boolean;
  /** Memoized derivations so every consumer sees identical numbers. */
  funnel: Funnel;
  capacity: CapacityBand;
  statedYield: number;
  effectiveYield: number;
}

const AssumptionsContext = createContext<AssumptionsContextValue | null>(null);

export const AssumptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);

  const setAssumption = useCallback(
    <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => {
      setAssumptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setNumericAssumption = useCallback((key: NumericAssumptionKey, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setAssumptions(DEFAULT_ASSUMPTIONS), []);

  const value = useMemo<AssumptionsContextValue>(() => {
    const isModified = (Object.keys(DEFAULT_ASSUMPTIONS) as (keyof Assumptions)[]).some(
      (k) => assumptions[k] !== DEFAULT_ASSUMPTIONS[k],
    );
    return {
      assumptions,
      setAssumption,
      setNumericAssumption,
      reset,
      isModified,
      funnel: computeFunnel(assumptions),
      capacity: computeCapacityBand(assumptions),
      statedYield: statedBlendedYield(assumptions),
      effectiveYield: effectiveBlendedYield(assumptions),
    };
  }, [assumptions, setAssumption, setNumericAssumption, reset]);

  return <AssumptionsContext.Provider value={value}>{children}</AssumptionsContext.Provider>;
};

export const useAssumptions = (): AssumptionsContextValue => {
  const ctx = useContext(AssumptionsContext);
  if (!ctx) {
    throw new Error('useAssumptions must be used within an AssumptionsProvider');
  }
  return ctx;
};
