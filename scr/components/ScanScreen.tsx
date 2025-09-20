import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import GPTImageAnalysisService from '@/services/gptImageAnalysis';

interface ScanScreenProps {
  type: 'label' | 'barcode';
  onBack: () => void;
  onResult: (result: AnalysisResult, error?: string) => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({ type, onBack, onResult }) => {
  const { addScanResult } = useAppContext();
  const { getScanStatusMessage } = useUser();
  const language = useTranslation();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const openCamera = () => {
    const el = inputRef.current;
    if (!el) return;
    try {
      // Prefer modern picker (Chrome/Android supports this)
      // @ts-ignore
      if (el.showPicker) el.showPicker();
      else el.click();
    } catch {
      el.click();
    }
  };

  // === STEP 2: now we auto-analyze after photo ===
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📸 onInputChange fired");  // DEBUG LOG
    try {
      const files = e.target.files;
      e.target.value = ''; // allow re-pick
      if (!files || !files.length) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        setError('');
        console.log("✅ Image loaded from FileReader"); // DEBUG LOG
        // 🔥 Immediately analyze
        handleAnalyze(dataUrl);
      };
      reader.onerror = () => {
        setError('Could not read photo. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setError('Could not read photo. Please try again.');
    }
  };

  const fallbackCapture = async () => {
    try {
      const dataUrl = await GPTImageAnalysisService.captureImageFromCamera();
      setSelectedImage(dataUrl);
      setError('');
      await handleAnalyze(dataUrl); // keep alternate working
    } catch (err) {
      console.error('Fallback capture failed:', err);
      setError('Camera not available. Try the Gallery option.');
    }
  };

  const handleAnalyze = async (imgOverride?: string) => {
    console.log("🔍 handleAnalyze called"); // DEBUG LOG
    const img = imgOverride ?? selectedImage;
    if (!img) {
      setError(language === 'zh' ? '请先拍照后再分析' : 'Please take a photo first');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const analysis = await GPTImageAnalysisService.analyzeProduct(
        img,
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
        barcode: analysis.barcode,
        healthWarnings: analysis.healthWarnings,
        scanInfo: analysis.scanInfo,
        creditExpiry: analysis.creditsExpiry,
        overall_risk: analysis.overall_risk,
        child_safe: analysis.child_safe,
        notes: '',
      };

      addScanResult(result);
      setIsAnalyzing(false);
      onResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      onResult(
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
          healthWarnings: [],
          scanInfo: '',
          creditExpiry: '',
          overall_risk: '',
          child_safe: false,
          notes: '',
        },
        'No result – please try another image.'
      );
    }
  };

  const scanStatusMessage = getScanStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <input
        id="camera-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onInputChange}
        style={{
          position: 'absolute',
          width: '0.1px',
          height: '0.1px',
          opacity: 0,
          overflow: 'hidden',
          zIndex: -1,
        }}
      />

      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-green-800">
            {type === 'label'
              ? language === 'zh'
                ? '扫描产品标签'
                : 'Scan Label'
              : language === 'zh'
              ? '扫描条码'
              : 'Scan Barcode'}
          </h1>
        </div>

        {scanStatusMessage && (
          <Card className="p-4 mb-4 bg-red-50 border-red-200">
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
              ) : isAnalyzing ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">{language === 'zh' ? '正在分析原料…' : 'Analyzing ingredients…'}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {type === 'label'
                      ? language === 'zh'
                        ? '拍摄产品标签成分列表'
                        : 'Capture ingredient list'
                      : language === 'zh'
                      ? '拍摄商品条码'
                      : 'Capture barcode'}
                  </p>
                </div>
              )}
            </div>

            {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</div>}

            {!selectedImage ? (
              <div className="space-y-3">
                <Button
                  onClick={openCamera}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {language === 'zh' ? '拍照' : 'Take Photo'}
                </Button>

                <Button variant="outline" onClick={fallbackCapture} className="w-full">
                  {language === 'zh' ? '备用拍照方式' : 'Try Alternate Capture'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {isAnalyzing
                    ? language === 'zh'
                      ? '分析中…'
                      : 'Analyzing…'
                    : language === 'zh'
                    ? '开始分析'
                    : 'Start Analysis'}
                </Button>

                <Button onClick={() => setSelectedImage(null)} variant="outline" className="w-full">
                  {language === 'zh' ? '重新拍摄' : 'Retake Photo'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ScanScreen;
