import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import  GPTImageAnalysisService  from '../services/gptImageAnalysis';

interface ApiTestScreenProps {
  onBack: () => void;
}
const ApiTestScreen: React.FC<ApiTestScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Test with sample barcode
  const testBarcode = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('Testing barcode API call...');
      const response = await GPTImageAnalysisService.analyzeProduct(
        undefined, // no image
        undefined, // no ingredients
        '4710088412345' // sample Taiwan barcode
      );
      setResult(response);
    } catch (err: any) {
      setError(err.message);
      console.error('Barcode test error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test with sample ingredients
  const testIngredients = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
     const response = await GPTImageAnalysisService.analyzeProduct(
  undefined, // no image
  '水、糖、檸檬酸、苯甲酸鈉、人工香料、黃色5號',
  undefined // no barcode
);
      setResult(response);
    } catch (err: any) {
      setError(err.message);
      console.error('Ingredients test error:', err);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="p-4 space-y-4">
      <div className="flex items-center mb-4">
        <Button onClick={onBack} variant="ghost" className="mr-2">
          ← 返回
        </Button>
        <h1 className="text-xl font-bold">API 測試</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>🧪 API Test - 食安眼 (Food Safety Eye)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Button 
              onClick={testBarcode} 
              disabled={loading}
              variant="outline"
            >
              {loading ? '測試中...' : '測試條碼 API'}
            </Button>
            
            <Button 
              onClick={testIngredients} 
              disabled={loading}
              variant="outline"
            >
              {loading ? '測試中...' : '測試成分 API'}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">🚀 直接 POST 測試</h4>
            <Button 
              onClick={testRealPost} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '發送中...' : '發送真實 POST 請求'}
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <h3 className="text-red-800 font-semibold">❌ 錯誤</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <h3 className="text-green-800 font-semibold">✅ API 回應成功</h3>
                <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestScreen;
