import React, { useState, useEffect } from 'react';
import InstructionsScreen from './InstructionsScreen';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useScanHistory, ScanHistoryEntry } from '@/hooks/useScanHistory';
import SplashScreen from './SplashScreen';
import HomeScreen from './HomeScreen';
import ScanScreen from './ScanScreen';
import ManualInputScreen from './ManualInputScreen';
import ResultScreen from './ResultScreen';
import SettingsScreen from './SettingsScreen';
import JunkFoodScoreInfo from './JunkFoodScoreInfo';
import ScanHistoryScreen from './ScanHistoryScreen';
import UpgradeConfirmationScreen from './UpgradeConfirmationScreen';
import FirstLaunchPrompt from './FirstLaunchPrompt';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsOfUsePage from './TermsOfUsePage';
import ApiTestScreen from './ApiTestScreen';

// ---- TEMP SHIM: avoid old GPTImageAnalysisService error in browser ----
declare global { 
  interface Window {
    GPTImageAnalysisService?: {
      analyzeProduct: (...args: any[]) => Promise<any>;
    };
  }
}

if (typeof window !== 'undefined' && !window.GPTImageAnalysisService) {
  window.GPTImageAnalysisService = {
    // Old code might call this; we just return null so it does nothing.
    analyzeProduct: async () => {
      return null;
    },
  };
}
// ---- END SHIM ----


type Screen =
  | 'splash'
  | 'home'
  | 'scan-label'
  | 'manual-input'
  | 'result'
  | 'settings'
  | 'junk-food-info'
  | 'scan-history'
  | 'upgrade-confirmation'
  | 'privacy-policy'
  | 'terms-of-use'
  | 'api-test'
  | 'instructions';
