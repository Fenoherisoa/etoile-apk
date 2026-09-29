import jsPDF from 'jspdf';
import { Quote, PaymentReceipt, GlobalSettings } from '../types';
import { formatAriary, formatNumber } from './calculationEngine';

/**
 * Generates and downloads or shares a professional PDF Quote for ETOILE ALU.
 */
export async function generateQuotePDF(
  quote: Quote,
  settings: GlobalSettings,
  action: 'download' | 'share' | 'print' = 'download'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [12, 62, 79]; // Deep Petrol Blue #0c3e4f
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];

  let y = 16;

  // Header Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 8, 'F');

  // Company Brand Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(settings.companyName || 'ETOILE ALU', 15, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(settings.companySubtitle || 'Menuiserie & Miroiterie Aluminium', 15, y + 11);
  doc.text(`${settings.companyAddress} · Tél : ${settings.companyPhone}`, 15, y + 16);
  if (settings.companyNIF || settings.companySTAT) {
    doc.text(`NIF : ${settings.companyNIF || '-'} · STAT : ${settings.companySTAT || '-'}`, 15, y + 21);
  }

  // Quote Metadata Box (Right aligned)
  const rightBoxX = 135;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(rightBoxX, y, 60, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(`DEVIS : ${quote.id}`, rightBoxX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textColor);
  doc.text(`Date : ${quote.date}`, rightBoxX + 4, y + 12);
  doc.text(`Statut : ${quote.status.toUpperCase()}`, rightBoxX + 4, y + 17);
  if (quote.version > 1) {
    doc.text(`Version : V${quote.version}`, rightBoxX + 4, y + 22);
  }

  y += 32;

  // Client Details Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 180, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('CLIENT :', 19, y + 6);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text(quote.clientName || 'Client Inconnu', 35, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Téléphone : ${quote.clientPhone || 'Non renseigné'}`, 19, y + 13);
  doc.text(`Adresse / Chantier : ${quote.clientAddress || 'Non renseignée'}`, 100, y + 13);

  y += 24;

  // Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(15, y, 180, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DÉSIGNATION & PROFILÉS', 18, y + 5);
  doc.text('DIMENSIONS (mm)', 105, y + 5);
  doc.text('QTÉ', 145, y + 5);
  doc.text('TOTAL HT', 170, y + 5);

  y += 7;

  // Table Body Rows
  quote.items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, y, 180, 13, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text(item.productName, 18, y + 5);

    // Profile specifics
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedColor);
    const profilesDesc = item.calculationResult.profileCalculations
      .map((p) => `${p.categoryName}: ${p.profileCode}`)
      .join(' · ');
    doc.text(profilesDesc.substring(0, 55), 18, y + 10);

    // Dimensions
    const dimsStr = item.dimensions.map((d) => `${d.widthMm}×${d.heightMm}`).join(', ');
    const totalQty = item.dimensions.reduce((sum, d) => sum + d.quantity, 0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textColor);
    doc.text(dimsStr.substring(0, 30), 105, y + 6);
    doc.text(`${totalQty}`, 148, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(formatAriary(item.calculationResult.totalProductPriceAr), 170, y + 6);

    y += 13;
  });

  y += 4;

  // Summary Totals Box
  const totalsX = 115;
  doc.setDrawColor(226, 232, 240);
  doc.line(totalsX, y, 195, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textColor);

  doc.text('Matières profilés :', totalsX, y);
  doc.text(formatAriary(quote.subtotalBarsAr), 168, y);
  y += 5;

  if (quote.subtotalGlassAr > 0) {
    doc.text('Vitrage :', totalsX, y);
    doc.text(formatAriary(quote.subtotalGlassAr), 168, y);
    y += 5;
  }

  if (quote.subtotalAccessoriesAr > 0) {
    doc.text('Accessoires :', totalsX, y);
    doc.text(formatAriary(quote.subtotalAccessoriesAr), 168, y);
    y += 5;
  }

  if (quote.transportFeeAr > 0) {
    doc.text('Frais de transport :', totalsX, y);
    doc.text(formatAriary(quote.transportFeeAr), 168, y);
    y += 5;
  }

  if (quote.discountAr > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('Remise accordée :', totalsX, y);
    doc.text(`- ${formatAriary(quote.discountAr)}`, 168, y);
    doc.setTextColor(...textColor);
    y += 5;
  }

  // Grand Total Highlight
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX, y, 80, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL GÉNÉRAL :', totalsX + 3, y + 5.5);
  doc.text(formatAriary(quote.grandTotalAr), totalsX + 45, y + 5.5);

  y += 14;

  // Payments and balance if any paid
  if (quote.paidAmountAr > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textColor);
    doc.text(`Montant déjà payé : ${formatAriary(quote.paidAmountAr)}`, totalsX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Reste à payer : ${formatAriary(quote.balanceRemainingAr)}`, totalsX, y + 5);
    y += 12;
  }

  // Observations & Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('OBSERVATIONS & CONDITIONS :', 15, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textColor);
  const termsText = quote.terms || settings.defaultQuoteTerms || 'Validité du devis: 30 jours. Acompte de 50% à la commande, solde à la livraison.';
  doc.text(termsText, 15, y, { maxWidth: 180 });
  y += 8;

  if (quote.observations || quote.notes) {
    const obsText = quote.observations || quote.notes || '';
    doc.text(`Remarques : ${obsText}`, 15, y, { maxWidth: 180 });
    y += 8;
  }

  // Signatures
  y = Math.max(y, 250);
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 80, y);
  doc.line(130, y, 195, y);

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Bon pour accord (Signature Client)', 25, y + 5);
  doc.text(`Direction ${settings.companyName}`, 140, y + 5);

  // Footer
  doc.setFontSize(7);
  doc.text(settings.footerText || `${settings.companyName} - Menuiserie Aluminium Madagascar`, 105, 290, {
    align: 'center',
  });

  const filename = `${quote.id}_${(quote.clientName || 'Client').replace(/\s+/g, '_')}.pdf`;

  if (action === 'download') {
    doc.save(filename);
  } else if (action === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else if (action === 'share') {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Devis ${quote.id} - ${settings.companyName}`,
          text: `Bonjour, voici le devis ${quote.id} pour ${quote.clientName} (Total: ${formatAriary(quote.grandTotalAr)}).`,
          files: [file],
        });
        return;
      } catch (err) {
        console.log('Share canceled or failed, falling back to download:', err);
      }
    }
    // Fallback to direct download
    doc.save(filename);
  }
}

