'use client';

import { 
  CreditBalance, 
  CreditTransaction, 
  TransactionType,
  TopUpPack,
  TOP_UP_PACKS
} from './types';
import { getSupabaseBrowserClient } from './supabase-browser';

// ============================================
// Helpers
// ============================================

function sb() {
  return getSupabaseBrowserClient();
}

const CHANGE_EVENT = 'rulekit:data-changed';
function notify(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toBalance(row: any): CreditBalance {
  return {
    balance: row.balance,
    monthlyAllowance: row.monthly_allowance,
    testAllowanceRemaining: row.test_allowance_remaining,
    lastUpdated: row.last_updated,
  };
}

function toTransaction(row: any): CreditTransaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    description: row.description ?? '',
    runId: row.run_id,
    rulebookId: row.rulebook_id,
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DEFAULT_BALANCE: CreditBalance = {
  balance: 150,
  monthlyAllowance: 100,
  testAllowanceRemaining: 50,
  lastUpdated: new Date().toISOString(),
};

// ============================================
// Billing Repository
// ============================================

export const billingRepo = {
  async getBalance(): Promise<CreditBalance> {
    const { data, error } = await sb()
      .from('credit_balances')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return DEFAULT_BALANCE;
    return toBalance(data);
  },

  async updateBalance(updates: Partial<CreditBalance>): Promise<CreditBalance> {
    const dbUpdates: Record<string, unknown> = { last_updated: new Date().toISOString() };
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.monthlyAllowance !== undefined) dbUpdates.monthly_allowance = updates.monthlyAllowance;
    if (updates.testAllowanceRemaining !== undefined) dbUpdates.test_allowance_remaining = updates.testAllowanceRemaining;

    const { data: { user } } = await sb().auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await sb()
      .from('credit_balances')
      .upsert({ user_id: user.id, ...dbUpdates })
      .select()
      .single();

    if (error) throw error;
    notify('balance');
    return toBalance(data);
  },

  async deductCredits(amount: number, description: string, rulebookId?: string, runId?: string): Promise<CreditBalance> {
    const balance = await this.getBalance();

    if (balance.balance < amount) {
      throw new Error('Insufficient credits');
    }

    const newBalance = balance.balance - amount;
    await this.updateBalance({ balance: newBalance });

    await this.logTransaction({
      type: 'usage',
      amount: -amount,
      description,
      rulebookId,
      runId,
    });

    return this.getBalance();
  },

  async addCredits(amount: number, description: string, type: TransactionType = 'topup'): Promise<CreditBalance> {
    const balance = await this.getBalance();

    const newBalance = balance.balance + amount;
    await this.updateBalance({ balance: newBalance });

    await this.logTransaction({
      type,
      amount,
      description,
    });

    return this.getBalance();
  },

  async purchaseTopUp(packId: string): Promise<CreditBalance> {
    const pack = TOP_UP_PACKS.find(p => p.id === packId);
    if (!pack) throw new Error(`Top-up pack ${packId} not found`);

    return this.addCredits(pack.credits, `Purchased ${pack.name} pack ($${pack.price})`);
  },

  async getTransactions(options?: {
    limit?: number;
    type?: TransactionType;
    rulebookId?: string;
  }): Promise<CreditTransaction[]> {
    let query = sb()
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.type) query = query.eq('type', options.type);
    if (options?.rulebookId) query = query.eq('rulebook_id', options.rulebookId);

    const limit = options?.limit || 50;
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toTransaction);
  },

  async logTransaction(input: Omit<CreditTransaction, 'id' | 'createdAt'>): Promise<CreditTransaction> {
    const { data, error } = await sb()
      .from('credit_transactions')
      .insert({
        type: input.type,
        amount: input.amount,
        description: input.description,
        run_id: input.runId,
        rulebook_id: input.rulebookId,
      })
      .select()
      .single();

    if (error) throw error;
    notify('transactions');
    return toTransaction(data);
  },

  async getUsageStats(days: number = 7): Promise<{
    totalUsed: number;
    byRulebook: { rulebookId: string; amount: number }[];
    dailyUsage: { date: string; amount: number }[];
  }> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const transactions = await this.getTransactions({ type: 'usage' });

    const recentTransactions = transactions.filter(t => t.createdAt >= cutoff);

    const totalUsed = recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const byRulebookMap = new Map<string, number>();
    recentTransactions.forEach(t => {
      if (t.rulebookId) {
        const current = byRulebookMap.get(t.rulebookId) || 0;
        byRulebookMap.set(t.rulebookId, current + Math.abs(t.amount));
      }
    });
    const byRulebook = Array.from(byRulebookMap.entries())
      .map(([rulebookId, amount]) => ({ rulebookId, amount }))
      .sort((a, b) => b.amount - a.amount);

    const dailyMap = new Map<string, number>();
    recentTransactions.forEach(t => {
      const date = t.createdAt.split('T')[0];
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + Math.abs(t.amount));
    });
    const dailyUsage = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totalUsed, byRulebook, dailyUsage };
  },

  async estimateCredits(complexity: 'simple' | 'medium' | 'complex' = 'simple'): Promise<number> {
    switch (complexity) {
      case 'simple': return 1;
      case 'medium': return 2;
      case 'complex': return 5;
      default: return 1;
    }
  },

  async checkSufficientCredits(required: number): Promise<boolean> {
    const balance = await this.getBalance();
    return balance.balance >= required;
  },

  async isOutOfCredits(): Promise<boolean> {
    const balance = await this.getBalance();
    return balance.balance <= 0;
  },

  getTopUpPacks(): TopUpPack[] {
    return TOP_UP_PACKS;
  },

  subscribe(callback: () => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail?.key === 'balance' ||
        customEvent.detail?.key === 'transactions'
      ) {
        callback();
      }
    };
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  },
};
