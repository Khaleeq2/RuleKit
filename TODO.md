> **⚠️ ARCHIVED** — This document is historical. The active task tracker is [`MVP-CHECKLIST.md`](./MVP-CHECKLIST.md).

# RuleKit — Conversational Rules Engine

> Evolve Home page from mock submission → real AI-powered evaluation via Groq Cloud API.

---

## Phase 1: Groq Integration & Evaluation Engine

- [x] **[AI]** Create `src/app/lib/evaluation-types.ts` — types for evaluation results, evidence spans, model metadata
- [x] **[AI]** Create `src/app/lib/groq-client.ts` — fetch-based Groq API wrapper (OpenAI-compatible)
- [x] **[AI]** Create `src/app/lib/evaluation-retry.ts` — retry with exponential backoff (ported from Assurium)
- [x] **[AI]** Create `src/app/lib/groq-evaluator.ts` — prompt building, Groq call, JSON validation, result normalization
- [x] **[AI]** Create `src/app/api/evaluate/route.ts` — POST endpoint accepting input + rules, returns structured result
- [x] **[AI]** Wire `src/app/(app)/home/page.tsx` — replace `simulateExecution` mock with real `/api/evaluate` call
- [x] **[AI]** Create `.env.local.example` with `GROQ_API_KEY` placeholder
- [ ] **[HUMAN]** Add your Groq API key to `.env.local` → `GROQ_API_KEY=gsk_...`

## Phase 2: Rich Result Components

- [x] **[AI]** Build `RuleResultCard` component — verdict, per-rule breakdown, latency, tokens, cost
- [x] **[AI]** Build `RuleCheckRow` component — individual rule with status, confidence, expandable evidence
- [x] **[AI]** Replace ResizablePanel side-panel with inline result cards in the message thread
- [x] **[AI]** Add skeleton loading state matching result card dimensions

## Phase 3: Conversational Follow-Up

- [x] **[AI]** Create `POST /api/chat` route — SSE streaming for follow-up conversation
- [x] **[AI]** Build intent classification (evaluate / explain / modify / compare)
- [x] **[AI]** Implement "explain" — stream natural language explanation of rule results
- [ ] **[AI]** Implement "what-if" — produce modified input diff → re-evaluate on confirmation
- [ ] **[AI]** Build `ComparisonCard` component — side-by-side before/after results

## Phase 4: Session Persistence & History

- [x] **[AI]** Define `Session` type and localStorage persistence
- [x] **[AI]** Update History page to list sessions (tab toggle: Sessions | Runs)
- [x] **[AI]** Click session → reopen conversation thread (reconstruct Message[] from SessionMessage[])
- [x] **[AI]** "New check" button in chat view to start fresh session

## Phase 5: Markdown & Polish

- [x] **[AI]** Add `react-markdown` + `remark-gfm` for AI response rendering
- [x] **[AI]** Build `MarkdownContent` component — styled headings, lists, bold, italic, code blocks, tables, blockquotes, copy button
- [x] **[AI]** Wire into Home page system messages
- [x] **[AI]** Fix message ID collision (`Date.now()` → `crypto.randomUUID()`)
- [x] **[AI]** Add `busyLockRef` to prevent double-fire on Enter key

## Phase 6: Level Up — Home & History

- [x] **[AI]** Suggested prompt chips on Home empty state (contextual to selected ruleset)
- [x] **[AI]** Recent sessions cards on Home empty state (last 3, click to reload)
- [x] **[AI]** Extract `loadSessionById()` — shared by URL param and recent session cards
- [x] **[AI]** Tab-aware stats on History page (session stats vs run stats)
- [x] **[AI]** Richer session rows on History (verdict badge + reason snippet)
- [x] **[AI]** `startNewSession` refreshes recent sessions list

## Phase 7: Design Audit — 2026 SaaS UI Excellence

> See `DESIGN-AUDIT.md` for full analysis, root causes, and regression risk per concern.

### 7a. Error Recovery & Empathy (HIGH)
- [x] **[AI]** Enhance evaluator prompt to include `suggestion` field for failures
- [x] **[AI]** Add "What to try" recovery section to RuleResultCard (fail verdict only)
- [x] **[AI]** Auto-insert recovery prompt chip after all-fail evaluations

### 7b. Process Transparency (HIGH)
- [x] **[AI]** Update Home subtitle to mention AI evaluation
- [x] **[AI]** Add phased labels to EvaluationSkeleton ("Reading input..." → "Checking rules..." → "Generating verdict...")
- [x] **[AI]** Add "AI-assessed" label to RuleResultCard footer
- [x] **[AI]** Amber confidence indicator when rule confidence < 0.7

### 7c. Empty State Onboarding (HIGH)
- [x] **[AI]** Add process hint line below Home subtitle ("Submit → AI checks rules → Review & ask questions")

### 7d. Accessibility (HIGH)
- [x] **[AI]** Fix contrast: replace `/60` and `/40` opacity modifiers on muted text
- [x] **[AI]** Focus management: move focus to composer after `loadSessionById()`
- [x] **[AI]** Add `focus-visible:ring` to prompt chips and recent session cards
- [x] **[AI]** Add `aria-label` to truncated prompt chips and verdict icons
- [x] **[AI]** Add `role="tablist"` / `aria-current` to Decide/Rules toggle

### 7e. Dead Surface Cleanup (MEDIUM)
- [x] **[AI]** Add `cursor-default` + `aria-current="page"` to Decide button
- [x] ~~Mystery icons~~ — confirmed as browser extension overlays, not our code

### 7f. Design Token Consistency (DEFERRED)
- [ ] **[FUTURE]** Unify Tailwind utilities vs CSS custom property usage across pages
- [ ] **[FUTURE]** Document styling standard and apply in a dedicated refactor pass

