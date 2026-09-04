import React, { useState, useEffect } from 'react';
import { Header, AppView } from './components/Header';
import { PayoffPipelineView } from './views/PayoffPipelineView';
import { DealAnalysisView } from './views/DealAnalysisView';
import { RetentionSettlementView } from './views/RetentionSettlementView';
import { WealthQueueView } from './views/WealthQueueView';
import { WealthDossierView } from './views/WealthDossierView';
import { PortfolioStrategyView } from './views/PortfolioStrategyView';
import { ExecutiveAnalyticsView } from './views/ExecutiveAnalyticsView';

import {
  PersonaType,
  PayoffItem,
  CapacityMeter,
  EntityResolutionData,
  ValuationData,
  QuarantineState,
  WireInstructionData,
  WealthOnboardingData,
} from './types';

import {
  initialCapacityMeter,
  initialPayoffQueue,
  initialEntityResolution,
  initialValuation,
  initialQuarantineState,
  initialWireInstructions,
  initialWealthOnboarding,
} from './mockData';

export const App: React.FC = () => {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Persona & View Routing State
  const [persona, setPersona] = useState<PersonaType>('commercial_rm');
  const [activeView, setActiveView] = useState<AppView>('pipeline');

  // Domain State
  const [capacityMeter, setCapacityMeter] = useState<CapacityMeter>(initialCapacityMeter);
  const [payoffItems, setPayoffItems] = useState<PayoffItem[]>(initialPayoffQueue);
  const [selectedPayoffId, setSelectedPayoffId] = useState<string>('PO-2026-8821');

  // Valuation & Strategy State
  const [salePrice, setSalePrice] = useState<number>(8500000);
  const [taxStrategy, setTaxStrategy] = useState<'cash_out' | '1031_exchange'>('cash_out');
  const [valuation, setValuation] = useState<ValuationData>(initialValuation);

  // Compliance & Wire / Wealth State
  const [quarantineState, setQuarantineState] = useState<QuarantineState>(initialQuarantineState);
  const [entityResolution, setEntityResolution] = useState<EntityResolutionData>(initialEntityResolution);
  const [wireInstructions, setWireInstructions] = useState<WireInstructionData>(initialWireInstructions);
  const [wealthOnboarding, setWealthOnboarding] = useState<WealthOnboardingData>(initialWealthOnboarding);

  // Selected Deal Item
  const selectedDeal = payoffItems.find((p) => p.id === selectedPayoffId) || payoffItems[0];

  // Fetch initial data from backend API
  useEffect(() => {
    fetch('/api/payoffs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.capacity_meter) setCapacityMeter(data.capacity_meter);
          if (data.payoff_items) setPayoffItems(data.payoff_items);
        }
      })
      .catch((err) => console.warn('API /api/payoffs offline, using mock data:', err));

    fetch('/api/quarantine')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setQuarantineState(data);
      })
      .catch((err) => console.warn('API /api/quarantine offline, using mock data:', err));

    fetch('/api/entity-resolution?payoff_id=' + selectedPayoffId)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setEntityResolution(data);
      })
      .catch((err) => console.warn('API /api/entity-resolution offline, using mock data:', err));
  }, [selectedPayoffId]);

  // Recalculate valuation whenever sale price or tax strategy changes
  useEffect(() => {
    fetch('/api/valuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sale_price: salePrice,
        noi: 637500.0,
        cap_rate: 0.075,
        debt_payoff: 5214800.0,
        closing_cost_rate: 0.045,
        tax_strategy: taxStrategy,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ValuationData | null) => {
        if (data) {
          setValuation(data);
          setWireInstructions((prev) => ({
            ...prev,
            indicative_net_disbursement: data.net_equity_proceeds,
            account_title:
              taxStrategy === '1031_exchange'
                ? 'Vance Riverfront Properties IV LLC / Huntington 1031 Escrow'
                : 'Vance Riverfront Properties IV LLC / Max$aver ICS Sweep',
            account_number: taxStrategy === '1031_exchange' ? 'HBAN-QI-8819-01' : 'HBAN-4401-9921-00',
            special_instructions:
              taxStrategy === '1031_exchange'
                ? 'DO NOT DISBURSE OUTSIDE OF HUNTINGTON ESCROW. Funds held pursuant to IRC Sec. 1031 Qualified Escrow Agreement (Treas. Reg. Sec. 1.1031(k)-1(g)(3)).'
                : 'Disburse net seller equity directly into Huntington Max$aver ICS Sweep for FDIC passthrough protection.',
          }));
        }
      })
      .catch((err) => {
        console.warn('Valuation API call failed, recalculating locally:', err);
        const debt = 5214800.0;
        const closing = salePrice * 0.045;
        const netEquity = Math.max(0, salePrice - debt - closing);
        setValuation((prev) => ({
          ...prev,
          sale_price: salePrice,
          estimated_closing_costs: closing,
          net_equity_proceeds: netEquity,
          total_resolvable_position: netEquity + 2100000.0,
          strategy_type:
            taxStrategy === '1031_exchange'
              ? 'IRC Sec. 1031 Like-Kind Exchange'
              : 'Taxable Liquidity Event (Cash-Out)',
          strategy_product:
            taxStrategy === '1031_exchange'
              ? 'Huntington 1031 Qualified Escrow Depository (Partner QI Network)'
              : 'Huntington Commercial Max$aver Insured Cash Sweep (ICS)',
          yield_apy: taxStrategy === '1031_exchange' ? 4.75 : 4.85,
        }));
      });
  }, [salePrice, taxStrategy]);

  // Handle Quarantine Verbal Consent Toggle
  const handleToggleQuarantine = async () => {
    const newState = !quarantineState.verbal_consent_recorded;
    try {
      const res = await fetch('/api/quarantine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verbal_consent_recorded: newState,
          recorded_by: 'Greg Miller (Commercial RM)',
          client_notes: 'Affirmative opt-in recorded for wealth staging.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuarantineState(data);
        setWealthOnboarding((prev) => ({
          ...prev,
          quarantined: data.quarantined,
          status: data.quarantined ? 'Quarantined' : 'Active / Ready for Advisor Authorship',
        }));
        return;
      }
    } catch (e) {
      console.warn('Error toggling quarantine via API:', e);
    }

    // Local fallback toggle
    setQuarantineState((prev) => ({
      ...prev,
      quarantined: !prev.quarantined,
      verbal_consent_recorded: !prev.verbal_consent_recorded,
      recorded_by: !prev.verbal_consent_recorded ? 'Greg Miller (Commercial RM)' : null,
      consent_timestamp: !prev.verbal_consent_recorded ? new Date().toISOString() : null,
      audit_hash: !prev.verbal_consent_recorded
        ? 'SHA256-GLBA-HBAN-VERIFIED-LOCAL'
        : 'SHA256-GLBA-HBAN-99418-PENDING',
    }));
    setWealthOnboarding((prev) => ({
      ...prev,
      quarantined: !prev.quarantined,
      status: !prev.quarantined ? 'Quarantined' : 'Active / Ready for Advisor Authorship',
    }));
  };

  // View Navigation Callbacks
  const handleSelectDeal = (id: string) => {
    setSelectedPayoffId(id);
    setActiveView('analysis');
  };

  const handleProceedToRetention = () => {
    setActiveView('retention');
  };

  const handleHandoffToWealth = () => {
    setPersona('wealth_advisor');
    setActiveView('wealth_dossier');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1320] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
      
      {/* 1. Huntington Corporate Minimalist Header */}
      <Header
        persona={persona}
        onPersonaChange={(p) => {
          setPersona(p);
          if (p === 'commercial_rm' && activeView.startsWith('wealth_')) {
            setActiveView('pipeline');
          } else if (p === 'wealth_advisor' && ['pipeline', 'analysis', 'retention'].includes(activeView)) {
            setActiveView('wealth_queue');
          }
        }}
        activeView={activeView}
        onViewChange={setActiveView}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* 2. Main Focused Workspace: Exactly ONE Thing Each Page Does */}
      <main className="flex-1 w-full">
        {activeView === 'pipeline' && (
          <PayoffPipelineView
            items={payoffItems}
            selectedId={selectedPayoffId}
            onSelectDeal={handleSelectDeal}
          />
        )}

        {activeView === 'analysis' && (
          <DealAnalysisView
            deal={selectedDeal}
            entityData={entityResolution}
            onBackToPipeline={() => setActiveView('pipeline')}
            onProceedToRetention={handleProceedToRetention}
          />
        )}

        {activeView === 'retention' && (
          <RetentionSettlementView
            valuation={valuation}
            onSalePriceChange={setSalePrice}
            taxStrategy={taxStrategy}
            onTaxStrategyChange={setTaxStrategy}
            quarantineState={quarantineState}
            onToggleQuarantine={handleToggleQuarantine}
            wireInstructions={wireInstructions}
            onBackToAnalysis={() => setActiveView('analysis')}
            onHandoffToWealth={handleHandoffToWealth}
          />
        )}

        {activeView === 'wealth_queue' && (
          <WealthQueueView
            quarantineState={quarantineState}
            valuation={valuation}
            onOpenDossier={() => setActiveView('wealth_dossier')}
            onSwitchToCommercial={() => {
              setPersona('commercial_rm');
              setActiveView('retention');
            }}
          />
        )}

        {activeView === 'wealth_dossier' && (
          <WealthDossierView
            data={wealthOnboarding}
            onBackToQueue={() => setActiveView('wealth_queue')}
            onProceedToStrategy={() => setActiveView('wealth_strategy')}
          />
        )}

        {activeView === 'wealth_strategy' && (
          <PortfolioStrategyView
            data={wealthOnboarding}
            valuation={valuation}
            onBackToDossier={() => setActiveView('wealth_dossier')}
          />
        )}

        {activeView === 'executive' && (
          <ExecutiveAnalyticsView capacityMeter={capacityMeter} />
        )}
      </main>

    </div>
  );
};

export default App;
