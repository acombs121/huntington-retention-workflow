import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Header, AppView } from './components/Header';
import { PayoffPipelineView } from './views/PayoffPipelineView';
import { DealAnalysisView } from './views/DealAnalysisView';
import { RetentionSettlementView } from './views/RetentionSettlementView';
import { WealthQueueView } from './views/WealthQueueView';
import { WealthDossierView } from './views/WealthDossierView';
import { PortfolioStrategyView } from './views/PortfolioStrategyView';
import { ExecutiveAnalyticsView } from './views/ExecutiveAnalyticsView';
import { PersonaType } from './types';
import { useRetentionWorkflow } from './hooks/useRetentionWorkflow';

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

  // Deep Retention Workflow State Module
  const { state, actions } = useRetentionWorkflow();

  // Navigation Handlers
  const handleSelectDeal = (id: string) => {
    actions.selectDeal(id);
    setActiveView('analysis');
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
        {state.error && (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-200">{state.error}</p>
              </div>
              <button
                onClick={actions.clearError}
                className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                title="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeView === 'pipeline' && (
          <PayoffPipelineView
            items={state.payoffItems}
            selectedId={state.selectedPayoffId}
            onSelectDeal={handleSelectDeal}
          />
        )}

        {activeView === 'analysis' && (
          <DealAnalysisView
            deal={state.selectedDeal}
            entityData={state.entityResolution}
            onBackToPipeline={() => setActiveView('pipeline')}
            onProceedToRetention={() => setActiveView('retention')}
          />
        )}

        {activeView === 'retention' && (
          <RetentionSettlementView
            valuation={state.valuation}
            onSalePriceChange={actions.setSalePrice}
            taxStrategy={state.taxStrategy}
            onTaxStrategyChange={actions.setTaxStrategy}
            quarantineState={state.quarantineState}
            onToggleQuarantine={actions.toggleQuarantine}
            wireInstructions={state.wireInstructions}
            onBackToAnalysis={() => setActiveView('analysis')}
            onHandoffToWealth={handleHandoffToWealth}
            isTogglingConsent={state.isTogglingConsent}
            error={state.error}
            onClearError={actions.clearError}
          />
        )}

        {activeView === 'wealth_queue' && (
          <WealthQueueView
            deal={state.selectedDeal}
            wealthOnboarding={state.wealthOnboarding}
            quarantineState={state.quarantineState}
            valuation={state.valuation}
            onOpenDossier={() => setActiveView('wealth_dossier')}
            onSwitchToCommercial={() => {
              setPersona('commercial_rm');
              setActiveView('retention');
            }}
          />
        )}

        {activeView === 'wealth_dossier' && (
          <WealthDossierView
            data={state.wealthOnboarding}
            onBackToQueue={() => setActiveView('wealth_queue')}
            onProceedToStrategy={() => setActiveView('wealth_strategy')}
          />
        )}

        {activeView === 'wealth_strategy' && (
          <PortfolioStrategyView
            data={state.wealthOnboarding}
            valuation={state.valuation}
            onBackToDossier={() => setActiveView('wealth_dossier')}
          />
        )}

        {activeView === 'executive' && (
          <ExecutiveAnalyticsView capacityMeter={state.capacityMeter} />
        )}
      </main>

    </div>
  );
};

export default App;
