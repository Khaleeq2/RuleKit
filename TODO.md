# RuleKit — Conversational Rules Engine

> Evolve Home page from mock submission → real AI-powered evaluation via Groq Cloud API.

---

## Phase 1: Groq Integration & Evaluation Engine

- [x] **[AI]** Create `src/app/lib/evaluation-types.ts` — types for evaluation results, evidence spans, model metadata
- [x] **[AI]** Create `src/app/lib/groq-client.ts` — fetch-based Groq API wrapper (OpenAI-compatible)
- [x] **[AI]** Create `src/app/lib/evaluation-retry.ts` — retry with exponential backoff (ported from Assurium)
- [x] **[AI]** Create `src/app/lib/groq-evaluator.ts` — prompt building, Groq call, JSON validation, result normalization
- [x] **[AI]** Create `src/app/api/evaluate/route.ts` — POST endpoint accepting input + rules, returns structured result
- [x] **[AI]** Wire `src/app/home/page.tsx` — replace `simulateExecution` mock with real `/api/evaluate` call
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

---

_This list is a living document. Adapt as needed — the goal is the outcome, not the checklist._
