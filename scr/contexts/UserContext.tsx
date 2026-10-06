import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
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
  session: Session | null;
  loading: boolean;
  accountError: string | null;
  creditSummary: CreditSummary | null;
  refreshCredits: () => Promise<void>;
  signOut: () => Promise<void>;
  incrementScanCount: () => Promise<boolean>;
  canScan: boolean;
  upgradeUser: (plan: 'premium' | 'gold') => Promise<void>;
  addBonusScans: (count: number) => Promise<void>;
  plan: 'free' | 'premium' | 'gold';
  language: 'en' | 'zh';
  setLanguage: (lang: 'en' | 'zh') => void;
  showUpgradeConfirmation: boolean;
  setShowUpgradeConfirmation: (show: boolean) => void;
  upgradedPlan: 'premium' | 'gold' | null;
  getScanStatusMessage: () => string;
}
const UserContext = createContext<UserContextType | undefined>(undefined);
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [showUpgradeConfirmation, setShowUpgradeConfirmation] = useState(false);
  const version = useRef(0);

  useEffect(() => {
    // Keep the Auth callback synchronous; fetch profile data in the effect below.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      version.current += 1;
      setUser(null);
      setCreditSummary(null);
      setAccountError(null);
      setLoading(Boolean(next && !next.user.is_anonymous));
      setSession(next);
    });
    return () => { version.current += 1; subscription.unsubscribe(); };
  }, []);

  const refreshCredits = useCallback(async () => {
    const currentVersion = version.current;
    const authUser = session?.user;
    if (!authUser || authUser.is_anonymous) return;
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (error) throw error;
      const summary = await ScanCreditsService.getCreditSummary(authUser.id);
      if (version.current !== currentVersion) return;
      setUser({
        id: data.id, email: authUser.email,
        subscriptionPlan: data.subscription_plan || 'free',
        subscriptionActive: data.subscription_active === true,
        lastCreditRefresh: data.last_credit_refresh,
      });
      setCreditSummary(summary);
      setAccountError(null);
    } catch (error) {
      if (version.current !== currentVersion) return;
      setUser(null);
      setCreditSummary(null);
      setAccountError(error instanceof Error ? error.message : String((error as { message?: string })?.message || 'Could not load account'));
    } finally {
      if (version.current === currentVersion) setLoading(false);
    }
  }, [session]);

  useEffect(() => { void refreshCredits(); }, [refreshCredits]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    version.current += 1;
    setSession(null); setUser(null); setCreditSummary(null); setAccountError(null); setLoading(false);
  };
  const unavailable = async () => {
    throw new Error(language === 'zh' ? '線上付款尚未開放。' : 'Online payments are not available yet.');
  };
  const getScanStatusMessage = () => {
    if (!session || session.user.is_anonymous) return language === 'zh' ? '請先登入。' : 'Please sign in first.';
    if (accountError) return language === 'zh' ? '無法載入帳號，請重試。' : 'Could not load your account. Please retry.';
    if (!user?.subscriptionActive) return language === 'zh' ? '訂閱已停用。' : 'Your subscription is inactive.';
    if (!creditSummary?.totalCredits) return language === 'zh' ? '沒有剩餘掃描次數。' : 'No scans remaining.';
    return '';
  };
  return <UserContext.Provider value={{
    user, session, loading, accountError, creditSummary, refreshCredits, signOut,
    // Credit consumption must be performed by the analysis backend, never a browser write.
    incrementScanCount: async () => { throw new Error('Server credit integration is not connected yet.'); },
    canScan: Boolean(user?.subscriptionActive && creditSummary && creditSummary.totalCredits > 0),
    upgradeUser: unavailable, addBonusScans: unavailable,
    plan: user?.subscriptionPlan || 'free', language, setLanguage,
    showUpgradeConfirmation, setShowUpgradeConfirmation, upgradedPlan: null, getScanStatusMessage,
  }}>{children}</UserContext.Provider>;
};
