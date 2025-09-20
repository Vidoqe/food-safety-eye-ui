// scr/components/ScanScreen.tsx
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import GPTImageAnalysisService from '@/services/gptImageAnalysis';
import ScanLimitDialog from '@/components/ScanLimitDialog';
import { Camera, Upload, AlertCircle } from 'lucide-react';

type ScanScreenProps = {
  type: 'label' | 'barcode';
  onBack?: () => void;
  onResult?: (result: AnalysisResult, error?: string) => void;
};

const ScanScreen: React.FC<ScanScreenProps> = ({ type, onBack, onResult }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { user, canScan, incrementScanCount, getScanStatusMessage, creditSummary } = useUser();
  const { language } = useAppContext();
  const t = useTranslation(language);

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [error, setError] = useState<string>('');

  const scanStatusMessage = getScanStatusMessage?.() ?? '';

  // ---- utilities ----
  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('read file failed'));
      reader.readAsDataURL(file);
    });

  // Open camera (green button)
  const openCamera = useCallback(() => {
    if (!inputRef.current) return;
    try {
      // Prefer modern picker if available
      // @ts-ignore
      if (inputRef.current.showPicker) {
        // @ts-ignore
        inputRef.current.showPicker();
      } else {
        inputRef.current.click();
      }
    } catch {
      inputRef.current.click();
    }
  }, []);

  // Input change => set preview & base64
  const onInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = ''; // allow re-selecting the same photo
      if (!f) return;

      setError('');
      const objectUrl = URL.createObjectURL(f);
      setPreviewUrl(objectUrl);

      try {
        const dataUrl = await fileToDataUrl(f);
        setImageBase64(dataUrl);
      } catch (err) {
        console.error('toDataUrl error', err);
        setError('讀取圖片失敗 / Failed to load image');
        setImageBase64(null);
        setPreviewUrl(null);
      }
    },
    []
  );

  // Analyze pressed (must use imageBase64!)
  const handleAnalyze = useCallback(async () => {
    if (!imageBase64) {
      setError('請先拍照或選擇圖片 / Please take a photo first');
      return;
    }

    if (canScan && !canScan()) {
      setShowLimitDialog(true);
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const analysis = await GPTImageAnalysisService.analyzeProduct(imageBase64, undefined, {
        language: language === 'zh' ? 'zh' : 'en',
      });

      // increment credits if available
      incrementScanCount?.();

      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: analysis.ingredients ?? [],
        verdict: analysis.verdict ?? 'moderate',
        tips: analysis.tips ?? [],
        timestamp: new Date(),
        productType: type === 'barcode' ? 'Barcode Scan' : 'Label Scan',
        isEdible: true,
        extractedIngredients: analysis.extractedIngredients ?? [],
        keyDetectedSubstances: analysis.regulatedAdditives ?? [],
        isNaturalProduct: analysis.isNaturalProduct ?? false,
        regulatedAdditives: analysis.regulatedAdditives ?? [],
        junkFoodScore: analysis.junkFoodScore ?? 0,
        quickSummary: analysis.quickSummary ?? '',
        overallSafety: analysis.overallSafety ?? '',
        summary: analysis.summary ?? '',
        warnings: analysis.warnings ?? [],
        barcode: analysis.barcode ?? '',
        analysisTips: analysis.tips ?? [],
        scanInfo: analysis.scanInfo ?? '',
        creditsExpiry: analysis.creditsExpiry ?? '',
        overall_risk: analysis.overall_risk ?? '',
        child_safe: analysis.child_safe ?? false,
        notes: analysis.notes ?? '',
      };

      onResult?.(result);
    } catch (err: any) {
      console.error('Analyze error:', err);
      const msg = typeof err?.message === 'string' ? err.message : '分析失敗 / Analysis failed';
      setError(msg);
      onResult?.(
        {
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
          analysisTips: [],
          scanInfo: '',
          creditsExpiry: '',
          overall_risk: '',
          child_safe: false,
          notes: '',
        },
        msg
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageBase64, canScan, incrementScanCount, language, onResult, type]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-2">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            ←
          </Button>
          <h1 className="text-2xl font-bold text-green-800">
            {language === 'zh' ? '掃描產品標籤' : 'Scan Product Label'}
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
          // @ts-ignore: capture is a known non-standard hint for mobile
          capture="environment"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        {/* Preview */}
        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-gray-500 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-2" />
                  {language === 'zh' ? '拍攝成分列表' : 'Capture ingredient list'}
                </div>
              )}
            </div>

            {/* Take / Analyze buttons */}
            {!imageBase64 ? (
              <Button
                onClick={openCamera}
                disabled={isAnalyzing}
                className="w-full h-12 bg-green-600 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
              >
                <Camera className="w-5 h-5 mr-2" />
                {language === 'zh' ? '拍照' : 'Take Photo'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !imageBase64}
                  className="w-full h-12 bg-green-600 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Upload className="w-5 h-5 mr-2 animate-spin" />
                      {language === 'zh' ? '分析中…' : 'Analyzing…'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      {language === 'zh' ? '開始分析' : 'Start Analysis'}
                    </>
                  )}
                </Button>

                <Button onClick={() => { setImageBase64(null); setPreviewUrl(null); }} variant="outline" className="w-full">
                  {language === 'zh' ? '重新拍照' : 'Retake Photo'}
                </Button>
              </div>
            )}

            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
          </div>
        </Card>

        <ScanLimitDialog open={showLimitDialog} onClose={() => setShowLimitDialog(false)} />
      </div>
    </div>
  );
};

export default ScanScreen;
