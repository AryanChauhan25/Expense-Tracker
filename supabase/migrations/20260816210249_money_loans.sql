-- Borrow / lend tracking: money you gave others, and money you took.

create type public.money_direction as enum ('lent', 'borrowed');

create table public.money_loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  direction public.money_direction not null,
  person_name text not null check (char_length(trim(person_name)) > 0),
  amount numeric(14, 2) not null check (amount > 0),
  repaid_amount numeric(14, 2) not null default 0
    check (repaid_amount >= 0 and repaid_amount <= amount),
  loan_date date not null default current_date,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index money_loans_user_direction_idx
  on public.money_loans (user_id, direction);

create index money_loans_user_date_idx
  on public.money_loans (user_id, loan_date desc);

create trigger money_loans_set_updated_at
  before update on public.money_loans
  for each row execute function private.set_updated_at();

alter table public.money_loans enable row level security;

create policy "Users can read own money loans"
  on public.money_loans for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own money loans"
  on public.money_loans for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own money loans"
  on public.money_loans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own money loans"
  on public.money_loans for delete to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.money_loans is
  'Personal borrow/lend ledger: lent = owed to you, borrowed = you owe';
comment on column public.money_loans.direction is
  'lent = money you gave, borrowed = money you took';
comment on column public.money_loans.repaid_amount is
  'How much has been settled so far';
