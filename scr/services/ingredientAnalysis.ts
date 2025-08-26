// scr/services/ingredientAnalysis.ts

// Local, offline ingredient analyzer (no JWT / no external API)

// type-only import so the bundler doesn’t expect a runtime value
import type { Ingredient } from '../contexts/AppContext';
import GPTImageAnalysisService, { type GPTAnalysisResult } from './gptImageAnalysis';

// Taiwan-regulated / notable additives (EN only)
const TAIWAN_REGULATED_ADDITIVES: Record<
  string,
  { english: string; risk: 'harmful' | 'moderate' | 'low'; badge: string; childSafe: boolean; symbol: string }
> = {
  // sweeteners / colors (examples)
  'aspartame':   { english: 'Aspartame',   risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'tartrazine':  { english: 'Tartrazine',  risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⚠️' },
  'sodium nitrite': { english: 'Sodium Nitrite', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  'sodium benzoate':{ english: 'Sodium Benzoate',risk: 'moderate',badge: '🟡', childSafe: false, symbol: '⚠️' },
  'rhodamine b': { english: 'Rhodamine B', risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⛔' },
  'cyclamate':   { english: 'Cyclamate',   risk: 'harmful',  badge: '🔴', childSafe: false, symbol: '⚠️' },

  // common generic buckets
  'preservatives':   { english: 'Preservatives',   risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'artificial colors': { english: 'Artificial Colors', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
  'caffeine':        { english: 'Caffeine',        risk: 'moderate', badge: '🟡', childSafe: false, symbol: '⚠️' },
};
// ----------------- Analyzer Service -----------------
export class IngredientAnalysisService {
  static async analyzeIngredients(
    ingredients: string,
    subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'
  ): Promise<GPTAnalysisResult> {
    return await GPTImageAnalysisService.analyzeProductImage(ingredients, subscriptionPlan);
  }

  static checkAgainstTaiwanDB(ingredient: string) {
    const key = ingredient.trim().toLowerCase();
    return TAIWAN_REGULATED_ADDITIVES[key] || null;
  }
}

export default IngredientAnalysisService;
