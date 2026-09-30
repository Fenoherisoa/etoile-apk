import {
  Client,
  ProductTemplate,
  Category,
  ProfileReference,
  GlassType,
  Quote,
  QuoteStatus,
  PaymentRecord,
  PaymentReceipt,
  GlobalSettings,
  BackupData,
} from '../types';
import { calculateDetailedProduct } from '../utils/calculationEngine';

const STORAGE_KEYS = {
  SETTINGS: 'etoile_alu_settings_v3',
  CATEGORIES: 'etoile_alu_categories_v3',
  REFERENCES: 'etoile_alu_references_v3',
  PRODUCTS: 'etoile_alu_products_v3',
  GLASS_TYPES: 'etoile_alu_glass_types_v3',
  CLIENTS: 'etoile_alu_clients_v3',
  QUOTES: 'etoile_alu_quotes_v3',
  PAYMENTS: 'etoile_alu_payments_v3',
  RECEIPTS: 'etoile_alu_receipts_v3',
};

export const DEFAULT_SETTINGS: GlobalSettings = {
  standardBarLengthMm: 5800,
  standardBarPriceAr: 240000,
  sawKerfMm: 4,
  currency: 'Ar',
  companyName: 'ETOILE ALU',
  companySubtitle: 'Menuiserie & Miroiterie Aluminium de Précision',
  companyPhone: '+261 34 22 450 18',
  companyEmail: 'contact@etoile-alu.mg',
  companyAddress: 'Zone Industrielle Forello Tanjombato, Antananarivo, Madagascar',
  companyNIF: '4001289354',
  companySTAT: '25112 11 2024 0 03412',
  defaultQuoteTerms: 'Validité de cette offre : 30 jours à compter de la date d émission. Acompte de 50% obligatoire à la validation de la commande, solde à la livraison.',
  defaultQuoteObservations: 'Fabrication sur mesure en profilés aluminium de premier choix et vitrage conforme aux normes.',
  footerText: 'ETOILE ALU - SARL au capital de 20 000 000 Ar - NIF: 4001289354 - STAT: 25112 11 2024 0 03412',
  paymentMethods: [
    'Espèces',
    'Mobile Money (Mvola)',
    'Orange Money',
    'Airtel Money',
    'Virement bancaire (BNI / BFV)',
    'Chèque',
    'Autre',
  ],
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-batis', name: 'Batis', unit: 'barre', defaultPrice: 240000, isSystem: true },
  { id: 'cat-ouvrante', name: 'Ouvrante', unit: 'barre', defaultPrice: 240000, isSystem: true },
  { id: 'cat-milieu', name: 'Milieu', unit: 'barre', defaultPrice: 235000, isSystem: true },
  { id: 'cat-bas-de-porte', name: 'Bas de porte', unit: 'barre', defaultPrice: 260000, isSystem: true },
  { id: 'cat-parclose', name: 'Parclose', unit: 'barre', defaultPrice: 120000, isSystem: true },
  { id: 'cat-poignet', name: 'Poignet', unit: 'piece', defaultPrice: 15000, isSystem: true },
  { id: 'cat-paumelle', name: 'Paumelle', unit: 'piece', defaultPrice: 8500, isSystem: true },
  { id: 'cat-cle', name: 'Clé', unit: 'piece', defaultPrice: 25000, isSystem: true },
  { id: 'cat-verrou', name: 'Verrou', unit: 'piece', defaultPrice: 12000, isSystem: true },
  { id: 'cat-silicone', name: 'Silicone', unit: 'piece', defaultPrice: 25000, isSystem: true },
  { id: 'cat-vitre', name: 'Vitre', unit: 'm2', defaultPrice: 45000, isSystem: true },
  { id: 'cat-rail', name: 'Rail', unit: 'barre', defaultPrice: 210000, isSystem: false },
  { id: 'cat-roulette', name: 'Roulette', unit: 'piece', defaultPrice: 10000, isSystem: false },
  { id: 'cat-joint', name: 'Joint', unit: 'metre', defaultPrice: 2500, isSystem: false },
  { id: 'cat-equerre', name: 'Équerre', unit: 'piece', defaultPrice: 3500, isSystem: false },
  { id: 'cat-visserie', name: 'Visserie', unit: 'lot', defaultPrice: 5000, isSystem: false },
  { id: 'cat-bardage', name: 'Bardage', unit: 'm2', defaultPrice: 65000, isSystem: true },
  { id: 'cat-compat', name: 'Compat', unit: 'piece', defaultPrice: 18000, isSystem: true },
  { id: 'cat-accessoire', name: 'Accessoire', unit: 'lot', defaultPrice: 15000, isSystem: true },
  { id: 'cat-autre', name: 'Autre', unit: 'forfait', defaultPrice: 10000, isSystem: true },
];

