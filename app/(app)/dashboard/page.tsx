import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireProfile } from "@/features/auth/queries";
import { BudgetPeriodPicker } from "@/features/budget/components/budget-period-picker";
import { MONTH_NAMES } from "@/features/budget/meta";
import { BudgetUtilizationChart } from "@/features/dashboard/components/budget-utilization-chart";
import { DailySpendingHeatmap } from "@/features/dashboard/components/daily-spending-heatmap";
import { DashboardSummaryCards } from "@/features/dashboard/components/dashboard-summary";
import { ExpensesByCategoryChart } from "@/features/dashboard/components/expenses-by-category-chart";
import { IncomeVsExpensesChart } from "@/features/dashboard/components/income-vs-expenses-chart";
import { MonthlyTrendChart } from "@/features/dashboard/components/monthly-trend-chart";
import { SavingsGrowthChart } from "@/features/dashboard/components/savings-growth-chart";
import {
  HealthScoreCard,
  SmartInsights,
} from "@/features/dashboard/components/smart-insights";
import {
  currentPeriod,
  getDashboardAnalytics,
} from "@/features/dashboard/queries";
import { budgetPeriodSchema } from "@/lib/validations/budget";

export const metadata: Metadata = {
  title: "Dashboard",
};

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePeriod(
  raw: Record<string, string | string[] | undefined>,
): { month: number; year: number } {
  const pick = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const defaults = currentPeriod();
  const parsed = budgetPeriodSchema.safeParse({
    month: pick("month") || defaults.month,
    year: pick("year") || defaults.year,
  });

  return parsed.success ? parsed.data : defaults;
}

function availableYears(): number[] {
  const { year } = currentPeriod();
  return [year + 1, year, year - 1, year - 2, year - 3];
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const profile = await requireProfile();
  const period = parsePeriod(await searchParams);
  const { analytics, error } = await getDashboardAnalytics(
    period.month,
    period.year,
  );

  const hasActivity =
    Boolean(analytics) &&
    (analytics!.totalIncome > 0 ||
      analytics!.totalExpenses > 0 ||
      analytics!.monthlyTrend.some(
        (point) => point.income > 0 || point.expenses > 0,
      ));

  return (
    <>
      <PageHeader
        title={`Hello, ${profile.name || "there"}`}
        description={`Analytics and insights for ${MONTH_NAMES[period.month - 1]} ${period.year}.`}
        action={
          <Suspense fallback={<Skeleton className="h-9 w-64" />}>
            <BudgetPeriodPicker
              month={period.month}
              year={period.year}
              years={availableYears()}
            />
          </Suspense>
        }
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {analytics ? (
        <div className="space-y-6">
          <DashboardSummaryCards
            analytics={analytics}
            currency={profile.currency}
          />

          {!hasActivity ? (
            <EmptyState
              icon={Wallet}
              title="No financial data yet"
              description="Add income and expenses to unlock charts, trends and smart insights."
              action={
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href="/income">Add income</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/expenses">Add expense</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                <HealthScoreCard health={analytics.health} />
                <SmartInsights insights={analytics.insights} />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <ExpensesByCategoryChart
                  data={analytics.expensesByCategory}
                  currency={profile.currency}
                />
                <BudgetUtilizationChart
                  utilization={analytics.budgetUtilization}
                  hasBudget={analytics.hasBudget}
                  isOverspent={analytics.isOverallOverspent}
                />
                <IncomeVsExpensesChart
                  data={analytics.monthlyTrend}
                  currency={profile.currency}
                />
                <MonthlyTrendChart
                  data={analytics.monthlyTrend}
                  currency={profile.currency}
                />
                <SavingsGrowthChart
                  data={analytics.monthlyTrend}
                  currency={profile.currency}
                />
                <DailySpendingHeatmap
                  data={analytics.dailySpending}
                  currency={profile.currency}
                  month={period.month}
                  year={period.year}
                />
              </div>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
