create extension if not exists pgcrypto;

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category text not null default 'General',
  severity text not null default 'medium',
  criteria text not null default '',
  applicable_file_types text[] not null default '{}',
  tags text[] not null default '{}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rule_conditions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.rules(id) on delete cascade,
  position int not null default 0,
  field text not null,
  operator text not null,
  value text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rules_updated_at on public.rules;
create trigger trg_rules_updated_at
before update on public.rules
for each row
execute function public.set_updated_at();

drop trigger if exists trg_rule_conditions_updated_at on public.rule_conditions;
create trigger trg_rule_conditions_updated_at
before update on public.rule_conditions
for each row
execute function public.set_updated_at();

alter table public.rules enable row level security;
alter table public.rule_conditions enable row level security;

drop policy if exists "rules_select" on public.rules;
create policy "rules_select" on public.rules
for select
using (true);

drop policy if exists "rules_insert" on public.rules;
create policy "rules_insert" on public.rules
for insert
with check (true);

drop policy if exists "rules_update" on public.rules;
create policy "rules_update" on public.rules
for update
using (true)
with check (true);

drop policy if exists "rules_delete" on public.rules;
create policy "rules_delete" on public.rules
for delete
using (true);

drop policy if exists "rule_conditions_select" on public.rule_conditions;
create policy "rule_conditions_select" on public.rule_conditions
for select
using (true);

drop policy if exists "rule_conditions_insert" on public.rule_conditions;
create policy "rule_conditions_insert" on public.rule_conditions
for insert
with check (true);

drop policy if exists "rule_conditions_update" on public.rule_conditions;
create policy "rule_conditions_update" on public.rule_conditions
for update
using (true)
with check (true);

drop policy if exists "rule_conditions_delete" on public.rule_conditions;
create policy "rule_conditions_delete" on public.rule_conditions
for delete
using (true);
