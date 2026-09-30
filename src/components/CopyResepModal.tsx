import { useGame } from '@/store/gameStore';

// Saat stok kurang: pemain memutuskan membuat Salinan Resep (apograph p.c.c)
// untuk sisa obat yang belum diserahkan (ne det).
export function CopyResepModal() {
  const info = useGame((s) => s.stockShortInfo);
  const finishCopyResep = useGame((s) => s.finishCopyResep);
  if (!info) return null;

  const remainder = Math.max(0, info.requested - info.available);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-lg border-2 border-blue-500 bg-slate-900 p-5 text-gray-100 shadow-2xl">
        <h3 className="text-lg font-bold text-blue-300">🖋️ Stok Kurang — Salinan Resep?</h3>
        <p className="mt-2 text-sm text-gray-300">
          Stok <b>{info.drugName}</b> tidak mencukupi.
        </p>

        <div className="mt-3 rounded bg-slate-800 p-3 font-mono text-xs">
          <div>Diminta (No.): <b>{info.requested}</b></div>
          <div className="text-green-300">
            Tersedia / diserahkan (det): <b>{info.available}</b>
          </div>
          <div className="text-amber-300">
            Sisa belum diserahkan (ne det): <b>{remainder}</b>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Prosedur benar: serahkan yang tersedia lalu buat <b>Salinan Resep
          (apograph)</b> dengan tanda <b>p.c.c</b> untuk sisa <b>ne det</b>,
          agar pasien dapat menebus sisanya nanti.
        </p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => finishCopyResep(true)}
            className="win-btn flex-1 py-2 text-sm"
          >
            🔵 Buat Salinan Resep (p.c.c)
          </button>
          <button
            onClick={() => finishCopyResep(false)}
            className="win-btn flex-1 py-2 text-sm"
          >
            Serahkan tanpa salinan
          </button>
        </div>
      </div>
    </div>
  );
}
