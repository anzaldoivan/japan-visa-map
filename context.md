## CSV Data Analysis: FEH_00250012_260610061045.csv

### File Overview

- **Source:** e-stat.go.jp — Ministry of Justice, 在留外国人統計 (Foreign Nationals in Japan Statistics)
- **Dataset ID:** 0004019020 (statsDataId in the API URL)
- **Total rows:** 5,281 (10 header rows + 5,271 data rows)
- **Encoding:** UTF-8 (no BOM)
- **File size:** ~1.5 MB

---

### Header Block (rows 0–9)

The first 10 rows are metadata — skip them when parsing:

| Row | Content |
|-----|---------|
| 0 | Dataset name: 在留外国人統計 |
| 1 | Table number: 01 |
| 2 | Table title: 国籍・地域別　在留資格別　在留外国人 |
| 3 | Time period: `-` (all periods) |
| 4 | (blank) |
| 5–6 | Legend: `***` and `-` = data not available |
| 7 | Visa status code row (column headers, numeric codes) |
| 8 | Supplementary code row |
| 9 | **Column header row** (actual field names) |

---

### Column Structure (44 columns)

| # | Column name | Example | Notes |
|---|-------------|---------|-------|
| 0 | 表章項目 コード | `"01"` | Always `01` |
| 1 | 表章項目 補助コード | `""` | Always blank |
| 2 | 表章項目 | `"人数【人】"` | Always "number of people" |
| 3 | 集計時点（半期毎） コード | `"2025000606"` | Time code: YYYY + `0006` or `0012` + MM |
| 4 | 集計時点（半期毎） 補助コード | `""` | Always blank |
| 5 | 集計時点（半期毎） | `"2025年6月"` | Human-readable period |
| 6 | 国籍・地域 コード | `"1230"` | Country/region numeric code |
| 7 | 国籍・地域 補助コード | `""` | Always blank |
| 8 | 国籍・地域 | `"中国"` | Country name in Japanese |
| 9 | /在留資格 | `""` | Always blank in data rows |
| 10 | 総数 | `"900738"` | **Total** foreign nationals |
| 11–53 | (43 visa categories) | see below | Individual visa type counts |

**Useful columns for parsing: 3 (time code), 5 (time label), 6 (country code), 8 (country name), 10 (total), 11–53 (visa breakdown)**

---

### Visa Status Columns (columns 11–53)

| Column | Japanese | English |
|--------|----------|---------|
| 11 | 教授 | Professor |
| 12 | 芸術 | Arts |
| 13 | 宗教 | Religion |
| 14 | 報道 | Journalism |
| 15 | 高度専門職合計 | Highly skilled professional (total) |
| 16 | 高度専門職１号イ | Highly skilled 1-i |
| 17 | 高度専門職１号ロ | Highly skilled 1-ro |
| 18 | 高度専門職１号ハ | Highly skilled 1-ha |
| 19 | 高度専門職２号 | Highly skilled 2 |
| 20 | 投資・経営 | Investment/management *(pre-2015 label)* |
| 21 | 経営・管理 | Business management *(post-2015 label)* |
| 22 | 法律・会計業務 | Legal/accounting |
| 23 | 医療 | Medical |
| 24 | 研究 | Research |
| 25 | 教育 | Education |
| 26 | 技術 | Technology *(pre-2015, merged later)* |
| 27 | 人文知識・国際業務 | Humanities/intl *(pre-2015, merged later)* |
| 28 | 技術・人文知識・国際業務 | Tech/humanities/intl *(post-2015)* |
| 29 | 企業内転勤 | Intra-company transfer |
| 30 | 介護 | Nursing care |
| 31 | 興行 | Entertainment |
| 32 | 技能 | Skilled labor |
| 33 | 特定技能合計 | Specified skilled worker (total) |
| 34 | 特定技能１号 | Specified skilled 1 |
| 35 | 特定技能２号 | Specified skilled 2 |
| 36 | 技能実習合計 | Technical intern training (total) |
| 37 | 技能実習１号イ | Intern 1-i |
| 38 | 技能実習１号ロ | Intern 1-ro |
| 39 | 技能実習２号イ | Intern 2-i |
| 40 | 技能実習２号ロ | Intern 2-ro |
| 41 | 技能実習３号イ | Intern 3-i |
| 42 | 技能実習３号ロ | Intern 3-ro |
| 43 | 文化活動 | Cultural activities |
| 44 | 留学 | Student |
| 45 | 研修 | Training |
| 46 | 家族滞在 | Family stay |
| 47 | 特定活動 | Specified activities |
| 48 | 永住者 | Permanent resident |
| 49 | 日本人の配偶者等 | Spouse of Japanese national |
| 50 | 永住者の配偶者等 | Spouse of permanent resident |
| 51 | 定住者 | Long-term resident |
| 52 | 特別永住者 | Special permanent resident |

