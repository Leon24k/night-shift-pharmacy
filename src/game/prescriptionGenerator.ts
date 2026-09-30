import type {
  ArchetypeId,
  Doctor,
  Patient,
  Prescription,
  PrescriptionItem,
  RuleId,
} from '@/types';
import { DRUG_BY_CODE, FORMULARY } from '@/data/formulary';
import { DOCTOR_REGISTRY, FAKE_DOCTORS } from '@/data/doctorRegistry';
import { buildSigna } from './signa';
import { chance, makeRng, pick, randInt } from './rng';
import { verify } from './verification';

let counter = 0;
function uid(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

// dokter valid (terdaftar & SIP masih berlaku)
const VALID_DOCTORS = DOCTOR_REGISTRY.filter(
  (d) => d.registered && new Date(d.sipValidUntil) > new Date('2026-09-30'),
);
const EXPIRED_DOCTOR = DOCTOR_REGISTRY.find(
  (d) => new Date(d.sipValidUntil) <= new Date('2026-09-30'),
)!;

const FIRST_NAMES = [
  'Budi',
  'Siti',
  'Agus',
  'Dewi',
  'Rina',
  'Joko',
  'Wati',
  'Andi',
  'Sri',
  'Eko',
];
const LAST_NAMES = [
  'Santoso',
  'Wijaya',
  'Lestari',
  'Pratama',
  'Nugroho',
  'Halim',
  'Saputra',
];

function randomName(rng: () => number): string {
  return `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
}

// buat item resep dari kode obat
function makeItem(
  rng: () => number,
  drugCode: string,
  displayNameOverride?: string,
): PrescriptionItem {
  const drug = DRUG_BY_CODE[drugCode];
  const isLuar = drug.route === 'LUAR';
  const freq = isLuar ? randInt(rng, 2, 3) : randInt(rng, 1, 3);
  const signa = buildSigna({
    frequencyPerDay: freq,
    amountPerDose: 1,
    route: drug.route,
    unit: drug.form === 'Sirup' ? 'cth' : isLuar ? undefined : 'tab',
    timing: isLuar ? '' : chance(rng, 0.5) ? 'p.c.' : '',
  });
  return {
    drugCode,
    drugName: displayNameOverride ?? drug.name,
    quantity: isLuar ? 1 : randInt(rng, 6, 20),
    signa,
  };
}

function basePrescription(
  rng: () => number,
  doctor: Doctor,
  patientName: string,
  ageYears: number,
  items: PrescriptionItem[],
  overrides: Partial<Prescription> = {},
): Prescription {
  // tanggal resep: default beberapa hari lalu (masih berlaku)
  const daysAgo = randInt(rng, 0, 5);
  const date = new Date('2026-09-30');
  date.setDate(date.getDate() - daysAgo);

  return {
    id: uid('rx'),
    doctorName: doctor.name,
    doctorSip: doctor.sip,
    facility: doctor.facility,
    dateWritten: date.toISOString().slice(0, 10),
    patientName,
    patientAgeYears: ageYears,
    patientWeightKg: ageYears < 12 ? randInt(rng, 10, 35) : null,
    items,
    signed: true,
    handwritingNoise: 0.2 + rng() * 0.5,
    ...overrides,
  };
}

// ---------- Arketipe ----------

function makeBiasa(rng: () => number): Patient {
  const doctor = pick(rng, VALID_DOCTORS);
  const name = randomName(rng);
  const pool = ['PCT500', 'AMX500', 'MEF500', 'CTM04', 'GG100', 'AML05'];
  const code = pick(rng, pool);
  const drug = DRUG_BY_CODE[code];
  const complaint = pick(rng, drug.indication);
  const rx = basePrescription(rng, doctor, name, randInt(rng, 18, 60), [
    makeItem(rng, code),
  ]);
  return {
    id: uid('pat'),
    archetype: 'BIASA',
    displayName: name,
    spokenComplaint: `Saya ${complaint}, dikasih resep sama dokter.`,
    prescription: rx,
    shouldAccept: true, // dihitung ulang di finalize
    isMysteryShopper: false,
  };
}

function makeIbuPanik(rng: () => number): Patient {
  // minta antibiotik keras TANPA resep
  const name = `Ibu ${pick(rng, FIRST_NAMES)}`;
  return {
    id: uid('pat'),
    archetype: 'IBU_PANIK',
    displayName: name,
    spokenComplaint: 'Anak saya demam tinggi dari semalam!',
    spokenRequest: 'Kasih antibiotik Amoxicillin aja ya, biar cepet sembuh!',
    requestedDrugCode: 'AMX500',
    prescription: null,
    shouldAccept: false,
    isMysteryShopper: false,
  };
}

function makeCaloOOT(rng: () => number): Patient {
  const name = randomName(rng);
  const code = pick(rng, ['TRM50', 'ALP05', 'COD10']);
  // perangkap: dokter palsu / SIP kadaluarsa
  const trap = pick(rng, ['fake', 'expired', 'unsigned']);
  let doctor: Doctor;
  const overrides: Partial<Prescription> = {};
  if (trap === 'fake') {
    doctor = pick(rng, FAKE_DOCTORS);
  } else if (trap === 'expired') {
    doctor = EXPIRED_DOCTOR;
  } else {
    doctor = pick(rng, VALID_DOCTORS);
    overrides.signed = false; // tanpa paraf
  }
  const rx = basePrescription(
    rng,
    doctor,
    name,
    randInt(rng, 20, 45),
    [makeItem(rng, code)],
    overrides,
  );
  return {
    id: uid('pat'),
    archetype: 'CALO_OOT',
    displayName: name,
    spokenComplaint: 'Cuma mau nebus resep ini aja, buru-buru.',
    prescription: rx,
    shouldAccept: false,
    isMysteryShopper: false,
  };
}

function makeKronis(rng: () => number): Patient {
  const doctor = pick(rng, VALID_DOCTORS);
  const name = randomName(rng);
  const codes = ['AML05', 'MTF500'];
  const items = codes.map((c) => makeItem(rng, c));
  const rx = basePrescription(rng, doctor, name, randInt(rng, 45, 70), items);
  return {
    id: uid('pat'),
    archetype: 'KRONIS',
    displayName: name,
    spokenComplaint: 'Obat rutin bulanan saya, hipertensi sama diabetes.',
    prescription: rx,
    shouldAccept: true,
    isMysteryShopper: false,
  };
}

// perangkap R4: keluhan tidak cocok obat (misuse)
function makeMismatch(rng: () => number): Patient {
  const doctor = pick(rng, VALID_DOCTORS);
  const name = randomName(rng);
  // keluhan "batuk" tapi resep obat kuat (sildenafil) -> tidak cocok
  const rx = basePrescription(rng, doctor, name, randInt(rng, 25, 45), [
    makeItem(rng, 'SIL50'),
  ]);
  return {
    id: uid('pat'),
    archetype: 'CALO_OOT',
    displayName: name,
    spokenComplaint: 'Saya batuk pilek beberapa hari ini.',
    prescription: rx,
    shouldAccept: false,
    isMysteryShopper: false,
  };
}

const BUILDERS: Record<
  Exclude<ArchetypeId, 'MYSTERY_SHOPPER'>,
  (rng: () => number) => Patient
> = {
  BIASA: makeBiasa,
  IBU_PANIK: makeIbuPanik,
  CALO_OOT: makeCaloOOT,
  KRONIS: makeKronis,
};

// Finalisasi: hitung ground-truth shouldAccept lewat engine (semua aturan aktif),
// agar generator & verifikasi selalu konsisten.
function finalize(patient: Patient, mysteryShopper: boolean): Patient {
  const allRules: RuleId[] = ['R1', 'R2', 'R3', 'R4'];
  const res = verify(patient, allRules);
  return {
    ...patient,
    shouldAccept: !res.hasViolation,
    isMysteryShopper: mysteryShopper,
  };
}

// Generate satu antrian pasien untuk sebuah shift.
export function generateShift(opts: {
  seed: number;
  count: number;
  activeRules: RuleId[];
  mysteryShopperIndex?: number; // indeks pasien yang jadi mystery shopper
}): Patient[] {
  const rng = makeRng(opts.seed);
  const patients: Patient[] = [];

  // distribusi arketipe: pastikan campur valid & bermasalah
  const archetypePool: Array<Exclude<ArchetypeId, 'MYSTERY_SHOPPER'>> = [
    'BIASA',
    'BIASA',
    'IBU_PANIK',
    'CALO_OOT',
    'KRONIS',
  ];

  for (let i = 0; i < opts.count; i++) {
    // sisipkan mismatch (R4) sesekali
    let patient: Patient;
    if (chance(rng, 0.18)) {
      patient = makeMismatch(rng);
    } else {
      const arch = pick(rng, archetypePool);
      patient = BUILDERS[arch](rng);
    }
    const isMystery = opts.mysteryShopperIndex === i;
    patients.push(finalize(patient, isMystery));
  }

  return patients;
}

// util untuk debugging / kelengkapan formulary
export const ALL_DRUG_CODES = FORMULARY.map((d) => d.code);
