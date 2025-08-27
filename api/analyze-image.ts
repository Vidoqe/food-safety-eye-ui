// /api/analyze-image.ts  (ESM-only, no imports)

type Risk = 'healthy' | 'low' | 'moderate' | 'harmful';

interface IngredientRow {
  name: string;     // original token
  name_en: string;  // english label
  name_zh: string;  // chinese label
  status: Risk;
  badge: string;    // colored dot
  childSafe: boolean;
  reason?: string;
  matchedKey?: string;
}

interface AnalysisResult {
  verdict: 'healthy' | 'moderate' | 'harmful';
  ingredients: IngredientRow[];
  tips: string[];
  summary?: string;
}

const RISK_BADGE: Record<Risk, string> = {
  harmful: '🔴',
  moderate: '🟡',
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
    badge: '🟡',
  },
  preservatives: {
    status: 'moderate',
    name_en: 'Preservatives',
    name_zh: '防腐劑',
    childSafe: false,
    reason:
      'Generic preservative category; check the specific additive details.',
    badge: '🟡',
  },
  sugar: {
    status: 'low',
    name_en: 'Sugar',
    name_zh: '糖',
    childSafe: true,
    reason: 'High intake not recommended; moderate use acceptable.',
    badge: '🟢',
  },
  water: {
    status: 'healthy',
    name_en: 'Water',
    name_zh: '水',
    childSafe: true,
    reason: 'No known risk.',
    badge: '🟢',
  },
};

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
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

function overallVerdict(rows: IngredientRow[]): AnalysisResult['verdict'] {
  if (rows.some((r) => r.status === 'harmful')) return 'harmful';
  if (rows.some((r) => r.status === 'moderate')) return 'moderate';
  return 'healthy';
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const body = req.body ?? {};
    const overrideText: string | undefined = body.overrideText;
    const imageBase64: string | undefined = body.imageBase64; // reserved

    if (!overrideText && !imageBase64) {
      return res
        .status(400)
        .json({ ok: false, error: 'Provide overrideText or imageBase64' });
    }

    // For now we only handle text
    const raw = overrideText ?? '';
    const tokens = (raw || '')
      .split(/[,\n]/g)
      .map((t) => t.trim())
      .filter(Boolean);

    const rows: IngredientRow[] = tokens.map((rawToken) => {
      const norm = normalizeToken(rawToken);
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
          name: rawToken,
          name_en: item.name_en,
          name_zh: item.name_zh,
          status,
          badge,
          childSafe,
          reason: item.reason,
          matchedKey: key,
        };
      }

      const status: Risk = 'moderate';
      return {
        name: rawToken,
        name_en: rawToken,
        name_zh: rawToken,
        status,
        badge: riskToBadge(status),
        childSafe: false,
        reason: 'Unrecognized ingredient. Consider checking manually.',
        matchedKey: '',
      };
    });

    const verdict = overallVerdict(rows);
    const tips: string[] = [];
    if (rows.some((r) => r.status === 'harmful')) {
      tips.push('Contains high-risk additives. Consider avoiding, especially for children.');
    } else if (rows.some((r) => r.status === 'moderate')) {
      tips.push('Contains moderate-risk additives. Limit intake.');
    } else {
      tips.push('No notable risky additives found.');
    }

    const summary =
      verdict === 'harmful'
        ? 'High-risk additives detected.'
        : verdict === 'moderate'
        ? 'Some moderate-risk additives present.'
        : 'Generally safe.';

    const result: AnalysisResult = { verdict, ingredients: rows, tips, summary };

    return res.status(200).json({ ok: true, result });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || 'Internal Server Error' });
  }
}
