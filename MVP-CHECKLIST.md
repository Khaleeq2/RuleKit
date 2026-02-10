# RuleKit PMF Rebuild Plan

Living reference and execution checklist for making RuleKit intuitive, frictionless, and clearly valuable for non-technical users first.

Last updated: February 10, 2026
Owner: Product + Design + Engineering
Status: Active

---

## 1) How To Use This Document

- This is the single source of truth for product-direction decisions and execution tracking.
- Every task has a checkbox and acceptance criteria.
- Do not create parallel checklists unless this doc links to them.
- Keep this updated after each meaningful change (code, copy, flow, IA).

### Status Legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Done and validated
- `[!]` Blocked

---

## 2) Product Truth (Non-Negotiable)

RuleKit is a simple decision system for average users:

1. Define what "good" looks like (rules).
2. Submit content or data.
3. Get a clear decision with reasons.
4. Improve and rerun quickly.

If a screen or feature does not help this loop, cut it or defer it.

---

## 3) PMF North Star

### Primary User Promise

"I can check real-world input against my standards in minutes, understand exactly why it passed/failed, and fix issues without technical help."

### Activation Goals

- First useful result: under 3 minutes from signup.
- First independent rerun after a failure: under 2 minutes.
- User understands "what to do next" on every key screen without docs.

### Retention Signal

At least 2 successful check sessions in the first 7 days by new users.

---

## 4) Mental Model Principles (Applied From Research)

Use these principles on every screen and flow:

- Trust over novelty: behavior must be predictable and explainable.
- Progressive disclosure: show only what users need now; advanced controls later.
- Feedback and recovery: every failure must explain what to fix next.
- Human control: users can retry, edit, undo, and choose.
- Accessibility baseline: WCAG 2.2 AA for core flows.

Reference input used: `/Users/khaleeq/Downloads/SaaS UI Excellence in 2026_ Trust, Clarity, and Human Control.docx.md`

---

## 5) Current-State Diagnosis (Breadth + Depth)

## Critical Gaps

- [x] **C1: Promise mismatch on file support**
  - Problem: Marketing claims "any file type," product supports text-like formats only.
  - User impact: feels misleading on first interaction.
  - Evidence: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(marketing)/_components/landing/HeroSectionV2.tsx`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/home/page.tsx`
  - Fix: align copy with actual support or implement real file extraction.

