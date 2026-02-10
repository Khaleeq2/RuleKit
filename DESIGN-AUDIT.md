> **⚠️ ARCHIVED** — This audit informed the task list in [`MVP-CHECKLIST.md`](./MVP-CHECKLIST.md), which is the active master.

# RuleKit Design Audit — 2026 SaaS UI Excellence

Assessment against the 2026 SaaS UI excellence philosophy. Current alignment: ~60%.

---

## Scorecard

| Principle | Score | Gap |
|-----------|-------|-----|
| Clear hierarchy | ✅ Strong | — |
| Progressive disclosure | ⚠️ Partial | RuleResultCard does it; empty state doesn't |
| Immediate feedback | ✅ Strong | Streaming, skeletons, animations |
| Transparency / show work | ⚠️ Partial | Rule breakdown exists, but process is opaque |
| Error recovery | ❌ Weak | Errors report failure, don't guide success |
| Accessibility | ⚠️ Unknown | Focus management, contrast, aria gaps |
| Design tokens / systematic | ⚠️ Inconsistent | Two styling systems coexist |
| Empty state as onboarding | ⚠️ Partial | Prompts help, no mental model building |
| Every pixel earns its place | ⚠️ Mostly | Minor dead surfaces |

---

## Concern 1: Error Recovery & Empathy

### Problem
Failure messages are clinical: "All rules fail due to insufficient information in the input." This tells users they failed without helping them succeed. Every session in History shows `Fail` with no path forward.

### Root Cause
The evaluator system prompt (`groq-evaluator.ts:38`) instructs: "If the input is ambiguous or insufficient, FAIL the rule and explain why." The explanations are technically correct but not actionable. The `absence_proof` data exists in the response but is buried behind an expand click in `RuleCheckRow`.

### Resolution
1. **Evaluator prompt enhancement** — Add a `suggestion` field to the prompt output requiring the AI to state what specific data would fix the failure. This enriches the response without changing pass/fail logic.
2. **RuleResultCard "What to try" section** — When verdict is `fail`, surface a compact recovery block below the reason: specific missing data fields derived from `absence_proof` across all failed rules.
3. **Proactive recovery prompt** — After an all-fail evaluation, auto-insert a subtle suggestion chip: "Ask: What data do I need to pass?" This leverages the existing chat follow-up system.

### Regression Risk
- **Prompt change**: Only adds an optional `suggestion` field to the output schema. Existing fields unchanged. Parse with fallback for missing field.
- **RuleResultCard**: Additive section. Only renders when verdict is `fail`. Pass results unchanged.
- **Recovery prompt**: Additive UI below the RuleResultCard. No state changes.

---

## Concern 2: Process Transparency

### Problem
Users don't know AI is involved, what it does, or that results are probabilistic. The subtitle says "Submit text, documents, or files to be reviewed against your rules" — no mention of AI. The confidence percentage (50%, 80%) is shown but unexplained. The EvaluationSkeleton is a generic pulse animation with no process indication.

### Root Cause
The product treats AI as invisible infrastructure rather than a transparent collaborator. This is exactly what the philosophy warns against: "AI fatigue demands we show our work, explain uncertainty, and never force automation."

### Resolution
1. **Subtitle update** — Change to: "AI evaluates your input against each rule and explains its reasoning." One-line change, zero risk.
2. **EvaluationSkeleton phases** — Replace the generic skeleton with timed phase labels: "Reading input..." (0-1s) → "Checking rules..." (1-3s) → "Generating verdict..." (3s+). These are approximate (we can't track Groq's internal state) but they communicate that work is happening. Implementation: 3-step array with `useEffect` + `setTimeout` cycling through labels.
3. **"AI-assessed" label** — Add to the RuleResultCard footer alongside latency/tokens: a subtle `Cpu` icon + "AI-assessed" text. Normalizes AI involvement.
4. **Confidence explanation** — When any rule's confidence is below 0.7, show an amber indicator with tooltip: "AI confidence is lower here — consider providing more specific data." Above 0.7, keep the current green/neutral display.

### Regression Risk
- **Subtitle**: Copy change only.
- **Skeleton phases**: Self-contained in `EvaluationSkeleton` component. Existing behavior (animate in, show skeleton, disappear on result) unchanged. Only the visual content of the skeleton changes.
- **AI-assessed label**: Additive to RuleResultCard footer. No layout shift (uses existing flex gap).
- **Confidence indicator**: Additive styling change to the existing confidence display in `RuleCheckRow`. No data changes.

---

## Concern 3: Empty State as True Onboarding

### Problem
The empty state doesn't build a mental model. Users don't know what happens after they submit. The evaluate → review → iterate loop is invisible.

### Root Cause
The empty state was designed as a minimal "get out of the way" input surface. This works for returning users but abandons new users.

### Resolution
1. **Process hint below subtitle** — A single compact line: "Submit your data → AI checks each rule → Review the verdict and ask follow-up questions." Styled as muted meta text, below the existing subtitle. Not a tutorial, not a card — just orientation text that disappears from attention after the first visit.
2. **Prompt chips already serve as input examples** — No additional change needed. They teach format by example.
3. **Recent sessions already show outcomes** — Users with history see past verdicts. New users without history see only the prompts and process hint, which is the correct progressive disclosure.

