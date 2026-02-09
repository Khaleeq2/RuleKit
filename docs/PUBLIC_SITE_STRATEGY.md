# Public Site Strategy (Non-App Marketing Surface)

Last updated: 2026-02-07

## Purpose

Define a clean, production-ready path for adding a dedicated public marketing site while preserving the current in-app product experience and URLs.

This document covers:

1. What exists today.
2. What should exist.
3. The cleanest migration path from current state to desired state.
4. Recommended execution phases and next steps.

## Initial State Assessment (Before Foundation Build)

This section captures the state that existed before the public-site foundation was implemented.

### What exists today

The repository currently behaves primarily as an in-app product:

- `/` redirects to `/home`.
- Core app routes: `/home`, `/decisions/*`, `/history`, `/billing`, `/settings`.
- Auth routes: `/login`, `/signup`.
- Legacy app routes: `/dashboard/*`.
- API routes under `/api/*` (mixed real and mock endpoints).

There is no dedicated public/marketing route tree such as `/product`, `/pricing`, `/developers`, `/company`, `/legal`, etc.

### What this means

- Marketing and app concerns are not clearly separated at routing/layout level.
- Current root behavior is app-first (`/` -> `/home`), not public-site-first.
- URL architecture does not yet support a scalable content model for product marketing, docs discovery, and SEO expansion.

### Known gaps related to route clarity

- Missing routes linked from app UI:
  - `/integrations` (linked from decision API tab)
  - `/runs` (linked from decision runs tab)
- Auth path inconsistency for a public site:
  - Existing: `/login`, `/signup`
  - Desired marketing pattern: `/auth/sign-in`, `/auth/sign-up`

## Current State (After Foundation Build — 2026-02-07)

The following has now been implemented:

- Route groups are in place:
  - `src/app/(marketing)` for public/marketing pages.
  - `src/app/(app)` for authenticated/in-app product pages.
- Root route `/` is now a real marketing landing page.
- Public IA scaffolding exists for:
  - `/product/*`
  - `/solutions/*`
  - `/pricing/*`
  - `/developers/*`
  - `/resources/*`
  - `/company/*`
  - `/legal/*`
- Auth URLs are normalized:
  - Canonical: `/auth/sign-in`, `/auth/sign-up`
  - Compatibility redirects: `/login` -> `/auth/sign-in`, `/signup` -> `/auth/sign-up`
- Route hygiene gaps are resolved:
  - `/integrations` now exists.
  - `/runs` now redirects to `/history`.
- Public-site ops essentials are in place:
  - `src/app/not-found.tsx`
  - `/maintenance` page under marketing
  - `middleware.ts` maintenance toggle via `NEXT_PUBLIC_MAINTENANCE_MODE=true`
  - `src/app/robots.ts` and `src/app/sitemap.ts`
  - Page-level public metadata + canonical paths

## Desired Outcome

Create a clear dual-surface architecture:

1. Public marketing site for acquisition, education, trust, pricing, and developer onboarding.
2. In-app authenticated product for decision/rules creation, testing, deployment, and history.

Both should share the same Next.js app, but have separate route groups, layouts, and navigation models.

## Recommended Public Site Information Architecture

This structure best matches the current RuleKit product and how users evaluate tools:

```text
/
├── product
│   ├── overview
│   ├── how-it-works
│   ├── decision-studio
│   ├── conversational-evaluation
│   ├── testing-and-versioning
│   ├── api-and-integration
│   └── trust-and-security
├── solutions
│   ├── loan-eligibility
│   ├── fraud-screening
│   ├── support-routing
│   └── content-moderation
├── pricing
│   ├── plans
│   ├── credits
│   └── faq
├── developers
│   ├── quickstart
│   ├── api-reference
│   ├── examples
│   └── changelog
├── resources
│   ├── docs
│   ├── guides
│   └── status
├── company
│   ├── about
│   ├── principles
│   └── contact
├── legal
│   ├── terms
│   ├── privacy
│   └── security
├── auth
│   ├── sign-in
│   └── sign-up
└── misc
    ├── 404
    └── maintenance
```

### Why this schema is the right fit

- It mirrors the product's real value loop: define -> test -> deploy/use -> review.
- It supports both buyer and builder journeys:
  - Buyer: product, pricing, trust, company, legal.
  - Builder: developers, quickstart, API reference, examples.
- It maps directly to existing in-app capabilities (decisions, tests, versions, runs, API).
- It is SEO-friendly and scalable without forcing an enterprise-heavy information architecture too early.

## Cleanest Implementation Path

### 1) Split app into route groups

Use Next.js route groups to isolate marketing and app shells:

```text
src/app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── product/...
│   ├── pricing/...
│   ├── developers/...
│   ├── resources/...
│   ├── company/...
│   ├── legal/...
│   └── auth/...
└── (app)/
    ├── home/...
    ├── decisions/...
    ├── history/...
    ├── billing/...
    ├── settings/...
    └── dashboard/...
```

This preserves URL paths while enabling separate navigation, layout, and visual hierarchy.

### 2) Make `/` a marketing landing page

- Replace current redirect behavior at root.
- Keep in-app entry points available at `/home` and `/decisions`.
- Add explicit "Go to app" CTA from marketing header.

### 3) Normalize auth URLs

- Add `/auth/sign-in` and `/auth/sign-up`.
- Keep `/login` and `/signup` as compatibility redirects (temporary).

### 4) Keep app routes stable during migration

Do not rename existing app URLs during initial rollout. Preserve:

- `/home`
- `/decisions/*`
- `/history`
- `/billing`
- `/settings`
- `/dashboard/*`

### 5) Add public-site operational essentials early

- Custom `not-found.tsx`
- `/maintenance`
- sitemap/robots/metadata foundation
- canonical link strategy

### 6) Resolve current route hygiene gaps in parallel

Either implement or remove links to non-existent routes:

- `/integrations`
- `/runs`

## Definition of Done

The public site rollout is complete when:

1. `/` is a marketing landing page with clear app entry.
2. Public top-level IA exists and is navigable.
3. Marketing layout is isolated from app layout.
4. App routes remain stable and functional.
5. Auth routes are standardized under `/auth/*`.
6. 404 and maintenance pages exist.
7. Broken links are removed or backed by real routes.
8. Basic SEO infrastructure is in place.

## Recommended Execution Phases

### Phase A: Foundations

- Create `(marketing)` and `(app)` route groups.
- Move current app routes into `(app)` group without URL changes.
- Add marketing layout and new `/` page.

### Phase B: Core Public IA Scaffold

- Scaffold all public route folders/pages with minimal content + consistent template.
- Add shared marketing header/footer/nav.

### Phase C: Content + Positioning

- Fill core pages first: `/product/overview`, `/pricing/plans`, `/developers/quickstart`, `/legal/*`.
- Add solution pages tied to current in-app decision examples.

### Phase D: SEO + Trust

- Metadata per page, sitemap, robots.
- Social cards and canonical links.
- Security/trust page aligned with actual implementation state.

### Phase E: Route Cleanup + Launch Readiness

- Add `/auth/*` + redirects from legacy auth paths.
- Resolve `/integrations` and `/runs` link gaps.
- Validate navigation, internal links, and page discoverability.

## Immediate Next Steps

1. Replace scaffold copy with production content and real legal text.
2. Add analytics and conversion instrumentation for marketing funnels.
3. Add Open Graph images and richer social metadata per high-value pages.
4. Decide whether `/runs` should remain a redirect or become a dedicated global runs view.
5. Run browser-level QA (desktop/mobile) for navigation polish and conversion flow quality.
