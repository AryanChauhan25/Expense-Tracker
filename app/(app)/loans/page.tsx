import type { Metadata } from "next";
import { Suspense } from "react";
import { HandCoins } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { requireProfile } from "@/features/auth/queries";
import { MoneyLoanDialog } from "@/features/loans/components/money-loan-dialog";
import { MoneyLoanFiltersBar } from "@/features/loans/components/money-loan-filters";
import { MoneyLoanSummaryCards } from "@/features/loans/components/money-loan-summary";
import { MoneyLoansList } from "@/features/loans/components/money-loans-list";
import {
  listMoneyLoans,
  summarizeMoneyLoans,
} from "@/features/loans/queries";
import { moneyLoanFiltersSchema } from "@/lib/validations/loans";

export const metadata: Metadata = {
  title: "Borrow & lend",
};

type LoansPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
) {
  const pick = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = moneyLoanFiltersSchema.safeParse({
    direction: pick("direction") || undefined,
    status: pick("status") || undefined,
    q: pick("q") || undefined,
  });

  if (!parsed.success) {
    return {};
  }

  const filters = { ...parsed.data };
  if (!filters.direction) {
    delete filters.direction;
  }
  if (!filters.status || filters.status === "all") {
    delete filters.status;
  }
  if (!filters.q) {
    delete filters.q;
  }

  return filters;
}

export default async function LoansPage({ searchParams }: LoansPageProps) {
  const profile = await requireProfile();
  const filters = parseSearchParams(await searchParams);
  const { rows, error } = await listMoneyLoans(filters);
  const summary = summarizeMoneyLoans(rows);
  const hasActiveFilters = Boolean(
    filters.direction || filters.status || filters.q,
  );

  return (
    <>
      <PageHeader
        title="Borrow & lend"
        description="Track money you gave others and money you took — then settle it over time."
        action={<MoneyLoanDialog />}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load borrow &amp; lend</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        <MoneyLoanSummaryCards summary={summary} currency={profile.currency} />

        <Suspense fallback={<Skeleton className="h-10 w-full rounded-md" />}>
          <MoneyLoanFiltersBar
            direction={filters.direction}
            status={filters.status}
            q={filters.q}
          />
        </Suspense>

        {rows.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={
              hasActiveFilters
                ? "No matching entries"
                : "No borrow or lend entries yet"
            }
            description={
              hasActiveFilters
                ? "Try clearing filters or adjusting type and status."
                : "Example: you lent ₹2,000 to Rahul, or borrowed ₹5,000 from Priya."
            }
            action={hasActiveFilters ? undefined : <MoneyLoanDialog />}
          />
        ) : (
          <MoneyLoansList loans={rows} currency={profile.currency} />
        )}
      </div>
    </>
  );
}
