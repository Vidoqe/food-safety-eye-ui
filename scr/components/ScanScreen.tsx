// scr/components/ScanScreen.tsx

import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, AlertCircle } from 'lucide-react';

import { useAppContext } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import ScanLimitDialog from '@/components/ScanLimitDialog';

// --- API helper: send image (and optional barcode/text) to server for analysis ---
async function analyzeViaAPI(params: {
  imageBase64?: string;
  barcode?: string;
  manualText?: string;
  language?: 'en' | 'zh';
}) {
  const res = await fetch('/api/analyze-product-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${txt || res.statusText}`);
  }

  const data = await res.json();
  if (!data?.success) {
    throw new Error(data?.error || 'Analysis failed');
  }
  return data.analysis; // shape consumed by Result screen
}

export default function ScanScreen(): JSX.Element {
  const navigate = useNavigate();

  // contexts
  const { setAnalysisResult } = useAppContext() as any;
  const { user } = useUser() as any;
  const language: 'en' | 'zh' = (user?.language ?? 'en') as 'en' | 'zh';
  const t = useTranslation(language);

  // local state
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // open mobile camera or file picker
  const openCamera = useCallback(() => {
    if (!inputRef.current) return;
    try {
      // prefer modern picker if present
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

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError('');
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const dataUrl = await fileToDataUrl(file);
        setImageBase64(dataUrl);
        setPreviewUrl(URL.createObjectURL(file));
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to read image');
      } finally {
        // allow selecting same image again if user wants
        e.target.value = '';
      }
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    setError('');
    try {
      const analysis = await analyzeViaAPI({
        imageBase64,
        language,
      });

      setAnalysisResult?.(analysis);
      navigate('/result');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Analyze failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageBase64, language, navigate, setAnalysisResult]);

  const resetPhoto = () => {
    setImageBase64(null);
    setPreviewUrl(null);
    setError('');
  };

  return (
    <div className="px-4 py-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">
        {language === 'zh' ? '掃描產品標籤' : 'Scan Product Label'}
      </h1>

      {showLimitDialog && (
        <ScanLimitDialog open={showLimitDialog} onOpenChange={setShowLimitDialog} />
      )}

      {error && (
        <div className="p-4 mb-4 rounded bg-red-50 border border-red-200 text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* hidden file input that triggers the camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment" // hint for mobile back camera
        onChange={onInputChange}
        style={{ display: 'none' }}
      />

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="w-full h-64 bg-gray-100 rounded-xl border border-dashed border-gray-300 overflow-hidden flex items-center justify-center mb-6">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Camera className="w-12 h-12 mb-2" />
                <p className="text-sm">
                  {language === 'zh' ? '拍攝產品標籤成分列表' : 'Capture ingredient list'}
                </p>
              </div>
            )}
          </div>

          {!imageBase64 ? (
            <button
              onClick={openCamera}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center"
            >
              <Camera className="w-5 h-5 mr-2" />
              {language === 'zh' ? '拍照' : 'Take Photo'}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <span className="mr-2 inline-block animate-spin border-2 border-white/60 border-t-white rounded-full w-4 h-4" />
                    {language === 'zh' ? '分析中…' : 'Analyzing…'}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    {language === 'zh' ? '開始分析' : 'Start Analysis'}
                  </span>
                )}
              </button>

              <button
                onClick={resetPhoto}
                className="w-full h-12 bg-white border border-gray-300 text-gray-800 font-medium rounded-xl"
              >
                {language === 'zh' ? '重拍照片' : 'Retake Photo'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {t?.scanStatusMessage ? t.scanStatusMessage() : null}
      </div>
    </div>
  );
}
