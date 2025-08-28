// /api/analyze-image.ts
export const config = { runtime: 'edge' }; // Run as ESM-friendly Edge function

type Risk = 'healthy' | 'low' | 'moderate' | 'harmful';

const RISK_BADGE: Record<Risk, string> = {
  harmful: '🔴',
  moderate: '🟠',
  low: '🟢',
  healthy: '🟢',
};

const ADDITIVES: Record<
  string,
  {
    status: Risk;
    name_en: string;
    name_zh: string;
    childSafe?: boolean;
    reason?: string;
    badge?: string;
    aliases?: string[];
  }
> = {
  // a few examples—extend freely
  'sodium nitrite': {
    status: 'harmful',
    name_en: 'Sodium Nitrite',
    name_zh: '亞硝酸鈉',
    childSafe: false,
    reason:
      'Cured meats additive; associated with nitrosamines. Avoid frequent intake.',
    badge: '🔴',
    aliases: ['e250', 'nitrite'],
  },
  'sodium benzoate': {
    status: 'moderate',
    name_en: 'Sodium Benzoate',
    name_zh: '苯甲酸鈉',
    childSafe: false,
    reason:
      'Preservative; generally safe within limits but best to limit for children.',
    badge: '🟠',
    aliases: ['e211', 'benzoate'],
  },
  tartrazine: {
    status: 'harmful',
    name_en: 'Tartrazine (Yellow 5)',
    name_zh: '柠檬黃（黃色5號）',
    childSafe: false,
    reason: 'Artificial color; may cause sensitivity in some children.',
    badge: '🔴',
    aliases: ['e102', 'yellow 5'],
  },
  caffeine: {
    status: 'moderate',
    name_en: 'Caffeine',
    name_zh: '咖啡因',
    childSafe: false,
    reason: 'Stimulant; not recommended for children.',
    badge: '🟠',
  },
  water: {
    status: 'healthy',
    name_en: 'Water',
    name_zh: '水',
    childSafe: true,
    reason: 'No known risk.',
    badge: '🟢',
  },
  sugar: {
    status: 'low',
    name_en: 'Sugar',
    name_zh: '糖',
    childSafe: true,
    reason:
      'High intake is not recommended; moderate use acceptable for most people.',
    badge: '🟢',
  },
};

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/\(([^)]*)\)/g, '')
    .replace(/[^a-z0-9\s\-]/g, '')
    .trim();
}

function findDictionaryMatch(norm: string) {
  if (ADDITIVES[norm]) return { key: norm, item: ADDITIVES[norm] };
  for (const [key, item] of Object.entries(ADDITIVES)) {
    if (norm.includes(key)) return { key, item };
    if (item.aliases?.some((a) => norm.includes(a))) return { key, item };
  }
  return null;
}

function riskToBadge(risk: Risk): string {
  return RISK_BADGE[risk] ?? '🟡';
}

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
  verdict: 'healthy' | 'moderate' | 'harmful';
  ingredients: IngredientRow[];
  tips: string[];
  summary?: string;
};

function overallVerdict(rows: IngredientRow[]): AnalysisResult['verdict'] {
  if (rows.some((r) => r.status === 'harmful')) return 'harmful';
  if (rows.some((r) => r.status === 'moderate')) return 'moderate';
  return 'healthy';
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Method Not Allowed' }),
        { status: 405, headers: { 'content-type': 'application/json' } },
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      overrideText?: string;
      imageBase64?: string;
      overrideBarcode?: string;
    };

    const overrideText = body?.overrideText?.trim();
    const imageBase64 = body?.imageBase64?.trim();

    if (!overrideText && !imageBase64) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Provide overrideText or imageBase64',
        }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    }

    // For now we only use overrideText (comma/line separated)
    const tokens = (overrideText || '')
      .split(/,|\n/g)
      .map((t) => t.trim())
      .filter(Boolean);

    const rows: IngredientRow[] = tokens.map((raw) => {
      const norm = normalizeToken(raw);
      const match = findDictionaryMatch(norm);

      if (match) {
        const { key, item } = match;
        const status = item.status;
        const badge = item.badge ?? riskToBadge(status);
        const childSafe =
          typeof item.childSafe === 'boolean'
            ? item.childSafe
            : status === 'healthy' || status === 'low';

        return {
          name: item.name_en,
          name_en: item.name_en,
          name_zh: item.name_zh,
          status,
          badge,
          childSafe,
          reason: item.reason,
          matchedKey: key,
        };
      }

      // Unknown ingredient: conservative default
      const status: Risk = 'moderate';
      return {
        name: raw,
        name_en: raw,
        name_zh: '',
        status,
        badge: riskToBadge(status),
        childSafe: false,
        reason:
          'Unrecognized ingredient. Consider checking manually or reliable sources.',
      };
    });

    const verdict = overallVerdict(rows);
    const tips: string[] = [];

    if (rows.some((r) => r.status === 'harmful')) {
      tips.push(
        'Contains high-risk additives. Consider avoiding, especially for children.',
      );
    } else if (rows.some((r) => r.status === 'moderate')) {
      tips.push('Contains moderate-risk additives. Limit intake.');
    } else {
      tips.push('No notable risky additives found.');
    }

    const result: AnalysisResult = {
      verdict,
      ingredients: rows,
      tips,
      summary:
        verdict === 'harmful'
          ? 'High-risk additives detected.'
          : verdict === 'moderate'
          ? 'Some moderate-risk additives present.'
          : 'Generally safe.',
    };

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Server error',
        detail: String(err?.message || err),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}

