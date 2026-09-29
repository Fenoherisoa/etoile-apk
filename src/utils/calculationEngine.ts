import {
  QuoteDimension,
  ProductComponentConfig,
  ProductCalculationResult,
  ProfileBarCalculation,
  AccessoryCalculationItem,
  CutPiece,
  BarCutPlan,
  GlassType,
  GlobalSettings,
} from '../types';

/**
 * 1D Bin Packing (First Fit Decreasing with saw kerf allowance)
 * Packs linear cut pieces into standard bars to minimize total bars needed.
 */
export function optimizeBarCutting(
  cuts: CutPiece[],
  barLengthMm: number,
  sawKerfMm: number = 4
): BarCutPlan[] {
  if (cuts.length === 0 || barLengthMm <= 0) {
    return [];
  }

  // Sort descending by length for optimal packing efficiency
  const sortedCuts = [...cuts].sort((a, b) => b.lengthMm - a.lengthMm);

  const bars: { cuts: CutPiece[]; usedLengthMm: number }[] = [];

  for (const piece of sortedCuts) {
    if (piece.lengthMm > barLengthMm) {
      // If a single piece is longer than the standard bar, it occupies its own bar
      bars.push({
        cuts: [piece],
        usedLengthMm: piece.lengthMm,
      });
      continue;
    }

    let placed = false;
    for (const bar of bars) {
      // Saw blade thickness is consumed for each cut after the first
      const additionalKerf = bar.cuts.length > 0 ? sawKerfMm : 0;
      if (bar.usedLengthMm + piece.lengthMm + additionalKerf <= barLengthMm) {
        bar.cuts.push(piece);
        bar.usedLengthMm += piece.lengthMm + additionalKerf;
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Open a new bar
      bars.push({
        cuts: [piece],
        usedLengthMm: piece.lengthMm,
      });
    }
  }

  return bars.map((bar, index) => {
    const remainingWasteMm = Math.max(0, barLengthMm - bar.usedLengthMm);
    const wastePercentage = (remainingWasteMm / barLengthMm) * 100;
    return {
      barNumber: index + 1,
      cuts: bar.cuts,
      usedLengthMm: bar.usedLengthMm,
      remainingWasteMm,
      wastePercentage: Number(wastePercentage.toFixed(1)),
    };
  });
}

/**
 * Calculates total glass surface in m² for the given dimensions.
 */
export function calculateGlassSurfaceM2(
  dimensions: QuoteDimension[],
  marginReductionMm: number = 20 // 20mm reduction for sash rebate clearance
): number {
  let totalM2 = 0;

  dimensions.forEach((dim) => {
    const qty = Math.max(1, Math.floor(dim.quantity || 1));
    const effectiveW = Math.max(0, dim.widthMm - marginReductionMm) / 1000;
    const effectiveH = Math.max(0, dim.heightMm - marginReductionMm) / 1000;
    const surfaceM2 = effectiveW * effectiveH;
    totalM2 += surfaceM2 * qty;
  });

  return Number(totalM2.toFixed(3));
}

/**
 * Main Product Calculation Function
 * Computes cuts for each profile reference, optimizes bar cutting, calculates accessories and glass.
 */
export function calculateDetailedProduct(
  dimensions: QuoteDimension[],
  components: ProductComponentConfig[],
  selectedGlass: GlassType | null | undefined,
  settings: GlobalSettings
): ProductCalculationResult {
  const profileCutsMap = new Map<string, {
    config: ProductComponentConfig;
    cuts: CutPiece[];
  }>();

  const accessoriesCalculations: AccessoryCalculationItem[] = [];

  const totalProductUnits = dimensions.reduce((acc, d) => acc + (d.quantity || 1), 0);

  // Process each enabled component
  components.filter((c) => c.enabled).forEach((comp) => {
    const isBarProfile = comp.unitType === 'barre' || comp.calculationMode === 'bar';

    if (isBarProfile) {
      const cuts: CutPiece[] = [];
      const rule = comp.rule;
      const extra = rule.extraFixedLengthMm || 0;

      dimensions.forEach((dim, dimIdx) => {
        const qty = Math.max(1, Math.floor(dim.quantity || 1));
        const dimLabel = dim.label || `Dim ${dimIdx + 1} (${dim.widthMm}×${dim.heightMm})`;

        for (let q = 0; q < qty; q++) {
          // Width cuts
          const wCount = Math.max(0, Math.floor(rule.formulaWidthMultiplier || 0));
          for (let w = 0; w < wCount; w++) {
            if (dim.widthMm > 0) {
              cuts.push({
                profileReferenceId: comp.referenceId,
                profileCode: comp.referenceCode,
                profileName: comp.referenceName,
                categoryName: comp.categoryName,
                label: `${comp.categoryName} ${comp.referenceCode} (L)`,
                lengthMm: dim.widthMm + extra,
                sourceDimension: dimLabel,
              });
            }
          }

          // Height cuts
          const hCount = Math.max(0, Math.floor(rule.formulaHeightMultiplier || 0));
          for (let h = 0; h < hCount; h++) {
            if (dim.heightMm > 0) {
              cuts.push({
                profileReferenceId: comp.referenceId,
                profileCode: comp.referenceCode,
                profileName: comp.referenceName,
                categoryName: comp.categoryName,
                label: `${comp.categoryName} ${comp.referenceCode} (H)`,
                lengthMm: dim.heightMm + extra,
                sourceDimension: dimLabel,
              });
            }
          }
        }
      });

      // Group by referenceId
      const existing = profileCutsMap.get(comp.referenceId);
      if (existing) {
        existing.cuts.push(...cuts);
      } else {
        profileCutsMap.set(comp.referenceId, {
          config: comp,
          cuts,
        });
      }
    } else {
      // Accessories (Piece, Metre, M2, Forfait, Lot)
      let calculatedQty = 0;
      let notes = '';

      if (comp.unitType === 'metre' || comp.calculationMode === 'linear_meter') {
        // Linear perimeter consumption
        let totalLinearMm = 0;
        const wMult = comp.rule.formulaWidthMultiplier || 2;
        const hMult = comp.rule.formulaHeightMultiplier || 2;

        dimensions.forEach((dim) => {
          const qty = Math.max(1, Math.floor(dim.quantity || 1));
          totalLinearMm += (dim.widthMm * wMult + dim.heightMm * hMult) * qty;
        });

        calculatedQty = Number((totalLinearMm / 1000).toFixed(2));
        notes = `${calculatedQty} m linéaire`;
      } else if (comp.unitType === 'm2' || comp.calculationMode === 'surface_m2') {
        let totalM2 = 0;
        dimensions.forEach((dim) => {
          const qty = Math.max(1, Math.floor(dim.quantity || 1));
          totalM2 += (dim.widthMm / 1000) * (dim.heightMm / 1000) * qty;
        });
        calculatedQty = Number(totalM2.toFixed(2));
        notes = `${calculatedQty} m²`;
      } else {
        // Piece, Lot, Forfait, Fixed quantity
        const baseQtyPerUnit = comp.rule.fixedQuantity ?? 1;
        calculatedQty = baseQtyPerUnit * totalProductUnits;
        notes = `${baseQtyPerUnit} par produit (${calculatedQty} au total)`;
      }

      const totalAr = Math.round(calculatedQty * (comp.unitPriceAr || 0));

      accessoriesCalculations.push({
        referenceId: comp.referenceId,
        referenceCode: comp.referenceCode,
        categoryName: comp.categoryName,
        name: comp.referenceName,
        unit: comp.unitType,
        unitPriceAr: comp.unitPriceAr || 0,
        quantity: calculatedQty,
        totalAr,
        notes,
      });
    }
  });

  // Calculate bar optimization per profile reference
  const profileCalculations: ProfileBarCalculation[] = [];
  let totalBarsNeeded = 0;
  let totalBarsCostAr = 0;

  profileCutsMap.forEach(({ config, cuts }) => {
    // Specific bar length or fallback to global settings
    const barLength = config.rule.extraFixedLengthMm || 0; // check config or fallback
    const effectiveBarLength =
      config.unitPriceAr && config.unitType === 'barre' && config.rule
        ? (settings.standardBarLengthMm || 5800)
        : (settings.standardBarLengthMm || 5800);

    // Profile-specific price or global default
    const effectiveBarPrice =
      config.unitPriceAr && config.unitPriceAr > 0
        ? config.unitPriceAr
        : settings.standardBarPriceAr;

    const cuttingPlans = optimizeBarCutting(cuts, effectiveBarLength, settings.sawKerfMm || 4);
    const barsNeeded = cuttingPlans.length;
    const barsCostAr = barsNeeded * effectiveBarPrice;
    const totalLinearMm = cuts.reduce((acc, c) => acc + c.lengthMm, 0);

    totalBarsNeeded += barsNeeded;
    totalBarsCostAr += barsCostAr;

    profileCalculations.push({
      profileReferenceId: config.referenceId,
      profileCode: config.referenceCode,
      profileName: config.referenceName,
      categoryName: config.categoryName,
      barLengthMm: effectiveBarLength,
      barPriceAr: effectiveBarPrice,
      cuts,
      totalPieces: cuts.length,
      totalLinearMm,
      barsNeeded,
      barsCostAr,
      cuttingPlans,
    });
  });

  // Glass Calculation
  let totalGlassAreaM2 = 0;
  let glassCostAr = 0;
  if (selectedGlass && selectedGlass.pricePerM2 > 0) {
    totalGlassAreaM2 = calculateGlassSurfaceM2(dimensions);
    glassCostAr = Math.round(totalGlassAreaM2 * selectedGlass.pricePerM2);
  }

  const totalAccessoriesCostAr = accessoriesCalculations.reduce(
    (sum, item) => sum + item.totalAr,
    0
  );

  const totalProductPriceAr = totalBarsCostAr + totalAccessoriesCostAr + glassCostAr;

  return {
    profileCalculations,
    totalBarsNeeded,
    totalBarsCostAr,
    accessoriesCalculations,
    totalAccessoriesCostAr,
    totalGlassAreaM2,
    glassCostAr,
    selectedGlassName: selectedGlass?.name,
    totalProductPriceAr,
  };
}

/**
 * Format currency with Malagasy Ariary standard spaces
 * Example: 1470000 -> "1 470 000 Ar"
 */
export function formatAriary(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 Ar';
  }
  const rounded = Math.round(amount);
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ar`;
}

/**
 * Format number with space separators
 */
export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) {
    return '0';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
