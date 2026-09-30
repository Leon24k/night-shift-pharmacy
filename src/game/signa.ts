import type { Route, Signa } from '@/types';

const FREQ_WORD: Record<number, string> = {
  1: 's 1 dd',
  2: 's 2 dd',
  3: 's 3 dd',
  4: 's 4 dd',
};

// Bangun string signa Latin + terjemahan Indonesia.
export function buildSigna(opts: {
  frequencyPerDay: number;
  amountPerDose: number;
  route: Route;
  unit?: 'tab' | 'cth' | 'C' | 'gtt';
  timing?: 'p.c.' | 'a.c.' | '';
  prn?: boolean;
}): Signa {
  const { frequencyPerDay, amountPerDose, route } = opts;
  const unit = opts.unit ?? (route === 'LUAR' ? '' : 'tab');
  const timing = opts.timing ?? '';
  const prn = opts.prn ?? false;

  let raw = FREQ_WORD[frequencyPerDay] ?? `s ${frequencyPerDay} dd`;
  if (unit) raw += ` ${unit} ${amountPerDose}`;
  if (route === 'LUAR') raw += ' u.e.';
  if (timing) raw += ` ${timing}`;
  if (prn) raw += ' p.r.n.';

  // terjemahan
  const unitWord =
    unit === 'tab'
      ? 'tablet'
      : unit === 'cth'
        ? 'sendok teh'
        : unit === 'C'
          ? 'sendok makan'
          : unit === 'gtt'
            ? 'tetes'
            : '';
  const timingWord =
    timing === 'p.c.'
      ? ' sesudah makan'
      : timing === 'a.c.'
        ? ' sebelum makan'
        : '';
  const routeWord = route === 'LUAR' ? ' (obat luar)' : '';
  const prnWord = prn ? ' jika perlu' : '';

  const meaning =
    `${frequencyPerDay}x sehari` +
    (unitWord ? ` ${amountPerDose} ${unitWord}` : '') +
    `${routeWord}${timingWord}${prnWord}`;

  return {
    raw,
    frequencyPerDay,
    amountPerDose,
    route,
    meaning: meaning.trim(),
  };
}
