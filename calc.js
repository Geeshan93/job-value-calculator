// Pure job-value calculation. No DOM, no side effects.
// GST is fixed at 10% of base. Tax is taxPercent% of base. Both additive.
// Returns full-precision numbers; rounding/formatting is the caller's responsibility.
export const GST_RATE = 0.10;

export function computeJobValue(base, taxPercent) {
  const b = Math.max(0, Number.isFinite(base) ? base : 0);
  const t = Math.max(0, Number.isFinite(taxPercent) ? taxPercent : 0);
  const gst = b * GST_RATE;
  const tax = b * (t / 100);
  const final = b + gst + tax;
  return { base: b, gst, tax, final };
}
