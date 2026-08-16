import { createClient } from "@/lib/supabase/server";
import {
  PAYMENT_METHOD_LABELS,
  type ExpenseFilters,
  type PaymentMethod,
} from "@/lib/validations/expense";
import type { Tables } from "@/types/database";

export type ExpenseRow = Tables<"expenses">;

export type ExpenseSummary = {
  total: number;
  count: number;
  byPaymentMethod: Array<{
    method: PaymentMethod;
    label: string;
    total: number;
  }>;
};

export type SpendingPower = {
  month: number;
  year: number;
  income: number;
  creditCardLimit: number;
  capacity: number;
  spent: number;
  remaining: number;
};

export async function listExpenses(filters: ExpenseFilters = {}): Promise<{
  rows: ExpenseRow[];
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { rows: [], error: "Not authenticated." };
  }

  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month) {
    query = query.eq("month", filters.month);
  }

  if (filters.year) {
    query = query.eq("year", filters.year);
  }

  if (filters.payment_method) {
    query = query.eq("payment_method", filters.payment_method);
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    query = query.or(`title.ilike.%${q}%,vendor.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { rows: [], error: error.message };
  }

  return { rows: data ?? [], error: null };
}

export function summarizeExpenses(rows: ExpenseRow[]): ExpenseSummary {
  const methodMap = new Map<PaymentMethod, number>();
  let total = 0;

  for (const row of rows) {
    const amount = Number(row.amount);
    total += amount;
    const method = row.payment_method as PaymentMethod;
    methodMap.set(method, (methodMap.get(method) ?? 0) + amount);
  }

  return {
    total,
    count: rows.length,
    byPaymentMethod: [...methodMap.entries()]
      .map(([method, methodTotal]) => ({
        method,
        label: PAYMENT_METHOD_LABELS[method],
        total: methodTotal,
      }))
      .sort((a, b) => b.total - a.total),
  };
}

export async function getSpendingPower(
  month: number,
  year: number,
): Promise<{ power: SpendingPower | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { power: null, error: "Not authenticated." };
  }

  const [profileResult, incomeResult, expensesResult] = await Promise.all([
    supabase
      .from("users")
      .select("credit_card_limit")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("income")
      .select("amount")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year),
    supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year),
  ]);

  if (profileResult.error) {
    return { power: null, error: profileResult.error.message };
  }
  if (incomeResult.error) {
    return { power: null, error: incomeResult.error.message };
  }
  if (expensesResult.error) {
    return { power: null, error: expensesResult.error.message };
  }

  const income = (incomeResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const spent = (expensesResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const creditCardLimit = Number(profileResult.data?.credit_card_limit ?? 0);
  const capacity = income + creditCardLimit;

  return {
    power: {
      month,
      year,
      income,
      creditCardLimit,
      capacity,
      spent,
      remaining: capacity - spent,
    },
    error: null,
  };
}

/** Kept for budget/dashboard/report category lookups while those features still exist. */
export async function listExpenseCategories(): Promise<{
  categories: Tables<"expense_categories">[];
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { categories: [], error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) {
    return { categories: [], error: error.message };
  }

  return { categories: data ?? [], error: null };
}

export function currentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
