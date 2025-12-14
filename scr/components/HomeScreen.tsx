import React from "react";
import { Camera, Scan } from "lucide-react";

import AppLogo from "./AppLogo";
import TrustIcons from "./TrustIcons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/utils/translations";

type Props = {
  onScanLabel?: () => void;
  onScanBarcode?: () => void;
  onScan?: (payload: any) => void;
};

export default function HomeScreen({
  onScanLabel,
  onScanBarcode,
  onScan,
}: Props) {
  const { language } = useAppContext();
  const t = useTranslation(language);

  const handleLabelScan = () => {
    if (onScanLabel) return onScanLabel();
    if (onScan) return onScan({ type: "label" });
  };

  const handleBarcodeScan = () => {
    if (onScanBarcode) return onScanBarcode();
    if (onScan) return onScan({ type: "barcode" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="mx-auto max-w-md">

{/* Logo / Header */}
<div className="pt-6 flex flex-col items-center text-center">
  {/* Shield icon */}
  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
    <Shield className="h-8 w-8 text-green-700" />
  </div>

  {/* App name */}
  <h1 className="text-2xl font-bold text-green-800">
    Food Safety Eye
  </h1>

  {/* Chinese name */}
  <div className="mt-1 text-lg font-semibold text-green-700">
    食安眼
  </div>

  {/* Small icons */}
  <div className="mt-2 flex items-center gap-2 text-green-600">
    <Shield className="h-4 w-4" />
    <Heart className="h-4 w-4" />
  </div>

  {/* Tagline */}
  <p className="mt-3 max-w-xs text-sm text-gray-600">
    守護孩子健康，從食品安全開始
  </p>
</div>
        {/* Tagline */}
        <p className="mt-3 text-center text-sm text-gray-600">
          {t.tagline}
        </p>

        {/* Trust icons */}
        <div className="mt-6">
          <TrustIcons />
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <Button
            onClick={handleLabelScan}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
          >
            <Camera className="mr-2 h-5 w-5" />
            {t.scanLabel}
          </Button>

          <Button
            onClick={handleBarcodeScan}
            variant="secondary"
            className="w-full h-14 text-lg"
          >
            <Scan className="mr-2 h-5 w-5" />
            {t.scanBarcode}
          </Button>
        </div>
      </div>
    </div>
  );
}
