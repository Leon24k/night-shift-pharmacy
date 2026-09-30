// Kamus singkatan Latin untuk signatura (aturan pakai) + tooltip onboarding.
export interface LatinEntry {
  abbr: string;
  latin: string;
  meaning: string;
}

export const LATIN_DICTIONARY: LatinEntry[] = [
  { abbr: 'S', latin: 'signa', meaning: 'tandai / aturan pakai' },
  { abbr: 'dd', latin: 'de die', meaning: 'sehari (per hari)' },
  { abbr: '1 dd', latin: 'semel de die', meaning: '1x sehari' },
  { abbr: '2 dd', latin: 'bis de die', meaning: '2x sehari' },
  { abbr: '3 dd', latin: 'ter de die', meaning: '3x sehari' },
  { abbr: 'tab', latin: 'tabella', meaning: 'tablet' },
  { abbr: 'cth', latin: 'cochlear theae', meaning: 'sendok teh (5 ml)' },
  { abbr: 'C', latin: 'cochlear', meaning: 'sendok makan (15 ml)' },
  { abbr: 'gtt', latin: 'guttae', meaning: 'tetes' },
  { abbr: 'p.c.', latin: 'post coenam', meaning: 'sesudah makan' },
  { abbr: 'a.c.', latin: 'ante coenam', meaning: 'sebelum makan' },
  { abbr: 'd.c.', latin: 'durante coenam', meaning: 'saat makan' },
  { abbr: 'p.r.n.', latin: 'pro re nata', meaning: 'jika perlu' },
  { abbr: 'u.e.', latin: 'usus externus', meaning: 'obat luar (pemakaian luar)' },
  { abbr: 'u.c.', latin: 'usus cognitus', meaning: 'aturan pakai sudah diketahui' },
  { abbr: 'febr.', latin: 'febris', meaning: 'saat demam' },
  { abbr: 'No.', latin: 'numero', meaning: 'sebanyak (jumlah)' },
  { abbr: 'R/', latin: 'recipe', meaning: 'ambillah' },
  { abbr: 'm.f.', latin: 'misce fac', meaning: 'campur dan buatlah' },
  { abbr: 'pulv', latin: 'pulveres', meaning: 'serbuk / puyer' },
  { abbr: 'dtd', latin: 'da tales doses', meaning: 'berikan sekian takaran' },
];

export const LATIN_BY_ABBR: Record<string, LatinEntry> = Object.fromEntries(
  LATIN_DICTIONARY.map((e) => [e.abbr.toLowerCase(), e]),
);
