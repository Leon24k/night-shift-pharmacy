import type { ShiftModifier, ShiftModifierInfo } from '@/types';

export const SHIFT_MODIFIERS: Record<ShiftModifier, ShiftModifierInfo> = {
  NONE: {
    id: 'NONE',
    title: 'Malam Tenang',
    desc: 'Tidak ada kejadian khusus. Kerjakan seperti biasa.',
  },
  CAKAR_AYAM: {
    id: 'CAKAR_AYAM',
    title: 'Resep Cakar Ayam',
    desc: 'Tulisan dokter malam ini sangat sulit dibaca. Perbesar resep & baca teliti sebelum memutuskan.',
  },
  LASA_WASPADA: {
    id: 'LASA_WASPADA',
    title: 'Waspada LASA',
    desc: 'Banyak obat mirip nama (Look-Alike Sound-Alike), mis. Asam Mefenamat vs Asam Traneksamat. Cek di F2 & cocokkan keluhan.',
  },
  RAMAI: {
    id: 'RAMAI',
    title: 'Antrian Ramai',
    desc: 'Malam ramai — lebih banyak resep bermasalah menyelinap. Tetap teliti.',
  },
};

// Pilih modifier acak (mulai muncul hari >= 2).
export function rollShiftModifier(day: number, rng: () => number): ShiftModifier {
  if (day < 2) return 'NONE';
  const pool: ShiftModifier[] = [
    'NONE',
    'CAKAR_AYAM',
    'LASA_WASPADA',
    'RAMAI',
  ];
  return pool[Math.floor(rng() * pool.length)];
}
