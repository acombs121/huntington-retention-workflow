import React from 'react';
import { PersonaType } from '../types';
import { AdminPanel } from './AdminPanel';
import { Moon, Sun, Briefcase, UserCheck } from 'lucide-react';

export type AppView =
  | 'pipeline'
  | 'analysis'
  | 'retention'
  | 'wealth_queue'
  | 'wealth_dossier'
  | 'wealth_strategy'
  | 'executive';

interface HeaderProps {
  persona: PersonaType;
  onPersonaChange: (p: PersonaType) => void;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isQuarantined?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  persona,
  onPersonaChange,
  activeView,
  onViewChange,
  isDark,
  onToggleTheme,
  isQuarantined = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#003319] bg-[#004724] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Huntington Bank Official Logo & Horizon Title */}
        <div
          onClick={() => onViewChange(persona === 'commercial_rm' ? 'pipeline' : 'wealth_queue')}
          className="flex items-center gap-3.5 cursor-pointer select-none group py-2 shrink-0"
        >
          <img
            src="/huntington-logo-white.png"
            alt="Huntington Bank"
            className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="h-7 w-px bg-white/20 hidden sm:block" />
          <span className="hidden sm:inline-block font-black italic tracking-tight text-white text-2xl leading-none select-none relative -top-[2px]">
            Horizon
          </span>
        </div>

        {/* Center: Contextual Navigation Tabs (Swiss Editorial Underline Indicators - 3-Step Workflows) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {persona === 'commercial_rm' ? (
            <>
              <button
                onClick={() => onViewChange('pipeline')}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  activeView === 'pipeline'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Payoff Pipeline
                {activeView === 'pipeline' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
              <button
                onClick={() => onViewChange('analysis')}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  activeView === 'analysis'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Deal Analysis
                {activeView === 'analysis' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
              <button
                onClick={() => onViewChange('retention')}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  activeView === 'retention'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Retention &amp; Settlement
                {activeView === 'retention' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onViewChange('wealth_queue')}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  activeView === 'wealth_queue'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Client Queue
                {activeView === 'wealth_queue' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
              <button
                disabled={isQuarantined}
                onClick={() => !isQuarantined && onViewChange('wealth_dossier')}
                title={isQuarantined ? "Locked by GLBA Privacy Barrier (Commercial Client Opt-In Required)" : "Onboarding Dossier"}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  isQuarantined
                    ? 'opacity-40 cursor-not-allowed text-emerald-300/40'
                    : activeView === 'wealth_dossier'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Onboarding Dossier {isQuarantined && "(Locked)"}
                {!isQuarantined && activeView === 'wealth_dossier' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
              <button
                disabled={isQuarantined}
                onClick={() => !isQuarantined && onViewChange('wealth_strategy')}
                title={isQuarantined ? "Locked by GLBA Privacy Barrier (Commercial Client Opt-In Required)" : "Portfolio Strategy"}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  isQuarantined
                    ? 'opacity-40 cursor-not-allowed text-emerald-300/40'
                    : activeView === 'wealth_strategy'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Portfolio Strategy {isQuarantined && "(Locked)"}
                {!isQuarantined && activeView === 'wealth_strategy' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
            </>
          )}
        </nav>

        {/* Right: Persona Switcher, Theme Toggle, and Mandatory Admin Panel Gear */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* Dual Persona Switcher (Deep Forest with Corporate Green active - No White Oval) */}
          <div className="flex items-center bg-[#003319] p-1 rounded-full border border-emerald-800/80 shrink-0">
            <button
              onClick={() => {
                onPersonaChange('commercial_rm');
                if (activeView.startsWith('wealth_') || activeView === 'executive') {
                  onViewChange('pipeline');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
                persona === 'commercial_rm' && activeView !== 'executive'
                  ? 'bg-[#006738] text-white font-bold border border-[#7ECF1C]/40 shadow-sm'
                  : 'text-emerald-200/75 hover:text-white font-medium'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Commercial RM</span>
            </button>
            <button
              onClick={() => {
                onPersonaChange('wealth_advisor');
                if (['pipeline', 'analysis', 'retention', 'executive'].includes(activeView)) {
                  onViewChange('wealth_queue');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
                persona === 'wealth_advisor' && activeView !== 'executive'
                  ? 'bg-[#006738] text-white font-bold border border-[#7ECF1C]/40 shadow-sm'
                  : 'text-emerald-200/75 hover:text-white font-medium'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Private Wealth</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition shrink-0"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#A9D42C]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mandatory Admin Panel Gear Icon (far right) */}
          <AdminPanel
            appName="Huntington Horizon"
            brandKitUrl="/brand_kit.html"
            demoScriptUrl="/demo_script.html"
            overviewUrl="/overview.html"
            onViewExecutive={() => onViewChange('executive')}
          />
        </div>

      </div>
    </header>
  );
};