- [x] **C2: Input mode ambiguity (evaluate vs chat)**
  - Problem: one submit path silently switches behavior.
  - User impact: users cannot predict outcomes.
  - Evidence: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/home/page.tsx`
  - Fix: explicit mode selector or clear inline state indicator.

- [ ] **C3: Inconsistent API/auth mental model**
  - Problem: API page suggests bearer API keys, route auth is session-based.
  - User impact: integration failure and trust loss.
  - Evidence: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/[id]/api/page.tsx`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/lib/api-auth.ts`
  - Fix: unify auth model and docs.

- [ ] **C4: High technical language across core journey**
  - Problem: schema/version/deploy/governance terminology appears too early.
  - User impact: intimidation, slower comprehension, lower activation.
  - Evidence: marketing content + rulebook setup flows.
  - Fix: simplify top-level copy; move advanced terms to secondary surfaces.

## Major Gaps

- [ ] **C5: Navigation discoverability issues**
  - Sidebar defaults to icon-only; key actions hidden in "More."
  - Fix: labeled nav by default for new users + clearer primary studio tabs.

- [ ] **C6: Onboarding asks for advanced actions too early**
  - Checklist includes test suite/deploy before first value is stable.
  - Fix: rewrite onboarding into simpler 3-step progression.

- [ ] **C7: Technical error copy leaks environment setup details**
  - Users see `.env`/API key troubleshooting text in product.
  - Fix: split user-facing and developer-facing error language.

- [ ] **C8: Integrations page is a dead-end**
  - Placeholder routing and indirect instructions.
  - Fix: either functional integrations center or remove from nav.

- [ ] **C9: Rulebook IA lacks a simple step-based overview**
  - Immediate redirect to rules and hidden secondary sections.
  - Fix: add guided "Overview" as default entry.

- [ ] **C10: Mobile/density issues in schema and tests**
  - Dense grid layouts are hard for average users.
  - Fix: responsive stacked editors and progressive detail.

## Secondary Gaps

- [ ] **C11: Copy and behavior inconsistencies**
  - Example: submit hint says cmd+enter while enter submits.
  - Fix: align all hints/tooltips with real behavior.

- [ ] **C12: Account deletion wording mismatch**
  - UI implies deletion now; implementation signs out + request semantics.
  - Fix: accurate copy and explicit flow states.

- [ ] **C13: Placeholder social proof and claims need validation**
  - Avoid unverifiable trust signals.
  - Fix: replace with truthful proof or remove.

---

## 6) Product Scope Reset (Keep, Cut, Defer)

## Keep (MVP Core)

- [ ] Rulebooks (create/edit basic rules).
- [ ] Evaluate input and return pass/fail + plain reasons.
- [ ] Session history with rerun/edit loop.
- [ ] Basic billing/credit visibility.

## Cut or Hide Until PMF

- [ ] Hide/defer advanced output modes from first-run flow.
- [ ] Hide/defer deep schema complexity for non-technical users.
- [ ] Hide/defer nonfunctional integrations surfaces.
- [ ] Hide/defer complex deployment/version controls from first-run users.

## Defer (Post-PMF)

- [ ] Rich enterprise governance language and surfaces.
- [ ] Full team/seat complexity in early onboarding.
- [ ] Advanced API abstractions beyond one reliable integration path.

---

## 7) Execution Plan (Phased)

## Phase 0: Truth and Alignment (1-2 days)

- [ ] Replace misleading claims (file types, setup speed, AI certainty) with accurate copy.
- [ ] Decide and document single auth model for API usage.
- [ ] Choose one primary first-run flow and remove alternatives.

### Acceptance Criteria

- [ ] No marketing or in-app copy contradicts implemented behavior.
- [ ] API docs match backend behavior exactly.
- [ ] A new user can explain the product in one sentence after 30 seconds on landing.

## Phase 1: First-Run Simplicity (2-4 days)

- [ ] Redesign onboarding to 3 steps max:
  - [ ] Create/select starter rulebook.
  - [ ] Run first check.
  - [ ] Fix and rerun.
- [ ] Rewrite welcome and checklist copy for non-technical users.
- [ ] Keep nav expanded by default for new users.

### Acceptance Criteria

- [ ] New users reach first result in under 3 minutes.
- [ ] 80% of first-time users can identify next action on Home without help.

## Phase 2: Home and Input Clarity (3-5 days)

- [ ] Add explicit mode state ("Checking input" vs "Asking follow-up").
- [ ] Clarify submit behavior and keyboard hints.
- [ ] Improve failure recovery cards with actionable next steps.
- [ ] Ensure file-upload UI only advertises supported formats.

### Acceptance Criteria

- [ ] Users can predict what submit will do before clicking.
- [ ] Every fail result includes specific "what to change" guidance.

## Phase 3: Rulebook Studio Simplification (4-7 days)

- [ ] Add "Overview" as default tab with guided next actions.
- [ ] Move Schema/Tests/API out of hidden menu into clear tab structure.
- [ ] Offer "simple mode" rule editor first; hide advanced controls.
- [ ] Add responsive layouts for schema/tests editors.

### Acceptance Criteria

- [ ] Non-technical user can create one rule and run one test without docs.
- [ ] Mobile/tablet flows remain usable for core tasks.

## Phase 4: History, Billing, Settings Trust Pass (2-4 days)

- [ ] Simplify terminology in History (sessions/runs and filters).
- [ ] Clarify billing units and value ("what one credit buys").
- [ ] Correct account deletion language to match behavior.
- [ ] Remove dead-end pages or make them functional.

### Acceptance Criteria

- [ ] Users understand what is charged, when, and why.
- [ ] Settings actions have truthful, unambiguous outcomes.

## Phase 5: Accessibility + Quality Hardening (3-5 days)

- [ ] Contrast audit and fixes for all core text/states.
- [ ] Keyboard navigation and focus order audit (auth, home, rulebooks).
- [ ] Add ARIA labels for icon-only controls and truncation cases.
- [ ] Add smoke tests for core user journeys.

### Acceptance Criteria

- [ ] WCAG 2.2 AA compliance on core paths.
- [ ] Zero critical UX regressions on first-run flow after changes.

---

## 8) Detailed Checklists By Surface

## A) Marketing + Landing

- [ ] Headline describes user outcome in plain language.
- [ ] Claims are verifiable in product today.
- [ ] Primary CTA path is frictionless and honest.
- [ ] No technical jargon above the fold.
- [ ] Social proof is real or removed.

## B) Auth + Onboarding

- [ ] Sign-up and sign-in flows are symmetric and simple.
- [ ] First action after auth is obvious and valuable.
- [ ] Welcome modal is short, clear, and skippable.
- [ ] Checklist guides core value, not advanced operations.

## C) Home (Core Value Surface)

- [ ] Input purpose is obvious.
- [ ] Mode/status is always visible.
- [ ] Supported formats are clearly listed and enforced.
- [ ] Failures provide next-step actions.
- [ ] "New check" and "recent sessions" are understandable.

## D) Rulebook Creation

- [ ] Creation flow starts with plain-language choices.
- [ ] Advanced output modes are optional/deferred.
- [ ] Template path gives immediate usable default.

## E) Rules Editing

- [ ] Rule name and requirement are understandable for non-technical users.
- [ ] Rule consequences are explicit ("what fail means").
- [ ] Enable/disable behavior is clear and reversible.

## F) Schema + Tests

- [ ] Simple defaults for users who do not know JSON.
- [ ] JSON entry has examples and validation help.
- [ ] Test results explain expected vs actual clearly.
- [ ] Responsive layout works on smaller screens.

## G) History

- [ ] Terminology is plain and consistent.
- [ ] Filters are understandable and useful.
- [ ] Empty states point to next meaningful action.

## H) Billing

- [ ] Pricing is easy to understand without math.
- [ ] Credit usage language maps to user outcomes.
- [ ] Upgrade/top-up actions are clear and reversible where possible.

## I) Settings

- [ ] Wording matches actual behavior.
- [ ] Destructive actions are explicit and honest.
- [ ] Preferences are explainable and save reliably.

## J) Integrations/API

- [ ] Auth method is consistent between docs and backend.
- [ ] Quickstart works as written.
- [ ] Error handling for integration users is actionable.

---

## 9) Legacy Cleanup Checklist

- [ ] Remove or rewrite pages that are placeholders with no user value.
- [ ] Remove stale copy that reflects old architecture.
- [ ] Consolidate duplicate docs/checklists into this file or link out explicitly.
- [ ] Archive deprecated routes/terms with redirects and clear naming.

---

## 10) Metrics and Validation Plan

## Activation Metrics

- [ ] Time to first successful result.
- [ ] First-session completion rate for first check.
- [ ] First-week return rate (at least one rerun).

## Comprehension Metrics

- [ ] "What should I do next?" support tickets.
- [ ] Drop-off point per onboarding step.
- [ ] Error-state abandonment rate.

## Trust Metrics

- [ ] Retry-after-failure rate.
- [ ] API/setup success rate.
- [ ] Conversion from first fail to successful rerun.

---

## 11) Definition Of Done (MVP Near PMF)

All conditions must be true:

- [ ] First-run user reaches clear value in under 3 minutes.
- [ ] No critical trust-breaking contradictions in copy or behavior.
- [ ] Core loop is usable by non-technical users without documentation.
- [ ] Core surfaces meet accessibility baseline and keyboard operability.
- [ ] Metrics instrumentation exists for activation and drop-off.

---

## 12) Weekly Operating Cadence

Every week:

- [ ] Review this checklist and update statuses.
- [ ] Validate top 3 risks with real user tests.
- [ ] Ship one simplification improvement and one trust improvement.
- [ ] Remove at least one low-value complexity item.

---

## 13) Detailed Engineering Backlog (File-Level)

Use this for sprint execution. Do not mark done unless acceptance criteria pass.

## Sprint 1: Trust and Clarity

- [x] **T1: Fix misleading file claims on marketing**
  - Files: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(marketing)/_components/landing/HeroSectionV2.tsx`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(marketing)/_lib/public-content.ts`
  - Change: Replace "any file type" with truthful supported-format language.
  - Acceptance:
    - [x] Landing claims match actual uploader support.
    - [x] No "any file type" copy remains unless implementation supports it.

- [x] **T2: Align uploader UX with real support**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/home/page.tsx`
  - Change: Make supported formats explicit everywhere in composer/upload affordances.
  - Acceptance:
    - [x] Drag/drop and paperclip hints list same formats.
    - [x] Error message and hint text are consistent.

