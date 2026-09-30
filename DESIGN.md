# Apotek Jaga: Shift Malam — Design Document (Revisi v2)

> Sim verifikasi & dispensing resep, first-person, 100% client-side.
> Tone: **edukatif**. Target: **orang farmasi (utama)**, ramah publik via onboarding.
> Akurasi farmasi dijaga, tapi disederhanakan agar tetap fun & bisa dipelajari.

---

## 1. Pilar Desain (yang memandu semua keputusan)

1. **Kamu penjaga gerbang keselamatan pasien.** Inti game = keputusan di bawah tekanan, bukan sekadar stempel.
2. **Diegetic & immersive.** Info ada di dunia game (jam dinding, laci kasir, tumpukan dokumen), minim HUD melayang.
3. **Edukatif tanpa menggurui.** Pemain belajar aturan farmasi riil lewat konsekuensi, bukan textbook. Setiap kesalahan menjelaskan aturan yang dilanggar.
4. **Berjenjang.** Kompleksitas naik per hari (pola Papers, Please). Hari 1 sederhana; racik/copy resep/OWA unlock bertahap.
5. **Otentik tapi ramah.** Istilah farmasi riil, tapi ada tooltip/onboarding untuk publik.

---

## 2. Perubahan dari Brief Awal (changelog)

| Area | Brief awal | Revisi | Alasan |
|---|---|---|---|
| Verifikasi dokter | "SIP cocok dengan database IDI" | **SIP dari Dinkes + format nomor valid**; deteksi palsu via format salah, tanggal kadaluarsa, alamat kop tak konsisten | SIP dikeluarkan Dinkes, bukan IDI. Lebih akurat. |
| Copy resep | Hanya karena "stok kurang" | Tambah konsep **`det` / `ne det`** (sudah/belum diserahkan) + istilah **apograph** & stempel **p.c.c** | Sesuai praktik riil; edukatif. |
| DM anak | "Rumus Young/Dilling" (ambigu) | **Young** (umur, <8 th), **Dilling** (umur, 8–20 th), **Clark** (berat badan). Pemain pilih rumus sesuai kasus | Akurasi + jadi mekanik verifikasi. |
| Golongan obat | Bebas, Keras, Narkotika, Psikotropika | Tambah **Bebas Terbatas** & **OWA (Obat Wajib Apotek)** | Realistis; OWA jadi mekanik "abu-abu" menarik. |
| Interaksi obat | Contoh lemah (Amox+Dexa) | Pasangan **kontraindikasi mayor** (Sildenafil+Nitrat, Warfarin+Aspirin, Tramadol+SSRI, dll) | Edukatif & benar secara klinis. |
| Mati lampu | Ada | **DIBUANG** | Mekanik "hitung manual" = chore, bukan fun. |
| Racik puyer | Core | **Unlock fase 2** (bukan MVP) | Berat; bukan inti loop verifikasi. |
| Kakek pelupa (match visual) | Core arketipe | **Fase 2 / disederhanakan** jadi verifikasi copy resep lecek | Beda genre (visual matching), scope creep. |
| Struktur waktu | "Shift" saja | **Hari** = shift + fase ending (kasir, bayar tagihan, koran pagi umumkan aturan baru) | Progresi + cara elegan introduce aturan. |
| Konsekuensi | Audit di akhir → langsung Game Over | **Sistem surat peringatan** bertingkat | Adil & mengajar. |
| Taruhan | Tidak ada | **Ekonomi personal** (gaji vs denda, tagihan) | Bikin dilema terasa. |

---

## 3. Core Loop (disederhanakan untuk sesi ~5 menit)

```
[Pasien datang ke loket]
        │
        ▼
[Dengar keluhan (audio teredam) + terima resep fisik]
        │
        ▼
[Periksa resep: drag/zoom]  ◄──► [Buka MIMS / SIM-Apotek untuk cek]
        │
        ▼
[Verifikasi terhadap checklist aturan hari ini]
        │
        ├─ Valid   → [Stempel HIJAU] → serahkan → +uang, +reputasi
        ├─ Invalid → [Stempel MERAH] → tolak/edukasi → +reputasi (bila benar)
        └─ Sebagian→ [Stempel BIRU / copy resep] (fase 2)
        │
        ▼
[Pasien berikutnya...]  (3–6 pasien per shift)
        │
        ▼
[AKHIR SHIFT: rekap, audit, gaji − denda − tagihan, koran besok]
```

