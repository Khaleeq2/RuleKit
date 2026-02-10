'use client';

// ============================================
// Sessions Repository — Supabase-backed
// ============================================

import type { EvaluationResult } from './evaluation-types';
import { getSupabaseBrowserClient } from './supabase-browser';

// --- Types ---

export interface SessionMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: string;
  evaluation?: EvaluationResult;
}

export interface Session {
  id: string;
  title: string;
  rulebookId: string;
  rulebookName: string;
  verdict: string | null;
  messageCount: number;
  messages: SessionMessage[];
  createdAt: string;
  updatedAt: string;
}

// --- Helpers ---

function sb() {
  return getSupabaseBrowserClient();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toSession(row: any): Session {
  return {
    id: row.id,
    title: row.title,
    rulebookId: row.rulebook_id,
    rulebookName: row.rulebook_name,
    verdict: row.verdict,
    messageCount: row.message_count,
    messages: row.messages ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function deriveTitle(messages: SessionMessage[]): string {
  const firstUser = messages.find(m => m.type === 'user');
  if (!firstUser) return 'Untitled session';
  const text = firstUser.content.trim();
  if (text.length <= 60) return text;
  return text.slice(0, 57) + '...';
}

function deriveVerdict(messages: SessionMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].evaluation) {
      return messages[i].evaluation!.verdict;
    }
  }
  return null;
}

function isTitleRaw(session: Session): boolean {
  const firstUser = session.messages.find(m => m.type === 'user');
  if (!firstUser) return false;
  const rawTitle = firstUser.content.trim().length <= 60
    ? firstUser.content.trim()
    : firstUser.content.trim().slice(0, 57) + '...';
  return session.title === rawTitle || session.title === 'Untitled session';
}

const CHANGE_EVENT = 'rulekit:sessions-changed';
function notify() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

// --- Repository ---

export const sessionsRepo = {
  async list(): Promise<Session[]> {
    const { data, error } = await sb()
      .from('sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toSession);
  },

  async getById(id: string): Promise<Session | null> {
    const { data, error } = await sb()
      .from('sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toSession(data) : null;
  },

  async listNeedingTitles(): Promise<Session[]> {
    const sessions = await this.list();
    return sessions.filter(s =>
      s.messages.some(m => m.evaluation) &&
      (isTitleRaw(s) || s.title.includes('|'))
    );
  },

  async create(
    rulebookId: string,
    rulebookName: string,
    messages: SessionMessage[]
  ): Promise<Session> {
    const { data, error } = await sb()
      .from('sessions')
      .insert({
        title: deriveTitle(messages),
        rulebook_id: rulebookId,
        rulebook_name: rulebookName,
        verdict: deriveVerdict(messages),
        message_count: messages.length,
        messages,
      })
      .select()
      .single();

    if (error) throw error;
    notify();
    return toSession(data);
  },

  async update(id: string, messages: SessionMessage[]): Promise<Session | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const hasNewContent = messages.length !== existing.messageCount;

    const updates: Record<string, unknown> = {
      verdict: deriveVerdict(messages),
      message_count: messages.length,
      messages,
    };
    if (hasNewContent) {
      updates.updated_at = new Date().toISOString();
    }

    const { data, error } = await sb()
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    notify();
    return toSession(data);
  },

  async updateTitle(id: string, title: string): Promise<void> {
    const { error } = await sb()
      .from('sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    notify();
  },

  async remove(id: string): Promise<void> {
    const { error } = await sb()
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    notify();
  },

  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const onChange = () => callback();
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  },
};