---

### Time Periods

Half-yearly snapshots from **December 2012** to **June 2025** — 26 periods total.

| Time code format | Example | Meaning |
|-----------------|---------|---------|
| `YYYY000606` | `2025000606` | June of YYYY |
| `YYYY001212` | `2012001212` | December of YYYY |

---

### Country/Region Code Hierarchy

Codes are hierarchical — aggregate rows (regions) must be filtered out when doing per-country choropleth mapping.

| Code | Name | Type |
|------|------|------|
| `0000` | 総数 | **Grand total** — skip |
| `1000` | アジア | Asia aggregate — skip |
| `1010`–`1430` | Individual Asian countries | Use these |
| `2000` | ヨーロッパ | Europe aggregate — skip |
| `2010`–`2xxx` | Individual European countries | Use these |
| `3000` | アフリカ | Africa aggregate — skip |
| `4000` | 北アメリカ | North America aggregate — skip |
| `5000` | 南アメリカ | South America aggregate — skip |
| `6000` | オセアニア | Oceania aggregate — skip |
| `7000` | 無国籍 | Stateless — handle separately |

**Sub-rows to watch out for:**
- `1240` うち中国〔香港〕 — subset of China (1230), counts already included in parent
- `1250` うち中国〔その他〕 — same
- `2110` うち英国〔香港〕 — subset of UK (2100)

Filter these out (country names starting with `うち`) or they'll double-count.

---

### Special Values

| Value | Meaning |
|-------|---------|
| `***` | Category did not exist in that time period (e.g., 特定技能 before 2019) |
| `-` | Data not available |
| `"0"` | Genuine zero |

When parsing, treat both `***` and `-` as `null` / `0` depending on use case.

---

### Parsing Strategy for React

```js
// Skip first 10 rows (header block)
// Key columns by index:
const TIME_LABEL = 5;   // "2025年6月"
const COUNTRY_CODE = 6; // "1230"
const COUNTRY_NAME = 8; // "中国"
const TOTAL = 10;       // "900738"
// Visa breakdown: columns 11–52

// Filter out aggregate rows:
const isAggregate = code => ['0000','1000','2000','3000','4000','5000','6000'].includes(code);
const isSubset = name => name.startsWith('うち');

// Treat "***" and "-" as null
const parseCount = v => (v === '***' || v === '-' || v === '') ? null : parseInt(v, 10);
```

---

### Data Pipeline: CSV → JSON

Two files in `data/` handle the transformation:

| File | Purpose |
|------|---------|
| `data/countryMap.js` | Maps all 160+ Japanese country names → ISO 3166-1 alpha-2 codes. Aggregates, subsets, and defunct states map to `null` and are skipped. |
| `data/parseCSV.js` | Reads the raw CSV, skips 10 header rows, resolves ISO codes, strips null values, and writes `data/japan-visa.json`. Run with `node data/parseCSV.js`. |

**Output: `data/japan-visa.json`**

```json
{
  "periods": ["2012-12", "2013-06", ..., "2025-06"],
  "visaTypes": ["教授", "芸術", ...],
  "data": {
    "2025-06": {
      "CN": { "total": 900738, "経営・管理": 23747, "留学": 140164 },
      "VN": { "total": 660483, ... }
    }
  }
}
```

