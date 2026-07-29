import type { Metadata } from "next";
import { Receipt } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Expenses",
};

export default function ExpensesPage() {
  return (
    <>
      <PageHeader
        title="Expenses"
        description="Categorised spending, recurring costs and planned future expenses."
      />
      <EmptyState
        icon={Receipt}
        title="Expense tracking arrives in Phase 4"
        description="Default categories were seeded during the migration and are ready to use."
      />
    </>
  );
}
