import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ScanInfoDisplayProps {
  scansLeft?: number;
  creditsExpiry?: string;
  overallRisk?: string;
  language: 'zh' | 'en';
}

const ScanInfoDisplay: React.FC<ScanInfoDisplayProps> = ({ 
  scansLeft, 
  creditsExpiry, 
  overallRisk,
  language 
}) => {
  const getOverallRiskBadge = (risk: string) => {
    switch (risk) {
      case 'healthy':
      case 'safe':
        return <Badge className="bg-green-500 text-white text-lg px-4 py-2">🟢</Badge>;
      case 'moderate':
        return <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">🟡</Badge>;
      case 'harmful':
        return <Badge className="bg-red-500 text-white text-lg px-4 py-2">🔴</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white text-lg px-4 py-2">🟡</Badge>;
    }
  };

  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">✅</div>
          <div className="text-lg font-semibold text-gray-800">
            {language === 'zh' ? 'Scan Info' : 'Scan Info'}
          </div>
        </div>
        
        {/* Overall Risk */}
        {overallRisk && (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {language === 'zh' ? 'Overall Risk:' : 'Overall Risk:'}
            </span>
            {getOverallRiskBadge(overallRisk)}
          </div>
        )}
        
        {/* Scans Left */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">
            {language === 'zh' ? 'Scans Left This Month:' : 'Scans Left This Month:'}
          </span>
          <span className="text-gray-600 font-semibold">
            {scansLeft !== undefined ? scansLeft : 'N/A'}
          </span>
        </div>
        
        {/* Credits Expiry */}
        {creditsExpiry && (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {language === 'zh' ? 'Credits Expiry:' : 'Credits Expiry:'}
            </span>
            <span className="text-gray-600 text-sm">
              {creditsExpiry}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScanInfoDisplay;