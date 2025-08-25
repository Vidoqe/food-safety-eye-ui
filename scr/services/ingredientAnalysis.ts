// scr/services/ingredientAnalysis.ts

// Local, offline ingredient analyzer (no JWT / no external API)

// type-only import so the bundler doesn't expect a runtime value
import type { Ingredient } from '../contexts/AppContext';
import { GPTImageAnalysisService, type GPTAnalysisResult } from './gptImageAnalysis';

// ----------------- Types -----------------
type AdditiveInfo = {
  english: string;
  risk: 'harmful' | 'moderate' | 'low';
  badge: string;
  childSafe: boolean;
  symbol: string;
};

// ----------------- Taiwan-regulated / notable additives -----------------
const TAIWAN_REGULATED_ADDITIVES: { [key: string]: AdditiveInfo } = {
  阿斯巴甜: { english: 'Aspartame', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  aspartame: { english: 'Aspartame', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  葛蘭素: { english: 'Tartrazine', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  tartrazine: { english: 'Tartrazine', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  亞硝酸鈉: { english: 'Sodium Nitrite', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  'sodium nitrite': { english: 'Sodium Nitrite', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  苯甲酸鈉: { english: 'Sodium Benzoate', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  'sodium benzoate': { english: 'Sodium Benzoate', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  羅丹明B: { english: 'Rhodamine B', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  'rhodamine b': { english: 'Rhodamine B', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  糖精鈉: { english: 'Cyclamate', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  cyclamate: { english: 'Cyclamate', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  防腐劑: { english: 'Preservatives', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  preservatives: { english: 'Preservatives', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  人工色素: { english: 'Artificial Colors', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'artificial colors': { english: 'Artificial Colors', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  咖啡因: { english: 'Caffeine', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  caffeine: { english: 'Caffeine', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
};

// ----------------- Analyzer Service -----------------
export class IngredientAnalysisService {
  static async analyzeIngredients(
    ingredients: string,
    subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'
  ): Promise<GPTAnalysisResult> {
    return await GPTImageAnalysisService.analyzeProductImage(ingredients, subscriptionPlan);
  }

  static checkAgainstTaiwanDB(ingredient: string): AdditiveInfo | null {
    const key = ingredient.trim().toLowerCase();
    return TAIWAN_REGULATED_ADDITIVES[key] || null;
  }
}

