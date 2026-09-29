import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Layers,
  Ruler,
  DollarSign,
  Truck,
  Check,
  X,
  Printer,
  Sparkles,
  Sliders,
} from 'lucide-react';
import {
  Quote,
  Client,
  ProductTemplate,
  Category,
  ProfileReference,
  GlassType,
  GlobalSettings,
  QuoteProductItem,
  QuoteDimension,
  ProductComponentConfig,
} from '../types';
import {
  calculateDetailedProduct,
  formatAriary,
  formatNumber,
} from '../utils/calculationEngine';
import { storageService } from '../services/storageService';
import { BarCalculationExplanationModal } from '../components/BarCalculationExplanationModal';
import { QuotePrintModal } from '../components/QuotePrintModal';

interface QuoteEditorViewProps {
  initialQuote?: Quote | null;
  defaultClient?: Client | null;
  clients: Client[];
  products: ProductTemplate[];
  categories: Category[];
  references: ProfileReference[];
  glassTypes: GlassType[];
  settings: GlobalSettings;
  onSaveQuote: (savedQuote: Quote) => void;
  onCancel: () => void;
}

export const QuoteEditorView: React.FC<QuoteEditorViewProps> = ({
  initialQuote,
  defaultClient,
  clients,
  products,
  categories,
  references,
  glassTypes,
  settings,
  onSaveQuote,
  onCancel,
}) => {
  // Quote header state
  const [quoteId] = useState(initialQuote?.id || storageService.generateQuoteId());
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialQuote?.clientId || defaultClient?.id || (clients[0]?.id || '')
  );
  const [quoteDate, setQuoteDate] = useState(
    initialQuote?.date || new Date().toISOString().split('T')[0]
  );
  const [quoteStatus, setQuoteStatus] = useState<Quote['status']>(
    initialQuote?.status || 'brouillon'
  );
  const [quoteNotes, setQuoteNotes] = useState(initialQuote?.notes || '');
  const [transportFeeAr, setTransportFeeAr] = useState<number>(
    initialQuote?.transportFeeAr ?? 50000
  );
  const [discountAr, setDiscountAr] = useState<number>(initialQuote?.discountAr ?? 0);
  const [quoteObservations, setQuoteObservations] = useState<string>(
    initialQuote?.observations || settings.defaultQuoteObservations || ''
  );
  const [quoteTerms, setQuoteTerms] = useState<string>(
    initialQuote?.terms || settings.defaultQuoteTerms || ''
  );

  // Quote items
  const [quoteItems, setQuoteItems] = useState<QuoteProductItem[]>(
    initialQuote?.items || []
  );

  // Active product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Form inside modal
  const [selectedProdTemplateId, setSelectedProdTemplateId] = useState<string>(
    products[0]?.id || ''
  );
  const [tempDimensions, setTempDimensions] = useState<QuoteDimension[]>([
    { id: 'dim-1', widthMm: 1200, heightMm: 1500, quantity: 1, label: 'Dimension 1' },
  ]);
  const [tempGlassTypeId, setTempGlassTypeId] = useState<string>(
    products[0]?.defaultGlassTypeId || glassTypes[0]?.id || ''
  );
  const [tempComponents, setTempComponents] = useState<ProductComponentConfig[]>([]);
  const [dimFormError, setDimFormError] = useState('');

  // Modals
  const [explainingItem, setExplainingItem] = useState<QuoteProductItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (quoteItems.length === 0 && products.length > 0 && !initialQuote) {
      openAddProductModal();
    }
  }, []);

  const openAddProductModal = () => {
    const template = products[0];
    if (!template) return;

    setSelectedProdTemplateId(template.id);
    setTempDimensions([
      { id: `dim-${Date.now()}`, widthMm: 1200, heightMm: 1500, quantity: 1, label: 'Dimension 1' },
    ]);
    setTempGlassTypeId(template.defaultGlassTypeId || glassTypes[0]?.id || '');
    setTempComponents(template.components.map((c) => ({ ...c, rule: { ...c.rule } })));
    setEditingItemIndex(null);
    setDimFormError('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (index: number) => {
    const item = quoteItems[index];
    setSelectedProdTemplateId(item.productId);
    setTempDimensions(item.dimensions.map((d) => ({ ...d })));
    setTempGlassTypeId(item.selectedGlassTypeId || '');
    setTempComponents(item.componentsConfig.map((c) => ({ ...c, rule: { ...c.rule } })));
    setEditingItemIndex(index);
    setDimFormError('');
    setIsProductModalOpen(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedProdTemplateId(templateId);
    const template = products.find((p) => p.id === templateId);
    if (!template) return;

    setTempGlassTypeId(template.defaultGlassTypeId || glassTypes[0]?.id || '');
    setTempComponents(template.components.map((c) => ({ ...c, rule: { ...c.rule } })));
  };

  const handleAddDimension = () => {
    const newDim: QuoteDimension = {
      id: `dim-${Date.now()}`,
      widthMm: 1200,
      heightMm: 1500,
      quantity: 1,
      label: `Dimension ${tempDimensions.length + 1}`,
    };
    setTempDimensions([...tempDimensions, newDim]);
  };

  const handleUpdateDimension = (
    index: number,
    field: keyof QuoteDimension,
    value: string | number
  ) => {
    const updated = [...tempDimensions];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setTempDimensions(updated);
  };

  const handleRemoveDimension = (index: number) => {
    if (tempDimensions.length <= 1) {
      setDimFormError('Vous devez conserver au moins une dimension.');
      return;
    }
    setTempDimensions(tempDimensions.filter((_, i) => i !== index));
  };

  // Change reference for a component in modal
  const handleChangeComponentReference = (compIndex: number, newRefId: string) => {
    const ref = references.find((r) => r.id === newRefId);
    if (!ref) return;

    const updated = [...tempComponents];
    updated[compIndex] = {
      ...updated[compIndex],
      referenceId: ref.id,
      referenceCode: ref.referenceCode,
      referenceName: ref.name,
      unitType: ref.unitType,
      unitPriceAr: ref.unitPriceAr || 0,
      calculationMode: ref.calculationMode,
      rule: { ...ref.rule },
    };
    setTempComponents(updated);
  };

  const handleToggleComponent = (compIndex: number) => {
    const updated = [...tempComponents];
    updated[compIndex] = {
      ...updated[compIndex],
      enabled: !updated[compIndex].enabled,
    };
    setTempComponents(updated);
  };

  // Save product to quote
  const handleSaveProductToQuote = () => {
    for (let i = 0; i < tempDimensions.length; i++) {
      const d = tempDimensions[i];
      if (!d.widthMm || d.widthMm <= 0) {
        setDimFormError(`Veuillez saisir une largeur valide pour la dimension #${i + 1}.`);
        return;
      }
      if (!d.heightMm || d.heightMm <= 0) {
        setDimFormError(`Veuillez saisir une hauteur valide pour la dimension #${i + 1}.`);
        return;
      }
      if (!d.quantity || d.quantity <= 0) {
        setDimFormError(`Veuillez saisir une quantité supérieure à 0 pour la dimension #${i + 1}.`);
        return;
      }
    }

    const template = products.find((p) => p.id === selectedProdTemplateId);
    if (!template) {
      setDimFormError('Veuillez sélectionner un modèle de produit.');
      return;
    }

    const selectedGlass = glassTypes.find((g) => g.id === tempGlassTypeId);

    // Run cutting engine with grouped profile references
    const calcResult = calculateDetailedProduct(
      tempDimensions,
      tempComponents,
      selectedGlass,
      settings
    );

    const newItem: QuoteProductItem = {
      id: editingItemIndex !== null ? quoteItems[editingItemIndex].id : `item-${Date.now()}`,
      productId: template.id,
      productName: template.name,
      dimensions: tempDimensions,
      selectedGlassTypeId: tempGlassTypeId,
      componentsConfig: tempComponents,
      calculationResult: calcResult,
    };

    if (editingItemIndex !== null) {
      const updated = [...quoteItems];
      updated[editingItemIndex] = newItem;
      setQuoteItems(updated);
    } else {
      setQuoteItems([...quoteItems, newItem]);
    }

    setIsProductModalOpen(false);
  };

  const handleRemoveProductFromQuote = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  // Calculations for entire quote
  const subtotalBarsAr = quoteItems.reduce(
    (sum, item) => sum + item.calculationResult.totalBarsCostAr,
    0
  );
  const subtotalGlassAr = quoteItems.reduce(
    (sum, item) => sum + item.calculationResult.glassCostAr,
    0
  );
  const subtotalAccessoriesAr = quoteItems.reduce(
    (sum, item) => sum + item.calculationResult.totalAccessoriesCostAr,
    0
  );
  const subtotalGrossAr =
    subtotalBarsAr + subtotalGlassAr + subtotalAccessoriesAr + (Number(transportFeeAr) || 0);
  const grandTotalAr = Math.max(0, subtotalGrossAr - (Number(discountAr) || 0));

  const currentClient = clients.find((c) => c.id === selectedClientId);

  const handleSaveEntireQuote = () => {
    if (quoteItems.length === 0) {
      alert('Veuillez ajouter au moins un produit au devis.');
      return;
    }

    const finalQuote: Quote = {
      id: quoteId,
      version: initialQuote?.version ?? 1,
      baseQuoteId: initialQuote?.baseQuoteId,
      clientId: selectedClientId,
      clientName: currentClient?.name || 'Client',
      clientPhone: currentClient?.phone,
      clientAddress: currentClient?.address,
      date: quoteDate,
      status: quoteStatus,
      isValidated: initialQuote?.isValidated ?? false,
      validatedAt: initialQuote?.validatedAt,
      items: quoteItems,
      transportFeeAr: Number(transportFeeAr) || 0,
      discountAr: Number(discountAr) || 0,
      subtotalBarsAr,
      subtotalGlassAr,
      subtotalAccessoriesAr,
      subtotalGrossAr,
      grandTotalAr,
      paidAmountAr: initialQuote?.paidAmountAr ?? 0,
      balanceRemainingAr: Math.max(0, grandTotalAr - (initialQuote?.paidAmountAr ?? 0)),
      notes: quoteNotes,
      observations: quoteObservations,
      terms: quoteTerms,
      createdAt: initialQuote ? initialQuote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveQuote(finalQuote);
    onSaveQuote(finalQuote);
  };

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
              {quoteId}
            </span>
            <h2 className="text-xl font-bold text-white">
              {initialQuote ? 'Modifier le devis' : 'Nouveau Devis'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Calcul avec calepinage de barres par référence (T45, K45, etc.) et vitrages
          </p>
        </div>

        <div className="flex items-center gap-2">
          {quoteItems.length > 0 && (
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 active:scale-95 transition"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Imprimer / PDF</span>
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Annuler
          </button>
        </div>
      </div>

      {/* Quote Metadata */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold text-xs mb-1">
              Client concerné <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs min-h-[44px]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold text-xs mb-1">Date</label>
            <input
              type="date"
              value={quoteDate}
              onChange={(e) => setQuoteDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold text-xs mb-1">Statut</label>
            <select
              value={quoteStatus}
              onChange={(e) => setQuoteStatus(e.target.value as Quote['status'])}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs min-h-[44px]"
            >
              <option value="brouillon">Brouillon</option>
              <option value="valide">Validé par le client</option>
              <option value="livre">Livré / Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products in Quote */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Produits assemblés dans ce devis ({quoteItems.length})
          </h3>

          <button
            onClick={openAddProductModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/40 active:scale-95 transition min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            + Ajouter un produit
          </button>
        </div>

        {quoteItems.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-3">
            <p className="text-sm text-slate-400">Aucun produit dans ce devis.</p>
            <button
              onClick={openAddProductModal}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Ajouter le premier produit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {quoteItems.map((item, index) => {
              const calc = item.calculationResult;

              return (
                <div
                  key={item.id || index}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 shadow-md space-y-3"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-700/60 gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                        Produit #{index + 1}
                      </span>
                      <h4 className="text-base font-bold text-white">{item.productName}</h4>
                      {/* References tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {calc.profileCalculations.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-cyan-300 font-mono"
                          >
                            {p.categoryName} : {p.profileCode} ({p.barsNeeded} b.)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExplainingItem(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium flex items-center gap-1 transition"
                        title="Voir calepinage barre par barre"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Calepinage ({calc.totalBarsNeeded} b.)</span>
                      </button>

                      <button
                        onClick={() => openEditProductModal(index)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => handleRemoveProductFromQuote(index)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dimensions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                          <th className="py-1 px-2 font-medium">Dimension (mm)</th>
                          <th className="py-1 px-2 font-medium text-center">Qté</th>
                          <th className="py-1 px-2 font-medium text-right">Surface Verre</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {item.dimensions.map((dim, dIdx) => (
                          <tr key={dim.id || dIdx}>
                            <td className="py-1.5 px-2 font-mono font-semibold text-cyan-300">
                              {dim.widthMm} × {dim.heightMm} mm
                            </td>
                            <td className="py-1.5 px-2 text-center tabular-nums font-bold">
                              {dim.quantity}
                            </td>
                            <td className="py-1.5 px-2 text-right tabular-nums text-slate-400">
                              {Number(((dim.widthMm / 1000) * (dim.heightMm / 1000) * dim.quantity).toFixed(2))} m²
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Price Summary */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/50 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Profilés aluminium ({calc.totalBarsNeeded} barres au total) :</span>
                      <strong className="text-white tabular-nums">{formatAriary(calc.totalBarsCostAr)}</strong>
                    </div>

                    {calc.glassCostAr > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Vitrage ({calc.selectedGlassName} - {calc.totalGlassAreaM2} m²) :</span>
                        <strong className="text-white tabular-nums">{formatAriary(calc.glassCostAr)}</strong>
                      </div>
                    )}

                    {calc.totalAccessoriesCostAr > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Accessoires configurés :</span>
                        <strong className="text-white tabular-nums">{formatAriary(calc.totalAccessoriesCostAr)}</strong>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-sm font-bold text-cyan-400">
                      <span>Total ce produit :</span>
                      <span className="tabular-nums">{formatAriary(calc.totalProductPriceAr)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transport & Totals */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#082832] border-2 border-cyan-800/40 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Frais de Transport & Total Général
        </h3>

        <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Frais de transport</span>
              <span className="text-[11px] text-slate-400">Ajustable manuellement</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="5000"
              value={transportFeeAr}
              onChange={(e) => setTransportFeeAr(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-36 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm text-right tabular-nums focus:outline-none focus:border-cyan-500"
            />
            <span className="text-xs font-bold text-slate-300">Ar</span>
          </div>
        </div>

        {/* Remise commerciale */}
        <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Remise commerciale</span>
              <span className="text-[11px] text-slate-400">Réduction éventuelle accordée</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="5000"
              value={discountAr}
              onChange={(e) => setDiscountAr(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-36 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-sm text-right tabular-nums focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs font-bold text-slate-300">Ar</span>
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="space-y-2 text-xs pt-1">
          <div className="flex justify-between text-slate-300">
            <span>Sous-total profilés aluminium :</span>
            <span className="font-semibold text-white tabular-nums">{formatAriary(subtotalBarsAr)}</span>
          </div>
          {subtotalGlassAr > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Sous-total vitrage :</span>
              <span className="font-semibold text-white tabular-nums">{formatAriary(subtotalGlassAr)}</span>
            </div>
          )}
          {subtotalAccessoriesAr > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Sous-total accessoires :</span>
              <span className="font-semibold text-white tabular-nums">
                {formatAriary(subtotalAccessoriesAr)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-300">
            <span>Frais de transport :</span>
            <span className="font-semibold text-white tabular-nums">
              {formatAriary(Number(transportFeeAr) || 0)}
            </span>
          </div>
          {discountAr > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Remise accordée :</span>
              <span className="font-semibold tabular-nums">- {formatAriary(discountAr)}</span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-cyan-800/60 flex items-center justify-between text-white">
            <div>
              <span className="text-xs text-cyan-200 block uppercase font-bold tracking-wider">
                TOTAL GÉNÉRAL
              </span>
              <span className="text-[11px] text-slate-400">Toutes taxes comprises</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              {formatAriary(grandTotalAr)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveEntireQuote}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-98 transition min-h-[48px]"
          >
            <Check className="w-5 h-5" />
            Enregistrer le devis
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            disabled={quoteItems.length === 0}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98 min-h-[48px]"
          >
            <Printer className="w-4 h-4" />
            Aperçu Devis / PDF
          </button>
        </div>
      </div>

      {/* Product & Dimensions Modal (Sections 11, 12, 13, 14) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#0c3e4f] to-[#082832] border-b border-cyan-800/40 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-cyan-400" />
                  {editingItemIndex !== null ? 'Modifier le produit' : 'Ajouter un produit au devis'}
                </h3>
                <p className="text-xs text-cyan-200/80">Dimensions multiples & Profils sélectionnés</p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {dimFormError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-medium text-xs">
                  {dimFormError}
                </div>
              )}

              {/* 1. Select Model */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                  1. Modèle de produit assemblé <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedProdTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:border-cyan-500 min-h-[44px]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Multiple Dimensions */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                      2. Dimensions du produit (Largeur × Hauteur mm)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ajoutez autant de dimensions que nécessaire pour ce modèle
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDimension}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-xs flex items-center gap-1 transition active:scale-95 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Ajouter une dimension
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tempDimensions.map((dim, idx) => (
                    <div
                      key={dim.id || idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-wrap sm:flex-nowrap items-center gap-2.5"
                    >
                      <span className="text-[11px] font-mono font-bold text-cyan-400 w-12 shrink-0">
                        Dim #{idx + 1}
                      </span>

                      {/* Width */}
                      <div className="w-[calc(50%-28px)] sm:w-28">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Largeur (mm)</label>
                        <input
                          type="number"
                          min="100"
                          max="10000"
                          step="10"
                          value={dim.widthMm}
                          onChange={(e) =>
                            handleUpdateDimension(idx, 'widthMm', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <span className="text-slate-500 font-bold pt-3 sm:pt-4">×</span>

                      {/* Height */}
                      <div className="w-[calc(50%-28px)] sm:w-28">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Hauteur (mm)</label>
                        <input
                          type="number"
                          min="100"
                          max="10000"
                          step="10"
                          value={dim.heightMm}
                          onChange={(e) =>
                            handleUpdateDimension(idx, 'heightMm', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="w-20">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Quantité</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={dim.quantity}
                          onChange={(e) =>
                            handleUpdateDimension(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDimension(idx)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 sm:self-end mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Glass Selection */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  3. Type de vitrage
                </label>
                <select
                  value={tempGlassTypeId}
                  onChange={(e) => setTempGlassTypeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs min-h-[44px]"
                >
                  <option value="">Aucun vitrage</option>
                  {glassTypes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {formatAriary(g.pricePerM2)} / m²
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Active Profile References for this Product Item */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    4. Références utilisées pour cette ligne de devis
                  </label>
                  <span className="text-[11px] text-slate-400">Modifiables au besoin</span>
                </div>

                <div className="space-y-2">
                  {tempComponents.map((comp, cIdx) => {
                    const catRefs = references.filter(
                      (r) => r.categoryName.toLowerCase() === comp.categoryName.toLowerCase()
                    );

                    return (
                      <div
                        key={cIdx}
                        className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                          comp.enabled
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={comp.enabled}
                            onChange={() => handleToggleComponent(cIdx)}
                            className="rounded text-cyan-500"
                          />
                          <span className="font-semibold text-white">{comp.categoryName}</span>
                        </label>

                        {comp.enabled && (
                          <div className="flex items-center gap-2">
                            <select
                              value={comp.referenceId}
                              onChange={(e) => handleChangeComponentReference(cIdx, e.target.value)}
                              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs"
                            >
                              {catRefs.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.referenceCode} — {r.name}
                                </option>
                              ))}
                            </select>

                            <span className="text-slate-400 tabular-nums">
                              {formatAriary(comp.unitPriceAr)} / {comp.unitType}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition min-h-[44px]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveProductToQuote}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                Valider ce produit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bar Calculation Explanation Modal */}
      {explainingItem && (
        <BarCalculationExplanationModal
          isOpen={!!explainingItem}
          onClose={() => setExplainingItem(null)}
          productName={explainingItem.productName}
          calc={explainingItem.calculationResult}
        />
      )}

      {/* Quote Print Modal */}
      {isPrintModalOpen && (
        <QuotePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          quote={{
            id: quoteId,
            version: initialQuote?.version ?? 1,
            baseQuoteId: initialQuote?.baseQuoteId,
            clientId: selectedClientId,
            clientName: currentClient?.name || 'Client',
            clientPhone: currentClient?.phone,
            clientAddress: currentClient?.address,
            date: quoteDate,
            status: quoteStatus,
            isValidated: initialQuote?.isValidated ?? false,
            validatedAt: initialQuote?.validatedAt,
            items: quoteItems,
            transportFeeAr: Number(transportFeeAr) || 0,
            discountAr: Number(discountAr) || 0,
            subtotalBarsAr,
            subtotalGlassAr,
            subtotalAccessoriesAr,
            subtotalGrossAr,
            grandTotalAr,
            paidAmountAr: initialQuote?.paidAmountAr ?? 0,
            balanceRemainingAr: Math.max(0, grandTotalAr - (initialQuote?.paidAmountAr ?? 0)),
            notes: quoteNotes,
            observations: quoteObservations,
            terms: quoteTerms,
            createdAt: initialQuote ? initialQuote.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          settings={settings}
        />
      )}
    </div>
  );
};