const AppLayout: React.FC = () => {
// 🔴 CANARY TEST — DO NOT REMOVE
const BUILD_TAG = "CANARY_2026_01_07_B";
console.log("🚨 CANARY BUILD ACTIVE:", BUILD_TAG, new Date().toISOString());
  const { addScanResult } = useAppContext();
  const { user, showUpgradeConfirmation, setShowUpgradeConfirmation, upgradedPlan } = useUser();
  const { addScan } = useScanHistory();

const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [showFirstLaunch, setShowFirstLaunch] = useState(false);

  useEffect(() => {
    if (showUpgradeConfirmation) {
      setCurrentScreen('upgrade-confirmation');
    }
  }, [showUpgradeConfirmation]);

  const handleSplashComplete = () => {
    const hasSeenFirstLaunch = localStorage.getItem('hasSeenFirstLaunch');
    if (!hasSeenFirstLaunch) {
      setShowFirstLaunch(true);
    }
    setCurrentScreen('home');
  };

  const handleFirstLaunchClose = () => {
    localStorage.setItem('hasSeenFirstLaunch', 'true');
    setShowFirstLaunch(false);
  };

  const handlePrivacyPolicy = () => {
    setCurrentScreen('privacy-policy');
    setShowFirstLaunch(false);
  };

  const handleTermsOfUse = () => {
    setCurrentScreen('terms-of-use');
    setShowFirstLaunch(false);
  };

  const handleScanLabel = () => {
    setCurrentScreen('scan-label');
  };

 
  const handleManualInput = () => {
    setCurrentScreen('manual-input');
  };

  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleJunkFoodInfo = () => {
    setCurrentScreen('junk-food-info');
  };

  const handleScanHistory = () => {
    setCurrentScreen('scan-history');
  };

  const handleApiTest = () => {
    setCurrentScreen('api-test');
  };

  const handleScanResult = (result: AnalysisResult | null, error?: string) => {
  // If backend failed or gave no result, just store the error and stop.
  if (error || !result) {
    setCurrentError(error || 'Analysis failed. Please try again.');
    setCurrentResult(null);
    return; // ⬅ VERY important: do not touch result.ingredients below
  }

  // Happy path: we have a real result
  setCurrentError(null);

  addScan({
    productName: result.extractedIngredients?.[0] || 'Unknown Product',
    riskLevel: result.verdict,
    verdict: result.verdict,
    ingredients: result?.ingredients ?? [], 
    tips: result.tips || [],
    junkFoodScore: result.junkFoodScore,
  });

  setCurrentResult(result);
  setCurrentScreen('result');
};


  const handleBackToHome = () => {
    setCurrentScreen('home');
    setCurrentResult(null);
    setCurrentError(null);
  };

  const handleBack = () => {
    if (currentScreen === 'privacy-policy' || currentScreen === 'terms-of-use') {
      setCurrentScreen('home');
    } else if (currentScreen === 'result') {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('home');
    }
    setCurrentError(null);
  };

  const handleViewScanDetails = (scan: ScanHistoryEntry) => {
    const result: AnalysisResult = {
      id: scan.id,
      ingredients: scan.ingredients || [],
      verdict: scan.verdict,
      tips: scan.tips || [],
      timestamp: scan.scanDate,
      junkFoodScore: scan.junkFoodScore,
      productType: 'Product',
      extractedIngredients: [scan.productName]
    };
    
    setCurrentResult(result);
    setCurrentScreen('result');
  };

  const handleStartScanning = () => {
    setShowUpgradeConfirmation(false);
    setCurrentScreen('home');
  };

  const renderScreen = () => {
const { language } = useAppContext();
const isChinese = language === "zh";

const title =
  currentScreen === "scan-label"
    ? (isChinese ? "掃描成分標籤" : "Scan Ingredient Label")
    : currentScreen === "manual-input"
    ? (isChinese ? "手動輸入" : "Manual Input")
    : "";
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      case 'home':
        <div
  style={{
    position: "fixed",
    top: 8,
    left: 8,
    zIndex: 99999,
    background: "red",
    color: "white",
    padding: "6px 10px",
    fontWeight: 900,
    fontSize: "14px",
  }}
>
  🚨 BUILD {BUILD_TAG}
</div>
          <>
            <HomeScreen
  onScanLabel={handleScanLabel}
  onManualInput={handleManualInput}
  onSettings={handleSettings}
 />
            <FirstLaunchPrompt
              isOpen={showFirstLaunch}
              onClose={handleFirstLaunchClose}
              onPrivacyPolicy={handlePrivacyPolicy}
              onTermsOfUse={handleTermsOfUse}
            />
          </>
        );
case 'instructions':
  return (
    <InstructionsScreen
      onBack={() => setCurrentScreen('home')}
    />
  );
const { language } = useAppContext();
const isChinese = language === "zh";
console.log("[AppLayout] language =", language, "currentScreen =", currentScreen);

      case 'scan-label':
        return (
          <ScanScreen
            type="label"
            onBack={handleBack}
            onResult={handleScanResult}
          />
        );
             
       
      case 'manual-input':
        return (
          <ManualInputScreen
            onBack={handleBack}
            onResult={handleScanResult}
          />
        );
      case 'result':
        return currentResult ? (
          <ResultScreen
            result={currentResult}
            onBack={handleBack}
            onHome={handleBackToHome}
            onJunkFoodInfo={handleJunkFoodInfo}
            error={currentError || undefined}
          />
        ) : null;
      case 'settings':
        return (
          <SettingsScreen
            onBack={handleBack}
            onPrivacyPolicy={handlePrivacyPolicy}
            onTermsOfUse={handleTermsOfUse}
          />
        );
      case 'junk-food-info':
        return (
          <JunkFoodScoreInfo
            onBack={handleBack}
          />
        );
      case 'scan-history':
        return (
          <ScanHistoryScreen
            onBack={handleBack}
            onViewDetails={handleViewScanDetails}
          />
        );
      case 'privacy-policy':
        return (
          <PrivacyPolicyPage
            onBack={handleBack}
          />
        );
      case 'terms-of-use':
        return (
          <TermsOfUsePage
            onBack={handleBack}
          />
        );
      case 'api-test':
        return (
          <ApiTestScreen
            onBack={handleBack}
          />
        );
      case 'upgrade-confirmation':
        return upgradedPlan ? (
          <UpgradeConfirmationScreen
            plan={upgradedPlan}
            onStartScanning={handleStartScanning}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default AppLayout;