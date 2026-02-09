'use client';

import { 
  Test, 
  TestResult, 
  RuleResult
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

// ============================================
// DB row → TS type mappers
// ============================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function toTest(row: any): Test {
  return {
    id: row.id,
    decisionId: row.decision_id,
    name: row.name,
    description: row.description ?? '',
    inputJson: row.input_json ?? {},
    expectedDecision: row.expected_decision as RuleResult,
    expectedReason: row.expected_reason ?? undefined,
    lastResult: row.last_result as TestResult | undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================
// Tests Repository
// ============================================

export const testsRepo = {
  async listByDecisionId(decisionId: string): Promise<Test[]> {
    const { data, error } = await sb()
      .from('tests')
      .select('*')
      .eq('decision_id', decisionId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toTest);
  },

  async getById(id: string): Promise<Test | null> {
    const { data, error } = await sb()
      .from('tests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toTest(data) : null;
  },

  async create(input: Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'lastResult'>): Promise<Test> {
    const { data, error } = await sb()
      .from('tests')
      .insert({
        decision_id: input.decisionId,
        name: input.name,
        description: input.description,
        input_json: input.inputJson,
        expected_decision: input.expectedDecision,
        expected_reason: input.expectedReason ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    notify('tests');
    return toTest(data);
  },

  async update(id: string, updates: Partial<Omit<Test, 'id' | 'decisionId' | 'createdAt'>>): Promise<Test> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.inputJson !== undefined) dbUpdates.input_json = updates.inputJson;
    if (updates.expectedDecision !== undefined) dbUpdates.expected_decision = updates.expectedDecision;
    if (updates.expectedReason !== undefined) dbUpdates.expected_reason = updates.expectedReason;
    if (updates.lastResult !== undefined) dbUpdates.last_result = updates.lastResult;

    const { data, error } = await sb()
      .from('tests')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    notify('tests');
    return toTest(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await sb()
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    notify('tests');
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

    // Fetch decision info and rules for real evaluation
    const { decisionsRepo, rulesRepo } = await import('./decisions');
    const decision = await decisionsRepo.getById(test.decisionId);
    if (!decision) {
      throw new Error('Decision not found for this test');
    }

    const rules = await rulesRepo.listByDecisionId(test.decisionId);
    const enabledRules = rules.filter(r => r.enabled);

    if (enabledRules.length === 0) {
      throw new Error('No active rules found. Add rules before running tests.');
    }

    const inputStr = typeof test.inputJson === 'string'
      ? test.inputJson
      : JSON.stringify(test.inputJson);

    const startMs = performance.now();

    // Call the real evaluation API
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: inputStr,
        decision_id: test.decisionId,
        decision_name: decision.name,
        rules: enabledRules.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description || r.name,
          reason: r.reason || '',
        })),
      }),
    });

    const latencyMs = Math.round(performance.now() - startMs);
    const data = await res.json();

    let actualDecision: RuleResult = 'fail';
    let actualReason = 'Evaluation failed';
    let firedRuleId: string | null = null;
    let firedRuleName: string | null = null;

    if (data.success && data.result) {
      actualDecision = data.result.verdict as RuleResult;
      actualReason = data.result.reason || '';

      // Find the first failing rule (or first rule that determined the outcome)
      const firedRule = data.result.evaluations?.find(
        (e: { verdict: string }) => e.verdict === actualDecision
      );
      if (firedRule) {
        firedRuleId = firedRule.rule_id;
        firedRuleName = firedRule.rule_name;
      }
    } else if (data.error) {
      actualReason = data.error;
    }

    const passed = actualDecision === test.expectedDecision;

    const result: TestResult = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
      testId: id,
      passed,
      actualDecision,
      actualReason,
      firedRuleId,
      firedRuleName,
      executionTrace: [],
      creditsUsed: 1,
      latencyMs,
      runAt: new Date().toISOString(),
    };

    // Persist the result back onto the test row
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
    const channel = sb()
      .channel('tests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tests' }, () => callback())
      .subscribe();

    return () => { channel.unsubscribe(); };
  },
};
