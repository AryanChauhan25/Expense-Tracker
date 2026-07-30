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
import {
  currentPeriod,
  listExpenseCategories,
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
    category_id: pick("category_id") || undefined,
    recurring: pick("recurring") || undefined,
    timing: pick("timing") || undefined,
    q: pick("q") || undefined,
  });

  if (!parsed.success) {
    return {};
  }

  const filters = { ...parsed.data };
  if (!filters.category_id) {
    delete filters.category_id;
  }
  if (!filters.q) {
    delete filters.q;
  }
  if (!filters.recurring || filters.recurring === "all") {
    delete filters.recurring;
  }
  if (!filters.timing || filters.timing === "all") {
    delete filters.timing;
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

  const [categoriesResult, expensesResult] = await Promise.all([
    listExpenseCategories(),
    listExpenses(filters),
  ]);

  const { categories, error: categoriesError } = categoriesResult;
  const { rows, error: expensesError } = expensesResult;
  const error = categoriesError ?? expensesError;
  const summary = summarizeExpenses(rows);
  const hasActiveFilters = Boolean(
    filters.month ||
      filters.year ||
      filters.category_id ||
      filters.recurring ||
      filters.timing ||
      filters.q,
  );

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Categorised spending, recurring costs and planned future expenses."
        action={<ExpenseDialog categories={categories} />}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load expenses</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        <ExpenseSummaryCards summary={summary} currency={profile.currency} />

        <Suspense fallback={<Skeleton className="h-10 w-full rounded-md" />}>
          <ExpenseFiltersBar
            month={filters.month}
            year={filters.year}
            category_id={filters.category_id}
            recurring={filters.recurring}
            timing={filters.timing}
            q={filters.q}
            years={availableYears()}
            categories={categories}
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
                ? "Try clearing filters or adjusting month, category, recurring or planned."
                : "Add your first expense to start tracking spending by category."
            }
            action={
              hasActiveFilters ? undefined : (
                <ExpenseDialog categories={categories} />
              )
            }
          />
        ) : (
          <ExpenseTable
            rows={rows}
            categories={categories}
            currency={profile.currency}
          />
        )}
      </div>
    </>
  );
}