## Phase 8: Session Intelligence & Iteration

### 8a. AI-Generated Session Titles
- [x] **[AI]** `/api/title` route — Groq-powered 3-5 word title generation
- [x] **[AI]** `sessionsRepo.updateTitle()` method for async title updates
- [x] **[AI]** Background title generation fires after first evaluation, with template fallback
- [x] **[AI]** `titleGeneratedRef` prevents duplicate API calls per session

### 8b. What-If Re-Evaluation Flow
- [x] **[AI]** "Try with different input" button on failed RuleResultCards
- [x] **[AI]** `onRetry` callback pre-fills composer with previous input and focuses it
- [x] **[AI]** `forceEvaluateRef` bypasses chat routing for retry submissions
- [x] **[AI]** Re-evaluation runs within the same session thread

### 8c. ComparisonCard
- [x] **[AI]** `ComparisonCard` component — rule-by-rule diff between evaluations
- [x] **[AI]** Delta indicators: improved (green ↗), regressed (red ↘), unchanged (grey –)
- [x] **[AI]** Verdict badges (Fail → Pass) with confidence delta percentages
- [x] **[AI]** Auto-renders after second evaluation in session thread

## Phase 9: Non-In-App Public Site Foundation

> See `docs/PUBLIC_SITE_STRATEGY.md` for current-state assessment, target schema, and migration rationale.

### 9a. Route Architecture (HIGH)
- [x] **[AI]** Introduce route groups: `src/app/(marketing)` and `src/app/(app)`
- [x] **[AI]** Move existing in-app routes into `(app)` group without URL changes (`/home`, `/decisions`, `/history`, `/billing`, `/settings`, `/dashboard`)
- [x] **[AI]** Replace root redirect behavior with a real marketing landing page at `/`
- [x] **[AI]** Create dedicated marketing layout (public nav/footer) separate from app shell

### 9b. Public IA Scaffold (HIGH)
- [x] **[AI]** Scaffold public top-level sections:
  - `/product/*`
  - `/solutions/*`
  - `/pricing/*`
  - `/developers/*`
  - `/resources/*`
  - `/company/*`
  - `/legal/*`
- [x] **[AI]** Add minimal content templates and consistent CTA patterns across all public pages

### 9c. Auth URL Normalization (MEDIUM)
- [x] **[AI]** Add `/auth/sign-in` and `/auth/sign-up`
- [x] **[AI]** Keep `/login` and `/signup` as compatibility redirects during migration
- [x] **[AI]** Update all internal links to prefer `/auth/*`

### 9d. Public-Site Ops Essentials (HIGH)
- [x] **[AI]** Add custom `not-found` page for public-site quality
- [x] **[AI]** Add `/maintenance` page and toggle mechanism
- [x] **[AI]** Add sitemap + robots + baseline per-page metadata

## Phase 10: Route Hygiene, Content, and Launch Readiness

### 10a. Broken Link Cleanup (HIGH)
- [x] **[AI]** Resolve `/integrations` link target used by decision API page (implement route or change CTA)
- [x] **[AI]** Resolve `/runs` link target used by decision runs page (implement route or change CTA)

### 10b. Public Content Completion (MEDIUM)
- [x] **[AI]** Fill core conversion pages first:
  - `/product/overview`
  - `/pricing/plans`
  - `/developers/quickstart`
  - `/legal/terms`
  - `/legal/privacy`
  - `/legal/security`
- [x] **[AI]** Publish solution pages aligned with current app capabilities:
  - loan eligibility
  - fraud screening
  - support routing
  - content moderation

### 10c. Final Readiness (MEDIUM)
- [x] **[AI]** Verify nav and CTA paths between marketing and app entry points
- [x] **[AI]** Validate canonical URLs and metadata coverage for all public pages
- [x] **[AI]** Run a full route check for 404-free primary user journeys

## Phase 11: Production Readiness & Polish

### 11a. Supabase Migration (DONE)
- [x] **[AI]** Create manual `database.types.ts` from migration SQL (all 11 tables)
- [x] **[AI]** Migrate `versions.ts` from localStorage → Supabase
- [x] **[AI]** Migrate `tests.ts` from localStorage → Supabase
- [ ] **[FUTURE]** Replace manual types with `supabase gen types` when DB access available

### 11b. Auth Polish (DONE)
- [x] **[AI]** Consistent logo, typography, spacing across all 4 auth pages
- [x] **[AI]** Google OAuth button on sign-in and sign-up
- [x] **[AI]** OAuth callback route (`/auth/callback`)
- [ ] **[HUMAN]** Configure Google Cloud OAuth credentials + Supabase provider

### 11c. Marketing Sub-Pages (TODO — not blockers)
These sub-pages still use `PublicPageTemplate` with placeholder content and an "under development" notice:
- [ ] `/product/how-it-works`
- [ ] `/product/decision-studio`
- [ ] `/solutions/loan-eligibility`
- [ ] `/solutions/fraud-screening`
- [ ] `/solutions/routing`
- [ ] `/solutions/content-moderation`
- [ ] `/developers/api-reference`
- [ ] `/resources/changelog`
- [ ] `/resources/blog`
- [ ] `/company/careers`
- [ ] `/company/contact`

### 11d. File Upload & Attachments (TODO)
- [ ] **[AI]** Drag-and-drop file upload in chat area
- [ ] **[AI]** Content-type detection and preview
- [ ] **[AI]** Supabase Storage bucket for user uploads

### 11e. Design Token Unification (DEFERRED)
- [ ] **[FUTURE]** Unify Tailwind utilities vs CSS custom property usage

---

_This list is a living document. Adapt as needed — the goal is the outcome, not the checklist._
