import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  FileText,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { Quote, PaymentRecord, Client, GlobalSettings } from '../types';
import { formatAriary } from '../utils/calculationEngine';

interface ReportsViewProps {
  quotes: Quote[];
  payments: PaymentRecord[];
  clients: Client[];
  settings: GlobalSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  quotes,
  payments,
  clients,
  settings,
}) => {
  const totalTurnover = quotes.reduce((sum, q) => sum + (q.grandTotalAr || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amountAr, 0);
  const totalPending = Math.max(0, totalTurnover - totalCollected);
  const recoveryRate = totalTurnover > 0 ? Math.round((totalCollected / totalTurnover) * 100) : 0;

  // Payments by method
  const methodMap = new Map<string, number>();
  payments.forEach((p) => {
    const prev = methodMap.get(p.paymentMethod) || 0;
    methodMap.set(p.paymentMethod, prev + p.amountAr);
  });

  // Quotes by status
  const statusMap = new Map<string, number>();
  quotes.forEach((q) => {
    const prev = statusMap.get(q.status) || 0;
    statusMap.set(q.status, prev + 1);
  });

  const handlePrintReports = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Rapports Commerciaux & Financiers
          </h2>
          <p className="text-xs text-slate-400">
            Analyse des ventes, recouvrements et activité globale ETOILE ALU
          </p>
        </div>

        <button
          onClick={handlePrintReports}
          className="no-print w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 min-h-[44px]"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          Imprimer le rapport
        </button>
      </div>

      {/* Top Financial KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
          <span className="text-[11px] text-slate-400 block">Total Devis Émis</span>
          <div className="text-lg font-black text-white tabular-nums">
            {formatAriary(totalTurnover)}
          </div>
          <span className="text-[10px] text-slate-500">{quotes.length} devis</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] text-emerald-300 block">Total Encaissé</span>
          <div className="text-lg font-black text-emerald-400 tabular-nums">
            {formatAriary(totalCollected)}
          </div>
          <span className="text-[10px] text-emerald-400/80">{payments.length} paiements</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
          <span className="text-[11px] text-amber-300 block">Reste à Recouvrer</span>
          <div className="text-lg font-black text-amber-400 tabular-nums">
            {formatAriary(totalPending)}
          </div>
          <span className="text-[10px] text-slate-500">Créances clients</span>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
          <span className="text-[11px] text-cyan-200 block">Taux d'Encaissement</span>
          <div className="text-2xl font-black text-cyan-400 tabular-nums">{recoveryRate}%</div>
          <span className="text-[10px] text-cyan-300/80">Recouvrement global</span>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payment Methods Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Répartition par mode de paiement
          </h3>

          <div className="space-y-2 text-xs">
            {Array.from(methodMap.entries()).map(([method, amount]) => {
              const pct = totalCollected > 0 ? Math.round((amount / totalCollected) * 100) : 0;
              return (
                <div key={method} className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-white">{method}</span>
                    <span className="font-bold text-emerald-400 tabular-nums">{formatAriary(amount)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-right text-[10px] text-slate-400 mt-0.5">{pct}% des encaissements</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quotes by Status Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            État d'avancement des devis
          </h3>

          <div className="space-y-2 text-xs">
            {Array.from(statusMap.entries()).map(([status, count]) => {
              const pct = quotes.length > 0 ? Math.round((count / quotes.length) * 100) : 0;
              return (
                <div key={status} className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="font-semibold text-white uppercase text-[11px]">{status}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white tabular-nums">{count} devis</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