- [x] **T3: Make input mode explicit**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/home/page.tsx`
  - Change: Add visible mode state so users know when submit evaluates vs chats.
  - Acceptance:
    - [x] Before submit, user can predict behavior.
    - [x] Mode is visible in both empty and active chat states.

- [ ] **T4: Remove technical setup language from user-facing errors**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/home/page.tsx`
  - Change: Replace `.env`/API-key operational text with user-safe recovery messaging.
  - Acceptance:
    - [ ] No environment-variable references in end-user toast/message copy.
    - [ ] Errors provide a clear next step.

- [ ] **T5: Match keyboard submit hint to real behavior**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/home/page.tsx`
  - Change: Either implement cmd+enter behavior or update tooltip to Enter.
  - Acceptance:
    - [ ] Tooltip/help text is accurate.
    - [ ] Keyboard behavior is consistent and tested.

- [ ] **T6: Make sidebar discoverable for first-run users**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/components/AppLayout.tsx`
  - Change: Expand nav by default for new users or until onboarding complete.
  - Acceptance:
    - [ ] New users see labeled navigation without hover dependency.
    - [ ] Existing users can still collapse nav.

- [ ] **T7: Simplify onboarding checklist**
  - Files: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/lib/onboarding.ts`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/components/OnboardingChecklist.tsx`
  - Change: Replace advanced tasks with beginner tasks focused on first value.
  - Acceptance:
    - [ ] Checklist max 3-4 simple items.
    - [ ] First two items are achievable without technical skills.

