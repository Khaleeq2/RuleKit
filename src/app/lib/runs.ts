'use client';

import { 
  Run, 
  RunOutput,
  RunTrigger,
  RunStatus,
  Environment,
  ExecutionTraceStep,
  RuleResult,
  ActivityEvent,
  ActivityEventType
} from './types';

// ============================================
// LocalStorage Keys
// ============================================

const STORAGE_KEYS = {
  runs: 'rulekit.runs.v1',
  activity: 'rulekit.activity.v1',
} as const;

// ============================================
// Utility Functions
// ============================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
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
// Sample Data
// ============================================

const now = Date.now();

const SAMPLE_RUNS: Run[] = [
  // Loan Eligibility Runs
  {
    id: 'run-1',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    versionId: 'version-1',
    versionNumber: 3,
    environment: 'live',
    input: { credit_score: 720, annual_income: 85000, employment_status: 'employed', loan_amount: 30000 },
    output: { decision: 'pass', reason: 'Application meets all eligibility criteria' },
    firedRuleId: 'rule-4',
    firedRuleName: 'Default Pass',
    executionTrace: [
      { ruleId: 'rule-1', ruleName: 'Minimum Credit Score', evaluated: true, matched: false },
      { ruleId: 'rule-2', ruleName: 'Income to Loan Ratio', evaluated: true, matched: false },
      { ruleId: 'rule-3', ruleName: 'Employment Check', evaluated: true, matched: false },
      { ruleId: 'rule-4', ruleName: 'Default Pass', evaluated: true, matched: true, reason: 'Application meets all eligibility criteria' },
    ],
    trigger: 'api',
    creditsEstimate: 1,
    creditsActual: 1,
    latencyMs: 42,
    status: 'success',
    createdAt: new Date(now - 15 * 60 * 1000).toISOString(), // 15 min ago
  },
  {
    id: 'run-2',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    versionId: 'version-1',
    versionNumber: 3,
    environment: 'live',
    input: { credit_score: 580, annual_income: 45000, employment_status: 'employed', loan_amount: 25000 },
    output: { decision: 'fail', reason: 'Credit score below minimum threshold of 650' },
    firedRuleId: 'rule-1',
    firedRuleName: 'Minimum Credit Score',
    executionTrace: [
      { ruleId: 'rule-1', ruleName: 'Minimum Credit Score', evaluated: true, matched: true, reason: 'Credit score below minimum threshold of 650' },
    ],
    trigger: 'api',
    creditsEstimate: 1,
    creditsActual: 1,
    latencyMs: 28,
    status: 'success',
    createdAt: new Date(now - 45 * 60 * 1000).toISOString(), // 45 min ago
  },
  {
    id: 'run-3',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    versionId: 'version-1',
    versionNumber: 3,
    environment: 'live',
    input: { credit_score: 690, annual_income: 55000, employment_status: 'unemployed', loan_amount: 15000 },
    output: { decision: 'fail', reason: 'Applicant must be employed or self-employed' },
    firedRuleId: 'rule-3',
    firedRuleName: 'Employment Check',
    executionTrace: [
      { ruleId: 'rule-1', ruleName: 'Minimum Credit Score', evaluated: true, matched: false },
      { ruleId: 'rule-2', ruleName: 'Income to Loan Ratio', evaluated: true, matched: false },
      { ruleId: 'rule-3', ruleName: 'Employment Check', evaluated: true, matched: true, reason: 'Applicant must be employed or self-employed' },
    ],
    trigger: 'api',
    creditsEstimate: 1,
    creditsActual: 1,
    latencyMs: 35,
    status: 'success',
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  // Fraud Detection Runs
  {
    id: 'run-4',
    decisionId: 'decision-2',
    decisionName: 'Fraud Detection',
    versionId: 'version-2',
    versionNumber: 2,
    environment: 'live',
    input: { amount: 150, merchant_category: 'groceries', country: 'US', is_card_present: true },
    output: { decision: 'pass', reason: 'Transaction approved - no fraud indicators detected' },
    firedRuleId: 'rule-7',
    firedRuleName: 'Default Approve',
    executionTrace: [
      { ruleId: 'rule-5', ruleName: 'High Amount Alert', evaluated: true, matched: false },
      { ruleId: 'rule-6', ruleName: 'International Card-Not-Present', evaluated: true, matched: false },
      { ruleId: 'rule-7', ruleName: 'Default Approve', evaluated: true, matched: true, reason: 'Transaction approved - no fraud indicators detected' },
    ],
    trigger: 'api',
    creditsEstimate: 1,
    creditsActual: 1,
    latencyMs: 22,
    status: 'success',
    createdAt: new Date(now - 5 * 60 * 1000).toISOString(), // 5 min ago
  },
  {
    id: 'run-5',
    decisionId: 'decision-2',
    decisionName: 'Fraud Detection',
    versionId: 'version-2',
    versionNumber: 2,
    environment: 'live',
    input: { amount: 8500, merchant_category: 'electronics', country: 'US', is_card_present: true },
    output: { decision: 'fail', reason: 'Transaction amount exceeds $5000 threshold' },
    firedRuleId: 'rule-5',
    firedRuleName: 'High Amount Alert',
    executionTrace: [
      { ruleId: 'rule-5', ruleName: 'High Amount Alert', evaluated: true, matched: true, reason: 'Transaction amount exceeds $5000 threshold' },
    ],
    trigger: 'api',
    creditsEstimate: 1,
    creditsActual: 1,
    latencyMs: 18,
    status: 'success',
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(), // 30 min ago
  },
  {
    id: 'run-6',
    decisionId: 'decision-2',
    decisionName: 'Fraud Detection',
    versionId: 'version-2',
    versionNumber: 2,
    environment: 'live',
    input: { amount: 450, merchant_category: 'travel', country: 'MX', is_card_present: false },
    output: { decision: 'fail', reason: 'International card-not-present transaction requires review' },
    firedRuleId: 'rule-6',
    firedRuleName: 'International Card-Not-Present',
    executionTrace: [
      { ruleId: 'rule-5', ruleName: 'High Amount Alert', evaluated: true, matched: false },
      { ruleId: 'rule-6', ruleName: 'International Card-Not-Present', evaluated: true, matched: true, reason: 'International card-not-present transaction requires review' },
    ],
    trigger: 'api',
    creditsEstimate: 1,
    creditsActual: 1,
    latencyMs: 25,
    status: 'success',
    createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  // Test runs
  {
    id: 'run-7',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    versionId: 'version-1',
    versionNumber: 3,
    environment: 'draft',
    input: { credit_score: 780, annual_income: 95000, employment_status: 'self_employed', loan_amount: 40000 },
    output: { decision: 'pass', reason: 'Application meets all eligibility criteria' },
    firedRuleId: 'rule-4',
    firedRuleName: 'Default Pass',
    executionTrace: [],
    trigger: 'test',
    creditsEstimate: 0,
    creditsActual: 0,
    latencyMs: 38,
    status: 'success',
    createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
];

const SAMPLE_ACTIVITY: ActivityEvent[] = [
  {
    id: 'activity-1',
    type: 'deployment.promoted',
    actorId: 'user-1',
    actorName: 'You',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    versionId: 'version-1',
    description: 'Made v3 live',
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity-2',
    type: 'version.created',
    actorId: 'user-1',
    actorName: 'You',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    versionId: 'version-1',
    description: 'Created version 3',
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity-3',
    type: 'decision.updated',
    actorId: 'user-1',
    actorName: 'You',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    description: 'Updated rules',
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity-4',
    type: 'deployment.promoted',
    actorId: 'user-1',
    actorName: 'You',
    decisionId: 'decision-2',
    decisionName: 'Fraud Detection',
    versionId: 'version-2',
    description: 'Made v2 live',
    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity-5',
    type: 'test.run',
    actorId: 'user-1',
    actorName: 'You',
    decisionId: 'decision-1',
    decisionName: 'Loan Eligibility',
    description: 'Ran test suite (3 passed, 0 failed)',
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity-6',
    type: 'decision.created',
    actorId: 'user-1',
    actorName: 'You',
    decisionId: 'decision-3',
    decisionName: 'Support Ticket Routing',
    description: 'Created new decision',
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// Initialize with sample data
// ============================================

function initializeData(): void {
  if (typeof window === 'undefined') return;
  
  const runs = getStorage<Run>(STORAGE_KEYS.runs);
  if (runs.length === 0) {
    setStorage(STORAGE_KEYS.runs, SAMPLE_RUNS);
    setStorage(STORAGE_KEYS.activity, SAMPLE_ACTIVITY);
  }
}

if (typeof window !== 'undefined') {
  initializeData();
}

// ============================================
// Runs Repository
// ============================================

export const runsRepo = {
  async list(options?: {
    decisionId?: string;
    environment?: Environment;
    status?: RunStatus;
    trigger?: RunTrigger;
    limit?: number;
    offset?: number;
  }): Promise<Run[]> {
    initializeData();
    let runs = getStorage<Run>(STORAGE_KEYS.runs);
    
    // Apply filters
    if (options?.decisionId) {
      runs = runs.filter(r => r.decisionId === options.decisionId);
    }
    if (options?.environment) {
      runs = runs.filter(r => r.environment === options.environment);
    }
    if (options?.status) {
      runs = runs.filter(r => r.status === options.status);
    }
    if (options?.trigger) {
      runs = runs.filter(r => r.trigger === options.trigger);
    }
    
    // Sort by createdAt desc
    runs = runs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 100;
    runs = runs.slice(offset, offset + limit);
    
    return runs;
  },

  async getById(id: string): Promise<Run | null> {
    initializeData();
    const runs = getStorage<Run>(STORAGE_KEYS.runs);
    return runs.find(r => r.id === id) || null;
  },

  async getFailures(options?: { decisionId?: string; hours?: number }): Promise<Run[]> {
    const hours = options?.hours || 24;
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    let runs = await this.list({ decisionId: options?.decisionId });
    
    return runs.filter(r => 
      r.output.decision === 'fail' && 
      r.createdAt >= cutoff
    );
  },

  async getStats(decisionId?: string): Promise<{
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgLatency: number;
    totalCredits: number;
  }> {
    const runs = await this.list({ decisionId });
    
    const passed = runs.filter(r => r.output.decision === 'pass').length;
    const failed = runs.filter(r => r.output.decision === 'fail').length;
    const total = runs.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const avgLatency = total > 0 
      ? Math.round(runs.reduce((sum, r) => sum + r.latencyMs, 0) / total)
      : 0;
    const totalCredits = runs.reduce((sum, r) => sum + r.creditsActual, 0);
    
    return { total, passed, failed, passRate, avgLatency, totalCredits };
  },

  async create(input: Omit<Run, 'id' | 'createdAt'>): Promise<Run> {
    initializeData();
    const runs = getStorage<Run>(STORAGE_KEYS.runs);
    
    const newRun: Run = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    runs.unshift(newRun); // Add to beginning
    
    // Keep only last 1000 runs
    if (runs.length > 1000) {
      runs.pop();
    }
    
    setStorage(STORAGE_KEYS.runs, runs);
    
    return newRun;
  },

  async executeDecision(
    decisionId: string,
    decisionName: string,
    versionId: string,
    versionNumber: number,
    environment: Environment,
    input: Record<string, unknown>,
    trigger: RunTrigger
  ): Promise<Run> {
    // Simulate execution
    const startTime = Date.now();
    
    // Mock decision logic - in production this would evaluate rules
    const decision: RuleResult = Math.random() > 0.3 ? 'pass' : 'fail';
    const reason = decision === 'pass' 
      ? 'Decision passed all rules'
      : 'Decision failed validation';
    
    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 30) + 15;
    const creditsEstimate = 1;
    const creditsActual = 1;
    
    const run = await this.create({
      decisionId,
      decisionName,
      versionId,
      versionNumber,
      environment,
      input,
      output: { decision, reason },
      firedRuleId: null,
      firedRuleName: null,
      executionTrace: [],
      trigger,
      creditsEstimate,
      creditsActual,
      latencyMs,
      status: 'success',
    });
    
    // Log activity
    await activityRepo.log({
      type: 'run.executed',
      actorId: 'user-1',
      actorName: 'You',
      decisionId,
      decisionName,
      description: `Executed decision (${decision})`,
      metadata: { runId: run.id, environment },
    });
    
    return run;
  },

  subscribe(callback: () => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.runs) {
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

// ============================================
// Activity Repository
// ============================================

export const activityRepo = {
  async list(options?: { 
    limit?: number; 
    decisionId?: string;
    type?: ActivityEventType;
  }): Promise<ActivityEvent[]> {
    initializeData();
    let events = getStorage<ActivityEvent>(STORAGE_KEYS.activity);
    
    if (options?.decisionId) {
      events = events.filter(e => e.decisionId === options.decisionId);
    }
    if (options?.type) {
      events = events.filter(e => e.type === options.type);
    }
    
    events = events.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const limit = options?.limit || 50;
    return events.slice(0, limit);
  },

  async log(input: Omit<ActivityEvent, 'id' | 'createdAt'>): Promise<ActivityEvent> {
    initializeData();
    const events = getStorage<ActivityEvent>(STORAGE_KEYS.activity);
    
    const newEvent: ActivityEvent = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    events.unshift(newEvent);
    
    // Keep only last 500 events
    if (events.length > 500) {
      events.pop();
    }
    
    setStorage(STORAGE_KEYS.activity, events);
    
    return newEvent;
  },

  subscribe(callback: () => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.activity) {
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
