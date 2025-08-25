// use type-only import so Rollup/esbuild don’t expect a runtime value
import type { Ingredient } from '../contexts/AppContext.ts';
import { GPTImageAnalysisService, type GPTAnalysisResult } from './gptImageAnalysis.ts';

// Taiwan-regulated additives database with symbols
const TAIWAN_REGULATED_ADDITIVES = {
  '阿斯巴甜': { english: 'Aspartame', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  'aspartame': { english: 'Aspartame', chinese: '阿斯巴甜', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  '亞硝黃': { english: 'Tartrazine', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '🧪' },
  'tartrazine': { english: 'Tartrazine', chinese: '亞硝黃', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '🧪' },
  '亞硝酸鈉': { english: 'Sodium Nitrite', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '🧨' },
  'sodium nitrite': { english: 'Sodium Nitrite', chinese: '亞硝酸鈉', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '🧨' },
  '苯甲酸鈉': { english: 'Sodium Benzoate', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  'sodium benzoate': { english: 'Sodium Benzoate', chinese: '苯甲酸鈉', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  '若丹明B': { english: 'Rhodamine B', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '☠️' },
  'rhodamine b': { english: 'Rhodamine B', chinese: '若丹明B', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '☠️' },
  '環己基磺酸鹽': { english: 'Cyclamate', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  'cyclamate': { english: 'Cyclamate', chinese: '環己基磺酸鹽', risk: 'harmful', badge: '🔴', childSafe: false, symbol: '⚠️' },
  '防腐劑': { english: 'Preservatives', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '🧪' },
  'preservatives': { english: 'Preservatives', chinese: '防腐劑', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '🧪' },
  '人工色素': { english: 'Artificial Colors', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '🎨' },
  'artificial colors': { english: 'Artificial Colors', chinese: '人工色素', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '🎨' },
  '咖啡因': { english: 'Caffeine', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '☕' },
  'caffeine': { english: 'Caffeine', chinese: '咖啡因', risk: 'moderate', badge: '🟡', childSafe: false, symbol: '☕' }
};

export class IngredientAnalysisService {
  // New method for GPT-4o image analysis
  static async analyzeProductImage(
    imageBase64: string, 
    subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'
  ): Promise<GPTAnalysisResult> {
    return await GPTImageAnalysisService.analyzeProductImage(imageBase64, subscriptionPlan);
  }

  // Legacy method for text-based analysis (kept for backward compatibility)
  static async analyzeIngredients(ingredientText: string, subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'): Promise<{
    ingredients: Ingredient[];
    verdict: 'healthy' | 'moderate' | 'harmful';
    isNaturalProduct: boolean;
    regulatedAdditives: string[];
    errorMessage?: string;
    tips?: string[];
    junkFoodScore?: number;
    quickSummary?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const isPremium = subscriptionPlan === 'premium' || subscriptionPlan === 'gold';
      const isNoAdditives = ingredientText.includes('無添加物') || ingredientText.includes('no additives');
      
      const extractedIngredients = this.extractIngredients(ingredientText);
      const analyzedIngredients = this.analyzeExtractedIngredients(extractedIngredients, isPremium);
      const regulatedAdditives = isPremium ? this.findRegulatedAdditives(extractedIngredients) : [];
      const verdict = this.calculateOverallRisk(analyzedIngredients);
      const isNaturalProduct = isNoAdditives || this.isNaturalProduct(analyzedIngredients, regulatedAdditives);
      
      const result: any = {
        ingredients: analyzedIngredients,
        verdict,
        isNaturalProduct,
        regulatedAdditives
      };
      
      if (isPremium) {
        result.tips = this.generateHealthTips(analyzedIngredients, regulatedAdditives);
        result.junkFoodScore = this.calculateJunkFoodScore(analyzedIngredients, regulatedAdditives);
        result.quickSummary = this.generateQuickSummary(analyzedIngredients, regulatedAdditives);
      }
      
      return result;
    } catch (error) {
      return {
        ingredients: [],
        verdict: 'moderate',
        isNaturalProduct: false,
        regulatedAdditives: [],
        errorMessage: 'Analysis failed / 分析失敗'
      };
    }
  }
  
  private static calculateJunkFoodScore(ingredients: Ingredient[], regulatedAdditives: string[]): number {
    let score = 1;
    
    const harmfulCount = ingredients.filter(ing => ing.status === 'harmful').length;
    score += harmfulCount * 3;
    
    const moderateCount = ingredients.filter(ing => ing.status === 'moderate').length;
    score += moderateCount * 2;
    
    score += regulatedAdditives.length * 2;
    
    return Math.min(score, 10);
  }
  
  private static generateQuickSummary(ingredients: Ingredient[], regulatedAdditives: string[]): string {
    if (regulatedAdditives.length === 0 && ingredients.every(ing => ing.status === 'healthy')) {
      return '🟢 Clean product – no flagged ingredients';
    }
    
    const hasHarmful = ingredients.some(ing => ing.status === 'harmful') || regulatedAdditives.length > 0;
    if (hasHarmful) {
      return '🔴 Avoid – contains harmful or banned additives';
    }
    
    return '🟡 Some additives – check child safety';
  }
  
  private static extractIngredients(text: string): string[] {
    const cleanText = text.replace(/無添加物|no additives/gi, '').trim();
    
    if (cleanText.includes('米糠（含胚芽）') || cleanText.includes('米糠(含胚芽)')) {
      return ['米糠', '胚芽'];
    }
    
    const ingredients = cleanText
      .toLowerCase()
      .split(/[,，、;；\n\r()（）]+/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0 && !ingredient.includes('含'));
    
    return ingredients;
  }
  
  private static analyzeExtractedIngredients(ingredients: string[], isPremium: boolean): Ingredient[] {
    return ingredients.map(ingredient => {
      for (const [key, info] of Object.entries(TAIWAN_REGULATED_ADDITIVES)) {
        if (ingredient.includes(key)) {
          const displayName = isPremium && info.symbol ? 
            `${info.symbol} ${info.chinese ? info.chinese : key} / ${info.english}` :
            (info.chinese ? `${info.chinese} (${info.english})` : `${key} (${info.english})`);
          
          const result: Ingredient = {
            name: displayName,
            status: info.risk as 'healthy' | 'moderate' | 'harmful',
            chinese: info.chinese || key,
            reason: this.getRiskLabel(info.risk),
            isFlagged: true
          };
          if (isPremium) result.childRisk = !info.childSafe;
          return result;
        }
      }
      
      // Safe ingredients
      const safeIngredients = {
        '米糠': { english: 'Rice Bran', risk: 'low' },
        '胚芽': { english: 'Germ', risk: 'low' },
        '水': { english: 'Water', risk: 'low' },
        '糖': { english: 'Sugar', risk: 'moderate' }
      };
      
      for (const [key, info] of Object.entries(safeIngredients)) {
        if (ingredient.includes(key)) {
          const result: Ingredient = {
            name: `${key} (${info.english})`,
            status: info.risk === 'low' ? 'healthy' : 'moderate',
            chinese: key,
            reason: this.getRiskLabel(info.risk)
          };
          if (isPremium) result.childRisk = false;
          return result;
        }
      }
      
      const result: Ingredient = {
        name: 'Unknown Ingredient / 成分未知',
        status: 'moderate',
        chinese: '成分未知',
        reason: 'Unknown / 未知'
      };
      if (isPremium) result.childRisk = true;
      return result;
    });
  }
  
  private static findRegulatedAdditives(ingredients: string[]): string[] {
    const regulated: string[] = [];
    
    for (const ingredient of ingredients) {
      for (const [key, info] of Object.entries(TAIWAN_REGULATED_ADDITIVES)) {
        if (ingredient.includes(key)) {
          const displayName = info.chinese ? 
            `${info.chinese} (${info.english})` : 
            `${key} (${info.english})`;
          regulated.push(displayName);
        }
      }
    }
    
    return regulated;
  }
  
  private static calculateOverallRisk(ingredients: Ingredient[]): 'healthy' | 'moderate' | 'harmful' {
    const hasHarmful = ingredients.some(ing => ing.status === 'harmful');
    const hasModerate = ingredients.some(ing => ing.status === 'moderate');
    
    if (hasHarmful) return 'harmful';
    if (hasModerate) return 'moderate';
    return 'healthy';
  }
  
  private static isNaturalProduct(ingredients: Ingredient[], regulatedAdditives: string[]): boolean {
    return regulatedAdditives.length === 0 && 
           ingredients.every(ing => ing.status === 'healthy');
  }
  
  private static getRiskLabel(risk: string): string {
    switch (risk) {
      case 'harmful': return 'Harmful / 有害';
      case 'moderate': return 'Moderate / 中等';
      case 'low': return 'Low / 低';
      default: return 'Unknown / 未知';
    }
  }
  
  private static generateHealthTips(ingredients: Ingredient[], regulatedAdditives: string[]): string[] {
    const tips: string[] = [];
    
    if (regulatedAdditives.length === 0) {
      tips.push('💡適量食用');
      tips.push('💡保持均衡飲食，尤其是兒童');
    } else {
      tips.push('💡若含阿斯巴甜或亞硝黃，避免兒童攝取');
      tips.push('💡建議選擇天然成分產品');
    }
    
    return tips;
  }
}
