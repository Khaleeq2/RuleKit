'use client';

import { Tour } from 'nextstepjs';

// ============================================
// Product Tour Steps
// 5-step guided tour for new users
// ============================================

export const tourSteps: Tour[] = [
  {
    tour: 'welcome-tour',
    steps: [
      {
        icon: <>👋</>,
        title: 'Evaluate anything',
        content: (
          <p className="text-sm text-[var(--muted-foreground)]">
            Type a scenario in plain English — or paste JSON, CSV, or any data format.
            RuleKit&apos;s AI evaluates it against your rules in real-time.
          </p>
        ),
        selector: '#tour-composer',
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: <>🎯</>,
        title: 'Pick a ruleset',
        content: (
          <p className="text-sm text-[var(--muted-foreground)]">
            Each ruleset has its own set of rules. Select one from this dropdown
            to evaluate against.
          </p>
        ),
        selector: '#tour-decision-selector',
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: <>📝</>,
        title: 'Build your rules',
        content: (
          <p className="text-sm text-[var(--muted-foreground)]">
            Define conditions in natural language — no code required.
            Each rule gets its own pass/fail verdict with reasoning.
          </p>
        ),
        selector: '#tour-nav-decisions',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: <>📊</>,
        title: 'Every run is saved',
        content: (
          <p className="text-sm text-[var(--muted-foreground)]">
            Review past evaluations, compare results across runs,
            and spot patterns in your decision outcomes.
          </p>
        ),
        selector: '#tour-nav-history',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: <>✨</>,
        title: '50 free evaluations',
        content: (
          <p className="text-sm text-[var(--muted-foreground)]">
            You get 50 evaluations per month on the free plan.
            Need more? Upgrade anytime from the billing page.
          </p>
        ),
        selector: '#tour-credits',
        side: 'top',
        showControls: true,
        showSkip: false,
        pointerPadding: 4,
        pointerRadius: 8,
      },
    ],
  },
];
