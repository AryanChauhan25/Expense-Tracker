import type { Metadata } from "next";
import { Suspense } from "react";
import { Landmark } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { requireProfile } from "@/features/auth/queries";
import { AllocationChart } from "@/features/savings/components/allocation-chart";
import { SavingGoalDialog } from "@/features/savings/components/saving-goal-dialog";
import { SavingGoalsList } from "@/features/savings/components/saving-goals-list";
import { SavingsFiltersBar } from "@/features/savings/components/savings-filters";
import { SavingsSummaryCards } from "@/features/savings/components/savings-summary";
import {
  listSavingGoals,
  summarizeSavingGoals,
} from "@/features/savings/queries";
import { savingsFiltersSchema } from "@/lib/validations/savings";

export const metadata: Metadata = {
  title: "Savings",
};

type SavingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
) {
  const pick = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = savingsFiltersSchema.safeParse({
    type: pick("type") || undefined,
    status: pick("status") || undefined,
    q: pick("q") || undefined,
  });

  if (!parsed.success) {
    return {};
  }

  const filters = { ...parsed.data };
  if (!filters.type || filters.type === "all") {
    delete filters.type;
  }
  if (!filters.status || filters.status === "all") {
    delete filters.status;
  }
  if (!filters.q) {
    delete filters.q;
  }

  return filters;
}

export default async function SavingsPage({ searchParams }: SavingsPageProps) {
  const profile = await requireProfile();
  const filters = parseSearchParams(await searchParams);
  const { rows, error } = await listSavingGoals(filters);
  const summary = summarizeSavingGoals(rows);
  const hasActiveFilters = Boolean(filters.type || filters.status || filters.q);

  return (
    <>
      <PageHeader
        title="Savings"
        description="Emergency fund, savings goals and investment allocation."
        action={<SavingGoalDialog />}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load savings</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        <SavingsSummaryCards summary={summary} currency={profile.currency} />

        <AllocationChart summary={summary} currency={profile.currency} />

        <Suspense fallback={<Skeleton className="h-10 w-full rounded-md" />}>
          <SavingsFiltersBar
            type={filters.type}
            status={filters.status}
            q={filters.q}
          />
        </Suspense>

        {rows.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title={
              hasActiveFilters
                ? "No matching savings goals"
                : "No savings goals yet"
            }
            description={
              hasActiveFilters
                ? "Try clearing filters or adjusting type and status."
                : "Create an emergency fund, a personal goal, or an investment target to start tracking."
            }
            action={hasActiveFilters ? undefined : <SavingGoalDialog />}
          />
        ) : (
          <SavingGoalsList goals={rows} currency={profile.currency} />
        )}
      </div>
    </>
  );
}
