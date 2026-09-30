// Perhitungan Dosis Maksimum (DM) anak berdasarkan dosis dewasa.
// Pemilihan rumus:
//  - Young  : berdasarkan umur, untuk anak < 8 tahun -> (n / (n+12))
//  - Dilling: berdasarkan umur, untuk anak 8-20 tahun -> (n / 20)
//  - Clark  : berdasarkan berat badan -> (BB / 70)
export type DoseFormula = 'YOUNG' | 'DILLING' | 'CLARK';

export function chooseFormula(ageYears: number, weightKg: number | null): DoseFormula {
  if (weightKg != null && weightKg > 0) return 'CLARK';
  if (ageYears < 8) return 'YOUNG';
  return 'DILLING';
}

// Fraksi dosis dewasa yang boleh untuk anak.
export function doseFraction(
  formula: DoseFormula,
  ageYears: number,
  weightKg: number | null,
): number {
  switch (formula) {
    case 'YOUNG':
      return ageYears / (ageYears + 12);
    case 'DILLING':
      return ageYears / 20;
    case 'CLARK':
      return (weightKg ?? 0) / 70;
  }
}

// DM anak (mg/hari) = fraksi * DM dewasa.
export function pediatricMaxDaily(
  adultMaxDailyMg: number,
  ageYears: number,
  weightKg: number | null,
): { formula: DoseFormula; fraction: number; maxDailyMg: number } {
  const formula = chooseFormula(ageYears, weightKg);
  const fraction = doseFraction(formula, ageYears, weightKg);
  return {
    formula,
    fraction,
    maxDailyMg: adultMaxDailyMg * fraction,
  };
}

export const FORMULA_LABEL: Record<DoseFormula, string> = {
  YOUNG: 'Young (umur, <8 th)',
  DILLING: 'Dilling (umur, 8–20 th)',
  CLARK: 'Clark (berat badan)',
};
