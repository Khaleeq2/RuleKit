> **⚠️ ARCHIVED** — This strategy has been implemented. The active task tracker is [`MVP-CHECKLIST.md`](./MVP-CHECKLIST.md).

# RuleKit — Onboarding Strategy

> Zero-friction path to the first "aha!" moment.
> **Created: Feb 9, 2026**

---

## The Aha! Moment

> "I typed natural language, RuleKit evaluated it against my rules,
> and I got a pass/fail verdict with per-rule reasoning in under 2 seconds."

**Current time-to-aha: ~5 minutes** (sign up → create decision → add rules → go home → evaluate)
**Target time-to-aha: <60 seconds** (sign up → land on home → evaluate pre-loaded decision → see result)

---

## Feature 1: Seed Decision (Highest Impact)

### What
Auto-create a sample "Loan Eligibility" decision with 3 real rules for every new user at signup.
When they land on `/home` for the first time, the decision is pre-selected and the composer
has a placeholder showing exactly what to type.

### Why
- Eliminates the biggest friction point: empty state with no decisions to evaluate
- Users see value *before* they invest any effort
- Mirrors how Airtable (pre-loaded bases), Retool (sample queries), and Zapier (pre-built zaps) onboard

### Rules to seed
1. **Age Requirement** — "Applicant must be at least 18 years old"
2. **Minimum Income** — "Annual income must be at least $30,000"
3. **Credit Score** — "Credit score must be 650 or higher"

### Implementation
- Modify `handle_new_user()` trigger OR add a client-side first-run check
- Preferred: Client-side check in `/home` — if user has 0 decisions, call a `/api/seed-decision` endpoint
- Seed creates: 1 decision + 3 rules + 1 schema
- Mark with `is_sample: true` metadata so we can distinguish from user-created content
- Home page auto-selects the seeded decision
- Composer placeholder: `Try: "John, 25 years old, income $80,000, credit score 720"`

---

## Feature 2: Product Tour (NextStepJS)

