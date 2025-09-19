// scr/services/gptImageAnalysis.ts
// Service for capturing images and sending them for analysis

export interface AnalysisResponse {
  ingredients: string[];
  verdict: string;
  tips: string[];
  extractedIngredients: string[];
  regulatedAdditives: string[];
  isNaturalProduct: boolean;
  junkFoodScore: number;
  quickSummary: string;
  overallSafety: string;
  summary: string;
  warnings: string[];
  barcode: string;
  healthWarnings: string[];
  scanInfo: string;
  creditsExpiry: string;
  overall_risk: string;
  child_safe: boolean;
  notes: string;
}

async function captureImageFromCamera(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    (input as any).capture = 'environment'; // mobile hint

    try {
      // Prefer modern picker
      // @ts-ignore
      if (input.showPicker) {
        input.showPicker();
      } else {
        input.click();
      }
    } catch {
      input.click();
    }

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file selected'));

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string); // base64 data URL
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    input.onerror = () => reject(new Error('Camera/File picker failed'));
  });
}

async function analyzeProduct(
  imageBase64: string,
  barcode?: string,
  options?: Record<string, any>,
  language: string = 'en'
): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/analyze-product-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageBase64,
        barcode,
        language,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as AnalysisResponse;
  } catch (err) {
    console.error('analyzeProduct error:', err);
    throw err;
  }
}

const GPTImageAnalysisService = {
  captureImageFromCamera,
  analyzeProduct,
};

export default GPTImageAnalysisService;
