import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Search,
  Plus,
  Printer,
  Share2,
  Calendar,
  X,
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { PaymentRecord, PaymentReceipt, Quote, GlobalSettings } from '../types';
import { storageService } from '../services/storageService';
import { formatAriary } from '../utils/calculationEngine';
import { ReceiptModal } from '../components/ReceiptModal';
import { PaymentModal } from '../components/PaymentModal';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  receipts: PaymentReceipt[];
  quotes: Quote[];
  settings: GlobalSettings;
  onRefresh: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  receipts,
  quotes,
  settings,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'receipts' | 'payments'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  // New Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState<Quote | null>(null);

  const totalCollected = payments.reduce((sum, p) => sum + p.amountAr, 0);

  // Filter receipts
  const filteredReceipts = receipts.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.quoteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date.includes(searchQuery) ||
      r.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter payments
  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.quoteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.date.includes(searchQuery) ||
      p.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPaymentForQuote = () => {
    // Pick the first quote that has balance remaining or validated
    const eligibleQuote = quotes.find((q) => (q.balanceRemainingAr ?? q.grandTotalAr) > 0) || quotes[0];
    if (!eligibleQuote) {
      alert('Veuillez créer au moins un devis avant d enregistrer un paiement.');
      return;
    }
    setSelectedQuoteForPayment(eligibleQuote);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (newReceipt: PaymentReceipt) => {
    onRefresh();
    setSelectedReceipt(newReceipt);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Gestion des Règlements & Reçus
          </h2>
          <p className="text-xs text-slate-400">
            Suivi des encaissements, acomptes, et génération de reçus certifiés ETOILE ALU
          </p>
        </div>

        <button
          onClick={handleOpenPaymentForQuote}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          + Enregistrer un règlement
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30">
          <span className="text-[11px] text-slate-400 block mb-1">Total Encaissé</span>
          <div className="text-xl font-black text-emerald-400 tabular-nums">
            {formatAriary(totalCollected)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{payments.length} règlements</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
          <span className="text-[11px] text-slate-400 block mb-1">Reçus Émis</span>
          <div className="text-xl font-black text-cyan-400 tabular-nums">{receipts.length}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Format PDF & WhatsApp</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
          <span className="text-[11px] text-slate-400 block mb-1">Reste à Encaisser Global</span>
          <div className="text-xl font-black text-amber-400 tabular-nums">
            {formatAriary(
              quotes.reduce((sum, q) => sum + (q.balanceRemainingAr ?? q.grandTotalAr), 0)
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Sur devis en cours</span>
        </div>
      </div>

      {/* Sub tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par n° reçu (REC-...), devis, client, mode..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 border border-slate-700 rounded-xl">
          <button
            onClick={() => setActiveSubTab('receipts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'receipts'
                ? 'bg-cyan-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reçus de Paiement ({receipts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('payments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'payments'
                ? 'bg-cyan-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Historique Règlements ({payments.length})
          </button>
        </div>
      </div>

      {/* Receipts List */}
      {activeSubTab === 'receipts' && (
        <div className="space-y-2.5">
          {filteredReceipts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-2">
              <p className="text-sm text-slate-400">Aucun reçu enregistré.</p>
              <button
                onClick={handleOpenPaymentForQuote}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Enregistrer le premier paiement
              </button>
            </div>
          ) : (
            filteredReceipts.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedReceipt(rec)}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                      {rec.id}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-cyan-300 font-mono font-medium">
                      Devis : {rec.quoteId}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">{rec.date}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{rec.clientName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mode : <strong className="text-slate-200">{rec.paymentMethod}</strong>
                    {rec.notes && ` — ${rec.notes}`}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-700/60 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Montant reçu
                    </span>
                    <span className="text-base font-black text-emerald-400 tabular-nums">
                      {formatAriary(rec.paidAmountAr)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Reste : {formatAriary(rec.balanceRemainingAr)}
                    </span>
                  </div>

                  <div className="p-2 text-cyan-400 hover:text-white rounded-lg hover:bg-slate-700 transition">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Payments History List */}
      {activeSubTab === 'payments' && (
        <div className="space-y-2.5">
          {filteredPayments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center">
              <p className="text-sm text-slate-400">Aucun règlement enregistré.</p>
            </div>
          ) : (
            filteredPayments.map((pay) => (
              <div
                key={pay.id}
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-bold text-cyan-400">{pay.id}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{pay.date}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-medium text-[10px]">
                      {pay.paymentMethod}
                    </span>
                  </div>
                  <div className="font-semibold text-white">
                    {pay.clientName} (Devis : {pay.quoteId})
                  </div>
                  {pay.referenceNumber && (
                    <div className="text-[11px] text-slate-400">Réf : {pay.referenceNumber}</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-emerald-400 tabular-nums">
                    {formatAriary(pay.amountAr)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Reçu N° {pay.receiptId}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
          settings={settings}
        />
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedQuoteForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedQuoteForPayment(null);
          }}
          quote={selectedQuoteForPayment}
          settings={settings}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
