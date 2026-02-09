# RuleKit — Production Deployment Checklist

> Dev → Prod migration path. Complete these before flipping to live.
> **Created: Feb 9, 2026**

---

## 🔴 MUST DO — Before first production deploy

### 1. Vercel Environment Variables
Add **all** env vars to Vercel → Settings → Environment Variables (Production scope):

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | Already have |
| `NEXT_PUBLIC_SUPABASE_PROJECT_ID` | Supabase Dashboard | `zuwwilbgzowfahzgnfsw` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Already have |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | Server-only, never expose |
| `DATABASE_URL` | Supabase Dashboard → Settings → Database | Add `?sslmode=require` |
| `GROQ_API_KEY` | Groq Console | Already have |
| `RESEND_API_KEY` | Resend Dashboard | Already have |
| `RESEND_FROM_EMAIL` | — | `hello@rulekit.io` |
| `NEXT_PUBLIC_SITE_URL` | — | `https://rulekit.io` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | Already have |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | Already have |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → **Live keys** | Switch from `sk_test_` → `sk_live_` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → **Live keys** | Switch from `pk_test_` → `pk_live_` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → **Live webhook** | New secret for prod endpoint |
| `STRIPE_PRICE_PRO_MONTHLY` | Re-run seed script with live key | New price IDs |
| `STRIPE_PRICE_PRO_SEAT` | Re-run seed script with live key | New price IDs |
| `STRIPE_PRICE_PACK_STARTER` | Re-run seed script with live key | New price IDs |
| `STRIPE_PRICE_PACK_GROWTH` | Re-run seed script with live key | New price IDs |
| `STRIPE_PRICE_PACK_SCALE` | Re-run seed script with live key | New price IDs |

### 2. Stripe Live Mode
- [ ] Activate Stripe account (verify business details at dashboard.stripe.com)
- [ ] Switch to live API keys in Vercel env vars
- [ ] Re-run `STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/stripe-seed.ts` to create live products/prices
- [ ] Add new live price IDs to Vercel env vars
- [ ] Create **new webhook endpoint** in Stripe for `https://rulekit.io/api/stripe/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
- [ ] Add live `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Configure Customer Portal branding in Stripe Dashboard → Settings → Customer Portal

### 3. Supabase Auth — Production URLs
- [ ] Supabase Dashboard → Authentication → URL Configuration:
  - **Site URL**: `https://rulekit.io`
  - **Redirect URLs**: `https://rulekit.io/auth/callback`, `https://rulekit.io/auth/update-password`
- [ ] Update Google OAuth redirect URI in Google Cloud Console to `https://zuwwilbgzowfahzgnfsw.supabase.co/auth/v1/callback`
- [ ] Update Supabase email templates (Auth → Email Templates) with RuleKit branding

### 4. Database Migrations
- [ ] Ensure all 3 migration files have been applied:
  - `20260209_0001_...` (initial setup)
  - `20260209_0002_full_schema.sql` (11 tables)
  - `20260209_0003_subscriptions_and_stripe.sql` (subscriptions)
- [ ] Verify RLS is enabled on all tables
- [ ] Enable Supabase Point-in-Time Recovery (PITR) — Dashboard → Settings → Database

### 5. Domain & SSL
- [ ] Custom domain `rulekit.io` configured in Vercel
- [ ] DNS records verified (A/CNAME pointing to Vercel)
- [ ] SSL auto-provisioned by Vercel (verify HTTPS works)
- [ ] Consider Cloudflare for DDoS protection / WAF (optional but recommended)

---

## 🟡 SHOULD DO — Within first week of launch

### 6. Error Tracking — Sentry
- [ ] Create Sentry project at sentry.io
- [ ] `npm install @sentry/nextjs`
- [ ] Run `npx @sentry/wizard@latest -i nextjs` to configure
- [ ] Add `SENTRY_DSN` and `SENTRY_AUTH_TOKEN` to Vercel env vars
- [ ] Verify errors appear in Sentry dashboard after deploy

### 7. Monitoring & Alerts
- [ ] Enable Vercel Analytics (free tier) — already installed (`@vercel/analytics`)
- [ ] Enable Vercel Speed Insights for Web Vitals
- [ ] Set up Stripe webhook failure alerts (Stripe Dashboard → Developers → Webhooks → Alert prefs)
- [ ] Set up Supabase database alerts for connection limits
- [ ] Configure uptime monitoring (UptimeRobot, Better Stack, or Vercel Monitoring)

### 8. Database Performance
- [ ] Enable connection pooling via Supabase (pgBouncer) — use pooled connection string
- [ ] Verify indexes exist on high-traffic columns:
  - `credit_transactions(user_id)` ✅ (exists)
  - `subscriptions(user_id)` ✅ (exists)
  - `subscriptions(stripe_customer_id)` ✅ (exists)
  - `decisions(created_by)` — add if not present
  - `sessions(user_id, created_at DESC)` — add for history page performance
- [ ] Set `statement_timeout` to 30s for safety

### 9. Security Hardening
- [ ] Add Content Security Policy (CSP) headers in `next.config.js`
- [ ] Review CORS configuration — restrict to `rulekit.io` origin
- [ ] Audit rate limiting thresholds on API routes for production traffic
- [ ] Enable GitHub secret scanning on the repo
- [ ] Verify `.env.local` is in `.gitignore` (it is ✅)
- [ ] Consider Upstash Redis for distributed rate limiting (current is in-memory, resets on deploy)

### 10. Backups
- [ ] Enable Supabase PITR (Point-in-Time Recovery)
- [ ] Document manual backup procedure: `pg_dump` via Supabase CLI
- [ ] Test restore procedure at least once before launch

---

## 🟢 NICE TO HAVE — Post-launch polish

### 11. CI/CD
- [ ] GitHub Actions for automated build checks on PR
- [ ] Vercel preview deploys for branches (auto if using Vercel Git integration)
- [ ] Automated Lighthouse CI for performance regression

### 12. Observability
- [ ] Structured logging with request IDs (consider Axiom or Vercel Logs)
- [ ] Stripe event processing logs with idempotency tracking
- [ ] Supabase query performance monitoring via Dashboard → Reports

### 13. Scaling Prep
- [ ] Supabase Compute add-on if traffic justifies it
- [ ] Vercel Pro plan for higher concurrency limits
- [ ] CDN caching strategy for static marketing pages
- [ ] React Query / SWR for client-side data caching

---

## Quick Deploy Command Sequence

```bash
# 1. Switch Stripe to live mode
STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/stripe-seed.ts

# 2. Push to main (triggers Vercel auto-deploy)
git push origin main

# 3. Verify post-deploy
curl -s https://rulekit.io/api/stripe/webhook -X POST | jq .
# Should return: {"error":"Missing signature or webhook secret"}

# 4. Send test webhook from Stripe Dashboard
# Stripe → Developers → Webhooks → Send test event
```

---

_Created: Feb 9, 2026_
