'use client';

import { getSupabaseBrowserClient } from './supabase-browser';

// ============================================
// Onboarding State
// Stored in Supabase user_metadata for persistence
// ============================================

export interface OnboardingState {
  welcomed: boolean;        // Welcome modal shown
  tourCompleted: boolean;   // Product tour finished
  firstEvalDone: boolean;   // First evaluation completed
  firstRulebookCreated: boolean; // Created own rulebook (not seed)
  firstTestRun: boolean;    // Ran a test suite
  firstDeploy: boolean;     // Deployed a rulebook
  seedDecisionId: string | null; // ID of the seeded sample rulebook
}

const DEFAULT_STATE: OnboardingState = {
  welcomed: false,
  tourCompleted: false,
  firstEvalDone: false,
  firstRulebookCreated: false,
  firstTestRun: false,
  firstDeploy: false,
  seedDecisionId: null,
};

// ============================================
// Read / Write onboarding state
// ============================================

export async function getOnboardingState(): Promise<OnboardingState> {
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_STATE;

  const meta = user.user_metadata?.onboarding as Partial<OnboardingState> | undefined;
  return { ...DEFAULT_STATE, ...meta };
}

export async function updateOnboardingState(updates: Partial<OnboardingState>): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const current = await getOnboardingState();
  const merged = { ...current, ...updates };

  await supabase.auth.updateUser({
    data: { onboarding: merged },
  });
}

// ============================================
// Seed rulebook — called on first visit to /home
// ============================================

export async function seedRulebookIfNeeded(): Promise<{
  seeded: boolean;
  rulebookId?: string;
  rulebookName?: string;
}> {
  try {
    const res = await fetch('/api/seed-rulebook', { method: 'POST' });
    if (!res.ok) return { seeded: false };
    return await res.json();
  } catch {
    return { seeded: false };
  }
}

// ============================================
// Checklist helpers
// ============================================

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  href: string;
}

export function getChecklistItems(state: OnboardingState): ChecklistItem[] {
  return [
    {
      id: 'create-rulebook',
      label: 'Create your first rulebook',
      description: 'Define rules for your use case',
      completed: state.firstRulebookCreated,
      href: '/rulebooks/new',
    },
    {
      id: 'first-eval',
      label: 'Run your first evaluation',
      description: 'Type a scenario and see your rules in action',
      completed: state.firstEvalDone,
      href: '/home',
    },
    {
      id: 'run-test',
      label: 'Run a test suite',
      description: 'Verify your rules with test cases',
      completed: state.firstTestRun,
      href: '/rulebooks',
    },
    {
      id: 'deploy',
      label: 'Deploy your rulebook',
      description: 'Make your rules available via API',
      completed: state.firstDeploy,
      href: '/rulebooks',
    },
  ];
}

export function getCompletedCount(state: OnboardingState): number {
  return [
    state.firstEvalDone,
    state.firstRulebookCreated,
    state.firstTestRun,
    state.firstDeploy,
  ].filter(Boolean).length;
}

export function isOnboardingComplete(state: OnboardingState): boolean {
  return getCompletedCount(state) === 4;
}
