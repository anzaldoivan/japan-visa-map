#!/usr/bin/env node
// Parses FEH_00250012_260610061045.csv and outputs japan-visa.json
// Run: node data/parseCSV.js

const fs = require("fs");
const path = require("path");
const COUNTRY_MAP = require("./countryMap.js");

const CSV_PATH = path.join(__dirname, "FEH_00250012_260610061045.csv");
const OUT_PATH = path.join(__dirname, "japan-visa.json");

// Column indices (0-based, after unquoting)
const COL_TIME_LABEL   = 5;  // "2025年6月"
const COL_COUNTRY_NAME = 8;  // "中国"
const COL_TOTAL        = 10; // grand total for this country+period
const COL_VISA_START   = 11; // first visa-type column
const HEADER_ROWS      = 10; // rows to skip before data begins

// Convert "2025年6月" → "2025-06" (locale-neutral ISO key)
function toISOPeriod(label) {
  const [y, m] = label.replace("年", "-").replace("月", "").split("-").map(Number);
  return `${y}-${String(m).padStart(2, "0")}`;
}

// Visa type labels in column order (columns 11–52)
const VISA_TYPES = [
  "教授", "芸術", "宗教", "報道",
  "高度専門職合計", "高度専門職１号イ", "高度専門職１号ロ", "高度専門職１号ハ", "高度専門職２号",
  "投資・経営", "経営・管理", "法律・会計業務", "医療", "研究", "教育",
  "技術", "人文知識・国際業務", "技術・人文知識・国際業務",
  "企業内転勤", "介護", "興行", "技能",
  "特定技能合計", "特定技能１号", "特定技能２号",
  "技能実習合計", "技能実習１号イ", "技能実習１号ロ", "技能実習２号イ", "技能実習２号ロ", "技能実習３号イ", "技能実習３号ロ",
  "文化活動", "留学", "研修", "家族滞在", "特定活動",
  "永住者", "日本人の配偶者等", "永住者の配偶者等", "定住者", "特別永住者",
];

function parseValue(raw) {
  if (raw === "***" || raw === "-" || raw === "") return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

// Minimal CSV row parser — handles double-quoted fields with no embedded newlines
function parseRow(line) {
  const fields = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++; // skip opening quote
      let val = "";
      while (i < line.length && !(line[i] === '"' && line[i + 1] !== '"')) {
        if (line[i] === '"' && line[i + 1] === '"') { val += '"'; i += 2; }
        else { val += line[i++]; }
      }
      i++; // skip closing quote
      fields.push(val);
    } else {
      let val = "";
      while (i < line.length && line[i] !== ",") val += line[i++];
      fields.push(val);
    }
    if (line[i] === ",") i++;
  }
  return fields;
}

function main() {
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const lines = raw.split("\n");

  const periodSet = new Set();
  // byPeriod[periodLabel][isoCode] = { name, total, ...visaValues }
  const byPeriod = {};
  const unmapped = new Set();

  for (let i = HEADER_ROWS; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseRow(line);
    if (fields.length < COL_VISA_START) continue;

    const countryName = fields[COL_COUNTRY_NAME];
    const periodLabel = toISOPeriod(fields[COL_TIME_LABEL]);

    // Skip header artifact row
    if (countryName === "国籍・地域" || periodLabel === "集計時点（半期毎）") continue;

    if (!(countryName in COUNTRY_MAP)) {
      unmapped.add(countryName);
      continue;
    }

    const isoCode = COUNTRY_MAP[countryName];
    if (isoCode === null) continue; // aggregate or subset — skip

    const total = parseValue(fields[COL_TOTAL]);

    const entry = { total };
    for (let v = 0; v < VISA_TYPES.length; v++) {
      const val = parseValue(fields[COL_VISA_START + v]);
      if (val !== null) entry[VISA_TYPES[v]] = val;
    }

    if (!byPeriod[periodLabel]) byPeriod[periodLabel] = {};
    byPeriod[periodLabel][isoCode] = entry;
    periodSet.add(periodLabel);
  }

  // ISO "YYYY-MM" strings sort lexicographically
  const periods = [...periodSet].sort();

  if (unmapped.size > 0) {
    console.warn("Unmapped country names (check countryMap.js):", [...unmapped]);
  }

  const output = { periods, visaTypes: VISA_TYPES, data: byPeriod };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output));

  const kb = (fs.statSync(OUT_PATH).size / 1024).toFixed(1);
  const countryCount = Object.keys(byPeriod[periods[periods.length - 1]] || {}).length;
  console.log(`Written: ${OUT_PATH}`);
  console.log(`  Periods : ${periods.length}  (${periods[0]} → ${periods[periods.length - 1]})`);
  console.log(`  Countries in latest period: ${countryCount}`);
  console.log(`  File size: ${kb} KB`);
}

main();
