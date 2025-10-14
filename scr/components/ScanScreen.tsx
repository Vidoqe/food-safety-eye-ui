import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import { analyzeProduct }  from '../services/gptImageAnalysis';
import { ScanLimitDialog } from '@/components/ScanLimitDialog';

interface ScanScreenProps {
  type: 'label' | 'barcode';
  onBack: () => void;
  onResult: (result: AnalysisResult, error?: string) => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({ type, onBack, onResult }) => {
  const { language, addScanResult } = useAppContext();
  const { user, canScan, incrementScanCount, getScanStatusMessage, creditSummary } = useUser();
  const t = useTranslation(language);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleImageCapture = async () => {
    try {
      const imageBase64 = await GPTImageAnalysisService.captureImageFromCamera();
      setSelectedImage(imageBase64);
      setError('');
    } catch (error) {
      console.error('Camera capture error:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('請先上傳食品標籤圖片才能分析成分');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    
    try {
      // Use 食安眼 (Food Safety Eye) analyzeProduct method
      const analysis = await GPTImageAnalysisService.analyzeProduct(
        selectedImage,
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
        productName: analysis.productName,
        barcode: analysis.barcode,
        taiwanWarnings: analysis.taiwanWarnings,
        scansLeft: analysis.scansLeft,
        creditsExpiry: analysis.creditsExpiry,
        overall_risk: analysis.overall_risk,
        child_safe: analysis.child_safe,
        notes: analysis.notes
      };
      
      addScanResult(result);
      setIsAnalyzing(false);
      onResult(result);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      
      // Show error without returning to dashboard
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
        quickSummary: 'Error'
      }, error.message || 'No result – please try another image.');
    }
  };

  const scanStatusMessage = getScanStatusMessage();

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
                <img 
                  src={selectedImage} 
                  alt="Captured product" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : isAnalyzing ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'zh' ? '正在分析成分...' : 'Analyzing ingredients...'}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {type === 'label' 
                      ? (language === 'zh' ? '拍攝產品標籤成分列表' : 'Capture ingredient list')
                      : (language === 'zh' ? '拍攝產品條碼' : 'Capture barcode')
                    }
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
                onClick={handleImageCapture}
                disabled={isAnalyzing}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
              >
                <Camera className="w-5 h-5 mr-2" />
                {language === 'zh' ? '拍攝照片' : 'Take Photo'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {isAnalyzing 
                    ? (language === 'zh' ? '分析中...' : 'Analyzing...')
                    : (language === 'zh' ? '開始分析' : 'Start Analysis')
                  }
                </Button>
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  className="w-full"
                >
                  {language === 'zh' ? '重新拍攝' : 'Retake Photo'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <ScanLimitDialog 
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
      />
    </div>
  );
};

export default ScanScreen;