export const DEFAULT_REFERENCES: ProfileReference[] = [
  {
    id: 'ref-batis-t45',
    categoryId: 'cat-batis',
    categoryName: 'Batis',
    referenceCode: 'T45',
    name: 'Batis T45',
    description: 'Profilé aluminium Batis série T45 (châssis tubulaire)',
    unitType: 'barre',
    calculationMode: 'bar',
    barLengthMm: 5800,
    unitPriceAr: 240000,
    rule: { formulaWidthMultiplier: 2, formulaHeightMultiplier: 2, customFormulaText: '2 × L + 2 × H' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ref-batis-k45',
    categoryId: 'cat-batis',
    categoryName: 'Batis',
    referenceCode: 'K45',
    name: 'Batis K45',
    description: 'Profilé Batis K45 renforcé',
    unitType: 'barre',
    calculationMode: 'bar',
    barLengthMm: 5800,
    unitPriceAr: 250000,
    rule: { formulaWidthMultiplier: 2, formulaHeightMultiplier: 2, customFormulaText: '2 × L + 2 × H' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ref-ouv-k45',
    categoryId: 'cat-ouvrante',
    categoryName: 'Ouvrante',
    referenceCode: 'K45',
    name: 'Ouvrante K45',
    description: 'Profilé Ouvrante K45 pour vantail coulissant / battant',
    unitType: 'barre',
    calculationMode: 'bar',
    barLengthMm: 5800,
    unitPriceAr: 245000,
    rule: { formulaWidthMultiplier: 2, formulaHeightMultiplier: 2, customFormulaText: '2 × L + 2 × H' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ref-milieu-b45',
    categoryId: 'cat-milieu',
    categoryName: 'Milieu',
    referenceCode: 'B45',
    name: 'Milieu B45',
    description: 'Profilé de jonction milieu / montant central',
    unitType: 'barre',
    calculationMode: 'bar',
    barLengthMm: 5800,
    unitPriceAr: 235000,
    rule: { formulaWidthMultiplier: 1, formulaHeightMultiplier: 0, customFormulaText: '1 × L' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ref-pc-01',
    categoryId: 'cat-parclose',
    categoryName: 'Parclose',
    referenceCode: 'PC01',
    name: 'Parclose droite PC01',
    description: 'Parclose clipser pour vitrage 4mm à 6mm',
    unitType: 'barre',
    calculationMode: 'bar',
    barLengthMm: 5800,
    unitPriceAr: 120000,
    rule: { formulaWidthMultiplier: 2, formulaHeightMultiplier: 2, customFormulaText: '2 × L + 2 × H' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ref-p-01',
    categoryId: 'cat-poignet',
    categoryName: 'Poignet',
    referenceCode: 'P01',
    name: 'Poignée cuvette coulissante P01',
    description: 'Poignée encastrée pour fenêtre coulissante',
    unitType: 'piece',
    calculationMode: 'piece',
    unitPriceAr: 15000,
    rule: { formulaWidthMultiplier: 0, formulaHeightMultiplier: 0, fixedQuantity: 1 },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ref-pa-01',
    categoryId: 'cat-paumelle',
    categoryName: 'Paumelle',
    referenceCode: 'PA01',
    name: 'Paumelle aluminium PA01',
    description: 'Paumelle standard à visser',
    unitType: 'piece',
    calculationMode: 'piece',
    unitPriceAr: 8500,
    rule: { formulaWidthMultiplier: 0, formulaHeightMultiplier: 0, fixedQuantity: 3 },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ref-s-01',
    categoryId: 'cat-silicone',
    categoryName: 'Silicone',
    referenceCode: 'S01',
    name: 'Silicone neutre S01',
    description: 'Mastic silicone cartouche 310ml',
    unitType: 'piece',
    calculationMode: 'piece',
    unitPriceAr: 25000,
    rule: { formulaWidthMultiplier: 0, formulaHeightMultiplier: 0, fixedQuantity: 1 },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const DEFAULT_GLASS_TYPES: GlassType[] = [
  { id: 'glass-1', name: 'Vitre claire 4 mm', pricePerM2: 35000, unit: 'm²' },
  { id: 'glass-2', name: 'Vitre claire 5 mm', pricePerM2: 45000, unit: 'm²' },
  { id: 'glass-3', name: 'Vitre claire 6 mm', pricePerM2: 58000, unit: 'm²' },
  { id: 'glass-4', name: 'Vitre fumée 5 mm', pricePerM2: 55000, unit: 'm²' },
  { id: 'glass-5', name: 'Vitre teintée 5 mm', pricePerM2: 60000, unit: 'm²' },
  { id: 'glass-6', name: 'Vitre opaque 4 mm', pricePerM2: 42000, unit: 'm²' },
];

export const DEFAULT_PRODUCTS: ProductTemplate[] = [
  {
    id: 'PROD-00001',
    name: 'Fenêtre Aluminium T45 (Coulissante)',
    description: 'Assemblage T45: Batis T45 + Ouvrante K45 + Milieu B45 + Parclose PC01 + Poignet P01 + Silicone S01',
    components: [
      {
        categoryId: 'cat-batis',
        categoryName: 'Batis',
        enabled: true,
        referenceId: 'ref-batis-t45',
        referenceCode: 'T45',
        referenceName: 'Batis T45',
        unitType: 'barre',
        unitPriceAr: 240000,
        calculationMode: 'bar',
        rule: { formulaWidthMultiplier: 2, formulaHeightMultiplier: 2, customFormulaText: '2 × L + 2 × H' },
      },
      {
        categoryId: 'cat-ouvrante',
        categoryName: 'Ouvrante',
        enabled: true,
        referenceId: 'ref-ouv-k45',
        referenceCode: 'K45',
        referenceName: 'Ouvrante K45',
        unitType: 'barre',
        unitPriceAr: 245000,
        calculationMode: 'bar',
        rule: { formulaWidthMultiplier: 2, formulaHeightMultiplier: 2, customFormulaText: '2 × L + 2 × H' },
      },
      {
        categoryId: 'cat-milieu',
        categoryName: 'Milieu',
        enabled: true,
        referenceId: 'ref-milieu-b45',
        referenceCode: 'B45',
        referenceName: 'Milieu B45',
        unitType: 'barre',
        unitPriceAr: 235000,
        calculationMode: 'bar',
        rule: { formulaWidthMultiplier: 1, formulaHeightMultiplier: 0, customFormulaText: '1 × L' },
      },
      {
        categoryId: 'cat-parclose',
        categoryName: 'Parclose',
        enabled: true,
        referenceId: 'ref-pc-01',
        referenceCode: 'PC01',
        referenceName: 'Parclose droite PC01',
        unitType: 'barre',
        unitPriceAr: 120000,
        calculationMode: 'bar',
        rule: { formulaWidthMultiplier: 2, formulaHeightMultiplier: 2, customFormulaText: '2 × L + 2 × H' },
      },
      {
        categoryId: 'cat-poignet',
        categoryName: 'Poignet',
        enabled: true,
        referenceId: 'ref-p-01',
        referenceCode: 'P01',
        referenceName: 'Poignée cuvette P01',
        unitType: 'piece',
        unitPriceAr: 15000,
        calculationMode: 'piece',
        rule: { formulaWidthMultiplier: 0, formulaHeightMultiplier: 0, fixedQuantity: 1 },
      },
      {
        categoryId: 'cat-silicone',
        categoryName: 'Silicone',
        enabled: true,
        referenceId: 'ref-s-01',
        referenceCode: 'S01',
        referenceName: 'Silicone neutre S01',
        unitType: 'piece',
        unitPriceAr: 25000,
        calculationMode: 'piece',
        rule: { formulaWidthMultiplier: 0, formulaHeightMultiplier: 0, fixedQuantity: 1 },
      },
    ],
    defaultGlassTypeId: 'glass-2',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
];

export const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'CLI-2026-00001',
    name: 'Client A',
    phone: '+261 34 11 222 33',
    address: 'Ivandry, Antananarivo',
    notes: 'Chantier Villa R+1 - Devis fenêtres T45',
    createdAt: '2026-09-20T08:30:00Z',
    updatedAt: '2026-09-20T08:30:00Z',
  },
  {
    id: 'CLI-2026-00002',
    name: 'Mme Razafy',
    phone: '+261 32 44 555 66',
    address: 'Ambohibao, Antananarivo',
    notes: 'Rénovation baies vitrées salon',
    createdAt: '2026-09-25T14:15:00Z',
    updatedAt: '2026-09-25T14:15:00Z',
  },
];

function seedDefaultData(): { quotes: Quote[]; payments: PaymentRecord[]; receipts: PaymentReceipt[] } {
  const prodFenetre = DEFAULT_PRODUCTS[0];

  const calcFenetre = calculateDetailedProduct(
    [
      { id: 'd1', widthMm: 1200, heightMm: 1500, quantity: 2, label: 'Salon' },
    ],
    prodFenetre.components,
    DEFAULT_GLASS_TYPES[1],
    DEFAULT_SETTINGS
  );

  const subtotalGross = calcFenetre.totalProductPriceAr;
  const transport = 50000;
  const discount = 0;
  const grandTotal = subtotalGross + transport - discount;

  const quoteId = 'DEV-2026-00001';
  const paymentId = 'PAY-2026-00001';
  const receiptId = 'REC-2026-00001';
  const acompteAr = 500000;

  const quote: Quote = {
    id: quoteId,
    version: 1,
    clientId: 'CLI-2026-00001',
    clientName: 'Client A',
    clientPhone: '+261 34 11 222 33',
    clientAddress: 'Ivandry, Antananarivo',
    date: '2026-09-28',
    status: 'partiellement_paye',
    isValidated: true,
    validatedAt: '2026-09-28T09:00:00Z',
    items: [
      {
        id: 'item-1',
        productId: prodFenetre.id,
        productName: prodFenetre.name,
        dimensions: [
          { id: 'd1', widthMm: 1200, heightMm: 1500, quantity: 2, label: 'Salon' },
        ],
        selectedGlassTypeId: 'glass-2',
        componentsConfig: prodFenetre.components,
        calculationResult: calcFenetre,
      },
    ],
    transportFeeAr: transport,
    discountAr: discount,
    subtotalBarsAr: calcFenetre.totalBarsCostAr,
    subtotalGlassAr: calcFenetre.glassCostAr,
    subtotalAccessoriesAr: calcFenetre.totalAccessoriesCostAr,
    subtotalGrossAr: subtotalGross,
    grandTotalAr: grandTotal,
    paidAmountAr: acompteAr,
    balanceRemainingAr: grandTotal - acompteAr,
    notes: 'Devis validé. Acompte de 500 000 Ar reçu en Espèces.',
    observations: DEFAULT_SETTINGS.defaultQuoteObservations,
    terms: DEFAULT_SETTINGS.defaultQuoteTerms,
    createdAt: '2026-09-28T08:00:00Z',
    updatedAt: '2026-09-28T09:30:00Z',
  };

  const payment: PaymentRecord = {
    id: paymentId,
    receiptId: receiptId,
    quoteId: quoteId,
    clientId: quote.clientId,
    clientName: quote.clientName,
    amountAr: acompteAr,
    date: '2026-09-28',
    paymentMethod: 'Espèces',
    referenceNumber: 'ENC-01',
    notes: 'Acompte 50% à la validation de la commande',
    createdAt: '2026-09-28T09:30:00Z',
  };

  const receipt: PaymentReceipt = {
    id: receiptId,
    paymentId: paymentId,
    quoteId: quoteId,
    clientId: quote.clientId,
    clientName: quote.clientName,
    clientPhone: quote.clientPhone,
    clientAddress: quote.clientAddress,
    quoteTotalAr: grandTotal,
    paidAmountAr: acompteAr,
    totalPaidToDateAr: acompteAr,
    balanceRemainingAr: grandTotal - acompteAr,
    paymentMethod: 'Espèces',
    date: '2026-09-28',
    notes: 'Acompte reçu avec remerciements',
    createdAt: '2026-09-28T09:30:00Z',
  };

  return {
    quotes: [quote],
    payments: [payment],
    receipts: [receipt],
  };
}

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
    }
  }

  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REFERENCES)) {
      this.setItem(STORAGE_KEYS.REFERENCES, DEFAULT_REFERENCES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GLASS_TYPES)) {
      this.setItem(STORAGE_KEYS.GLASS_TYPES, DEFAULT_GLASS_TYPES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.setItem(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      this.setItem(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) {
      const seed = seedDefaultData();
      this.setItem(STORAGE_KEYS.QUOTES, seed.quotes);
      this.setItem(STORAGE_KEYS.PAYMENTS, seed.payments);
      this.setItem(STORAGE_KEYS.RECEIPTS, seed.receipts);
    }
  }

  // Settings
  public getSettings(): GlobalSettings {
    return this.getItem<GlobalSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: GlobalSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Categories
  public getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  public saveCategory(category: Category): Category {
    const list = this.getCategories();
    const idx = list.findIndex((c) => c.id === category.id);
    if (idx >= 0) list[idx] = category;
    else list.push(category);
    this.setItem(STORAGE_KEYS.CATEGORIES, list);
    return category;
  }

  public deleteCategory(categoryId: string): void {
    const list = this.getCategories().filter((c) => c.id !== categoryId);
    this.setItem(STORAGE_KEYS.CATEGORIES, list);
  }

  // Profile References
  public getReferences(): ProfileReference[] {
    return this.getItem<ProfileReference[]>(STORAGE_KEYS.REFERENCES, DEFAULT_REFERENCES);
  }

  public saveReference(ref: ProfileReference): ProfileReference {
    const list = this.getReferences();
    const idx = list.findIndex((r) => r.id === ref.id);
    if (idx >= 0) {
      list[idx] = { ...ref, updatedAt: new Date().toISOString() };
    } else {
      list.push({
        ...ref,
        id: ref.id || `ref-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.setItem(STORAGE_KEYS.REFERENCES, list);
    return ref;
  }

  public deleteReference(referenceId: string): void {
    const list = this.getReferences().filter((r) => r.id !== referenceId);
    this.setItem(STORAGE_KEYS.REFERENCES, list);
  }

  public duplicateReference(referenceId: string): ProfileReference | null {
    const original = this.getReferences().find((r) => r.id === referenceId);
    if (!original) return null;

    const copy: ProfileReference = {
      ...JSON.parse(JSON.stringify(original)),
      id: `ref-${Date.now()}`,
      referenceCode: `${original.referenceCode}-COPIE`,
      name: `${original.name} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveReference(copy);
    return copy;
  }

  // Products
  public getProducts(): ProductTemplate[] {
    return this.getItem<ProductTemplate[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }

  public saveProduct(product: ProductTemplate): ProductTemplate {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);

    if (idx >= 0) {
      products[idx] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      products.push({
        ...product,
        id: product.id || this.generateProductId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  public deleteProduct(productId: string): void {
    const products = this.getProducts().filter((p) => p.id !== productId);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  public duplicateProduct(productId: string): ProductTemplate | null {
    const original = this.getProducts().find((p) => p.id === productId);
    if (!original) return null;

    const copy: ProductTemplate = {
      ...JSON.parse(JSON.stringify(original)),
      id: this.generateProductId(),
      name: `${original.name} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveProduct(copy);
    return copy;
  }

  public generateProductId(): string {
    const products = this.getProducts();
    const maxNum = products.reduce((max, p) => {
      const match = p.id.match(/PROD-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `PROD-${(maxNum + 1).toString().padStart(5, '0')}`;
  }

  // Glass Types
  public getGlassTypes(): GlassType[] {
    return this.getItem<GlassType[]>(STORAGE_KEYS.GLASS_TYPES, DEFAULT_GLASS_TYPES);
  }

  public saveGlassType(glass: GlassType): GlassType {
    const list = this.getGlassTypes();
    const idx = list.findIndex((g) => g.id === glass.id);
    if (idx >= 0) list[idx] = glass;
    else list.push(glass);
    this.setItem(STORAGE_KEYS.GLASS_TYPES, list);
    return glass;
  }

  public deleteGlassType(glassId: string): void {
    const list = this.getGlassTypes().filter((g) => g.id !== glassId);
    this.setItem(STORAGE_KEYS.GLASS_TYPES, list);
  }

  // Clients
  public getClients(): Client[] {
    return this.getItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  }

  public saveClient(client: Client): Client {
    const clients = this.getClients();
    const idx = clients.findIndex((c) => c.id === client.id);

    if (idx >= 0) {
      clients[idx] = { ...client, updatedAt: new Date().toISOString() };
    } else {
      clients.unshift({
        ...client,
        id: client.id || this.generateClientId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    this.setItem(STORAGE_KEYS.CLIENTS, clients);
    return client;
  }

  public deleteClient(clientId: string): void {
    const clients = this.getClients().filter((c) => c.id !== clientId);
    this.setItem(STORAGE_KEYS.CLIENTS, clients);
  }

  public generateClientId(): string {
    const year = new Date().getFullYear();
    const clients = this.getClients();
    const maxNum = clients.reduce((max, c) => {
      const match = c.id.match(/CLI-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `CLI-${year}-${(maxNum + 1).toString().padStart(5, '0')}`;
  }

  // Quotes Management (Section 34, 35, 36)
  public getQuotes(): Quote[] {
    return this.getItem<Quote[]>(STORAGE_KEYS.QUOTES, []);
  }

  public getQuoteById(quoteId: string): Quote | undefined {
    return this.getQuotes().find((q) => q.id === quoteId);
  }

  public saveQuote(quote: Quote): Quote {
    const quotes = this.getQuotes();
    const idx = quotes.findIndex((q) => q.id === quote.id);

    // Compute payments
    const payments = this.getPaymentsByQuote(quote.id);
    const paidAmount = payments.reduce((sum, p) => sum + p.amountAr, 0);
    const balanceRemaining = Math.max(0, quote.grandTotalAr - paidAmount);

    let status = quote.status;
    if (paidAmount >= quote.grandTotalAr && quote.grandTotalAr > 0) {
      status = 'paye';
    } else if (paidAmount > 0) {
      status = 'partiellement_paye';
    }

    const updatedQuote: Quote = {
      ...quote,
      paidAmountAr: paidAmount,
      balanceRemainingAr: balanceRemaining,
      status: status,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      quotes[idx] = updatedQuote;
    } else {
      quotes.unshift({
        ...updatedQuote,
        id: quote.id || this.generateQuoteId(),
        createdAt: new Date().toISOString(),
      });
    }

    this.setItem(STORAGE_KEYS.QUOTES, quotes);
    return updatedQuote;
  }

  public deleteQuote(quoteId: string): void {
    const quotes = this.getQuotes().filter((q) => q.id !== quoteId);
    this.setItem(STORAGE_KEYS.QUOTES, quotes);
  }

  public generateQuoteId(): string {
    const year = new Date().getFullYear();
    const quotes = this.getQuotes();
    const maxNum = quotes.reduce((max, q) => {
      const match = q.id.match(/DEV-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `DEV-${year}-${(maxNum + 1).toString().padStart(5, '0')}`;
  }

  // Section 35: In-app quote validation
  public validateQuote(quoteId: string): Quote | null {
    const quotes = this.getQuotes();
    const idx = quotes.findIndex((q) => q.id === quoteId);
    if (idx === -1) return null;

    const q = quotes[idx];
    q.isValidated = true;
    q.validatedAt = new Date().toISOString();
    q.status = 'valide';
    q.updatedAt = new Date().toISOString();

    quotes[idx] = q;
    this.setItem(STORAGE_KEYS.QUOTES, quotes);
    return q;
  }

  // Section 36: Create new version DEV-2026-00001-V2
  public createNewQuoteVersion(quoteId: string): Quote | null {
    const original = this.getQuoteById(quoteId);
    if (!original) return null;

    const baseId = original.baseQuoteId || original.id.replace(/-V\d+$/, '');
    const quotes = this.getQuotes();
    const existingVersions = quotes.filter(
      (q) => q.id.startsWith(baseId) || q.baseQuoteId === baseId
    );
    const nextVersion = existingVersions.length + 1;
    const newVersionId = `${baseId}-V${nextVersion}`;

    const newQuote: Quote = {
      ...JSON.parse(JSON.stringify(original)),
      id: newVersionId,
      version: nextVersion,
      baseQuoteId: baseId,
      isValidated: false,
      validatedAt: undefined,
      status: 'brouillon',
      paidAmountAr: 0,
      balanceRemainingAr: original.grandTotalAr,
      notes: `Nouvelle version créée depuis ${original.id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotes.unshift(newQuote);
    this.setItem(STORAGE_KEYS.QUOTES, quotes);
    return newQuote;
  }

  // Payments & Receipts (Section 38, 39, 40)
  public getPayments(): PaymentRecord[] {
    return this.getItem<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  public getPaymentsByQuote(quoteId: string): PaymentRecord[] {
    return this.getPayments().filter((p) => p.quoteId === quoteId);
  }

  public getReceipts(): PaymentReceipt[] {
    return this.getItem<PaymentReceipt[]>(STORAGE_KEYS.RECEIPTS, []);
  }

  public generateReceiptId(): string {
    const year = new Date().getFullYear();
    const receipts = this.getReceipts();
    const maxNum = receipts.reduce((max, r) => {
      const match = r.id.match(/REC-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `REC-${year}-${(maxNum + 1).toString().padStart(5, '0')}`;
  }

  public generatePaymentId(): string {
    const year = new Date().getFullYear();
    const payments = this.getPayments();
    const maxNum = payments.reduce((max, p) => {
      const match = p.id.match(/PAY-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `PAY-${year}-${(maxNum + 1).toString().padStart(5, '0')}`;
  }

  // Record a payment and automatically issue a receipt
  public recordPayment(
    quoteId: string,
    amountAr: number,
    paymentMethod: string,
    notes?: string,
    referenceNumber?: string
  ): { payment: PaymentRecord; receipt: PaymentReceipt; updatedQuote: Quote } | null {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return null;

    const paymentId = this.generatePaymentId();
    const receiptId = this.generateReceiptId();
    const dateNow = new Date().toISOString().split('T')[0];

    const existingPayments = this.getPaymentsByQuote(quoteId);
    const prevPaid = existingPayments.reduce((sum, p) => sum + p.amountAr, 0);
    const newTotalPaid = prevPaid + amountAr;
    const balanceRemaining = Math.max(0, quote.grandTotalAr - newTotalPaid);

    const payment: PaymentRecord = {
      id: paymentId,
      receiptId: receiptId,
      quoteId: quoteId,
      clientId: quote.clientId,
      clientName: quote.clientName,
      amountAr: amountAr,
      date: dateNow,
      paymentMethod,
      referenceNumber,
      notes,
      createdAt: new Date().toISOString(),
    };

    const receipt: PaymentReceipt = {
      id: receiptId,
      paymentId: paymentId,
      quoteId: quoteId,
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      clientAddress: quote.clientAddress,
      quoteTotalAr: quote.grandTotalAr,
      paidAmountAr: amountAr,
      totalPaidToDateAr: newTotalPaid,
      balanceRemainingAr: balanceRemaining,
      paymentMethod,
      date: dateNow,
      notes,
      createdAt: new Date().toISOString(),
    };

    // Save payment & receipt
    const allPayments = this.getPayments();
    allPayments.unshift(payment);
    this.setItem(STORAGE_KEYS.PAYMENTS, allPayments);

    const allReceipts = this.getReceipts();
    allReceipts.unshift(receipt);
    this.setItem(STORAGE_KEYS.RECEIPTS, allReceipts);

    // Update Quote paid amount & status
    quote.paidAmountAr = newTotalPaid;
    quote.balanceRemainingAr = balanceRemaining;
    if (balanceRemaining <= 0 && quote.grandTotalAr > 0) {
      quote.status = 'paye';
    } else {
      quote.status = 'partiellement_paye';
    }
    quote.updatedAt = new Date().toISOString();

    const allQuotes = this.getQuotes();
    const qIdx = allQuotes.findIndex((q) => q.id === quoteId);
    if (qIdx >= 0) allQuotes[qIdx] = quote;
    this.setItem(STORAGE_KEYS.QUOTES, allQuotes);

    return { payment, receipt, updatedQuote: quote };
  }

  // Backup & Restore
  public createBackupJSON(): string {
    const backup: BackupData & { references: ProfileReference[] } = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      profileReferences: this.getReferences(),
      references: this.getReferences(),
      products: this.getProducts(),
      glassTypes: this.getGlassTypes(),
      clients: this.getClients(),
      quotes: this.getQuotes(),
      payments: this.getPayments(),
      receipts: this.getReceipts(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public restoreBackupJSON(
    jsonData: string,
    overwrite: boolean = false
  ): {
    success: boolean;
    message: string;
    counts: {
      clients: number;
      products: number;
      quotes: number;
      payments: number;
      receipts: number;
      references: number;
    };
  } {
    try {
      const data = JSON.parse(jsonData) as any;
      if (!data || typeof data !== 'object') {
        return {
          success: false,
          message: 'Format de fichier JSON invalide.',
          counts: { clients: 0, products: 0, quotes: 0, payments: 0, receipts: 0, references: 0 },
        };
      }

      const refsToRestore: ProfileReference[] = Array.isArray(data.profileReferences)
        ? data.profileReferences
        : Array.isArray(data.references)
        ? data.references
        : [];

      const clientsToRestore: Client[] = Array.isArray(data.clients) ? data.clients : [];
      const productsToRestore: ProductTemplate[] = Array.isArray(data.products) ? data.products : [];
      const quotesToRestore: Quote[] = Array.isArray(data.quotes) ? data.quotes : [];
      const paymentsToRestore: PaymentRecord[] = Array.isArray(data.payments) ? data.payments : [];
      const receiptsToRestore: PaymentReceipt[] = Array.isArray(data.receipts) ? data.receipts : [];
      const categoriesToRestore: Category[] = Array.isArray(data.categories) ? data.categories : [];
      const glassTypesToRestore: GlassType[] = Array.isArray(data.glassTypes) ? data.glassTypes : [];

      const totalItemsFound =
        refsToRestore.length +
        clientsToRestore.length +
        productsToRestore.length +
        quotesToRestore.length +
        categoriesToRestore.length;

      if (totalItemsFound === 0 && !data.settings) {
        return {
          success: false,
          message: 'Le fichier sélectionné ne contient aucune donnée compatible avec ETOILE ALU.',
          counts: { clients: 0, products: 0, quotes: 0, payments: 0, receipts: 0, references: 0 },
        };
      }

      if (overwrite) {
        if (data.settings && typeof data.settings === 'object') {
          this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
        if (categoriesToRestore.length > 0) this.setItem(STORAGE_KEYS.CATEGORIES, categoriesToRestore);
        if (refsToRestore.length > 0) this.setItem(STORAGE_KEYS.REFERENCES, refsToRestore);
        if (glassTypesToRestore.length > 0) this.setItem(STORAGE_KEYS.GLASS_TYPES, glassTypesToRestore);
        if (productsToRestore.length > 0) this.setItem(STORAGE_KEYS.PRODUCTS, productsToRestore);
        if (clientsToRestore.length > 0) this.setItem(STORAGE_KEYS.CLIENTS, clientsToRestore);
        this.setItem(STORAGE_KEYS.QUOTES, quotesToRestore);
        this.setItem(STORAGE_KEYS.PAYMENTS, paymentsToRestore);
        this.setItem(STORAGE_KEYS.RECEIPTS, receiptsToRestore);
      } else {
        if (data.settings && typeof data.settings === 'object') {
          this.saveSettings({ ...this.getSettings(), ...data.settings });
        }

        if (categoriesToRestore.length > 0) {
          const existingCats = this.getCategories();
          const catIds = new Set(existingCats.map((c) => c.id));
          this.setItem(STORAGE_KEYS.CATEGORIES, [...existingCats, ...categoriesToRestore.filter((c) => !catIds.has(c.id))]);
        }

        if (refsToRestore.length > 0) {
          const existingRefs = this.getReferences();
          const refIds = new Set(existingRefs.map((r) => r.id));
          this.setItem(STORAGE_KEYS.REFERENCES, [...existingRefs, ...refsToRestore.filter((r) => !refIds.has(r.id))]);
        }

        if (glassTypesToRestore.length > 0) {
          const existingGlass = this.getGlassTypes();
          const glassIds = new Set(existingGlass.map((g) => g.id));
          this.setItem(STORAGE_KEYS.GLASS_TYPES, [...existingGlass, ...glassTypesToRestore.filter((g) => !glassIds.has(g.id))]);
        }

        if (clientsToRestore.length > 0) {
          const existingClients = this.getClients();
          const clientIds = new Set(existingClients.map((c) => c.id));
          this.setItem(STORAGE_KEYS.CLIENTS, [...existingClients, ...clientsToRestore.filter((c) => !clientIds.has(c.id))]);
        }

        if (productsToRestore.length > 0) {
          const existingProducts = this.getProducts();
          const productIds = new Set(existingProducts.map((p) => p.id));
          this.setItem(STORAGE_KEYS.PRODUCTS, [...existingProducts, ...productsToRestore.filter((p) => !productIds.has(p.id))]);
        }

        if (quotesToRestore.length > 0) {
          const existingQuotes = this.getQuotes();
          const quoteIds = new Set(existingQuotes.map((q) => q.id));
          this.setItem(STORAGE_KEYS.QUOTES, [...existingQuotes, ...quotesToRestore.filter((q) => !quoteIds.has(q.id))]);
        }

        if (paymentsToRestore.length > 0) {
          const existingPayments = this.getPayments();
          const payIds = new Set(existingPayments.map((p) => p.id));
          this.setItem(STORAGE_KEYS.PAYMENTS, [...existingPayments, ...paymentsToRestore.filter((p) => !payIds.has(p.id))]);
        }

        if (receiptsToRestore.length > 0) {
          const existingReceipts = this.getReceipts();
          const recIds = new Set(existingReceipts.map((r) => r.id));
          this.setItem(STORAGE_KEYS.RECEIPTS, [...existingReceipts, ...receiptsToRestore.filter((r) => !recIds.has(r.id))]);
        }
      }

      return {
        success: true,
        message: 'Données ETOILE ALU importées et restaurées avec succès !',
        counts: {
          clients: clientsToRestore.length,
          products: productsToRestore.length,
          quotes: quotesToRestore.length,
          payments: paymentsToRestore.length,
          receipts: receiptsToRestore.length,
          references: refsToRestore.length,
        },
      };
    } catch (e: unknown) {
      return {
        success: false,
        message: `Erreur d'importation : ${(e as Error).message}`,
        counts: { clients: 0, products: 0, quotes: 0, payments: 0, receipts: 0, references: 0 },
      };
    }
  }

  // CSV Exporters
  public exportClientsCSV(): string {
    const clients = this.getClients();
    const headers = ['ID', 'Nom', 'Téléphone', 'Adresse', 'Note', 'Date_Création'];
    const rows = clients.map((c) => [
      `"${c.id}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      `"${c.createdAt || ''}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportProductsCSV(): string {
    const products = this.getProducts();
    const headers = ['ID', 'Nom', 'Description', 'Composants_Assembles'];
    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${p.components.filter((c) => c.enabled).map((c) => `${c.categoryName}:${c.referenceCode}`).join(';')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportQuotesCSV(): string {
    const quotes = this.getQuotes();
    const headers = ['ID', 'Client_ID', 'Client_Nom', 'Date', 'Statut', 'Sous_Total', 'Remise', 'Transport', 'Total_Général', 'Payé', 'Reste_A_Payer'];
    const rows = quotes.map((q) => [
      `"${q.id}"`,
      `"${q.clientId}"`,
      `"${(q.clientName || '').replace(/"/g, '""')}"`,
      `"${q.date}"`,
      `"${q.status}"`,
      q.subtotalGrossAr,
      q.discountAr,
      q.transportFeeAr,
      q.grandTotalAr,
      q.paidAmountAr,
      q.balanceRemainingAr,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportPaymentsCSV(): string {
    const payments = this.getPayments();
    const headers = ['ID_Paiement', 'ID_Reçu', 'ID_Devis', 'Client', 'Montant_Ar', 'Date', 'Mode_Paiement', 'Référence'];
    const rows = payments.map((p) => [
      `"${p.id}"`,
      `"${p.receiptId}"`,
      `"${p.quoteId}"`,
      `"${(p.clientName || '').replace(/"/g, '""')}"`,
      p.amountAr,
      `"${p.date}"`,
      `"${p.paymentMethod}"`,
      `"${p.referenceNumber || ''}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public importClientsCSV(csvText: string): { importedCount: number; errors: string[] } {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return { importedCount: 0, errors: ['Le fichier CSV est vide ou sans entête.'] };

    const errors: string[] = [];
    let count = 0;
    const existingClients = this.getClients();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
      if (!cols || cols.length < 2) {
        errors.push(`Ligne ${i + 1} ignorée`);
        continue;
      }

      const clean = (val: string) => val.replace(/^,/, '').replace(/^"/, '').replace(/"$/, '').replace(/""/g, '"').trim();
      const id = clean(cols[0]) || this.generateClientId();
      const name = clean(cols[1]);
      const phone = cols[2] ? clean(cols[2]) : '';
      const address = cols[3] ? clean(cols[3]) : '';
      const notes = cols[4] ? clean(cols[4]) : '';

      if (!name) continue;

      const idx = existingClients.findIndex((c) => c.id === id || c.name.toLowerCase() === name.toLowerCase());
      if (idx >= 0) {
        existingClients[idx] = { ...existingClients[idx], phone, address, notes, updatedAt: new Date().toISOString() };
      } else {
        existingClients.push({ id, name, phone, address, notes, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      count++;
    }

    this.setItem(STORAGE_KEYS.CLIENTS, existingClients);
    return { importedCount: count, errors };
  }
}

export const storageService = new StorageService();
storageService.init();
