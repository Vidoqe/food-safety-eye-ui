import React from 'react';
import { Card } from '@/components/ui/card';

interface ScanInfoSectionProps {
  productName?: string;
  barcode?: string;
}

const ScanInfoSection: React.FC<ScanInfoSectionProps> = ({ productName, barcode }) => {
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour12: false }); // 24hr format
  };

  const getScannedSource = () => {
    if (productName) return productName;
    if (barcode) return barcode;
    return "Unnamed product — scanned label or barcode";
  };

  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">📅 Scan Info</h3>
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span className="font-medium">Scan Date:</span>
          <span>{getCurrentDate()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Scan Time:</span>
          <span>{getCurrentTime()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Scanned Source:</span>
          <span className="text-right max-w-[60%] break-words">{getScannedSource()}</span>
        </div>
      </div>
    </Card>
  );
};

export default ScanInfoSection;