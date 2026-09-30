import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Check, AlertCircle } from 'lucide-react';
import { Quote, GlobalSettings, PaymentReceipt } from '../types';
import { storageService } from '../services/storageService';
import { formatAriary } from '../utils/calculationEngine';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  settings: GlobalSettings;
  onPaymentSuccess: (receipt: PaymentReceipt) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  quote,
  settings,
  onPaymentSuccess,
}) => {
  const remaining = Math.max(0, quote.balanceRemainingAr ?? quote.grandTotalAr);

  const [amountAr, setAmountAr] = useState<number>(remaining > 0 ? remaining : quote.grandTotalAr);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    settings.paymentMethods[0] || 'Espèces'
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSetQuickAmount = (pct: number) => {
    if (pct === 0.5) {
      setAmountAr(Math.round(quote.grandTotalAr * 0.5));
    } else if (pct === 1) {
      setAmountAr(remaining);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountAr || amountAr <= 0) {
      setError('Veuillez saisir un montant de paiement valide supérieur à 0.');
      return;
    }

    const res = storageService.recordPayment(
      quote.id,
      amountAr,
      paymentMethod,
      notes.trim(),
      referenceNumber.trim()
    );

    if (res) {
      onPaymentSuccess(res.receipt);
      onClose();
    } else {
      setError('Erreur lors de l enregistrement du paiement.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-5 text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Enregistrer un Paiement</h3>
              <p className="text-xs text-cyan-300 font-mono">{quote.id} · {quote.clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Status Summary */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Total du devis :</span>
            <span className="font-bold text-white tabular-nums">{formatAriary(quote.grandTotalAr)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Déjà réglé :</span>
            <span className="font-bold text-emerald-400 tabular-nums">{formatAriary(quote.paidAmountAr || 0)}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-700 flex justify-between font-bold text-sm">
            <span className="text-slate-300">Reste à payer :</span>
            <span className="text-cyan-400 tabular-nums">{formatAriary(remaining)}</span>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <label className="text-slate-300 font-semibold">
                  Montant du paiement (Ar) <span className="text-red-400">*</span>
                </label>
                <span className="text-emerald-400 font-bold font-mono text-xs">
                  {formatAriary(amountAr)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetQuickAmount(0.5)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-medium border border-slate-700"
                >
                  50% Acompte
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickAmount(1)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-medium border border-slate-700"
                >
                  Solde total
                </button>
              </div>
            </div>

            <input
              type="number"
              min="1"
              step="any"
              value={amountAr}
              onChange={(e) => setAmountAr(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-base focus:outline-none focus:border-cyan-500 tabular-nums min-h-[44px]"
              autoFocus
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Mode de paiement <span className="text-red-400">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs min-h-[44px]"
            >
              {settings.paymentMethods.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Reference / Transaction ID */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              N° Référence / Chèque / Transaction (optionnel)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Ex: MV-928371, CHQ-48291..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs min-h-[40px]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Remarque sur le reçu (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Acompte 50% fabrication menuiserie..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs min-h-[40px]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition min-h-[44px]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold transition flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Check className="w-4 h-4" />
              Valider & Générer Reçu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
