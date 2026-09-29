import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Plus, Settings } from 'lucide-react';
import { GlobalSettings } from '../types';
import logoEtoile from "../assets/images/logo_etoile.png";

interface NavbarProps {
  settings: GlobalSettings;
  activeTab: string;
  onNewQuoteClick: () => void;
  onSettingsClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeTab,
  onNewQuoteClick,
  onSettingsClick,
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#082832]/95 backdrop-blur-md border-b border-cyan-900/40 text-white px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-md">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-400/30 p-0.5 bg-gradient-to-tr from-[#082832] to-[#13677d] shrink-0">
          <img
            src={logoEtoile}
            alt="Etoile alu"
            className="w-full h-full object-cover rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-white font-sans">
              {settings.companyName || 'ETOILE ALU'}
            </span>
          </div>
          <p className="text-[10px] text-cyan-200/70 -mt-0.5 hidden sm:block">
            Calcul de devis & Menuiserie Aluminium
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Offline / Online Badge */}
        <div
          title={isOnline ? 'Local actif' : 'Hors-ligne'}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-slate-800/80 border border-slate-700/60"
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-medium hidden xs:inline">Local</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="text-amber-300 font-medium hidden xs:inline">Hors-ligne</span>
            </>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className={`h-9 w-9 rounded-xl flex items-center justify-center transition border ${
            activeTab === 'settings'
              ? 'bg-cyan-700 text-white border-cyan-500'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title="Paramètres globaux & Sauvegarde"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* New Quote Quick CTA */}
        <button
          onClick={onNewQuoteClick}
          className="h-9 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/40 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nouveau Devis</span>
          <span className="xs:hidden">Devis</span>
        </button>
      </div>
    </header>
  );
};
