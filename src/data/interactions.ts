// Interaksi obat MAYOR (kontraindikasi klinis nyata) untuk alert box.
// Dipasangkan berdasarkan zat aktif (activeIngredient).
export type Severity = 'MAYOR' | 'SEDANG';

export interface Interaction {
  a: string; // activeIngredient A
  b: string; // activeIngredient B
  severity: Severity;
  effect: string;
  note: string;
}

export const INTERACTIONS: Interaction[] = [
  {
    a: 'Sildenafil',
    b: 'Isosorbide Dinitrate',
    severity: 'MAYOR',
    effect: 'Hipotensi berat / syok',
    note: 'Kombinasi PDE5-inhibitor + nitrat menyebabkan penurunan tekanan darah drastis. KONTRAINDIKASI.',
  },
  {
    a: 'Tranexamic Acid',
    b: 'Isosorbide Dinitrate',
    severity: 'SEDANG',
    effect: 'Risiko trombosis',
    note: 'Evaluasi risiko bekuan pada pasien kardiovaskular.',
  },
  {
    a: 'Amoxicillin',
    b: 'Dexamethasone',
    severity: 'SEDANG',
    effect: 'Iritasi lambung meningkat',
    note: 'Kortikosteroid dapat menutupi tanda infeksi & menambah risiko lambung. Evaluasi.',
  },
  {
    a: 'Alprazolam',
    b: 'Codeine',
    severity: 'MAYOR',
    effect: 'Depresi napas',
    note: 'Benzodiazepin + opioid meningkatkan risiko depresi pernapasan fatal. Hindari.',
  },
  {
    a: 'Alprazolam',
    b: 'Tramadol',
    severity: 'MAYOR',
    effect: 'Depresi napas & kejang',
    note: 'Kombinasi sedatif + opioid berisiko fatal. Hindari.',
  },
  {
    a: 'Warfarin',
    b: 'Aspirin',
    severity: 'MAYOR',
    effect: 'Risiko perdarahan berat',
    note: 'Antikoagulan + antiplatelet meningkatkan risiko perdarahan. Evaluasi ketat / hindari.',
  },
  {
    a: 'Warfarin',
    b: 'Mefenamic Acid',
    severity: 'MAYOR',
    effect: 'Risiko perdarahan',
    note: 'NSAID meningkatkan efek antikoagulan warfarin & risiko perdarahan GI.',
  },
  {
    a: 'Simvastatin',
    b: 'Ciprofloxacin',
    severity: 'SEDANG',
    effect: 'Risiko miopati',
    note: 'Beberapa antibiotik meningkatkan kadar statin. Pantau nyeri otot.',
  },
  {
    a: 'Diazepam',
    b: 'Codeine',
    severity: 'MAYOR',
    effect: 'Depresi napas',
    note: 'Benzodiazepin + opioid: risiko depresi pernapasan. Hindari.',
  },
];

// Cari interaksi antar daftar zat aktif; abaikan urutan.
export function findInteractions(ingredients: string[]): Interaction[] {
  const result: Interaction[] = [];
  for (const it of INTERACTIONS) {
    const hasA = ingredients.includes(it.a);
    const hasB = ingredients.includes(it.b);
    if (hasA && hasB) result.push(it);
  }
  return result;
}
