import type { Metadata } from "next";
import { PiggyBank } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Budget",
};

export default function BudgetPage() {
  return (
    <>
      <PageHeader
        title="Budget planner"
        description="Monthly budgets, category limits and overspending alerts."
      />
      <EmptyState
        icon={PiggyBank}
        title="Budget planning arrives in Phase 5"
        description="Monthly budget records are scoped per user and month in the database."
      />
    </>
  );
}
