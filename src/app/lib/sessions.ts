'use client';

// ============================================
// Sessions Repository
// Persists conversational evaluation sessions to localStorage.
// ============================================

import type { EvaluationResult } from './evaluation-types';

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
  decisionId: string;
  decisionName: string;
  verdict: 'pass' | 'fail' | null;
  messageCount: number;
  messages: SessionMessage[];
  createdAt: string;
  updatedAt: string;
}

// --- Storage ---

const STORAGE_KEY = 'rulekit.sessions.v1';
const CHANGE_EVENT = 'rulekit:sessions-changed';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readAll(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: Session[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// --- Derive title from first user message ---

function deriveTitle(messages: SessionMessage[]): string {
  const firstUser = messages.find(m => m.type === 'user');
  if (!firstUser) return 'Untitled session';
  const text = firstUser.content.trim();
  if (text.length <= 60) return text;
  return text.slice(0, 57) + '...';
}

// --- Derive verdict from last evaluation ---

function deriveVerdict(messages: SessionMessage[]): 'pass' | 'fail' | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].evaluation) {
      return messages[i].evaluation!.verdict;
    }
  }
  return null;
}

// --- Check if title is still raw input (needs AI generation) ---

function isTitleRaw(session: Session): boolean {
  const firstUser = session.messages.find(m => m.type === 'user');
  if (!firstUser) return false;
  const rawTitle = firstUser.content.trim().length <= 60
    ? firstUser.content.trim()
    : firstUser.content.trim().slice(0, 57) + '...';
  return session.title === rawTitle || session.title === 'Untitled session';
}

// --- Repository ---

export const sessionsRepo = {
  async list(): Promise<Session[]> {
    return readAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getById(id: string): Promise<Session | null> {
    return readAll().find(s => s.id === id) ?? null;
  },

  async listNeedingTitles(): Promise<Session[]> {
    return readAll().filter(s =>
      s.messages.some(m => m.evaluation) &&
      (isTitleRaw(s) || s.title.includes('|'))
    );
  },

  async create(
    decisionId: string,
    decisionName: string,
    messages: SessionMessage[]
  ): Promise<Session> {
    const sessions = readAll();
    const now = new Date().toISOString();

    const session: Session = {
      id: generateId(),
      title: deriveTitle(messages),
      decisionId,
      decisionName,
      verdict: deriveVerdict(messages),
      messageCount: messages.length,
      messages,
      createdAt: now,
      updatedAt: now,
    };

    writeAll([session, ...sessions]);
    return session;
  },

  async update(id: string, messages: SessionMessage[]): Promise<Session | null> {
    const sessions = readAll();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return null;

    // Only bump timestamp on meaningful change (new message added)
    const hasNewContent = messages.length !== sessions[idx].messageCount;

    sessions[idx] = {
      ...sessions[idx],
      // Preserve existing title — AI title is set via updateTitle()
      verdict: deriveVerdict(messages),
      messageCount: messages.length,
      messages,
      ...(hasNewContent && { updatedAt: new Date().toISOString() }),
    };

    writeAll(sessions);
    return sessions[idx];
  },

  async updateTitle(id: string, title: string): Promise<void> {
    const sessions = readAll();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return;
    sessions[idx] = { ...sessions[idx], title, updatedAt: new Date().toISOString() };
    writeAll(sessions);
  },

  async remove(id: string): Promise<void> {
    const sessions = readAll();
    writeAll(sessions.filter(s => s.id !== id));
  },

  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const onChange = () => callback();
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  },
};
