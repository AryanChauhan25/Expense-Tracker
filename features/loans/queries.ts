import { createClient } from "@/lib/supabase/server";
import type {
  MoneyDirection,
  MoneyLoanFilters,
} from "@/lib/validations/loans";
import type { Tables } from "@/types/database";
import { clampPercent } from "@/utils/finance-calculations";

export type MoneyLoanRow = Tables<"money_loans">;

export type MoneyLoanView = MoneyLoanRow & {
  remaining: number;
  progress: number;
  isSettled: boolean;
  isPartial: boolean;
  isOverdue: boolean;
  status: "open" | "partial" | "settled";
};

export type MoneyLoanSummary = {
  owedToYou: number;
  youOwe: number;
  netPosition: number;
  openCount: number;
  settledCount: number;
  overdueCount: number;
  totalCount: number;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toMoneyLoanView(row: MoneyLoanRow): MoneyLoanView {
  const amount = Number(row.amount);
  const repaid = Number(row.repaid_amount);
  const remaining = Math.max(0, amount - repaid);
  const isSettled = remaining <= 0;
  const isPartial = repaid > 0 && !isSettled;
  const progress =
    amount > 0 ? clampPercent((repaid / amount) * 100) : repaid > 0 ? 100 : 0;
  const isOverdue = Boolean(
    row.due_date && row.due_date < todayIso() && !isSettled,
  );

  return {
    ...row,
    remaining,
    progress,
    isSettled,
    isPartial,
    isOverdue,
    status: isSettled ? "settled" : isPartial ? "partial" : "open",
  };
}

export async function listMoneyLoans(
  filters: MoneyLoanFilters = {},
): Promise<{ rows: MoneyLoanView[]; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { rows: [], error: "Not authenticated." };
  }

  let query = supabase
    .from("money_loans")
    .select("*")
    .eq("user_id", user.id)
    .order("loan_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.direction) {
    query = query.eq("direction", filters.direction);
  }

  if (filters.q?.trim()) {
    query = query.ilike("person_name", `%${filters.q.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { rows: [], error: error.message };
  }

  let rows = (data ?? []).map(toMoneyLoanView);

  if (filters.status && filters.status !== "all") {
    if (filters.status === "overdue") {
      rows = rows.filter((row) => row.isOverdue);
    } else {
      rows = rows.filter((row) => row.status === filters.status);
    }
  }

  return { rows, error: null };
}

export function summarizeMoneyLoans(rows: MoneyLoanView[]): MoneyLoanSummary {
  let owedToYou = 0;
  let youOwe = 0;

  for (const row of rows) {
    if (row.direction === "lent") {
      owedToYou += row.remaining;
    } else {
      youOwe += row.remaining;
    }
  }

  return {
    owedToYou,
    youOwe,
    netPosition: owedToYou - youOwe,
    openCount: rows.filter((row) => row.status === "open").length,
    settledCount: rows.filter((row) => row.isSettled).length,
    overdueCount: rows.filter((row) => row.isOverdue).length,
    totalCount: rows.length,
  };
}

export function directionVerb(direction: MoneyDirection): string {
  return direction === "lent" ? "collect from" : "repay to";
}
