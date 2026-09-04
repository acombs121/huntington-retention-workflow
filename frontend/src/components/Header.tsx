import React, { useState, useEffect } from 'react';
import { PersonaType } from '../types';
import { AdminPanel } from './AdminPanel';
import { Moon, Sun, Briefcase, UserCheck, Menu, X } from 'lucide-react';

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
}

export const Header: React.FC<HeaderProps> = ({
  persona,
  onPersonaChange,
  activeView,
  onViewChange,
  isDark,
  onToggleTheme,
}) => {
  // State for dynamically rendered white logo URL
  const [whiteLogoUrl, setWhiteLogoUrl] = useState<string>('/huntington-logo-white.png');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Use useEffect to load the Huntington Bank logo and dynamically transform pixels to pure white
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/huntington-logo.png';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Transform every dark non-transparent pixel to pure white (#FFFFFF)
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            data[i] = 255;     // Red
            data[i + 1] = 255; // Green
            data[i + 2] = 255; // Blue
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setWhiteLogoUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas dynamic logo color transformation fallback:', err);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#003319] bg-[#004724] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-22 flex items-center justify-between">
        
        {/* Left: Huntington Bank Official Logo & Horizon Title */}
        <div
          onClick={() => onViewChange(persona === 'commercial_rm' ? 'pipeline' : 'wealth_queue')}
          className="flex items-center gap-4 cursor-pointer select-none group py-2"
        >
          <img
            src={whiteLogoUrl}
            alt="Huntington Bank"
            className="h-11 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="h-7 w-px bg-white/20 hidden sm:block" />
          <span className="hidden sm:inline-block font-black italic tracking-tight text-white text-2xl leading-none select-none relative -top-[3px]">
            Horizon
          </span>
        </div>

        {/* Center: Contextual Navigation Tabs (Swiss Editorial Underline Indicators - No White Ovals) */}
        <nav className="hidden lg:flex items-center gap-7">
          {persona === 'commercial_rm' ? (
            <>
              <button
                onClick={() => onViewChange('pipeline')}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider transition ${
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
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider transition ${
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
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider transition ${
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
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider transition ${
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
                onClick={() => onViewChange('wealth_dossier')}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'wealth_dossier'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Onboarding Dossier
                {activeView === 'wealth_dossier' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
              <button
                onClick={() => onViewChange('wealth_strategy')}
                className={`relative py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'wealth_strategy'
                    ? 'text-white'
                    : 'text-emerald-200/75 hover:text-white'
                }`}
              >
                Portfolio Strategy
                {activeView === 'wealth_strategy' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7ECF1C] rounded-full" />
                )}
              </button>
            </>
          )}
        </nav>

        {/* Right: Persona Switcher, Theme Toggle, and Mandatory Admin Panel Gear */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Dual Persona Switcher (Deep Forest with Corporate Green active - No White Oval) */}
          <div className="flex items-center bg-[#003319] p-1 rounded-full border border-emerald-800/80">
            <button
              onClick={() => {
                onPersonaChange('commercial_rm');
                if (activeView.startsWith('wealth_')) {
                  onViewChange('pipeline');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition ${
                persona === 'commercial_rm'
                  ? 'bg-[#006738] text-white font-bold border border-[#7ECF1C]/40 shadow-sm'
                  : 'text-emerald-200/75 hover:text-white font-medium'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Commercial RM</span>
            </button>
            <button
              onClick={() => {
                onPersonaChange('wealth_advisor');
                if (['pipeline', 'analysis', 'retention'].includes(activeView)) {
                  onViewChange('wealth_queue');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition ${
                persona === 'wealth_advisor'
                  ? 'bg-[#006738] text-white font-bold border border-[#7ECF1C]/40 shadow-sm'
                  : 'text-emerald-200/75 hover:text-white font-medium'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Private Wealth</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#A9D42C]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mandatory Admin Panel Gear Icon */}
          <AdminPanel
            appName="Huntington Horizon"
            brandKitUrl="/brand_kit.html"
            demoScriptUrl="/demo_script.html"
          />

          {/* Mobile Navigation Toggle (visible on < lg screens) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#003319] border-t border-emerald-800/80 px-6 py-4 space-y-1 shadow-lg">
          {persona === 'commercial_rm' ? (
            <>
              <button
                onClick={() => { onViewChange('pipeline'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'pipeline' ? 'bg-[#006738] text-white' : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                Payoff Pipeline
              </button>
              <button
                onClick={() => { onViewChange('analysis'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'analysis' ? 'bg-[#006738] text-white' : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                Deal Analysis
              </button>
              <button
                onClick={() => { onViewChange('retention'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'retention' ? 'bg-[#006738] text-white' : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                Retention &amp; Settlement
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onViewChange('wealth_queue'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'wealth_queue' ? 'bg-[#006738] text-white' : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                Client Queue
              </button>
              <button
                onClick={() => { onViewChange('wealth_dossier'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'wealth_dossier' ? 'bg-[#006738] text-white' : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                Onboarding Dossier
              </button>
              <button
                onClick={() => { onViewChange('wealth_strategy'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeView === 'wealth_strategy' ? 'bg-[#006738] text-white' : 'text-emerald-200/80 hover:text-white'
                }`}
              >
                Portfolio Strategy
              </button>
            </>
          )}
          <button
            onClick={() => { onViewChange('executive'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeView === 'executive' ? 'bg-[#006738] text-white' : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            Executive Briefing
          </button>
        </div>
      )}
    </header>
  );
};

