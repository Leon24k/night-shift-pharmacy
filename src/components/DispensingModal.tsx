import { useState } from 'react';
import { useGame } from '@/store/gameStore';
import type { LabelColor } from '@/types';
import { playSfx } from '@/audio/sfx';

// Tahap dispensing: tempel etiket yang benar per obat.
// Putih = obat dalam (oral). Biru = obat luar (topikal/tetes/suppo).
export function DispensingModal() {
  const items = useGame((s) => s.dispenseItems);
  const finishDispensing = useGame((s) => s.finishDispensing);
  const [labels, setLabels] = useState<(LabelColor | null)[]>(
    () => items.map(() => null),
  );

  const allChosen = labels.every((l) => l !== null);

  function choose(idx: number, color: LabelColor) {
    playSfx('click');
    setLabels((prev) => {
      const next = [...prev];
      next[idx] = color;
      return next;
    });
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-lg border-2 border-cyan-600 bg-slate-900 p-5 text-gray-100 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-300">🏷️ Tempel Etiket</h3>
        <p className="mt-1 text-xs text-gray-400">
          Pilih warna etiket yang benar untuk tiap obat.
          <span className="ml-1 rounded bg-white px-1 text-black">PUTIH = obat dalam</span>{' '}
          <span className="rounded bg-blue-600 px-1 text-white">BIRU = obat luar</span>
        </p>

        <div className="mt-4 space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded bg-slate-800 px-3 py-2"
            >
              <span className="text-sm">{item.drugName}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => choose(idx, 'PUTIH')}
                  className={`rounded border px-3 py-1 text-xs ${
                    labels[idx] === 'PUTIH'
                      ? 'border-cyan-400 bg-white text-black'
                      : 'border-gray-600 bg-slate-700 text-gray-300'
                  }`}
                >
                  Putih
                </button>
                <button
                  onClick={() => choose(idx, 'BIRU')}
                  className={`rounded border px-3 py-1 text-xs ${
                    labels[idx] === 'BIRU'
                      ? 'border-cyan-400 bg-blue-600 text-white'
                      : 'border-gray-600 bg-slate-700 text-gray-300'
                  }`}
                >
                  Biru
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={!allChosen}
          onClick={() => finishDispensing(labels as LabelColor[])}
          className="win-btn mt-4 w-full py-2 text-sm disabled:opacity-40"
        >
          Serahkan Obat ▶
        </button>
      </div>
    </div>
  );
}
