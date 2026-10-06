import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { useAppContext } from '@/contexts/AppContext';

export default function AuthPanel() {
  const { language } = useAppContext();
  const zh = language === 'zh';
  const { session, user, loading, accountError, creditSummary, signOut, refreshCredits } = useUser();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const report = (e: unknown) => setError(e instanceof Error ? e.message : String((e as {message?: string})?.message || e));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage(''); setError('');
    try {
      if (mode === 'signup') {
        const { data, error: failure } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: window.location.origin + '/' },
        });
        if (failure) throw failure;
        setPassword('');
        if (!data.session) setMessage(zh ? '請查看電子郵件並點擊確認連結，然後登入。' : 'Check your email for a confirmation link, then sign in.');
      } else {
        const { error: failure } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (failure) throw failure;
        setPassword('');
      }
    } catch (e) { report(e); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    setBusy(true); setError(''); setMessage('');
    try { await signOut(); setPassword(''); } catch (e) { report(e); }
    finally { setBusy(false); }
  };
  return <Card className="p-6 bg-white/90 shadow-lg space-y-4">
    <h2 className="text-lg font-semibold text-green-800">{zh ? '我的帳號' : 'My Account'}</h2>
    {loading ? <p role="status">{zh ? '正在載入帳號…' : 'Loading account…'}</p> : session && !session.user.is_anonymous ? <>
      <p className="text-sm break-all">{session.user.email}</p>
      {accountError ? <div role="alert" className="text-sm text-red-700">
        <p>{zh ? '無法載入帳號資料。' : 'Could not load your account.'} {accountError}</p>
        <Button variant="outline" onClick={() => void refreshCredits()}>{zh ? '重試' : 'Retry'}</Button>
      </div> : <>
        <p>{zh ? '方案' : 'Plan'}: {user?.subscriptionPlan === 'gold' ? 'Gold' : user?.subscriptionPlan === 'premium' ? 'Premium' : zh ? '免費版' : 'Free'}</p>
        <p>{zh ? '剩餘掃描次數' : 'Scans remaining'}: {creditSummary?.totalCredits ?? '—'}</p>
        {Boolean(creditSummary?.totalCredits) && <p className="text-xs text-gray-600">{zh ? `下一批點數將於 ${creditSummary?.daysUntilExpiry} 天後到期。` : `Next credits expire in ${creditSummary?.daysUntilExpiry} days.`}</p>}
      </>}
      <Button variant="outline" disabled={busy} onClick={logout}>{zh ? '登出' : 'Sign out'}</Button>
    </> : <>
      <div className="flex gap-2">
        {(['signin', 'signup'] as const).map(value => <Button key={value} type="button" disabled={busy} variant={mode === value ? 'default' : 'outline'} onClick={() => { setMode(value); setMessage(''); setError(''); }}>
          {value === 'signin' ? zh ? '登入' : 'Sign in' : zh ? '註冊' : 'Sign up'}
        </Button>)}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm">{zh ? '電子郵件' : 'Email'}
          <input type="email" required autoComplete="email" value={email} disabled={busy} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border rounded p-2" />
        </label>
        <label className="block text-sm">{zh ? '密碼' : 'Password'}
          <input type="password" required minLength={mode === 'signup' ? 8 : undefined} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} disabled={busy} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border rounded p-2" />
        </label>
        {mode === 'signup' && <p className="text-xs text-gray-600">{zh ? '密碼至少 8 個字元。新帳號有 5 次免費掃描，點數有效期為 30 天。' : 'Use at least 8 characters. New accounts receive 5 free scans, valid for 30 days.'}</p>}
        <Button type="submit" disabled={busy} className="w-full bg-green-600 hover:bg-green-700">{busy ? zh ? '處理中…' : 'Please wait…' : mode === 'signup' ? zh ? '建立帳號' : 'Create account' : zh ? '登入' : 'Sign in'}</Button>
      </form>
    </>}
    {message && <p role="status" className="text-sm text-green-800">{message}</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </Card>;
}
