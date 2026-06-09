import { describe, it, expect } from "vitest"
import {
  formatPeriod,
  getValue,
  sumPeriod,
  maxAcrossPeriods,
  niceLogBreaks,
  formatCount,
  TOTAL_KEY,
} from "./utils"

describe("formatPeriod", () => {
  it("formats a mid-year period in English", () => {
    expect(formatPeriod("2025-06", "en")).toBe("June 2025")
  })

  it("formats the earliest period in English", () => {
    expect(formatPeriod("2012-12", "en")).toBe("December 2012")
  })

  it("formats in Japanese — contains year and month number", () => {
    const result = formatPeriod("2025-06", "ja")
    expect(result).toContain("2025")
    expect(result).toContain("6")
  })

  it("formats January correctly (month index 0)", () => {
    expect(formatPeriod("2020-01", "en")).toBe("January 2020")
  })
})

describe("getValue", () => {
  it("returns total when visaType is TOTAL_KEY", () => {
    expect(getValue({ total: 900738, 留学: 140164 }, TOTAL_KEY)).toBe(900738)
  })

  it("returns specific visa count for a named visa type", () => {
    expect(getValue({ total: 900738, 留学: 140164 }, "留学")).toBe(140164)
  })

  it("returns 0 for a null entry", () => {
    expect(getValue(null, TOTAL_KEY)).toBe(0)
  })

  it("returns 0 for an undefined entry", () => {
    expect(getValue(undefined, TOTAL_KEY)).toBe(0)
  })

  it("returns 0 when the requested visa key is absent", () => {
    expect(getValue({ total: 500 }, "留学")).toBe(0)
  })

  it("returns 0 when total is absent and TOTAL_KEY is requested", () => {
    expect(getValue({ 留学: 100 }, TOTAL_KEY)).toBe(0)
  })

  it("TOTAL_KEY sentinel is the expected string", () => {
    expect(TOTAL_KEY).toBe("__total__")
  })
})

describe("sumPeriod", () => {
  it("sums entry totals across all countries when TOTAL_KEY is selected", () => {
    const periodData = {
      CN: { total: 900738, 留学: 140164 },
      VN: { total: 660483, 留学: 50000 },
    }
    expect(sumPeriod(periodData, TOTAL_KEY)).toBe(1_561_221)
  })

  it("sums a named visa type across all countries", () => {
    const periodData = {
      CN: { total: 900738, 留学: 140164 },
      VN: { total: 660483, 留学: 50000 },
    }
    expect(sumPeriod(periodData, "留学")).toBe(190_164)
  })

  it("returns 0 for an empty period", () => {
    expect(sumPeriod({}, TOTAL_KEY)).toBe(0)
  })

  it("treats a missing visa key as 0 and does not throw", () => {
    const periodData = {
      CN: { total: 900738 },
      VN: { total: 660483, 留学: 50000 },
    }
    expect(sumPeriod(periodData, "留学")).toBe(50_000)
  })
})

describe("maxAcrossPeriods", () => {
  const data = {
    "2024-12": { CN: { total: 800000, 留学: 120000 }, VN: { total: 600000, 留学: 40000 } },
    "2025-06": { CN: { total: 900738, 留学: 140164 }, VN: { total: 660483, 留学: 50000 } },
  }

  it("returns the largest total across every period, not just the latest", () => {
    expect(maxAcrossPeriods(data, TOTAL_KEY)).toBe(900738)
  })

  it("returns the largest value for a named visa type", () => {
    expect(maxAcrossPeriods(data, "留学")).toBe(140164)
  })

  it("returns at least 1 for empty data", () => {
    expect(maxAcrossPeriods({}, TOTAL_KEY)).toBe(1)
  })
})

describe("niceLogBreaks", () => {
  it("produces round log-spaced thresholds for a large max", () => {
    expect(niceLogBreaks(900738, 6)).toEqual([10, 100, 1000, 10000, 100000])
  })

  it("returns ascending unique values below max", () => {
    const breaks = niceLogBreaks(48211, 6)
    expect(breaks).toEqual([...new Set(breaks)].sort((a, b) => a - b))
    expect(breaks.every(b => b < 48211)).toBe(true)
  })

  it("snaps every threshold to a 1/2/5 mantissa", () => {
    for (const b of niceLogBreaks(73067, 6)) {
      const mantissa = b / 10 ** Math.floor(Math.log10(b))
      expect([1, 2, 5]).toContain(mantissa)
    }
  })

  it("returns an empty array when max is 1 or less", () => {
    expect(niceLogBreaks(1)).toEqual([])
    expect(niceLogBreaks(0)).toEqual([])
  })

  it("handles a small max without collapsing to nothing", () => {
    const breaks = niceLogBreaks(50, 6)
    expect(breaks.length).toBeGreaterThan(1)
    expect(breaks.every(b => b < 50)).toBe(true)
  })
})

describe("formatCount", () => {
  it("keeps values under 1000 as-is", () => {
    expect(formatCount(500)).toBe("500")
    expect(formatCount(0)).toBe("0")
  })

  it("abbreviates thousands", () => {
    expect(formatCount(1000)).toBe("1k")
    expect(formatCount(1500)).toBe("1.5k")
    expect(formatCount(900000)).toBe("900k")
  })

  it("abbreviates millions", () => {
    expect(formatCount(2_000_000)).toBe("2M")
    expect(formatCount(1_500_000)).toBe("1.5M")
  })
})
