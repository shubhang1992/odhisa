// Shared finance utilities — single source of truth

export const MONTHLY_RATE = 0.10 / 12;
export const ANNUAL_RATE  = 0.10;

/** Future value of regular contributions */
export function calcFV(pmt, years) {
  const n = years * 12;
  return n > 0 ? pmt * ((Math.pow(1 + MONTHLY_RATE, n) - 1) / MONTHLY_RATE) : 0;
}

/** Format an INR amount to short form with prefix. Uses Indian grouping (Lakh/Crore). */
export function formatINR(n) {
  if (n == null || n <= 0) return '—';
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5)  return `₹${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3)  return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

/** Short form without currency prefix (Indian grouping). */
export function fmtShort(n) {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${Math.round(n)}`;
}

/** Slider ↔ amount conversions (log scale for better UX) */
export function sliderToAmt(v, min, max) {
  const lo = Math.log(min), hi = Math.log(max);
  return Math.round(Math.exp(lo + (v / 100) * (hi - lo)) / 1000) * 1000;
}
export function amtToSlider(a, min, max) {
  const lo = Math.log(min), hi = Math.log(max);
  return ((Math.log(Math.max(a, min)) - lo) / (hi - lo)) * 100;
}

/** Shared easing curve */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
