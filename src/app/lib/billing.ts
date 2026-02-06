'use client';

import { 
  CreditBalance, 
  CreditTransaction, 
  TransactionType,
  TopUpPack,
  TOP_UP_PACKS
} from './types';

// ============================================
// LocalStorage Keys
// ============================================

const STORAGE_KEYS = {
  balance: 'rulekit.credit-balance.v1',
  transactions: 'rulekit.credit-transactions.v1',
} as const;

// ============================================
// Utility Functions
// ============================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setStorageItem<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('rulekit:data-changed', { detail: { key } }));
}

function getStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('rulekit:data-changed', { detail: { key } }));
}

// ============================================
// Default Data
// ============================================

const DEFAULT_BALANCE: CreditBalance = {
  balance: 150,
  monthlyAllowance: 100,
  testAllowanceRemaining: 50,
  lastUpdated: new Date().toISOString(),
};

const now = Date.now();

const SAMPLE_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'txn-1',
    type: 'monthly_reset',
    amount: 100,
    description: 'Monthly credit allowance',
    createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-2',
    type: 'topup',
    amount: 200,
    description: 'Purchased Growth pack',
    createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-3',
    type: 'usage',
    amount: -45,
    description: 'Decision runs (45 executions)',
    decisionId: 'decision-1',
    createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-4',
    type: 'usage',
    amount: -28,
    description: 'Decision runs (28 executions)',
    decisionId: 'decision-2',
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-5',
    type: 'usage',
    amount: -12,
    description: 'Decision runs (12 executions)',
    decisionId: 'decision-1',
    createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// Initialize with sample data
// ============================================

function initializeData(): void {
  if (typeof window === 'undefined') return;
  
  const balance = localStorage.getItem(STORAGE_KEYS.balance);
  if (!balance) {
    setStorageItem(STORAGE_KEYS.balance, DEFAULT_BALANCE);
    setStorage(STORAGE_KEYS.transactions, SAMPLE_TRANSACTIONS);
  }
}

if (typeof window !== 'undefined') {
  initializeData();
}

// ============================================
// Billing Repository
// ============================================

export const billingRepo = {
  async getBalance(): Promise<CreditBalance> {
    initializeData();
    return getStorageItem<CreditBalance>(STORAGE_KEYS.balance, DEFAULT_BALANCE);
  },

  async updateBalance(updates: Partial<CreditBalance>): Promise<CreditBalance> {
    initializeData();
    const current = await this.getBalance();
    const updated: CreditBalance = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.balance, updated);
    return updated;
  },

  async deductCredits(amount: number, description: string, decisionId?: string, runId?: string): Promise<CreditBalance> {
    initializeData();
    const balance = await this.getBalance();
    
    if (balance.balance < amount) {
      throw new Error('Insufficient credits');
    }
    
    // Deduct from balance
    const newBalance = balance.balance - amount;
    await this.updateBalance({ balance: newBalance });
    
    // Log transaction
    await this.logTransaction({
      type: 'usage',
      amount: -amount,
      description,
      decisionId,
      runId,
    });
    
    return this.getBalance();
  },

  async addCredits(amount: number, description: string, type: TransactionType = 'topup'): Promise<CreditBalance> {
    initializeData();
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
    if (!pack) {
      throw new Error(`Top-up pack ${packId} not found`);
    }
    
    return this.addCredits(pack.credits, `Purchased ${pack.name} pack ($${pack.price})`);
  },

  async getTransactions(options?: { 
    limit?: number; 
    type?: TransactionType;
    decisionId?: string;
  }): Promise<CreditTransaction[]> {
    initializeData();
    let transactions = getStorage<CreditTransaction>(STORAGE_KEYS.transactions);
    
    if (options?.type) {
      transactions = transactions.filter(t => t.type === options.type);
    }
    if (options?.decisionId) {
      transactions = transactions.filter(t => t.decisionId === options.decisionId);
    }
    
    transactions = transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const limit = options?.limit || 50;
    return transactions.slice(0, limit);
  },

  async logTransaction(input: Omit<CreditTransaction, 'id' | 'createdAt'>): Promise<CreditTransaction> {
    initializeData();
    const transactions = getStorage<CreditTransaction>(STORAGE_KEYS.transactions);
    
    const newTransaction: CreditTransaction = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    transactions.unshift(newTransaction);
    
    // Keep only last 500 transactions
    if (transactions.length > 500) {
      transactions.pop();
    }
    
    setStorage(STORAGE_KEYS.transactions, transactions);
    
    return newTransaction;
  },

  async getUsageStats(days: number = 7): Promise<{
    totalUsed: number;
    byDecision: { decisionId: string; amount: number }[];
    dailyUsage: { date: string; amount: number }[];
  }> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const transactions = await this.getTransactions({ type: 'usage' });
    
    const recentTransactions = transactions.filter(t => t.createdAt >= cutoff);
    
    // Total used
    const totalUsed = recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // By decision
    const byDecisionMap = new Map<string, number>();
    recentTransactions.forEach(t => {
      if (t.decisionId) {
        const current = byDecisionMap.get(t.decisionId) || 0;
        byDecisionMap.set(t.decisionId, current + Math.abs(t.amount));
      }
    });
    const byDecision = Array.from(byDecisionMap.entries())
      .map(([decisionId, amount]) => ({ decisionId, amount }))
      .sort((a, b) => b.amount - a.amount);
    
    // Daily usage
    const dailyMap = new Map<string, number>();
    recentTransactions.forEach(t => {
      const date = t.createdAt.split('T')[0];
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + Math.abs(t.amount));
    });
    const dailyUsage = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return { totalUsed, byDecision, dailyUsage };
  },

  async estimateCredits(complexity: 'simple' | 'medium' | 'complex' = 'simple'): Promise<number> {
    // Simple estimation based on complexity
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
        customEvent.detail?.key === STORAGE_KEYS.balance ||
        customEvent.detail?.key === STORAGE_KEYS.transactions
      ) {
        callback();
      }
    };
    window.addEventListener('rulekit:data-changed', handler);
    window.addEventListener('storage', callback);
    return () => {
      window.removeEventListener('rulekit:data-changed', handler);
      window.removeEventListener('storage', callback);
    };
  },
};
