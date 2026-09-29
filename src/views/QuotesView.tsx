import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  Calendar,
  X,
  ShieldCheck,
  DollarSign,
  Copy,
  Lock,
  Share2,
  Download,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Quote, GlobalSettings, PaymentReceipt } from '../types';
import { storageService } from '../services/storageService';
import { formatAriary } from '../utils/calculationEngine';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { QuotePrintModal } from '../components/QuotePrintModal';
import { ValidationConfirmModal } from '../components/ValidationConfirmModal';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { generateQuotePDF } from '../utils/pdfExport';
import { PaymentsView } from './PaymentsView';

interface QuotesViewProps {
  quotes: Quote[];
  settings: GlobalSettings;
  onRefresh: () => void;
  onOpenQuote: (quote: Quote) => void;
  onNewQuote: () => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  settings,
  onRefresh,
  onOpenQuote,
  onNewQuote,
}) => {
  const [viewTab, setViewTab] = useState<'quotes' | 'payments'>('quotes');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [quoteToPrint, setQuoteToPrint] = useState<Quote | null>(null);

  // Validation modal state
  const [quoteToValidate, setQuoteToValidate] = useState<Quote | null>(null);

  // Payment modal state
  const [quoteForPayment, setQuoteForPayment] = useState<Quote | null>(null);
  const [issuedReceipt, setIssuedReceipt] = useState<PaymentReceipt | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.date.includes(searchQuery) ||
      (q.items && q.items.some((it) => it.productName.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteQuote = () => {
    if (!quoteToDelete) return;
    storageService.deleteQuote(quoteToDelete.id);
    setQuoteToDelete(null);
    onRefresh();
  };

  const handleConfirmValidation = () => {
    if (!quoteToValidate) return;
    storageService.validateQuote(quoteToValidate.id);
    setQuoteToValidate(null);
    onRefresh();
  };

  const handleCreateNewVersion = (quoteId: string) => {
    const newVersion = storageService.createNewQuoteVersion(quoteId);
    if (newVersion) {
      onRefresh();
      onOpenQuote(newVersion);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Office Switcher: Devis vs Règlements & Reçus */}
      <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 max-w-md">
        <button
          type="button"
          onClick={() => setViewTab('quotes')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            viewTab === 'quotes'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Devis ({quotes.length})
        </button>
        <button
          type="button"
          onClick={() => setViewTab('payments')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            viewTab === 'payments'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Règlements & Reçus ({storageService.getPayments().length})
        </button>
      </div>

      {viewTab === 'payments' ? (
        <PaymentsView
          payments={storageService.getPayments()}
          receipts={storageService.getReceipts()}
          quotes={quotes}
          settings={settings}
          onRefresh={onRefresh}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Gestion des Devis Commerciaux
              </h2>
              <p className="text-xs text-slate-400">
                {quotes.length} {quotes.length > 1 ? 'devis enregistrés' : 'devis enregistré'} (Validation, règlements et versions)
              </p>
            </div>

            <button
              onClick={onNewQuote}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 active:scale-95 transition min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              + Nouveau Devis
            </button>
          </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par n° (DEV-...), client, produit..."
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

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 border border-slate-700 rounded-xl overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'brouillon', label: 'Brouillons' },
            { id: 'valide', label: 'Validés' },
            { id: 'partiellement_paye', label: 'Partiel' },
            { id: 'paye', label: 'Payés' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
                statusFilter === tab.id
                  ? 'bg-cyan-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-2">
          <p className="text-sm text-slate-400">
            {searchQuery ? 'Aucun devis ne correspond aux critères.' : 'Aucun devis créé pour le moment.'}
          </p>
          <button
            onClick={onNewQuote}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Créer un nouveau devis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((q) => {
            const isLocked = q.isValidated || q.status === 'valide' || q.status === 'paye' || q.status === 'partiellement_paye';
            const remaining = q.balanceRemainingAr ?? (q.grandTotalAr - (q.paidAmountAr || 0));

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 transition shadow-md flex flex-col gap-3"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded">
                      {q.id}
                    </span>
                    {q.version > 1 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        V{q.version}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {q.date}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        q.status === 'paye'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : q.status === 'partiellement_paye'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : q.status === 'valide'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {q.status === 'partiellement_paye' ? 'Partiellement Payé' : q.status}
                    </span>

                    {isLocked && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1" title="Verrouillé">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Verrouillé
                      </span>
                    )}
                  </div>

                  {/* Financial Quick View */}
                  <div className="text-left sm:text-right">
                    <div className="text-base font-black text-white tabular-nums">
                      {formatAriary(q.grandTotalAr)}
                    </div>
                    {q.paidAmountAr > 0 && (
                      <div className="text-[11px] text-slate-400">
                        Payé : <strong className="text-emerald-400">{formatAriary(q.paidAmountAr)}</strong>
                        {remaining > 0 && (
                          <span> · Reste : <strong className="text-amber-400">{formatAriary(remaining)}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Client & Products details */}
                <div className="cursor-pointer" onClick={() => onOpenQuote(q)}>
                  <h3 className="text-sm font-bold text-white hover:text-cyan-300 transition">
                    {q.clientName}
                  </h3>
                  <div className="text-xs text-slate-300 space-y-0.5 mt-1">
                    {q.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{it.productName}</span>
                        <span className="text-slate-400 text-[11px]">
                          ({it.dimensions.map((d) => `${d.widthMm}×${d.heightMm} qté ${d.quantity}`).join(', ')})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Actions Footer */}
                <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Validation and Payment buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!isLocked ? (
                      <button
                        onClick={() => setQuoteToValidate(q)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        [ VALIDER LE DEVIS ]
                      </button>
                    ) : (
                      <>
                        {remaining > 0 && (
                          <button
                            onClick={() => {
                              setQuoteForPayment(q);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                          >
                            <DollarSign className="w-4 h-4" />
                            + Enregistrer Règlement
                          </button>
                        )}

                        <button
                          onClick={() => handleCreateNewVersion(q.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 font-medium text-xs flex items-center gap-1 transition"
                          title="Créer une nouvelle version modifiable (ex: DEV-V2)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Nouvelle Version V{(q.version || 1) + 1}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Share, Print & Delete controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => generateQuotePDF(q, settings, 'share')}
                      className="p-2 text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-slate-700 transition"
                      title="Partager Devis (WhatsApp / Android)"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => generateQuotePDF(q, settings, 'download')}
                      className="p-2 text-slate-300 hover:text-cyan-400 rounded-lg hover:bg-slate-700 transition"
                      title="Télécharger PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setQuoteToPrint(q)}
                      className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition"
                      title="Aperçu & Impression"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {!isLocked && (
                      <button
                        onClick={() => onOpenQuote(q)}
                        className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition"
                        title="Modifier le devis"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setQuoteToDelete(q)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!quoteToDelete}
        title="Supprimer le devis"
        message="Voulez-vous vraiment supprimer cet élément ?"
        itemName={quoteToDelete ? `${quoteToDelete.id} (${quoteToDelete.clientName})` : ''}
        onConfirm={handleDeleteQuote}
        onCancel={() => setQuoteToDelete(null)}
      />

      {/* Quote Validation Confirmation Modal (Section 35) */}
      {quoteToValidate && (
        <ValidationConfirmModal
          isOpen={!!quoteToValidate}
          onClose={() => setQuoteToValidate(null)}
          quote={quoteToValidate}
          onConfirm={handleConfirmValidation}
        />
      )}

      {/* Payment Recording Modal */}
      {quoteForPayment && (
        <PaymentModal
          isOpen={!!quoteForPayment}
          onClose={() => setQuoteForPayment(null)}
          quote={quoteForPayment}
          settings={settings}
          onPaymentSuccess={(rec) => {
            onRefresh();
            setIssuedReceipt(rec);
          }}
        />
      )}

      {/* Receipt Modal Display */}
      {issuedReceipt && (
        <ReceiptModal
          isOpen={!!issuedReceipt}
          onClose={() => setIssuedReceipt(null)}
          receipt={issuedReceipt}
          settings={settings}
        />
      )}

      {/* Print Modal */}
      {quoteToPrint && (
        <QuotePrintModal
          isOpen={!!quoteToPrint}
          onClose={() => setQuoteToPrint(null)}
          quote={quoteToPrint}
          settings={settings}
        />
      )}
        </>
      )}
    </div>
  );
};
