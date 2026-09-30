import { useGame, GAME_CONSTANTS } from '@/store/gameStore';
import { NEW_RULE_ANNOUNCEMENT } from '@/game/dayRules';
import { rollShiftModifier, SHIFT_MODIFIERS } from '@/game/shiftModifiers';
import { makeRng } from '@/game/rng';
import { rupiah } from '@/lib/format';
import { LATIN_DICTIONARY } from '@/data/latinDictionary';

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-night p-6">
      <div className="max-h-full w-full max-w-2xl overflow-auto rounded-lg border border-cyan-900/40 bg-slate-900/90 p-6 text-gray-100 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function TitleScreen() {
  const startGame = useGame((s) => s.startGame);
  return (
    <Panel>
      <div className="text-center">
        <div className="neon text-3xl font-bold text-cyan-300">APOTEK JAGA</div>
        <div className="text-xl tracking-[0.4em] text-cyan-500">SHIFT MALAM</div>
        <p className="mx-auto mt-4 max-w-md text-sm text-gray-400">
          Simulasi verifikasi & dispensing resep. Kamu apoteker jaga malam.
          Periksa resep, tolak yang bermasalah, layani yang sah. Jaga
          keselamatan pasien — dan izin apotekmu.
        </p>
        <button className="win-btn mt-6 px-6 py-2 text-sm" onClick={startGame}>
          ▶ MULAI SHIFT
        </button>
        <div className="mt-3 text-[10px] text-gray-600">
          Prototipe edukatif · 100% client-side
        </div>
      </div>
    </Panel>
  );
}

export function OnboardingScreen() {
  const setPhase = useGame((s) => s.setPhase);
  return (
    <Panel>
      <h2 className="mb-3 text-lg font-bold text-cyan-300">Panduan Singkat</h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-300">
        <li>Pasien datang ke <b>loket kaca</b> dan menyerahkan resep (tengah). Kamu bisa geser & zoom kertasnya.</li>
        <li>Gunakan <b>SIM-Apotek</b> (kiri) untuk cek golongan obat, stok, dan keaslian SIP dokter. Shortcut <b>F1–F4</b>.</li>
        <li>Obat golongan <b>Keras, Psikotropika, Narkotika</b> WAJIB pakai resep sah. <b>Bebas & Bebas Terbatas</b> boleh tanpa resep.</li>
        <li>Ambil keputusan dengan stempel <b>TERIMA</b> (A) atau <b>TOLAK</b> (D).</li>
        <li>Aturan baru bertambah tiap hari. Salah = surat peringatan, reputasi & uang turun. Awas <b>sidak Dinkes</b>!</li>
      </ol>

      <h3 className="mb-1 mt-4 text-sm font-bold text-cyan-400">Kamus Latin (signa)</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-400 md:grid-cols-3">
        {LATIN_DICTIONARY.slice(0, 12).map((e) => (
          <div key={e.abbr}>
            <b className="text-gray-200">{e.abbr}</b> = {e.meaning}
          </div>
        ))}
      </div>

      <button
        className="win-btn mt-5 px-6 py-2 text-sm"
        onClick={() => setPhase('SHIFT_INTRO')}
      >
        Mengerti, lanjut ▶
      </button>
    </Panel>
  );
}

