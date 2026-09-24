// test change
// scr/services/ingredientAnalysis.ts

// Risk → Badge mapping
export type Risk = 'healthy' | 'low' | 'moderate' | 'harmful';

const RISK_BADGE: Record<Risk, string> = {
  harmful: '🔴',
  moderate: '🟡',
  low: '🟢',
  healthy: '🟢',
};

export interface IngredientRow {
  // Back-compat: UI can keep using `name`
  name: string;
  name_en: string; // alias of name
  name_zh: string;
  status: Risk;
  badge: string; // 🔴🟡🟢
  childSafe: boolean;
  reason?: string;
taiwanRegulation?: string;
taiwanRegulationZh?: string;
  matchedKey?: string; // which dictionary key matched (for debug)
}

export interface AnalysisResult {
  verdict: 'healthy' | 'moderate' | 'harmful';
  ingredients: IngredientRow[];
  tips?: string[];
  summary?: string;
}

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
    aliases?: string[];
taiwanRegulation?: string;
taiwanRegulationZh?: string;
  }
> = {
  aspartame: {
    status: 'moderate',
    name_en: 'Aspartame',
    name_zh: '阿斯巴甜',
    childSafe: false,
    reason: 'Artificial sweetener; limit intake especially for children.',
    badge: '🟡',
    aliases: ['e951'],
taiwanRegulation: 'TFDA: Permitted in foods as practically needed when necessary for manufacturing or processing. Foods containing aspartame must carry a warning for people with phenylketonuria (PKU) because it contains phenylalanine.',
taiwanRegulationZh: 'TFDA：阿斯巴甜可於食品製造或加工有需要時，依實際需要適量使用。含阿斯巴甜之食品應以中文顯著標示「苯酮尿症患者不宜使用」或同等意義字樣，並提醒含有苯丙胺酸。',

  },
  'sodium nitrite': {
    status: 'harmful',
    name_en: 'Sodium Nitrite',
    name_zh: '亞硝酸鈉',
    childSafe: false,
    reason: 'Cured meats additive; associated with nitrosamines. Avoid frequent intake.',
    badge: '🔴',
    aliases: ['e250', 'nitrite'],
taiwanRegulation: 'TFDA: Permitted in meat and fish products with NO2 residual ≤0.07 g/kg; salmon/cod roe products ≤0.0050 g/kg. Not permitted in fresh meat, fresh fish or fresh fish roe.',
taiwanRegulationZh: 'TFDA：亞硝酸鈉可用於規定的肉類及水產加工品；亞硝酸根殘留量依食品類別受限。肉製品及魚製品一般不得超過 0.07 g/kg；鮭魚卵、鱈魚卵製品不得超過 0.0050 g/kg。新鮮肉類、新鮮魚類及新鮮魚卵不得使用。',
  },
  'sodium benzoate': {
    status: 'moderate',
    name_en: 'Sodium Benzoate',
    name_zh: '苯甲酸鈉',
    childSafe: false,
    reason: 'Preservative; generally safe within limits but best to limit for children.',
    badge: '🟡',
    aliases: ['e211', 'benzoate'],
taiwanRegulation: 'TFDA: Permitted only in specified food categories. Maximum levels vary by food; commonly ≤1.0 g/kg or ≤0.6 g/kg, calculated as benzoic acid.',
taiwanRegulationZh: 'TFDA：苯甲酸鈉僅可用於規定的食品類別，各類食品的最高使用量不同；一般以苯甲酸計，不得超過 1.0 g/kg 或 0.6 g/kg，依食品類別而定。',
  },
  tartrazine: {
    status: 'harmful',
    name_en: 'Tartrazine (Food Yellow No. 4)',
name_zh: '食用黃色四號',
    childSafe: false,
    reason: 'Artificial color; may cause sensitivity in some children.',
    badge: '🔴',
    aliases: ['e102', 'yellow 5', 'yellow 4', 'food yellow no. 4', '食用黃色四號'],
taiwanRegulation: 'TFDA: Permitted in foods as practically needed, but not allowed in fresh raw meat, fish, shellfish, beans, vegetables, fruits, miso, soy sauce, seaweed or tea.',
taiwanRegulationZh: 'TFDA：可於各類食品中視實際需要適量使用，但生鮮肉類、生鮮魚貝類、生鮮豆類、生鮮蔬菜、生鮮水果、味噌、醬油、海帶、海苔、茶等不得使用。',

  },
  caffeine: {
    status: 'moderate',
    name_en: 'Caffeine',
    name_zh: '咖啡因',
    childSafe: false,
    reason: 'Stimulant; not recommended for children.',
    badge: '🟡',
taiwanRegulation: 'TFDA: Caffeine may be used in beverages as a flavouring agent; total caffeine must not exceed 320 mg/kg. Not permitted in infant foods.',
taiwanRegulationZh: 'TFDA：咖啡因可作為調味劑使用於飲料，飲料中咖啡因總含量不得超過 320 mg/kg。嬰兒食品不得使用。',
  },
  preservatives: {
    status: 'moderate',
    name_en: 'Preservatives',
    name_zh: '防腐劑',
    childSafe: false,
    reason: 'Generic preservative category; check specific additive.',
    badge: '🟡',
taiwanRegulation: 'TFDA: Preservative limits depend on the specific preservative and food category. The individual additive must be identified to determine the permitted use and maximum level.',
taiwanRegulationZh: 'TFDA：防腐劑的使用範圍及限量依個別防腐劑及食品類別而定，須確認具體添加物後才能判定其准用範圍及最高使用量。',
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
    reason: 'High intake is not recommended; moderate use acceptable.',
    badge: '🟢',
  },

'sodium nitrate': {
  status: 'moderate',
  name_en: 'Sodium Nitrate',
  name_zh: '硝酸鈉',
  childSafe: false,
  reason: 'Curing preservative; intake should be limited, particularly in processed meats.',
  badge: '🟡',
  aliases: ['e251', 'nitrate'],
taiwanRegulation: 'TFDA: Permitted in meat and fish products with residual NO2 ≤0.07 g/kg; salmon and cod roe products ≤0.0050 g/kg. Not permitted in fresh raw meat, fresh raw fish or fresh raw roe.',
taiwanRegulationZh: 'TFDA：硝酸鈉可用於肉製品及魚肉製品，以 NO2 殘留量計不得超過 0.07 g/kg；鮭魚卵及鱈魚卵製品不得超過 0.0050 g/kg。生鮮肉類、生鮮魚肉類及生鮮魚卵不得使用。',

},
'potassium nitrate': {
  status: 'moderate',
  name_en: 'Potassium Nitrate',
  name_zh: '硝酸鉀',
  childSafe: false,
  reason: 'Curing preservative; intake should be limited, particularly in processed meats.',
  badge: '🟡',
  aliases: ['e252', 'potassium nitrate'],
taiwanRegulation: 'TFDA: Permitted in meat and fish products with residual NO2 ≤0.07 g/kg; salmon and cod roe products ≤0.0050 g/kg. Not permitted in fresh raw meat, fresh raw fish or fresh raw roe.',
taiwanRegulationZh: 'TFDA：硝酸鉀可用於肉製品及魚肉製品，以 NO2 殘留量計不得超過 0.07 g/kg；鮭魚卵及鱈魚卵製品不得超過 0.0050 g/kg。生鮮肉類、生鮮魚肉類及生鮮魚卵不得使用。',

},
'bha': {
  status: 'moderate',
  name_en: 'BHA',
  name_zh: '丁基羥基甲氧苯',
  childSafe: false,
  reason: 'Synthetic antioxidant used to prevent fats and oils from becoming rancid.',
  badge: '🟡',
  aliases: ['e320', 'butylated hydroxyanisole'],
taiwanRegulation: 'TFDA: Permitted only in specified foods. Maximum BHA levels range from 0.010 to 1.0 g/kg depending on food category, including fats/oils ≤0.20 g/kg and chewing/bubble gum ≤0.75 g/kg.',
taiwanRegulationZh: 'TFDA：BHA（丁基羥基甲氧苯）僅可使用於規定食品；依食品類別最高使用量為 0.010–1.0 g/kg，其中油脂類不得超過 0.20 g/kg，口香糖及泡泡糖不得超過 0.75 g/kg。',

},
'bht': {
  status: 'moderate',
  name_en: 'BHT',
  name_zh: '二丁基羥基甲苯',
  childSafe: false,
  reason: 'Synthetic antioxidant used to preserve fats and oils.',
  badge: '🟡',
  aliases: ['e321', 'butylated hydroxytoluene'],
taiwanRegulation: 'TFDA: Permitted only in specified foods. Maximum BHT levels range from 0.010 to 1.0 g/kg depending on food category, including fats/oils ≤0.20 g/kg and chewing/bubble gum ≤0.75 g/kg.',
taiwanRegulationZh: 'TFDA：BHT（二丁基羥基甲苯）僅可使用於規定食品；依食品類別最高使用量為 0.010–1.0 g/kg，其中油脂類不得超過 0.20 g/kg，口香糖及泡泡糖不得超過 0.75 g/kg。',

},
'tbhq': {
  status: 'moderate',
  name_en: 'TBHQ',
  name_zh: '第三丁基氫醌',
  childSafe: false,
  reason: 'Antioxidant preservative; intake should remain within permitted limits.',
  badge: '🟡',
  aliases: ['e319', 'tert-butylhydroquinone', 'tertiary butylhydroquinone'],
taiwanRegulation: 'TFDA: TBHQ is permitted as an antioxidant in fats, oils, cheese and butter, with a maximum level of 0.20 g/kg.',
taiwanRegulationZh: 'TFDA：第三丁基氫醌（TBHQ）可作為抗氧化劑使用於油脂、乳酪及奶油，最高使用量為 0.20 g/kg。',

},
'sodium metabisulfite': {
  status: 'moderate',
  name_en: 'Sodium Metabisulfite',
  name_zh: '偏亞硫酸氫鈉',
  childSafe: false,
  reason: 'Sulfite preservative; may cause reactions in sulfite-sensitive individuals.',
  badge: '🟡',
  aliases: ['e223', 'sodium metabisulphite'],
taiwanRegulation: 'TFDA: Permitted only in specified food categories. Maximum levels vary by food and are calculated as residual SO2; the applicable food category must be checked.',
taiwanRegulationZh: 'TFDA：偏亞硫酸氫鈉僅可使用於規定的食品類別，各類食品限量不同，並以二氧化硫（SO2）殘留量計算，須依食品類別確認適用限量。',

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
    if (item.aliases?.some((a) => a === norm)) {
      return { key, item };
    }
  }

  // loose contains (e.g. "sodium nitrite" in "sodium nitrite/cure mix")
  for (const [key, item] of Object.entries(ADDITIVES)) {
    if (norm.includes(key)) return { key, item };
    if (item.aliases?.some((a) => norm.includes(a))) return { key, item };
  }

  return null;
}