### Regression Risk
- **Process hint**: One line of text. No state, no interactivity. Purely additive.

---

## Concern 4: Accessibility

### Problem
Unverified: keyboard nav, focus management, aria labels, color contrast.

### Specific Gaps Identified

**Color Contrast:**
- `--muted-foreground: #6f6f78` on `--background: #fcfcfd` ≈ 5.0:1 ratio — **passes** WCAG AA for normal text.
- But `text-[var(--muted-foreground)]/60` (60% opacity) on white ≈ 2.8:1 — **fails** WCAG AA. Used in: keyboard hint text, recent session timestamps, chevron icons.
- `text-[var(--muted-foreground)]/40` — even worse, ≈ 1.8:1. Used in: "to submit" text.

**Focus Management:**
- `loadSessionById()` sets state but doesn't move focus. After loading a session, focus is stranded wherever it was (the clicked button). It should move to the bottom composer.
- Prompt chips and recent session cards are `<button>` elements (keyboard-accessible), but lack `focus-visible:ring` classes.

**ARIA:**
- Prompt chips with `truncate` class hide content visually. No `aria-label` with the full text.
- Recent session verdict icons have no `aria-label` (screen readers see nothing).
- The pill toggle (Decide/Rules) doesn't use `aria-current` or role="tablist".

### Resolution
1. **Contrast fix**: Replace all `/60` and `/40` opacity modifiers on muted text with either full opacity `--muted-foreground` (for readable text) or a dedicated `--muted-foreground-subtle` token that still meets 4.5:1.
2. **Focus after session load**: In `loadSessionById()`, after setting state, use `setTimeout(() => textareaRef.current?.focus(), 100)` to move focus to the composer.
3. **Focus rings**: Add `focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 focus-visible:ring-offset-1` to prompt chips and recent session cards.
4. **ARIA labels**: Add `aria-label={prompt}` to truncated prompt chips. Add `aria-label` to verdict icons in recent sessions (e.g., "Failed evaluation"). Add `role="tablist"` to pill toggle and `aria-current="page"` to Decide button.

### Regression Risk
- **Contrast**: Visual change — muted text becomes slightly more visible. This is intentional and correct. Review dark mode equivalents.
- **Focus management**: Behavioral change, but only after session load. Non-disruptive.
- **ARIA/focus rings**: Invisible to sighted users (focus-visible only triggers on keyboard nav).

---

## Concern 5: Design Token Consistency

### Problem
Home page uses Tailwind utilities (`text-xs`, `text-sm`, `text-4xl`). History page uses design tokens (`text-[length:var(--font-size-body-sm)]`). Same product, two systems.

### Root Cause
Different pages were built at different times with different conventions. No documented standard was enforced.

### Resolution
**NOT a Tier 1 concern.** Document the standard, apply incrementally.

**Standard decision:** Use design tokens from `globals.css` as the source of truth for semantic values (colors, shadows, spacing, radii). Use Tailwind utilities for layout/positioning (`flex`, `gap-2`, `px-4`). For typography, prefer the token-based approach for key text elements (headings, body) and allow Tailwind utilities for small/meta text where tokens add verbosity without value.

This is a refactoring pass that should be done in a dedicated session with visual regression testing, not mixed into feature work.

### Regression Risk
High if done carelessly. Must be a dedicated pass with before/after screenshots. Not blocking any user-facing value.

---

## Concern 6: Dead Surface Cleanup

### Problem
1. Two unexplained icons (blue circle + green smiley) visible in the input area in screenshots.
2. The "Decide" button in the pill toggle is always active and clicking it does nothing.

### Analysis
1. **Mystery icons**: After reviewing the SuperInput code, these are NOT in our codebase. They are browser extension overlays (likely 1Password/Grammarly/emoji picker). **Not our problem.** Dismiss.
2. **Decide button**: It's the active state indicator in the Decide/Rules toggle. It's styled as selected (`bg-[var(--brand)] text-white`) and is technically correct — it shows the current mode. But it lacks semantic signaling.

### Resolution
1. **Dismiss** the mystery icons concern.
2. **Decide button**: Add `aria-current="page"` and `cursor-default` class. Add `role="tablist"` to the container and `role="tab"` to both buttons. Minimal change, correct semantics.

### Regression Risk
None. ARIA attributes are invisible. `cursor-default` is a visual hint only.

---

## Implementation Order

| Priority | Concern | Effort | Files |
|----------|---------|--------|-------|
| 1 | Error recovery (prompt + RuleResultCard + recovery chip) | Medium | `groq-evaluator.ts`, `RuleResultCard.tsx`, `home/page.tsx` |
| 2 | Process transparency (subtitle + skeleton + AI label + confidence) | Low | `home/page.tsx`, `RuleResultCard.tsx` |
| 3 | Empty state onboarding (process hint line) | Trivial | `home/page.tsx` |
| 4 | Accessibility (contrast + focus + ARIA) | Low-Medium | `globals.css`, `home/page.tsx`, `history/page.tsx` |
| 5 | Dead surface cleanup (Decide button semantics) | Trivial | `home/page.tsx` |
| 6 | Design token consistency | Medium | All pages (dedicated pass) |

Concerns 1-5 can be implemented without touching each other's code paths. Concern 6 is deferred.
