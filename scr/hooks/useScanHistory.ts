import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export interface ScanHistoryEntry {
  id: string;
  productName: string;
  scanDate: Date;
  riskLevel: 'healthy' | 'moderate' | 'harmful';
  verdict: 'healthy' | 'moderate' | 'harmful';
  ingredients?: any[];
  tips?: string[];
  junkFoodScore?: number;
}

const STORAGE_KEY = 'scan_history';

export const useScanHistory = () => {
  const { user, session } = useUser();
  const storageKey = session && !session.user.is_anonymous ? `${STORAGE_KEY}:${session.user.id}` : null;
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);

  const getMaxHistoryCount = () => {
    if (!user) return 5;
    switch (user.subscriptionPlan) {
      case 'gold': return 50;
      case 'premium': return 20;
      default: return 5;
    }
  };

  useEffect(() => {
    loadHistory();
  }, [storageKey]);

  const loadHistory = () => {
    try {
      setScanHistory([]);
      if (!storageKey) return;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          scanDate: new Date(entry.scanDate)
        }));
        setScanHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const saveHistory = (history: ScanHistoryEntry[]) => {
    try {
      if (!storageKey) return;
      localStorage.setItem(storageKey, JSON.stringify(history));
      setScanHistory(history);
    } catch (error) {
      console.error('Error saving scan history:', error);
    }
  };

  const addScan = (scan: Omit<ScanHistoryEntry, 'id' | 'scanDate'>) => {
    const newScan: ScanHistoryEntry = {
      ...scan,
      id: Date.now().toString(),
      scanDate: new Date()
    };

    const maxCount = getMaxHistoryCount();
    let newHistory = [newScan, ...scanHistory];
    
    if (newHistory.length > maxCount) {
      newHistory = newHistory.slice(0, maxCount);
    }

    saveHistory(newHistory);
  };

  const deleteScan = (id: string) => {
    const newHistory = scanHistory.filter(scan => scan.id !== id);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return {
    scanHistory,
    addScan,
    deleteScan,
    clearHistory,
    maxHistoryCount: getMaxHistoryCount()
  };
};
