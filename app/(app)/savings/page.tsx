import type { Metadata } from "next";
import { Landmark } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Savings",
};

export default function SavingsPage() {
  return (
    <>
      <PageHeader
        title="Savings"
        description="Emergency fund, savings goals and investment allocation."
      />
      <EmptyState
        icon={Landmark}
        title="Savings goals arrive in Phase 7"
        description="The saving_goals table tracks target amounts, progress and deadlines."
      />
    </>
  );
}
