-- ============================================
-- Subscriptions & Stripe Integration
-- Adds subscription tracking, Stripe customer mapping,
-- and updates credit system for plan-based allowances
-- ============================================

-- ============================================
-- SUBSCRIPTIONS (one per user)
-- ============================================

create table if not exists public.subscriptions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  seat_count int not null default 1,
  seats_included int not null default 1,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id);
create index idx_subscriptions_stripe_subscription on public.subscriptions(stripe_subscription_id);

-- RLS for subscriptions
alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
for select using (user_id = auth.uid());

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own" on public.subscriptions
for insert with check (user_id = auth.uid());

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own" on public.subscriptions
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Service role needs to update subscriptions via webhooks
-- (service_role bypasses RLS by default, so no extra policy needed)

-- ============================================
-- Add stripe_purchase to credit_transactions type
-- ============================================

alter table public.credit_transactions
  drop constraint if exists credit_transactions_type_check;

alter table public.credit_transactions
  add constraint credit_transactions_type_check
  check (type in ('usage', 'topup', 'monthly_reset', 'refund', 'stripe_purchase', 'plan_allowance'));

-- ============================================
-- Update handle_new_user() to also create subscription row
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create credit balance (Free tier: 50 credits/mo)
  insert into public.credit_balances (user_id, balance, monthly_allowance, test_allowance_remaining)
  values (new.id, 50, 50, 25);

  -- Create free subscription
  insert into public.subscriptions (user_id, plan, status, seat_count, seats_included)
  values (new.id, 'free', 'active', 1, 1);

  return new;
end;
$$;

-- ============================================
-- Updated_at trigger for subscriptions
-- ============================================

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();
