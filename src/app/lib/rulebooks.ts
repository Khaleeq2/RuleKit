'use client';

import { 
  Rulebook, 
  RulebookWithStats, 
  Schema, 
  SchemaField,
  Rule, 
  RuleCondition,
  RulebookStatus,
  Environment
} from './types';
import { getSupabaseBrowserClient } from './supabase-browser';

function throwSbError(error: unknown): never {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      throw new Error(message);
    }
  }
  throw new Error('Something went wrong');
}

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
function toRulebook(row: any): Rulebook {
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
    rulebookId: row.rulebook_id,
    fields: row.fields ?? [],
    outputType: row.output_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRule(row: any): Rule {
  return {
    id: row.id,
    rulebookId: row.rulebook_id,
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
// Rulebooks Repository
// ============================================

export const rulebooksRepo = {
  async list(): Promise<Rulebook[]> {
    const { data, error } = await sb()
      .from('rulebooks')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throwSbError(error);
    return (data ?? []).map(toRulebook);
  },

  async listWithStats(): Promise<RulebookWithStats[]> {
    const rulebooks = await this.list();
    // Stats are derived from runs table — lightweight aggregate
    const { data: runs } = await sb()
      .from('runs')
      .select('rulebook_id, output, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const failMap = new Map<string, number>();
    const lastRunMap = new Map<string, string>();
    for (const r of runs ?? []) {
      const out = r.output as { verdict?: string } | null;
      if (out?.verdict === 'fail') {
        failMap.set(r.rulebook_id, (failMap.get(r.rulebook_id) || 0) + 1);
      }
      const prev = lastRunMap.get(r.rulebook_id);
      if (!prev || r.created_at > prev) {
        lastRunMap.set(r.rulebook_id, r.created_at);
      }
    }

    return rulebooks.map(d => ({
      ...d,
      failuresLast24h: failMap.get(d.id) || 0,
      lastDeployedAt: null,
      lastRunAt: lastRunMap.get(d.id) || null,
      activeEnv: d.status === 'published' ? ('live' as Environment) : null,
    }));
  },

  async getById(id: string): Promise<Rulebook | null> {
    const { data, error } = await sb()
      .from('rulebooks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSbError(error);
    return data ? toRulebook(data) : null;
  },

  async create(input: Omit<Rulebook, 'id' | 'createdAt' | 'updatedAt' | 'activeVersionId'>): Promise<Rulebook> {
    await requireAuth();

    const { data, error } = await sb()
      .from('rulebooks')
      .insert({
        name: input.name,
        description: input.description,
        status: input.status,
      })
      .select()
      .single();

    if (error) throwSbError(error);
    const rulebook = toRulebook(data);
    notify('rulebooks');

    // Create default schema
    try {
      await schemasRepo.create({
        rulebookId: rulebook.id,
        fields: [],
        outputType: 'pass_fail',
      });
    } catch (schemaError) {
      console.error('Rulebook created but schema creation failed:', schemaError);
    }

    return rulebook;
  },

  async update(id: string, updates: Partial<Omit<Rulebook, 'id' | 'createdAt'>>): Promise<Rulebook> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.activeVersionId !== undefined) dbUpdates.active_version_id = updates.activeVersionId;

    const { data, error } = await sb()
      .from('rulebooks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throwSbError(error);
    notify('rulebooks');
    return toRulebook(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await sb()
      .from('rulebooks')
      .delete()
      .eq('id', id);

    if (error) throwSbError(error);
    notify('rulebooks');
  },

  async search(query: string): Promise<Rulebook[]> {
    const { data, error } = await sb()
      .from('rulebooks')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throwSbError(error);
    return (data ?? []).map(toRulebook);
  },

  async filterByStatus(status: RulebookStatus): Promise<Rulebook[]> {
    const { data, error } = await sb()
      .from('rulebooks')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throwSbError(error);
    return (data ?? []).map(toRulebook);
  },

  subscribe(callback: () => void): () => void {
    const channel = sb()
      .channel('rulebooks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rulebooks' }, () => callback())
      .subscribe();

    return () => { channel.unsubscribe(); };
  },
};

// ============================================
// Schemas Repository
// ============================================

export const schemasRepo = {
  async getByRulebookId(rulebookId: string): Promise<Schema | null> {
    const { data, error } = await sb()
      .from('schemas')
      .select('*')
      .eq('rulebook_id', rulebookId)
      .maybeSingle();

    if (error) throwSbError(error);
    return data ? toSchema(data) : null;
  },

  // Legacy alias
  async getByDecisionId(rulebookId: string): Promise<Schema | null> {
    return this.getByRulebookId(rulebookId);
  },

  async create(input: Omit<Schema, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schema> {
    const { data, error } = await sb()
      .from('schemas')
      .insert({
        rulebook_id: input.rulebookId,
        fields: input.fields,
        output_type: input.outputType,
      })
      .select()
      .single();

    if (error) throwSbError(error);
    return toSchema(data);
  },

  async update(rulebookId: string, updates: Partial<Omit<Schema, 'id' | 'rulebookId' | 'createdAt'>>): Promise<Schema> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fields !== undefined) dbUpdates.fields = updates.fields;
    if (updates.outputType !== undefined) dbUpdates.output_type = updates.outputType;

    const { data, error } = await sb()
      .from('schemas')
      .update(dbUpdates)
      .eq('rulebook_id', rulebookId)
      .select()
      .single();

    if (error) throwSbError(error);
    return toSchema(data);
  },

  async addField(rulebookId: string, field: Omit<SchemaField, 'id'>): Promise<Schema> {
    const schema = await this.getByRulebookId(rulebookId);
    if (!schema) throw new Error(`Schema for rulebook ${rulebookId} not found`);

    const newField: SchemaField = { ...field, id: generateId() };
    return this.update(rulebookId, { fields: [...schema.fields, newField] });
  },

  async updateField(rulebookId: string, fieldId: string, updates: Partial<Omit<SchemaField, 'id'>>): Promise<Schema> {
    const schema = await this.getByRulebookId(rulebookId);
    if (!schema) throw new Error(`Schema for rulebook ${rulebookId} not found`);

    const fields = schema.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    return this.update(rulebookId, { fields });
  },

  async removeField(rulebookId: string, fieldId: string): Promise<Schema> {
    const schema = await this.getByRulebookId(rulebookId);
    if (!schema) throw new Error(`Schema for rulebook ${rulebookId} not found`);

    const fields = schema.fields.filter(f => f.id !== fieldId);
    return this.update(rulebookId, { fields });
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
  async listByRulebookId(rulebookId: string): Promise<Rule[]> {
    const { data, error } = await sb()
      .from('rules')
      .select('*')
      .eq('rulebook_id', rulebookId)
      .order('order', { ascending: true });

    if (error) throwSbError(error);
    return (data ?? []).map(toRule);
  },

  // Legacy alias
  async listByDecisionId(rulebookId: string): Promise<Rule[]> {
    return this.listByRulebookId(rulebookId);
  },

  async getById(id: string): Promise<Rule | null> {
    const { data, error } = await sb()
      .from('rules')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSbError(error);
    return data ? toRule(data) : null;
  },

  async create(input: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
    const { data, error } = await sb()
      .from('rules')
      .insert({
        rulebook_id: input.rulebookId,
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

    if (error) throwSbError(error);
    notify('rules');
    return toRule(data);
  },

  async update(id: string, updates: Partial<Omit<Rule, 'id' | 'rulebookId' | 'createdAt'>>): Promise<Rule> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.order !== undefined) dbUpdates.order = updates.order;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.result !== undefined) dbUpdates.result = updates.result;
    if (updates.reason !== undefined) dbUpdates.reason = updates.reason;
    if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;

    const { data, error } = await sb()
      .from('rules')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throwSbError(error);
    notify('rules');
    return toRule(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await sb()
      .from('rules')
      .delete()
      .eq('id', id);

    if (error) throwSbError(error);
    notify('rules');
  },

  async reorder(rulebookId: string, orderedIds: string[]): Promise<Rule[]> {
    await Promise.all(
      orderedIds.map((id, index) =>
        sb()
          .from('rules')
          .update({ order: index + 1 })
          .eq('id', id)
      )
    );
    notify('rules');
    return this.listByRulebookId(rulebookId);
  },

  async toggleEnabled(id: string): Promise<Rule> {
    const rule = await this.getById(id);
    if (!rule) throw new Error(`Rule with id ${id} not found`);
    return this.update(id, { enabled: !rule.enabled });
  },
};

// ============================================
// Legacy re-exports (for files still importing from decisions.ts)
// ============================================
export const decisionsRepo = rulebooksRepo;
