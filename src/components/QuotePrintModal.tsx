import React, { useState } from 'react';
import { X, Printer, Share2, Check } from 'lucide-react';
import { Quote, GlobalSettings } from '../types';
import { formatAriary } from '../utils/calculationEngine';

interface QuotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  settings: GlobalSettings;
}

export const QuotePrintModal: React.FC<QuotePrintModalProps> = ({
  isOpen,
  onClose,
  quote,
  settings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    let text = `*DEVIS ${quote.id} - ${settings.companyName}*\n`;
    text += `Client : ${quote.clientName}\n`;
    text += `Date : ${quote.date}\n`;
    text += `--------------------------------\n`;

    quote.items.forEach((item, idx) => {
      text += `*${idx + 1}. ${item.productName}*\n`;
      item.dimensions.forEach((d) => {
        text += `   • ${d.widthMm} × ${d.heightMm} mm (Qté: ${d.quantity})\n`;
      });
      text += `   Profils: ${item.calculationResult.profileCalculations.map((p) => `${p.categoryName} ${p.profileCode} (${p.barsNeeded} barres)`).join(', ')}\n`;
      text += `   Total : ${formatAriary(item.calculationResult.totalProductPriceAr)}\n\n`;
    });

    text += `--------------------------------\n`;
    text += `Matière profilés : ${formatAriary(quote.subtotalBarsAr)}\n`;
    if (quote.subtotalGlassAr > 0) text += `Vitrage : ${formatAriary(quote.subtotalGlassAr)}\n`;
    if (quote.subtotalAccessoriesAr > 0) text += `Accessoires : ${formatAriary(quote.subtotalAccessoriesAr)}\n`;
    if (quote.transportFeeAr > 0) text += `Transport : ${formatAriary(quote.transportFeeAr)}\n`;
    text += `*TOTAL GÉNÉRAL : ${formatAriary(quote.grandTotalAr)}*\n\n`;
    text += `${settings.companyName} - Contact : ${settings.companyPhone}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Action Header */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold">Aperçu Devis Officiel</h3>
            <p className="text-xs text-slate-400">
              {quote.id} · {quote.clientName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copié !' : 'WhatsApp'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Imprimer / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="print-page p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 p-0.5 shrink-0">
                <img
                  src="/src/assets/images/etoile_alu_logo_1790594544641.jpg"
                  alt="Logo"
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {settings.companyName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">{settings.companySubtitle}</p>
                <p className="text-xs text-slate-500">{settings.companyAddress}</p>
                <p className="text-xs text-slate-500">Tél : {settings.companyPhone}</p>
              </div>
            </div>

            <div className="text-right sm:self-center">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-md font-mono font-bold text-slate-800 text-sm mb-1">
                {quote.id}
              </div>
              <p className="text-xs text-slate-500">Date : {quote.date}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                Statut : <span className="text-emerald-700">{quote.status.toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Informations Client
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Nom :</span>{' '}
                <strong className="text-slate-900 text-sm">{quote.clientName}</strong>
              </div>
              {quote.clientPhone && (
                <div>
                  <span className="text-slate-500">Téléphone :</span>{' '}
                  <span className="text-slate-800 font-medium">{quote.clientPhone}</span>
                </div>
              )}
              {quote.clientAddress && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Adresse / Chantier :</span>{' '}
                  <span className="text-slate-800">{quote.clientAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] font-bold uppercase text-slate-600 bg-slate-100">
                  <th className="py-2.5 px-3">Produit & Références Assemblées</th>
                  <th className="py-2.5 px-3 text-center">Dimensions (mm)</th>
                  <th className="py-2.5 px-3 text-center">Qté</th>
                  <th className="py-2.5 px-3 text-right">Barres</th>
                  <th className="py-2.5 px-3 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {quote.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {item.calculationResult.profileCalculations
                          .map((p) => `${p.categoryName}: ${p.profileCode}`)
                          .join(' · ')}
                      </div>
                      {item.selectedGlassTypeId && (
                        <div className="text-[11px] text-slate-500">
                          Vitrage : {item.calculationResult.selectedGlassName} ({item.calculationResult.totalGlassAreaM2} m²)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.dimensions.map((d, dIdx) => (
                        <div key={dIdx} className="font-mono text-[11px] text-slate-700">
                          {d.widthMm} × {d.heightMm}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold">
                      {item.dimensions.reduce((acc, d) => acc + d.quantity, 0)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                      {item.calculationResult.totalBarsNeeded} barres
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatAriary(item.calculationResult.totalProductPriceAr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 space-y-2 text-xs border-t-2 border-slate-300 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total profilés aluminium :</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatAriary(quote.subtotalBarsAr)}
                </span>
              </div>
              {quote.subtotalGlassAr > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total vitrage :</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatAriary(quote.subtotalGlassAr)}
                  </span>
                </div>
              )}
              {quote.subtotalAccessoriesAr > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total accessoires :</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatAriary(quote.subtotalAccessoriesAr)}
                  </span>
                </div>
              )}
              {quote.transportFeeAr > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Frais de transport :</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatAriary(quote.transportFeeAr)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-base font-extrabold text-slate-900">
                <span>TOTAL GÉNÉRAL :</span>
                <span className="tabular-nums text-cyan-900">{formatAriary(quote.grandTotalAr)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Signatures */}
          {quote.notes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800">Remarques :</strong> {quote.notes}
            </div>
          )}

          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div className="text-center pt-8 border-t border-slate-300">
              Signature & Cachet Client
            </div>
            <div className="text-center pt-8 border-t border-slate-300">
              Direction {settings.companyName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