- Null visa values (categories that didn't exist in a given period) are omitted — absence of a key means `null`
- **26 periods** — `2012-12` → `2025-06` (ISO `YYYY-MM` keys; display is formatted at runtime via `Intl.DateTimeFormat`)
- **195 countries** in the latest period
- **~3.4 MB** uncompressed (`name` field removed from every entry)
- `entry.name` is no longer stored — country display names are resolved at runtime via `i18n-iso-countries`

**Top 10 countries (2025-06):**

| ISO | EN name | JA name | Total |
|-----|---------|---------|-------|
| CN | China | 中国 | 900,738 |
| VN | Vietnam | ベトナム | 660,483 |
| KR | South Korea | 韓国 | 409,584 |
| PH | Philippines | フィリピン | 349,714 |
| NP | Nepal | ネパール | 273,229 |
| ID | Indonesia | インドネシア | 230,689 |
| BR | Brazil | ブラジル | 211,229 |
| MM | Myanmar | ミャンマー | 160,362 |
| LK | Sri Lanka | スリランカ | 73,067 |
| TW | Taiwan | 台湾 | 71,125 |

---

## App: `app/`

Standalone Vite + React app in `app/`. Completely separate from the `react-simple-maps` library source at the repo root — has its own `package.json` and `node_modules`.

### Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Bundler | Vite 5 + `@vitejs/plugin-react` | `base: "/japan-visa-map/"` for GitHub Pages |
| Map | `react-simple-maps` 3.0.0 | npm package, not the local library build |
| World topology | `world-atlas` countries-110m.json | Copied to `public/world-110m.json` at install time |
| Color scale | `d3-scale` + `d3-scale-chromatic` | `scaleSequential(interpolateYlOrRd)` with `log1p` domain |
| Framework | React 18 | No router, single-page |

### File Structure

```
app/
  index.html
  vite.config.js
  package.json
  public/
    world-110m.json     ← copied from world-atlas on npm install
    japan-visa.json     ← copied from data/ (~3.4 MB, fetched at runtime)
  src/
    main.jsx
    index.css
    i18n.js             ← i18next init; detects browser language (en/ja)
    App.jsx             ← all UI: map, controls, tooltip, legend, lang toggle
    geoToAlpha2.js      ← ISO numeric → alpha-2 for all 195 countries
    locales/
      en.json           ← UI strings + 42 visa type English translations
      ja.json           ← UI strings only (visa keys are already Japanese)
```

### Key Implementation Notes

**Country matching** — `world-atlas` features use `geo.id` as a numeric ISO 3166-1 string (e.g. `"156"` for China). `geoToAlpha2.js` maps these numeric IDs to alpha-2 codes (`CN`, `VN`, etc.) which are the keys in `japan-visa.json`. JS object keys are always strings, so `GEO_TO_ALPHA2[geo.id]` works even though the keys are defined as numbers.

**Color scale** — log scale (`Math.log1p`) is used so small-population countries are visible. Without it, only China/Vietnam/Korea stand out and most of the world is near-zero.

**Tooltip** — shown only when `tooltip.countryData` and `tooltip.alpha2` are non-null. Shows: country name (from `i18n-iso-countries`), total, selected visa value, top 5 visa categories by count.

**`onMouseEnter` pattern** — `Geography` accepts `onMouseEnter` as a named prop (handled internally by the library for hover state), so the tooltip handler is passed there and also receives the mouse event.

**Data loading** — `japan-visa.json` is fetched at runtime (`fetch(DATA_URL)` in `useEffect`) and not bundled. App shows loading text until ready.

**Period slider** — `<input type="range">` over `periodIdx` (0–25). The stored period key (`"2025-06"`) is formatted for display with `Intl.DateTimeFormat` — produces `"June 2025"` (en) or `"2025年6月"` (ja) from the same key. Starts at the latest period (index 25).

**Visa type selector** — special sentinel `"__total__"` for the total column; all 42 visa type keys from `visaData.visaTypes` fill the rest of the dropdown. Option labels are translated via `tVisa(key)` (EN: looks up `locales/en.json`; JA: returns the key as-is since it's already Japanese).

**Localization** — `react-i18next` with `i18n.js` config. Language auto-detected from `navigator.language` on load; toggled at runtime via the EN/日本語 button in the header. Country names resolved by `i18n-iso-countries` (registered for `en` and `ja`). No locale strings are stored in the JSON data.

### Dev & Build

```bash
cd app
npm install   # installs react-i18next, i18next, i18n-iso-countries + existing deps

# Regenerate japan-visa.json from the raw CSV (if CSV is updated):
node ../data/parseCSV.js && cp ../data/japan-visa.json public/

# world-110m.json must be in public/ — copy manually if missing:
# node -e "require('fs').copyFileSync('node_modules/world-atlas/countries-110m.json', 'public/world-110m.json')"

npm run dev      # http://localhost:5173/japan-visa-map/
npm run build    # outputs to app/dist/  (~346 KB JS, 122 KB gzipped)
```

---

The Data (e-stat.go.jp)

Ministry of Justice dataset: foreign nationals residing in Japan by:

- Country of origin — 209 countries + stateless
- Visa/residency status — 43 categories (skilled worker, permanent resident, trainee, family, etc.)
- Time — half-yearly snapshots from Dec 2012 → Jun 2025

Export available as CSV/JSON via API (free, needs app ID registration) or direct file download. This is classic choropleth data — one number per country, color-coded on a world map.

---

Side-by-side Comparison

┌───────────────────────────┬──────────────────────────────┬───────────────────────────────────────────────────┐
│ │ react-simple-maps │ react-map-gl │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Stars │ 3,307 │ 8,454 │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Forks │ 466 │ 1,355 │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ License │ MIT │ Mapbox (non-free for prod) / MapLibre fork is MIT │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Last commit │ Aug 2024 │ Apr 2026 │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Open issues │ 190 (high) │ 94 (healthy) │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Rendering │ SVG via d3-geo + topojson │ WebGL tile map (Mapbox/MapLibre) │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ API key needed │ ❌ None │ ✅ Mapbox (paid) or MapLibre tile server │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Offline/static │ ✅ Fully static │ ❌ Needs tile service │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ GitHub Pages │ ✅ Zero config │ ⚠️ Needs hosted tiles or API key │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Choropleth maps │ ✅ Built for this │ ⚠️ Possible but not the primary use case │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Country highlighting │ ✅ Native, per-feature props │ ⚠️ Via GeoJSON layer — doable but verbose │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Tooltip/hover per country │ ✅ Dead simple │ ✅ Possible but more setup │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Bundle size │ Lightweight (~50kb) │ Heavy (~500kb+ with GL) │
├───────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────────┤
│ Street/tile detail │ ❌ None │ ✅ Full zoom to street level │
└───────────────────────────┴──────────────────────────────┴───────────────────────────────────────────────────┘

---

Verdict: react-simple-maps is clearly more appropriate

For this specific use case — country-level visa data on a world map, hosted on GitHub Pages — react-simple-maps wins on every axis that matters:

1. Zero dependencies on external services — fully static, deploys to GitHub Pages with gh-pages in one command
2. Made exactly for choropleth maps — you feed it a { countryCode: value } object and it colors countries; that's the whole API
3. Topojson world geometry is included — no tile server, no loading tiles, just SVG
4. The e-stat data maps directly — country code → fill color + tooltip with visa breakdown

react-map-gl has more stars because it's used for navigation maps, point clustering, heatmaps at street level. For coloring 209 countries with a value and showing a tooltip, it's like renting a bulldozer to plant a flower.

---

What a minimal implementation looks like

// Data shape from e-stat (after CSV parse):
// { "CN": { total: 761563, visas: { "Permanent Resident": 350123, ... } }, ... }

import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { scaleSequential } from "d3-scale"
import { interpolateBlues } from "d3-scale-chromatic"

const colorScale = scaleSequential(interpolateBlues).domain([0, maxValue])

<ComposableMap>
  <ZoomableGroup>
    <Geographies geography="/world-110m.json">
      {({ geographies }) =>
        geographies.map(geo => {
          const countryData = data[geo.properties.ISO_A2]
          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={countryData ? colorScale(countryData.total) : "#EEE"}
              onMouseEnter={() => setTooltip(countryData)}
            />
          )
        })
      }
    </Geographies>
  </ZoomableGroup>
</ComposableMap>

---

Suggested stack for your GitHub Pages project

┌───────────────────────────┬────────────────────────────────────────────────────┐
│ Layer │ Choice │
├───────────────────────────┼────────────────────────────────────────────────────┤
│ Map │ react-simple-maps │
├───────────────────────────┼────────────────────────────────────────────────────┤
│ Data fetch │ e-stat JSON API (or pre-downloaded CSV in /public) │
├───────────────────────────┼────────────────────────────────────────────────────┤
│ Color scale │ d3-scale + d3-scale-chromatic │
├───────────────────────────┼────────────────────────────────────────────────────┤
│ Tooltip │ @floating-ui/react or react-tooltip │
├───────────────────────────┼────────────────────────────────────────────────────┤
│ Filters (visa type, year) │ plain React state │
├───────────────────────────┼────────────────────────────────────────────────────┤
│ Deploy │ vite build + gh-pages │
└───────────────────────────┴────────────────────────────────────────────────────┘

---

## Changelog

### 2026-06-10 — Worldwide total display in header

Added a live count of total immigrants for the selected visa type and period, shown in the header between the Visa Type selector and the "Hover a country for details" hint.

**`app/src/utils.ts`**
- Added `sumPeriod(periodData: Record<string, VisaEntry>, visaType: string): number` — reduces all country entries for a given period using the existing `getValue`, returning the worldwide sum for either `TOTAL_KEY` or any named visa type.

**`app/src/utils.test.ts`**
- Added 4 tests for `sumPeriod` (written before the implementation — TDD):
  - sums `entry.total` across all countries when `TOTAL_KEY` is selected
  - sums a named visa type across all countries
  - returns `0` for an empty period
  - treats a missing visa key as `0` and does not throw

**`app/src/App.tsx`**
- Imported `sumPeriod` from `./utils`.
- Added `globalTotal = sumPeriod(periodData, visaType)` computed after `visaLabel`.
- Added a `<span>` in the header between the Visa Type `<label>` and the hover hint that displays `{t("ui.globalTotal")}: {globalTotal.toLocaleString()}`.

**`app/src/locales/en.json`**
- Added `"globalTotal": "Worldwide total"` to the `ui` namespace.

**`app/src/locales/ja.json`**
- Added `"globalTotal": "全国合計"` to the `ui` namespace.

---

### 2026-06-10 — Localization (EN / JA)

**Data pipeline (`data/parseCSV.js`)**
- Period keys changed from `"2025年6月"` → `"2025-06"` (ISO `YYYY-MM`). Display is now handled by `Intl.DateTimeFormat` in the app layer, reconstructing the locale-appropriate string at runtime.
- `entry.name` (Japanese country name) removed from every record in `japan-visa.json`. Country names are resolved from the ISO alpha-2 key via `i18n-iso-countries`. Saves ~150 KB from the JSON file.

**New files**
- `app/src/i18n.js` — i18next initialization; reads `navigator.language` to default to `"ja"` on Japanese browsers, falls back to `"en"`.
- `app/src/locales/en.json` — UI strings + English translations for all 42 visa type categories.
- `app/src/locales/ja.json` — UI strings only. Visa type keys are already Japanese, so no translation entry is needed; the app returns the raw key in JA mode.

**`app/src/App.jsx`**
- Added `useTranslation` hook; all hardcoded UI strings replaced with `t("ui.*")` calls.
- Added `tVisa(key)` helper: in JA mode returns the key directly; in EN mode looks up `t("visaTypes.key")`.
- Period label formatted via `formatPeriod(isoStr, locale)` using `Intl.DateTimeFormat`.
- Country names in tooltip resolved via `countries.getName(alpha2, language)` from `i18n-iso-countries` (both `en` and `ja` locales registered at module level).
- Added EN ↔ 日本語 toggle button in the header (calls `i18n.changeLanguage`).
- Tooltip handler now passes `alpha2` (string) instead of `geo` object to avoid storing the full geography in state.

**Dependencies added to `app/package.json`**
- `react-i18next` ^17
- `i18next` ^26
- `i18n-iso-countries` ^7

---

### 2026-06-10 — Fix: zero-padded `geo.id` lookup in `geoToAlpha2.js`

**Bug** — `world-110m.json` stores all feature IDs as zero-padded 3-digit strings (e.g. `"032"` for Argentina, `"076"` for Brazil, `"036"` for Australia). `geoToAlpha2.js` previously used bare integer keys (e.g. `32`, `76`, `36`), which JavaScript stores as unpadded strings (`"32"`, `"76"`, `"36"`). The lookup `GEO_TO_ALPHA2[geo.id]` therefore returned `undefined` for all 20 countries whose ISO numeric code is less than 100, causing them to render as "no data" on the map.

**`app/src/geoToAlpha2.js`**
- 24 keys with ISO numeric codes < 100 changed from bare integers to zero-padded 3-digit string literals (e.g. `32: "AR"` → `"032": "AR"`). Keys now exactly match the `geo.id` format supplied by `world-atlas`. Affected countries: AF, AL, AM, AD, AO, AG, AZ, AR, AU, AT, BS, BH, BD, BB, BE, BT, BO, BA, BW, BR, BZ, SB, BN, DZ.

**`app/src/geoToAlpha2.test.js`**
- Added regression test: *"resolves zero-padded geo.id strings as supplied by world-atlas"* — asserts that `GEO_TO_ALPHA2["032"]` → `"AR"`, `"076"` → `"BR"`, `"036"` → `"AU"`, etc. This test was written first and confirmed failing before the fix.
- Updated 3 pre-existing assertions that used bare numeric keys for affected countries (`GEO_TO_ALPHA2[76]` → `GEO_TO_ALPHA2["076"]`, `GEO_TO_ALPHA2[36]` → `GEO_TO_ALPHA2["036"]`, `GEO_TO_ALPHA2[32]` → `GEO_TO_ALPHA2["032"]`).

---

### 2026-06-10 — TypeScript migration (`app/`)

All source files in `app/src/` converted from JavaScript/JSX to TypeScript/TSX. `tsc --noEmit` passes clean with `strict: true`.

**New config files**
- `app/tsconfig.json` — strict React/Vite config; targets ES2020, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `noEmit: true`.
- `app/src/vite-env.d.ts` — `/// <reference types="vite/client" />` for CSS and asset import types.
- `app/src/react-simple-maps.d.ts` — hand-written ambient declaration for `react-simple-maps` (no official types); declares `ComposableMap`, `ZoomableGroup`, `Geographies`, `Geography`, and the `GeoFeature` interface.

**Source files renamed and typed**

| Old | New | Key additions |
|-----|-----|---------------|
| `utils.js` | `utils.ts` | `VisaEntry` interface (exported); typed signatures for `formatPeriod` and `getValue` |
| `geoToAlpha2.js` | `geoToAlpha2.ts` | `Record<string, string>` annotation; all keys normalised to quoted 3-digit strings |
| `i18n.js` | `i18n.ts` | rename only |
| `main.jsx` | `main.tsx` | non-null assertion `getElementById("root")!` |
| `App.jsx` | `App.tsx` | `VisaData`, `TooltipState`, `TooltipProps`, `LegendProps` interfaces; typed state, callbacks, and component props |
| `App.test.jsx` | `App.test.tsx` | `VisaEntry` import; typed stub `t`/`tVisa` functions; `!` assertions on known-present fixture fields |
| `utils.test.js` | `utils.test.ts` | rename only |
| `geoToAlpha2.test.js` | `geoToAlpha2.test.ts` | all numeric key accesses changed to string (`156` → `"156"` etc.) to match `Record<string, string>` |

**Config updates**
- `vite.config.js` → `vite.config.ts`: `import { defineConfig } from "vitest/config"` (adds `test` type augmentation); coverage globs updated from `{js,jsx}` to `{ts,tsx}`.
- `eslint.config.js`: replaced `@eslint/js`-only rules with `typescript-eslint`; file globs updated to `{ts,tsx}`; `no-unused-vars` delegated to `@typescript-eslint/no-unused-vars`.

**Dependencies added to `app/package.json`**
- `typescript`
- `@types/react`, `@types/react-dom`
- `@types/d3-scale`, `@types/d3-scale-chromatic`
- `typescript-eslint`

**`app/index.html`**
- Entry point script tag updated: `src="/src/main.jsx"` → `src="/src/main.tsx"` (Vite reads this directly; the old path caused a pre-transform error at dev startup).
