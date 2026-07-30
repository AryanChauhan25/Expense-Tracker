import type { BudgetAlert } from "@/features/budget/queries";
import { formatPercent } from "@/utils/finance-calculations";

export type FinancialHealth = {
  score: number;
  label: string;
  summary: string;
};

export type DashboardInsight = {
  id: string;
  tone: "positive" | "warning" | "danger" | "neutral";
  title: string;
  detail: string;
};

export type InsightInput = {
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
};

export function buildInsights(
  input: InsightInput,
  health: FinancialHealth,
  budgetAlerts: BudgetAlert[],
): DashboardInsight[] {
  const insights: DashboardInsight[] = [];

  insights.push({
    id: "health",
    tone:
      health.score >= 65
        ? "positive"
        : health.score >= 45
          ? "warning"
          : "danger",
    title: `Financial health: ${health.label}`,
    detail: health.summary,
  });

  if (input.totalIncome > 0) {
    const suggestedSavings = input.totalIncome * 0.2;
    if (input.savings < suggestedSavings) {
      insights.push({
        id: "savings-suggestion",
        tone: "neutral",
        title: "Savings suggestion",
        detail: `Aim to save about 20% of income (${formatPercent(20, 0)}). You are currently at ${formatPercent(input.savingsRateValue)}.`,
      });
    } else {
      insights.push({
        id: "savings-on-track",
        tone: "positive",
        title: "Savings on track",
        detail: `You are saving ${formatPercent(input.savingsRateValue)} of income — at or above the 20% guideline.`,
      });
    }
  }

  if (input.isOverallOverspent) {
    insights.push({
      id: "overspend",
      tone: "danger",
      title: "Overspending detected",
      detail:
        "Expenses have exceeded your spendable budget for this month. Review category limits on the Budget page.",
    });
  } else if (input.budgetUtilization >= 90 && input.hasBudget) {
    insights.push({
      id: "budget-tight",
      tone: "warning",
      title: "Budget nearly used",
      detail: `${formatPercent(input.budgetUtilization, 0)} of your spendable budget is already used.`,
    });
  }

  if (input.overspentCategories > 0) {
    insights.push({
      id: "category-overspend",
      tone: "warning",
      title: "Category overspend",
      detail: `${input.overspentCategories} categor${input.overspentCategories === 1 ? "y is" : "ies are"} over the planned share.`,
    });
  }

  if (input.recurringExpenseTotal > 0 && input.totalIncome > 0) {
    const share = (input.recurringExpenseTotal / input.totalIncome) * 100;
    insights.push({
      id: "recurring",
      tone: share > 40 ? "warning" : "neutral",
      title: "Recurring expenses",
      detail: `Recurring costs are ${formatPercent(share)} of this month's income.`,
    });
  }

  if (input.plannedExpenseTotal > 0) {
    insights.push({
      id: "planned",
      tone: "neutral",
      title: "Future spending planned",
      detail:
        "You have planned future expenses this month — keep them in mind when free spending.",
    });
  }

  if (!input.hasBudget) {
    insights.push({
      id: "set-budget",
      tone: "neutral",
      title: "Set a monthly budget",
      detail:
        "Define expected income and planned savings to unlock category limits and budget progress.",
    });
  }

  // Surface at most one budget alert that isn't already covered.
  const extra = budgetAlerts.find(
    (alert) =>
      alert.severity !== "info" &&
      !insights.some((insight) =>
        insight.detail.toLowerCase().includes(alert.message.slice(0, 24).toLowerCase()),
      ),
  );
  if (extra) {
    insights.push({
      id: `alert-${extra.id}`,
      tone: extra.severity === "danger" ? "danger" : "warning",
      title: extra.severity === "danger" ? "Budget alert" : "Budget watch",
      detail: extra.message,
    });
  }

  return insights.slice(0, 6);
}
