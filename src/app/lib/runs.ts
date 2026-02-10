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
function toRun(row: any): Run {
  return {
    id: row.id,
    rulebookId: row.rulebook_id,
    rulebookName: row.rulebook_name,
    versionId: row.version_id,
    versionNumber: row.version_number,
    environment: row.environment,
    input: row.input ?? {},
    output: row.output ?? { verdict: 'fail', reason: '' },
    firedRuleId: row.fired_rule_id,
    firedRuleName: row.fired_rule_name,
    executionTrace: row.execution_trace ?? [],
    trigger: row.trigger,
    creditsEstimate: row.credits_estimate,
    creditsActual: row.credits_actual,
    latencyMs: row.latency_ms,
    status: row.status,
    error: row.error,
    createdAt: row.created_at,
  };
}

function toActivity(row: any): ActivityEvent {
  return {
    id: row.id,
    type: row.type,
    actorId: row.user_id,
    actorName: row.actor_name,
    rulebookId: row.rulebook_id,
    rulebookName: row.rulebook_name,
    versionId: row.version_id,
    description: row.description,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================
// Runs Repository
// ============================================

export const runsRepo = {
  async list(options?: {
    rulebookId?: string;
    environment?: Environment;
    status?: RunStatus;
    trigger?: RunTrigger;
    limit?: number;
    offset?: number;
  }): Promise<Run[]> {
    let query = sb()
      .from('runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.rulebookId) query = query.eq('rulebook_id', options.rulebookId);
    if (options?.environment) query = query.eq('environment', options.environment);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.trigger) query = query.eq('trigger', options.trigger);

    const offset = options?.offset || 0;
    const limit = options?.limit || 100;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toRun);
  },

  async getById(id: string): Promise<Run | null> {
    const { data, error } = await sb()
      .from('runs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toRun(data) : null;
  },

  async getFailures(options?: { rulebookId?: string; hours?: number }): Promise<Run[]> {
    const hours = options?.hours || 24;
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    let query = sb()
      .from('runs')
      .select('*')
      .gte('created_at', cutoff);

    if (options?.rulebookId) query = query.eq('rulebook_id', options.rulebookId);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? [])
      .map(toRun)
      .filter((r: Run) => r.output.verdict === 'fail');
  },

  async getStats(rulebookId?: string): Promise<{
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgLatency: number;
    totalCredits: number;
  }> {
    const runs = await this.list({ rulebookId, limit: 1000 });

    const passed = runs.filter(r => r.output.verdict === 'pass').length;
    const failed = runs.filter(r => r.output.verdict === 'fail').length;
    const total = runs.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const avgLatency = total > 0
      ? Math.round(runs.reduce((sum, r) => sum + r.latencyMs, 0) / total)
      : 0;
    const totalCredits = runs.reduce((sum, r) => sum + r.creditsActual, 0);

    return { total, passed, failed, passRate, avgLatency, totalCredits };
  },

  async create(input: Omit<Run, 'id' | 'createdAt'>): Promise<Run> {
    const { data, error } = await sb()
      .from('runs')
      .insert({
        rulebook_id: input.rulebookId,
        rulebook_name: input.rulebookName,
        version_id: input.versionId,
        version_number: input.versionNumber,
        environment: input.environment,
        input: input.input,
        output: input.output,
        fired_rule_id: input.firedRuleId,
        fired_rule_name: input.firedRuleName,
        execution_trace: input.executionTrace,
        trigger: input.trigger,
        credits_estimate: input.creditsEstimate,
        credits_actual: input.creditsActual,
        latency_ms: input.latencyMs,
        status: input.status,
        error: input.error,
      })
      .select()
      .single();

    if (error) throw error;
    notify('runs');
    return toRun(data);
  },

  async executeRulebook(
    rulebookId: string,
    rulebookName: string,
    versionId: string,
    versionNumber: number,
    environment: Environment,
    input: Record<string, unknown>,
    trigger: RunTrigger
  ): Promise<Run> {
    const startTime = Date.now();

    // Mock evaluation logic — in production this would evaluate rules
    const verdict: RuleResult = Math.random() > 0.3 ? 'pass' : 'fail';
    const reason = verdict === 'pass'
      ? 'Rulebook passed all rules'
      : 'Rulebook failed validation';

    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 30) + 15;

    const run = await this.create({
      rulebookId,
      rulebookName,
      versionId,
      versionNumber,
      environment,
      input,
      output: { verdict, reason },
      firedRuleId: null,
      firedRuleName: null,
      executionTrace: [],
      trigger,
      creditsEstimate: 1,
      creditsActual: 1,
      latencyMs,
      status: 'success',
    });

    await activityRepo.log({
      type: 'run.executed',
      actorId: 'current-user',
      actorName: 'You',
      rulebookId,
      rulebookName,
      description: `Executed rulebook (${verdict})`,
      metadata: { runId: run.id, environment },
    });

    return run;
  },

  subscribe(callback: () => void): () => void {
    const channel = sb()
      .channel('runs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'runs' }, () => callback())
      .subscribe();

    return () => { channel.unsubscribe(); };
  },
};

// ============================================
// Activity Repository
// ============================================

export const activityRepo = {
  async list(options?: {
    limit?: number;
    rulebookId?: string;
    type?: ActivityEventType;
  }): Promise<ActivityEvent[]> {
    let query = sb()
      .from('activity_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.rulebookId) query = query.eq('rulebook_id', options.rulebookId);
    if (options?.type) query = query.eq('type', options.type);

    const limit = options?.limit || 50;
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toActivity);
  },

  async log(input: Omit<ActivityEvent, 'id' | 'createdAt'>): Promise<ActivityEvent> {
    const { data, error } = await sb()
      .from('activity_events')
      .insert({
        type: input.type,
        actor_name: input.actorName,
        rulebook_id: input.rulebookId,
        rulebook_name: input.rulebookName,
        version_id: input.versionId,
        description: input.description,
        metadata: input.metadata,
      })
      .select()
      .single();

    if (error) throw error;
    notify('activity');
    return toActivity(data);
  },

  subscribe(callback: () => void): () => void {
    const channel = sb()
      .channel('activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_events' }, () => callback())
      .subscribe();

    return () => { channel.unsubscribe(); };
  },
};
