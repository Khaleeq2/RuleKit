# RuleKit — MVP Production Readiness Checklist

> Comprehensive audit from full app crawl. Categorized by severity for Day-1 PMF.

---

## 🔴 CRITICAL — Must fix before launch

### Auth & Security
- [ ] **No auth middleware** — App routes (`/home`, `/decisions`, `/billing`, `/settings`, etc.) are completely unprotected. Any unauthenticated user can access them by navigating directly. Need Next.js middleware that checks Supabase session and redirects to `/auth/sign-in`.
- [ ] **API routes don't verify auth** — `/api/evaluate`, `/api/chat`, `/api/title` accept requests without checking for a valid Supabase session. Any anonymous caller can use credits and invoke Groq.
- [ ] **Google OAuth not configured in Supabase** — The OAuth button is wired in the UI but won't work until you:
  1. Create a Google Cloud OAuth 2.0 Client ID (Web application type)
  2. Set authorized redirect URI to: `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`
  3. In Supabase Dashboard → Authentication → Providers → Google: enable it and paste Client ID + Client Secret
  4. Add env vars (for reference only — Supabase handles the flow server-side):
     - Google Client ID and Secret go in Supabase dashboard, NOT in `.env.local`
- [ ] **Service role key in `.env.local`** — This is fine for local dev but must NEVER be committed to git or deployed to a public environment. Verify `.gitignore` covers `.env.local`.
- [ ] **`createdBy: 'user-1'` hardcoded** — In `decisions/page.tsx` `handleDuplicate` (line 112). Should use actual authenticated user ID.

### Data Integrity
- [ ] **Billing "Purchase" has no real payment integration** — `billingRepo.purchaseTopUp()` just inserts a Supabase row. No Stripe/payment flow. Users can add credits for free. Either disable the button with "Coming soon" or wire Stripe.
- [ ] **Test runner is a simulation** — `testsRepo.runTest()` always returns `passed: true` with the expected outcome. It should call `/api/evaluate` with the test input and compare the actual result against expected.

### Environment
- [ ] **DATABASE_URL contains `@` in password** — `encodewetrust@` — the trailing `@` may cause URL parsing issues. Verify the connection string is correctly URL-encoded (`%40` for `@`).

---

## 🟡 HIGH — Should fix for credible MVP

### Settings Page (100% Mock)
- [ ] **Profile section** — Hardcoded "User" / "user@example.com". Should load real data from `supabase.auth.getUser()` and allow updates via `supabase.auth.updateUser()`.
- [ ] **Theme toggle** — State is local only, doesn't persist. Need a theme provider (e.g. `next-themes`) that reads/writes preference.
- [ ] **Notifications section** — All toggles are local state. No backend storage for preferences.
- [ ] **"Change password" button** — Just shows a toast. Should call `supabase.auth.resetPasswordForEmail()`.
- [ ] **"View sessions" button** — Does nothing. Either implement with Supabase session management or remove.
- [ ] **"Delete account" button** — Does nothing. Either implement (delete user data + `supabase.auth.admin.deleteUser()`) or add a confirmation that sends an email to support.
- [ ] **2FA toggle** — Non-functional. Either implement with Supabase MFA or remove from UI.

### Missing Features
- [ ] **No email confirmation flow feedback** — After sign-up, user is told to check email but there's no resend-confirmation-email option or clear instructions if the email doesn't arrive.
- [ ] **No loading/error states on many pages** — Decisions page has skeletons, but if Supabase returns an error the user sees nothing helpful.
- [ ] **No rate limiting on API routes** — `/api/evaluate` and `/api/chat` can be hammered without limits.

### UX Gaps
- [ ] **Empty states for billing** — When a new user has no transactions, the "Usage (Last 7 Days)" chart shows "No usage data yet" but the credit balance might show 0 with no clear CTA to get started.
- [ ] **Decision "Templates" feature** — The "Templates" button links to `/decisions/new?templates=true` but the new decision page may not handle the `templates` query param.

---

## 🟢 MEDIUM — Polish for strong Day-1 impression

### UI Consistency
- [ ] **Implicit `any` types in `home/page.tsx`** — ~8 parameters with implicit `any`. Not blocking build (likely `strict: false` in tsconfig) but should be typed for maintainability.
- [ ] **Design token inconsistency** — Mix of `var(--font-size-body)`, `text-sm`, `text-[13px]`, `text-[15px]` across pages. Should unify to a consistent scale.
- [ ] **Dark mode** — CSS variables suggest dark mode support but no theme toggle is wired. The theme selector in Settings doesn't work.

### Content & Marketing
- [ ] **11 marketing sub-pages** still use `PublicPageTemplate` with placeholder content (listed in `TODO.md` Phase 11c).
- [ ] **Contact page** — `/contact` exists but should be verified as functional (depends on `/api/contact` route and Resend integration).
- [ ] **SEO** — OpenGraph images are generated but should be verified for all key pages.

### Technical Debt
- [ ] **Legacy API routes** — `/api/stats`, `/api/rules`, `/api/assets`, `/api/validations`, `/api/validations/run`, `/api/signup` were rewritten to use Supabase but may no longer be referenced by any page. Audit and remove if dead.
- [ ] **`src/app/lib/supabase.ts`** — Legacy Supabase client (direct `createClient`), likely superseded by `supabase-browser.ts` and `supabase-server.ts`. Audit references and consolidate.
- [ ] **`src/app/lib/rules.ts`** — Legacy localStorage-based rules repository. Was used by the deleted dashboard. Check if anything still imports it; if not, delete.
- [ ] **`DashboardLayout.tsx`** — Legacy layout component. Check if still referenced; if not, delete.
- [ ] **`/login` and `/signup` routes** — Compatibility redirects. Keep for now but can be removed post-launch.
- [ ] **Supabase types** — Currently manual (`database.types.ts`). Install Supabase CLI and run `supabase gen types typescript --project-id zuwwilbgzowfahzgnfsw > src/app/lib/database.types.ts` when access allows.

### Performance
- [ ] **No pagination** — Decision list, run history, and billing transactions load all records. Add cursor/offset pagination for scale.
- [ ] **No caching** — Every page load re-fetches from Supabase. Consider SWR or React Query for client-side caching.

---

## ✅ DONE — Completed in this session & previous sessions

- [x] All repos migrated from localStorage to Supabase (decisions, schemas, rules, versions, deployments, tests, sessions, runs, billing, activity)
- [x] Manual Supabase TypeScript types created
- [x] Auth pages polished (consistent design, Google OAuth buttons, OAuth callback route)
- [x] File upload: drag-and-drop + paperclip button both working for text files
- [x] 6 real marketing pages built (Product, Solutions, Pricing, Developers, Resources, Company)
- [x] Service role key exposure fixed
- [x] Password reset flow working
- [x] Real logout via Supabase
- [x] Workspace switcher removed, real user email displayed
- [x] All legacy dashboard routes deleted
- [x] Build passing clean (zero errors)

---

## Recommended Launch Priority Order

1. **Auth middleware** — 30 min, blocks everything
2. **API route auth checks** — 30 min, security critical
3. **Wire test runner to `/api/evaluate`** — 1 hr, core feature
4. **Settings page — load real user data** — 1 hr, table stakes
5. **Billing guard (disable purchase or wire Stripe)** — 30 min
6. **Google OAuth Supabase config** — 15 min (you do this in dashboard)
7. **Rate limiting** — 1 hr
8. **Theme provider** — 30 min
9. **Pagination** — 2 hr
10. **Legacy cleanup** — 1 hr

---

_Generated: Feb 9, 2026 — Full app crawl of all routes, components, API routes, and data layer._
