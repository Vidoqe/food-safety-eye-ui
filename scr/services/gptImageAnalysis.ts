// scr/services/gptImageAnalysis.ts
// Service for capturing images and sending them for analysis
// This version compresses images client-side to reduce latency
// and adds a request timeout + simple timing logs.

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
  barcode?: string;
  healthWarnings: string[];
  scanInfo: string;
  creditsExpiry: string;
  overall_risk: string;
  child_safe: boolean;
  notes: string;
}

/** Read a File to data URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Compress a dataURL image down to maxSide px and JPEG quality */
async function compressDataUrl(
  dataUrl: string,
  maxSide = 1024,
  quality = 0.6
): Promise<string> {
  // Create Image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Image decode failed'));
    img.src = dataUrl;
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, outW, outH);

  // To JPEG (smaller & faster to transmit/process than PNG)
  return canvas.toDataURL('image/jpeg', quality);
}

/** Open native camera/file picker and return base64 dataURL */
async function captureImageFromCamera(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // @ts-ignore mobile hint, not standardized
    input.capture = 'environment';

    try {
      if ((input as any).showPicker) {
        // @ts-ignore
        input.showPicker();
      } else {
        input.click();
      }
    } catch {
      input.click();
    }

    input.onchange = async () => {
      try {
        const file = input.files?.[0];
        if (!file) return reject(new Error('No file selected'));
        const raw = await fileToDataUrl(file);
        // compress before returning
        const compressed = await compressDataUrl(raw, 1024, 0.6);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };
    input.onerror = () => reject(new Error('Camera/File picker failed'));
  });
}

/** Fetch with timeout using AbortController */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 25000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...init, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

async function analyzeProduct(
  imageBase64: string,
  barcode?: string,
  language: 'en' | 'zh' = 'en',
  options: Record<string, any> = {}
): Promise<AnalysisResponse> {
  // Ensure we’re not sending a giant PNG
  const compact = imageBase64.startsWith('data:image/png')
    ? await compressDataUrl(imageBase64, 1024, 0.6)
    : imageBase64;

  const started = performance.now();
  console.info('[analyzeProduct] start', { lang: language });

  try {
    const response = await fetchWithTimeout(
      '/api/analyze-product-image',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: compact,
          barcode,
          language,
          ...options,
        }),
      },
      25000
    );

    if (!response.ok) {
      throw new Error(`Analysis API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AnalysisResponse;

    const elapsed = Math.round(performance.now() - started);
    console.info(`[analyzeProduct] done in ${elapsed} ms`, {
      bytes: Math.round((compact.length * 3) / 4), // rough decoded bytes
      hasIngredients: Array.isArray(data?.ingredients) && data.ingredients.length > 0,
    });

    if (!data || !Array.isArray(data.ingredients)) {
      throw new Error('Analysis returned no ingredients.');
    }
    return data;
  } catch (err) {
    const elapsed = Math.round(performance.now() - started);
    console.error(`[analyzeProduct] failed after ${elapsed} ms`, err);
    throw err;
  }
}

const GPTImageAnalysisService = {
  captureImageFromCamera,
  analyzeProduct,
};

export default GPTImageAnalysisService;
