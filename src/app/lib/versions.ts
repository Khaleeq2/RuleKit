'use client';

import { 
  Version, 
  Deployment, 
  Environment, 
  TestStatus,
  Schema,
  Rule
} from './types';
import { schemasRepo, rulesRepo } from './rulebooks';
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
function toVersion(row: any): Version {
  return {
    id: row.id,
    rulebookId: row.rulebook_id,
    versionNumber: row.version_number,
    schemaSnapshot: row.schema_snapshot as Schema,
    rulesSnapshot: (row.rules_snapshot ?? []) as Rule[],
    releaseNotes: row.release_notes ?? '',
    testStatus: row.test_status,
    createdAt: row.created_at,
    createdBy: row.user_id,
  };
}

function toDeployment(row: any): Deployment {
  return {
    id: row.id,
    rulebookId: row.rulebook_id,
    environment: row.environment,
    activeVersionId: row.active_version_id,
    versionNumber: row.version_number,
    deployedAt: row.deployed_at,
    deployedBy: row.user_id,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================
// Versions Repository
// ============================================

export const versionsRepo = {
  async listByRulebookId(rulebookId: string): Promise<Version[]> {
    const { data, error } = await sb()
      .from('versions')
      .select('*')
      .eq('rulebook_id', rulebookId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toVersion);
  },

  async getById(id: string): Promise<Version | null> {
    const { data, error } = await sb()
      .from('versions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toVersion(data) : null;
  },

  async getLatestByRulebookId(rulebookId: string): Promise<Version | null> {
    const { data, error } = await sb()
      .from('versions')
      .select('*')
      .eq('rulebook_id', rulebookId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? toVersion(data) : null;
  },

  async create(rulebookId: string, releaseNotes: string = ''): Promise<Version> {
    // Get current schema and rules
    const schema = await schemasRepo.getByRulebookId(rulebookId);
    const rules = await rulesRepo.listByRulebookId(rulebookId);

    if (!schema) {
      throw new Error(`Schema for rulebook ${rulebookId} not found`);
    }

    // Get next version number
    const latest = await this.getLatestByRulebookId(rulebookId);
    const nextVersionNumber = latest ? latest.versionNumber + 1 : 1;

    const { data, error } = await sb()
      .from('versions')
      .insert({
        rulebook_id: rulebookId,
        version_number: nextVersionNumber,
        schema_snapshot: schema as unknown as Record<string, unknown>,
        rules_snapshot: rules as unknown as Record<string, unknown>[],
        release_notes: releaseNotes,
        test_status: 'unknown',
      })
      .select()
      .single();

    if (error) throw error;
    notify('versions');
    return toVersion(data);
  },

  async updateTestStatus(id: string, testStatus: TestStatus): Promise<Version> {
    const { data, error } = await sb()
      .from('versions')
      .update({ test_status: testStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    notify('versions');
    return toVersion(data);
  },

  async updateReleaseNotes(id: string, releaseNotes: string): Promise<Version> {
    const { data, error } = await sb()
      .from('versions')
      .update({ release_notes: releaseNotes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    notify('versions');
    return toVersion(data);
  },

  subscribe(callback: () => void): () => void {
    const channel = sb()
      .channel('versions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'versions' }, () => callback())
      .subscribe();

    return () => { channel.unsubscribe(); };
  },
};

// ============================================
// Deployments Repository
// ============================================

export const deploymentsRepo = {
  async listByRulebookId(rulebookId: string): Promise<Deployment[]> {
    const { data, error } = await sb()
      .from('deployments')
      .select('*')
      .eq('rulebook_id', rulebookId)
      .order('deployed_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toDeployment);
  },

  async listAll(): Promise<Deployment[]> {
    const { data, error } = await sb()
      .from('deployments')
      .select('*')
      .order('deployed_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toDeployment);
  },

  async getByRulebookAndEnv(rulebookId: string, environment: Environment): Promise<Deployment | null> {
    const { data, error } = await sb()
      .from('deployments')
      .select('*')
      .eq('rulebook_id', rulebookId)
      .eq('environment', environment)
      .order('deployed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? toDeployment(data) : null;
  },

  async getActiveDeployments(rulebookId: string): Promise<Record<Environment, Deployment | null>> {
    const deployments = await this.listByRulebookId(rulebookId);
    return {
      draft: deployments.find(d => d.environment === 'draft') || null,
      live: deployments.find(d => d.environment === 'live') || null,
    };
  },

  async promote(rulebookId: string, versionId: string, environment: Environment): Promise<Deployment> {
    // Get the version to get version number
    const version = await versionsRepo.getById(versionId);
    if (!version) {
      throw new Error(`Version with id ${versionId} not found`);
    }

    // Check if tests pass for prod
    if (environment === 'live' && version.testStatus !== 'passing') {
      throw new Error('Cannot make live: tests must be passing');
    }

    // Check if an existing deployment exists for this rulebook/env
    const existing = await this.getByRulebookAndEnv(rulebookId, environment);

    if (existing) {
      // Update existing deployment
      const { data, error } = await sb()
        .from('deployments')
        .update({
          active_version_id: versionId,
          version_number: version.versionNumber,
          deployed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      notify('deployments');
      return toDeployment(data);
    } else {
      // Create new deployment
      const { data, error } = await sb()
        .from('deployments')
        .insert({
          rulebook_id: rulebookId,
          environment,
          active_version_id: versionId,
          version_number: version.versionNumber,
        })
        .select()
        .single();

      if (error) throw error;
      notify('deployments');
      return toDeployment(data);
    }
  },

  async rollback(rulebookId: string, environment: Environment, versionId: string): Promise<Deployment> {
    return this.promote(rulebookId, versionId, environment);
  },

  subscribe(callback: () => void): () => void {
    const channel = sb()
      .channel('deployments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deployments' }, () => callback())
      .subscribe();

    return () => { channel.unsubscribe(); };
  },
};
