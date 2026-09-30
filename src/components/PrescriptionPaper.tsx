import { useRef, useState } from 'react';
import type { Prescription } from '@/types';

interface Props {
  prescription: Prescription;
}

// Kertas resep fisik: bisa di-drag (geser) & zoom, dengan gaya tulisan tangan.
export function PrescriptionPaper({ prescription: rx }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(
    null,
  );

  const noise = rx.handwritingNoise;
  // "cakar ayam": makin tinggi noise, makin miring & tidak rapi
  const skew = (noise - 0.5) * 8;

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setPos({
      x: drag.current.ox + (e.clientX - drag.current.startX),
      y: drag.current.oy + (e.clientY - drag.current.startY),
    });
  }
  function onPointerUp() {
    drag.current = null;
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* kontrol zoom */}
      <div className="absolute right-2 top-2 z-20 flex gap-1">
        <button
          className="win-btn"
          onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          aria-label="Perbesar"
        >
          🔍+
        </button>
        <button
          className="win-btn"
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          aria-label="Perkecil"
        >
          🔍−
        </button>
        <button
          className="win-btn"
          onClick={() => {
            setZoom(1);
            setPos({ x: 0, y: 0 });
          }}
          aria-label="Reset"
        >
          ↺
        </button>
      </div>

      <div
        className="cursor-grab touch-none select-none bg-paper text-black shadow-2xl active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
          width: 340,
          padding: 18,
          fontFamily: '"Comic Sans MS", "Segoe Print", cursive',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          backgroundImage:
            'repeating-linear-gradient(#f4ecd8, #f4ecd8 27px, #e6dcc3 28px)',
          lineHeight: '28px',
        }}
      >
        {/* Inscriptio */}
        <div className="border-b-2 border-black/60 pb-1" style={{ transform: `rotate(${skew * 0.1}deg)` }}>
          <div className="text-[15px] font-bold">{rx.doctorName}</div>
          <div className="text-[11px]">{rx.facility}</div>
          <div className="text-[11px]">SIP: {rx.doctorSip}</div>
          <div className="text-[11px]">Tanggal: {rx.dateWritten}</div>
        </div>

        {/* Invocatio + Ordinatio */}
        <div className="mt-2" style={{ transform: `skewX(${skew}deg)` }}>
          {(() => {
            const compounds = rx.items.filter((i) => i.compound);
            const singles = rx.items.filter((i) => !i.compound);
            return (
              <>
                {compounds.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[15px]">
                      <span className="mr-2 font-bold italic">R/</span>
                    </div>
                    {compounds.map((c, i) => (
                      <div key={i} className="pl-6 text-[14px]">
                        {c.drugName}
                      </div>
                    ))}
                    <div className="pl-6 text-[13px] italic">
                      m.f. pulv dtd No. {toRoman(compounds[0].pulvCount ?? compounds[0].quantity)}
                    </div>
                    <div className="pl-6 text-[13px] italic">
                      S 3 dd pulv 1 p.c.
                    </div>
                    <div className="pl-6 text-[13px]">
                      {rx.signed ? (
                        <span className="italic opacity-70">— paraf —</span>
                      ) : (
                        <span className="italic text-red-700/70">(tanpa paraf)</span>
                      )}
                    </div>
                  </div>
                )}
                {singles.map((item, i) => (
                  <div key={i} className="mb-3">
                    <div className="text-[15px]">
                      <span className="mr-2 font-bold italic">R/</span>
                      {item.drugName} No. {toRoman(item.quantity)}
                    </div>
                    <div className="pl-8 text-[13px] italic">
                      S {item.signa.raw.replace(/^s /, '')}
                    </div>
                    <div className="pl-8 text-[13px]">
                      {rx.signed ? (
                        <span className="italic opacity-70">— paraf —</span>
                      ) : (
                        <span className="italic text-red-700/70">(tanpa paraf)</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>

        {/* Pro */}
        <div className="mt-3 border-t-2 border-black/60 pt-1 text-[12px]">
          <div>
            <span className="font-bold">Pro:</span> {rx.patientName}
          </div>
          <div>
            Umur: {rx.patientAgeYears} th
            {rx.patientWeightKg != null && ` · BB: ${rx.patientWeightKg} kg`}
          </div>
        </div>
      </div>
    </div>
  );
}

function toRoman(n: number): string {
  const map: Array<[number, string]> = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  let rem = n;
  for (const [v, s] of map) {
    while (rem >= v) {
      out += s;
      rem -= v;
    }
  }
  return out || 'I';
}
