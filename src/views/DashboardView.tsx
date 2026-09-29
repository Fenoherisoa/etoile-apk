import React from 'react';
import {
  Users,
  FileText,
  Package,
  Layers,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Client, Quote, ProductTemplate, ProfileReference, GlobalSettings } from '../types';
import { formatAriary } from '../utils/calculationEngine';

interface DashboardViewProps {
  clients: Client[];
  quotes: Quote[];
  products: ProductTemplate[];
  references: ProfileReference[];
  settings: GlobalSettings;
  onNavigate: (tab: 'dashboard' | 'clients' | 'quotes' | 'catalog' | 'products' | 'settings') => void;
  onOpenQuote: (quote: Quote) => void;
  onNewQuote: () => void;
  onNewClient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  quotes,
  products,
  references,
  settings,
  onNavigate,
  onOpenQuote,
  onNewQuote,
  onNewClient,
}) => {
  const totalRevenue = quotes.reduce((sum, q) => sum + (q.grandTotalAr || 0), 0);
  const validatedQuotes = quotes.filter((q) => q.status === 'valide' || q.status === 'accepte' || q.status === 'paye' || q.status === 'termine' || q.isValidated);
  const recentQuotes = [...quotes].slice(0, 4);

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto">
      {/* Hero Welcome Card */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-800/40 bg-gradient-to-br from-[#0c3e4f] to-[#082832] p-5 shadow-xl text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none overflow-hidden">
          <img
            src="/src/assets/images/alu_workshop_banner_1790594559339.jpg"
            alt="Atelier"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 space-y-3 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Application Android Hors-Ligne</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Bienvenue chez Etoile Alu
          </h2>

          <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed">
            Calculez vos devis avec précision à partir des dimensions, du calepinage des profils T45, K45, B45 et des accessoires configurés.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={onNewQuote}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/60 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              Créer un devis
            </button>
            <button
              onClick={onNewClient}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 active:scale-95 transition"
            >
              <Users className="w-4 h-4" />
              Ajouter client
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigate('clients')}
          className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Clients</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">{clients.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Gérer</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('quotes')}
          className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Devis</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">{quotes.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{validatedQuotes.length} validés</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('catalog')}
          className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Profils</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">{references.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Références</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-cyan-500/30">
          <div className="flex items-center justify-between text-cyan-300 mb-1.5">
            <span className="text-xs font-medium">Chiffre Devis</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 tabular-nums truncate">
            {formatAriary(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cumul total</div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('catalog')}
          className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:bg-slate-800 flex items-center gap-3.5 text-left transition active:scale-98 min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">1. Catalogue Profils</h4>
            <p className="text-xs text-slate-400">T45, K45, B45, P01, PA01...</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:bg-slate-800 flex items-center gap-3.5 text-left transition active:scale-98 min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">2. Modèles Assemblés</h4>
            <p className="text-xs text-slate-400">{products.length} configurations de produits</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:bg-slate-800 flex items-center gap-3.5 text-left transition active:scale-98 min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">3. Paramètres & Prix</h4>
            <p className="text-xs text-slate-400">Barres {settings.standardBarLengthMm}mm, Vitres, CSV</p>
          </div>
        </button>
      </div>

      {/* Recent Quotes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Derniers devis enregistrés
          </h3>
          <button
            onClick={() => onNavigate('quotes')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            Voir tout ({quotes.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-2">
            <p className="text-sm text-slate-400">Aucun devis enregistré pour l'instant.</p>
            <button
              onClick={onNewQuote}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Créer le premier devis
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentQuotes.map((q) => (
              <div
                key={q.id}
                onClick={() => onOpenQuote(q)}
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 transition flex items-center justify-between cursor-pointer active:scale-99"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">{q.id}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">{q.date}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{q.clientName}</h4>
                  <p className="text-xs text-slate-400">
                    {q.items.length} {q.items.length > 1 ? 'produits' : 'produit'}
                    {q.items[0] && ` (${q.items[0].productName})`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">
                    {formatAriary(q.grandTotalAr)}
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      q.status === 'valide'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : q.status === 'paye' || q.status === 'termine'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : q.status === 'partiellement_paye'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : q.status === 'accepte'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {q.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
