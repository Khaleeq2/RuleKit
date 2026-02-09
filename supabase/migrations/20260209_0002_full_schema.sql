-- ============================================
-- RuleKit Full Schema Migration
-- Replaces localStorage with proper Supabase tables
-- All tables use auth.uid() for row-level security
-- ============================================

create extension if not exists pgcrypto;

-- ============================================
-- DECISIONS
-- ============================================

create table if not exists public.decisions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  active_version_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_decisions_user_id on public.decisions(user_id);

-- ============================================
-- SCHEMAS (input/output definition per decision)
-- ============================================

create table if not exists public.schemas (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  decision_id text not null references public.decisions(id) on delete cascade,
  fields jsonb not null default '[]',
  output_type text not null default 'pass_fail' check (output_type in ('pass_fail', 'score', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_schemas_decision_id on public.schemas(decision_id);

-- ============================================
-- DECISION RULES
-- ============================================

create table if not exists public.decision_rules (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  decision_id text not null references public.decisions(id) on delete cascade,
  name text not null,
  description text not null default '',
  "order" int not null default 0,
  condition jsonb not null default '{}',
  result text not null default 'fail' check (result in ('pass', 'fail')),
  reason text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_decision_rules_decision_id on public.decision_rules(decision_id);

-- ============================================
-- VERSIONS (snapshots of decision state)
-- ============================================

create table if not exists public.versions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  decision_id text not null references public.decisions(id) on delete cascade,
  version_number int not null,
  schema_snapshot jsonb not null default '{}',
  rules_snapshot jsonb not null default '[]',
  release_notes text not null default '',
  test_status text not null default 'unknown' check (test_status in ('passing', 'failing', 'unknown', 'running')),
  created_at timestamptz not null default now()
);

create index idx_versions_decision_id on public.versions(decision_id);

-- ============================================
-- DEPLOYMENTS (environment bindings)
-- ============================================

create table if not exists public.deployments (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  decision_id text not null references public.decisions(id) on delete cascade,
  environment text not null check (environment in ('draft', 'live')),
  active_version_id text not null,
  version_number int not null,
  deployed_at timestamptz not null default now()
);

create index idx_deployments_decision_id on public.deployments(decision_id);

-- ============================================
-- TESTS (test cases per decision)
-- ============================================

create table if not exists public.tests (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  decision_id text not null references public.decisions(id) on delete cascade,
  name text not null,
  description text not null default '',
  input_json jsonb not null default '{}',
  expected_decision text not null default 'pass' check (expected_decision in ('pass', 'fail')),
  expected_reason text,
  last_result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tests_decision_id on public.tests(decision_id);

-- ============================================
-- RUNS (execution logs)
-- ============================================

create table if not exists public.runs (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  decision_id text not null references public.decisions(id) on delete cascade,
  decision_name text not null,
  version_id text not null,
  version_number int not null,
  environment text not null check (environment in ('draft', 'live')),
  input jsonb not null default '{}',
  output jsonb not null default '{}',
  fired_rule_id text,
  fired_rule_name text,
  execution_trace jsonb not null default '[]',
  trigger text not null default 'manual' check (trigger in ('api', 'test', 'manual', 'webhook')),
  credits_estimate int not null default 0,
  credits_actual int not null default 0,
  latency_ms int not null default 0,
  status text not null default 'success' check (status in ('success', 'error', 'timeout')),
  error text,
  created_at timestamptz not null default now()
);

create index idx_runs_decision_id on public.runs(decision_id);
create index idx_runs_user_id_created on public.runs(user_id, created_at desc);

-- ============================================
-- SESSIONS (conversational evaluation)
-- ============================================

create table if not exists public.sessions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default 'Untitled session',
  decision_id text not null,
  decision_name text not null,
  verdict text check (verdict in ('pass', 'fail')),
  message_count int not null default 0,
  messages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sessions_user_id on public.sessions(user_id, updated_at desc);

-- ============================================
-- CREDIT BALANCES (one per user)
-- ============================================

create table if not exists public.credit_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 150,
  monthly_allowance int not null default 100,
  test_allowance_remaining int not null default 50,
  last_updated timestamptz not null default now()
);

-- ============================================
-- CREDIT TRANSACTIONS
-- ============================================

create table if not exists public.credit_transactions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null check (type in ('usage', 'topup', 'monthly_reset', 'refund')),
  amount int not null,
  description text not null default '',
  run_id text,
  decision_id text,
  created_at timestamptz not null default now()
);

create index idx_credit_transactions_user_id on public.credit_transactions(user_id, created_at desc);

-- ============================================
-- ACTIVITY EVENTS (audit log)
-- ============================================

create table if not exists public.activity_events (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null,
  actor_name text not null default 'User',
  decision_id text,
  decision_name text,
  version_id text,
  description text not null default '',
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_events_user_id on public.activity_events(user_id, created_at desc);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to all tables with updated_at
do $$
declare
  t text;
begin
  for t in select unnest(array['decisions', 'schemas', 'decision_rules', 'tests', 'sessions'])
  loop
    execute format('
      drop trigger if exists trg_%s_updated_at on public.%I;
      create trigger trg_%s_updated_at
      before update on public.%I
      for each row execute function public.set_updated_at();
    ', t, t, t, t);
  end loop;
end;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.decisions enable row level security;
alter table public.schemas enable row level security;
alter table public.decision_rules enable row level security;
alter table public.versions enable row level security;
alter table public.deployments enable row level security;
alter table public.tests enable row level security;
alter table public.runs enable row level security;
alter table public.sessions enable row level security;
alter table public.credit_balances enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.activity_events enable row level security;

-- Macro: create standard CRUD policies for a table with user_id
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'decisions', 'schemas', 'decision_rules', 'versions',
    'deployments', 'tests', 'runs', 'sessions',
    'credit_transactions', 'activity_events'
  ])
  loop
    execute format('
      drop policy if exists "%s_select_own" on public.%I;
      create policy "%s_select_own" on public.%I for select using (user_id = auth.uid());

      drop policy if exists "%s_insert_own" on public.%I;
      create policy "%s_insert_own" on public.%I for insert with check (user_id = auth.uid());

      drop policy if exists "%s_update_own" on public.%I;
      create policy "%s_update_own" on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid());

      drop policy if exists "%s_delete_own" on public.%I;
      create policy "%s_delete_own" on public.%I for delete using (user_id = auth.uid());
    ', t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t);
  end loop;
end;
$$;

-- credit_balances uses user_id as PK
drop policy if exists "credit_balances_select_own" on public.credit_balances;
create policy "credit_balances_select_own" on public.credit_balances
for select using (user_id = auth.uid());

drop policy if exists "credit_balances_insert_own" on public.credit_balances;
create policy "credit_balances_insert_own" on public.credit_balances
for insert with check (user_id = auth.uid());

drop policy if exists "credit_balances_update_own" on public.credit_balances;
create policy "credit_balances_update_own" on public.credit_balances
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================
-- AUTO-CREATE credit_balances row on user signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.credit_balances (user_id, balance, monthly_allowance, test_allowance_remaining)
  values (new.id, 150, 100, 50);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
