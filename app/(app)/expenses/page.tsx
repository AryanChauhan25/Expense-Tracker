import type { Metadata } from "next";
import { Suspense } from "react";
import { Receipt } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { requireProfile } from "@/features/auth/queries";
import { ExpenseDialog } from "@/features/expenses/components/expense-dialog";
import { ExpenseFiltersBar } from "@/features/expenses/components/expense-filters";
import { ExpenseSummaryCards } from "@/features/expenses/components/expense-summary";
import { ExpenseTable } from "@/features/expenses/components/expense-table";
import { SpendingPowerCard } from "@/features/expenses/components/spending-power-card";
import {
  currentPeriod,
  getSpendingPower,
  listExpenses,
  summarizeExpenses,
} from "@/features/expenses/queries";
import { expenseFiltersSchema } from "@/lib/validations/expense";

export const metadata: Metadata = {
  title: "Expenses",
};

type ExpensesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
) {
  const pick = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = expenseFiltersSchema.safeParse({
    month: pick("month") || undefined,
    year: pick("year") || undefined,
    payment_method: pick("payment_method") || undefined,
    q: pick("q") || undefined,
  });

  if (!parsed.success) {
    return {};
  }

  const filters = { ...parsed.data };
  if (!filters.payment_method) {
    delete filters.payment_method;
  }
  if (!filters.q) {
    delete filters.q;
  }

  return filters;
}

function availableYears(): number[] {
  const { year } = currentPeriod();
  return [year, year - 1, year - 2, year - 3, year - 4];
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const profile = await requireProfile();
  const filters = parseSearchParams(await searchParams);
  const period = currentPeriod();

  const [expensesResult, powerResult] = await Promise.all([
    listExpenses(filters),
    getSpendingPower(period.month, period.year),
  ]);

  const { rows, error: expensesError } = expensesResult;
  const error = expensesError ?? powerResult.error;
  const summary = summarizeExpenses(rows);
  const hasActiveFilters = Boolean(
    filters.month || filters.year || filters.payment_method || filters.q,
  );

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Log daily spends: what, where, how much, and how you paid."
        action={<ExpenseDialog />}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load expenses</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        {powerResult.power ? (
          <SpendingPowerCard
            power={powerResult.power}
            currency={profile.currency}
          />
        ) : null}

        <ExpenseSummaryCards summary={summary} currency={profile.currency} />

        <Suspense fallback={<Skeleton className="h-10 w-full rounded-md" />}>
          <ExpenseFiltersBar
            month={filters.month}
            year={filters.year}
            payment_method={filters.payment_method}
            q={filters.q}
            years={availableYears()}
          />
        </Suspense>

        {rows.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={
              hasActiveFilters
                ? "No matching expenses"
                : "No expenses recorded yet"
            }
            description={
              hasActiveFilters
                ? "Try clearing filters or adjusting month, year or payment method."
                : "Add something like ₹350 Swiggy food on credit card."
            }
            action={hasActiveFilters ? undefined : <ExpenseDialog />}
          />
        ) : (
          <ExpenseTable rows={rows} currency={profile.currency} />
        )}
      </div>
    </>
  );
}
