-- Simplify daily expenses: vendor + payment method, and credit card limit on profile.

create type public.payment_method as enum (
  'cash',
  'upi',
  'debit_card',
  'credit_card',
  'other'
);

alter table public.expenses
  add column if not exists vendor text,
  add column if not exists payment_method public.payment_method not null default 'upi';

alter table public.users
  add column if not exists credit_card_limit numeric(14, 2) not null default 0
    check (credit_card_limit >= 0);

comment on column public.expenses.vendor is 'Merchant or website, e.g. Swiggy, Beastlife';
comment on column public.expenses.payment_method is 'How the expense was paid';
comment on column public.users.credit_card_limit is 'Available credit card limit used in spending power';
