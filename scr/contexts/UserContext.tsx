import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ScanCreditsService, CreditSummary } from '@/services/scanCreditsService';

export interface User {
  id: string;
  email?: string;
  subscriptionPlan: 'free' | 'premium' | 'gold';
  subscriptionActive: boolean;
  lastCreditRefresh: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  creditSummary: CreditSummary | null;
  incrementScanCount: () => Promise<boolean>;
  canScan: boolean;
  upgradeUser: (plan: 'premium' | 'gold') => Promise<void>;
  language: 'en' | 'zh';
  setLanguage: (lang: 'en' | 'zh') => void;
  showUpgradeConfirmation: boolean;
  setShowUpgradeConfirmation: (show: boolean) => void;
  upgradedPlan: 'premium' | 'gold' | null;
  getScanStatusMessage: () => string;
  refreshCredits: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [showUpgradeConfirmation, setShowUpgradeConfirmation] = useState(false);
  const [upgradedPlan, setUpgradedPlan] = useState<'premium' | 'gold' | null>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'demo@example.com')
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: 'demo@example.com',
            subscription_plan: 'free',
            subscription_active: true,
            last_credit_refresh: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (createError) throw createError;
        
        const userData = {
          id: newUser.id,
          email: newUser.email,
          subscriptionPlan: newUser.subscription_plan,
          subscriptionActive: newUser.subscription_active,
          lastCreditRefresh: newUser.last_credit_refresh
        };
        setUser(userData);
        await refreshCredits(userData);
      } else if (data) {
        const userData = {
          id: data.id,
          email: data.email,
          subscriptionPlan: data.subscription_plan,
          subscriptionActive: data.subscription_active,
          lastCreditRefresh: data.last_credit_refresh
        };
        setUser(userData);
        await refreshCredits(userData);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCredits = async (userData?: User) => {
    const currentUser = userData || user;
    if (!currentUser) return;

    try {
      await ScanCreditsService.cleanupExpiredCredits(currentUser.id);
      
      const today = new Date().toISOString().split('T')[0];
      const lastRefresh = currentUser.lastCreditRefresh;
      
      if (lastRefresh !== today && currentUser.subscriptionActive) {
        const lastRefreshDate = new Date(lastRefresh);
        const todayDate = new Date(today);
        
        if (lastRefreshDate.getMonth() !== todayDate.getMonth() || 
            lastRefreshDate.getFullYear() !== todayDate.getFullYear()) {
          await ScanCreditsService.addMonthlyCredits(currentUser.id, currentUser.subscriptionPlan);
          
          await supabase
            .from('users')
            .update({ last_credit_refresh: today })
            .eq('id', currentUser.id);
          
          setUser(prev => prev ? { ...prev, lastCreditRefresh: today } : null);
        }
      }
      
      const summary = await ScanCreditsService.getCreditSummary(currentUser.id);
      setCreditSummary(summary);
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  };

  const incrementScanCount = async (): Promise<boolean> => {
    if (!user || !user.subscriptionActive) return false;
    
    const success = await ScanCreditsService.consumeCredit(user.id);
    if (success) {
      await refreshCredits();
    }
    return success;
  };

  const upgradeUser = async (plan: 'premium' | 'gold') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          subscription_plan: plan,
          subscription_active: true
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? {
        ...prev,
        subscriptionPlan: plan,
        subscriptionActive: true
      } : null);
      
      await refreshCredits();
      setUpgradedPlan(plan);
      setShowUpgradeConfirmation(true);
    } catch (error) {
      console.error('Error upgrading user:', error);
    }
  };

  const getScanStatusMessage = () => {
    if (!user) return '';
    
    if (!user.subscriptionActive) {
      return language === 'zh' 
        ? '您的訂閱已結束。請重新啟用以使用您儲存的掃描次數。'
        : 'Your subscription has ended. Please reactivate to use your saved credits.';
    }
    
    if (!creditSummary || creditSummary.totalCredits === 0) {
      return language === 'zh'
        ? '沒有剩餘掃描次數。升級以繼續使用。'
        : 'No scans left. Upgrade to continue.';
    }
    
    return '';
  };

  const canScan = user ? (
    user.subscriptionActive && creditSummary && creditSummary.totalCredits > 0
  ) : false;

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        creditSummary,
        incrementScanCount,
        canScan,
        upgradeUser,
        language,
        setLanguage,
        showUpgradeConfirmation,
        setShowUpgradeConfirmation,
        upgradedPlan,
        getScanStatusMessage,
        refreshCredits
      }}
    >
      {children}
    </UserContext.Provider>
  );
};