import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Tooltip, Legend, DetailPanel } from "./App"
import { VisaEntry } from "./utils"
import enLocale from "./locales/en.json"
import jaLocale from "./locales/ja.json"

// Stub translation — pass through everything as the key except countries.* overrides,
// which are read directly from the locale files to keep the test in sync with production.
const makeT = (lang: "en" | "ja") => (key: string): string => {
  if (key.startsWith("countries.")) {
    const alpha2 = key.slice("countries.".length)
    const locale = lang === "ja" ? jaLocale : enLocale
    return (locale as Record<string, Record<string, string>>).countries?.[alpha2] ?? key
  }
  return key
}
const t = makeT("en")
const tJa = makeT("ja")
const tVisa = (key: string) => key

const CHINA_ENTRY: VisaEntry = {
  total: 900738,
  留学: 140164,
  永住者: 350000,
  "技術・人文知識・国際業務": 200000,
  特定技能合計: 100000,
  技能実習合計: 80000,
}

describe("Tooltip", () => {
  it("renders the English country name for a known alpha-2 code", () => {
    render(
      <Tooltip
        x={100} y={200}
        alpha2="CN"
        entry={CHINA_ENTRY}
        visaType="__total__"
        visaLabel="Total"
        tVisa={tVisa} t={t} language="en"
      />
    )
    expect(screen.getByText("China")).toBeInTheDocument()
  })

  it("renders the Japanese country name when language is ja", () => {
    render(
      <Tooltip
        x={100} y={200}
        alpha2="CN"
        entry={CHINA_ENTRY}
        visaType="__total__"
        visaLabel="Total"
        tVisa={tVisa} t={tJa} language="ja"
      />
    )
    expect(screen.getByText("中国")).toBeInTheDocument()
  })

  it("falls back to the alpha-2 code when the country is not in the registry", () => {
    render(
      <Tooltip
        x={0} y={0}
        alpha2="XX"
        entry={{ total: 42 }}
        visaType="__total__"
        visaLabel="Total"
        tVisa={tVisa} t={t} language="en"
      />
    )
    expect(screen.getByText("XX")).toBeInTheDocument()
  })

  it("renders the formatted total using toLocaleString", () => {
    render(
      <Tooltip
        x={0} y={0}
        alpha2="CN"
        entry={CHINA_ENTRY}
        visaType="__total__"
        visaLabel="Total"
        tVisa={tVisa} t={t} language="en"
      />
    )
    // Match formatted total — separator varies by ICU locale
    expect(screen.getByText(CHINA_ENTRY.total!.toLocaleString())).toBeInTheDocument()
  })

  it("shows the specific visa value line when a named visa type is selected", () => {
    render(
      <Tooltip
        x={0} y={0}
        alpha2="CN"
        entry={CHINA_ENTRY}
        visaType="留学"
        visaLabel="Student"
        tVisa={tVisa} t={t} language="en"
      />
    )
    expect(screen.getAllByText(CHINA_ENTRY["留学"]!.toLocaleString())).toHaveLength(2)
  })

  it("does not show the specific visa line when TOTAL_KEY is selected", () => {
    render(
      <Tooltip
        x={0} y={0}
        alpha2="CN"
        entry={CHINA_ENTRY}
        visaType="__total__"
        visaLabel="Total"
        tVisa={tVisa} t={t} language="en"
      />
    )
    // The specific line only appears for named visa types
    expect(screen.getAllByText("140,164")).toHaveLength(1)
  })

  it("renders at most 5 top-visa rows", () => {
    render(
      <Tooltip
        x={0} y={0}
        alpha2="CN"
        entry={CHINA_ENTRY}
        visaType="__total__"
        visaLabel="Total"
        tVisa={tVisa} t={t} language="en"
      />
    )
    // CHINA_ENTRY has 5 visa keys — all should appear
    expect(screen.getByText("留学")).toBeInTheDocument()
    expect(screen.getByText("永住者")).toBeInTheDocument()
  })

  it("renders em-dash for total when entry.total is undefined", () => {
    render(
      <Tooltip
        x={0} y={0}
        alpha2="US"
        entry={{ 留学: 1000 }}
        visaType="__total__"
        visaLabel="Total"
        tVisa={tVisa} t={t} language="en"
      />
    )
    expect(screen.getByText("—")).toBeInTheDocument()
  })
})

describe("Legend", () => {
  const BREAKS = [10, 100, 1000, 10000, 100000]
  const COLORS = ["#1b0c41", "#781c6d", "#cf4446", "#f1731d", "#fca50a", "#f6d746"]

  const renderLegend = () =>
    render(
      <Legend
        breaks={BREAKS}
        colors={COLORS}
        visaLabel="Total"
        note="Residents · log-spaced classes"
        noDataLabel="No data"
      />
    )

  it("renders the visa label and scale note", () => {
    renderLegend()
    expect(screen.getByText("Total")).toBeInTheDocument()
    expect(screen.getByText("Residents · log-spaced classes")).toBeInTheDocument()
  })

  it("renders the no-data label", () => {
    renderLegend()
    expect(screen.getByText("No data")).toBeInTheDocument()
  })

  it("labels the open-ended bottom and top classes with real values", () => {
    renderLegend()
    expect(screen.getByText("< 10")).toBeInTheDocument()
    expect(screen.getByText("≥ 100k")).toBeInTheDocument()
  })

  it("labels middle classes as ranges with compact numbers", () => {
    renderLegend()
    expect(screen.getByText("10 – 100")).toBeInTheDocument()
    expect(screen.getByText("10k – 100k")).toBeInTheDocument()
  })

  it("renders one swatch per class plus the no-data swatch", () => {
    const { container } = renderLegend()
    expect(container.querySelectorAll(".legend-swatch").length).toBe(COLORS.length + 1)
  })

  it("renders a single open class when there are no breaks", () => {
    render(
      <Legend breaks={[]} colors={["#cf4446"]} visaLabel="Total" note="" noDataLabel="No data" />
    )
    expect(screen.getByText("0+")).toBeInTheDocument()
  })
})

describe("DetailPanel", () => {
  const renderPanel = (overrides: Partial<Parameters<typeof DetailPanel>[0]> = {}) =>
    render(
      <DetailPanel
        alpha2="CN"
        entry={CHINA_ENTRY}
        period="2025-06"
        visaType="__total__"
        visaLabel="Total"
        globalTotal={3_000_000}
        tVisa={tVisa}
        t={t}
        language="en"
        onClose={() => {}}
        {...overrides}
      />
    )

  it("renders the country name and formatted period", () => {
    renderPanel()
    expect(screen.getByText("China")).toBeInTheDocument()
    expect(screen.getByText("June 2025")).toBeInTheDocument()
  })

  it("shows the share of the worldwide total", () => {
    renderPanel()
    // 900738 / 3000000 = 30.0%
    expect(screen.getByText("30.0%")).toBeInTheDocument()
  })

  it("renders top visa categories with bars", () => {
    const { container } = renderPanel()
    expect(screen.getByText("留学")).toBeInTheDocument()
    expect(container.querySelectorAll(".bar-fill").length).toBeGreaterThan(0)
  })

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn()
    renderPanel({ onClose })
    fireEvent.click(screen.getByRole("button", { name: "ui.close" }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("shows the specific visa row only for a named visa type", () => {
    renderPanel({ visaType: "留学", visaLabel: "Student" })
    expect(screen.getByText("Student")).toBeInTheDocument()
  })
})
