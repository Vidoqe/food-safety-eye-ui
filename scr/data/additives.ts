export interface AdditiveInfo {
  names: string[];          // All possible spellings / variants
  risk: 'healthy' | 'low' | 'moderate' | 'harmful' | 'unknown';
  childRisk: 'safe' | 'limit' | 'avoid' | 'unknown';
  badge: 'green' | 'yellow' | 'red' | 'gray';
  taiwanRule: string;       // Taiwan FDA guideline
}

export const ADDITIVES: Record<string, AdditiveInfo> = {

  // Example additives — we will fill in hundreds later

  // ---- SWEETENERS ----
  'aspartame': {
    names: ['aspartame', 'E951'],
    risk: 'harmful',
    childRisk: 'avoid',
    badge: 'red',
    taiwanRule: '阿斯巴甜為高倍甜味劑，建議避免兒童過量攝取。',
  },

  'acesulfame potassium': {
    names: ['acesulfame potassium', 'acesulfame K', 'Ace-K', 'E950'],
    risk: 'moderate',
    childRisk: 'limit',
    badge: 'yellow',
    taiwanRule: '部分研究建議控制每日攝取量，避免過量。',
  },

  // ---- PRESERVATIVES ----
  'sodium benzoate': {
    names: ['sodium benzoate', 'E211'],
    risk: 'moderate',
    childRisk: 'limit',
    badge: 'yellow',
    taiwanRule: '台灣允許使用但需符合添加量限制。',
  },

  'potassium sorbate': {
    names: ['potassium sorbate', 'E202'],
    risk: 'low',
    childRisk: 'safe',
    badge: 'green',
    taiwanRule: '常用防腐劑，於限量內屬安全。',
  },

  // ---- EMULSIFIERS ----
  'polysorbate 80': {
    names: ['polysorbate 80', 'E433'],
    risk: 'moderate',
    childRisk: 'limit',
    badge: 'yellow',
    taiwanRule: '部分研究指出需控制食用量，避免過量。',
  },

  // ---- ARTIFICIAL COLORS ---- (already partially added)
  'allura red ac': {
    names: ['allura red', 'allura red ac', 'red 40', 'E129'],
    risk: 'harmful',
    childRisk: 'avoid',
    badge: 'red',
    taiwanRule: '研究顯示可能影響兒童行為，建議避免攝取。',
  },
};

export function findAdditive(name: string): AdditiveInfo | null {
  const lower = name.toLowerCase().trim();
  for (const key in ADDITIVES) {
    const info = ADDITIVES[key];
    if (info.names.some(n => lower.includes(n))) {
      return info;
    }
  }
  return null;
}