/**
 * Generates and downloads or shares a professional Payment Receipt PDF.
 */
export async function generateReceiptPDF(
  receipt: PaymentReceipt,
  settings: GlobalSettings,
  action: 'download' | 'share' | 'print' = 'download'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210], // A5 size portrait, ideal for receipts
  });

  const primaryColor: [number, number, number] = [12, 62, 79]; // Deep Petrol Blue
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];

  let y = 14;

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 148, 6, 'F');

  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(settings.companyName || 'ETOILE ALU', 12, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(settings.companySubtitle || 'Menuiserie Aluminium de Précision', 12, y + 9);
  doc.text(`Tél : ${settings.companyPhone} · ${settings.companyAddress}`, 12, y + 13);

  // Title Box
  y += 20;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...primaryColor);
  doc.roundedRect(12, y, 124, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);
  doc.text('REÇU DE PAIEMENT', 74, y + 7, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.text(`N° ${receipt.id}   ·   Date : ${receipt.date}`, 74, y + 12, { align: 'center' });

  y += 22;

  // Client & Quote info
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, y, 124, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  doc.text('Reçu de :', 16, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(receipt.clientName, 35, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text('Référence Devis :', 16, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(receipt.quoteId, 45, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text('Mode de paiement :', 16, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(receipt.paymentMethod || 'Espèces', 48, y + 18);

  y += 28;

  // Amount Highlight Box
  doc.setFillColor(...primaryColor);
  doc.roundedRect(12, y, 124, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(207, 250, 254);
  doc.text('MONTANT ENCAISSÉ', 74, y + 7, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(formatAriary(receipt.paidAmountAr), 74, y + 15, { align: 'center' });

  y += 26;

  // Financial Breakdown Summary
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, y, 124, 26, 1, 1, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textColor);

  doc.text('Montant total du devis :', 16, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(formatAriary(receipt.quoteTotalAr), 130, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Total cumulé payé à ce jour :', 16, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatAriary(receipt.totalPaidToDateAr), 130, y + 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Reste à payer :', 16, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(receipt.balanceRemainingAr > 0 ? 220 : 16, receipt.balanceRemainingAr > 0 ? 38 : 185, receipt.balanceRemainingAr > 0 ? 38 : 129);
  doc.text(formatAriary(receipt.balanceRemainingAr), 130, y + 20, { align: 'right' });

  y += 34;

  if (receipt.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(`Note : ${receipt.notes}`, 12, y);
    y += 8;
  }

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(16, y + 18, 55, y + 18);
  doc.line(90, y + 18, 130, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedColor);
  doc.text('Signature Client', 23, y + 22);
  doc.text(`Cachet & Signature ${settings.companyName}`, 92, y + 22);

  const filename = `${receipt.id}_${(receipt.clientName || 'Client').replace(/\s+/g, '_')}.pdf`;

  if (action === 'download') {
    doc.save(filename);
  } else if (action === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else if (action === 'share') {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Reçu ${receipt.id} - ${settings.companyName}`,
          text: `Bonjour, voici le reçu de paiement ${receipt.id} d'un montant de ${formatAriary(receipt.paidAmountAr)} pour le devis ${receipt.quoteId}.`,
          files: [file],
        });
        return;
      } catch (err) {
        console.log('Share canceled or failed, falling back to download:', err);
      }
    }
    doc.save(filename);
  }
}
