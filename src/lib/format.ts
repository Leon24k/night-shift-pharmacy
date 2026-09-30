export function rupiah(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(Math.round(n));
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}
