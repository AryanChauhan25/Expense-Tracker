-- Row Level Security: every row is scoped to its owner.
-- Default expense categories (user_id is null) are readable by all signed-in users.

alter table public.users enable row level security;
alter table public.income enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.monthly_budget enable row level security;
alter table public.saving_goals enable row level security;

-- users -----------------------------------------------------------------
create policy "Users can read own profile"
  on public.users for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.users for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.users for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- income ----------------------------------------------------------------
create policy "Users can read own income"
  on public.income for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own income"
  on public.income for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own income"
  on public.income for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own income"
  on public.income for delete to authenticated
  using ((select auth.uid()) = user_id);

-- expense_categories ----------------------------------------------------
create policy "Users can read own and default categories"
  on public.expense_categories for select to authenticated
  using (user_id is null or (select auth.uid()) = user_id);

create policy "Users can insert own categories"
  on public.expense_categories for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own categories"
  on public.expense_categories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own categories"
  on public.expense_categories for delete to authenticated
  using ((select auth.uid()) = user_id);

-- expenses --------------------------------------------------------------
create policy "Users can read own expenses"
  on public.expenses for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own expenses"
  on public.expenses for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete to authenticated
  using ((select auth.uid()) = user_id);

-- monthly_budget --------------------------------------------------------
create policy "Users can read own budgets"
  on public.monthly_budget for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own budgets"
  on public.monthly_budget for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own budgets"
  on public.monthly_budget for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own budgets"
  on public.monthly_budget for delete to authenticated
  using ((select auth.uid()) = user_id);

-- saving_goals ----------------------------------------------------------
create policy "Users can read own saving goals"
  on public.saving_goals for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own saving goals"
  on public.saving_goals for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own saving goals"
  on public.saving_goals for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own saving goals"
  on public.saving_goals for delete to authenticated
  using ((select auth.uid()) = user_id);
