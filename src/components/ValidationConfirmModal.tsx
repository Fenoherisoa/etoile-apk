import React from 'react';
import { ShieldCheck, Check, X, Lock } from 'lucide-react';
import { Quote } from '../types';
import { formatAriary } from '../utils/calculationEngine';

interface ValidationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  onConfirm: () => void;
}

export const ValidationConfirmModal: React.FC<ValidationConfirmModalProps> = ({
  isOpen,
  onClose,
  quote,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-5 text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Validation Définitive</h3>
          <p className="text-xs text-slate-300 mt-1">
            Voulez-vous valider définitivement ce devis ?
          </p>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 mt-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Devis N° :</span>
              <strong className="text-cyan-400 font-mono">{quote.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Client :</span>
              <strong className="text-white">{quote.clientName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Montant Total :</span>
              <strong className="text-emerald-400 tabular-nums">{formatAriary(quote.grandTotalAr)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
            <Lock className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Après validation, le devis sera verrouillé pour éviter les modifications accidentelles.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition min-h-[44px] text-xs"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] text-xs"
          >
            <Check className="w-4 h-4" />
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};
