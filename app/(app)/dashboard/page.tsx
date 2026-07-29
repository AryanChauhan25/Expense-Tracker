import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireProfile } from "@/features/auth/queries";
import { formatCurrency } from "@/utils/finance-calculations";

export const metadata: Metadata = {
  title: "Dashboard",
};

const summaryCards = [
  { key: "income", label: "Total income" },
  { key: "expenses", label: "Total expenses" },
  { key: "balance", label: "Remaining balance" },
  { key: "savings", label: "Savings" },
] as const;

export default async function DashboardPage() {
  const profile = await requireProfile();

  return (
    <>
      <PageHeader
        title={`Hello, ${profile.name || "there"}`}
        description="Your financial overview. Income and expense data arrives in the next phases."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {formatCurrency(0, profile.currency)}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <EmptyState
          icon={Wallet}
          title="No financial data yet"
          description="Authentication and the database are ready. Income tracking (Phase 3) and expenses (Phase 4) come next."
        />
      </div>
    </>
  );
}
