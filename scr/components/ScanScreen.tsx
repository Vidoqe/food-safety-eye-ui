// scr/components/ScanScreen.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import GPTImageAnalysisService from '@/services/gptImageAnalysis';
import ScanLimitDialog from '@/components/ScanLimitDialog';

interface ScanScreenProps {
  type: 'label' | 'barcode';
  onBack: () => void;
  onResult: (result: AnalysisResult, error?: string) => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({ type, onBack, onResult }) => {
  const { user, canScan, incrementScanCount, getScanStatusMessage, creditSummary } = useAppContext();
  const { language } = useUser();
  const t = useTranslation(language);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const scanStatusMessage = getScanStatusMessage();

  // --- GREEN BUTTON (single path) ---
  const openCamera = async () => {
    try {
      // Same capture logic as the old "alternate" path
      const imageBase64 = await GPTImageAnalysisService.captureImageFromCamera();
      setSelectedImage(imageBase64);
      setError('');
      // Immediately analyze after capture
      await handleAnalyze(imageBase64);
    } catch (err: any) {
      console.error('Camera capture error:', err);
      setError(t.language === 'zh' ? '無法開啟相機或讀取照片' : 'Could not open camera or read photo');
    }
  };

  const handleAnalyze = async (imageBase64Param?: string) => {
    const imageBase64 = imageBase64Param ?? selectedImage;
    if (!imageBase64) {
      setError(t.language === 'zh' ? '請先拍照或選擇照片' : 'Please capture a photo first');
      return;
    }

    // Credit / usage limit
    if (!canScan()) {
      setShowLimitDialog(true);
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Send raw image to backend; backend/GPT performs OCR (no Google Vision required)
      const analysis = await GPTImageAnalysisService.analyzeProduct(
        imageBase64,
        undefined,
        undefined,
        language === 'zh' ? 'zh' : 'en'
      );

      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: analysis.ingredients,
        verdict: analysis.verdict,
        tips: analysis.tips || [],
        timestamp: new Date(),
        productType: type === 'barcode' ? 'Barcode Scan' : 'Label Scan',
        isEdible: true,
        extractedIngredients: analysis.extractedIngredients ?? analysis.ingredients ?? [],
        keyDetectedSubstances: analysis.regulatedAdditives ?? [],
        isNaturalProduct: analysis.isNaturalProduct ?? false,
        regulatedAdditives: analysis.regulatedAdditives ?? [],
        junkFoodScore: analysis.junkFoodScore ?? 0,
        quickSummary: analysis.quickSummary ?? '',
        overallSafety: analysis.overallSafety ?? '',
        summary: analysis.summary ?? '',
        barcode: analysis.barcode ?? '',
        scanInfo: analysis.scanInfo ?? '',
        creditsExpiry: analysis.creditsExpiry ?? '',
        overall_risk: analysis.overall_risk ?? '',
        child_safe: analysis.child_safe ?? true,
        notes: analysis.notes ?? '',
        healthWarnings: analysis.healthWarnings ?? [],
        warnings: analysis.warnings ?? [],
      };

      incrementScanCount();
      onResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);

      // Show an inline error AND still return an error result (so UI can show something)
      const errMsg =
        t.language === 'zh'
          ? '分析失敗，請重試或重新拍照。'
          : 'Analysis failed. Please try again or retake the photo.';
      setError(errMsg);

      onResult(
        {
          id: Date.now().toString(),
          ingredients: [],
          verdict: 'moderate',
          tips: [],
          timestamp: new Date(),
          productType: type === 'barcode' ? 'Barcode Scan' : 'Label Scan',
          isEdible: false,
          extractedIngredients: [],
          keyDetectedSubstances: [],
          isNaturalProduct: false,
          regulatedAdditives: [],
          junkFoodScore: 0,
          quickSummary: 'Error',
          overallSafety: '',
          summary: '',
          barcode: '',
          scanInfo: '',
          creditsExpiry: '',
          overall_risk: 'moderate',
          child_safe: true,
          notes: '',
          healthWarnings: [],
          warnings: [],
        },
        errMsg
      );
      return;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-green-800">
            {type === 'label' ? (t.language === 'zh' ? '掃描產品標籤' : 'Scan Label') : 'Scan'}
          </h1>
        </div>

        {scanStatusMessage && (
          <Card className="p-4 mb-4 border-red-200">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p className="text-sm font-medium">{scanStatusMessage}</p>
            </div>
          </Card>
        )}

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {selectedImage ? (
                <img src={selectedImage} alt="Captured product" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {t.language === 'zh' ? '拍攝產品標籤成分列表' : 'Capture ingredient list'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {!selectedImage ? (
              <Button
                onClick={openCamera}
                disabled={isAnalyzing}
                className="w-full h-12 bg-green-600 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
              >
                <Camera className="w-5 h-5 mr-2" />
                {t.language === 'zh' ? '拍照' : 'Take Photo'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="w-full h-12 bg-green-600 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {isAnalyzing
                    ? t.language === 'zh' ? '分析中…' : 'Analyzing…'
                    : t.language === 'zh' ? '開始分析' : 'Start Analysis'}
                </Button>

                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  className="w-full"
                >
                  {t.language === 'zh' ? '重新拍攝' : 'Retake Photo'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <ScanLimitDialog open={showLimitDialog} onClose={() => setShowLimitDialog(false)} />
      </div>
    </div>
  );
};

export default ScanScreen;
