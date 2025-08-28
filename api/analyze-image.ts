// /api/analyze-image.ts
// Edge-ready image/label analyzer using a cached, public JSON dataset
// Works with POST body: { "overrideText": "Sodium Nitrite, Tartrazine, Caffeine" }

export const config = { runtime: "edge" };

/* ------------ Types ------------ */
type Risk = "healthy" | "low" | "moderate" | "harmful";

type Additive = {
  name_en: string;
  name_zh: string;
  e_code: string | null;
  category?: string | null;
  status: Risk;
  childSafe: boolean;
  legal?: {
    restriction?: "Allowed" | "Restricted" | "Banned" | string;
    notes?: string;
  };
  aliases?: string[];
};

type AdditiveDict = Record<string, Additive>;

type IngredientRow = {
  name: string;
  name_en: string;
  name_zh: string;
  status: Risk;
  badge: string;
  childSafe: boolean;
  reason?: string;
  matchedKey?: string;
};

type AnalysisResult = {
  verdict: "healthy" | "moderate" | "harmful";
  ingredients: IngredientRow[];
  tips: string[];
  summary?: string;
};

/* ------------ UI Badges ------------ */
const RISK_BADGE: Record<Risk, string> = {
  harmful: "🔴",
  moderate: "🟠",
  low: "🟢",
  healthy: "🟢",
};

/* ------------ Dataset cache (public/data/tw-additives.json) ------------ */
let ADDITIVES_CACHE: AdditiveDict | null = null;
let ALIAS_INDEX: Array<{ key: string; alias: string }> | null = null;

async function loadAdditives(origin: string): Promise<void> {
  if (ADDITIVES_CACHE) return;

  const url = `${origin}/data/tw-additives.json`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load additives: ${res.status} ${res.statusText}`);
  }

  const raw = (await res.json()) as AdditiveDict;

  // normalize keys + build alias/e-code index
  const normalized: AdditiveDict = {};
  const aliasPairs: Array<{ key: string; alias: string }> = [];

  for (const [k, v] of Object.entries(raw)) {
    const baseKey = k.trim().toLowerCase();
    normalized[baseKey] = v;

    const aliases = new Set<string>([
      baseKey,
      ...(v.aliases || []).map((a) => a.trim().toLowerCase()),
      ...(v.e_code ? [v.e_code.trim().toLowerCase()] : []),
      v.name_en.trim().toLowerCase(),
      v.name_zh.trim().toLowerCase(),
    ]);

    for (const a of aliases) aliasPairs.push({ key: baseKey, alias: a });
  }

  ADDITIVES_CACHE = normalized;
  ALIAS_INDEX = aliasPairs;
}

/* ------------ Helpers ------------ */

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/\(([^)]*)\)/g, "") // remove (...) content
    .replace(/[^a-z0-9\s\-]/g, "") // keep a-z 0-9 space dash
    .trim();
}

function riskToBadge(risk: Risk): string {
  return RISK_BADGE[risk] ?? "🟡";
}

function findDictionaryMatch(norm: string): { key: string; item: Additive } | null {
  if (!ADDITIVES_CACHE || !ALIAS_INDEX) return null;

  // 1) exact key
  if (ADDITIVES_CACHE[norm]) return { key: norm, item: ADDITIVES_CACHE[norm] };

  // 2) exact alias/e-code/name
  const exact = ALIAS_INDEX.find((p) => p.alias === norm);
  if (exact) return { key: exact.key, item: ADDITIVES_CACHE[exact.key] };

  // 3) loose contains either way
  for (const p of ALIAS_INDEX) {
    if (norm.includes(p.alias) || p.alias.includes(norm)) {
      return { key: p.key, item: ADDITIVES_CACHE[p.key] };
    }
  }
  return null;
}

function overallVerdict(rows: IngredientRow[]): AnalysisResult["verdict"] {
  if (rows.some((r) => r.status === "harmful")) return "harmful";
  if (rows.some((r) => r.status === "moderate")) return "moderate";
  return "healthy";
}

/* ------------ Edge API Handler ------------ */

export default async function handler(request: Request): Promise<Response> {
  try {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method Not Allowed" }, 405);
    }

    // 1) load dataset (cached for the life of the edge worker)
    const origin = new URL(request.url).origin;
    await loadAdditives(origin);

    // 2) parse body
    const body = await request.json().catch(() => ({} as any));
    const overrideText: string | undefined = body.overrideText;
    const imageBase64: string | undefined = body.imageBase64; // reserved for future OCR

    if (!overrideText && !imageBase64) {
      return json(
        { ok: false, error: "Provide overrideText or imageBase64" },
        400
      );
    }

    // 3) build tokens (label text path)
    const tokens = (overrideText || "")
      .split(/,|;|\n/g)
      .map((t) => t.trim())
      .filter(Boolean);

    // 4) analyze
    const rows: IngredientRow[] = tokens.map((raw) => {
      const norm = normalizeToken(raw);
      const match = findDictionaryMatch(norm);

      if (match) {
        const { key, item } = match;
        const status = item.status;
        const badge = item.legal?.restriction === "Banned" ? "⛔️" : riskToBadge(status);

        const parts = [
          item.category || "",
          item.legal?.restriction ? `Rule: ${item.legal.restriction}` : "",
          item.legal?.notes || "",
        ].filter(Boolean);

        return {
          name: item.name_en,
          name_en: item.name_en,
          name_zh: item.name_zh,
          status,
          badge,
          childSafe: item.childSafe,
          reason: parts.join(" · "),
          matchedKey: key,
        };
      }

      // fallback (unknown)
      return {
        name: raw,
        name_en: raw,
        name_zh: "",
        status: "moderate",
        badge: riskToBadge("moderate"),
        childSafe: false,
        reason: "Unrecognized ingredient; consider checking manually.",
      };
    });

    const verdict = overallVerdict(rows);
    const tips: string[] = [];
    if (rows.some((r) => r.status === "harmful")) {
      tips.push("Contains high-risk additives. Consider avoiding, especially for children.");
    } else if (rows.some((r) => r.status === "moderate")) {
      tips.push("Contains moderate-risk additives. Limit intake.");
    } else {
      tips.push("No notable risky additives found.");
    }

    const result: AnalysisResult = {
      verdict,
      ingredients: rows,
      tips,
      summary:
        verdict === "harmful"
          ? "High-risk additives detected."
          : verdict === "moderate"
          ? "Some moderate-risk additives present."
          : "Generally safe.",
    };

    return json({ ok: true, result });
  } catch (err: any) {
    return json(
      { ok: false, error: err?.message || "Internal Server Error" },
      500
    );
  }
}

/* ------------ tiny JSON helper ------------ */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
