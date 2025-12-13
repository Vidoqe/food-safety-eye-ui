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
'benzoic acid': {
  names: ['benzoic acid', 'E210'],
  risk: 'moderate',
  childRisk: 'avoid',
  badge: 'yellow',
  taiwanRule: '用於酸性食品之防腐劑，對敏感族群與兒童建議避免。'
},

'sodium benzoate': {
  names: ['sodium benzoate', 'E211'],
  risk: 'moderate',
  childRisk: 'avoid',
  badge: 'yellow',
  taiwanRule: '常見於飲料與醬料，與維生素C並存時可能產生苯。'
},

'potassium benzoate': {
  names: ['potassium benzoate', 'E212'],
  risk: 'moderate',
  childRisk: 'avoid',
  badge: 'yellow',
  taiwanRule: '合法防腐劑，但對兒童與過敏體質者不建議。'
},

'calcium benzoate': {
  names: ['calcium benzoate', 'E213'],
  risk: 'moderate',
  childRisk: 'avoid',
  badge: 'yellow',
  taiwanRule: '較少使用的苯甲酸鹽類，可能刺激腸胃。'
},

'methyl paraben': {
  names: ['methyl paraben', 'E218'],
  risk: 'moderate',
  childRisk: 'avoid',
  badge: 'yellow',
  taiwanRule: '屬對羥基苯甲酸酯類，具內分泌干擾疑慮。'
},

'propyl paraben': {
  names: ['propyl paraben', 'E216'],
  risk: 'high',
  childRisk: 'avoid',
  badge: 'red',
  taiwanRule: '部分國家限制使用，具較高荷爾蒙干擾風險。'
},

  // ---- EMULSIFIERS ----
  'polysorbate 80': {
    names: ['polysorbate 80', 'E433'],
    risk: 'moderate',
    childRisk: 'limit',
    badge: 'yellow',
    taiwanRule: '部分研究指出需控制食用量，避免過量。',
  },
'lecithin': {
  names: ['lecithin', 'E322'],
  risk: 'low',
  childRisk: 'safe',
  badge: 'green',
  taiwanRule: '常見乳化劑，來源多為大豆或蛋黃，於合法範圍內屬安全。'
},

'mono and diglycerides': {
  names: ['mono and diglycerides', 'E471'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '廣泛用於加工食品，來源可能為植物或動物脂肪，建議控制攝取。'
},

'sodium stearoyl lactylate': {
  names: ['sodium stearoyl lactylate', 'E481'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '改善麵包與加工食品結構，兒童食品中不宜過量。'
},

'sorbitan monostearate': {
  names: ['sorbitan monostearate', 'E491'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '常見於烘焙與甜點產品，屬合法添加物但非必要。'
},

'polyglycerol esters of fatty acids': {
  names: ['polyglycerol esters of fatty acids', 'E475'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '合法乳化劑，長期大量攝取之健康影響仍有限研究。'
},
'monosodium glutamate': {
  names: ['monosodium glutamate', 'msg', 'E621'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '常見鮮味劑，部分人可能出現頭痛或不適，兒童建議限制。'
},

'disodium inosinate': {
  names: ['disodium inosinate', 'E631'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '常與味精併用以增強鮮味，不建議兒童頻繁攝取。'
},

'disodium guanylate': {
  names: ['disodium guanylate', 'E627'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '核苷酸類鮮味劑，對敏感族群應節制。'
},

'yeast extract': {
  names: ['yeast extract'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '天然來源但富含游離麩胺酸，作用類似味精。'
},

'hydrolyzed vegetable protein': {
  names: ['hydrolyzed vegetable protein', 'hvp'],
  risk: 'moderate',
  childRisk: 'limit',
  badge: 'yellow',
  taiwanRule: '可含游離麩胺酸與鈉，長期大量攝取不建議。'
},
'citric acid': {
  names: ['citric acid', 'E330'],
  risk: 'low',
  childRisk: 'safe',
  badge: 'green',
  taiwanRule: '常見酸度調節劑，天然存在於水果中，於合法範圍內屬安全。'
},

'sodium citrate': {
  names: ['sodium citrate', 'E331'],
  risk: 'low',
  childRisk: 'safe',
  badge: 'green',
  taiwanRule: '用於調節酸度與穩定性，一般認為安全。'
},

'lactic acid': {
  names: ['lactic acid', 'E270'],
  risk: 'low',
  childRisk: 'safe',
  badge: 'green',
  taiwanRule: '可來自發酵來源，常用於食品酸度調整。'
},

'acetic acid': {
  names: ['acetic acid', 'E260'],
  risk: 'low',
  childRisk: 'safe',
  badge: 'green',
  taiwanRule: '即醋酸，廣泛使用於醃漬與調味食品。'
},

'sodium bicarbonate': {
  names: ['sodium bicarbonate', 'E500'],
  risk: 'low',
  childRisk: 'safe',
  badge: 'green',
  taiwanRule: '常見膨脹與酸鹼調節劑，正常攝取下安全。'
},

Displaying
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
