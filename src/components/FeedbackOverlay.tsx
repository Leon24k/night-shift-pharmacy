import { useGame } from '@/store/gameStore';
import { rupiah } from '@/lib/format';

// Overlay feedback edukatif setelah pemain stempel.
export function FeedbackOverlay() {
  const j = useGame((s) => s.lastJudgement);
  const nextPatient = useGame((s) => s.nextPatient);
  if (!j) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className={`w-full max-w-md rounded-lg border-2 p-5 shadow-2xl ${
          j.correct ? 'border-green-500 bg-green-950' : 'border-red-500 bg-red-950'
        }`}
      >
        <div className="flex items-center gap-2 text-lg font-bold">
          {j.correct ? (
            <span className="text-green-300">✓ Keputusan Tepat</span>
          ) : (
            <span className="text-red-300">✗ Keputusan Salah</span>
          )}
          {j.wasMysteryShopper && (
            <span className="ml-auto rounded bg-amber-600 px-2 py-0.5 text-xs text-black">
              SIDAK DINKES
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-gray-200">{j.reason}</p>

        <div className="mt-3 flex gap-4 text-sm">
          <span className={j.moneyDelta >= 0 ? 'text-green-300' : 'text-red-300'}>
            Kas: {rupiah(j.moneyDelta)}
          </span>
          <span className={j.reputationDelta >= 0 ? 'text-green-300' : 'text-red-300'}>
            Reputasi: {j.reputationDelta >= 0 ? '+' : ''}
            {j.reputationDelta}
          </span>
        </div>

        <button
          className="win-btn mt-4 w-full py-2 text-sm"
          onClick={nextPatient}
          autoFocus
        >
          Pasien Berikutnya ▶ (Enter)
        </button>
      </div>
    </div>
  );
}
