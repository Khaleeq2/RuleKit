> **⚠️ ARCHIVED** — This spec has been superseded by [`MVP-CHECKLIST.md`](./MVP-CHECKLIST.md), which is the active master.

## RuleKit MVP — Product + UI/UX Spec (2026 Pattern)

### Product truth (do not deviate)
RuleKit is a **self-serve rules engine**: users define **decisions** (rules + schema), **test** them, **make them live**, and **review** runs.

**Core loop:** Define → Test → Use → Review  
**North star:** user gets a **first working decision** in **< 60 seconds** (template + sample test).

**Target users:** Builders, operators, small teams *before* enterprise procurement. People who try things alone, immediately, with a credit card.

---

## 1) Information Architecture (left nav)
Keep top-level nouns sparse and stable.

1. **Home**
2. **Decisions**
3. **History**
4. **Billing**
5. **Settings**

> No “analytics dashboard” as the product. Metrics are supporting context.

---

## 2) 2026 Consistency Pattern (copy this pattern, not the apps)
Every modern app you referenced shares:
- **One dominant starting surface** (command/search/prompt bar)
- **Quick action chips** under it
- **Templates/starters**
- **Stable left nav**
- **Roomy spacing + soft borders**
- **Right rail for ambient info**
- **Recent activity visible**
- **Progressive disclosure** for advanced controls

RuleKit must implement this pattern as **Decision Command Center**.

---

## 3) Home (first login + daily home) — “Decision Command Center”
### Primary purpose
A single calm page that helps users:
- Start a new decision
- Find an existing decision
- Triage failures
- Run a test quickly
- Get API snippet fast

### Layout
**A) Top: Command Bar (the anchor)**
- Title: “What decision do you want to standardize?”
- Input supports:
  - “Create decision: <name>”
  - “Find: <decision name>”
  - “Test: <decision>”
  - “Show failures”
  - “Get API snippet”
- Keyboard: `/` focuses, `⌘K` opens command palette variant (optional MVP)

**B) Under: Quick action chips**
- Create decision
- Browse templates
- Test with sample JSON
- View failures
- Get API snippet

**C) Main content (two sections)**
1) **Your Decisions** (table/list)
   - Name
   - Status (Draft / Published)
   - Active Env (Dev/Prod)
   - Last Deploy
   - Failures (24h)
   - Last Run
   - CTA: “Open”
2) **Needs Attention**
   - Failed runs (count)
   - Recently changed decisions (audit highlights)
   - “Drift/Regression” placeholder (optional later)

**D) Right rail (ambient)**
- Credits balance (quiet)
- Recent activity (last 10 events)
- Changelog / “What’s new”
- Next step checklist (only if user has <1 published decision)

### Empty states (non-negotiable)
If new user:
- Show “Create your first decision” card
- Show 3 templates
- Show sample test CTA
- Hide most metrics (don’t show zeros everywhere)

---

## 4) Decisions
### 4.1 Decisions List
- Search + filter (Draft/Published, Env, Owner)
- CTA: **New Decision**
- Secondary: Templates

### 4.2 New Decision Flow (fast)
Modal or page with:
- Decision name
- “Start from template” toggle
- Choose outcome type (MVP: Pass/Fail + optional Reason)
- Create → immediately lands in Decision Studio with starter schema + example tests if template chosen

---

## 5) Decision Studio (the core product surface)
This is the “GitHub + Postman” feel: serious, versioned, testable.

### 5.1 Studio header (always visible)
- Decision name + status pill
- Active version (e.g., v12) + “Version history”
- Environment selector (Dev / Staging / Prod)
- Primary CTA: **Run test**
- Secondary CTA: **Publish**
- Inline: **Credits estimate** (see Billing rules below)

### 5.2 Studio tabs
1) **Overview**
2) **Schema**
3) **Rules**
4) **Tests**
5) **Deploy**
6) **Runs**
7) **API**

---

### Tab: Overview
Purpose: show state, health, and next action.
- “What this decision does” (editable description)
- Health cards:
  - Failures (24h)
  - Last deploy + by who
  - Avg latency (7d)
  - Credits spent (7d)
- “Next steps” checklist (progressive disclosure):
  - Define schema
  - Add 1 rule
  - Add 1 test
  - Publish to Dev
  - Get API snippet

---

### Tab: Schema (Input/Output)
Goal: users can define what data is needed without being technical.

**Schema builder table**
- Field name
- Type: string/number/boolean/enum/date/json
- Required (toggle)
- Description
- Example value

**Import helper**
- Paste sample JSON → infer fields → user confirms

**Output**
MVP default:  
- `decision: pass|fail`
- `reason: string`
- `metadata: object` (optional)

---

### Tab: Rules
This must feel clean, not “toy builder.”

**Rules list**
- Order/priority
- Rule name
- When (plain-English condition)
- Result (pass/fail + reason template)
- Enabled toggle
- Last edited

