import React, { useState } from 'react';
import { X, Printer, Share2, Download, Check, Receipt, Building } from 'lucide-react';
import { PaymentReceipt, GlobalSettings } from '../types';
import { formatAriary } from '../utils/calculationEngine';
import { generateReceiptPDF } from '../utils/pdfExport';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt;
  settings: GlobalSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  settings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyWhatsApp = () => {
    let text = `*REÇU DE PAIEMENT ${receipt.id} - ${settings.companyName}*\n`;
    text += `Client : ${receipt.clientName}\n`;
    text += `Réf Devis : ${receipt.quoteId}\n`;
    text += `Date : ${receipt.date}\n`;
    text += `--------------------------------\n`;
    text += `*Montant encaissé : ${formatAriary(receipt.paidAmountAr)}*\n`;
    text += `Mode : ${receipt.paymentMethod}\n`;
    text += `Total Devis : ${formatAriary(receipt.quoteTotalAr)}\n`;
    text += `Cumul payé : ${formatAriary(receipt.totalPaidToDateAr)}\n`;
    text += `*Reste à payer : ${formatAriary(receipt.balanceRemainingAr)}*\n`;
    text += `--------------------------------\n`;
    text += `Merci pour votre confiance.\n${settings.companyName} - Tél: ${settings.companyPhone}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 w-full max-w-md max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Action Bar */}
        <div className="no-print p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Reçu de Paiement Officiel</h3>
              <p className="text-[11px] text-slate-400 font-mono">{receipt.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => generateReceiptPDF(receipt, settings, 'share')}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition active:scale-95"
              title="Partager vers WhatsApp / Android"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => generateReceiptPDF(receipt, settings, 'download')}
              className="p-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium flex items-center gap-1 transition active:scale-95"
              title="Télécharger PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => generateReceiptPDF(receipt, settings, 'print')}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium flex items-center gap-1 transition active:scale-95"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper View (Matching Section 38 format) */}
        <div className="print-page p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
          {/* Top Brand Block */}
          <div className="text-center pb-3 border-b-2 border-slate-900">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {settings.companyName}
            </h1>
            <p className="text-[11px] text-slate-600 font-medium">
              {settings.companySubtitle}
            </p>
            <p className="text-[10px] text-slate-500">{settings.companyAddress}</p>
            <p className="text-[10px] text-slate-500">Tél : {settings.companyPhone}</p>
            {settings.companyNIF && (
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                NIF : {settings.companyNIF} · STAT : {settings.companySTAT}
              </p>
            )}
          </div>

          {/* Receipt Title Box */}
          <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              REÇU DE PAIEMENT
            </span>
            <span className="text-base font-black font-mono text-slate-900 block mt-0.5">
              N° {receipt.id}
            </span>
            <span className="text-[11px] text-slate-600">Date : {receipt.date}</span>
          </div>

          {/* Client & Reference Devis */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Reçu de :</span>
              <strong className="text-slate-900">{receipt.clientName}</strong>
            </div>
            {receipt.clientPhone && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Téléphone :</span>
                <span className="text-slate-700">{receipt.clientPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Référence Devis :</span>
              <strong className="text-cyan-800 font-mono">{receipt.quoteId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mode de paiement :</span>
              <strong className="text-slate-800">{receipt.paymentMethod}</strong>
            </div>
          </div>

          {/* Amount Paid Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0c3e4f] to-[#082832] text-white text-center shadow-inner space-y-1">
            <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider block">
              MONTANT REÇU
            </span>
            <div className="text-2xl font-black text-emerald-400 tabular-nums font-mono">
              {formatAriary(receipt.paidAmountAr)}
            </div>
          </div>

          {/* Financial Breakdown (Section 38: Montant devis, Montant payé, Reste à payer) */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Montant total du devis :</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatAriary(receipt.quoteTotalAr)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total cumulé payé :</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatAriary(receipt.totalPaidToDateAr)}
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-300 flex justify-between font-bold text-sm">
              <span className="text-slate-800">Reste à payer :</span>
              <span className={`tabular-nums ${receipt.balanceRemainingAr > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {formatAriary(receipt.balanceRemainingAr)}
              </span>
            </div>
          </div>

          {receipt.notes && (
            <div className="text-[11px] text-slate-500 italic p-2 bg-slate-50 rounded border border-slate-200">
              Note : {receipt.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-4 text-[10px] text-slate-500">
            <div className="text-center pt-6 border-t border-slate-300">
              Signature Client
            </div>
            <div className="text-center pt-6 border-t border-slate-300 font-semibold text-slate-700">
              Cachet & Signature {settings.companyName}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="no-print p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyWhatsApp}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copié !' : 'Partager'}
          </button>
          <button
            onClick={() => generateReceiptPDF(receipt, settings, 'download')}
            className="flex-1 py-2 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={onClose}
            className="py-2 px-3 rounded-xl bg-slate-300 hover:bg-slate-400 text-slate-800 font-medium text-xs transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