### What
A 5-step guided product tour using [NextStepJS](https://nextstepjs.com) — the best
Next.js-native onboarding library in 2026. Lightweight, Framer Motion animations,
dark mode via CSS vars (works with our `next-themes` setup), cross-page routing support.

### Why
- Technical users still benefit from a *brief* tour that shows where things are
- 5 steps max — research shows >5 tooltips increases drop-off
- Skippable, resumable, non-blocking

### Tour Steps
| # | Target | Title | Content |
|---|--------|-------|---------|
| 1 | Home composer | **Evaluate anything** | Type a scenario in plain English. RuleKit evaluates it against your rules in real-time. |
| 2 | Decision selector | **Pick a decision** | Each decision has its own rules. Select one to evaluate against. |
| 3 | Sidebar → Rules | **Build your rules** | Define conditions in natural language. No code required. |
| 4 | Sidebar → History | **Every run is saved** | Review past evaluations, compare results, and spot patterns. |
| 5 | Credit badge | **50 free evaluations** | You get 50 evaluations per month on the free plan. Need more? Upgrade anytime. |

### Library
- `npm install nextstepjs` (~lightweight, Motion dependency only)
- Native Next.js App Router adapter
- Dark mode: inherits from `next-themes` via CSS variables (zero config)
- Custom card component using our shadcn/ui `Card` for visual consistency
- `useNextStep()` hook to trigger tour programmatically on first login
- Tour state persisted in Supabase `user_metadata` to avoid re-showing

---

## Feature 3: Onboarding Checklist

### What
A persistent, collapsible checklist (4 items) that appears on the home page for new users.
Tracks progress, celebrates completion, and disappears once all items are done.

### Why
- 4-6 steps is the sweet spot before disengagement (research-backed)
- Progress bars create "serotonin boosts" that drive completion
- ~25% of SaaS users complete checklists — but those who do have 3x higher retention

### Checklist Items
| # | Item | Trigger | Reward |
|---|------|---------|--------|
| 1 | ✅ Run your first evaluation | `credit_transactions` has ≥1 usage row | Toast: "Your first verdict!" |
| 2 | 📝 Create a decision | `decisions` count > 1 (more than seed) | Toast: "You're building!" |
| 3 | 🧪 Run a test suite | `tests` has ≥1 completed run | Toast: "Quality locked in" |
| 4 | 🚀 Deploy a decision | `deployments` has ≥1 row | Confetti 🎉 + "You're live!" |

### Implementation
- Store checklist state in Supabase `user_metadata.onboarding`
- Render as a floating card on `/home` (collapsible, not modal)
- Progress ring showing X/4 completed
- Each item links directly to the relevant page
- On all-complete: full-screen confetti + celebratory message, then auto-dismiss

---

## Feature 4: First Evaluation Celebration

### What
When a user completes their very first evaluation, trigger a confetti animation
and a congratulatory toast.

### Why
- Confetti/celebration animations improve activation rates by gamifying progress
- Creates an emotional anchor that this product *works*
- Low effort, high delight

### Library
- `canvas-confetti` (3KB, zero dependencies, works everywhere)
- Trigger on first `usage` transaction detected
- Pair with `sonner` toast: "🎉 Your first verdict! RuleKit evaluated 3 rules in 1.2s"

---

## Feature 5: Smart Empty States

### What
Replace generic empty states with contextual, action-oriented guidance that
pushes users toward the next step.

### Current → Proposed

**Decisions page (0 decisions):**
- Current: "Build your first rule" + buttons
- Proposed: "Your sample decision is ready on the Home page. Try evaluating it first,
  then come back here to create your own." + [Go to Home] primary CTA

**Home page (0 decisions):**
- Current: Decision selector is empty, nothing to do
- Proposed: Never happens if seed decision is created. Fallback: inline "Create your
  first decision to start evaluating" with one-click template creation.

**Tests page (0 tests):**
- Current: Generic empty state
- Proposed: "Tests verify your rules work correctly. Create your first test case with
  sample input and expected output." + [Create test] + show what a passing test looks like

**History page (0 sessions):**
- Current: Generic empty state
- Proposed: "Run your first evaluation on the Home page to see it here." + [Go to Home]

---

## Feature 6: Welcome Modal

### What
A brief, beautiful welcome overlay on first login. Not a wall of text —
a single screen with clear value prop and one CTA.

### Content
```
Welcome to RuleKit 👋

We've set up a sample Loan Eligibility decision with 3 rules
so you can see RuleKit in action right away.

[Start evaluating →]  or  [Take a quick tour]
```

### Behavior
- Shows once, on first login only (tracked in `user_metadata.welcomed`)
- "Start evaluating" → focuses the composer
- "Take a quick tour" → triggers NextStepJS tour
- Dismissible via X or clicking outside
- Loads instantly (client component, no data fetch)

---

## Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **P0** | Seed Decision | Medium | 🔥🔥🔥 Highest — eliminates empty state entirely |
| **P0** | First Evaluation Confetti | Small | 🔥🔥 Emotional anchor at aha! moment |
| **P1** | Welcome Modal | Small | 🔥🔥 Orients user, sets expectations |
| **P1** | Smart Empty States | Small | 🔥🔥 Removes dead ends |
| **P2** | Product Tour (NextStepJS) | Medium | 🔥 Shows full product surface |
| **P2** | Onboarding Checklist | Medium | 🔥 Drives activation beyond first eval |

---

## Packages to Install

```bash
npm install nextstepjs canvas-confetti
npm install -D @types/canvas-confetti
```

---

## User Flow After Implementation

```
Sign up
  → handle_new_user creates credit_balance + subscription
  → Client detects first login (0 decisions)
  → Seed decision created: "Loan Eligibility" + 3 rules
  → Welcome modal appears
  → User clicks "Start evaluating" or "Take tour"
  → Home page: decision pre-selected, composer focused
  → User types scenario (placeholder guides them)
  → Evaluation runs → pass/fail verdict with rule breakdown
  → 🎉 CONFETTI + "Your first verdict!" toast
  → Checklist item 1 checked off
  → User explores: creates own decision, runs tests, deploys
  → Checklist completes → "You're live!" celebration
```

**Time to aha: ~30 seconds**

---

_Created: Feb 9, 2026 — Based on 2025-2026 SaaS onboarding research_
