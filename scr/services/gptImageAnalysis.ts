import { Ingredient } from '@/contexts/AppContext';

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
  child_safe?: boolean;
  notes?: string[];
}

export class GPTImageAnalysisService {
  private static readonly API_URL = 'https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image';
  private static readonly BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3pobHVna3h5dGlvbnlybm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzQ5OTQsImV4cCI6MjA2NzYxMDk5NH0.LK8YHE_JDl0Mj0vl-SFhAbUvrpLu-rIbL3lakuBqddM';

  static async analyzeProduct(
    imageBase64?: string,
    ingredients?: string,
    barcode?: string,
    language: 'zh' | 'en' = 'zh'
  ): Promise<GPTAnalysisResult> {
    // 食安眼 (Food Safety Eye) logic - check if any data is provided
    if (!imageBase64 && !ingredients && !barcode) {
      throw new Error(language === 'zh' 
        ? '請上傳食品標籤圖片、輸入成分列表或提供條碼進行分析' 
        : 'Please upload a barcode or ingredient label photo'
      );
    }

    try {
      // Make real POST request to Supabase edge function using exact user code
      console.log('🚀 Making real POST request to Supabase edge function...');
      
      const response = await fetch("https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3pobHVna3h5dGlvbnlybm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzQ5OTQsImV4cCI6MjA2NzYxMDk5NH0.LK8YHE_JDl0Mj0vl-SFhAbUvrpLu-rIbL3lakuBqddM"
        },
        body: JSON.stringify({
          image: imageBase64 || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA", // test image sample
          barcode: barcode || "4710088412345",
          user_id: "96882bc1-7a4f-4123-9314-058368d989f4"
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Supabase Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error(language === 'zh' ? '認證失敗' : 'Authentication failed');
        }
        if (response.status === 403) {
          throw new Error(language === 'zh' ? '權限不足' : 'Access denied');
        }
        if (response.status === 404) {
          throw new Error(language === 'zh' ? '服務不可用' : 'Service not available');
        }
        throw new Error(language === 'zh' ? `分析失敗: ${errorText}` : `Analysis failed: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Supabase Result:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      return this.parseAnalysisResponse(data, language);
    } catch (error) {
      console.error('❌ Supabase Error:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  static async analyzeProductImage(
    imageBase64?: string,
    subscriptionPlan: 'free' | 'premium' | 'gold' = 'free',
    language: 'zh' | 'en' = 'zh'
  ): Promise<GPTAnalysisResult> {
    return this.analyzeProduct(imageBase64, undefined, undefined, language);
  }

  static async analyzeIngredients(
    ingredients: string,
    language: 'zh' | 'en' = 'zh'
  ): Promise<GPTAnalysisResult> {
    return this.analyzeProduct(undefined, ingredients, undefined, language);
  }

  static async analyzeBarcode(
    barcode: string,
    language: 'zh' | 'en' = 'zh'
  ): Promise<GPTAnalysisResult> {
    return this.analyzeProduct(undefined, undefined, barcode, language);
  }

  private static parseAnalysisResponse(data: any, language: 'zh' | 'en'): GPTAnalysisResult {
    const analysisText = data.analysis || data.result || '';
    const parsedIngredients = this.parseIngredientsFromAnalysis(analysisText);
    
    return {
      productName: data.productName || (language === 'zh' ? '分析產品' : 'Analyzed Product'),
      barcode: data.barcode || null,
      extractedIngredients: parsedIngredients.map(ing => ing.name),
      ingredients: parsedIngredients,
      verdict: this.determineOverallRisk(parsedIngredients),
      overallSafety: this.determineOverallRisk(parsedIngredients),
      overall_risk: this.determineOverallRisk(parsedIngredients),
      child_safe: parsedIngredients.every(ing => !ing.childRisk),
      notes: language === 'zh' 
        ? ['💡 適量食用', '💡 注意台灣法規限制的添加物']
        : ['💡 Consume in moderation', '💡 Check Taiwan regulated additives'],
      summary: analysisText,
      isNaturalProduct: false,
      regulatedAdditives: parsedIngredients.filter(ing => ing.isFlagged).map(ing => ing.name),
      taiwanWarnings: data.taiwanWarnings || [],
      scansLeft: data.scansLeft || 0,
      creditsExpiry: data.creditsExpiry || null
    };
  }

  private static parseIngredientsFromAnalysis(analysisText: string): Ingredient[] {
    const ingredients: Ingredient[] = [];
    const lines = analysisText.split('\n');
    
    for (const line of lines) {
      if (line.includes('harmful') || line.includes('有害') || line.includes('危險')) {
        const name = this.extractIngredientName(line);
        if (name) {
          ingredients.push({
            name,
            status: 'harmful',
            chinese: name,
            reason: 'Potentially harmful',
            isFlagged: true,
            riskLevel: 'harmful',
            childRisk: true,
            badge: '🔴',
            taiwanRegulation: 'Restricted'
          });
        }
      } else if (line.includes('moderate') || line.includes('中等') || line.includes('注意')) {
        const name = this.extractIngredientName(line);
        if (name) {
          ingredients.push({
            name,
            status: 'moderate',
            chinese: name,
            reason: 'Moderate risk',
            isFlagged: false,
            riskLevel: 'moderate',
            childRisk: false,
            badge: '🟡',
            taiwanRegulation: 'Regulated'
          });
        }
      } else if (line.includes('safe') || line.includes('安全') || line.includes('健康')) {
        const name = this.extractIngredientName(line);
        if (name) {
          ingredients.push({
            name,
            status: 'healthy',
            chinese: name,
            reason: 'Safe ingredient',
            isFlagged: false,
            riskLevel: 'healthy',
            childRisk: false,
            badge: '🟢',
            taiwanRegulation: 'Approved'
          });
        }
      }
    }
    
    // Default ingredient if none parsed
    if (ingredients.length === 0) {
      ingredients.push({
        name: 'Product Analysis',
        status: 'moderate',
        chinese: '產品分析',
        reason: 'Analysis completed',
        isFlagged: false,
        riskLevel: 'moderate',
        childRisk: false,
        badge: '🟡',
        taiwanRegulation: 'Under review'
      });
    }
    
    return ingredients;
  }

  private static extractIngredientName(line: string): string | null {
    // Extract ingredient names from analysis text
    const match = line.match(/([A-Za-z\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+)/);
    return match ? match[1].trim() : null;
  }

  private static determineOverallRisk(ingredients: Ingredient[]): 'healthy' | 'moderate' | 'harmful' {
    if (ingredients.some(ing => ing.riskLevel === 'harmful')) return 'harmful';
    if (ingredients.some(ing => ing.riskLevel === 'moderate')) return 'moderate';
    return 'healthy';
  }

  // Utility methods
  static convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static async captureImageFromCamera(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const base64 = await this.convertFileToBase64(file);
            resolve(base64);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.click();
    });
  }
}