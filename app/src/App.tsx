import { useState, useEffect, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps"
import { scaleThreshold } from "d3-scale"
import { interpolateInferno } from "d3-scale-chromatic"
import countries from "i18n-iso-countries"
import enCountries from "i18n-iso-countries/langs/en.json"
import jaCountries from "i18n-iso-countries/langs/ja.json"
import GEO_TO_ALPHA2 from "./geoToAlpha2"
import {
  formatPeriod,
  formatCount,
  getValue as getEntryValue,
  maxAcrossPeriods,
  niceLogBreaks,
  sumPeriod,
  TOTAL_KEY,
  VisaEntry,
} from "./utils"

countries.registerLocale(enCountries)
countries.registerLocale(jaCountries)

const GEO_URL = "/japan-visa-map/world-110m.json"
const DATA_URL = "/japan-visa-map/japan-visa.json"
const SOURCE_URL = "https://www.e-stat.go.jp/dbview?sid=0004019020"

const NO_DATA_FILL = "url(#no-data-hatch)"
const NO_DATA_SWATCH = "repeating-linear-gradient(45deg, #151a24 0 3px, #2a3242 3px 5px)"
const ACCENT = "#f6b04e"
const COUNTRY_STROKE = "#0a0d13"
const INITIAL_POSITION = { coordinates: [15, 10] as [number, number], zoom: 1 }

/** Sample n discrete classes from inferno, skipping the near-black low end
 *  so the lowest bin still reads against the dark background. */
const binColors = (n: number): string[] =>
  Array.from({ length: n }, (_, i) =>
    interpolateInferno(n === 1 ? 0.6 : 0.22 + (0.74 * i) / (n - 1))
  )

const VISA_GROUP: Record<string, string> = {
  教授: "work", 芸術: "work", 宗教: "work", 報道: "work",
  高度専門職合計: "work", 高度専門職１号イ: "work", 高度専門職１号ロ: "work",
  高度専門職１号ハ: "work", 高度専門職２号: "work",
  "投資・経営": "work", "経営・管理": "work", "法律・会計業務": "work",
  医療: "work", 研究: "work", 教育: "work", 技術: "work",
  "人文知識・国際業務": "work", "技術・人文知識・国際業務": "work",
  企業内転勤: "work", 介護: "work", 興行: "work", 技能: "work",
  特定技能合計: "work", 特定技能１号: "work", 特定技能２号: "work",
  技能実習合計: "training", 技能実習１号イ: "training", 技能実習１号ロ: "training",
  技能実習２号イ: "training", 技能実習２号ロ: "training",
  技能実習３号イ: "training", 技能実習３号ロ: "training", 研修: "training",
  文化活動: "study", 留学: "study",
  家族滞在: "family", 特定活動: "family",
  永住者: "status", 日本人の配偶者等: "status", 永住者の配偶者等: "status",
  定住者: "status", 特別永住者: "status",
}
const GROUP_ORDER = ["work", "training", "study", "family", "status", "other"]

interface VisaData {
  periods: string[]
  visaTypes: string[]
  data: Record<string, Record<string, VisaEntry>>
}

interface TooltipState {
  x: number
  y: number
  alpha2: string | undefined
  countryData: VisaEntry | null
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [visaData, setVisaData] = useState<VisaData | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [periodIdx, setPeriodIdx] = useState(0)
  const [visaType, setVisaType] = useState<string>(TOTAL_KEY)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(INITIAL_POSITION)

  // For JA, visa keys are already Japanese; for EN, look up translation
  const tVisa = (key: string) => i18n.language === "ja" ? key : t(`visaTypes.${key}`)

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === "ja" ? "en" : "ja")

  const loadData = useCallback(() => {
    setLoadError(false)
    fetch(DATA_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: VisaData) => {
        setVisaData(d)
        setPeriodIdx(d.periods.length - 1)
      })
      .catch(() => setLoadError(true))
  }, [])

  useEffect(loadData, [loadData])

  const lastIdx = visaData ? visaData.periods.length - 1 : 0

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setPeriodIdx(i => {
        if (i >= lastIdx) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, 750)
    return () => clearInterval(id)
  }, [playing, lastIdx])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Class breaks are derived from the all-time max for the selected visa type,
  // so colors stay comparable while scrubbing or playing through time.
  const { breaks, colors, colorFor } = useMemo(() => {
    const max = visaData ? maxAcrossPeriods(visaData.data, visaType) : 1
    const breaks = niceLogBreaks(max, 6)
    const colors = binColors(breaks.length + 1)
    const colorFor = scaleThreshold<number, string>().domain(breaks).range(colors)
    return { breaks, colors, colorFor }
  }, [visaData, visaType])

  const handleMouseEnter = useCallback(
    (alpha2: string | undefined, countryData: VisaEntry | undefined) =>
      (evt: React.MouseEvent) => {
        setTooltip({ x: evt.clientX, y: evt.clientY, alpha2, countryData: countryData ?? null })
      },
    []
  )

  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    setTooltip(s => s ? { ...s, x: evt.clientX, y: evt.clientY } : null)
  }, [])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  const zoomBy = (factor: number) =>
    setPosition(p => ({ ...p, zoom: Math.min(8, Math.max(1, p.zoom * factor)) }))

  if (loadError) {
    return (
      <div className="center-screen" role="alert">
        <span>{t("ui.error")}</span>
        <button onClick={loadData}>{t("ui.retry")}</button>
      </div>
    )
  }

  if (!visaData) {
    return (
      <div className="center-screen">
        <div className="spinner" aria-hidden="true" />
        {t("ui.loading")}
      </div>
    )
  }

  const period = visaData.periods[periodIdx]
  const periodData = visaData.data[period]
  const language = i18n.language
  const numLocale = language === "ja" ? "ja-JP" : "en-US"

  const getValue = (entry: VisaEntry | null | undefined) => getEntryValue(entry, visaType)

  const getFill = (alpha2: string | undefined, entry: VisaEntry | undefined) => {
    if (!alpha2 || entry === undefined) return NO_DATA_FILL
    return colorFor(getValue(entry))
  }

  const visaLabel = visaType === TOTAL_KEY ? t("ui.total") : tVisa(visaType)
  const globalTotal = sumPeriod(periodData, visaType)
  const periodLabel = formatPeriod(period, language)
  const selectedEntry = selected ? periodData[selected] : undefined

  const togglePlay = () => {
    if (!playing && periodIdx >= lastIdx) setPeriodIdx(0)
    setPlaying(p => !p)
  }

  const selectCountry = (alpha2: string) =>
    setSelected(s => (s === alpha2 ? null : alpha2))

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-top">
          <h1 className="title">
            <span className="hinomaru" aria-hidden="true" />
            {t("ui.title")}
          </h1>
          <span className="global-total">
            {t("ui.globalTotal")}
            <strong>{globalTotal.toLocaleString(numLocale)}</strong>
          </span>
          <span className="hint">{t("ui.hover")}</span>
          <button className="lang-toggle" onClick={toggleLanguage}>
            {language === "ja" ? "EN" : "日本語"}
          </button>
        </div>

        <div className="controls">
          {/* Period slider + playback */}
          <div className="control">
            <span className="control-label">{t("ui.period")}</span>
            <button
              className="icon-btn"
              onClick={togglePlay}
              aria-label={playing ? t("ui.pause") : t("ui.play")}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <span className="slider-edge">{visaData.periods[0].slice(0, 4)}</span>
            <input
              type="range"
              min={0}
              max={lastIdx}
              value={periodIdx}
              onChange={e => setPeriodIdx(Number(e.target.value))}
              aria-label={t("ui.period")}
              aria-valuetext={periodLabel}
            />
            <span className="slider-edge">{visaData.periods[lastIdx].slice(0, 4)}</span>
            <span className="period-value">{periodLabel}</span>
          </div>

          {/* Visa type selector */}
          <label className="control">
            <span className="control-label">{t("ui.visaType")}</span>
            <select value={visaType} onChange={e => setVisaType(e.target.value)}>
              <option value={TOTAL_KEY}>{t("ui.total")}</option>
              {GROUP_ORDER.map(group => {
                const items = visaData.visaTypes.filter(
                  v => (VISA_GROUP[v] ?? "other") === group
                )
                if (items.length === 0) return null
                return (
                  <optgroup key={group} label={t(`groups.${group}`)}>
                    {items.map(v => (
                      <option key={v} value={v}>{tVisa(v)}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </label>
        </div>
      </header>

      {/* ── Map ── */}
      <div className="map-area">
        <ComposableMap
          projectionConfig={{ scale: 155, center: [15, 10] }}
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <pattern
              id="no-data-hatch"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill="#151a24" />
              <line x1="1" y1="0" x2="1" y2="6" stroke="#2a3242" strokeWidth="2" />
            </pattern>
          </defs>
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            maxZoom={8}
            onMoveEnd={setPosition}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const alpha2 = GEO_TO_ALPHA2[geo.id]
                  const entry = alpha2 ? periodData[alpha2] : undefined
                  const hasData = Boolean(alpha2 && entry)
                  const name = alpha2
                    ? countries.getName(alpha2, language) || alpha2
                    : undefined
                  const isSelected = alpha2 !== undefined && alpha2 === selected
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFill(alpha2, entry)}
                      stroke={COUNTRY_STROKE}
                      strokeWidth={0.5}
                      tabIndex={hasData ? 0 : -1}
                      role={hasData ? "button" : undefined}
                      aria-label={
                        hasData
                          ? `${name} — ${visaLabel}: ${getValue(entry).toLocaleString(numLocale)}`
                          : name && `${name} — ${t("ui.noData")}`
                      }
                      onClick={hasData ? () => selectCountry(alpha2!) : undefined}
                      onKeyDown={
                        hasData
                          ? evt => {
                              if (evt.key === "Enter" || evt.key === " ") {
                                evt.preventDefault()
                                selectCountry(alpha2!)
                              }
                            }
                          : undefined
                      }
                      onMouseEnter={handleMouseEnter(alpha2, entry)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        // Highlight with a stroke so the data color stays readable
                        hover: {
                          stroke: ACCENT,
                          strokeWidth: 1.2,
                          cursor: hasData ? "pointer" : "default",
                          outline: "none",
                        },
                        pressed: { stroke: ACCENT, strokeWidth: 1.4, outline: "none" },
                        default: {
                          outline: "none",
                          ...(isSelected ? { stroke: ACCENT, strokeWidth: 1.3 } : {}),
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* ── Tooltip ── */}
        {tooltip?.countryData && tooltip?.alpha2 && (
          <Tooltip
            x={tooltip.x}
            y={tooltip.y}
            alpha2={tooltip.alpha2}
            entry={tooltip.countryData}
            visaType={visaType}
            visaLabel={visaLabel}
            tVisa={tVisa}
            t={t}
            language={language}
          />
        )}

        {/* ── Pinned detail panel (click / tap / Enter) ── */}
        {selected && selectedEntry && (
          <DetailPanel
            alpha2={selected}
            entry={selectedEntry}
            period={period}
            visaType={visaType}
            visaLabel={visaLabel}
            globalTotal={globalTotal}
            tVisa={tVisa}
            t={t}
            language={language}
            onClose={() => setSelected(null)}
          />
        )}

        {/* ── Legend ── */}
        <Legend
          breaks={breaks}
          colors={colors}
          visaLabel={visaLabel}
          note={t("ui.legendNote")}
          noDataLabel={t("ui.noData")}
        />

        {/* ── Zoom controls ── */}
        <div className="zoom-controls">
          <button className="icon-btn" onClick={() => zoomBy(1.6)} aria-label={t("ui.zoomIn")}>+</button>
          <button className="icon-btn" onClick={() => zoomBy(1 / 1.6)} aria-label={t("ui.zoomOut")}>−</button>
          <button className="icon-btn" onClick={() => setPosition(INITIAL_POSITION)} aria-label={t("ui.resetZoom")}>⟲</button>
        </div>

        {/* ── Source attribution ── */}
        <div className="attribution">
          {t("ui.source")}:{" "}
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            {t("ui.sourceName")}
          </a>
          {" · "}
          {t("ui.dataThrough", { period: formatPeriod(visaData.periods[lastIdx], language) })}
        </div>
      </div>
    </div>
  )
}

interface TooltipProps {
  x: number
  y: number
  alpha2: string
  entry: VisaEntry
  visaType: string
  visaLabel: string
  tVisa: (key: string) => string
  t: (key: string) => string
  language: string
}

export function Tooltip({ x, y, alpha2, entry, visaType, visaLabel, tVisa, t, language }: TooltipProps) {
  const countryName = countries.getName(alpha2, language) || alpha2
  const total = entry.total?.toLocaleString() ?? "—"
  const specific = visaType !== TOTAL_KEY
    ? (entry[visaType] ?? 0).toLocaleString()
    : null

  const topVisas = Object.entries(entry)
    .filter(([k]) => k !== "total")
    .filter((pair): pair is [string, number] => pair[1] !== undefined && pair[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Flip near the right edge, clamp vertically — keeps the card on screen
  const EST_W = 274
  const EST_H = 250
  const left = x + 14 + EST_W > window.innerWidth ? Math.max(8, x - 14 - EST_W) : x + 14
  const top = Math.max(8, Math.min(y - 10, window.innerHeight - EST_H))

  return (
    <div className="tooltip" style={{ left, top }}>
      <div className="tooltip-country">{countryName}</div>
      <div className="stat-row">
        <span>{t("ui.total")}</span>
        <strong>{total}</strong>
      </div>
      {specific !== null && (
        <div className="stat-row">
          <span>{visaLabel}</span>
          <strong className="accent">{specific}</strong>
        </div>
      )}
      {topVisas.length > 0 && (
        <>
          <div className="tooltip-divider">{t("ui.topVisaCategories")}</div>
          {topVisas.map(([visa, count]) => (
            <div key={visa} className="stat-row">
              <span>{tVisa(visa)}</span>
              <strong>{count.toLocaleString()}</strong>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

interface DetailPanelProps {
  alpha2: string
  entry: VisaEntry
  period: string
  visaType: string
  visaLabel: string
  globalTotal: number
  tVisa: (key: string) => string
  t: (key: string) => string
  language: string
  onClose: () => void
}

export function DetailPanel({
  alpha2, entry, period, visaType, visaLabel, globalTotal, tVisa, t, language, onClose,
}: DetailPanelProps) {
  const countryName = countries.getName(alpha2, language) || alpha2
  const value = getEntryValue(entry, visaType)
  const share = globalTotal > 0 ? (value / globalTotal) * 100 : 0

  const topVisas = Object.entries(entry)
    .filter(([k]) => k !== "total")
    .filter((pair): pair is [string, number] => pair[1] !== undefined && pair[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxTop = topVisas[0]?.[1] ?? 1

  return (
    <aside className="panel" aria-label={countryName}>
      <div className="panel-header">
        <div className="panel-country">{countryName}</div>
        <button className="panel-close" onClick={onClose} aria-label={t("ui.close")}>✕</button>
      </div>
      <div className="panel-period">{formatPeriod(period, language)}</div>

      <div className="panel-stats">
        <div className="stat-row">
          <span>{t("ui.total")}</span>
          <strong>{entry.total?.toLocaleString() ?? "—"}</strong>
        </div>
        {visaType !== TOTAL_KEY && (
          <div className="stat-row">
            <span>{visaLabel}</span>
            <strong className="accent">{value.toLocaleString()}</strong>
          </div>
        )}
        <div className="stat-row">
          <span>{t("ui.shareOfWorld")}</span>
          <strong>{share.toFixed(1)}%</strong>
        </div>
      </div>

      {topVisas.length > 0 && (
        <>
          <div className="panel-section">{t("ui.topVisaCategories")}</div>
          {topVisas.map(([visa, count]) => (
            <div key={visa} className="bar-row">
              <div className="bar-row-label">
                <span>{tVisa(visa)}</span>
                <span className="count">{count.toLocaleString()}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(count / maxTop) * 100}%` }} />
              </div>
            </div>
          ))}
        </>
      )}
    </aside>
  )
}

interface LegendProps {
  breaks: number[]
  colors: string[]
  visaLabel: string
  note: string
  noDataLabel: string
}

/** Range label for class i of a threshold scale with the given breaks. */
function binLabel(breaks: number[], i: number): string {
  if (breaks.length === 0) return "0+"
  if (i === 0) return `< ${formatCount(breaks[0])}`
  if (i === breaks.length) return `≥ ${formatCount(breaks[breaks.length - 1])}`
  return `${formatCount(breaks[i - 1])} – ${formatCount(breaks[i])}`
}

export function Legend({ breaks, colors, visaLabel, note, noDataLabel }: LegendProps) {
  return (
    <div className="legend">
      <div className="legend-title">{visaLabel}</div>
      <div className="legend-note">{note}</div>
      {colors.map((color, i) => (
        <div key={i} className="legend-row">
          <span className="legend-swatch" style={{ background: color }} />
          <span>{binLabel(breaks, i)}</span>
        </div>
      ))}
      <div className="legend-row">
        <span className="legend-swatch" style={{ background: NO_DATA_SWATCH }} />
        <span>{noDataLabel}</span>
      </div>
    </div>
  )
}
