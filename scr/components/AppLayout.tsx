import React, { useState, useEffect } from 'react';
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

type Screen = 'splash' | 'home' | 'scan-label' | 'scan-barcode' | 'manual-input' | 'result' | 'settings' | 'junk-food-info' | 'scan-history' | 'upgrade-confirmation' | 'privacy-policy' | 'terms-of-use' | 'api-test';

const AppLayout: React.FC = () => {
  const { addScanResult } = useAppContext();
  const { user, showUpgradeConfirmation, setShowUpgradeConfirmation, upgradedPlan } = useUser();
  const { addScan } = useScanHistory();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
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

  const handleScanBarcode = () => {
    setCurrentScreen('scan-barcode');
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

  const handleScanResult = (result: AnalysisResult, error?: string) => {
    if (error) {
      setCurrentError(error);
    } else {
      setCurrentError(null);
      addScanResult(result);
      
      addScan({
        productName: result.extractedIngredients?.[0] || 'Unknown Product',
        riskLevel: result.verdict,
        verdict: result.verdict,
        ingredients: result.ingredients,
        tips: result.tips,
        junkFoodScore: result.junkFoodScore
      });
    }
    
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
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      case 'home':
        return (
          <>
            <HomeScreen
              onScanLabel={handleScanLabel}
              onScanBarcode={handleScanBarcode}
              onManualInput={handleManualInput}
              onSettings={handleSettings}
              onScanHistory={handleScanHistory}
              onApiTest={handleApiTest}
            />
            <FirstLaunchPrompt
              isOpen={showFirstLaunch}
              onClose={handleFirstLaunchClose}
              onPrivacyPolicy={handlePrivacyPolicy}
              onTermsOfUse={handleTermsOfUse}
            />
          </>
        );
      case 'scan-label':
        return (
          <ScanScreen
            type="label"
            onBack={handleBack}
            onResult={handleScanResult}
          />
        );
      case 'scan-barcode':
        return (
          <ScanScreen
            type="barcode"
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