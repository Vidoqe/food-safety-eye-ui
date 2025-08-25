// scr/services/gptImageAnalysis.ts

import type { Ingredient } from '@/contexts/AppContext';
import IngredientAnalysisService from '@/services/ingredientAnalysis';

/**
 * Unified result type returned to the UI.  Keep these keys stable.
 */
export interface GPTAnalysisResult {
  // Core analysis
  extractedIngredients: string[];
  ingredients: Ingredient[];
  verdict: 'healthy' | 'moderate' | 'harmful';
  isNaturalProduct: boolean;
  regulatedAdditives: string[];

  // UX text (always bilingual to avoid mixed language)
  tips: string[];           // e.g., ["Use in moderation / 適量食用", ...]
  quickSummary: string;     // e.g., "Some additives detected / 含有限制添加物"
  overallSafety: 'safe' | 'moderate' | 'harmful';

  // Optional metadata for the UI (kept for compatibility with older screens)
  summary?: string;
  error?: string;
  productName?: string;
  barcode?: string;
  taiwanWarnings?: string[];
  scansLeft?: number;
  creditsExpiry?: string;

  // Extra (kept for backward compat with some components)
  overall_risk?: string;    // string version of overallSafety
  child_safe?: boolean;     // simplified flag if all items are child-safe
  notes?: string[];
}

/** Bilingual helpers */
const zh = {
  safe: '安全',
  moderate: '中等',
  harmful: '有害',
  quickClean: '無標記成分',
  quickCaution: '含有限制添加物',
  tipModeration: '適量食用',
  tipCheckAdditives: '注意台灣法規限制的添加物',
  unknown: '未知',
};

const en = {
  safe: 'Safe',
  moderate: 'Moderate',
  harmful: 'Harmful',
  quickClean: 'No flagged ingredients',
  quickCaution: 'Contains regulated additives',
  tipModeration: 'Use in moderation',
  tipCheckAdditives: 'Check Taiwan-regulated additives',
  unknown: 'Unknown',
};

/** Always return bilingual "EN / ZH" so the UI never mixes */
const bi = (a: string, b: string) => `${a} / ${b}`;

/** Map verdict -> overall safety (same 3 buckets) */
function verdictToOverallSafety(v: 'healthy' | 'moderate' | 'harmful'): 'safe' | 'moderate' | 'harmful' {
  if (v === 'healthy') return 'safe';
  if (v === 'moderate') return 'moderate';
  return 'harmful';
}

/**
 * Main entry.
 * - If you pass `overrideText`, we parse that text locally (manual input path).
 * - If you pass only an image, we currently return a friendly error (no external OCR/GPT).
 *
 * Keeping the signature flexible so the rest of the app can call it uniformly.
 */
export default class GPTImageAnalysisService {
  static async analyzeProduct(
    imageBase64?: string,                                // optional
    overrideText?: string,                               // ingredients text (manual)
    overrideBarcode?: string,                            // optional
  ): Promise<GPTAnalysisResult> {
    try {
      if (!overrideText && !imageBase64) {
        // Nothing to analyze
        return {
          extractedIngredients: [],
          ingredients: [],
          verdict: 'moderate',
          isNaturalProduct: false,
          regulatedAdditives: [],
          tips: [bi(en.tipModeration, zh.tipModeration)],
          quickSummary: bi(en.quickCaution, zh.quickCaution),
          overallSafety: 'moderate',
          summary: bi('No input provided', '未提供內容'),
          error: undefined,
          productName: undefined,
          barcode: undefined,
          taiwanWarnings: [],
          scansLeft: undefined,
          creditsExpiry: undefined,
          overall_risk: 'moderate',
          child_safe: false,
          notes: [],
        };
      }

      // If we have text, use the local analyzer (no JWT / no external API).
      if (overrideText) {
        const plan: 'free' | 'premium' | 'gold' = 'free';
        const local = await IngredientAnalysisService.analyzeIngredients(overrideText, plan);

        // Build bilingual labels
        const overall = verdictToOverallSafety(local.verdict);
        const quick =
          local.regulatedAdditives.length === 0 &&
          local.ingredients.every(i => i.status === 'healthy')
            ? bi(en.quickClean, zh.quickClean)
            : bi(en.quickCaution, zh.quickCaution);

        const tips: string[] = [];
        tips.push(bi(en.tipModeration, zh.tipModeration));
        if (local.regulatedAdditives.length > 0) tips.push(bi(en.tipCheckAdditives, zh.tipCheckAdditives));

        // Compose result for UI
        const result: GPTAnalysisResult = {
          extractedIngredients: local.extractedIngredients ?? [],
          ingredients: local.ingredients ?? [],
          verdict: local.verdict,
          isNaturalProduct: local.isNaturalProduct ?? false,
          regulatedAdditives: local.regulatedAdditives ?? [],
          tips,
          quickSummary: quick,
          overallSafety: overall,

          // compatibility fields
          summary: local.quickSummary ?? quick,
          error: undefined,
          productName: local.productName,
          barcode: overrideBarcode ?? local.barcode,
          taiwanWarnings: local.taiwanWarnings ?? [],
          scansLeft: local.scansLeft,
          creditsExpiry: local.creditsExpiry,

          overall_risk: overall,
          child_safe: local.child_safe ?? false,
          notes: local.notes ?? [],
        };

        return result;
      }

      // If only an image was provided (no OCR step here)
      return {
        extractedIngredients: [],
        ingredients: [],
        verdict: 'moderate',
        isNaturalProduct: false,
        regulatedAdditives: [],
        tips: [bi(en.tipModeration, zh.tipModeration)],
        quickSummary: bi('Image analysis is not enabled', '目前未啟用影像分析'),
        overallSafety: 'moderate',
        summary: bi('Provide text to analyze', '請提供成分文字進行分析'),
        error: bi('Image OCR/GPT is disabled', '尚未啟用影像 OCR/GPT'),
        productName: undefined,
        barcode: overrideBarcode,
        taiwanWarnings: [],
        scansLeft: undefined,
        creditsExpiry: undefined,
        overall_risk: 'moderate',
        child_safe: false,
        notes: [],
      };
    } catch (err) {
      // Safe fallback
      return {
        extractedIngredients: [],
        ingredients: [],
        verdict: 'moderate',
        isNaturalProduct: false,
        regulatedAdditives: [],
        tips: [bi(en.tipModeration, zh.tipModeration)],
        quickSummary: bi('Analysis failed', '分析失敗'),
        overallSafety: 'moderate',
        summary: bi('Please try again', '請再試一次'),
        error: (err as Error)?.message ?? 'error',
        productName: undefined,
        barcode: overrideBarcode,
        taiwanWarnings: [],
        scansLeft: undefined,
        creditsExpiry: undefined,
        overall_risk: 'moderate',
        child_safe: false,
        notes: [],
      };
    }
  }
}
