import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireProfile } from "@/features/auth/queries";
import { BudgetAlerts } from "@/features/budget/components/budget-alerts";
import { BudgetForm } from "@/features/budget/components/budget-form";
import { BudgetPeriodPicker } from "@/features/budget/components/budget-period-picker";
import { BudgetSummaryCards } from "@/features/budget/components/budget-summary";
import { CategoryBudgets } from "@/features/budget/components/category-budgets";
import {
  currentPeriod,
  getBudgetOverview,
} from "@/features/budget/queries";
import { MONTH_NAMES } from "@/features/budget/meta";
import { budgetPeriodSchema } from "@/lib/validations/budget";
import {
  formatCurrency,
  formatPercent,
} from "@/utils/finance-calculations";

export const metadata: Metadata = {
  title: "Budget",
};

type BudgetPageProps = {
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

  if (!parsed.success) {
    return defaults;
  }

  return parsed.data;
}

function availableYears(): number[] {
  const { year } = currentPeriod();
  return [year + 1, year, year - 1, year - 2, year - 3];
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const profile = await requireProfile();
  const period = parsePeriod(await searchParams);
  const { overview, error } = await getBudgetOverview(
    period.month,
    period.year,
  );

  return (
    <>
      <PageHeader
        title="Budget planner"
        description={`Monthly budgets, category limits and overspending alerts for ${MONTH_NAMES[period.month - 1]} ${period.year}.`}
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
          <AlertTitle>Could not load budget</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {overview ? (
        <div className="space-y-6">
          <BudgetAlerts alerts={overview.alerts} />

          <BudgetSummaryCards overview={overview} currency={profile.currency} />

          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Monthly budget</CardTitle>
                <CardDescription>
                  Set expected income and planned savings for this period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetForm
                  key={`${period.month}-${period.year}-${overview.budget?.updated_at ?? "new"}`}
                  month={period.month}
                  year={period.year}
                  budget={overview.budget}
                  currency={profile.currency}
                />
              </CardContent>
            </Card>

            <CategoryBudgets
              categories={overview.categories}
              currency={profile.currency}
              hasBudget={Boolean(overview.budget)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Period snapshot</CardTitle>
              <CardDescription>
                Quick ratios based on your planned figures and logged activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Planned savings rate</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatPercent(overview.savingsRateValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expense share</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatPercent(overview.expenseShare)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actual surplus</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatCurrency(
                    overview.actualIncome - overview.actualExpenses,
                    profile.currency,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
