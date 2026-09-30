// OWA — Obat Wajib Apotek: obat KERAS tertentu yang boleh diserahkan apoteker
// TANPA resep dokter, dengan batas jumlah per pasien. (Daftar disederhanakan.)
export interface OwaEntry {
  drugCode: string;
  maxQtyWithoutRx: number; // batas jumlah tanpa resep
  note: string;
}

export const OWA_LIST: OwaEntry[] = [
  {
    drugCode: 'CTM04',
    maxQtyWithoutRx: 20,
    note: 'Antihistamin — boleh tanpa resep, maksimal 20 tablet.',
  },
  {
    drugCode: 'HCR01',
    maxQtyWithoutRx: 1,
    note: 'Hidrokortison krim — maksimal 1 tube untuk keluhan kulit ringan.',
  },
  {
    drugCode: 'MEF500',
    maxQtyWithoutRx: 20,
    note: 'Asam mefenamat — maksimal 20 tablet untuk nyeri.',
  },
  {
    drugCode: 'GTM01',
    maxQtyWithoutRx: 1,
    note: 'Salep mata gentamicin — maksimal 1 tube.',
  },
];

export const OWA_BY_CODE: Record<string, OwaEntry> = Object.fromEntries(
  OWA_LIST.map((o) => [o.drugCode, o]),
);

export function isOwa(code: string): boolean {
  return code in OWA_BY_CODE;
}
