import { createClient } from "@/lib/supabase/server";
import type { IncomeFilters } from "@/lib/validations/income";
import type { IncomeCategory } from "@/types/finance";
import type { Tables } from "@/types/database";

export type IncomeRow = Tables<"income">;

export type IncomeSummary = {
  total: number;
  count: number;
  byCategory: Record<IncomeCategory, number>;
};

export async function listIncome(filters: IncomeFilters = {}): Promise<{
  rows: IncomeRow[];
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
    .from("income")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month) {
    query = query.eq("month", filters.month);
  }

  if (filters.year) {
    query = query.eq("year", filters.year);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.q?.trim()) {
    query = query.ilike("title", `%${filters.q.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { rows: [], error: error.message };
  }

  return { rows: data ?? [], error: null };
}

export function summarizeIncome(rows: IncomeRow[]): IncomeSummary {
  const byCategory: Record<IncomeCategory, number> = {
    salary: 0,
    business: 0,
    freelance: 0,
    other: 0,
  };

  let total = 0;

  for (const row of rows) {
    const amount = Number(row.amount);
    total += amount;
    byCategory[row.category] += amount;
  }

  return { total, count: rows.length, byCategory };
}

export function currentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
