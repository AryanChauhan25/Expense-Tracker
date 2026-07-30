import { createClient } from "@/lib/supabase/server";
import { listExpenseCategories } from "@/features/expenses/queries";
import type { Tables } from "@/types/database";
import {
  clampPercent,
  expenseShareOfIncome,
  remainingBalance,
  savingsRate,
} from "@/utils/finance-calculations";

export type MonthlyBudgetRow = Tables<"monthly_budget">;

export type CategoryBudgetStatus = {
  id: string;
  name: string;
  color: string;
  budgetPercentage: number;
  limit: number;
  spent: number;
  remaining: number;
  utilization: number;
  isOverspent: boolean;
};

export type BudgetAlert = {
  id: string;
  severity: "warning" | "danger" | "info";
  message: string;
};

export type BudgetOverview = {
  budget: MonthlyBudgetRow | null;
  month: number;
  year: number;
  actualIncome: number;
  actualExpenses: number;
  spendableBudget: number;
  remainingBudget: number;
  overallUtilization: number;
  savingsRateValue: number;
  expenseShare: number;
  isOverallOverspent: boolean;
  categories: CategoryBudgetStatus[];
  alerts: BudgetAlert[];
};

export function currentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export async function getMonthlyBudget(
  month: number,
  year: number,
): Promise<{ budget: MonthlyBudgetRow | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { budget: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("monthly_budget")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (error) {
    return { budget: null, error: error.message };
  }

  return { budget: data, error: null };
}

export async function getBudgetOverview(
  month: number,
  year: number,
): Promise<{ overview: BudgetOverview | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { overview: null, error: "Not authenticated." };
  }

  const [budgetResult, categoriesResult, incomeResult, expensesResult] =
    await Promise.all([
      getMonthlyBudget(month, year),
      listExpenseCategories(),
      supabase
        .from("income")
        .select("amount")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year),
      supabase
        .from("expenses")
        .select("amount, category_id")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year),
    ]);

  if (budgetResult.error) {
    return { overview: null, error: budgetResult.error };
  }

  if (categoriesResult.error) {
    return { overview: null, error: categoriesResult.error };
  }

  if (incomeResult.error) {
    return { overview: null, error: incomeResult.error.message };
  }

  if (expensesResult.error) {
    return { overview: null, error: expensesResult.error.message };
  }

  const budget = budgetResult.budget;
  const expectedIncome = Number(budget?.expected_income ?? 0);
  const plannedSavings = Number(budget?.planned_savings ?? 0);
  const spendableBudget = Math.max(0, expectedIncome - plannedSavings);

  const actualIncome = (incomeResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );

  const spentByCategory = new Map<string, number>();
  let actualExpenses = 0;

  for (const row of expensesResult.data ?? []) {
    const amount = Number(row.amount);
    actualExpenses += amount;
    if (row.category_id) {
      spentByCategory.set(
        row.category_id,
        (spentByCategory.get(row.category_id) ?? 0) + amount,
      );
    }
  }

  const remainingBudget = remainingBalance(spendableBudget, actualExpenses);
  const overallUtilization =
    spendableBudget > 0
      ? clampPercent((actualExpenses / spendableBudget) * 100)
      : actualExpenses > 0
        ? 100
        : 0;
  const isOverallOverspent =
    spendableBudget > 0 && actualExpenses > spendableBudget;

  const categories: CategoryBudgetStatus[] = categoriesResult.categories
    .filter((category) => Number(category.budget_percentage ?? 0) > 0)
    .map((category) => {
      const budgetPercentage = Number(category.budget_percentage ?? 0);
      const limit = (spendableBudget * budgetPercentage) / 100;
      const spent = spentByCategory.get(category.id) ?? 0;
      const remaining = limit - spent;
      const utilization =
        limit > 0
          ? clampPercent((spent / limit) * 100)
          : spent > 0
            ? 100
            : 0;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        budgetPercentage,
        limit,
        spent,
        remaining,
        utilization,
        isOverspent: limit > 0 && spent > limit,
      };
    })
    .sort((a, b) => b.utilization - a.utilization || b.spent - a.spent);

  const alerts: BudgetAlert[] = [];

  if (!budget) {
    alerts.push({
      id: "missing-budget",
      severity: "info",
      message:
        "No monthly budget set yet. Add expected income and planned savings to unlock category limits.",
    });
  }

  if (isOverallOverspent) {
    alerts.push({
      id: "overall-overspent",
      severity: "danger",
      message: "Overall spending has exceeded this month's spendable budget.",
    });
  } else if (spendableBudget > 0 && overallUtilization >= 90) {
    alerts.push({
      id: "overall-warning",
      severity: "warning",
      message: `You have used ${overallUtilization.toFixed(0)}% of this month's spendable budget.`,
    });
  }

  for (const category of categories) {
    if (category.isOverspent) {
      alerts.push({
        id: `over-${category.id}`,
        severity: "danger",
        message: `${category.name} is over its ${category.budgetPercentage}% category limit.`,
      });
    } else if (category.limit > 0 && category.utilization >= 90) {
      alerts.push({
        id: `warn-${category.id}`,
        severity: "warning",
        message: `${category.name} is at ${category.utilization.toFixed(0)}% of its category budget.`,
      });
    }
  }

  if (budget && plannedSavings > 0 && actualIncome > 0) {
    const realizedSavings = Math.max(0, actualIncome - actualExpenses);
    if (realizedSavings < plannedSavings) {
      alerts.push({
        id: "savings-behind",
        severity: "warning",
        message:
          "Actual savings so far are behind the planned savings target for this month.",
      });
    }
  }

  return {
    overview: {
      budget,
      month,
      year,
      actualIncome,
      actualExpenses,
      spendableBudget,
      remainingBudget,
      overallUtilization,
      savingsRateValue: savingsRate(
        expectedIncome || actualIncome,
        plannedSavings,
      ),
      expenseShare: expenseShareOfIncome(
        expectedIncome || actualIncome,
        actualExpenses,
      ),
      isOverallOverspent,
      categories,
      alerts,
    },
    error: null,
  };
}