## Sprint 2: Flow and IA Simplification

- [ ] **T8: Add Rulebook Overview as default entry**
  - Files: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/[id]/page.tsx`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/[id]/layout.tsx`
  - Change: Replace redirect-first pattern with guided overview screen.
  - Acceptance:
    - [ ] User sees "what this rulebook does" and next actions first.
    - [ ] Rules/schema/tests/api are clearly discoverable.

- [ ] **T9: Promote key rulebook surfaces out of hidden menu**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/[id]/layout.tsx`
  - Change: Add visible tab navigation for Overview/Rules/Schema/Tests/API.
  - Acceptance:
    - [ ] Core tabs are visible without opening dropdown.
    - [ ] Mobile has an accessible alternate nav pattern.

- [ ] **T10: Reduce advanced output-type complexity at creation**
  - Files: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/new/page.tsx`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/lib/types.ts`
  - Change: Default to pass/fail; hide advanced output options behind "Advanced."
  - Acceptance:
    - [ ] Default creation path uses one simple outcome model.
    - [ ] Advanced modes still available but not blocking first-run.

- [ ] **T11: Simplify schema editor for non-technical users**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/[id]/schema/page.tsx`
  - Change: Improve responsive behavior and simplify first-run field setup.
  - Acceptance:
    - [ ] Editor remains usable on smaller screens.
    - [ ] User can add one field without needing JSON knowledge.

- [ ] **T12: Simplify tests editor copy and expected input guidance**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/[id]/tests/page.tsx`
  - Change: Add plain-language examples and reduce jargon.
  - Acceptance:
    - [ ] User can create and run one test with built-in guidance.
    - [ ] Expected vs actual output is visually obvious.

- [ ] **T13: Rework dead-end integrations experience**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/integrations/page.tsx`
  - Change: Either provide functional setup flow or remove/de-emphasize route.
  - Acceptance:
    - [ ] No dead-end placeholder experience remains on primary nav routes.

