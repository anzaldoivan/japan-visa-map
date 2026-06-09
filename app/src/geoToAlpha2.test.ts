import { describe, it, expect } from "vitest"
import GEO_TO_ALPHA2 from "./geoToAlpha2"

describe("GEO_TO_ALPHA2", () => {
  it("every value is a 2-character uppercase alpha code", () => {
    for (const code of Object.values(GEO_TO_ALPHA2)) {
      expect(code).toMatch(/^[A-Z]{2}$/)
    }
  })

  it("has no duplicate alpha-2 codes", () => {
    const values = Object.values(GEO_TO_ALPHA2)
    const unique = new Set(values)
    expect(values.length).toBe(unique.size)
  })

  it("every key is a positive integer string", () => {
    for (const key of Object.keys(GEO_TO_ALPHA2)) {
      expect(Number(key)).toBeGreaterThan(0)
    }
  })

  it("maps the top-10 e-stat countries by population", () => {
    expect(GEO_TO_ALPHA2["156"]).toBe("CN")  // China     — 900k
    expect(GEO_TO_ALPHA2["704"]).toBe("VN")  // Vietnam   — 660k
    expect(GEO_TO_ALPHA2["410"]).toBe("KR")  // S. Korea  — 409k
    expect(GEO_TO_ALPHA2["608"]).toBe("PH")  // Philippines
    expect(GEO_TO_ALPHA2["524"]).toBe("NP")  // Nepal
    expect(GEO_TO_ALPHA2["360"]).toBe("ID")  // Indonesia
    expect(GEO_TO_ALPHA2["076"]).toBe("BR")  // Brazil
    expect(GEO_TO_ALPHA2["104"]).toBe("MM")  // Myanmar
  })

  it("maps countries from each geographic region", () => {
    expect(GEO_TO_ALPHA2["840"]).toBe("US")  // North America
    expect(GEO_TO_ALPHA2["276"]).toBe("DE")  // Europe
    expect(GEO_TO_ALPHA2["566"]).toBe("NG")  // Africa
    expect(GEO_TO_ALPHA2["036"]).toBe("AU")  // Oceania
    expect(GEO_TO_ALPHA2["032"]).toBe("AR")  // South America
  })

  // world-110m.json stores all feature IDs as zero-padded 3-digit strings
  // (e.g. "032" for Argentina, "076" for Brazil, "036" for Australia).
  // App.tsx looks up GEO_TO_ALPHA2[geo.id] directly, so these must resolve.
  it("resolves zero-padded geo.id strings as supplied by world-atlas", () => {
    expect(GEO_TO_ALPHA2["032"]).toBe("AR") // Argentina  — total 3,496
    expect(GEO_TO_ALPHA2["076"]).toBe("BR") // Brazil     — total 211,229
    expect(GEO_TO_ALPHA2["036"]).toBe("AU") // Australia  — total 11,845
    expect(GEO_TO_ALPHA2["040"]).toBe("AT") // Austria    — total 831
    expect(GEO_TO_ALPHA2["056"]).toBe("BE") // Belgium    — total 1,225
    expect(GEO_TO_ALPHA2["050"]).toBe("BD") // Bangladesh — total 40,045
  })
})
