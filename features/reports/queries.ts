import { createClient } from "@/lib/supabase/server";
import {
  resolveReportRange,
  type DateRange,
} from "@/features/reports/period";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/validations/expense";
import { INCOME_CATEGORY_LABELS } from "@/lib/validations/income";
import type { ReportPreset } from "@/lib/validations/reports";
import { decodeGoalName } from "@/lib/validations/savings";
import type { IncomeCategory } from "@/types/finance";
import type { Tables } from "@/types/database";
import {
  clampPercent,
  expenseShareOfIncome,
  remainingBalance,
  savingsRate,
} from "@/utils/finance-calculations";

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: "#64748b",
  upi: "#0ea5e9",
  debit_card: "#8b5cf6",
  credit_card: "#f59e0b",
  other: "#94a3b8",
};

export type ReportIncomeRow = Tables<"income"> & {
  categoryLabel: string;
};

export type ReportExpenseRow = Tables<"expenses"> & {
  paymentMethodLabel: string;
  paymentMethodColor: string;
};

export type ReportSavingsRow = Tables<"saving_goals"> & {
  displayName: string;
  typeLabel: string;
};

export type ReportCategoryBreakdown = {
  name: string;
  color: string;
  amount: number;
  share: number;
};

export type ReportSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  expenseShare: number;
  incomeCount: number;
  expenseCount: number;
  recurringExpenses: number;
  topPaymentMethod: string | null;
};

export type FinancialReport = {
  range: DateRange;
  currency: string;
  summary: ReportSummary;
  income: ReportIncomeRow[];
  expenses: ReportExpenseRow[];
  savings: ReportSavingsRow[];
  expensesByPaymentMethod: ReportCategoryBreakdown[];
  incomeByCategory: ReportCategoryBreakdown[];
};

export async function getFinancialReport(input: {
  preset: ReportPreset;
  from?: string;
  to?: string;
  currency: string;
}): Promise<{ report: FinancialReport | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { report: null, error: "Not authenticated." };
  }

  const range = resolveReportRange({
    preset: input.preset,
    from: input.from,
    to: input.to,
  });

  const [incomeResult, expensesResult, savingsResult] = await Promise.all([
    supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", range.from)
      .lte("date", range.to)
      .order("date", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("expense_date", range.from)
      .lte("expense_date", range.to)
      .order("expense_date", { ascending: false }),
    supabase
      .from("saving_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (incomeResult.error) {
    return { report: null, error: incomeResult.error.message };
  }
  if (expensesResult.error) {
    return { report: null, error: expensesResult.error.message };
  }
  if (savingsResult.error) {
    return { report: null, error: savingsResult.error.message };
  }

  const income: ReportIncomeRow[] = (incomeResult.data ?? []).map((row) => ({
    ...row,
    categoryLabel:
      INCOME_CATEGORY_LABELS[row.category as IncomeCategory] ?? row.category,
  }));

  const expenses: ReportExpenseRow[] = (expensesResult.data ?? []).map(
    (row) => {
      const method = row.payment_method as PaymentMethod;
      return {
        ...row,
        paymentMethodLabel: PAYMENT_METHOD_LABELS[method] ?? method,
        paymentMethodColor: PAYMENT_METHOD_COLORS[method] ?? "#64748b",
      };
    },
  );

  const savings: ReportSavingsRow[] = (savingsResult.data ?? []).map((row) => {
    const decoded = decodeGoalName(row.goal_name);
    const typeLabel =
      decoded.type === "emergency"
        ? "Emergency fund"
        : decoded.type === "investment"
          ? "Investment"
          : "Savings goal";
    return {
      ...row,
      displayName: decoded.name,
      typeLabel,
    };
  });

  const totalIncome = income.reduce((sum, row) => sum + Number(row.amount), 0);
  const totalExpenses = expenses.reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const recurringExpenses = expenses
    .filter((row) => row.is_recurring)
    .reduce((sum, row) => sum + Number(row.amount), 0);

  const expensesByPaymentMethod = buildBreakdown(
    expenses.map((row) => ({
      name: row.paymentMethodLabel,
      color: row.paymentMethodColor,
      amount: Number(row.amount),
    })),
  );

  const incomeByCategory = buildBreakdown(
    income.map((row) => ({
      name: row.categoryLabel,
      color: "#0ea5e9",
      amount: Number(row.amount),
    })),
  );

  const summary: ReportSummary = {
    totalIncome,
    totalExpenses,
    balance: remainingBalance(totalIncome, totalExpenses),
    savingsRate: savingsRate(totalIncome, Math.max(0, totalIncome - totalExpenses)),
    expenseShare: expenseShareOfIncome(totalIncome, totalExpenses),
    incomeCount: income.length,
    expenseCount: expenses.length,
    recurringExpenses,
    topPaymentMethod: expensesByPaymentMethod[0]?.name ?? null,
  };

  return {
    report: {
      range,
      currency: input.currency,
      summary,
      income,
      expenses,
      savings,
      expensesByPaymentMethod,
      incomeByCategory,
    },
    error: null,
  };
}

function buildBreakdown(
  rows: Array<{ name: string; color: string; amount: number }>,
): ReportCategoryBreakdown[] {
  const map = new Map<string, { name: string; color: string; amount: number }>();

  for (const row of rows) {
    const existing = map.get(row.name);
    if (existing) {
      existing.amount += row.amount;
    } else {
      map.set(row.name, { ...row });
    }
  }

  const total = [...map.values()].reduce((sum, row) => sum + row.amount, 0);

  return [...map.values()]
    .map((row) => ({
      ...row,
      share: total > 0 ? clampPercent((row.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}
