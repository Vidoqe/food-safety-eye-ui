// scr/services/ingredientAnalysis.ts

// Local, offline ingredient analyzer (no JWT / no external API)

// type-only import so Rollup/esbuild don’t expect a runtime value
import type { Ingredient } from '../contexts/AppContext';
import { GPTImageAnalysisService } from './gptImageAnalysis';
import type { GPTAnalysisResult } from './gptImageAnalysis';

// Taiwan-regulated / notable additives database (quick demo set)
const TAIWAN_REGULATED_ADDITIVES: Record<
  string,
  { english: string; risk: 'harmful' | 'moderate' | 'low'; badge: string; childSafe: boolean; symbol: string }
> = {
  { english: string; risk: 'harmful' | 'moderate' | 'low'; badge: '🔴' | '🟡' | '🟢'; childSafe: boolean; symbol: string; chinese?: string }
> = {
  // sweeteners / colors commonly discussed
  '阿斯巴甜': { english: 'Aspartame',    risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'aspartame': { english: 'Aspartame',   risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  '塔塔拉嗪': { english: 'Tartrazine',   risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⚠️' },
  'tartrazine': { english: 'Tartrazine', risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⚠️' },

  // preservatives
  '亞硝酸鈉': { english: 'Sodium Nitrite',   risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⚠️' },
  'sodium nitrite': { english: 'Sodium Nitrite', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  '苯甲酸鈉': { english: 'Sodium Benzoate',  risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'sodium benzoate': { english: 'Sodium Benzoate', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },

  // dyes
  '若丹明B': { english: 'Rhodamine B', risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '✖️' },
  'rhodamine b': { english: 'Rhodamine B', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '✖️' },

  // sweetener
  '環己基代硫脲': { english: 'Cyclamate', risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⚠️' },
  'cyclamate': { english: 'Cyclamate',    risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⚠️' },

  // buckets
  '防腐劑': { english: 'Preservatives',  risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'preservatives': { english: 'Preservatives', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  '人工色素': { english: 'Artificial Colors', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '🎨' },
  'artificial colors': { english: 'Artificial Colors', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '🎨' },

  // caffeine (info)
  '咖啡因': { english: 'Caffeine', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'caffeine': { english: 'Caffeine', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
};

// ------------------------------------------------------------
// Service
// ------------------------------------------------------------
export class IngredientAnalysisService {
  /**
   * Image → GPT analysis pass-through (still available when you need it)
   */
  static async analyzeProductImage(
    imageBase64: string,
    subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'
  ): Promise<GPTAnalysisResult> {
    return await GPTImageAnalysisService.analyzeProductImage(imageBase64, subscriptionPlan);
  }

  /**
   * Legacy/local text-based analyzer (no JWT / no external API)
   * Accepts a raw ingredient string (English/Chinese mix is fine).
   */
  static async analyzeIngredients(
    ingredientText: string,
    subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'
  ): Promise<{
    ingredients: Ingredient[];
    verdict: 'healthy' | 'moderate' | 'harmful';
    isNaturalProduct: boolean;
    regulatedAdditives: string[];
    errorMessage?: string;
    tips?: string[];
    junkFoodScore?: number;
    quickSummary?: string;
  }> {
    // small debounce so the UI can show the spinner smoothly
    await new Promise((r) => setTimeout(r, 300));

    try {
      const isPremium = subscriptionPlan === 'premium' || subscriptionPlan === 'gold';

      const isNoAdditives =
        /\b(no\s*additives|無添加)\b/i.test(ingredientText ?? '');

      const extracted = this.extractIngredients(ingredientText);
      const analyzed  = this.analyzeExtractedIngredients(extracted, isPremium);
      const regulated = this.findRegulatedAdditives(extracted);

      const verdict = this.calculateOverallRisk(analyzed);
      const isNatural = isNoAdditives || this.isNaturalProduct(analyzed, regulated);

      const result: any = {
        ingredients: analyzed,
        verdict,
        isNaturalProduct: isNatural,
        regulatedAdditives: regulated,
      };

      if (isPremium) {
        result.tips = this.generateHealthTips(analyzed, regulated);
        result.junkFoodScore = this.calculateJunkFoodScore(analyzed, regulated);
        result.quickSummary = this.generateQuickSummary(analyzed, regulated);
      }

      return result;
    } catch (_e) {
      // safe fallback
      return {
        ingredients: [],
        verdict: 'moderate',
        isNaturalProduct: false,
        regulatedAdditives: [],
        errorMessage: 'Analysis failed / 分析失敗',
      };
    }
  }

  // ---------------- helpers ----------------

  private static calculateJunkFoodScore(ingredients: Ingredient[], regulated: string[]): number {
    let score = 1;
    const harmful = ingredients.filter((i) => i.status === 'harmful').length;
    const moderate = ingredients.filter((i) => i.status === 'moderate').length;

    score += harmful * 3;
    score += moderate * 2;
    score += regulated.length * 2;

    return Math.min(score, 10);
  }

  private static generateQuickSummary(ingredients: Ingredient[], regulated: string[]): string {
    if (regulated.length === 0 && ingredients.every((i) => i.status === 'healthy')) {
      return '🟢 Clean product – no flagged ingredients';
    }
    const hasHarmful = ingredients.some((i) => i.status === 'harmful');
    if (hasHarmful || regulated.length > 0) {
      return '🔴 Avoid – contains harmful or regulated additives';
    }
    return '🟡 Some additives – check child safety';
  }

  private static extractIngredients(text: string): string[] {
    const clean = (text ?? '')
      .replace(/無添加|no additives/gi, '')
      .replace(/[；;]/g, ',')
      .trim();

    // special case: 米糠(含胚芽)
    if (/米糠（?含胚芽）?/u.test(clean)) return ['米糠', '胚芽'];

    return clean
      .toLowerCase()
      .split(/[,，\n\r()]+/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^含$/.test(s));
  }

  private static analyzeExtractedIngredients(list: string[], isPremium: boolean): Ingredient[] {
    return list.map((raw) => {
      // check regulated table
      for (const [key, info] of Object.entries(TAIWAN_REGULATED_ADDITIVES)) {
        if (raw.includes(key)) {
          const name = info.chinese
            ? `${info.chinese} (${info.english})`
            : `${key} (${info.english})`;
          const out: Ingredient = {
            name,
            status: info.risk as 'healthy' | 'moderate' | 'harmful',
            chinese: info.chinese ?? key,
            reason: this.getRiskLabel(info.risk),
            isFlagged: true,
          };
          if (isPremium) out.childRisk = !info.childSafe;
          return out;
        }
      }

      // Safe/simple items (demo)
      const SAFE: Record<string, { english: string; risk: 'low' | 'moderate' | 'harmful' }> = {
        '米糠': { english: 'Rice Bran', risk: 'low' },
        '胚芽': { english: 'Germ', risk: 'low' },
        '水':   { english: 'Water', risk: 'low' },
        'sugar': { english: 'Sugar', risk: 'moderate' },
      };
      for (const [key, info] of Object.entries(SAFE)) {
        if (raw.includes(key)) {
          const out: Ingredient = {
            name: `${key} (${info.english})`,
            status: info.risk === 'low' ? 'healthy' : 'moderate',
            chinese: key,
            reason: this.getRiskLabel(info.risk),
          };
          if (isPremium) out.childRisk = false;
          return out;
        }
      }

      // Unknown
      const unknown: Ingredient = {
        name: 'Unknown Ingredient / 成分未知',
        status: 'moderate',
        chinese: '成分未知',
        reason: 'Unknown / 未知',
      };
      if (isPremium) unknown.childRisk = true;
      return unknown;
    });
  }

  private static findRegulatedAdditives(list: string[]): string[] {
    const out: string[] = [];
    for (const raw of list) {
      for (const [key, info] of Object.entries(TAIWAN_REGULATED_ADDITIVES)) {
        if (raw.includes(key)) {
          const display = info.chinese ? `${info.chinese} (${info.english})` : `${key} (${info.english})`;
          out.push(display);
        }
      }
    }
    return out;
  }

  private static calculateOverallRisk(ingredients: Ingredient[]): 'healthy' | 'moderate' | 'harmful' {
    if (ingredients.some((i) => i.status === 'harmful')) return 'harmful';
    if (ingredients.some((i) => i.status === 'moderate')) return 'moderate';
    return 'healthy';
  }

  private static isNaturalProduct(ingredients: Ingredient[], regulated: string[]): boolean {
    return regulated.length === 0 && ingredients.every((i) => i.status === 'healthy');
  }

  private static getRiskLabel(risk: string): string {
    switch (risk) {
      case 'harmful':  return 'Harmful / 有害';
      case 'moderate': return 'Moderate / 中等';
      case 'low':      return 'Low / 低';
      default:         return 'Unknown / 未知';
    }
  }

  private static generateHealthTips(ingredients: Ingredient[], regulated: string[]): string[] {
    const tips: string[] = [];
    if (regulated.length === 0) {
      tips.push('🥗 均衡飲食 / Balanced diet');
      tips.push('🍼 保持均衡飲食，尤其是兒童 / Extra care for kids');
    } else {
      tips.push('🚫 若含有可疑或受管制添加物，避免或減量攝取 / Limit regulated additives');
      tips.push('🌿 建議選擇天然成分產品 / Prefer simpler ingredient lists');
    }
    return tips;
  }
}

