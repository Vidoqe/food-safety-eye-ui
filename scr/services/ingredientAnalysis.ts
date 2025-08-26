// scr/services/ingredientAnalysis.ts
// put near the top of the file
const riskToBadge = (r: string) =>
  r === 'harmful' ? '🔴' : r === 'moderate' ? '🟡' : '🟢';
export type Risk = 'healthy' | 'low' | 'moderate' | 'harmful';

export interface IngredientRow {
  // Back-compat: UI can keep using `name`
  name: string;       // alias of name_en
  name_en: string;
  name_zh: string;
  status: Risk;
  badge: string;      // 🔴 🟡 🟢
  childSafe: boolean;
  reason?: string;
  matchedKey?: string; // which dictionary key matched (for debug)
}

export interface AnalysisResult {
  verdict: 'healthy' | 'moderate' | 'harmful';
  ingredients: IngredientRow[];
  tips?: string[];
  summary?: string;
}

/** Risk → badge fallback */
const RISK_BADGE: Record<Risk, string> = {
  harmful: '🔴',
  moderate: '🟡',
  low: '🟢',
  healthy: '🟢',
};

/** Canonical additive dictionary (extend freely) */
const ADDITIVES: Record<
  string,
  {
    status: Risk;
    name_en: string;
    name_zh: string;
    childSafe?: boolean;
    reason?: string;
    badge?: string;
    aliases?: string[]; // alternate spellings/keywords
  }
> = {
  'aspartame': {
    status: 'moderate',
    name_en: 'Aspartame',
    name_zh: '阿斯巴甜',
    childSafe: false,
    reason: 'Artificial sweetener; limit intake especially for children.',
    badge: '🟡',
    aliases: ['e951'],
  },
  'sodium nitrite': {
    status: 'harmful',
    name_en: 'Sodium Nitrite',
    name_zh: '亞硝酸鈉',
    childSafe: false,
    reason: 'Cured meats additive; associated with nitrosamines. Avoid frequent intake.',
    badge: '🔴',
    aliases: ['e250', 'nitrite'],
  },
  'sodium benzoate': {
    status: 'moderate',
    name_en: 'Sodium Benzoate',
    name_zh: '苯甲酸鈉',
    childSafe: false,
    reason: 'Preservative; generally safe within limits but best to limit for children.',
    badge: '🟡',
    aliases: ['e211', 'benzoate'],
  },
  'tartrazine': {
    status: 'harmful',
    name_en: 'Tartrazine (Yellow 5)',
    name_zh: '柠檬黃 (黃色5號)',
    childSafe: false,
    reason: 'Artificial color; may cause sensitivity in some children.',
    badge: '🔴',
    aliases: ['e102', 'yellow 5'],
  },
  'caffeine': {
    status: 'moderate',
    name_en: 'Caffeine',
    name_zh: '咖啡因',
    childSafe: false,
    reason: 'Stimulant; not recommended for children.',
    badge: '🟡',
  },
  'preservatives': {
    status: 'moderate',
    name_en: 'Preservatives',
    name_zh: '防腐劑',
    childSafe: false,
    reason: 'Generic preservative category; check specific additive.',
    badge: '🟡',
  },
  // Safe/common
  'water': {
    status: 'healthy',
    name_en: 'Water',
    name_zh: '水',
    childSafe: true,
    reason: 'No known risk.',
    badge: '🟢',
  },
  'sugar': {
    status: 'low',
    name_en: 'Sugar',
    name_zh: '糖',
    childSafe: true,
    reason: 'High intake is not recommended; moderate use acceptable.',
    badge: '🟢',
  },
};

/** Normalize a raw ingredient token for matching */
function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parentheses content
    .replace(/[^a-z0-9\s\-]/g, '') // keep alnum, space, dash
    .trim();
}

/** Try to find a dictionary match, considering aliases */
function findDictionaryMatch(norm: string): { key: string; item: (typeof ADDITIVES)[string] } | null {
  if (ADDITIVES[norm]) return { key: norm, item: ADDITIVES[norm] };

  // search aliases
  for (const [key, item] of Object.entries(ADDITIVES)) {
    if (item.aliases?.some(a => a === norm)) {
      return { key, item };
    }
  }
  // loose contains (e.g. "sodium nitrite" in "sodium nitrite/cure mix")
  for (const [key, item] of Object.entries(ADDITIVES)) {
    if (norm.includes(key)) return { key, item };
    if (item.aliases?.some(a => norm.includes(a))) return { key, item };
  }

  return null;
}

function riskToBadge(risk: Risk): string {
  return RISK_BADGE[risk] ?? '🟡';
}

/** Compute overall verdict from individual rows */
function overallVerdict(rows: IngredientRow[]): AnalysisResult['verdict'] {
  if (rows.some(r => r.status === 'harmful')) return 'harmful';
  if (rows.some(r => r.status === 'moderate')) return 'moderate';
  return 'healthy';
}

export class IngredientAnalysisService {
  /**
   * Analyze a comma/line separated string of ingredients.
   * Keeps bilingual names and provides `name` = `name_en` for back-compat.
   */
  static async analyzeIngredients(
    ingredients: string,
    _subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'
  ): Promise<AnalysisResult> {
    const tokens = (ingredients || '')
      .split(/[,;\n]+/g)
      .map(t => t.trim())
      .filter(Boolean);

    const rows: IngredientRow[] = tokens.map((raw) => {
      const norm = normalizeToken(raw);
      const match = findDictionaryMatch(norm);

      if (match) {
        const { key, item } = match;
        const status = item.status;
        const badge = item.badge ?? riskToBadge(status);
        const childSafe = typeof item.childSafe === 'boolean'
          ? item.childSafe
          : status === 'healthy' || status === 'low';

        return {
          name: item.name_en,          // back-compat for UI
          name_en: item.name_en,
          name_zh: item.name_zh,
          status,
          badge,
          childSafe,
          reason: item.reason,
          matchedKey: key,
        };
      }

      // Unknown ingredient: neutral/moderate with safe defaults
      const status: Risk = 'moderate';
      return {
        name: raw,            // show the original token in UI
        name_en: raw,
        name_zh: '',
        status,
        badge: riskToBadge(status),
        childSafe: false,
        reason: 'Unrecognized ingredient. Consider checking manually.',
      };
    });

    const verdict = overallVerdict(rows);
    const tips: string[] = [];

    if (rows.some(r => r.status === 'harmful')) {
      tips.push('Contains high-risk additives. Consider avoiding, especially for children.');
    } else if (rows.some(r => r.status === 'moderate')) {
      tips.push('Contains moderate-risk additives. Limit intake.');
    } else {
      tips.push('No notable risky additives found.');
    }

    return {
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
  }
}

export default IngredientAnalysisService;

