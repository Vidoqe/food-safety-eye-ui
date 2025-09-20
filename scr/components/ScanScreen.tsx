// scr/components/ScanScreen.tsx
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import useTranslation from '@/utils/translations';
import GPTImageAnalysisService from '@/services/gptImageAnalysis';
import ScanLimitDialog from '@/components/ScanLimitDialog';

interface ScanScreenProps {
  type: 'label' | 'barcode';
  onBack: () => void;
  onResult: (result: AnalysisResult, error?: string) => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({ type, onBack, onResult }) => {
  const { user, canScan, incrementScanCount, getScanStatusMessage, creditSummary } = useUser();
  const { language, addScanResult } = useAppContext();
  const t = useTranslation(language);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [error, setError] = useState<string>('');

  const scanStatusMessage = getScanStatusMessage();

  // --- Capture helpers (same flow as the previously working Alternate button) ---
  const fallbackCapture = () => {
    try {
      // Prefer modern picker if supported
      // @ts-ignore - showPicker isn't in TS DOM defs everywhere
      if (inputRef.current?.showPicker) {
        // @ts-ignore
        inputRef.current.showPicker();
      } else {
        inputRef.current?.click();
      }
    } catch {
      inputRef.current?.click();
    }
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageBase64(dataUrl);
      // Immediately start analysis after capture
      await handleAnalyze(dataUrl);
    } catch (err) {
      console.error('read file error:', err);
      setError(t.language === 'zh' ? '讀取影像失敗' : 'Failed to read image.');
    }
  };
  // ---------------------------------------------------------------------------

  const handleAnalyze = async (img?: string) => {
    if (!user || !canScan) {
      setShowLimitDialog(true);
      return;
    }
    const image = img ?? imageBase64;
    if (!image) {
      setError(t.language === 'zh' ? '請先拍照上傳標籤' : 'Please capture an image first.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError('');

      const analysis = await GPTImageAnalysisService.analyzeProduct(
        image,
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
        extractedIngredients: analysis.extractedIngredients,
        keyDetectedSubstances: analysis.regulatedAdditives,
        isNaturalProduct: analysis.isNaturalProduct,
        regulatedAdditives: analysis.regulatedAdditives,
        junkFoodScore: analysis.junkFoodScore,
        quickSummary: analysis.quickSummary,
        overallSafety: analysis.overallSafety,
        summary: analysis.summary,
        warnings: analysis.warnings,
        barcode: analysis.barcode || '',
        scanInfo: analysis.scanInfo || '',
        creditsExpiry: analysis.creditsExpiry || '',
        overall_risk: analysis.overall_risk || '',
        child_safe: analysis.child_safe ?? true,
        notes: analysis.notes || '',
      };

      addScanResult(result);
      incrementScanCount();
      onResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(t.language === 'zh' ? '分析失敗，請重試。' : 'Analysis failed, please try again.');
      // Also show an "error" result card so user isn’t stuck
      onResult({
        id: Date.now().toString(),
        ingredients: [],
        verdict: 'moderate',
        tips: [],
        timestamp: new Date(),
        productType: 'Error',
        isEdible: false,
        extractedIngredients: [],
        keyDetectedSubstances: [],
        isNaturalProduct: false,
        regulatedAdditives: [],
        junkFoodScore: 0,
        quickSummary: 'Error',
        overallSafety: '',
        summary: '',
        warnings: [],
        barcode: '',
        scanInfo: '',
        creditsExpiry: '',
        overall_risk: '',
        child_safe: false,
        notes: '',
      });
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
            {type === 'label' ? t.scanLabel : t.scanBarcode}
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

        {/* Hidden camera input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          // @ts-ignore: capture is a hint for mobile browsers
          capture="environment"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-gray-500">
                  <Camera className="w-16 h-16 mx-auto mb-2" />
                  <p>{type === 'label'
                    ? (t.language === 'zh' ? '拍攝產品標籤成分列表' : 'Capture ingredient list')
                    : (t.language === 'zh' ? '拍攝條碼' : 'Capture barcode')}
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            {!imageBase64 ? (
              <Button
                onClick={fallbackCapture}
                disabled={isAnalyzing}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
              >
                <Camera className="w-5 h-5 mr-2" />
                {t.language === 'zh' ? '拍照' : 'Take Photo'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t.language === 'zh' ? '分析中…' : 'Analyzing…'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      {t.language === 'zh' ? '開始分析' : 'Start Analysis'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setPreviewUrl(null);
                    setImageBase64(null);
                    setError('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {t.language === 'zh' ? '重新拍攝' : 'Retake Photo'}
                </Button>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">
                {error}
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
