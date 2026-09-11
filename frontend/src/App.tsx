import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Header, AppView } from './components/Header';
import { PayoffPipelineView } from './views/PayoffPipelineView';
import { DealAnalysisView } from './views/DealAnalysisView';
import { AdvisorRoutingView } from './views/AdvisorRoutingView';
import { RetentionSettlementView } from './views/RetentionSettlementView';
import { WealthQueueView } from './views/WealthQueueView';
import { WealthDossierView } from './views/WealthDossierView';
import { ExecutiveAnalyticsView } from './views/ExecutiveAnalyticsView';
import { PersonaType } from './types';
import { useRetentionWorkflow } from './hooks/useRetentionWorkflow';
import { AssumptionsProvider } from './context/AssumptionsContext';

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
    // The assumption model must sit above both the Header (which owns the Admin
    // Panel dials) and <main> (which renders Executive Analytics), so the room can
    // change an input in one place and see every derived figure move together.
    <AssumptionsProvider>
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#012415] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
      
      {/* 1. Huntington Corporate Minimalist Header */}
      <Header
        persona={persona}
        onPersonaChange={(p) => {
          setPersona(p);
          if (p === 'commercial_rm' && activeView.startsWith('wealth_')) {
            setActiveView('pipeline');
          } else if (p === 'wealth_advisor' && ['pipeline', 'analysis', 'routing', 'retention'].includes(activeView)) {
            setActiveView('wealth_queue');
          }
        }}
        activeView={activeView}
        onViewChange={setActiveView}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isQuarantined={state.quarantineState?.quarantined}
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
            onSetSelectedDeal={actions.selectDeal}
            scannedCount={state.capacityMeter?.screened_events_book}
            userName={state.selectedDeal?.commercial_rm?.split(' ')[0] || 'Greg'}
          />
        )}

        {activeView === 'analysis' && (
          <DealAnalysisView
            deal={state.selectedDeal}
            entityData={state.entityResolution}
            onBackToPipeline={() => setActiveView('pipeline')}
            onProceedToRetention={() => setActiveView('routing')}
          />
        )}

        {activeView === 'routing' && (
          <AdvisorRoutingView
            deal={state.selectedDeal}
            entityData={state.entityResolution}
            onBackToAnalysis={() => setActiveView('analysis')}
            onProceedToRetention={() => setActiveView('retention')}
          />
        )}

        {activeView === 'retention' && (
          <RetentionSettlementView
            deal={state.selectedDeal}
            valuation={state.valuation}
            onSalePriceChange={actions.setSalePrice}
            taxStrategy={state.taxStrategy}
            onTaxStrategyChange={actions.setTaxStrategy}
            quarantineState={state.quarantineState}
            onToggleQuarantine={actions.toggleQuarantine}
            wireInstructions={state.wireInstructions}
            onBackToAnalysis={() => setActiveView('routing')}
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
          state.quarantineState?.quarantined ? (
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
          ) : (
            <WealthDossierView
              data={state.wealthOnboarding}
              onBackToQueue={() => setActiveView('wealth_queue')}
            />
          )
        )}

        {activeView === 'executive' && (
          <ExecutiveAnalyticsView
            capacityMeter={state.capacityMeter}
            onBackToPipeline={() => setActiveView('pipeline')}
          />
        )}
      </main>

      {/* Persistent disclaimer. Every figure, client, and document in this build is
          fabricated for demonstration. This must remain visible on every view so a
          screenshot taken out of context cannot be mistaken for real bank data. */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#012415]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Confidential working prototype &mdash; illustrative only.
            </span>{' '}
            All borrowers, entities, balances, valuations, advisors, and documents shown are
            fabricated for demonstration purposes and do not represent real customers or real
            Huntington Bancshares data. Figures are internal management estimates, not financial
            guidance, an appraisal, or an investment recommendation. Not for external distribution.
          </p>
        </div>
      </footer>

    </div>
    </AssumptionsProvider>
  );
};

export default App;
