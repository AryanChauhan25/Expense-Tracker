import type { MoneyLoanSummary } from "@/features/loans/queries";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/finance-calculations";

type MoneyLoanSummaryCardsProps = {
  summary: MoneyLoanSummary;
  currency: string;
};

export function MoneyLoanSummaryCards({
  summary,
  currency,
}: MoneyLoanSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="animate-fade-up stagger-1">
        <CardHeader>
          <CardDescription>Owed to you</CardDescription>
          <CardTitle className="font-heading text-2xl tabular-nums tracking-tight text-primary sm:text-3xl">
            {formatCurrency(summary.owedToYou, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="animate-fade-up stagger-2">
        <CardHeader>
          <CardDescription>You owe</CardDescription>
          <CardTitle className="font-heading text-2xl tabular-nums tracking-tight sm:text-3xl">
            {formatCurrency(summary.youOwe, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="animate-fade-up stagger-3">
        <CardHeader>
          <CardDescription>Net position</CardDescription>
          <CardTitle
            className={`font-heading text-2xl tabular-nums tracking-tight sm:text-3xl ${summary.netPosition < 0 ? "text-destructive" : ""}`}
          >
            {formatCurrency(summary.netPosition, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="animate-fade-up stagger-4">
        <CardHeader>
          <CardDescription>Status</CardDescription>
          <CardTitle className="font-heading text-base tracking-tight">
            {summary.openCount} open · {summary.settledCount} settled
            {summary.overdueCount > 0
              ? ` · ${summary.overdueCount} overdue`
              : ""}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
