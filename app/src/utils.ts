export const TOTAL_KEY = "__total__" as const

export interface VisaEntry {
  total?: number
  [key: string]: number | undefined
}

export function formatPeriod(isoStr: string, locale: string): string {
  const [y, m] = isoStr.split("-").map(Number)
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(y, m - 1))
}

export function getValue(entry: VisaEntry | null | undefined, visaType: string): number {
  if (!entry) return 0
  return visaType === TOTAL_KEY ? (entry.total || 0) : (entry[visaType] || 0)
}

export function sumPeriod(periodData: Record<string, VisaEntry>, visaType: string): number {
  return Object.values(periodData).reduce((sum, entry) => sum + getValue(entry, visaType), 0)
}

/** Max value for a visa type across every period — fixes the color domain over time. */
export function maxAcrossPeriods(
  data: Record<string, Record<string, VisaEntry>>,
  visaType: string
): number {
  let max = 0
  for (const periodData of Object.values(data)) {
    for (const entry of Object.values(periodData)) {
      const v = getValue(entry, visaType)
      if (v > max) max = v
    }
  }
  return Math.max(1, max)
}

/** Snap a value to the nearest 1/2/5 × 10^n step, measured in log space. */
function snap125(v: number): number {
  const n = Math.floor(Math.log10(v))
  const candidates = [1, 2, 5, 10].map(m => m * 10 ** n)
  return candidates.reduce((best, c) =>
    Math.abs(Math.log10(c) - Math.log10(v)) < Math.abs(Math.log10(best) - Math.log10(v)) ? c : best
  )
}

/**
 * Log-spaced class thresholds for a binned choropleth scale, snapped to
 * round 1/2/5 numbers. Returns up to `bins - 1` ascending unique values < max.
 */
export function niceLogBreaks(max: number, bins = 6): number[] {
  if (max <= 1) return []
  const step = Math.log10(max) / bins
  const breaks = new Set<number>()
  for (let i = 1; i < bins; i++) {
    const snapped = snap125(10 ** (step * i))
    if (snapped < max) breaks.add(snapped)
  }
  return [...breaks].sort((a, b) => a - b)
}

/** Compact count label: 900 → "900", 1500 → "1.5k", 2000000 → "2M". */
export function formatCount(n: number): string {
  const trim = (x: number) => String(Math.round(x * 10) / 10)
  if (n >= 1e6) return trim(n / 1e6) + "M"
  if (n >= 1e3) return trim(n / 1e3) + "k"
  return String(n)
}
