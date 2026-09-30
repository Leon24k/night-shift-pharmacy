import { useEffect, useMemo, useState } from 'react';
import type { Patient } from '@/types';
import { FORMULARY, DRUG_BY_CODE } from '@/data/formulary';
import { DOCTOR_REGISTRY, lookupDoctor } from '@/data/doctorRegistry';
import { findInteractions } from '@/data/interactions';
import { isOwa, OWA_BY_CODE } from '@/data/owaList';
import { pediatricMaxDaily, FORMULA_LABEL } from '@/game/doseCalc';
import { rupiah } from '@/lib/format';

type Tab = 'F1' | 'F2' | 'F3' | 'F4';

interface Props {
  patient: Patient | null;
  day: number;
}

const GOL_BADGE: Record<string, string> = {
  BEBAS: 'bg-green-600',
  BEBAS_TERBATAS: 'bg-blue-600',
  KERAS: 'bg-red-700',
  PSIKOTROPIKA: 'bg-purple-700',
  NARKOTIKA: 'bg-black',
};

// Replika software apotek lawas (Windows Form / Delphi).
export function SimApotek({ patient, day }: Props) {
  const [tab, setTab] = useState<Tab>('F1');
  const [sipQuery, setSipQuery] = useState('');

  // shortcut F1-F4
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'F1') {
        e.preventDefault();
        setTab('F1');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setTab('F2');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setTab('F3');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setTab('F4');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // obat pada resep aktif
  const rxDrugs = useMemo(() => {
    if (!patient?.prescription) return [];
    return patient.prescription.items
      .map((i) => DRUG_BY_CODE[i.drugCode])
      .filter(Boolean);
  }, [patient]);

  const interactions = useMemo(
    () => findInteractions(rxDrugs.map((d) => d.activeIngredient)),
    [rxDrugs],
  );

  // hasil lookup SIP (F4)
  const sipResult = useMemo(() => {
    if (!sipQuery.trim()) return undefined;
    return lookupDoctor(sipQuery.trim());
  }, [sipQuery]);

  return (
    <div className="flex h-full flex-col bg-win-face text-black">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-win-highlight px-2 py-0.5 text-xs font-bold text-white">
        <span>SIM-APOTEK PRIMA v3.2 — [KASIR & DISPENSING SHIFT MALAM]</span>
        <span className="flex gap-1">
          <span className="win-btn px-1 py-0 text-[10px]">_</span>
          <span className="win-btn px-1 py-0 text-[10px]">□</span>
          <span className="win-btn px-1 py-0 text-[10px]">X</span>
        </span>
      </div>

      {/* Menu tab F1-F4 */}
      <div className="flex gap-1 border-b border-win-shadow bg-win-face px-1 py-1">
        <TabBtn label="F1: Tebus Resep" active={tab === 'F1'} onClick={() => setTab('F1')} />
        <TabBtn label="F2: Formularium" active={tab === 'F2'} onClick={() => setTab('F2')} />
        <TabBtn label="F3: Cek Stok" active={tab === 'F3'} onClick={() => setTab('F3')} />
        <TabBtn label="F4: Master SIP" active={tab === 'F4'} onClick={() => setTab('F4')} />
      </div>

      {/* Info pasien */}
      <div className="border-b border-win-shadow bg-win-face px-2 py-1 text-[11px]">
        {patient ? (
          <div className="flex flex-wrap gap-x-4">
            <span>
              Pasien: <b>{patient.prescription?.patientName ?? patient.displayName}</b>
            </span>
            {patient.prescription && (
              <>
                <span>Usia: <b>{patient.prescription.patientAgeYears} th</b></span>
                <span>
                  BB: <b>{patient.prescription.patientWeightKg ?? '-'} kg</b>
                </span>
              </>
            )}
            <span className="ml-auto text-win-shadow">Hari ke-{day}</span>
          </div>
        ) : (
          <span className="text-win-shadow">Menunggu pasien...</span>
        )}
      </div>

      {/* Konten tab */}
      <div className="retro-scroll flex-1 overflow-auto bg-white p-1">
        {tab === 'F1' && <TebusResep patient={patient} interactions={interactions} />}
        {tab === 'F2' && <FormulariumGrid />}
        {tab === 'F3' && <FormulariumGrid stockOnly />}
        {tab === 'F4' && (
          <MasterSip
            query={sipQuery}
            onQuery={setSipQuery}
            result={sipResult}
            queried={sipQuery.trim().length > 0}
          />
        )}
      </div>

      {/* Alert interaksi */}
      {interactions.length > 0 && (
        <div className="border-t-2 border-red-800 bg-yellow-200 px-2 py-1 text-[11px] text-black">
          <div className="font-bold text-red-800">
            [ ! ] PERINGATAN INTERAKSI {interactions[0].severity}
          </div>
          {interactions.map((it, i) => (
            <div key={i}>
              {it.a} + {it.b} → {it.effect}. {it.note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="win-btn text-[11px]"
      style={active ? { boxShadow: 'inset 1px 1px #404040, inset -1px -1px #fff' } : undefined}
    >
      {label}
    </button>
  );
}

function GolBadge({ cls }: { cls: string }) {
  return (
    <span className={`rounded px-1 text-[9px] font-bold text-white ${GOL_BADGE[cls] ?? 'bg-gray-500'}`}>
      {cls.replace('_', ' ')}
    </span>
  );
}

// F1: Tebus resep — tampilkan obat pada resep + status
function TebusResep({
  patient,
  interactions,
}: {
  patient: Patient | null;
  interactions: ReturnType<typeof findInteractions>;
}) {
  if (!patient) return <Empty>Belum ada transaksi.</Empty>;
  if (!patient.prescription) {
    return (
      <div className="p-2 text-[11px]">
        <div className="mb-1 font-bold text-red-700">
          Pasien TIDAK membawa resep.
        </div>
        {patient.requestedDrugCode && (
          <div>
            Permintaan langsung:{' '}
            <b>{DRUG_BY_CODE[patient.requestedDrugCode]?.name}</b>{' '}
            <GolBadge cls={DRUG_BY_CODE[patient.requestedDrugCode]?.drugClass ?? ''} />
            {isOwa(patient.requestedDrugCode) ? (
              <div className="mt-1 rounded bg-green-100 px-1 py-0.5 text-green-800">
                ✓ Termasuk OWA (Obat Wajib Apotek) — boleh diserahkan apoteker
                tanpa resep. Batas: {OWA_BY_CODE[patient.requestedDrugCode].maxQtyWithoutRx}.{' '}
                {OWA_BY_CODE[patient.requestedDrugCode].note}
              </div>
            ) : (
              <div className="mt-1 rounded bg-red-100 px-1 py-0.5 text-red-800">
                ✗ Bukan OWA & butuh resep. Tidak boleh diserahkan tanpa resep.
              </div>
            )}
          </div>
        )}
        <div className="mt-2 text-win-shadow">
          Periksa: apakah obat yang diminta boleh diserahkan tanpa resep?
        </div>
      </div>
    );
  }

  const total = patient.prescription.items.reduce((sum, i) => {
    const d = DRUG_BY_CODE[i.drugCode];
    return sum + (d ? d.pricePerUnit * i.quantity : 0);
  }, 0);

  return (
    <>
    <table className="w-full border-collapse text-[11px]">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="border border-gray-400 px-1">KODE</th>
          <th className="border border-gray-400 px-1">NAMA OBAT</th>
          <th className="border border-gray-400 px-1">GOL</th>
          <th className="border border-gray-400 px-1">QTY</th>
          <th className="border border-gray-400 px-1">DM/hari</th>
          <th className="border border-gray-400 px-1">HARGA</th>
        </tr>
      </thead>
      <tbody>
        {patient.prescription.items.map((item, idx) => {
          const d = DRUG_BY_CODE[item.drugCode];
          if (!d) return null;
          return (
            <tr key={idx} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100">
              <td className="border border-gray-300 px-1 font-mono">{d.code}</td>
              <td className="border border-gray-300 px-1">
                {d.name} {d.lasa && <span className="font-bold text-orange-600" title="Look-Alike Sound-Alike">⚠LASA</span>}
              </td>
              <td className="border border-gray-300 px-1"><GolBadge cls={d.drugClass} /></td>
              <td className="border border-gray-300 px-1">{item.quantity}</td>
              <td className="border border-gray-300 px-1">{d.maxDailyMg ?? '-'} mg</td>
              <td className="border border-gray-300 px-1">{rupiah(d.pricePerUnit * item.quantity)}</td>
            </tr>
          );
        })}
        <tr className="bg-gray-100 font-bold">
          <td className="border border-gray-300 px-1" colSpan={5}>TOTAL</td>
          <td className="border border-gray-300 px-1">{rupiah(total)}</td>
        </tr>
      </tbody>
      {interactions.length === 0 && (
        <tfoot>
          <tr>
            <td colSpan={6} className="px-1 pt-1 text-[10px] text-green-700">
              STATUS INTERAKSI: Tidak ada interaksi mayor terdeteksi.
            </td>
          </tr>
        </tfoot>
      )}
    </table>
    <PediatricDose patient={patient} />
    </>
  );
}

// F2/F3: Formularium lengkap
function FormulariumGrid({ stockOnly }: { stockOnly?: boolean }) {
  return (
    <table className="w-full border-collapse text-[11px]">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="border border-gray-400 px-1">KODE</th>
          <th className="border border-gray-400 px-1">NAMA OBAT</th>
          <th className="border border-gray-400 px-1">GOL</th>
          <th className="border border-gray-400 px-1">STOK</th>
          {!stockOnly && <th className="border border-gray-400 px-1">DM/hari</th>}
          {!stockOnly && <th className="border border-gray-400 px-1">HARGA</th>}
        </tr>
      </thead>
      <tbody>
        {FORMULARY.map((d) => (
          <tr key={d.code} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100">
            <td className="border border-gray-300 px-1 font-mono">{d.code}</td>
            <td className="border border-gray-300 px-1">
              {d.name} {d.lasa && <span className="font-bold text-orange-600">⚠</span>}
            </td>
            <td className="border border-gray-300 px-1"><GolBadge cls={d.drugClass} /></td>
            <td className={`border border-gray-300 px-1 ${d.stock < 25 ? 'font-bold text-red-700' : ''}`}>{d.stock}</td>
            {!stockOnly && <td className="border border-gray-300 px-1">{d.maxDailyMg ?? '-'} mg</td>}
            {!stockOnly && <td className="border border-gray-300 px-1">{rupiah(d.pricePerUnit)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// F4: Master SIP — lookup keaslian dokter
function MasterSip({
  query,
  onQuery,
  result,
  queried,
}: {
  query: string;
  onQuery: (v: string) => void;
  result: ReturnType<typeof lookupDoctor>;
  queried: boolean;
}) {
  return (
    <div className="p-1 text-[11px]">
      <div className="mb-2 flex items-center gap-1">
        <span>Cari SIP:</span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="ketik / tempel nomor SIP dari resep"
          className="win-sunken flex-1 px-1 py-0.5 font-mono text-[11px] outline-none"
        />
      </div>

      {queried && (
        <div className="mb-2 win-sunken p-2">
          {result ? (
            <div>
              <div className="font-bold text-green-700">✓ TERDAFTAR</div>
              <div>Nama: {result.name}</div>
              <div>Spesialisasi: {result.specialty}</div>
              <div>Faskes: {result.facility}</div>
              <div>
                Berlaku s.d:{' '}
                <span className={new Date(result.sipValidUntil) < new Date('2026-09-30') ? 'font-bold text-red-700' : ''}>
                  {result.sipValidUntil}
                  {new Date(result.sipValidUntil) < new Date('2026-09-30') && ' (KADALUARSA!)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="font-bold text-red-700">
              ✗ TIDAK DITEMUKAN — SIP tidak terdaftar di basis data Dinkes. Waspada resep palsu.
            </div>
          )}
        </div>
      )}

      <div className="mt-2 text-win-shadow">Daftar dokter terdaftar:</div>
      <table className="w-full border-collapse">
        <tbody>
          {DOCTOR_REGISTRY.map((d) => (
            <tr key={d.sip} className="odd:bg-white even:bg-blue-50">
              <td className="border border-gray-300 px-1">{d.name}</td>
              <td className="border border-gray-300 px-1 font-mono">{d.sip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-3 text-[11px] text-win-shadow">{children}</div>;
}

// Kalkulator DM anak untuk pasien < 12 th (edukatif, membantu cek R5).
function PediatricDose({ patient }: { patient: Patient }) {
  if (!patient.prescription) return null;
  const { patientAgeYears: age, patientWeightKg: bb } = patient.prescription;
  if (age >= 12) return null;
  const rows = patient.prescription.items
    .map((i) => {
      const d = DRUG_BY_CODE[i.drugCode];
      if (!d || d.maxDailyMg == null || d.strengthMg == null || i.compound) return null;
      const daily = i.signa.frequencyPerDay * i.signa.amountPerDose * d.strengthMg;
      const { maxDailyMg, formula } = pediatricMaxDaily(d.maxDailyMg, age, bb);
      const over = daily > maxDailyMg * 1.05;
      return { name: d.name, daily, maxDailyMg, formula, over };
    })
    .filter(Boolean) as {
    name: string;
    daily: number;
    maxDailyMg: number;
    formula: string;
    over: boolean;
  }[];
  if (rows.length === 0) return null;

  return (
    <div className="mt-2 border-t border-gray-300 p-1 text-[10px]">
      <div className="font-bold text-blue-800">
        🧮 Kalkulator DM Anak (usia {age} th{bb ? `, BB ${bb} kg` : ''})
      </div>
      {rows.map((r, i) => (
        <div key={i} className={r.over ? 'text-red-700' : 'text-gray-700'}>
          {r.name}: dosis {Math.round(r.daily)} mg/hari vs DM {Math.round(r.maxDailyMg)} mg
          {' '}({FORMULA_LABEL[r.formula as keyof typeof FORMULA_LABEL]}){' '}
          {r.over ? '⚠ MELEBIHI DM!' : '✓ aman'}
        </div>
      ))}
    </div>
  );
}
