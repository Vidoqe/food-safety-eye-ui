import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Ingredient {
  name: string;
  status: 'healthy' | 'moderate' | 'harmful';
  chinese: string;
  reason: string;
  isFlagged?: boolean;
  riskLevel?: string;
  childRisk?: boolean;
  childSafety?: string;
  badge?: string;
  taiwanRegulation?: string;
}

export interface AnalysisResult {
  id: string;
  ingredients: Ingredient[];
  verdict: 'healthy' | 'moderate' | 'harmful';
  tips: string[];
  timestamp: Date;
  productType?: string;
  isEdible?: boolean;
  extractedIngredients?: string[];
  keyDetectedSubstances?: string[];
  isNaturalProduct?: boolean;
  regulatedAdditives?: string[];
  junkFoodScore?: number;
  quickSummary?: string;
  overallSafety?: 'safe' | 'moderate' | 'harmful';
  summary?: string;
  productName?: string;
  barcode?: string;
  taiwanWarnings?: string[];
  scansLeft?: number;
  creditsExpiry?: string;
  overall_risk?: string;
  child_safe?: boolean;
  notes?: string[];
}

interface AppContextType {
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  scanResults: AnalysisResult[];
  addScanResult: (result: AnalysisResult) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [scanResults, setScanResults] = useState<AnalysisResult[]>([]);

  const addScanResult = (result: AnalysisResult) => {
    setScanResults(prev => [result, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      scanResults,
      addScanResult
    }}>
      {children}
    </AppContext.Provider>
  );
};