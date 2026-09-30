import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/store/gameStore';
import { playSfx } from '@/audio/sfx';

// Mini-game racik puyer: gerakkan kursor memutar di dalam mortir untuk
// menghaluskan tablet. Akumulasi sudut rotasi mengisi progress.
export function MortarGame() {
  const pulvTarget = useGame((s) => s.pulvTarget);
  const finishCompounding = useGame((s) => s.finishCompounding);

  const [progress, setProgress] = useState(0); // 0..100
  const areaRef = useRef<HTMLDivElement>(null);
  const lastAngle = useRef<number | null>(null);
  const accum = useRef(0);
  const grinding = useRef(false);
  const lastSfx = useRef(0);

  const done = progress >= 100;

  useEffect(() => {
    if (done) playSfx('bell');
  }, [done]);

  function angleFromCenter(e: React.PointerEvent): number {
    const el = areaRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  }

  function onMove(e: React.PointerEvent) {
    if (!grinding.current || done) return;
    const a = angleFromCenter(e);
    if (lastAngle.current !== null) {
      let d = a - lastAngle.current;
      // normalisasi lompatan sudut
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      accum.current += Math.abs(d);
      // butuh ~ (target/2 + 8) putaran penuh
      const needed = (Math.PI * 2) * (pulvTarget / 2 + 8);
      const pct = Math.min(100, (accum.current / needed) * 100);
      setProgress(pct);

      // SFX gesekan berkala
      const now = performance.now();
      if (now - lastSfx.current > 160) {
        playSfx('mortarGrind');
        lastSfx.current = now;
      }
    }
    lastAngle.current = a;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border-2 border-amber-600 bg-slate-900 p-5 text-center text-gray-100 shadow-2xl">
        <h3 className="text-lg font-bold text-amber-300">⚗️ Racik Puyer</h3>
        <p className="mt-1 text-xs text-gray-400">
          Resep racikan {pulvTarget} bungkus. Tekan & putar kursor memutar di
          dalam mortir untuk menghaluskan tablet.
        </p>

        <div
          ref={areaRef}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            grinding.current = true;
            lastAngle.current = null;
          }}
          onPointerUp={() => {
            grinding.current = false;
            lastAngle.current = null;
          }}
          onPointerMove={onMove}
          className="mx-auto mt-4 flex h-48 w-48 cursor-grab touch-none select-none items-center justify-center rounded-full active:cursor-grabbing"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, #e5e7eb 0%, #9ca3af 55%, #6b7280 100%)',
            boxShadow: 'inset 0 8px 24px rgba(0,0,0,0.5), 0 6px 16px rgba(0,0,0,0.6)',
          }}
        >
          {/* alu */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-3xl"
            style={{
              background:
                'radial-gradient(circle at 40% 30%, #f9fafb, #d1d5db 70%, #9ca3af)',
              transform: `rotate(${progress * 3.6}deg)`,
            }}
          >
            {done ? '✨' : '🥣'}
          </div>
        </div>

        {/* progress */}
        <div className="mx-auto mt-4 h-3 w-full overflow-hidden rounded bg-slate-700">
          <div
            className="h-full bg-amber-500 transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-400">
          Kehalusan: {Math.round(progress)}%
        </div>

        <button
          disabled={!done}
          onClick={finishCompounding}
          className="win-btn mt-4 w-full py-2 text-sm disabled:opacity-40"
        >
          {done ? 'Bungkus & Lanjut ▶' : 'Haluskan dulu...'}
        </button>
      </div>
    </div>
  );
}
