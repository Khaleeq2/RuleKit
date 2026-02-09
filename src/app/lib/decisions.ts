'use client';

import { 
  Decision, 
  DecisionWithStats, 
  Schema, 
  SchemaField,
  Rule, 
  RuleCondition,
  DecisionStatus,
  Environment
} from './types';
import { getSupabaseBrowserClient } from './supabase-browser';

// ============================================
// Helpers
// ============================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

function sb() {
  return getSupabaseBrowserClient();
}

async function requireAuth(): Promise<string> {
  const { data: { user }, error } = await sb().auth.getUser();
  if (error || !user) {
    throw new Error('Not authenticated — please sign in again.');
  }
  return user.id;
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
function toDecision(row: any): Decision {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    status: row.status,
    activeVersionId: row.active_version_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.user_id,
  };
}

function toSchema(row: any): Schema {
  return {
    id: row.id,
    decisionId: row.decision_id,
    fields: row.fields ?? [],
    outputType: row.output_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRule(row: any): Rule {
  return {
    id: row.id,
    decisionId: row.decision_id,
    name: row.name,
    description: row.description ?? '',
    order: row.order,
    condition: row.condition ?? {},
    result: row.result,
    reason: row.reason ?? '',
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================
// Decisions Repository
// ============================================

export const decisionsRepo = {
  async list(): Promise<Decision[]> {
    const { data, error } = await sb()
      .from('decisions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toDecision);
  },

  async listWithStats(): Promise<DecisionWithStats[]> {
    const decisions = await this.list();
    // Stats are derived from runs table — lightweight aggregate
    const { data: runs } = await sb()
      .from('runs')
      .select('decision_id, output, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const failMap = new Map<string, number>();
    const lastRunMap = new Map<string, string>();
    for (const r of runs ?? []) {
      const out = r.output as { decision?: string } | null;
      if (out?.decision === 'fail') {
        failMap.set(r.decision_id, (failMap.get(r.decision_id) || 0) + 1);
      }
      const prev = lastRunMap.get(r.decision_id);
      if (!prev || r.created_at > prev) {
        lastRunMap.set(r.decision_id, r.created_at);
      }
    }

    return decisions.map(d => ({
      ...d,
      failuresLast24h: failMap.get(d.id) || 0,
      lastDeployedAt: null,
      lastRunAt: lastRunMap.get(d.id) || null,
      activeEnv: d.status === 'published' ? ('live' as Environment) : null,
    }));
  },

  async getById(id: string): Promise<Decision | null> {
    const { data, error } = await sb()
      .from('decisions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDecision(data) : null;
  },

  async create(input: Omit<Decision, 'id' | 'createdAt' | 'updatedAt' | 'activeVersionId'>): Promise<Decision> {
    await requireAuth();

    const { data, error } = await sb()
      .from('decisions')
      .insert({
        name: input.name,
        description: input.description,
        status: input.status,
      })
      .select()
      .single();

    if (error) throw error;
    const decision = toDecision(data);
    notify('decisions');

    // Create default schema
    try {
      await schemasRepo.create({
        decisionId: decision.id,
        fields: [],
        outputType: 'pass_fail',
      });
    } catch (schemaError) {
      console.error('Decision created but schema creation failed:', schemaError);
      // Decision exists, schema will be created on first access
    }

    return decision;
  },

  async update(id: string, updates: Partial<Omit<Decision, 'id' | 'createdAt'>>): Promise<Decision> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.activeVersionId !== undefined) dbUpdates.active_version_id = updates.activeVersionId;

    const { data, error } = await sb()
      .from('decisions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    notify('decisions');
    return toDecision(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await sb()
      .from('decisions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    notify('decisions');
  },

  async search(query: string): Promise<Decision[]> {
    const { data, error } = await sb()
      .from('decisions')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toDecision);
  },

  async filterByStatus(status: DecisionStatus): Promise<Decision[]> {
    const { data, error } = await sb()
      .from('decisions')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toDecision);
  },

  subscribe(callback: () => void): () => void {
    const channel = sb()
      .channel('decisions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions' }, () => callback())
      .subscribe();

    return () => { channel.unsubscribe(); };
  },
};

// ============================================
// Schemas Repository
// ============================================

export const schemasRepo = {
  async getByDecisionId(decisionId: string): Promise<Schema | null> {
    const { data, error } = await sb()
      .from('schemas')
      .select('*')
      .eq('decision_id', decisionId)
      .maybeSingle();

    if (error) throw error;
    return data ? toSchema(data) : null;
  },

  async create(input: Omit<Schema, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schema> {
    const { data, error } = await sb()
      .from('schemas')
      .insert({
        decision_id: input.decisionId,
        fields: input.fields,
        output_type: input.outputType,
      })
      .select()
      .single();

    if (error) throw error;
    return toSchema(data);
  },

  async update(decisionId: string, updates: Partial<Omit<Schema, 'id' | 'decisionId' | 'createdAt'>>): Promise<Schema> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fields !== undefined) dbUpdates.fields = updates.fields;
    if (updates.outputType !== undefined) dbUpdates.output_type = updates.outputType;

    const { data, error } = await sb()
      .from('schemas')
      .update(dbUpdates)
      .eq('decision_id', decisionId)
      .select()
      .single();

    if (error) throw error;
    return toSchema(data);
  },

  async addField(decisionId: string, field: Omit<SchemaField, 'id'>): Promise<Schema> {
    const schema = await this.getByDecisionId(decisionId);
    if (!schema) throw new Error(`Schema for decision ${decisionId} not found`);

    const newField: SchemaField = { ...field, id: generateId() };
    return this.update(decisionId, { fields: [...schema.fields, newField] });
  },

  async updateField(decisionId: string, fieldId: string, updates: Partial<Omit<SchemaField, 'id'>>): Promise<Schema> {
    const schema = await this.getByDecisionId(decisionId);
    if (!schema) throw new Error(`Schema for decision ${decisionId} not found`);

    const fields = schema.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    return this.update(decisionId, { fields });
  },

  async removeField(decisionId: string, fieldId: string): Promise<Schema> {
    const schema = await this.getByDecisionId(decisionId);
    if (!schema) throw new Error(`Schema for decision ${decisionId} not found`);

    const fields = schema.fields.filter(f => f.id !== fieldId);
    return this.update(decisionId, { fields });
  },

  async inferFromJson(json: Record<string, unknown>): Promise<SchemaField[]> {
    const fields: SchemaField[] = [];
    for (const [key, value] of Object.entries(json)) {
      let type: SchemaField['type'] = 'string';
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (Array.isArray(value)) type = 'array';
      else if (typeof value === 'object' && value !== null) type = 'json';
      else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) type = 'date';

      fields.push({
        id: generateId(),
        name: key,
        type,
        required: true,
        description: '',
        example: String(value),
      });
    }
    return fields;
  },
};

// ============================================
// Rules Repository
// ============================================

export const rulesRepo = {
  async listByDecisionId(decisionId: string): Promise<Rule[]> {
    const { data, error } = await sb()
      .from('decision_rules')
      .select('*')
      .eq('decision_id', decisionId)
      .order('order', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(toRule);
  },

  async getById(id: string): Promise<Rule | null> {
    const { data, error } = await sb()
      .from('decision_rules')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toRule(data) : null;
  },

  async create(input: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
    const { data, error } = await sb()
      .from('decision_rules')
      .insert({
        decision_id: input.decisionId,
        name: input.name,
        description: input.description,
        order: input.order,
        condition: input.condition,
        result: input.result,
        reason: input.reason,
        enabled: input.enabled,
      })
      .select()
      .single();

    if (error) throw error;
    notify('rules');
    return toRule(data);
  },

  async update(id: string, updates: Partial<Omit<Rule, 'id' | 'decisionId' | 'createdAt'>>): Promise<Rule> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.order !== undefined) dbUpdates.order = updates.order;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.result !== undefined) dbUpdates.result = updates.result;
    if (updates.reason !== undefined) dbUpdates.reason = updates.reason;
    if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;

    const { data, error } = await sb()
      .from('decision_rules')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    notify('rules');
    return toRule(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await sb()
      .from('decision_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    notify('rules');
  },

  async reorder(decisionId: string, orderedIds: string[]): Promise<Rule[]> {
    // Update each rule's order in parallel
    await Promise.all(
      orderedIds.map((id, index) =>
        sb()
          .from('decision_rules')
          .update({ order: index + 1 })
          .eq('id', id)
      )
    );
    notify('rules');
    return this.listByDecisionId(decisionId);
  },

  async toggleEnabled(id: string): Promise<Rule> {
    const rule = await this.getById(id);
    if (!rule) throw new Error(`Rule with id ${id} not found`);
    return this.update(id, { enabled: !rule.enabled });
  },
};
