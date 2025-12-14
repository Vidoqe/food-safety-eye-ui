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

        {/* Logo */}
        <div className="pt-6 text-center">
          <AppLogo size="large" showText />
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
