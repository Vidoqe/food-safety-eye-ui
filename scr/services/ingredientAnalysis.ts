// scr/services/gptImageAnalysis.ts

// Import any dependencies/types
import { Ingredient } from '../contexts/AppContext';

// Result type returned from GPT analysis
export interface GPTAnalysisResult {
  extractedIngredients: string[];
  ingredients: Ingredient[];
  verdict: 'healthy' | 'moderate' | 'harmful';
  isNaturalProduct: boolean;
  regulatedAdditives: string[];
  tips?: string[];
  junkFoodScore?: number;
  quickSummary?: string;
  overallSafety?: 'safe' | 'moderate' | 'harmful';
  summary?: string;
  error?: string;
  productName?: string;
  barcode?: string;
  taiwanWarnings?: string[];
  scansLeft?: number;
  creditsExpiry?: string;
  overall_risk?: string;
}

// Analyzer service
class GPTImageAnalysisService {
  // Example function to analyze a product image
  static async analyzeProductImage(
    imageBase64: string,
    subscriptionPlan: 'free' | 'premium' | 'gold' = 'free'
  ): Promise<GPTAnalysisResult> {
    try {
      // TODO: Replace this with your Supabase Edge function call
      const response = await fetch('/api/analyze-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          subscription: subscriptionPlan,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: GPTAnalysisResult = await response.json();
      return data;
    } catch (error: any) {
      return {
        extractedIngredients: [],
        ingredients: [],
        verdict: 'moderate',
        isNaturalProduct: false,
        regulatedAdditives: [],
        error: error.message || 'Unknown error',
      };
    }
  }
}

// Export default and type
export default GPTImageAnalysisService;
export type { GPTAnalysisResult };

