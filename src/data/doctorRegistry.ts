import type { Doctor } from '@/types';

// Registry dokter terdaftar (basis data Dinkes ilustratif).
// Dokter dengan registered=false atau SIP kadaluarsa dipakai sebagai perangkap R3.
export const DOCTOR_REGISTRY: Doctor[] = [
  {
    name: 'dr. Siti Rahmawati',
    sip: 'SIP.446/1123/DINKES/2024',
    specialty: 'Dokter Umum',
    facility: 'Klinik Sehat Sentosa',
    sipValidUntil: '2027-06-30',
    registered: true,
  },
  {
    name: 'dr. Budi Hartono, Sp.PD',
    sip: 'SIP.446/2087/DINKES/2023',
    specialty: 'Penyakit Dalam',
    facility: 'RS Harapan Bunda',
    sipValidUntil: '2026-12-31',
    registered: true,
  },
  {
    name: 'dr. Andini Kusuma, Sp.A',
    sip: 'SIP.446/3391/DINKES/2024',
    specialty: 'Anak',
    facility: 'RSIA Permata',
    sipValidUntil: '2027-03-15',
    registered: true,
  },
  {
    name: 'dr. Reza Pratama',
    sip: 'SIP.446/1874/DINKES/2022',
    specialty: 'Dokter Umum',
    facility: 'Puskesmas Melati',
    sipValidUntil: '2026-11-20',
    registered: true,
  },
  {
    name: 'dr. Maria Yohana, Sp.KK',
    sip: 'SIP.446/4102/DINKES/2024',
    specialty: 'Kulit & Kelamin',
    facility: 'Klinik Kulit Estetika',
    sipValidUntil: '2027-01-10',
    registered: true,
  },
  // ----- Perangkap: SIP sudah kadaluarsa -----
  {
    name: 'dr. Hendra Wijaya',
    sip: 'SIP.446/0912/DINKES/2019',
    specialty: 'Dokter Umum',
    facility: 'Klinik Lama Sejahtera',
    sipValidUntil: '2022-08-01', // KADALUARSA
    registered: true,
  },
];

// Dokter TIDAK terdaftar (nama & SIP palsu) untuk perangkap resep palsu.
// Tidak ada di registry -> lookup gagal.
export const FAKE_DOCTORS: Doctor[] = [
  {
    name: 'dr. Yanto Susilo',
    sip: 'SIP.446/9999/DINKES/2024',
    specialty: 'Dokter Umum',
    facility: 'Klinik Tak Dikenal',
    sipValidUntil: '2027-01-01',
    registered: false,
  },
  {
    name: 'dr. Bambang (kop fotokopi)',
    sip: '446-XXX-2024',
    specialty: 'Dokter Umum',
    facility: '-',
    sipValidUntil: '2027-01-01',
    registered: false,
  },
];

export const REGISTERED_SIPS = new Set(DOCTOR_REGISTRY.map((d) => d.sip));

export function lookupDoctor(sip: string): Doctor | undefined {
  return DOCTOR_REGISTRY.find((d) => d.sip === sip);
}
