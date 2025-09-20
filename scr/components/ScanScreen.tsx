import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import GPTImageAnalysisService from '@/services/gptImageAnalysis';
import ScanLimitDialog from '@/components/ScanLimitDialog';

type Props = {
  type: 'label' | 'barcode';
  onBack: () => void;
  onResult: (result: AnalysisResult, error?: string) => void;
};

const ScanScreen: React.FC<Props> = ({ type, onBack, onResult }) => {
  const { canScan, incrementScanCount, getScanStatusMessage } = useAppContext();
  const { language } = useUser();
  const t = useTranslation(language);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [error, setError] = useState<string>('');

  const scanStatusMessage = getScanStatusMessage();

  const openCamera = () => {
    // Pure in-component capture, same method as the previously working path
    if (!inputRef.current) return;
    try {
      // Prefer showPicker if available on device, otherwise click().
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
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string); // data URL
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      setError('');
      if (!files || files.length === 0) return;

      const file = files[0];

      // Preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });

      try {
        // Convert to base64 for API
        const dataUrl = await fileToDataUrl(file);
        setImageBase64(dataUrl);

        // Auto analyze right away
        await handleAnalyze(dataUrl);
      } catch (err) {
        console.error('File read error:', err);
        setError(
          t.language === 'zh' ? '讀取照片失敗，請重試或重新拍照。' : 'Failed to read photo. Please try again.'
        );
      }
    },
    [t.language]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // reset so selecting the same photo again still triggers change
    e.target.value = '';
  };

  const handleAnalyze = async (imgBase64?: string) => {
    const base64 = imgBase64 ?? imageBase64;
    if (!base64) {
      setError(t.language === 'zh' ? '請先拍照或選擇照片' : 'Please capture a photo first');
      return;
    }

    if (!canScan()) {
      setShowLimitDialog(true);
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Call the same backend you used before (no Google Vision needed)
      const analysis = await GPTImageAnalysisService.analyzeProduct(
        base64,
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
    } catch (err) {
      console.error('Analyze error:', err);
      const msg =
        t.language === 'zh' ? '分析失敗，請重試或重新拍照。' : 'Analysis failed. Please try again or retake the photo.';
      setError(msg);

      // Return a safe error result so UI doesn’t blank out
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
        msg
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retake = () => {
    setImageBase64(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError('');
    openCamera();
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

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-lg" />
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

            {!imageBase64 ? (
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
                  {isAnalyzing ? (t.language === 'zh' ? '分析中…' : 'Analyzing…') : (t.language === 'zh' ? '開始分析' : 'Start Analysis')}
                </Button>

                <Button onClick={retake} variant="outline" className="w-full">
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
