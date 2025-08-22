import { supabase } from '@/lib/supabase';

export interface ScanCredit {
  id: string;
  user_id: string;
  credits: number;
  granted_date: string;
  expires_at: string;
}

export interface CreditSummary {
  totalCredits: number;
  expiringCredits: number;
  daysUntilExpiry: number;
}

export class ScanCreditsService {
  static async getValidCredits(userId: string): Promise<ScanCredit[]> {
    const { data, error } = await supabase
      .from('scan_credits')
      .select('*')
      .eq('user_id', userId)
      .gt('credits', 0)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getCreditSummary(userId: string): Promise<CreditSummary> {
    const credits = await this.getValidCredits(userId);
    const totalCredits = credits.reduce((sum, credit) => sum + credit.credits, 0);
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const expiringCredits = credits
      .filter(credit => new Date(credit.expires_at) <= threeDaysFromNow)
      .reduce((sum, credit) => sum + credit.credits, 0);
    
    const nextExpiry = credits.length > 0 ? new Date(credits[0].expires_at) : null;
    const daysUntilExpiry = nextExpiry 
      ? Math.ceil((nextExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return { totalCredits, expiringCredits, daysUntilExpiry };
  }

  static async consumeCredit(userId: string): Promise<boolean> {
    const credits = await this.getValidCredits(userId);
    if (credits.length === 0) return false;

    const creditToUse = credits[0];
    const newCredits = creditToUse.credits - 1;

    if (newCredits <= 0) {
      await supabase.from('scan_credits').delete().eq('id', creditToUse.id);
    } else {
      await supabase
        .from('scan_credits')
        .update({ credits: newCredits })
        .eq('id', creditToUse.id);
    }

    return true;
  }

  static async addMonthlyCredits(userId: string, plan: string): Promise<void> {
    const creditsToAdd = plan === 'premium' ? 30 : plan === 'gold' ? 30 : 0;
    if (creditsToAdd === 0) return;

    const maxCap = plan === 'premium' ? 60 : plan === 'gold' ? 100 : 0;
    const currentSummary = await this.getCreditSummary(userId);
    
    const actualCreditsToAdd = Math.min(creditsToAdd, maxCap - currentSummary.totalCredits);
    if (actualCreditsToAdd <= 0) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase.from('scan_credits').insert({
      user_id: userId,
      credits: actualCreditsToAdd,
      expires_at: expiresAt.toISOString()
    });
  }

  static async cleanupExpiredCredits(userId: string): Promise<void> {
    await supabase
      .from('scan_credits')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString());
  }
}

// Export default instance for backward compatibility
export const scanCreditsService = new ScanCreditsService();