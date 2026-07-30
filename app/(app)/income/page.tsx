import type { Metadata } from "next";
import { Suspense } from "react";
import { TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { requireProfile } from "@/features/auth/queries";
import { IncomeDialog } from "@/features/income/components/income-dialog";
import { IncomeFiltersBar } from "@/features/income/components/income-filters";
import { IncomeSummaryCards } from "@/features/income/components/income-summary";
import { IncomeTable } from "@/features/income/components/income-table";
import {
  currentPeriod,
  listIncome,
  summarizeIncome,
} from "@/features/income/queries";
import { incomeFiltersSchema } from "@/lib/validations/income";

export const metadata: Metadata = {
  title: "Income",
};

type IncomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
) {
  const pick = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = incomeFiltersSchema.safeParse({
    month: pick("month") || undefined,
    year: pick("year") || undefined,
    category: pick("category") || undefined,
    q: pick("q") || undefined,
  });

  if (!parsed.success) {
    return {};
  }

  const filters = { ...parsed.data };
  if (!filters.category) {
    delete filters.category;
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

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const profile = await requireProfile();
  const filters = parseSearchParams(await searchParams);
  const { rows, error } = await listIncome(filters);
  const summary = summarizeIncome(rows);
  const hasActiveFilters = Boolean(
    filters.month || filters.year || filters.category || filters.q,
  );

  return (
    <>
      <PageHeader
        title="Income"
        description="Salary, business, freelance and other income sources."
        action={<IncomeDialog />}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load income</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        <IncomeSummaryCards summary={summary} currency={profile.currency} />

        <Suspense
          fallback={<Skeleton className="h-10 w-full rounded-md" />}
        >
          <IncomeFiltersBar
            month={filters.month}
            year={filters.year}
            category={filters.category}
            q={filters.q}
            years={availableYears()}
          />
        </Suspense>

        {rows.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title={
              hasActiveFilters ? "No matching income" : "No income recorded yet"
            }
            description={
              hasActiveFilters
                ? "Try clearing filters or adjusting the month, year or category."
                : "Add your first income entry to start tracking monthly funds."
            }
            action={hasActiveFilters ? undefined : <IncomeDialog />}
          />
        ) : (
          <IncomeTable rows={rows} currency={profile.currency} />
        )}
      </div>
    </>
  );
}
