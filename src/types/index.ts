export type CategoryUnit =
  | 'barre'
  | 'piece'
  | 'metre'
  | 'mm'
  | 'm2'
  | 'kg'
  | 'lot'
  | 'forfait';

export type CalculationMode =
  | 'bar'              // 1D cutting stock optimization in bars
  | 'piece'            // Multiplied by fixed or dimension count
  | 'linear_meter'     // Total perimeter or linear length in meters
  | 'surface_m2'       // Total area W x H in m²
  | 'fixed_qty'        // Constant quantity per product item
  | 'custom_formula';  // Custom formula expression

export type QuoteStatus =
  | 'brouillon'
  | 'devis'
  | 'valide'
  | 'accepte'
  | 'partiellement_paye'
  | 'paye'
  | 'termine';

export interface Category {
  id: string;
  name: string;
  unit: CategoryUnit;
  defaultPrice: number;
  description?: string;
  isSystem?: boolean;
}

export interface ConsumptionRule {
  formulaWidthMultiplier: number;
  formulaHeightMultiplier: number;
  extraFixedLengthMm?: number;
  fixedQuantity?: number;
  customFormulaText?: string;
}

export interface ProfileReference {
  id: string;
  categoryId: string;
  categoryName: string;
  referenceCode: string;
  name: string;
  description: string;
  unitType: CategoryUnit;
  calculationMode: CalculationMode;
  barLengthMm?: number;
  unitPriceAr?: number;
  rule: ConsumptionRule;
  createdAt: string;
  updatedAt: string;
}

export interface ProductComponentConfig {
  categoryId: string;
  categoryName: string;
  enabled: boolean;
  referenceId: string;
  referenceCode: string;
  referenceName: string;
  unitType: CategoryUnit;
  unitPriceAr: number;
  calculationMode: CalculationMode;
  rule: ConsumptionRule;
}

export interface GlassType {
  id: string;
  name: string;
  pricePerM2: number;
  unit: string;
  description?: string;
}

export interface ProductTemplate {
  id: string; // PROD-00001
  name: string;
  description: string;
  components: ProductComponentConfig[];
  defaultGlassTypeId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string; // CLI-2026-00001
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteDimension {
  id: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  label?: string;
}

export interface CutPiece {
  profileReferenceId: string;
  profileCode: string;
  profileName: string;
  categoryName: string;
  label: string;
  lengthMm: number;
  sourceDimension: string;
}

export interface BarCutPlan {
  barNumber: number;
  cuts: CutPiece[];
  usedLengthMm: number;
  remainingWasteMm: number;
  wastePercentage: number;
}

export interface ProfileBarCalculation {
  profileReferenceId: string;
  profileCode: string;
  profileName: string;
  categoryName: string;
  barLengthMm: number;
  barPriceAr: number;
  cuts: CutPiece[];
  totalPieces: number;
  totalLinearMm: number;
  barsNeeded: number;
  barsCostAr: number;
  cuttingPlans: BarCutPlan[];
}

export interface AccessoryCalculationItem {
  referenceId: string;
  referenceCode: string;
  categoryName: string;
  name: string;
  unit: CategoryUnit;
  unitPriceAr: number;
  quantity: number;
  totalAr: number;
  notes?: string;
}

export interface ProductCalculationResult {
  profileCalculations: ProfileBarCalculation[];
  totalBarsNeeded: number;
  totalBarsCostAr: number;
  accessoriesCalculations: AccessoryCalculationItem[];
  totalAccessoriesCostAr: number;
  totalGlassAreaM2: number;
  glassCostAr: number;
  selectedGlassName?: string;
  totalProductPriceAr: number;
}

export interface QuoteProductItem {
  id: string;
  productId: string;
  productName: string;
  dimensions: QuoteDimension[];
  selectedGlassTypeId?: string;
  componentsConfig: ProductComponentConfig[];
  calculationResult: ProductCalculationResult;
  notes?: string;
}

export interface PaymentRecord {
  id: string; // PAY-2026-00001
  receiptId: string; // REC-2026-00001
  quoteId: string; // DEV-2026-00001
  clientId: string;
  clientName: string;
  amountAr: number;
  date: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string; // REC-2026-00001
  paymentId: string;
  quoteId: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  quoteTotalAr: number;
  paidAmountAr: number;
  totalPaidToDateAr: number;
  balanceRemainingAr: number;
  paymentMethod: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Quote {
  id: string; // DEV-2026-00001 or DEV-2026-00001-V2
  version: number;
  baseQuoteId?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  date: string;
  status: QuoteStatus;
  isValidated: boolean;
  validatedAt?: string;
  items: QuoteProductItem[];
  transportFeeAr: number;
  discountAr: number;
  subtotalBarsAr: number;
  subtotalGlassAr: number;
  subtotalAccessoriesAr: number;
  subtotalGrossAr: number; // before discount
  grandTotalAr: number;    // after discount
  paidAmountAr: number;
  balanceRemainingAr: number;
  notes?: string;
  observations?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalSettings {
  standardBarLengthMm: number;
  standardBarPriceAr: number;
  sawKerfMm: number;
  currency: string;
  companyName: string;
  companySubtitle: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  companyNIF: string;
  companySTAT: string;
  defaultQuoteTerms: string;
  defaultQuoteObservations: string;
  footerText: string;
  paymentMethods: string[];
}

export interface BackupData {
  version: string;
  exportDate: string;
  settings: GlobalSettings;
  categories: Category[];
  profileReferences: ProfileReference[];
  products: ProductTemplate[];
  glassTypes: GlassType[];
  clients: Client[];
  quotes: Quote[];
  payments: PaymentRecord[];
  receipts: PaymentReceipt[];
}