- [ ] **T14: Make API docs match backend auth behavior**
  - Files: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/rulebooks/[id]/api/page.tsx`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/lib/api-auth.ts`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/api/evaluate/route.ts`
  - Change: Align docs and implementation on one authentication mechanism.
  - Acceptance:
    - [ ] Quickstart request succeeds when followed exactly.
    - [ ] No contradictory auth instructions exist.

## Sprint 3: Trust, Accessibility, and Reliability

- [ ] **T15: History terminology and filter simplification**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/history/page.tsx`
  - Change: Reduce jargon and improve scanability for average users.
  - Acceptance:
    - [ ] Users can identify what each row represents without docs.
    - [ ] Empty states point clearly to next action.

- [ ] **T16: Billing explanation clarity pass**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/billing/page.tsx`
  - Change: Explain credits in task/outcome terms, not internal terminology.
  - Acceptance:
    - [ ] User can answer "what does one credit get me?" from the page alone.

- [ ] **T17: Settings truthfulness pass (delete account flow)**
  - File: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/src/app/(app)/settings/page.tsx`
  - Change: Update destructive action language to match actual behavior.
  - Acceptance:
    - [ ] No wording implies immediate deletion when behavior is request-based/sign-out.

- [ ] **T18: Accessibility pass on core journeys**
  - Files: Home/Auth/Rulebooks/History/Billing/Settings surfaces
  - Change: Contrast, focus order, keyboard operation, aria-label updates.
  - Acceptance:
    - [ ] WCAG 2.2 AA checks pass for core path components.
    - [ ] Keyboard-only completion is possible for first-run flow.

- [ ] **T19: Add smoke tests for critical user path**
  - Scope: sign up/sign in -> first check -> fail guidance -> rerun -> history.
  - Acceptance:
    - [ ] A repeatable automated smoke suite exists and passes.
    - [ ] Core path regressions are caught before release.

- [ ] **T20: Remove duplicate planning docs or link them to this master**
  - Files: `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/TODO.md`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/ONBOARDING-PLAN.md`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/DESIGN-AUDIT.md`, `/Users/khaleeq/Documents/projects/RuleKit/rulekit-v0.2/MVP.md`
  - Change: avoid checklist fragmentation.
  - Acceptance:
    - [ ] This file is the active master.
    - [ ] Other docs are archived or explicitly linked as reference-only.

---

## 14) Task Execution Contract (Failure-Proof)

This section is the handoff contract for executing `T#` tasks in this document. Follow this protocol for reliable delivery.

## A) Non-Negotiable Operating Rules

- [ ] Do not start coding before preflight passes.
- [ ] Do not mark a task done without evidence artifacts.
- [ ] Do not batch unrelated tasks into one change set.
- [ ] Do not change product behavior without updating relevant copy/docs in the same task.
- [ ] Do not proceed on assumptions; validate first and record findings.

## B) Required Preflight (Before Any T#)

Run these checks and store outputs in the task report:

1. Repository state
  - Command: `git status --short`
  - Success: known baseline recorded.
  - Failure: unknown destructive state or missing repo context.

2. Scope confirmation
  - Use: `read_file`, `grep_search`, `find_by_name`
  - Success: exact files and call sites mapped for the target task.
  - Failure: ambiguous ownership of behavior/copy.

3. Build/test baseline
  - Commands (as available): `npm run build`, `npm run lint`, test/smoke command
  - Success: baseline pass/fail known before edits.
  - Failure: no baseline means no reliable regression detection.

4. Runtime baseline for UI tasks
  - Commands: `npm run dev` + `browser_preview` or MCP browser tools
  - Success: current behavior captured (screenshot/snapshot/notes).
  - Failure: cannot verify behavior changes visually.

If any preflight item fails, set task status to `[!] Blocked` with reason and stop.

## C) Task Execution Unit (Apply To Every T#)

For each task, create an execution packet with this exact structure:

