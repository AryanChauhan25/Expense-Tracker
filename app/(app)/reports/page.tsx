import type { Metadata } from "next";
import { LineChart } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Daily, weekly, monthly, yearly and custom range analysis."
      />
      <EmptyState
        icon={LineChart}
        title="Reports and exports arrive in Phase 8"
        description="Period columns are generated in the database, so range queries stay fast."
      />
    </>
  );
}
