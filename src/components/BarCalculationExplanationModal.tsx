import React from 'react';
import { X, Layers, Ruler, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProductCalculationResult } from '../types';
import { formatAriary, formatNumber } from '../utils/calculationEngine';

interface BarCalculationExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  calc: ProductCalculationResult;
}

export const BarCalculationExplanationModal: React.FC<BarCalculationExplanationModalProps> = ({
  isOpen,
  onClose,
  productName,
  calc,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0c3e4f] to-[#082832] border-b border-cyan-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Plan de Découpe & Calepinage des Profils
              </h3>
              <p className="text-xs text-cyan-200/80">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Global Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col">
              <span className="text-[11px] text-slate-400">Profils distincts</span>
              <span className="text-base font-bold text-cyan-300 tabular-nums">
                {calc.profileCalculations.length} profil(s)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col">
              <span className="text-[11px] text-slate-400">Total barres</span>
              <span className="text-base font-bold text-amber-300 tabular-nums">
                {calc.totalBarsNeeded} {calc.totalBarsNeeded > 1 ? 'barres' : 'barre'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col">
              <span className="text-[11px] text-emerald-200">Prix total profilés</span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                {formatAriary(calc.totalBarsCostAr)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col">
              <span className="text-[11px] text-cyan-200">Total Produit HT</span>
              <span className="text-base font-bold text-cyan-400 tabular-nums">
                {formatAriary(calc.totalProductPriceAr)}
              </span>
            </div>
          </div>

          {/* Grouped Profile Breakdown (Sections 9, 10, 16, 17) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Répartition des coupes et gestion des chutes par référence
            </h4>

            {calc.profileCalculations.map((pCalc, pIdx) => (
              <div
                key={pIdx}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3"
              >
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-700/60 gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {pCalc.profileCode}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {pCalc.profileName} ({pCalc.categoryName})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-300">
                      Barre : <strong className="text-white font-mono">{formatNumber(pCalc.barLengthMm)} mm</strong>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">
                      Prix : <strong className="text-emerald-400">{formatAriary(pCalc.barPriceAr)}</strong>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="font-bold text-cyan-400">
                      {pCalc.barsNeeded} barre(s) = {formatAriary(pCalc.barsCostAr)}
                    </span>
                  </div>
                </div>

                {/* Longueurs nécessaires pour ce profil */}
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5">
                    <span>
                      Longueurs requises ({pCalc.totalPieces} morceaux) :
                    </span>
                    <span className="font-mono font-medium text-slate-300">
                      Total : {formatNumber(pCalc.totalLinearMm)} mm
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {pCalc.cuts.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                      >
                        <span className="text-cyan-400 font-bold">{c.lengthMm} mm</span>
                        <span className="text-slate-500 text-[10px]">({c.sourceDimension})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Plan de coupe barre par barre (Section 10 prompt example) */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Optimisation de coupe dans les barres de {pCalc.barLengthMm} mm :
                  </span>

                  {pCalc.cuttingPlans.map((plan) => {
                    const usedPct = Math.min(100, Math.round((plan.usedLengthMm / pCalc.barLengthMm) * 100));

                    return (
                      <div
                        key={plan.barNumber}
                        className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-cyan-700/40 text-cyan-300 inline-flex items-center justify-center text-[10px]">
                              {plan.barNumber}
                            </span>
                            Barre #{plan.barNumber} : {plan.cuts.map((c) => `${c.lengthMm}`).join(' + ')} = {formatNumber(plan.usedLengthMm)} mm
                          </span>
                          <span className="text-amber-400/90 font-medium tabular-nums text-[11px]">
                            Chute : {formatNumber(plan.remainingWasteMm)} mm ({plan.wastePercentage}%)
                          </span>
                        </div>

                        {/* Visual bar progress */}
                        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex border border-slate-700">
                          {plan.cuts.map((c, cutIdx) => {
                            const pct = (c.lengthMm / pCalc.barLengthMm) * 100;
                            const colors = ['bg-cyan-500', 'bg-teal-500', 'bg-sky-500', 'bg-blue-500'];
                            return (
                              <div
                                key={cutIdx}
                                style={{ width: `${pct}%` }}
                                className={`${colors[cutIdx % colors.length]} h-full border-r border-slate-900/50`}
                                title={`${c.label}: ${c.lengthMm} mm`}
                              />
                            );
                          })}
                          <div style={{ width: `${100 - usedPct}%` }} className="bg-slate-800/40 h-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Accessories & Glass Rollup */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              Récapitulatif Financier du Produit
            </h4>

            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Total profilés aluminium ({calc.totalBarsNeeded} barres) :</span>
                <strong className="text-white tabular-nums">{formatAriary(calc.totalBarsCostAr)}</strong>
              </div>

              {calc.glassCostAr > 0 && (
                <div className="flex justify-between">
                  <span>Vitrage ({calc.selectedGlassName || 'Vitre'} - {calc.totalGlassAreaM2} m²) :</span>
                  <strong className="text-white tabular-nums">{formatAriary(calc.glassCostAr)}</strong>
                </div>
              )}

              {calc.accessoriesCalculations.map((acc, aIdx) => (
                <div key={aIdx} className="flex justify-between text-slate-400">
                  <span>{acc.name} ({acc.quantity} {acc.unit}) :</span>
                  <span className="text-slate-200 tabular-nums">{formatAriary(acc.totalAr)}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-bold text-cyan-400">
                <span>SOUS-TOTAL PRODUIT :</span>
                <span className="tabular-nums">{formatAriary(calc.totalProductPriceAr)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-sm transition active:scale-98 min-h-[44px] flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
