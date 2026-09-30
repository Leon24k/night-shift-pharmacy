// ===== Golongan obat (drug classification, Indonesia) =====
export type DrugClass =
  | 'BEBAS' // hijau, tanpa resep
  | 'BEBAS_TERBATAS' // biru, tanpa resep (P1-P6)
  | 'KERAS' // merah K, wajib resep
  | 'PSIKOTROPIKA' // wajib resep, ketat
  | 'NARKOTIKA'; // wajib resep asli, ketat

export type DrugForm =
  | 'Tablet'
  | 'Kaplet'
  | 'Kapsul'
  | 'Sirup'
  | 'Drop'
  | 'Salep'
  | 'Krim'
  | 'Tetes Mata'
  | 'Tetes Telinga'
  | 'Suppositoria';

// rute pemberian -> menentukan warna etiket (dalam=putih, luar=biru)
export type Route = 'DALAM' | 'LUAR';

export interface Drug {
  code: string; // e.g. AMX500
  name: string; // nama dagang/generik yang tampil
  activeIngredient: string; // zat aktif
  form: DrugForm;
  strengthMg: number | null; // kekuatan per satuan (mg), null utk sediaan non-mg
  drugClass: DrugClass;
  route: Route;
  maxDailyMg: number | null; // dosis maksimum harian (mg), null jika N/A
  pricePerUnit: number; // Rp per satuan
  stock: number;
  lasa: boolean; // Look-Alike Sound-Alike flag
  therapeuticClass: string; // kelas terapi, mis. "Antibiotik"
  indication: string[]; // keyword indikasi utk cek kecocokan keluhan
}

// ===== Dokter & SIP =====
export interface Doctor {
  name: string;
  sip: string; // nomor SIP
  specialty: string;
  facility: string; // RS/klinik
  sipValidUntil: string; // ISO date
  registered: boolean; // terdaftar di database Dinkes (registry)
}

// ===== Resep =====
export interface Signa {
  raw: string; // singkatan latin, mis. "S 3 dd tab 1 p.c."
  frequencyPerDay: number; // 3
  amountPerDose: number; // 1
  route: Route; // DALAM/LUAR (u.e. -> LUAR)
  meaning: string; // terjemahan bahasa Indonesia
}

export interface PrescriptionItem {
  drugCode: string;
  drugName: string; // seperti tertulis di resep (bisa beda dari master utk perangkap)
  quantity: number; // No. XV -> 15
  signa: Signa;
  compound?: boolean; // true jika bagian dari racikan puyer (m.f. pulv)
  pulvCount?: number; // jumlah bungkus puyer (dtd No. X)
  stockShort?: boolean; // stok tidak cukup -> perlu copy resep
  availableQty?: number; // jumlah yang bisa diserahkan (det), sisanya ne det
}

export interface Prescription {
  id: string;
  // Inscriptio
  doctorName: string;
  doctorSip: string;
  facility: string;
  dateWritten: string; // ISO
  // Pro (pasien)
  patientName: string;
  patientAgeYears: number;
  patientWeightKg: number | null;
  // Ordinatio
  items: PrescriptionItem[];
  // Subscriptio
  signed: boolean; // ada paraf dokter
  // meta untuk render "cakar ayam"
  handwritingNoise: number; // 0..1
}

// ===== Pasien / arketipe =====
export type ArchetypeId =
  | 'BIASA'
  | 'IBU_PANIK'
  | 'CALO_OOT'
  | 'KRONIS'
  | 'RACIKAN_ANAK'
  | 'OWA_REQUEST'
  | 'OVERDOSIS_ANAK'
  | 'MYSTERY_SHOPPER';

export interface Patient {
  id: string;
  archetype: ArchetypeId;
  displayName: string;
  spokenComplaint: string; // keluhan lisan (di balik kaca)
  spokenRequest?: string; // permintaan lisan (mis. memaksa antibiotik)
  requestedDrugCode?: string; // obat yang diminta tanpa resep (arketipe tanpa resep)
  prescription: Prescription | null; // null jika minta obat tanpa resep
  // Ground truth untuk scoring (tidak ditampilkan ke pemain)
  shouldAccept: boolean;
  isMysteryShopper: boolean;
}

// ===== Verifikasi =====
export type RuleId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export interface Violation {
  rule: RuleId;
  title: string;
  detail: string;
}

export type StampDecision = 'ACCEPT' | 'REJECT';

export interface VerificationResult {
  violations: Violation[];
  hasViolation: boolean;
}

// ===== Keputusan pemain & hasil =====
export interface Judgement {
  patientId: string;
  decision: StampDecision;
  correct: boolean;
  reason: string; // penjelasan edukatif
  moneyDelta: number;
  reputationDelta: number;
  wasMysteryShopper: boolean;
}

// ===== Game phase =====
export type GamePhase =
  | 'TITLE'
  | 'ONBOARDING'
  | 'SHIFT_INTRO'
  | 'PLAYING'
  | 'COMPOUNDING'
  | 'COPY_RESEP'
  | 'DISPENSING'
  | 'FEEDBACK'
  | 'SHIFT_SUMMARY'
  | 'GAME_OVER';

export type LabelColor = 'PUTIH' | 'BIRU';

export interface DayRule {
  rule: RuleId;
  headline: string; // "koran" pengumuman aturan
  short: string;
}

// Modifier lingkungan acak per shift.
export type ShiftModifier = 'NONE' | 'CAKAR_AYAM' | 'LASA_WASPADA' | 'RAMAI';

export interface ShiftModifierInfo {
  id: ShiftModifier;
  title: string;
  desc: string;
}
