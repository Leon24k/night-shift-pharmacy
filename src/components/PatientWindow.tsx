import type { Patient } from '@/types';

interface Props {
  patient: Patient;
}

// Siluet pasien di balik kaca akrilik bergores + bubble keluhan (teredam).
export function PatientWindow({ patient }: Props) {
  return (
    <div className="relative overflow-hidden rounded-md border border-cyan-900/40 bg-gradient-to-b from-slate-800 to-slate-900 p-3">
      {/* efek gores kaca */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, transparent, transparent 22px, rgba(255,255,255,0.15) 23px, transparent 24px)',
        }}
      />
      <div className="relative flex items-center gap-3">
        {/* siluet */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-700 text-2xl">
          🧑
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-cyan-200">
            {patient.displayName}
          </div>
          <div className="mt-1 rounded bg-slate-950/60 px-2 py-1 text-xs italic text-gray-300">
            “{patient.spokenComplaint}”
          </div>
          {patient.spokenRequest && (
            <div className="mt-1 rounded bg-amber-950/50 px-2 py-1 text-xs italic text-amber-200">
              “{patient.spokenRequest}”
            </div>
          )}
        </div>
      </div>
      <div className="relative mt-2 text-center text-[10px] uppercase tracking-widest text-cyan-700">
        · suara teredam kaca akrilik ·
      </div>
    </div>
  );
}