**Anti scope creep:** satu pasien MVP idealnya selesai 30–60 detik. Kompleksitas datang dari *variasi perangkap*, bukan dari banyaknya langkah.

---

## 4. Aturan Verifikasi (checklist inti, di-unlock berjenjang)

| # | Aturan | Unlock hari | Cara cek |
|---|---|---|---|
| R1 | Kelengkapan resep (nama dokter, SIP, tanggal, pasien, R/, signa, paraf) | 1 | Visual pada resep |
| R2 | Golongan obat vs kebutuhan resep (obat Keras/Psiko/Narko WAJIB pakai resep) | 1 | Cek golongan di SIM-Apotek |
| R3 | Validitas dokter (SIP format benar, terdaftar, belum kadaluarsa) | 2 | Lookup di SIM-Apotek (F4) |
| R4 | Kecocokan keluhan lisan vs isi resep | 2 | Dengar audio + baca resep |
| R5 | Dosis Maksimum (DM) — khusus anak (Young/Dilling/Clark) | 3 | Kalkulator + tabel MIMS |
| R6 | Interaksi obat mayor antar item resep | 3 | Alert box SIM-Apotek |
| R7 | Etiket benar: Putih (dalam) vs Biru (luar) | 3 | Pilih dispenser |
| R8 | OWA: boleh tanpa resep tapi batas jumlah | 4 | Tabel OWA |
| R9 | Copy resep: det/ne det bila stok kurang / tebus sebagian | 4 | Stempel biru + tulis salinan |

Onboarding (hari 0 / tutorial): jelaskan R1 & R2 dengan panduan langkah.

---

## 5. Arketipe Pasien (prosedural)

- **Ibu Panik** — anak demam, maksa antibiotik keras tanpa resep. Benar: tolak, tawarkan OTC penurun panas / edukasi. (Uji R2, godaan ekonomi.)
- **Calo OOT** — resep Tramadol/Alprazolam/Codein dengan kop mencurigakan, SIP kadaluarsa/format salah, paraf beda. Benar: tolak. (Uji R1, R3.)
- **Pasien Kronis (Prolanis)** — resep rutin 4–5 obat valid; stok kadang kurang → copy resep. (Uji R5/R6, fase 2 copy.)
- **Pasien Biasa** — resep valid lurus. Kontrol positif (jangan paranoid nolak semua).
- **Mystery Shopper (Sidak Dinkes)** — pasien tersamar; kalau kamu loloskan pelanggaran = denda berat. Muncul acak.
- **(Fase 2) Kakek + Copy Resep Lecek** — verifikasi dari salinan resep lama.

Setiap arketipe = template + parameter acak (nama, obat, dokter, signa, jenis perangkap) → replayability.

---

## 6. Dynamic Shift Modifiers (revisi)

- ✅ **Sidak Dinkes/BPOM** (mystery shopper) — tetap.
- ✅ **Stok menipis** — tawarkan substitusi generik (zat aktif sama) via interkom.
- ✅ **Resep cakar ayam** — tulisan terdistorsi terkontrol; waspada LASA (Asam Mefenamat vs Traneksamat).
- ❌ **Mati lampu** — dibuang.
- 🔒 **Racik puyer** — fase 2.

---

## 7. Sistem Meta (Hari)

1. **Pagi:** koran/pengumuman → aturan baru hari ini (mis. "BPOM perketat obat batuk dextromethorphan").
2. **Shift:** 3–6 pasien.
3. **Ending:** rekap benar/salah, surat peringatan (bila ada), audit, uang = gaji − denda − tagihan.
4. **Kalah:** reputasi/uang habis, atau lolos pelanggaran fatal saat sidak → apotek disegel.

Ekonomi: tiap shift ada tagihan (cicilan/SIPA/keluarga). Salah dispensing = potong. Ini sumber dilema.

---

## 8. Golongan Obat (referensi cepat)