1. `Objective`
  - One sentence: what user-visible outcome will change.

2. `Assumptions`
  - List assumptions and validate each with file/command evidence.
  - Any unvalidated assumption blocks implementation.

3. `Change Plan`
  - Ordered list of file edits.
  - Expected side effects and dependent surfaces.

4. `Implementation`
  - Use smallest possible edits:
    - discovery: `grep_search`/`read_file`
    - exact patch: `edit`/`multi_edit`
    - new files only when required: `write_to_file`

5. `Validation Gates`
  - Gate 1: static checks (lint/type/build).
  - Gate 2: targeted functional check (command or API call).
  - Gate 3: UX verification in browser (for UI tasks).
  - Gate 4: regression check of adjacent flows.

6. `Success/Failure Signals`
  - Explicit pass criteria (from task acceptance list).
  - Explicit failure criteria (what indicates rollback/rework).

7. `Artifacts`
  - `git diff` summary
  - command outputs (build/test)
  - screenshots/snapshots for UI changes
  - updated checklist status in this document

## D) Tooling Strategy (Optimize For Reliable Execution)

Use tools in this order for reliability:

1. Discovery and dependency mapping
  - `grep_search` -> `read_file` -> `find_by_name` -> `code_search`

2. Precise modifications
  - prefer `edit` for single substitutions
  - use `multi_edit` for grouped changes in one file
  - avoid broad blind replace operations

3. Verification
  - `run_command` for build/lint/tests
  - `browser_preview` or MCP browser tools for user-flow verification
  - `command_status` for background process checks

4. Research only when blocked
  - `mcp0_get_code_context_exa` / `search_web` / `mcp3_perplexity_ask`
  - capture source rationale in task notes

## E) Validation Matrix (Must Pass)

For each task type, required verification:

- Copy-only task
  - [ ] grep confirms old copy removed.
  - [ ] UI view confirms new copy appears in correct surface.

- Logic task
  - [ ] unit/integration path passes.
  - [ ] no type/build regression.
  - [ ] edge behavior tested with at least 2 negative cases.

- UI behavior task
  - [ ] visual before/after captured.
  - [ ] keyboard interaction verified.
  - [ ] responsive check at 3 widths (mobile/tablet/desktop).

- API/auth task
  - [ ] success case verified.
  - [ ] unauthorized/invalid case verified.
  - [ ] docs/quickstart updated to match behavior.

## F) Edge-Case Checklist (Run Before Marking Done)

- [ ] Empty state behavior still makes sense.
- [ ] Error state behavior is actionable and non-technical.
- [ ] Existing sessions/history remain readable.
- [ ] Navigation labels and routes remain coherent.
- [ ] Accessibility basics preserved: focus, contrast, aria labels.
- [ ] No contradictory language between marketing and product.

## G) Rollback and Safety Protocol

Trigger rollback/rework if any of these occur:

- Build breaks and cannot be fixed within task scope.
- Adjacent critical flow regresses (auth, first check, rerun, history).
- Acceptance criteria conflict with observed behavior.
- Docs and implementation diverge after change.

Rollback steps:

1. Revert only files touched by the task.
2. Re-run baseline checks.
3. Re-scope into smaller subtask with clearer assumptions.
4. Resume via new execution packet.

## H) Completion Contract (Definition Of Executed)

A task is only executable-complete when all are true:

- [ ] Task acceptance criteria boxes are checked with evidence.
- [ ] Validation gates passed and recorded.
- [ ] This checklist status updated (`[ ]`, `[-]`, `[x]`, `[!]`).
- [ ] No unresolved contradictions between code, copy, and behavior.
- [ ] Handoff note produced: what changed, what was validated, what remains.

---

## 15) Changelog (Keep This Current)

### 2026-02-10

- [x] Replaced fragmented MVP checklist with unified PMF rebuild reference.
- [x] Added full concern register, scope reset, phased plan, and acceptance criteria.
- [x] Incorporated trust/clarity/control framework from the attached SaaS UI excellence document.
- [x] Added Task Execution Contract with preflight, validation gates, edge-case checks, rollback, and verifiable completion criteria.
