import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Income",
};

export default function IncomePage() {
  return (
    <>
      <PageHeader
        title="Income"
        description="Salary, business, freelance and other income sources."
      />
      <EmptyState
        icon={TrendingUp}
        title="Income tracking arrives in Phase 3"
        description="The income table and RLS policies are already in place, so records can be added as soon as the module is built."
      />
    </>
  );
}
