import { supabase } from '@/lib/supabase';

export type GPTAnalysisResult = {
  verdict: "healthy" | "moderate" | "harmful";
  ingredients: Array<{
    name: string;
    name_en: string;
    name_zh: string;
    status: "healthy" | "low" | "moderate" | "harmful";
    badge: string;
    childSafe: boolean;
    reason?: string;
    matchedKey?: string;
  }>;
  tips: string[];
  summary?: string;
};


type ScanInput = { image?: string; imageBase64?: string; ingredients?: string; lang?: 'en' | 'zh'; language?: 'en' | 'zh' };
// Reuse a failed request ID for an identical retry; a lost response cannot
// charge a second credit for a result already completed by the server.
let pending: { fingerprint: string; id: string } | null = null;
export default class GPTImageAnalysisService {
  static async analyzeProduct(image?: string | ScanInput, ingredients?: string, language: 'zh' | 'en' = 'en'): Promise<GPTAnalysisResult> {
    const input = typeof image === 'object' && image !== null ? image : null;
    const selectedLanguage = input?.language ?? input?.lang ?? language;
    const zh = selectedLanguage === 'zh';
    const { data, error } = await supabase.auth.getSession();
    const session = data.session;
    if (error || !session || session.user.is_anonymous) throw new Error(zh ? '請先至「方案與設定」登入。' : 'Please sign in through Plans & Settings first.');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!anonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY');
    const payload = {
      imageBase64: input?.imageBase64 ?? input?.image ?? (typeof image === 'string' ? image : ''),
      ingredients: input?.ingredients ?? ingredients ?? '',
      language: selectedLanguage,
    };
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([session.user.id, payload])));
    const fingerprint = Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2, '0')).join('');
    const request = pending?.fingerprint === fingerprint ? pending : { fingerprint, id: crypto.randomUUID() };
    pending = request;
    try {
      const response = await fetch('https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: anonKey },
        body: JSON.stringify({ ...payload, request_id: request.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages: Record<string, string> = zh ? {
          SIGN_IN_REQUIRED: '登入已逾時，請重新登入。', NO_CREDITS: '沒有剩餘掃描次數，請查看您的帳號。',
          INACTIVE: '您的訂閱已停用。', BUSY: '掃描仍在處理中，請稍候再試。',
          OCR_EMPTY: '未辨識到成分，請拍攝更清晰的照片。', EMPTY_ANALYSIS: '無法分析成分，請重試。',
        } : {};
        throw new Error(messages[result.error] || result.message || (zh ? '分析失敗，請重試。' : 'Analysis failed. Please try again.'));
      }
      if (!result.ok || !Array.isArray(result.result?.ingredients) || result.result.ingredients.length === 0) throw new Error(zh ? '分析結果無效，請重試。' : 'Invalid analysis result. Please retry.');
      if (pending?.id === request.id) pending = null;
      return result.result as GPTAnalysisResult;
    } finally {
      window.dispatchEvent(new Event('food-eye-credits-changed'));
    }
  }
}