**Rule editor (drawer or dedicated page)**
- Plain-English rule statement
- Structured conditions (simple builder: AND/OR groups)
- Reason message (returned to caller)
- Examples (optional)
- Save creates draft changes

**Progressive disclosure**
- Start with plain-English + basic condition builder
- Advanced fields hidden behind “Advanced”:
  - metadata output
  - scoring (future)

---

### Tab: Tests
The “Postman moment.”

**Test cases list**
- Name
- Expected decision
- Last run result
- Diff indicator (if regression)
- Run single / Run suite

**Test editor**
- Input JSON
- Expected output (decision + optional reason)
- “Run” shows:
  - Actual output
  - Which rule fired
  - Explanation trace (ordered)
  - Credits estimate vs actual

**Test suite**
- Run all → summary:
  - Passed / failed
  - Regressions since last version

---

### Tab: Deploy
This is the “versioning safety” layer.

**Version history**
- v1…vN with:
  - created by
  - timestamp
  - release notes (optional)
  - test status badge

**Actions**
- “Create Version” (snapshot draft → version)
- “Promote to Environment” (Dev/Staging/Prod)
- Require tests passing to promote (toggleable; default ON for Prod)

**Audit preview**
- Show deploy events inline

---

### Tab: Runs
Observability per decision.

**Runs table**
- Time
- Env
- Version
- Result
- Credits
- Latency
- Trigger (API/Test/User)
- “Open” details

**Run detail**
- Input JSON (MVP: visible; later redaction)
- Output payload
- Fired rule + trace
- Credits: estimate vs actual
- Re-run in sandbox

---

### Tab: API
Dev-first usability.
- Endpoint + environment
- Auth (API key)
- Copy-paste snippets:
  - curl
  - Node/TS fetch
- Example request/response
- Notes:
  - includes version hash
  - includes run_id for audit lookup

---

## 6) Runs (global)
This is the “Datadog light” view.

Views:
- All runs
- Failures (triage queue)
- Audit log (system events)

Filters:
- Decision
- Env
- Status
- Version
- Model (future)
- User

---

## 7) Billing (Credits) — MVP requirements
Rule: **creating/storing rules is free; execution spends credits.** fileciteturn0file2

### Billing UX must implement:
1) **Pre-run estimate**
- Before execution show:
  - estimated run units
  - estimated credits
  - remaining balance impact

2) **Post-run true-up**
- After execution show:
  - actual credits spent
  - link to run log

3) **Model picker shows cost**
- MVP can default to “RuleKit Standard”
- Still build UI to show cost ladder later

4) **Out of credits behavior**
- Calm blocking state:
  - “Runs paused”
  - One-click top-up packs
  - Nothing silently fails

Billing page:
- Current balance
- Monthly credits
- Test allowance remaining
- Top-ups: $10 → 50 credits, $25 → 200 credits
- Usage last 7/30 days
- Top spending decisions

---

## 8) Team (MVP)
- Invite members
- Roles: Owner / Editor / Viewer
- Workspace-level permissions are enough for MVP

---

## 9) Integrations (MVP-lite)
- API keys management (create, revoke)
- Webhooks placeholder (later)
- “Copy endpoint + snippet” is the win

---

## 10) UI System (must feel 2026)
### Layout + spacing
- Roomy (no cramped padding)
- 12-col grid, max width ~1200–1280px content
- Consistent vertical rhythm (8px scale)

### Visual style
- Soft neutral background
- Subtle borders, minimal shadows
- One accent color used intentionally (status, CTA)
- No heavy black blocks

### Components
- Command Bar (primary)
- Chips (quick actions)
- Cards (soft)
- Tables (clean, zebra optional)
- Status pills (Draft/Published, Pass/Fail)
- Empty state cards (template starters)
- Right rail modules

### Progressive disclosure rules
- Home: simple start
- Studio: guided checklist until user publishes first decision
- Advanced toggles tucked away

### Copy tone
- Direct, engineering-grade, no fluff
- Every CTA is action-based:
  - “Create decision”
  - “Run test”
  - “Create version”
  - “Promote to Prod”
  - “View failures”

---

## 11) MVP Build Phases (implementation order)
1) **Home command center + Decisions list + New decision flow**
2) **Decision Studio: Schema + Rules + Tests**
3) **Versioning + Deployments**
4) **Runs tables + run detail + audit**
5) **Billing credit estimate + ledger + out-of-credits**
6) **Integrations (API keys + snippets)**
7) **Team invites + roles**

---

## 12) Acceptance Criteria (must pass)
- New user can create a decision from template, run a test, and see fired rule + reason in < 2 minutes
- Dev can copy API snippet and successfully call decision endpoint in < 30 minutes
- Every run generates:
  - run_id
  - version hash
  - env
  - outcome + reason
  - credits estimate + actual
- Publish/promote updates which version is active per environment
- Failures are discoverable within 1 click from Home