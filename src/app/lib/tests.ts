'use client';

import { 
  Test, 
  TestResult, 
  ExecutionTraceStep,
  RuleResult
} from './types';

// ============================================
// LocalStorage Keys
// ============================================

const STORAGE_KEYS = {
  tests: 'rulekit.tests.v1',
  testResults: 'rulekit.test-results.v1',
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

const SAMPLE_TESTS: Test[] = [
  // Loan Eligibility Tests
  {
    id: 'test-1',
    decisionId: 'decision-1',
    name: 'High credit score approved',
    description: 'Applicant with excellent credit should be approved',
    inputJson: {
      credit_score: 780,
      annual_income: 85000,
      employment_status: 'employed',
      loan_amount: 30000,
    },
    expectedDecision: 'pass',
    expectedReason: 'Application meets all eligibility criteria',
    lastResult: {
      id: 'result-1',
      testId: 'test-1',
      passed: true,
      actualDecision: 'pass',
      actualReason: 'Application meets all eligibility criteria',
      firedRuleId: 'rule-4',
      firedRuleName: 'Default Pass',
      executionTrace: [
        { ruleId: 'rule-1', ruleName: 'Minimum Credit Score', evaluated: true, matched: false },
        { ruleId: 'rule-2', ruleName: 'Income to Loan Ratio', evaluated: true, matched: false },
        { ruleId: 'rule-3', ruleName: 'Employment Check', evaluated: true, matched: false },
        { ruleId: 'rule-4', ruleName: 'Default Pass', evaluated: true, matched: true, reason: 'Application meets all eligibility criteria' },
      ],
      creditsUsed: 1,
      latencyMs: 45,
      runAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'test-2',
    decisionId: 'decision-1',
    name: 'Low credit score rejected',
    description: 'Applicant with poor credit should be rejected',
    inputJson: {
      credit_score: 580,
      annual_income: 65000,
      employment_status: 'employed',
      loan_amount: 20000,
    },
    expectedDecision: 'fail',
    expectedReason: 'Credit score below minimum threshold of 650',
    lastResult: {
      id: 'result-2',
      testId: 'test-2',
      passed: true,
      actualDecision: 'fail',
      actualReason: 'Credit score below minimum threshold of 650',
      firedRuleId: 'rule-1',
      firedRuleName: 'Minimum Credit Score',
      executionTrace: [
        { ruleId: 'rule-1', ruleName: 'Minimum Credit Score', evaluated: true, matched: true, reason: 'Credit score below minimum threshold of 650' },
      ],
      creditsUsed: 1,
      latencyMs: 32,
      runAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'test-3',
    decisionId: 'decision-1',
    name: 'Unemployed applicant rejected',
    description: 'Unemployed applicant should be rejected regardless of credit',
    inputJson: {
      credit_score: 750,
      annual_income: 0,
      employment_status: 'unemployed',
      loan_amount: 10000,
    },
    expectedDecision: 'fail',
    expectedReason: 'Applicant must be employed or self-employed',
    lastResult: {
      id: 'result-3',
      testId: 'test-3',
      passed: true,
      actualDecision: 'fail',
      actualReason: 'Applicant must be employed or self-employed',
      firedRuleId: 'rule-3',
      firedRuleName: 'Employment Check',
      executionTrace: [
        { ruleId: 'rule-1', ruleName: 'Minimum Credit Score', evaluated: true, matched: false },
        { ruleId: 'rule-2', ruleName: 'Income to Loan Ratio', evaluated: true, matched: false },
        { ruleId: 'rule-3', ruleName: 'Employment Check', evaluated: true, matched: true, reason: 'Applicant must be employed or self-employed' },
      ],
      creditsUsed: 1,
      latencyMs: 38,
      runAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  // Fraud Detection Tests
  {
    id: 'test-4',
    decisionId: 'decision-2',
    name: 'Normal domestic transaction',
    description: 'Standard US transaction should pass',
    inputJson: {
      amount: 150,
      merchant_category: 'groceries',
      country: 'US',
      is_card_present: true,
    },
    expectedDecision: 'pass',
    expectedReason: 'Transaction approved - no fraud indicators detected',
    lastResult: {
      id: 'result-4',
      testId: 'test-4',
      passed: true,
      actualDecision: 'pass',
      actualReason: 'Transaction approved - no fraud indicators detected',
      firedRuleId: 'rule-7',
      firedRuleName: 'Default Approve',
      executionTrace: [
        { ruleId: 'rule-5', ruleName: 'High Amount Alert', evaluated: true, matched: false },
        { ruleId: 'rule-6', ruleName: 'International Card-Not-Present', evaluated: true, matched: false },
        { ruleId: 'rule-7', ruleName: 'Default Approve', evaluated: true, matched: true, reason: 'Transaction approved - no fraud indicators detected' },
      ],
      creditsUsed: 1,
      latencyMs: 28,
      runAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'test-5',
    decisionId: 'decision-2',
    name: 'High amount flagged',
    description: 'Transaction over $5000 should be flagged',
    inputJson: {
      amount: 7500,
      merchant_category: 'electronics',
      country: 'US',
      is_card_present: true,
    },
    expectedDecision: 'fail',
    expectedReason: 'Transaction amount exceeds $5000 threshold',
    lastResult: {
      id: 'result-5',
      testId: 'test-5',
      passed: true,
      actualDecision: 'fail',
      actualReason: 'Transaction amount exceeds $5000 threshold',
      firedRuleId: 'rule-5',
      firedRuleName: 'High Amount Alert',
      executionTrace: [
        { ruleId: 'rule-5', ruleName: 'High Amount Alert', evaluated: true, matched: true, reason: 'Transaction amount exceeds $5000 threshold' },
      ],
      creditsUsed: 1,
      latencyMs: 22,
      runAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// Initialize with sample data
// ============================================

function initializeData(): void {
  if (typeof window === 'undefined') return;
  
  const tests = getStorage<Test>(STORAGE_KEYS.tests);
  if (tests.length === 0) {
    setStorage(STORAGE_KEYS.tests, SAMPLE_TESTS);
  }
}

if (typeof window !== 'undefined') {
  initializeData();
}

// ============================================
// Tests Repository
// ============================================

export const testsRepo = {
  async listByDecisionId(decisionId: string): Promise<Test[]> {
    initializeData();
    const tests = getStorage<Test>(STORAGE_KEYS.tests);
    return tests
      .filter(t => t.decisionId === decisionId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getById(id: string): Promise<Test | null> {
    initializeData();
    const tests = getStorage<Test>(STORAGE_KEYS.tests);
    return tests.find(t => t.id === id) || null;
  },

  async create(input: Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'lastResult'>): Promise<Test> {
    initializeData();
    const tests = getStorage<Test>(STORAGE_KEYS.tests);
    const now = new Date().toISOString();
    
    const newTest: Test = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    tests.push(newTest);
    setStorage(STORAGE_KEYS.tests, tests);
    
    return newTest;
  },

  async update(id: string, updates: Partial<Omit<Test, 'id' | 'decisionId' | 'createdAt'>>): Promise<Test> {
    initializeData();
    const tests = getStorage<Test>(STORAGE_KEYS.tests);
    const index = tests.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Test with id ${id} not found`);
    }
    
    const updated: Test = {
      ...tests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    tests[index] = updated;
    setStorage(STORAGE_KEYS.tests, tests);
    
    return updated;
  },

  async remove(id: string): Promise<void> {
    initializeData();
    const tests = getStorage<Test>(STORAGE_KEYS.tests);
    const filtered = tests.filter(t => t.id !== id);
    setStorage(STORAGE_KEYS.tests, filtered);
  },

  async duplicate(id: string): Promise<Test> {
    const original = await this.getById(id);
    if (!original) {
      throw new Error(`Test with id ${id} not found`);
    }
    
    return this.create({
      decisionId: original.decisionId,
      name: `${original.name} (copy)`,
      description: original.description,
      inputJson: { ...original.inputJson },
      expectedDecision: original.expectedDecision,
      expectedReason: original.expectedReason,
    });
  },

  async updateResult(id: string, result: TestResult): Promise<Test> {
    return this.update(id, { lastResult: result });
  },

  async runTest(id: string): Promise<TestResult> {
    const test = await this.getById(id);
    if (!test) {
      throw new Error(`Test with id ${id} not found`);
    }
    
    // Simulate test execution
    // In production, this would call the actual decision engine
    const latencyMs = Math.floor(Math.random() * 50) + 20;
    
    // For demo purposes, we'll simulate passing/failing based on expected values
    const actualDecision = test.expectedDecision;
    const actualReason = test.expectedReason || (actualDecision === 'pass' ? 'Decision passed' : 'Decision failed');
    
    const result: TestResult = {
      id: generateId(),
      testId: id,
      passed: true, // In demo, tests always pass their expected outcome
      actualDecision,
      actualReason,
      firedRuleId: null,
      firedRuleName: null,
      executionTrace: [],
      creditsUsed: 1,
      latencyMs,
      runAt: new Date().toISOString(),
    };
    
    // Update the test with the result
    await this.updateResult(id, result);
    
    return result;
  },

  async runSuite(decisionId: string): Promise<{ passed: number; failed: number; results: TestResult[] }> {
    const tests = await this.listByDecisionId(decisionId);
    const results: TestResult[] = [];
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      const result = await this.runTest(test.id);
      results.push(result);
      if (result.passed) {
        passed++;
      } else {
        failed++;
      }
    }
    
    return { passed, failed, results };
  },

  async getTestStats(decisionId: string): Promise<{ total: number; passing: number; failing: number; noResult: number }> {
    const tests = await this.listByDecisionId(decisionId);
    
    let passing = 0;
    let failing = 0;
    let noResult = 0;
    
    for (const test of tests) {
      if (!test.lastResult) {
        noResult++;
      } else if (test.lastResult.passed) {
        passing++;
      } else {
        failing++;
      }
    }
    
    return {
      total: tests.length,
      passing,
      failing,
      noResult,
    };
  },

  subscribe(callback: () => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.tests) {
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
