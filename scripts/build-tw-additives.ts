// scripts/build-tw-additives.ts
// Convert public/data/tw-additives-source.csv (official TFDA list) -> public/data/tw-additives.json
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

type Risk = "healthy" | "low" | "moderate" | "harmful";

type TwRow = {
  name_zh?: string;
  name_en?: string;
  category?: string;
  e_code?: string;
  restriction?: string;
  notes?: string;
};

type OutItem = {
  status: Risk;
  name_en: string;
  name_zh: string;
  e_code?: string;
  category?: string;
  childSafe?: boolean;
  reason?: string;
  badge?: string;
  aliases?: string[];
  legal?: {
    restriction?: string;
    notes?: string;
  };
};

type OutDict = Record<string, OutItem>;

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public", "data", "tw-additives-source.csv");
const OUT = path.join(ROOT, "public", "data", "tw-additives.json");
const OVERRIDES = path.join(ROOT, "public", "data", "tw-additives-overrides.json");

const BADGES: Record<Risk, string> = {
  harmful: "🔴",
  moderate: "🟡",
  low: "🟢",
  healthy: "🟢"
};

function norm(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()]/g, "")
    .trim();
}

function pick(o: any, keys: string[]) {
  for (const k of keys) {
    if (o[k] != null && String(o[k]).trim() !== "") return String(o[k]);
  }
  return "";
}

function inferRisk(category: string, name_en: string): Risk {
  const c = norm(category);
  const n = norm(name_en);
  // quick heuristics; conservative defaults
  if (/(nitrite|nitrate)/.test(n)) return "harmful";
  if (/tartrazine|e102|yellow 5/.test(n)) return "harmful";
  if (/benzoate|sorbate|sulphite|sulfite/.test(n)) return "moderate";
  if (/caffeine/.test(n)) return "moderate";
  if (/color|colour/.test(c)) return "moderate";
  if (/preservative/.test(c)) return "moderate";
  if (/antioxidant|emulsifier|stabilizer|thickener|acidity regulator/.test(c)) return "low";
  return "moderate";
}

function buildKeyCandidates(name_en: string, name_zh: string, e_code?: string) {
  const keys = new Set<string>();
  const ne = norm(name_en);
  const nz = norm(name_zh);
  if (ne) keys.add(ne);
  if (nz) keys.add(nz);
  if (e_code) keys.add(norm(e_code));
  if (e_code && /^E?\s*\d+$/i.test(e_code)) keys.add("e" + e_code.replace(/[^0-9]/g, ""));
  return Array.from(keys);
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Missing CSV: ${SRC}`);
    process.exit(1);
  }

  const buf = fs.readFileSync(SRC);
  const rows = parse(buf, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as any[];

  const overrides: Record<string, any> = fs.existsSync(OVERRIDES)
    ? JSON.parse(fs.readFileSync(OVERRIDES, "utf8"))
    : {};

  const out: OutDict = {};

  for (const raw of rows) {
    const row: TwRow = {
      name_zh: pick(raw, ["name_zh", "中文品名", "品名", "中文名稱"]),
      name_en: pick(raw, ["name_en", "英文品名", "英文名稱"]),
      category: pick(raw, ["category", "功能類別", "用途類別"]),
      e_code: pick(raw, ["e_code", "E code", "E-code", "代號", "E編碼", "編號"]),
      restriction: pick(raw, ["restriction", "使用限制", "限制說明"]),
      notes: pick(raw, ["notes", "備註"])
    };

    const name_en = row.name_en || row.name_zh || "";
    const name_zh = row.name_zh || row.name_en || "";
    if (!name_en && !name_zh) continue;

    const risk: Risk = inferRisk(row.category || "", name_en);
    const itemBase: OutItem = {
      status: risk,
      name_en,
      name_zh,
      e_code: row.e_code || undefined,
      category: row.category || undefined,
      childSafe: risk === "healthy" || risk === "low",
      reason: row.notes || row.restriction || "",
      badge: BADGES[risk],
      aliases: [],
      legal: {
        restriction: row.restriction || undefined,
        notes: row.notes || undefined
      }
    };

    const candidates = buildKeyCandidates(name_en, name_zh, row.e_code);
    let merged = { ...itemBase };
    let mergedAliases: string[] = [];

    for (const k of candidates) {
      const o = overrides[k];
      if (o) {
        if (o.status) merged.status = o.status;
        if (typeof o.childSafe === "boolean") merged.childSafe = o.childSafe;
        if (o.notes) merged.reason = o.notes;
        if (o.aliases) mergedAliases = mergedAliases.concat(o.aliases.map(norm));
      }
    }
    merged.badge = BADGES[merged.status];

    const primaryKey = candidates[0]!;
    const aliasSet = new Set(
      mergedAliases
        .concat(candidates)
        .concat([merged.name_en, merged.name_zh, merged.e_code || ""].map(norm))
        .filter(Boolean)
    );
    aliasSet.delete(primaryKey);
    merged.aliases = Array.from(aliasSet);

    out[primaryKey] = merged;
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`✅ Built ${OUT} with ${Object.keys(out).length} additives.`);
}

main();
