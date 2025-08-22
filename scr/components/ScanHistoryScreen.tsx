import React from 'react';
import { ArrowLeft, Trash2, Calendar, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useScanHistory, ScanHistoryEntry } from '@/hooks/useScanHistory';
import { useUser } from '@/contexts/UserContext';

interface ScanHistoryScreenProps {
  onBack: () => void;
  onViewDetails: (scan: ScanHistoryEntry) => void;
}

const ScanHistoryScreen: React.FC<ScanHistoryScreenProps> = ({ onBack, onViewDetails }) => {
  const { scanHistory, deleteScan, clearHistory, maxHistoryCount } = useScanHistory();
  const { user, language } = useUser();

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'moderate': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'harmful': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      harmful: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      healthy: language === 'zh' ? '安全' : 'Safe',
      moderate: language === 'zh' ? '中等' : 'Moderate',
      harmful: language === 'zh' ? '有害' : 'Harmful'
    };

    return (
      <Badge className={variants[riskLevel as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[riskLevel as keyof typeof labels] || riskLevel}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanName = () => {
    if (!user) return 'Free';
    switch (user.subscriptionPlan) {
      case 'gold': return language === 'zh' ? '黃金' : 'Gold';
      case 'premium': return language === 'zh' ? '高級' : 'Premium';
      default: return language === 'zh' ? '免費' : 'Free';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {language === 'zh' ? '返回' : 'Back'}
          </Button>
          
          {scanHistory.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '清除全部' : 'Clear All'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === 'zh' ? '清除掃描記錄' : 'Clear Scan History'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === 'zh' 
                      ? '此操作將永久刪除所有掃描記錄，無法恢復。' 
                      : 'This will permanently delete all scan history and cannot be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{language === 'zh' ? '取消' : 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="bg-red-600 hover:bg-red-700">
                    {language === 'zh' ? '清除' : 'Clear'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {language === 'zh' ? '掃描記錄' : 'Scan History'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {language === 'zh' 
                ? `${getPlanName()} 方案 - 最多儲存 ${maxHistoryCount} 筆記錄` 
                : `${getPlanName()} Plan - Store up to ${maxHistoryCount} scans`}
            </p>
          </CardHeader>
        </Card>

        {scanHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'zh' ? '暫無掃描記錄' : 'No Scan History'}
              </h3>
              <p className="text-gray-600">
                {language === 'zh' 
                  ? '開始掃描產品後，記錄將顯示在這裡' 
                  : 'Start scanning products to see your history here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {scanHistory.map((scan) => (
              <Card key={scan.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => onViewDetails(scan)}>
                      <div className="flex items-center gap-2 mb-2">
                        {getRiskIcon(scan.riskLevel)}
                        <h3 className="font-medium text-gray-900 truncate">
                          {scan.productName}
                        </h3>
                        {getRiskBadge(scan.riskLevel)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(scan.scanDate)}
                      </p>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {language === 'zh' ? '刪除掃描記錄' : 'Delete Scan'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {language === 'zh' 
                              ? `確定要刪除「${scan.productName}」的掃描記錄嗎？` 
                              : `Are you sure you want to delete the scan for "${scan.productName}"?`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{language === 'zh' ? '取消' : 'Cancel'}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteScan(scan.id)} className="bg-red-600 hover:bg-red-700">
                            {language === 'zh' ? '刪除' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistoryScreen;