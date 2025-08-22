export const translations = {
  en: {
    appTitle: 'Food Safety Eye',
    appSubtitle: '食安眼',
    tagline: 'Your health and your child\'s health are a priority',
    scanLabel: 'Scan Product Label',
    scanBarcode: 'Scan Barcode',
    settings: 'Settings',
    language: 'Language',
    english: 'English',
    chinese: '中文',
    appInfo: 'App Info',
    clearHistory: 'Clear History',
    scanning: 'Scanning...',
    analyzing: 'Analyzing ingredients...',
    healthy: 'Healthy',
    moderate: 'Moderate',
    harmful: 'Harmful',
    ingredients: 'Ingredients',
    verdict: 'Health Verdict',
    tips: 'Health Tips',
    back: 'Back',
    retry: 'Retry',
    noResults: 'No analysis results yet',
    historyCleared: 'History cleared successfully'
  },
  zh: {
    appTitle: '食安眼',
    appSubtitle: 'Food Safety Eye',
    tagline: '你和孩子的健康是我們的首要任務',
    scanLabel: '掃描產品標籤',
    scanBarcode: '掃描條碼',
    settings: '設定',
    language: '語言',
    english: 'English',
    chinese: '中文',
    appInfo: '應用程式資訊',
    clearHistory: '清除歷史記錄',
    scanning: '掃描中...',
    analyzing: '分析成分中...',
    healthy: '健康',
    moderate: '適量',
    harmful: '有害',
    ingredients: '成分',
    verdict: '健康評估',
    tips: '健康建議',
    back: '返回',
    retry: '重試',
    noResults: '尚無分析結果',
    historyCleared: '歷史記錄已清除'
  }
};

export const useTranslation = (language: 'en' | 'zh') => {
  return translations[language];
};