export function ShiftIntroScreen() {
  const day = useGame((s) => s.day);
  const beginShift = useGame((s) => s.beginShift);
  const announcement = NEW_RULE_ANNOUNCEMENT[day];
  const modifier = rollShiftModifier(day, makeRng((day * 7919 + 13) >>> 0));
  const modInfo = SHIFT_MODIFIERS[modifier];
  return (
    <Panel>
      <div className="border-b-2 border-gray-600 pb-2 text-center">
        <div className="text-[10px] uppercase tracking-widest text-gray-500">
          Koran Pagi · Hari ke-{day}
        </div>
        <div className="font-serif text-2xl font-bold text-gray-100">
          KABAR APOTEK
        </div>
      </div>
      {announcement && (
        <div className="mt-4">
          <div className="font-serif text-lg font-bold text-amber-300">
            {announcement.headline}
          </div>
          <p className="mt-2 text-sm text-gray-300">{announcement.short}</p>
          <div className="mt-2 inline-block rounded bg-amber-900/40 px-2 py-0.5 text-xs text-amber-200">
            Aturan aktif hari ini: {announcement.rule}
          </div>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
        Target: layani {GAME_CONSTANTS.PATIENTS_PER_SHIFT} pasien. Tagihan harian{' '}
        {rupiah(GAME_CONSTANTS.DAILY_BILL)} dipotong di akhir shift.
      </div>
      {modifier !== 'NONE' && (
        <div className="mt-3 rounded border border-purple-700 bg-purple-950/40 p-3">
          <div className="text-sm font-bold text-purple-300">
            ⚡ Kejadian Malam Ini: {modInfo.title}
          </div>
          <p className="mt-1 text-xs text-gray-300">{modInfo.desc}</p>
        </div>
      )}
      <button className="win-btn mt-5 px-6 py-2 text-sm" onClick={beginShift}>
        Buka Loket ▶
      </button>
    </Panel>
  );
}

export function ShiftSummaryScreen() {
  const { judgements, money, reputation, day, nextDay } = useGame();
  const correct = judgements.filter((j) => j.correct).length;
  const total = judgements.length;
  return (
    <Panel>
      <h2 className="text-lg font-bold text-cyan-300">Rekap Shift · Hari ke-{day}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <Stat label="Benar" value={`${correct}/${total}`} />
        <Stat label="Kas" value={rupiah(money)} />
        <Stat label="Reputasi" value={`${reputation}/100`} />
      </div>
      <div className="mt-4 space-y-1 text-xs">
        {judgements.map((j, i) => (
          <div
            key={i}
            className={`rounded px-2 py-1 ${j.correct ? 'bg-green-950/50 text-green-300' : 'bg-red-950/50 text-red-300'}`}
          >
            Pasien {i + 1}: {j.decision === 'ACCEPT' ? 'DITERIMA' : 'DITOLAK'} —{' '}
            {j.correct ? '✓ benar' : '✗ salah'} ({rupiah(j.moneyDelta)})
          </div>
        ))}
      </div>
      <button className="win-btn mt-5 px-6 py-2 text-sm" onClick={nextDay}>
        {day >= GAME_CONSTANTS.MAX_DAY ? 'Lihat Hasil Akhir ▶' : 'Lanjut ke Hari Berikutnya ▶'}
      </button>
    </Panel>
  );
}

export function GameOverScreen() {
  const { reputation, money, day, resetGame } = useGame();
  const tamat = day >= GAME_CONSTANTS.MAX_DAY && reputation > 0 && money >= 0;
  return (
    <Panel>
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${tamat ? 'text-cyan-300' : 'text-red-400'}`}>
          {tamat ? '🎉 Shift Terakhir Selesai!' : '🚫 Apotek Ditutup'}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-300">
          {tamat
            ? `Kamu berhasil melewati ${GAME_CONSTANTS.MAX_DAY} hari sebagai apoteker jaga malam. Keselamatan pasien terjaga.`
            : reputation <= 0
              ? 'Reputasi apotek habis akibat kesalahan dispensing berulang / lolos sidak. Izin dicabut.'
              : 'Kas apotek minus. Tidak sanggup membayar tagihan.'}
        </p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <Stat label="Kas Akhir" value={rupiah(money)} />
          <Stat label="Reputasi" value={`${reputation}/100`} />
        </div>
        <button className="win-btn mt-6 px-6 py-2 text-sm" onClick={resetGame}>
          ↺ Main Lagi
        </button>
      </div>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-slate-800 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="font-bold text-gray-100">{value}</div>
    </div>
  );
}
