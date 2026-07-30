import { createClient } from "@/lib/supabase/server";
import type { ExpenseFilters } from "@/lib/validations/expense";
import type { Tables } from "@/types/database";

export type ExpenseCategoryRow = Tables<"expense_categories">;
export type ExpenseRow = Tables<"expenses">;

export type ExpenseWithCategory = ExpenseRow & {
  category: Pick<
    ExpenseCategoryRow,
    "id" | "name" | "color" | "icon"
  > | null;
};

export type ExpenseSummary = {
  total: number;
  count: number;
  recurringTotal: number;
  plannedTotal: number;
  byCategory: Array<{
    id: string;
    name: string;
    color: string;
    total: number;
  }>;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listExpenseCategories(): Promise<{
  categories: ExpenseCategoryRow[];
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

export async function listExpenses(filters: ExpenseFilters = {}): Promise<{
  rows: ExpenseWithCategory[];
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

  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  if (filters.recurring === "yes") {
    query = query.eq("is_recurring", true);
  } else if (filters.recurring === "no") {
    query = query.eq("is_recurring", false);
  }

  const today = todayIso();
  if (filters.timing === "planned") {
    query = query.gt("expense_date", today);
  } else if (filters.timing === "past") {
    query = query.lte("expense_date", today);
  }

  if (filters.q?.trim()) {
    query = query.ilike("title", `%${filters.q.trim()}%`);
  }

  const [{ data, error }, categoriesResult] = await Promise.all([
    query,
    listExpenseCategories(),
  ]);

  if (error) {
    return { rows: [], error: error.message };
  }

  if (categoriesResult.error) {
    return { rows: [], error: categoriesResult.error };
  }

  const categoryById = new Map(
    categoriesResult.categories.map((category) => [category.id, category]),
  );

  const rows: ExpenseWithCategory[] = (data ?? []).map((row) => {
    const category = row.category_id
      ? categoryById.get(row.category_id) ?? null
      : null;

    return {
      ...row,
      category: category
        ? {
            id: category.id,
            name: category.name,
            color: category.color,
            icon: category.icon,
          }
        : null,
    };
  });

  return { rows, error: null };
}

export function summarizeExpenses(rows: ExpenseWithCategory[]): ExpenseSummary {
  const today = todayIso();
  const categoryMap = new Map<
    string,
    { id: string; name: string; color: string; total: number }
  >();

  let total = 0;
  let recurringTotal = 0;
  let plannedTotal = 0;

  for (const row of rows) {
    const amount = Number(row.amount);
    total += amount;

    if (row.is_recurring) {
      recurringTotal += amount;
    }

    if (row.expense_date > today) {
      plannedTotal += amount;
    }

    if (row.category) {
      const existing = categoryMap.get(row.category.id);
      if (existing) {
        existing.total += amount;
      } else {
        categoryMap.set(row.category.id, {
          id: row.category.id,
          name: row.category.name,
          color: row.category.color,
          total: amount,
        });
      }
    }
  }

  return {
    total,
    count: rows.length,
    recurringTotal,
    plannedTotal,
    byCategory: [...categoryMap.values()].sort((a, b) => b.total - a.total),
  };
}

export function currentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
