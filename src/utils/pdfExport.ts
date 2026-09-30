import jsPDF from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { Quote, PaymentReceipt, GlobalSettings } from '../types';
import { formatAriary, formatBarQuantity } from './calculationEngine';

/**
 * Détecte si l'application tourne dans Capacitor / Android APK.
 */
function isCapacitorApp(): boolean {
  return typeof window !== 'undefined' &&
    !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Convertit un Blob PDF en Base64.
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;

      // Supprime "data:application/pdf;base64,"
      const base64 = result.split(',')[1];

      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Enregistre un PDF dans le stockage de l'application Android.
 */
async function savePdfToAndroid(
  blob: Blob,
  filename: string
): Promise<string> {
  const base64 = await blobToBase64(blob);

  const result = await Filesystem.writeFile({
    path: `ETOILE_ALU/${filename}`,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });

  return result.uri;
}

/**
 * Ouvre le système de partage Android pour un PDF local.
 */
async function shareLocalPdf(
  uri: string,
  filename: string,
  title: string,
  text: string
): Promise<void> {
  await Share.share({
    title,
    text,
    files: [uri],
    dialogTitle: `Partager ${filename}`,
  });
}

/**
 * Génère un PDF de devis ETOILE ALU.
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

  const primaryColor: [number, number, number] = [12, 62, 79];
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];

  let y = 16;

  // =========================
  // HEADER
  // =========================

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(settings.companyName || 'ETOILE ALU', 15, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);

  doc.text(
    settings.companySubtitle || 'Menuiserie & Miroiterie Aluminium',
    15,
    y + 11
  );

  doc.text(
    `${settings.companyAddress} · Tél : ${settings.companyPhone}`,
    15,
    y + 16
  );

  if (settings.companyNIF || settings.companySTAT) {
    doc.text(
      `NIF : ${settings.companyNIF || '-'} · STAT : ${settings.companySTAT || '-'}`,
      15,
      y + 21
    );
  }

  // =========================
  // DEVIS INFO
  // =========================

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
  doc.text(
    `Statut : ${quote.status.toUpperCase()}`,
    rightBoxX + 4,
    y + 17
  );

  if (quote.version > 1) {
    doc.text(
      `Version : V${quote.version}`,
      rightBoxX + 4,
      y + 22
    );
  }

  y += 32;

  // =========================
  // CLIENT
  // =========================

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);

  doc.roundedRect(
    15,
    y,
    180,
    18,
    2,
    2,
    'FD'
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('CLIENT :', 19, y + 6);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text(
    quote.clientName || 'Client Inconnu',
    35,
    y + 6
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  doc.text(
    `Téléphone : ${quote.clientPhone || 'Non renseigné'}`,
    19,
    y + 13
  );

  doc.text(
    `Adresse / Chantier : ${quote.clientAddress || 'Non renseignée'}`,
    100,
    y + 13
  );

  y += 24;

  // =========================
  // TABLE HEADER
  // =========================

  doc.setFillColor(...primaryColor);
  doc.rect(15, y, 180, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);

  doc.text(
    'DÉSIGNATION & PROFILÉS',
    18,
    y + 5
  );

  doc.text(
    'DIMENSIONS (mm)',
    105,
    y + 5
  );

  doc.text(
    'QTÉ',
    145,
    y + 5
  );

  doc.text(
    'TOTAL HT',
    170,
    y + 5
  );

  y += 7;

  // =========================
  // TABLE BODY
  // =========================

  quote.items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;

    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, y, 180, 13, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);

    doc.text(
      item.productName,
      18,
      y + 5
    );

    const profilesDesc =
      item.calculationResult.profileCalculations
        .map(
          (p) => `${p.categoryName}: ${p.profileCode} (${formatBarQuantity(p.barsNeeded)} b.)`
        )
        .join(' · ');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedColor);

    doc.text(
      profilesDesc.substring(0, 55),
      18,
      y + 10
    );

    const dimsStr = item.dimensions
      .map(
        (d) =>
          `${d.widthMm}×${d.heightMm}`
      )
      .join(', ');

    const totalQty = item.dimensions.reduce(
      (sum, d) => sum + d.quantity,
      0
    );

    doc.setFontSize(8.5);
    doc.setTextColor(...textColor);

    doc.text(
      dimsStr.substring(0, 30),
      105,
      y + 6
    );

    doc.text(
      `${totalQty}`,
      148,
      y + 6
    );

    doc.setFont('helvetica', 'bold');

    doc.text(
      formatAriary(
        item.calculationResult.totalProductPriceAr
      ),
      170,
      y + 6
    );

    y += 13;
  });

  y += 4;

  // =========================
  // TOTALS
  // =========================

  const totalsX = 115;

  doc.setDrawColor(226, 232, 240);
  doc.line(
    totalsX,
    y,
    195,
    y
  );

  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textColor);

  doc.text(
    'Matières profilés :',
    totalsX,
    y
  );

  doc.text(
    formatAriary(quote.subtotalBarsAr),
    168,
    y
  );

  y += 5;

  if (quote.subtotalGlassAr > 0) {
    doc.text(
      'Vitrage :',
      totalsX,
      y
    );

    doc.text(
      formatAriary(quote.subtotalGlassAr),
      168,
      y
    );

    y += 5;
  }

  if (quote.subtotalAccessoriesAr > 0) {
    doc.text(
      'Accessoires :',
      totalsX,
      y
    );

    doc.text(
      formatAriary(quote.subtotalAccessoriesAr),
      168,
      y
    );

    y += 5;
  }

  if (quote.transportFeeAr > 0) {
    doc.text(
      'Frais de transport :',
      totalsX,
      y
    );

    doc.text(
      formatAriary(quote.transportFeeAr),
      168,
      y
    );

    y += 5;
  }

  if (quote.discountAr > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);

    doc.text(
      'Remise accordée :',
      totalsX,
      y
    );

    doc.text(
      `- ${formatAriary(quote.discountAr)}`,
      168,
      y
    );

    doc.setTextColor(...textColor);

    y += 5;
  }

  // =========================
  // GRAND TOTAL
  // =========================

  doc.setFillColor(...primaryColor);

  doc.roundedRect(
    totalsX,
    y,
    80,
    8,
    1,
    1,
    'F'
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);

  doc.text(
    'TOTAL GÉNÉRAL :',
    totalsX + 3,
    y + 5.5
  );

  doc.text(
    formatAriary(quote.grandTotalAr),
    totalsX + 45,
    y + 5.5
  );

  y += 14;

  // =========================
  // PAIEMENTS
  // =========================

  if (quote.paidAmountAr > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textColor);

    doc.text(
      `Montant déjà payé : ${formatAriary(
        quote.paidAmountAr
      )}`,
      totalsX,
      y
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);

    doc.text(
      `Reste à payer : ${formatAriary(
        quote.balanceRemainingAr
      )}`,
      totalsX,
      y + 5
    );

    y += 12;
  }

  // =========================
  // CONDITIONS
  // =========================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);

  doc.text(
    'OBSERVATIONS & CONDITIONS :',
    15,
    y
  );

  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textColor);

  const termsText =
    quote.terms ||
    settings.defaultQuoteTerms ||
    'Validité du devis: 30 jours. Acompte de 50% à la commande, solde à la livraison.';

  doc.text(
    termsText,
    15,
    y,
    {
      maxWidth: 180,
    }
  );

  y += 8;

  if (quote.observations || quote.notes) {
    const obsText =
      quote.observations ||
      quote.notes ||
      '';

    doc.text(
      `Remarques : ${obsText}`,
      15,
      y,
      {
        maxWidth: 180,
      }
    );

    y += 8;
  }

  // =========================
  // SIGNATURES
  // =========================

  y = Math.max(y, 250);

  doc.setDrawColor(203, 213, 225);

  doc.line(
    15,
    y,
    80,
    y
  );

  doc.line(
    130,
    y,
    195,
    y
  );

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);

  doc.text(
    'Bon pour accord (Signature Client)',
    25,
    y + 5
  );

  doc.text(
    `Direction ${settings.companyName}`,
    140,
    y + 5
  );

  // =========================
  // FOOTER
  // =========================

  doc.setFontSize(7);

  doc.text(
    settings.footerText ||
      `${settings.companyName} - Menuiserie Aluminium Madagascar`,
    105,
    290,
    {
      align: 'center',
    }
  );

  const filename =
    `${quote.id}_${(
      quote.clientName || 'Client'
    ).replace(/\s+/g, '_')}.pdf`;

  // =========================
  // EXPORT / SHARE / PRINT
  // =========================

  const pdfBlob = doc.output('blob');

  // ANDROID APK
  if (isCapacitorApp()) {
    try {
      const uri = await savePdfToAndroid(
        pdfBlob,
        filename
      );

      if (action === 'share') {
        await shareLocalPdf(
          uri,
          filename,
          `Devis ${quote.id}`,
          `Devis ${quote.id} - ${settings.companyName}`
        );

        return;
      }

      if (action === 'print') {
        await shareLocalPdf(
          uri,
          filename,
          `Imprimer devis ${quote.id}`,
          `PDF prêt pour impression`
        );

        return;
      }

      // download
      await shareLocalPdf(
        uri,
        filename,
        `PDF ${filename}`,
        'Le PDF a été enregistré dans ETOILE ALU.'
      );

      return;

    } catch (error) {
      console.error(
        'Erreur export PDF Android:',
        error
      );

      throw new Error(
        'Impossible d’enregistrer le PDF sur le téléphone.'
      );
    }
  }

  // =========================
  // WEB / PC (QUOTE)
  // =========================

  if (action === 'download') {
    doc.save(filename);
    return;
  }

  if (action === 'print') {
    doc.autoPrint();

    const blobUrl =
      doc.output('bloburl');

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = String(blobUrl);
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
      };
    } catch {
      doc.save(filename);
    }

    return;
  }

  if (action === 'share') {
    const file = new File(
      [pdfBlob],
      filename,
      {
        type: 'application/pdf',
      }
    );

    if (
      navigator.canShare &&
      navigator.canShare({
        files: [file],
      })
    ) {
      try {
        await navigator.share({
          title: `Devis ${quote.id} - ${settings.companyName}`,
          text:
            `Bonjour, voici le devis ${quote.id} pour ${quote.clientName}.`,
          files: [file],
        });

        return;

      } catch (error) {
        console.log(
          'Partage annulé ou échoué:',
          error
        );
      }
    }

    doc.save(filename);
  }
}

/**
 * Génère un PDF de reçu de paiement ETOILE ALU.
 */
export async function generateReceiptPDF(
  receipt: PaymentReceipt,
  settings: GlobalSettings,
  action: 'download' | 'share' | 'print' = 'download'
): Promise<void> {

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210],
  });

  const primaryColor: [number, number, number] = [12, 62, 79];
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];

  let y = 14;

  // =========================
  // HEADER
  // =========================

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 148, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);

  doc.text(
    settings.companyName || 'ETOILE ALU',
    12,
    y + 4
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);

  doc.text(
    settings.companySubtitle ||
      'Menuiserie Aluminium de Précision',
    12,
    y + 9
  );

  doc.text(
    `Tél : ${settings.companyPhone} · ${settings.companyAddress}`,
    12,
    y + 13
  );

  // =========================
  // TITLE
  // =========================

  y += 20;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...primaryColor);

  doc.roundedRect(
    12,
    y,
    124,
    16,
    2,
    2,
    'FD'
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);

  doc.text(
    'REÇU DE PAIEMENT',
    74,
    y + 7,
    {
      align: 'center',
    }
  );

  doc.setFontSize(9);
  doc.setTextColor(...textColor);

  doc.text(
    `N° ${receipt.id}   ·   Date : ${receipt.date}`,
    74,
    y + 12,
    {
      align: 'center',
    }
  );

  y += 22;

  // =========================
  // CLIENT
  // =========================

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);

  doc.roundedRect(
    12,
    y,
    124,
    22,
    2,
    2,
    'FD'
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);

  doc.text(
    'Reçu de :',
    16,
    y + 6
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);

  doc.text(
    receipt.clientName,
    35,
    y + 6
  );

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);

  doc.text(
    'Référence Devis :',
    16,
    y + 12
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);

  doc.text(
    receipt.quoteId,
    45,
    y + 12
  );

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);

  doc.text(
    'Mode de paiement :',
    16,
    y + 18
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);

  doc.text(
    receipt.paymentMethod || 'Espèces',
    48,
    y + 18
  );

  y += 28;

  // =========================
  // AMOUNT
  // =========================

  doc.setFillColor(...primaryColor);

  doc.roundedRect(
    12,
    y,
    124,
    20,
    2,
    2,
    'F'
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(207, 250, 254);

  doc.text(
    'MONTANT ENCAISSÉ',
    74,
    y + 7,
    {
      align: 'center',
    }
  );

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);

  doc.text(
    formatAriary(receipt.paidAmountAr),
    74,
    y + 15,
    {
      align: 'center',
    }
  );

  y += 26;

  // =========================
  // BREAKDOWN
  // =========================

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);

  doc.roundedRect(
    12,
    y,
    124,
    26,
    1,
    1,
    'FD'
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textColor);

  doc.text(
    'Montant total du devis :',
    16,
    y + 6
  );

  doc.setFont('helvetica', 'bold');

  doc.text(
    formatAriary(receipt.quoteTotalAr),
    130,
    y + 6,
    {
      align: 'right',
    }
  );

  doc.setFont('helvetica', 'normal');

  doc.text(
    'Total cumulé payé à ce jour :',
    16,
    y + 13
  );

  doc.setFont('helvetica', 'bold');

  doc.text(
    formatAriary(receipt.totalPaidToDateAr),
    130,
    y + 13,
    {
      align: 'right',
    }
  );

  doc.setFont('helvetica', 'normal');

  doc.text(
    'Reste à payer :',
    16,
    y + 20
  );

  doc.setFont('helvetica', 'bold');

  doc.setTextColor(
    receipt.balanceRemainingAr > 0 ? 220 : 16,
    receipt.balanceRemainingAr > 0 ? 38 : 185,
    receipt.balanceRemainingAr > 0 ? 38 : 129
  );

  doc.text(
    formatAriary(
      receipt.balanceRemainingAr
    ),
    130,
    y + 20,
    {
      align: 'right',
    }
  );

  y += 34;

  // =========================
  // NOTE
  // =========================

  if (receipt.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);

    doc.text(
      `Note : ${receipt.notes}`,
      12,
      y
    );

    y += 8;
  }

  // =========================
  // SIGNATURES
  // =========================

  doc.setDrawColor(203, 213, 225);

  doc.line(
    16,
    y + 18,
    55,
    y + 18
  );

  doc.line(
    90,
    y + 18,
    130,
    y + 18
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedColor);

  doc.text(
    'Signature Client',
    23,
    y + 22
  );

  doc.text(
    `Cachet & Signature ${settings.companyName}`,
    92,
    y + 22
  );

  const filename =
    `${receipt.id}_${(
      receipt.clientName || 'Client'
    ).replace(/\s+/g, '_')}.pdf`;

  // =========================
  // EXPORT
  // =========================

  const pdfBlob = doc.output('blob');

  // =========================
  // ANDROID APK
  // =========================

  if (isCapacitorApp()) {
    try {
      const uri = await savePdfToAndroid(
        pdfBlob,
        filename
      );

      if (action === 'share') {
        await shareLocalPdf(
          uri,
          filename,
          `Reçu ${receipt.id}`,
          `Reçu de paiement ${receipt.id}`
        );

        return;
      }

      if (action === 'print') {
        await shareLocalPdf(
          uri,
          filename,
          `Imprimer reçu ${receipt.id}`,
          'PDF prêt pour impression'
        );

        return;
      }

      await shareLocalPdf(
        uri,
        filename,
        `PDF ${filename}`,
        'Le reçu a été enregistré dans ETOILE ALU.'
      );

      return;

    } catch (error) {
      console.error(
        'Erreur export reçu Android:',
        error
      );

      throw new Error(
        'Impossible d’enregistrer le reçu PDF sur le téléphone.'
      );
    }
  }

  // =========================
  // WEB / PC (RECEIPT)
  // =========================

  if (action === 'download') {
    doc.save(filename);
    return;
  }

  if (action === 'print') {
    doc.autoPrint();

    const blobUrl =
      doc.output('bloburl');

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = String(blobUrl);
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
      };
    } catch {
      doc.save(filename);
    }

    return;
  }

  if (action === 'share') {
    const file = new File(
      [pdfBlob],
      filename,
      {
        type: 'application/pdf',
      }
    );

    if (
      navigator.canShare &&
      navigator.canShare({
        files: [file],
      })
    ) {
      try {
        await navigator.share({
          title: `Reçu ${receipt.id} - ${settings.companyName}`,
          text:
            `Reçu de paiement ${receipt.id}`,
          files: [file],
        });

        return;

      } catch (error) {
        console.log(
          'Partage annulé ou échoué:',
          error
        );
      }
    }

    doc.save(filename);
  }
}
