-- Personal Finance Manager — core schema
-- Phase 2: tables, enums, generated period columns, timestamps and indexes.

create schema if not exists private;

create type public.income_category as enum ('salary', 'business', 'freelance', 'other');

-- Keeps updated_at accurate without trusting the client.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profile row mirroring auth.users, holding app-level preferences.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function private.set_updated_at();

create table public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category public.income_category not null default 'salary',
  amount numeric(14, 2) not null check (amount > 0),
  date date not null default current_date,
  month smallint generated always as (extract(month from date)::smallint) stored,
  year smallint generated always as (extract(year from date)::smallint) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index income_user_date_idx on public.income (user_id, date desc);
create index income_user_period_idx on public.income (user_id, year, month);

create trigger income_set_updated_at
  before update on public.income
  for each row execute function private.set_updated_at();

-- user_id is null for the seeded default categories shared by every user.
create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  color text not null default '#64748b',
  icon text not null default 'circle',
  budget_percentage numeric(5, 2) check (budget_percentage >= 0 and budget_percentage <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index expense_categories_user_name_idx
  on public.expense_categories (user_id, lower(name))
  where user_id is not null;

create unique index expense_categories_default_name_idx
  on public.expense_categories (lower(name))
  where user_id is null;

create trigger expense_categories_set_updated_at
  before update on public.expense_categories
  for each row execute function private.set_updated_at();

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category_id uuid references public.expense_categories (id) on delete set null,
  amount numeric(14, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  month smallint generated always as (extract(month from expense_date)::smallint) stored,
  year smallint generated always as (extract(year from expense_date)::smallint) stored,
  is_recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_user_date_idx on public.expenses (user_id, expense_date desc);
create index expenses_user_period_idx on public.expenses (user_id, year, month);
create index expenses_category_idx on public.expenses (category_id);

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function private.set_updated_at();

create table public.monthly_budget (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year between 2000 and 2200),
  expected_income numeric(14, 2) not null default 0 check (expected_income >= 0),
  planned_savings numeric(14, 2) not null default 0 check (planned_savings >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

create trigger monthly_budget_set_updated_at
  before update on public.monthly_budget
  for each row execute function private.set_updated_at();

create table public.saving_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  saved_amount numeric(14, 2) not null default 0 check (saved_amount >= 0),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index saving_goals_user_idx on public.saving_goals (user_id, deadline);

create trigger saving_goals_set_updated_at
  before update on public.saving_goals
  for each row execute function private.set_updated_at();

-- Creates the profile row whenever a new auth user signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Default categories with suggested budget shares (sum = 100).
insert into public.expense_categories (user_id, name, color, icon, budget_percentage)
values
  (null, 'Housing', '#6366f1', 'home', 30),
  (null, 'Food & Groceries', '#f97316', 'utensils', 15),
  (null, 'Transport', '#0ea5e9', 'car', 10),
  (null, 'Utilities', '#14b8a6', 'plug', 8),
  (null, 'Health', '#ef4444', 'heart-pulse', 7),
  (null, 'Education', '#8b5cf6', 'graduation-cap', 5),
  (null, 'Entertainment', '#ec4899', 'clapperboard', 8),
  (null, 'Shopping', '#f59e0b', 'shopping-bag', 7),
  (null, 'Savings & Investments', '#22c55e', 'piggy-bank', 5),
  (null, 'Other', '#64748b', 'circle', 5);
