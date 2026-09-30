import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Ruler,
  DollarSign,
  Filter,
  Check,
  X,
  Info,
} from 'lucide-react';
import {
  ProfileReference,
  Category,
  CategoryUnit,
  CalculationMode,
  GlobalSettings,
} from '../types';
import { storageService } from '../services/storageService';
import { formatAriary, formatNumber } from '../utils/calculationEngine';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface CatalogViewProps {
  references: ProfileReference[];
  categories: Category[];
  settings: GlobalSettings;
  onRefresh: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  references,
  categories,
  settings,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<ProfileReference | null>(null);

  // Form fields
  const [formCategoryName, setFormCategoryName] = useState(categories[0]?.name || 'Batis');
  const [formReferenceCode, setFormReferenceCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUnitType, setFormUnitType] = useState<CategoryUnit>('barre');
  const [formCalculationMode, setFormCalculationMode] = useState<CalculationMode>('bar');
  const [formBarLengthMm, setFormBarLengthMm] = useState<number>(settings.standardBarLengthMm);
  const [formUnitPriceAr, setFormUnitPriceAr] = useState<number>(settings.standardBarPriceAr);
  const [formWidthMultiplier, setFormWidthMultiplier] = useState<number>(2);
  const [formHeightMultiplier, setFormHeightMultiplier] = useState<number>(2);
  const [formFixedQuantity, setFormFixedQuantity] = useState<number>(1);
  const [formCustomFormula, setFormCustomFormula] = useState<string>('');
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [refToDelete, setRefToDelete] = useState<ProfileReference | null>(null);

  // Filtered references
  const filteredReferences = references.filter((r) => {
    const matchesSearch =
      r.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      r.categoryName.toLowerCase() === selectedCategoryFilter.toLowerCase();

    const matchesUnit =
      selectedUnitFilter === 'all' || r.unitType === selectedUnitFilter;

    return matchesSearch && matchesCategory && matchesUnit;
  });

  const openCreateModal = () => {
    setEditingRef(null);
    setFormCategoryName(categories[0]?.name || 'Batis');
    setFormReferenceCode('');
    setFormName('');
    setFormDescription('');
    setFormUnitType('barre');
    setFormCalculationMode('bar');
    setFormBarLengthMm(settings.standardBarLengthMm);
    setFormUnitPriceAr(settings.standardBarPriceAr);
    setFormWidthMultiplier(2);
    setFormHeightMultiplier(2);
    setFormFixedQuantity(1);
    setFormCustomFormula('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (ref: ProfileReference) => {
    setEditingRef(ref);
    setFormCategoryName(ref.categoryName);
    setFormReferenceCode(ref.referenceCode);
    setFormName(ref.name);
    setFormDescription(ref.description || '');
    setFormUnitType(ref.unitType);
    setFormCalculationMode(ref.calculationMode);
    setFormBarLengthMm(ref.barLengthMm || settings.standardBarLengthMm);
    setFormUnitPriceAr(ref.unitPriceAr || settings.standardBarPriceAr);
    setFormWidthMultiplier(ref.rule?.formulaWidthMultiplier ?? 2);
    setFormHeightMultiplier(ref.rule?.formulaHeightMultiplier ?? 2);
    setFormFixedQuantity(ref.rule?.fixedQuantity ?? 1);
    setFormCustomFormula(ref.rule?.customFormulaText || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDuplicate = (id: string) => {
    storageService.duplicateReference(id);
    onRefresh();
  };

  const handleDelete = () => {
    if (!refToDelete) return;
    storageService.deleteReference(refToDelete.id);
    setRefToDelete(null);
    onRefresh();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReferenceCode.trim()) {
      setFormError('Veuillez saisir un code de référence (ex: T45, K45, P01).');
      return;
    }
    if (!formName.trim()) {
      setFormError('Veuillez saisir un nom pour cette référence.');
      return;
    }

    const cat = categories.find(
      (c) => c.name.toLowerCase() === formCategoryName.toLowerCase()
    );

    const generatedFormula =
      formCalculationMode === 'bar' || formUnitType === 'barre'
        ? `${formWidthMultiplier} × L + ${formHeightMultiplier} × H`
        : formCalculationMode === 'piece'
        ? `Qté fixe : ${formFixedQuantity}`
        : formCustomFormula || `${formWidthMultiplier} × L + ${formHeightMultiplier} × H`;

    const saved: ProfileReference = {
      id: editingRef ? editingRef.id : `ref-${Date.now()}`,
      categoryId: cat?.id || `cat-${formCategoryName}`,
      categoryName: formCategoryName,
      referenceCode: formReferenceCode.trim().toUpperCase(),
      name: formName.trim(),
      description: formDescription.trim(),
      unitType: formUnitType,
      calculationMode: formCalculationMode,
      barLengthMm: formUnitType === 'barre' ? Number(formBarLengthMm) || settings.standardBarLengthMm : undefined,
      unitPriceAr: Number(formUnitPriceAr) || 0,
      rule: {
        formulaWidthMultiplier: Number(formWidthMultiplier) || 0,
        formulaHeightMultiplier: Number(formHeightMultiplier) || 0,
        fixedQuantity: Number(formFixedQuantity) || 1,
        customFormulaText: formCustomFormula.trim() || generatedFormula,
      },
      createdAt: editingRef ? editingRef.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveReference(saved);
    onRefresh();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Catalogue des Profils & Accessoires
          </h2>
          <p className="text-xs text-slate-400">
            {references.length} références configurées (T45, K45, B45, P01, PA01, etc.)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 active:scale-95 transition min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          + Ajouter une référence / profil
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence (ex: T45, K45, P01), nom, catégorie..."
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

        {/* Category Horizontal Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition min-h-[34px] ${
              selectedCategoryFilter === 'all'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.name)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition min-h-[34px] ${
                selectedCategoryFilter.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-cyan-700 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* References Grid */}
      {filteredReferences.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-2">
          <p className="text-sm text-slate-400">Aucune référence trouvée pour ces critères.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Créer une nouvelle référence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredReferences.map((ref) => (
            <div
              key={ref.id}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 transition flex flex-col justify-between gap-2.5 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                    {ref.referenceCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {ref.categoryName}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white truncate">{ref.name}</h3>
                {ref.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{ref.description}</p>
                )}

                {/* Specs Box */}
                <div className="mt-2 p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Unité & Prix :</span>
                    <strong className="text-emerald-400 tabular-nums">
                      {formatAriary(ref.unitPriceAr || settings.standardBarPriceAr)} / {ref.unitType}
                    </strong>
                  </div>

                  {ref.unitType === 'barre' && (
                    <div className="flex justify-between text-slate-400">
                      <span>Longueur barre :</span>
                      <span className="text-slate-200 font-mono">
                        {formatNumber(ref.barLengthMm || settings.standardBarLengthMm)} mm
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Règle :</span>
                    <span className="text-cyan-300 font-medium">
                      {ref.rule?.customFormulaText ||
                        (ref.unitType === 'barre'
                          ? `${ref.rule?.formulaWidthMultiplier}×L + ${ref.rule?.formulaHeightMultiplier}×H`
                          : `Qté ${ref.rule?.fixedQuantity || 1}`)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 uppercase">
                  Mode : {ref.calculationMode}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(ref.id)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-700 transition"
                    title="Dupliquer la référence"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(ref)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefToDelete(ref)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Reference Modal (Section 5 prompt example) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#0c3e4f] to-[#082832] border-b border-cyan-800/40 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  {editingRef ? 'Modifier la référence de profil' : 'Ajouter une référence de profil'}
                </h3>
                <p className="text-xs text-cyan-200/80">Fiche technique du composant</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-medium">
                  {formError}
                </div>
              )}

              {/* Category & Reference Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Catégorie <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formCategoryName}
                    onChange={(e) => {
                      setFormCategoryName(e.target.value);
                      const cat = categories.find((c) => c.name === e.target.value);
                      if (cat) {
                        setFormUnitType(cat.unit);
                        setFormCalculationMode(cat.unit === 'barre' ? 'bar' : 'piece');
                        setFormUnitPriceAr(cat.defaultPrice);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500 min-h-[40px]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Référence (Code) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formReferenceCode}
                    onChange={(e) => setFormReferenceCode(e.target.value)}
                    placeholder="Ex: T45, K45, P01, PC01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500 min-h-[40px]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Full Name & Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom complet du profil / accessoire <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Batis T45, Poignée crémone P02..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Profilé aluminium Batis tubulaire série T45"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 min-h-[40px]"
                />
              </div>

              {/* Unit & Calculation Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type d'unité</label>
                  <select
                    value={formUnitType}
                    onChange={(e) => {
                      const u = e.target.value as CategoryUnit;
                      setFormUnitType(u);
                      if (u === 'barre') setFormCalculationMode('bar');
                      else if (u === 'piece' || u === 'lot' || u === 'forfait') setFormCalculationMode('piece');
                      else if (u === 'metre' || u === 'mm') setFormCalculationMode('linear_meter');
                      else if (u === 'm2') setFormCalculationMode('surface_m2');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 min-h-[40px]"
                  >
                    <option value="barre">Barre</option>
                    <option value="piece">Pièce</option>
                    <option value="metre">Mètre</option>
                    <option value="mm">mm</option>
                    <option value="m2">m²</option>
                    <option value="kg">kg</option>
                    <option value="lot">Lot</option>
                    <option value="forfait">Forfait</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type de calcul</label>
                  <select
                    value={formCalculationMode}
                    onChange={(e) => setFormCalculationMode(e.target.value as CalculationMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 min-h-[40px]"
                  >
                    <option value="bar">Par barre (Calepinage)</option>
                    <option value="piece">Par pièce</option>
                    <option value="linear_meter">Par mètre linéaire</option>
                    <option value="surface_m2">Par m² (Surface)</option>
                    <option value="fixed_qty">Quantité fixe</option>
                    <option value="custom_formula">Formule personnalisée</option>
                  </select>
                </div>
              </div>

              {/* Price & Bar Length */}
              <div className="grid grid-cols-2 gap-3">
                {formUnitType === 'barre' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Longueur standard (mm)
                    </label>
                    <input
                      type="number"
                      min="1000"
                      max="12000"
                      step="50"
                      value={formBarLengthMm}
                      onChange={(e) => setFormBarLengthMm(parseInt(e.target.value, 10) || settings.standardBarLengthMm)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-mono tabular-nums font-bold focus:outline-none focus:border-cyan-500 min-h-[40px]"
                    />
                  </div>
                )}

                <div className={formUnitType === 'barre' ? '' : 'col-span-2'}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">
                      Prix unitaire (Ar) {formUnitType === 'barre' ? 'par barre' : `par ${formUnitType}`}
                    </label>
                    <span className="text-emerald-400 font-bold font-mono text-xs">
                      {formatAriary(formUnitPriceAr)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formUnitPriceAr}
                    onChange={(e) => setFormUnitPriceAr(parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 16000, 18000, 240000..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono tabular-nums font-bold focus:outline-none focus:border-cyan-500 min-h-[40px]"
                  />
                </div>
              </div>

              {/* Consumption Rules (Section 8: Variables L, H, Q) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                  Règle de consommation matière / quantité
                </label>

                {formUnitType === 'barre' || formCalculationMode === 'bar' || formCalculationMode === 'linear_meter' ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Nombre de Largeur (L)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formWidthMultiplier}
                          onChange={(e) => setFormWidthMultiplier(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Nombre de Hauteur (H)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formHeightMultiplier}
                          onChange={(e) => setFormHeightMultiplier(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs">
                      Formule générée :{' '}
                      <strong className="text-cyan-300 font-mono">
                        {formWidthMultiplier} × Largeur + {formHeightMultiplier} × Hauteur
                      </strong>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Formule personnalisée (optionnel)
                      </label>
                      <input
                        type="text"
                        value={formCustomFormula}
                        onChange={(e) => setFormCustomFormula(e.target.value)}
                        placeholder="Ex: 2×L + 4×H ou L + 2×H"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Quantité fixe par produit
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={formFixedQuantity}
                      onChange={(e) => setFormFixedQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ex: 4 pour paumelles de porte, 1 pour poignée ou serrure.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Check className="w-4 h-4" />
                  Enregistrer la référence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!refToDelete}
        title="Supprimer la référence"
        message="Voulez-vous vraiment supprimer cet élément ?"
        itemName={refToDelete ? `${refToDelete.categoryName} - ${refToDelete.referenceCode} (${refToDelete.name})` : ''}
        onConfirm={handleDelete}
        onCancel={() => setRefToDelete(null)}
      />
    </div>
  );
};
