import { createClient } from "@/lib/supabase/server";
import { getBudgetOverview } from "@/features/budget/queries";
import { listExpenseCategories } from "@/features/expenses/queries";
import {
  buildInsights,
  type DashboardInsight,
  type FinancialHealth,
} from "@/features/dashboard/insights";
import {
  clampPercent,
  remainingBalance,
  savingsRate,
} from "@/utils/finance-calculations";

export type MonthlyTrendPoint = {
  key: string;
  label: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
};

export type CategorySlice = {
  id: string;
  name: string;
  color: string;
  amount: number;
};

export type DailySpendPoint = {
  date: string;
  day: number;
  amount: number;
};

export type DashboardAnalytics = {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  savings: number;
  savingsRate: number;
  budgetUtilization: number;
  spendableBudget: number;
  remainingBudget: number;
  hasBudget: boolean;
  isOverallOverspent: boolean;
  recurringExpenseTotal: number;
  plannedExpenseTotal: number;
  expensesByCategory: CategorySlice[];
  monthlyTrend: MonthlyTrendPoint[];
  dailySpending: DailySpendPoint[];
  health: FinancialHealth;
  insights: DashboardInsight[];
};

export function currentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function shiftPeriod(
  month: number,
  year: number,
  delta: number,
): { month: number; year: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function monthLabel(month: number, year: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "2-digit",
  }).format(new Date(year, month - 1, 1));
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export async function getDashboardAnalytics(
  month: number,
  year: number,
): Promise<{ analytics: DashboardAnalytics | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { analytics: null, error: "Not authenticated." };
  }

  const trendPeriods = Array.from({ length: 6 }, (_, index) =>
    shiftPeriod(month, year, index - 5),
  );
  const first = trendPeriods[0]!;
  const last = trendPeriods[trendPeriods.length - 1]!;

  const firstDate = `${first.year}-${String(first.month).padStart(2, "0")}-01`;
  const lastDay = daysInMonth(last.month, last.year);
  const lastDate = `${last.year}-${String(last.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [
    incomeResult,
    expensesResult,
    categoriesResult,
    budgetResult,
    trendIncomeResult,
    trendExpensesResult,
  ] = await Promise.all([
    supabase
      .from("income")
      .select("amount")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year),
    supabase
      .from("expenses")
      .select("amount, category_id, expense_date, is_recurring")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year),
    listExpenseCategories(),
    getBudgetOverview(month, year),
    supabase
      .from("income")
      .select("amount, month, year")
      .eq("user_id", user.id)
      .gte("date", firstDate)
      .lte("date", lastDate),
    supabase
      .from("expenses")
      .select("amount, month, year")
      .eq("user_id", user.id)
      .gte("expense_date", firstDate)
      .lte("expense_date", lastDate),
  ]);

  if (incomeResult.error) {
    return { analytics: null, error: incomeResult.error.message };
  }
  if (expensesResult.error) {
    return { analytics: null, error: expensesResult.error.message };
  }
  if (categoriesResult.error) {
    return { analytics: null, error: categoriesResult.error };
  }
  if (budgetResult.error) {
    return { analytics: null, error: budgetResult.error };
  }
  if (trendIncomeResult.error) {
    return { analytics: null, error: trendIncomeResult.error.message };
  }
  if (trendExpensesResult.error) {
    return { analytics: null, error: trendExpensesResult.error.message };
  }

  const totalIncome = (incomeResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );

  const today = new Date().toISOString().slice(0, 10);
  let totalExpenses = 0;
  let recurringExpenseTotal = 0;
  let plannedExpenseTotal = 0;
  const spentByCategory = new Map<string, number>();
  const spentByDay = new Map<number, number>();

  for (const row of expensesResult.data ?? []) {
    const amount = Number(row.amount);
    totalExpenses += amount;

    if (row.is_recurring) {
      recurringExpenseTotal += amount;
    }
    if (row.expense_date > today) {
      plannedExpenseTotal += amount;
    }
    if (row.category_id) {
      spentByCategory.set(
        row.category_id,
        (spentByCategory.get(row.category_id) ?? 0) + amount,
      );
    }

    const day = Number(row.expense_date.slice(8, 10));
    spentByDay.set(day, (spentByDay.get(day) ?? 0) + amount);
  }

  const savings = remainingBalance(totalIncome, totalExpenses);
  const categoryById = new Map(
    categoriesResult.categories.map((category) => [category.id, category]),
  );

  const expensesByCategory: CategorySlice[] = [...spentByCategory.entries()]
    .map(([id, amount]) => {
      const category = categoryById.get(id);
      return {
        id,
        name: category?.name ?? "Uncategorised",
        color: category?.color ?? "#64748b",
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const incomeByPeriod = new Map<string, number>();
  for (const row of trendIncomeResult.data ?? []) {
    const key = `${row.year}-${row.month}`;
    incomeByPeriod.set(key, (incomeByPeriod.get(key) ?? 0) + Number(row.amount));
  }

  const expensesByPeriod = new Map<string, number>();
  for (const row of trendExpensesResult.data ?? []) {
    const key = `${row.year}-${row.month}`;
    expensesByPeriod.set(
      key,
      (expensesByPeriod.get(key) ?? 0) + Number(row.amount),
    );
  }

  let cumulativeSavings = 0;
  const monthlyTrend: MonthlyTrendPoint[] = trendPeriods.map((period) => {
    const key = `${period.year}-${period.month}`;
    const income = incomeByPeriod.get(key) ?? 0;
    const expenses = expensesByPeriod.get(key) ?? 0;
    const monthSavings = income - expenses;
    cumulativeSavings += monthSavings;

    return {
      key,
      label: monthLabel(period.month, period.year),
      month: period.month,
      year: period.year,
      income,
      expenses,
      savings: cumulativeSavings,
    };
  });

  const dayCount = daysInMonth(month, year);
  const dailySpending: DailySpendPoint[] = Array.from(
    { length: dayCount },
    (_, index) => {
      const day = index + 1;
      return {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        day,
        amount: spentByDay.get(day) ?? 0,
      };
    },
  );

  const overview = budgetResult.overview!;
  const spendableBudget = overview.spendableBudget;
  const budgetUtilization = overview.overallUtilization;
  const remainingBudget = overview.remainingBudget;

  const healthInput = {
    totalIncome,
    totalExpenses,
    savings,
    savingsRateValue: savingsRate(totalIncome, Math.max(0, savings)),
    budgetUtilization,
    isOverallOverspent: overview.isOverallOverspent,
    overspentCategories: overview.categories.filter((c) => c.isOverspent)
      .length,
    hasBudget: Boolean(overview.budget),
    recurringExpenseTotal,
    plannedExpenseTotal,
  };

  const health = scoreFinancialHealth(healthInput);
  const insights = buildInsights(healthInput, health, overview.alerts);

  return {
    analytics: {
      month,
      year,
      totalIncome,
      totalExpenses,
      remainingBalance: savings,
      savings: Math.max(0, savings),
      savingsRate: healthInput.savingsRateValue,
      budgetUtilization,
      spendableBudget,
      remainingBudget,
      hasBudget: Boolean(overview.budget),
      isOverallOverspent: overview.isOverallOverspent,
      recurringExpenseTotal,
      plannedExpenseTotal,
      expensesByCategory,
      monthlyTrend,
      dailySpending,
      health,
      insights,
    },
    error: null,
  };
}

function scoreFinancialHealth(input: {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRateValue: number;
  budgetUtilization: number;
  isOverallOverspent: boolean;
  overspentCategories: number;
  hasBudget: boolean;
  recurringExpenseTotal: number;
  plannedExpenseTotal: number;
}): FinancialHealth {
  if (input.totalIncome <= 0 && input.totalExpenses <= 0) {
    return {
      score: 0,
      label: "Getting started",
      summary: "Add income and expenses to unlock your financial health score.",
    };
  }

  let score = 50;

  if (input.savingsRateValue >= 20) score += 20;
  else if (input.savingsRateValue >= 10) score += 12;
  else if (input.savingsRateValue > 0) score += 5;
  else score -= 15;

  if (input.hasBudget) score += 10;
  if (input.budgetUtilization <= 70) score += 10;
  else if (input.budgetUtilization <= 90) score += 4;
  else if (input.isOverallOverspent) score -= 15;

  score -= Math.min(20, input.overspentCategories * 5);

  if (input.totalIncome > 0) {
    const recurringShare = clampPercent(
      (input.recurringExpenseTotal / input.totalIncome) * 100,
    );
    if (recurringShare > 50) score -= 8;
    else if (recurringShare < 30) score += 4;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Needs attention";
  if (score >= 80) label = "Excellent";
  else if (score >= 65) label = "Healthy";
  else if (score >= 45) label = "Fair";

  return {
    score,
    label,
    summary:
      score >= 65
        ? "Your spending and savings look balanced for this period."
        : "There is room to tighten spending or increase savings this month.",
  };
}
