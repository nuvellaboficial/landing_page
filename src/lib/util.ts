/** Pure helpers shared by build-time templates and client scripts. */

export const clamp = (v: number, min = 0, max = 1): number => Math.max(min, Math.min(max, v));

/** Cubic ease-in-out. */
export const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Cubic ease-out. */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Colombian thousands separator: 2135000 → "2.135.000". */
export const formatCop = (n: number): string =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Decimal hour → "3:00 p. m." (12 h, Colombian format). */
export const formatHour = (h: number): string => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const suffix = hh >= 12 ? 'p. m.' : 'a. m.';
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
};

/** "Dra. Natalia Ortiz" → "NO". */
export const initials = (name: string): string =>
  name
    .replace(/^Dra?\.\s/, '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

/** Deterministic PRNG (mulberry32) so layouts are stable between renders. */
export const seededRandom = (seed: number) => (): number => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