/** Compute overall verdict from individual rows */
function overallVerdict(rows: IngredientRow[]): AnalysisResult['verdict'] {
  if (rows.some((r) => r.status === 'harmful')) return 'harmful';
  if (rows.some((r) => r.status === 'moderate')) return 'moderate';
  return 'healthy';
}

export class IngredientAnalysisService {
  /**
   * Analyze a comma/line separated string of ingredients.
   * Keeps bilingual names and provides `name` = `name_en` for back-compat.
   */
  static async analyzeIngredients(
  ingredients: string,
  _subscriptionPlan: 'free' | 'premium' | 'gold' = 'free',
  language: 'zh' | 'en' = 'en'
): Promise<AnalysisResult> {
    const tokens = (ingredients || '')
      .split(/,|\n|;/)
      .map((t) => t.trim())
      .filter(Boolean);

    const rows: IngredientRow[] = tokens.map((raw) => {
      const norm = normalizeToken(raw);
      const match = findDictionaryMatch(norm);

      if (match) {
  const { key, item } = match;
  const status = item.status;
  const badge = item.badge ?? (RISK_BADGE[status] ?? '🟡');
  const childSafe =
    typeof item.childSafe === 'boolean'
      ? item.childSafe
      : status === 'healthy' || status === 'low';

  return {
  name: item.name_en || item.name || '',
  name_en: item.name_en || item.name || '',
  name_zh: item.name_zh || '',
    status,
    badge,
    childSafe,
    reason: item.reason,
  taiwanRegulation: item.taiwanRegulation,
  taiwanRegulationZh: item.taiwanRegulationZh,
    matchedKey: key,
  };
}

// Unknown ingredient: neutral/moderate with safe defaults
const status: Risk = 'moderate';
return {
  name: raw,
  name_en: raw,
  name_zh: raw,
  status,
  badge: RISK_BADGE[status] ?? '🟡',
  childSafe: false,
  reason: 'Unrecognized ingredient. Consider checking manually.',
};
});

   const verdict = overallVerdict(rows);
const tips: string[] = [];

if (rows.some((r) => r.status === 'harmful')) {
tips.push(
  language === 'zh'
    ? '含有高風險添加物，建議避免食用，尤其是兒童。': 'Contains high-risk additives. Consider avoiding, especially for children.'
);
} else if (rows.some((r) => r.status === 'moderate')) {
tips.push(
  language === 'zh'
    ? '含有中等風險添加物，建議限制攝取量。'
: 'Contains moderate-risk additives. Limit intake.'
);
} else {
tips.push(
  language === 'zh'
    ? '未發現明顯的高風險添加物。': 'No notable risky additives found.'
);
}   return {
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

