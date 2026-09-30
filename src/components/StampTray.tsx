import type { StampDecision } from '@/types';

interface Props {
  onStamp: (decision: StampDecision) => void;
  disabled?: boolean;
}

// Wadah stempel kayu fisik: HIJAU (terima) & MERAH (tolak).
export function StampTray({ onStamp, disabled }: Props) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        disabled={disabled}
        onClick={() => onStamp('ACCEPT')}
        className="group relative flex flex-col items-center disabled:opacity-40"
        title="Terima resep (tekan A)"
      >
        <div className="flex h-16 w-24 items-center justify-center rounded-sm border-4 border-green-900 bg-green-700 font-bold text-white shadow-lg transition-transform group-active:translate-y-1">
          TERIMA
        </div>
        <div className="mt-1 h-3 w-24 rounded-b bg-amber-900" />
        <span className="mt-1 text-[10px] text-gray-400">[A]</span>
      </button>

      <button
        disabled={disabled}
        onClick={() => onStamp('REJECT')}
        className="group relative flex flex-col items-center disabled:opacity-40"
        title="Tolak resep (tekan D)"
      >
        <div className="flex h-16 w-24 items-center justify-center rounded-sm border-4 border-red-950 bg-red-700 font-bold text-white shadow-lg transition-transform group-active:translate-y-1">
          TOLAK
        </div>
        <div className="mt-1 h-3 w-24 rounded-b bg-amber-900" />
        <span className="mt-1 text-[10px] text-gray-400">[D]</span>
      </button>
    </div>
  );
}
