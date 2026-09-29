import React from 'react';
import { Home, Users, FileText, Layers, Package, Settings } from 'lucide-react';

export type MainTab = 'dashboard' | 'clients' | 'quotes' | 'catalog' | 'products' | 'settings';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  quotesCount: number;
  clientsCount: number;
  referencesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  quotesCount,
  clientsCount,
  referencesCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as MainTab,
      label: 'Accueil',
      icon: Home,
    },
    {
      id: 'clients' as MainTab,
      label: 'Clients',
      icon: Users,
      badge: clientsCount,
    },
    {
      id: 'quotes' as MainTab,
      label: 'Devis',
      icon: FileText,
      badge: quotesCount,
    },
    {
      id: 'catalog' as MainTab,
      label: 'Profils',
      icon: Layers,
      badge: referencesCount,
    },
    {
      id: 'products' as MainTab,
      label: 'Modèles',
      icon: Package,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#082832]/95 backdrop-blur-md border-t border-cyan-900/40 text-slate-300 pb-safe">
      <div className="max-w-lg mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] relative transition-colors ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-cyan-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-cyan-300' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
