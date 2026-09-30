import type { DayRule, RuleId } from '@/types';

// Aturan yang aktif per hari (berjenjang, ala Papers Please).
// Hari 1: R1+R2. Hari 2: +R3. Hari 3: +R4 (+ etiket & racik puyer unlock).
// Hari 4: copy resep (apograph) unlock. Hari 5: +R5 (DM anak).
export const RULES_BY_DAY: Record<number, RuleId[]> = {
  1: ['R1', 'R2'],
  2: ['R1', 'R2', 'R3'],
  3: ['R1', 'R2', 'R3', 'R4'],
  4: ['R1', 'R2', 'R3', 'R4'],
  5: ['R1', 'R2', 'R3', 'R4', 'R5'],
};

// "Koran" pengumuman aturan baru yang muncul tiap awal hari.
export const NEW_RULE_ANNOUNCEMENT: Record<number, DayRule> = {
  1: {
    rule: 'R2',
    headline: 'Dinkes: Obat Keras & OOT Wajib Resep Dokter',
    short:
      'Periksa kelengkapan resep (R1) dan jangan serahkan obat golongan Keras/Psikotropika/Narkotika tanpa resep sah (R2).',
  },
  2: {
    rule: 'R3',
    headline: 'BPOM Tingkatkan Pengawasan Keaslian Resep',
    short:
      'Mulai hari ini verifikasi SIP dokter di F4: pastikan terdaftar, nama cocok, dan belum kadaluarsa (R3).',
  },
  3: {
    rule: 'R4',
    headline: 'Marak Penyalahgunaan Obat: Cocokkan Keluhan & Terapi',
    short:
      'Dengarkan keluhan pasien. Tolak bila obat pada resep tidak sesuai keluhan (R4). Etiket & racik puyer kini aktif.',
  },
  4: {
    rule: 'R4',
    headline: 'Stok Menipis: Layani dengan Salinan Resep',
    short:
      'Bila stok obat kurang, serahkan yang tersedia (det) dan buatkan Salinan Resep / apograph p.c.c untuk sisanya (ne det).',
  },
  5: {
    rule: 'R5',
    headline: 'Fokus Keselamatan Anak: Cek Dosis Maksimum',
    short:
      'Untuk pasien anak, hitung Dosis Maksimum (DM). Tolak resep yang melebihi DM (R5). Gunakan rumus Young/Dilling/Clark.',
  },
};

export const MAX_DAY = 5;
export const COPY_RESEP_UNLOCK_DAY = 4;

export function rulesForDay(day: number): RuleId[] {
  return RULES_BY_DAY[Math.min(day, MAX_DAY)] ?? RULES_BY_DAY[MAX_DAY];
}