| Golongan | Logo | Resep? | Catatan |
|---|---|---|---|
| Bebas | Hijau | Tidak | Paracetamol, dll |
| Bebas Terbatas | Biru | Tidak (tanda P1–P6) | CTM, beberapa obat batuk |
| Keras | Merah "K" | Ya | Antibiotik, Dexamethasone |
| OWA | (Keras) | Tidak, oleh apoteker, batas jumlah | Pil KB, beberapa topikal, dll |
| Psikotropika | Merah "K" | Ya (ketat) | Alprazolam |
| Narkotika | Palang merah | Ya (resep asli, ketat) | Codein, Morfin |

## 9. Interaksi Obat Mayor (untuk alert box)

- Sildenafil + Nitrat (ISDN) → hipotensi berat
- Warfarin + Aspirin/NSAID → risiko perdarahan
- Tramadol + SSRI → serotonin syndrome
- Simvastatin + Gemfibrozil → rhabdomyolysis
- MAOI + simpatomimetik → krisis hipertensi
- (daftar final di formulary/interactions.json)

## 10. DM Anak — Rumus

- **Young** (umur, <8 th): `(n/(n+12)) × dosis dewasa`
- **Dilling** (umur, 8–20 th): `(n/20) × dosis dewasa`
- **Clark** (berat badan): `(BB/70) × dosis dewasa`

---

## 11. MVP Scope (fase 1) vs Fase 2

**MVP (fase 1) — target playable & terasa lengkap:**
- Loop verifikasi (R1–R4, R7 dasar)
- GUI SIM-Apotek retro (grid obat, lookup SIP, alert interaksi)
- Generator resep prosedural + perangkap
- Sistem hari + aturan berjenjang + surat peringatan
- Ending shift + audit + ekonomi sederhana
- Onboarding/tutorial hari 0

**Fase 2:**
- Racik puyer taktil (mortir, kertas perkamen)
- Copy resep det/ne det
- OWA lanjutan, substitusi generik interkom
- Kakek pelupa, LASA extreme, cakar ayam ekstrem
- Migrasi visual meja penuh ke Pixi.js (kaca akrilik shader, dll)

---

## 12. Tech Stack (final)

- **Framework:** React + TypeScript + Vite
- **Rendering:** Hybrid — DOM/Tailwind untuk GUI SIM-Apotek (WinForm retro) & dokumen; Pixi.js untuk viewport meja/kaca (fase lanjut). MVP boleh mulai DOM-first agar cepat playable, Pixi menyusul.
- **State:** Zustand
- **Audio:** Howler.js (low-pass filter suara pasien, SFX stempel/kertas)
- **Deploy:** Vercel static SPA, bundle ≤15MB (SVG/WebP)
- **Zero backend, zero AI, offline-capable.**

> Catatan kompatibilitas: verifikasi versi `@pixi/react` vs React 19 sebelum commit. Bila bentrok: Pixi vanilla via ref, atau React 18.

---

## 13. Data Schema (src/data/)

- `formulary.json` — 60+ obat: kode, nama, zat aktif, sediaan, kekuatan, golongan, DM harian, harga, flag LASA, kategori terapi.
- `doctor_registry.json` — dokter: nama, nomor SIP, format, spesialisasi, faskes, status (valid/kadaluarsa/palsu).
- `latin_dictionary.json` — singkatan signa Latin + arti (untuk validasi etiket & tooltip onboarding).
- `interactions.json` — pasangan interaksi mayor + tingkat keparahan + catatan klinis.
- `owa_list.json` — daftar OWA + batas jumlah (fase 2).
- `archetypes.json` / generator config — template pasien & perangkap.

---

## 14. Rencana Sprint (revisi)

- **Sprint 1:** Scaffold (Vite+React+TS+Tailwind+Zustand), data schema, layout 3-viewport (DOM), render resep + drag/zoom.
- **Sprint 2:** GUI SIM-Apotek retro (grid, lookup SIP, alert interaksi), input keyboard F1–F4.
- **Sprint 3:** Generator resep prosedural + engine verifikasi (R1–R4) + stempel terima/tolak.
- **Sprint 4:** Sistem hari + aturan berjenjang + surat peringatan + ending/audit + ekonomi + onboarding.
- **Sprint 5:** Audio (Howler low-pass + SFX), polish, deploy Vercel.
- **Fase 2:** Pixi.js viewport, racik puyer, copy resep, OWA, arketipe lanjutan.
```
