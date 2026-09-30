import { useEffect, useState } from 'react';
import { useGame, GAME_CONSTANTS } from '@/store/gameStore';
import { SimApotek } from './SimApotek';
import { PrescriptionPaper } from './PrescriptionPaper';
import { PatientWindow } from './PatientWindow';
import { StampTray } from './StampTray';
import { FeedbackOverlay } from './FeedbackOverlay';
import { DispensingModal } from './DispensingModal';
import { MortarGame } from './MortarGame';
import { CopyResepModal } from './CopyResepModal';
import { rupiah } from '@/lib/format';
import { playSfx, toggleMute, isMuted, unlockAudio } from '@/audio/sfx';
import { SHIFT_MODIFIERS } from '@/game/shiftModifiers';

export function GameLayout() {
  const {
    phase,
    day,
    money,
    reputation,
    warnings,
    currentIndex,
    currentPatient,
    activeRules,
    modifier,
    decide,
    nextPatient,
  } = useGame();

  const [mutedState, setMutedState] = useState(isMuted());

  // buka AudioContext pada mount (dipicu oleh interaksi tombol "Buka Loket")
  useEffect(() => {
    unlockAudio();
  }, []);

  // SFX gesekan kertas saat pasien baru datang
  useEffect(() => {
    if (currentPatient) playSfx('paperSlide');
  }, [currentPatient?.id]);

  // keyboard: A=terima, D=tolak, Enter=lanjut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === 'PLAYING' && currentPatient) {
        if (e.key.toLowerCase() === 'a') decide('ACCEPT');
        else if (e.key.toLowerCase() === 'd') decide('REJECT');
      } else if (phase === 'FEEDBACK') {
        if (e.key === 'Enter') nextPatient();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, currentPatient, decide, nextPatient]);

  return (
    <div className="relative flex h-full w-full flex-col bg-night">
      {/* HUD atas: papan neon + status */}
      <div className="flex items-center justify-between border-b border-cyan-900/40 bg-slate-950 px-4 py-1 text-xs text-gray-300">
        <span className="neon font-bold text-cyan-300">APOTEK JAGA · SHIFT MALAM</span>
        {modifier !== 'NONE' && (
          <span className="rounded bg-purple-800 px-2 py-0.5 text-[10px] text-purple-100">
            ⚡ {SHIFT_MODIFIERS[modifier].title}
          </span>
        )}
        <div className="flex gap-4">
          <span>Hari <b className="text-cyan-200">{day}</b></span>
          <span>
            Pasien <b className="text-cyan-200">{Math.min(currentIndex + 1, GAME_CONSTANTS.PATIENTS_PER_SHIFT)}/{GAME_CONSTANTS.PATIENTS_PER_SHIFT}</b>
          </span>
          <span>Aturan: <b className="text-cyan-200">{activeRules.join(' ')}</b></span>
          <span>Kas: <b className="text-green-300">{rupiah(money)}</b></span>
          <span>Reputasi: <b className={reputation < 40 ? 'text-red-400' : 'text-green-300'}>{reputation}</b></span>
          <span>Peringatan: <b className={warnings > 0 ? 'text-amber-400' : 'text-gray-400'}>{warnings}</b></span>
          <button
            className="rounded border border-cyan-800 px-2 text-cyan-300 hover:bg-cyan-950"
            onClick={() => setMutedState(toggleMute())}
            title="Bisukan/nyalakan suara"
          >
            {mutedState ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* 3 viewport */}
      <div className="grid flex-1 grid-cols-1 gap-2 overflow-hidden p-2 md:grid-cols-[35%_40%_25%]">
        {/* KIRI: monitor SIM-Apotek */}
        <div className="min-h-0 overflow-hidden rounded border-4 border-slate-700 bg-black shadow-inner">
          <SimApotek patient={currentPatient} day={day} />
        </div>

        {/* TENGAH: meja + loket + resep + stempel */}
        <div className="flex min-h-0 flex-col gap-2">
          {currentPatient && <PatientWindow patient={currentPatient} />}
          <div className="relative flex-1 overflow-hidden rounded bg-gradient-to-b from-amber-950/30 to-slate-900">
            {currentPatient?.prescription ? (
              <PrescriptionPaper
                key={currentPatient.id}
                prescription={currentPatient.prescription}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-500">
                Pasien ini tidak menyerahkan resep fisik.
                <br />
                Periksa permintaannya di SIM-Apotek (F1).
              </div>
            )}
          </div>
          <div className="rounded bg-slate-950/60 py-2">
            <StampTray onStamp={decide} disabled={phase !== 'PLAYING'} />
          </div>
        </div>

        {/* KANAN: rak & dispensing (placeholder fase 2) */}
        <div className="min-h-0 overflow-auto rounded border border-slate-700 bg-slate-900/60 p-2 text-xs text-gray-400">
          <div className="mb-2 font-bold text-cyan-300">Rak & Dispensing</div>
          <div className="space-y-2">
            <div className="rounded bg-slate-800 p-2">
              🧴 Rak Blister Obat
              <div className="text-[10px] text-gray-500">(pengambilan otomatis di prototipe)</div>
            </div>
            <div className="rounded bg-slate-800 p-2">
              ⚗️ Mortir & Stamper
              <div className="text-[10px] text-gray-500">(racik puyer — fase 2)</div>
            </div>
            <div className="rounded bg-slate-800 p-2">
              🏷️ Dispenser Etiket
              <div className="mt-1 flex gap-1">
                <span className="rounded bg-white px-2 py-0.5 text-[10px] text-black">PUTIH · dalam</span>
                <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] text-white">BIRU · luar</span>
              </div>
            </div>
            <div className="rounded bg-slate-800 p-2">
              🔔 Bel Interkom
              <div className="text-[10px] text-gray-500">(substitusi generik — fase 2)</div>
            </div>
          </div>
        </div>
      </div>

      {phase === 'FEEDBACK' && <FeedbackOverlay />}
      {phase === 'COMPOUNDING' && <MortarGame />}
      {phase === 'COPY_RESEP' && <CopyResepModal />}
      {phase === 'DISPENSING' && <DispensingModal />}
    </div>
  );
}
