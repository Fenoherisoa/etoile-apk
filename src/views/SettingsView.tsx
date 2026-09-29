import React, { useState, useRef } from 'react';
import {
  Settings,
  Ruler,
  Layers,
  Sparkles,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { GlobalSettings, Category, GlassType, CategoryUnit } from '../types';
import { storageService } from '../services/storageService';
import { formatAriary } from '../utils/calculationEngine';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface SettingsViewProps {
  settings: GlobalSettings;
  categories: Category[];
  glassTypes: GlassType[];
  onRefresh: () => void;
  onNavigateToCatalog?: () => void;
  onNavigateToProducts?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  categories,
  glassTypes,
  onRefresh,
  onNavigateToCatalog,
  onNavigateToProducts,
}) => {
  // Global settings state
  const [barLengthMm, setBarLengthMm] = useState(settings.standardBarLengthMm);
  const [barPriceAr, setBarPriceAr] = useState(settings.standardBarPriceAr);
  const [sawKerfMm, setSawKerfMm] = useState(settings.sawKerfMm || 4);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companySubtitle, setCompanySubtitle] = useState(settings.companySubtitle);
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone);
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress);
  const [globalSavedToast, setGlobalSavedToast] = useState(false);

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catUnit, setCatUnit] = useState<CategoryUnit>('barre');
  const [catPrice, setCatPrice] = useState(240000);
  const [catError, setCatError] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Glass type modal
  const [isGlassModalOpen, setIsGlassModalOpen] = useState(false);
  const [editingGlass, setEditingGlass] = useState<GlassType | null>(null);
  const [glassName, setGlassName] = useState('');
  const [glassPrice, setGlassPrice] = useState(45000);
  const [glassError, setGlassError] = useState('');
  const [glassToDelete, setGlassToDelete] = useState<GlassType | null>(null);

  // Import / Export state
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingBackupJSON, setPendingBackupJSON] = useState<string | null>(null);
  const [pendingBackupCounts, setPendingBackupCounts] = useState<{ clients: number; products: number; quotes: number; references: number } | null>(null);

  const handleSaveGlobalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GlobalSettings = {
      ...settings,
      standardBarLengthMm: Math.max(1000, Number(barLengthMm) || 5800),
      standardBarPriceAr: Math.max(0, Number(barPriceAr) || 240000),
      sawKerfMm: Math.max(0, Number(sawKerfMm) || 4),
      companyName: companyName.trim() || 'ETOILE ALU',
      companySubtitle: companySubtitle.trim(),
      companyPhone: companyPhone.trim(),
      companyAddress: companyAddress.trim(),
    };

    storageService.saveSettings(updated);
    onRefresh();
    setGlobalSavedToast(true);
    setTimeout(() => setGlobalSavedToast(false), 3000);
  };

  // Category handlers
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatUnit('barre');
    setCatPrice(240000);
    setCatError('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatUnit(cat.unit);
    setCatPrice(cat.defaultPrice);
    setCatError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Veuillez saisir un nom de catégorie.');
      return;
    }

    const catToSave: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: catName.trim(),
      unit: catUnit,
      defaultPrice: Math.max(0, Number(catPrice) || 0),
      isSystem: editingCategory ? editingCategory.isSystem : false,
    };

    storageService.saveCategory(catToSave);
    onRefresh();
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    storageService.deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
    onRefresh();
  };

  // Glass types handlers
  const openAddGlass = () => {
    setEditingGlass(null);
    setGlassName('');
    setGlassPrice(45000);
    setGlassError('');
    setIsGlassModalOpen(true);
  };

  const openEditGlass = (g: GlassType) => {
    setEditingGlass(g);
    setGlassName(g.name);
    setGlassPrice(g.pricePerM2);
    setGlassError('');
    setIsGlassModalOpen(true);
  };

  const handleSaveGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!glassName.trim()) {
      setGlassError('Veuillez saisir un nom pour le vitrage.');
      return;
    }

    const glassToSave: GlassType = {
      id: editingGlass ? editingGlass.id : `glass-${Date.now()}`,
      name: glassName.trim(),
      pricePerM2: Math.max(0, Number(glassPrice) || 0),
      unit: 'm²',
    };

    storageService.saveGlassType(glassToSave);
    onRefresh();
    setIsGlassModalOpen(false);
  };

  const handleDeleteGlass = () => {
    if (!glassToDelete) return;
    storageService.deleteGlassType(glassToDelete.id);
    setGlassToDelete(null);
    onRefresh();
  };

  // File downloads
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = storageService.createBackupJSON();
    downloadFile(json, `etoile_alu_sauvegarde_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const handleExportClientsCSV = () => {
    const csv = storageService.exportClientsCSV();
    downloadFile(csv, `etoile_alu_clients_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportProductsCSV = () => {
    const csv = storageService.exportProductsCSV();
    downloadFile(csv, `etoile_alu_produits_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportQuotesCSV = () => {
    const csv = storageService.exportQuotesCSV();
    downloadFile(csv, `etoile_alu_devis_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  };

  // JSON Import reader
  const handleSelectJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.clients && parsed.products) {
          setPendingBackupJSON(text);
          setPendingBackupCounts({
            clients: parsed.clients.length || 0,
            products: parsed.products.length || 0,
            quotes: parsed.quotes?.length || 0,
            references: parsed.profileReferences?.length || 0,
          });
        } else {
          setImportStatus({ type: 'error', message: 'Fichier invalide : structure manquante.' });
        }
      } catch (err: unknown) {
        setImportStatus({ type: 'error', message: `Erreur lecture JSON: ${(err as Error).message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmJSONRestore = (overwrite: boolean) => {
    if (!pendingBackupJSON) return;
    const result = storageService.restoreBackupJSON(pendingBackupJSON, overwrite);
    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `Restauration réussie (${result.counts.references} références, ${result.counts.clients} clients, ${result.counts.products} produits).`,
      });
      onRefresh();
    } else {
      setImportStatus({ type: 'error', message: result.message });
    }
    setPendingBackupJSON(null);
    setPendingBackupCounts(null);
  };

  // CSV Import reader
  const handleSelectCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = storageService.importClientsCSV(text);
      if (result.importedCount > 0) {
        setImportStatus({
          type: 'success',
          message: `${result.importedCount} client(s) importé(s) depuis le CSV avec succès !`,
        });
        onRefresh();
      } else {
        setImportStatus({
          type: 'error',
          message: result.errors[0] || "Aucun client n'a pu être importé.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Paramètres Globaux & Configuration
        </h2>
        <p className="text-xs text-slate-400">
          Longueur/prix des barres, catalogue des profils, vitrages et sauvegarde locale
        </p>
      </div>

      {/* Global Saved Toast */}
      {globalSavedToast && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Paramètres globaux enregistrés et appliqués automatiquement !</span>
        </div>
      )}

      {/* Import Status Alert */}
      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
            importStatus.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button onClick={() => setImportStatus(null)} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* SECTION 20 : ADMINISTRATIVE SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {onNavigateToCatalog && (
          <button
            onClick={onNavigateToCatalog}
            className="p-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-cyan-800/40 hover:border-cyan-500/50 flex items-center justify-between text-left transition active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Catalogue des Profils & Variantes</h4>
                <p className="text-xs text-slate-400">Gérer T45, K45, B45, P01, PA01...</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
        )}

        {onNavigateToProducts && (
          <button
            onClick={onNavigateToProducts}
            className="p-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-teal-800/40 hover:border-teal-500/50 flex items-center justify-between text-left transition active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Modèles de Produits Assemblés</h4>
                <p className="text-xs text-slate-400">Configurer l'assemblage des profils</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-teal-400" />
          </button>
        )}
      </div>

      {/* SECTION 5.B & 5.C : GLOBAL BAR DEFAULTS */}
      <form
        onSubmit={handleSaveGlobalSettings}
        className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Ruler className="w-4 h-4 text-cyan-400" />
            Paramètres Globaux des Barres (Valeurs par défaut)
          </h3>
          <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
            Utilisé si non spécifié
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Longueur standard d'une barre (mm) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1000"
              max="12000"
              step="50"
              value={barLengthMm}
              onChange={(e) => setBarLengthMm(parseInt(e.target.value, 10) || 5800)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 tabular-nums min-h-[44px]"
            />
            <p className="text-[10px] text-slate-400 mt-1">Par défaut : 5 800 mm</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Prix standard d'une barre (Ar) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={barPriceAr}
              onChange={(e) => setBarPriceAr(parseInt(e.target.value, 10) || 240000)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 tabular-nums min-h-[44px]"
            />
            <p className="text-[10px] text-slate-400 mt-1">Par défaut : 240 000 Ar</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Trait de scie / Kerf lame (mm)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={sawKerfMm}
              onChange={(e) => setSawKerfMm(parseInt(e.target.value, 10) || 4)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 tabular-nums min-h-[44px]"
            />
            <p className="text-[10px] text-slate-400 mt-1">Épaisseur perte (défaut: 4 mm)</p>
          </div>
        </div>

        {/* Company Coordinates */}
        <div className="pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nom de l'entreprise</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white min-h-[40px]"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Téléphone atelier</label>
            <input
              type="text"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white min-h-[40px]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">Adresse</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white min-h-[40px]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 active:scale-95 transition min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            [Enregistrer les paramètres globaux]
          </button>
        </div>
      </form>

      {/* SECTION 9 : GLASS TYPES */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Types de Vitrage & Prix au m²
            </h3>
            <p className="text-[11px] text-slate-400">
              Vitre claire, fumée, teintée, opaque (calcul au m²)
            </p>
          </div>

          <button
            onClick={openAddGlass}
            className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            + Ajouter vitrage
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {glassTypes.map((g) => (
            <div
              key={g.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-700/70 flex items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-semibold text-white block">{g.name}</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {formatAriary(g.pricePerM2)} / m²
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditGlass(g)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGlassToDelete(g)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3 & 6 : CATEGORIES LIST */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Catégories de Composants
            </h3>
            <p className="text-[11px] text-slate-400">
              Chaque catégorie contient ses propres références et profils
            </p>
          </div>

          <button
            onClick={openAddCategory}
            className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            + Ajouter catégorie
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/70 flex items-center justify-between gap-1.5 text-xs"
            >
              <div className="min-w-0">
                <span className="font-semibold text-white block truncate">{cat.name}</span>
                <span className="text-[10px] text-slate-400">Unité: {cat.unit}</span>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => openEditCategory(cat)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5.A & 18 : IMPORT / EXPORT */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#082832] border-2 border-cyan-800/40 shadow-xl space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Import / Export & Sauvegarde des Données
          </h3>
          <p className="text-xs text-slate-400">
            Sauvegardez l'ensemble du catalogue de profils, catégories, devis et clients
          </p>
        </div>

        {/* Export Center Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-cyan-300 block">Exportation des données :</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleExportClientsCSV}
              className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left text-xs text-slate-200 transition active:scale-98 flex flex-col justify-between gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <div>
                <span className="font-bold block text-white">[Exporter Clients]</span>
                <span className="text-[10px] text-slate-400">Fichier CSV</span>
              </div>
            </button>

            <button
              onClick={handleExportProductsCSV}
              className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left text-xs text-slate-200 transition active:scale-98 flex flex-col justify-between gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <div>
                <span className="font-bold block text-white">[Exporter Produits]</span>
                <span className="text-[10px] text-slate-400">Fichier CSV</span>
              </div>
            </button>

            <button
              onClick={handleExportQuotesCSV}
              className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left text-xs text-slate-200 transition active:scale-98 flex flex-col justify-between gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold block text-white">[Exporter Devis]</span>
                <span className="text-[10px] text-slate-400">Fichier CSV</span>
              </div>
            </button>

            <button
              onClick={handleExportJSON}
              className="p-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-cyan-500/40 text-left text-xs text-cyan-200 transition active:scale-98 flex flex-col justify-between gap-2"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <div>
                <span className="font-bold block text-white">[Sauvegarde JSON]</span>
                <span className="text-[10px] text-cyan-300">Catalogue & Devis</span>
              </div>
            </button>
          </div>
        </div>

        {/* Import Center Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-cyan-300 block">Importation des données :</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="file"
                ref={jsonFileInputRef}
                accept=".json"
                onChange={handleSelectJSONFile}
                className="hidden"
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="w-full p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition active:scale-98 min-h-[48px]"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                [Importer Sauvegarde JSON]
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Restaure références, profils, modèles, devis et clients
              </p>
            </div>

            <div>
              <input
                type="file"
                ref={csvFileInputRef}
                accept=".csv"
                onChange={handleSelectCSVFile}
                className="hidden"
              />
              <button
                onClick={() => csvFileInputRef.current?.click()}
                className="w-full p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition active:scale-98 min-h-[48px]"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                [Importer Clients CSV]
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1">Ajoute ou met à jour la liste des clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for JSON Restore */}
      {pendingBackupCounts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Aperçu de la Sauvegarde Détectée
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Références profils :</span>
                <strong className="text-white tabular-nums">{pendingBackupCounts.references}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Modèles produits :</span>
                <strong className="text-white tabular-nums">{pendingBackupCounts.products}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Clients :</span>
                <strong className="text-white tabular-nums">{pendingBackupCounts.clients}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Devis :</span>
                <strong className="text-white tabular-nums">{pendingBackupCounts.quotes}</strong>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleConfirmJSONRestore(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-semibold text-xs transition"
              >
                Fusionner (Conserver actuelles + ajouter nouvelles)
              </button>
              <button
                onClick={() => handleConfirmJSONRestore(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition"
              >
                Remplacer toutes les données existantes
              </button>
              <button
                onClick={() => {
                  setPendingBackupJSON(null);
                  setPendingBackupCounts(null);
                }}
                className="w-full py-2 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </h3>

            {catError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {catError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom de la catégorie (ex: Rail, Roulette, Joint...) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Rail supérieur"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white min-h-[40px]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unité</label>
                <select
                  value={catUnit}
                  onChange={(e) => setCatUnit(e.target.value as CategoryUnit)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white min-h-[40px]"
                >
                  <option value="barre">Barre</option>
                  <option value="piece">Pièce</option>
                  <option value="metre">Mètre</option>
                  <option value="mm">mm</option>
                  <option value="m2">m²</option>
                  <option value="lot">Lot</option>
                  <option value="forfait">Forfait</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prix par défaut (Ar)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={catPrice}
                  onChange={(e) => setCatPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono tabular-nums min-h-[40px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Glass Modal */}
      {isGlassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingGlass ? 'Modifier le vitrage' : 'Nouveau type de vitrage'}
            </h3>

            {glassError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {glassError}
              </div>
            )}

            <form onSubmit={handleSaveGlass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom du vitrage <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={glassName}
                  onChange={(e) => setGlassName(e.target.value)}
                  placeholder="Ex: Vitre claire 5 mm"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white min-h-[40px]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prix au m² (Ar)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={glassPrice}
                  onChange={(e) => setGlassPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono tabular-nums font-bold min-h-[40px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGlassModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        title="Supprimer la catégorie"
        message="Voulez-vous vraiment supprimer cet élément ?"
        itemName={categoryToDelete?.name}
        onConfirm={handleDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!glassToDelete}
        title="Supprimer le type de vitrage"
        message="Voulez-vous vraiment supprimer cet élément ?"
        itemName={glassToDelete?.name}
        onConfirm={handleDeleteGlass}
        onCancel={() => setGlassToDelete(null)}
      />
    </div>
  );
};
