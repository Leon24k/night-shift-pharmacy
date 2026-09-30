import type {
  Patient,
  RuleId,
  Violation,
  VerificationResult,
} from '@/types';
import { DRUG_BY_CODE, requiresPrescription } from '@/data/formulary';
import { lookupDoctor } from '@/data/doctorRegistry';

// Tanggal "sekarang" dalam dunia game (untuk cek kadaluarsa SIP & umur resep).
export const GAME_TODAY = new Date('2026-09-30');

// Ambang umur resep (hari). Resep > 30 hari dianggap tidak berlaku untuk
// penebusan pertama pada prototipe ini.
const MAX_PRESCRIPTION_AGE_DAYS = 30;

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

// R1: Kelengkapan resep administratif.
function checkR1(patient: Patient): Violation | null {
  const p = patient.prescription;
  if (!p) return null; // tanpa resep ditangani di R2
  const missing: string[] = [];
  if (!p.doctorName.trim()) missing.push('nama dokter');
  if (!p.doctorSip.trim()) missing.push('nomor SIP');
  if (!p.dateWritten) missing.push('tanggal resep');
  if (!p.patientName.trim()) missing.push('nama pasien');
  if (p.items.length === 0) missing.push('item obat (R/)');
  if (!p.signed) missing.push('paraf dokter');

  // umur resep
  if (p.dateWritten) {
    const age = daysBetween(GAME_TODAY, new Date(p.dateWritten));
    if (age > MAX_PRESCRIPTION_AGE_DAYS) {
      return {
        rule: 'R1',
        title: 'Resep kadaluarsa',
        detail: `Resep ditulis ${age} hari lalu (>${MAX_PRESCRIPTION_AGE_DAYS} hari). Tidak berlaku untuk penebusan.`,
      };
    }
  }

  if (missing.length > 0) {
    return {
      rule: 'R1',
      title: 'Resep tidak lengkap',
      detail: `Komponen resep hilang: ${missing.join(', ')}.`,
    };
  }
  return null;
}

// R2: Golongan obat vs kebutuhan resep.
// Obat KERAS/PSIKOTROPIKA/NARKOTIKA WAJIB pakai resep.
function checkR2(patient: Patient): Violation | null {
  // kasus tanpa resep: minta obat langsung
  if (!patient.prescription) {
    // permintaan tanpa resep harus dicek: apakah ada penanda obat keras?
    // Pada prototipe, arketipe IBU_PANIK menyimpan target di spokenRequest.
    return null;
  }
  const offending: string[] = [];
  for (const item of patient.prescription.items) {
    const drug = DRUG_BY_CODE[item.drugCode];
    if (!drug) continue;
    // jika resep ada tapi tidak lengkap/tidak sah, R2 tetap menandai obat keras
    // yang butuh resep sah (ditangani bersama R1/R3). Di sini kita fokus:
    // jika resep valid, obat keras diperbolehkan. Tidak ada pelanggaran R2.
    void requiresPrescription(drug.drugClass);
    void offending;
  }
  return null;
}

// R2b: permintaan tanpa resep untuk obat wajib resep (arketipe tanpa resep).
function checkNoPrescriptionRequest(patient: Patient): Violation | null {
  if (patient.prescription) return null;
  if (!patient.requestedDrugCode) return null;
  const drug = DRUG_BY_CODE[patient.requestedDrugCode];
  if (!drug) return null;
  if (requiresPrescription(drug.drugClass)) {
    return {
      rule: 'R2',
      title: 'Obat wajib resep diminta tanpa resep',
      detail: `${drug.name} termasuk golongan ${drug.drugClass}. Tidak boleh diserahkan tanpa resep dokter yang sah.`,
    };
  }
  return null;
}

// R3: Validitas dokter (terdaftar & SIP belum kadaluarsa).
function checkR3(patient: Patient): Violation | null {
  const p = patient.prescription;
  if (!p) return null;
  const doc = lookupDoctor(p.doctorSip);
  if (!doc) {
    return {
      rule: 'R3',
      title: 'Dokter tidak terdaftar',
      detail: `SIP "${p.doctorSip}" tidak ditemukan di basis data Dinkes. Dugaan resep palsu.`,
    };
  }
  // nama harus cocok dengan SIP terdaftar
  if (doc.name !== p.doctorName) {
    return {
      rule: 'R3',
      title: 'Nama dokter tidak cocok dengan SIP',
      detail: `SIP terdaftar atas nama ${doc.name}, tetapi resep tertulis ${p.doctorName}.`,
    };
  }
  // SIP kadaluarsa
  const valid = new Date(doc.sipValidUntil);
  if (GAME_TODAY > valid) {
    return {
      rule: 'R3',
      title: 'SIP dokter kadaluarsa',
      detail: `SIP ${doc.name} berlaku s.d. ${doc.sipValidUntil}. Sudah tidak berlaku.`,
    };
  }
  return null;
}

// R4: Kecocokan keluhan lisan dengan indikasi obat pada resep.
function checkR4(patient: Patient): Violation | null {
  const p = patient.prescription;
  if (!p) return null;
  if (!patient.spokenComplaint) return null;
  const complaint = patient.spokenComplaint.toLowerCase();

  // jika minimal satu item obat memiliki indikasi yang cocok -> lolos
  const anyMatch = p.items.some((item) => {
    const drug = DRUG_BY_CODE[item.drugCode];
    if (!drug) return false;
    return drug.indication.some((ind) => complaint.includes(ind));
  });

  if (!anyMatch) {
    const names = p.items
      .map((i) => DRUG_BY_CODE[i.drugCode]?.name ?? i.drugName)
      .join(', ');
    return {
      rule: 'R4',
      title: 'Keluhan tidak cocok dengan obat',
      detail: `Pasien mengeluh "${patient.spokenComplaint}", tetapi resep berisi ${names} yang indikasinya tidak sesuai. Waspada penyalahgunaan.`,
    };
  }
  return null;
}

// Verifikasi terhadap aturan yang AKTIF pada hari ini.
export function verify(
  patient: Patient,
  activeRules: RuleId[],
): VerificationResult {
  const all: Array<Violation | null> = [];
  const active = new Set(activeRules);

  if (active.has('R1')) all.push(checkR1(patient));
  if (active.has('R2')) {
    all.push(checkR2(patient));
    all.push(checkNoPrescriptionRequest(patient));
  }
  if (active.has('R3')) all.push(checkR3(patient));
  if (active.has('R4')) all.push(checkR4(patient));

  const violations = all.filter((v): v is Violation => v !== null);
  return { violations, hasViolation: violations.length > 0 };
}
