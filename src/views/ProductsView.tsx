import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Check,
  X,
  Ruler,
  Layers,
  ChevronRight,
  Info,
  Sliders,
} from 'lucide-react';
import {
  ProductTemplate,
  ProductComponentConfig,
  Category,
  ProfileReference,
  GlassType,
} from '../types';
import { storageService } from '../services/storageService';
import { formatAriary } from '../utils/calculationEngine';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface ProductsViewProps {
  products: ProductTemplate[];
  categories: Category[];
  references: ProfileReference[];
  glassTypes: GlassType[];
  onRefresh: () => void;
  onNavigateToCatalog: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  references,
  glassTypes,
  onRefresh,
  onNavigateToCatalog,
}) => {
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductTemplate | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formComponents, setFormComponents] = useState<ProductComponentConfig[]>([]);
  const [formGlassId, setFormGlassId] = useState<string>('');
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<ProductTemplate | null>(null);

  // Generate initial component configs for a product from categories & available references
  const buildInitialComponents = (): ProductComponentConfig[] => {
    return categories.map((cat) => {
      const catRefs = references.filter(
        (r) => r.categoryName.toLowerCase() === cat.name.toLowerCase()
      );
      const defaultRef = catRefs[0];

      // Initial active categories by default: Batis, Ouvrante, Parclose, Poignet, Silicone
      const shouldBeEnabled = ['Batis', 'Ouvrante', 'Parclose', 'Poignet', 'Silicone'].includes(
        cat.name
      );

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        enabled: shouldBeEnabled && !!defaultRef,
        referenceId: defaultRef?.id || '',
        referenceCode: defaultRef?.referenceCode || '',
        referenceName: defaultRef?.name || `${cat.name} Standard`,
        unitType: defaultRef?.unitType || cat.unit,
        unitPriceAr: defaultRef?.unitPriceAr || cat.defaultPrice,
        calculationMode: defaultRef?.calculationMode || (cat.unit === 'barre' ? 'bar' : 'piece'),
        rule: defaultRef?.rule || {
          formulaWidthMultiplier: 2,
          formulaHeightMultiplier: 2,
          customFormulaText: '2 × L + 2 × H',
        },
      };
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormComponents(buildInitialComponents());
    setFormGlassId(glassTypes[1]?.id || glassTypes[0]?.id || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (prod: ProductTemplate) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormDesc(prod.description || '');

    // Merge with any categories that might have been added later
    const existingMap = new Map(prod.components.map((c) => [c.categoryName.toLowerCase(), c]));
    const merged = categories.map((cat) => {
      const existing = existingMap.get(cat.name.toLowerCase());
      if (existing) return { ...existing };

      const catRefs = references.filter(
        (r) => r.categoryName.toLowerCase() === cat.name.toLowerCase()
      );
      const defaultRef = catRefs[0];

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        enabled: false,
        referenceId: defaultRef?.id || '',
        referenceCode: defaultRef?.referenceCode || '',
        referenceName: defaultRef?.name || `${cat.name}`,
        unitType: defaultRef?.unitType || cat.unit,
        unitPriceAr: defaultRef?.unitPriceAr || cat.defaultPrice,
        calculationMode: defaultRef?.calculationMode || 'piece',
        rule: defaultRef?.rule || { formulaWidthMultiplier: 0, formulaHeightMultiplier: 0, fixedQuantity: 1 },
      };
    });

    setFormComponents(merged);
    setFormGlassId(prod.defaultGlassTypeId || glassTypes[0]?.id || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDuplicateProduct = (prodId: string) => {
    const copy = storageService.duplicateProduct(prodId);
    if (copy) {
      onRefresh();
    }
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    storageService.deleteProduct(productToDelete.id);
    setProductToDelete(null);
    onRefresh();
  };

  // Toggle category enabled state
  const handleToggleComponent = (index: number) => {
    const updated = [...formComponents];
    updated[index] = {
      ...updated[index],
      enabled: !updated[index].enabled,
    };
    setFormComponents(updated);
  };

  // Select exact profile reference for a category
  const handleSelectReferenceForComponent = (index: number, refId: string) => {
    const ref = references.find((r) => r.id === refId);
    if (!ref) return;

    const updated = [...formComponents];
    updated[index] = {
      ...updated[index],
      referenceId: ref.id,
      referenceCode: ref.referenceCode,
      referenceName: ref.name,
      unitType: ref.unitType,
      unitPriceAr: ref.unitPriceAr || 0,
      calculationMode: ref.calculationMode,
      rule: { ...ref.rule },
    };
    setFormComponents(updated);
  };

  // Update rule multiplier for a component
  const handleUpdateComponentRule = (
    index: number,
    field: 'formulaWidthMultiplier' | 'formulaHeightMultiplier' | 'fixedQuantity',
    val: number
  ) => {
    const updated = [...formComponents];
    const comp = updated[index];
    const newRule = {
      ...comp.rule,
      [field]: Math.max(0, val),
    };
    updated[index] = {
      ...comp,
      rule: newRule,
    };
    setFormComponents(updated);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Veuillez saisir un nom pour le produit.');
      return;
    }

    const enabledComponents = formComponents.filter((c) => c.enabled && c.referenceId);
    if (enabledComponents.length === 0) {
      setFormError('Veuillez cocher et associer au moins un composant pour ce produit.');
      return;
    }

    const prodToSave: ProductTemplate = {
      id: editingProduct ? editingProduct.id : storageService.generateProductId(),
      name: formName.trim(),
      description: formDesc.trim(),
      components: formComponents,
      defaultGlassTypeId: formGlassId,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveProduct(prodToSave);
    onRefresh();
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            Modèles de Produits Assemblés
          </h2>
          <p className="text-xs text-slate-400">
            {products.length} modèles configurés par assemblage précis de profils et références
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToCatalog}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Catalogue Profils</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 active:scale-95 transition min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            + Ajouter un produit
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {products.map((prod) => {
          const activeComponents = prod.components.filter((c) => c.enabled);

          return (
            <div
              key={prod.id}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 transition flex flex-col justify-between gap-3 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                    {prod.id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeComponents.length} composants assemblés
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{prod.name}</h3>
                {prod.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2.5">{prod.description}</p>
                )}

                {/* Assembled References Box (Sections 11 & 12) */}
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/60 space-y-1.5 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Configuration des profils et variantes :
                  </span>
                  <div className="space-y-1">
                    {activeComponents.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center justify-between text-xs px-2 py-1 rounded bg-slate-800/80 border border-slate-700/50"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">{c.categoryName} :</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {c.referenceCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {c.unitType === 'barre'
                            ? `${c.rule.formulaWidthMultiplier}×L + ${c.rule.formulaHeightMultiplier}×H`
                            : `Qté ${c.rule.fixedQuantity || 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Prêt pour calcul devis</span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicateProduct(prod.id)}
                    className="p-2 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-700 transition"
                    title="Dupliquer le produit"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(prod)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductToDelete(prod)}
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

      {/* Edit / Create Product Modal (Section 13) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#0c3e4f] to-[#082832] border-b border-cyan-800/40 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  {editingProduct ? 'Modifier le modèle de produit' : 'Nouveau modèle de produit'}
                </h3>
                <p className="text-xs text-cyan-200/80">Assemblage précis des profils & variantes</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-medium">
                  {formError}
                </div>
              )}

              {/* Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nom du produit <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Fenêtre Aluminium T45, Baie vitrée K70, Porte Aluminium..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm min-h-[44px]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Ex: Série T45 avec vitrage 5mm et crémone..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 min-h-[40px]"
                  />
                </div>
              </div>

              {/* Section 13: Category Checkbox + Reference Dropdown for each category */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Sélection des profils et accessoires (Assemblage)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cochez chaque catégorie requise et choisissez la référence exacte dans la liste
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateToCatalog}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                  >
                    + Gérer les références
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formComponents.map((comp, idx) => {
                    const catRefs = references.filter(
                      (r) => r.categoryName.toLowerCase() === comp.categoryName.toLowerCase()
                    );

                    return (
                      <div
                        key={comp.categoryId || idx}
                        className={`p-3 rounded-xl border transition ${
                          comp.enabled
                            ? 'bg-slate-900 border-cyan-500/50 shadow-sm'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          {/* Checkbox & Category Name */}
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={comp.enabled}
                              onChange={() => handleToggleComponent(idx)}
                              className="rounded text-cyan-500 focus:ring-cyan-500 border-slate-600 w-4 h-4"
                            />
                            <span className="text-sm font-bold text-white">
                              {comp.categoryName}
                            </span>
                          </label>

                          {/* Reference Dropdown (Section 13) */}
                          {comp.enabled && (
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={comp.referenceId}
                                onChange={(e) => handleSelectReferenceForComponent(idx, e.target.value)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:border-cyan-500 min-h-[36px]"
                              >
                                {catRefs.length === 0 ? (
                                  <option value="">Aucune référence dans cette catégorie</option>
                                ) : (
                                  catRefs.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.referenceCode} — {r.name} ({formatAriary(r.unitPriceAr || 0)} / {r.unitType})
                                    </option>
                                  ))
                                )}
                              </select>

                              {/* Rule customizer */}
                              {comp.unitType === 'barre' ? (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <span>L×</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="8"
                                    value={comp.rule.formulaWidthMultiplier}
                                    onChange={(e) =>
                                      handleUpdateComponentRule(
                                        idx,
                                        'formulaWidthMultiplier',
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    className="w-10 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-center"
                                  />
                                  <span>+ H×</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="8"
                                    value={comp.rule.formulaHeightMultiplier}
                                    onChange={(e) =>
                                      handleUpdateComponentRule(
                                        idx,
                                        'formulaHeightMultiplier',
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    className="w-10 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-center"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <span>Qté :</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={comp.rule.fixedQuantity || 1}
                                    onChange={(e) =>
                                      handleUpdateComponentRule(
                                        idx,
                                        'fixedQuantity',
                                        parseInt(e.target.value, 10) || 1
                                      )
                                    }
                                    className="w-12 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-center"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Default Glass selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Type de vitrage par défaut pour ce produit
                </label>
                <select
                  value={formGlassId}
                  onChange={(e) => setFormGlassId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-sm min-h-[44px]"
                >
                  <option value="">Aucun vitrage par défaut</option>
                  {glassTypes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({formatAriary(g.pricePerM2)} / m²)
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Check className="w-4 h-4" />
                  Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={!!productToDelete}
        title="Supprimer le modèle de produit"
        message="Voulez-vous vraiment supprimer cet élément ?"
        itemName={productToDelete?.name}
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
