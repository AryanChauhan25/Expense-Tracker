import type { ExpenseSummary } from "@/features/expenses/queries";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/finance-calculations";

type ExpenseSummaryCardsProps = {
  summary: ExpenseSummary;
  currency: string;
};

export function ExpenseSummaryCards({
  summary,
  currency,
}: ExpenseSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Card className="animate-fade-up stagger-1">
        <CardHeader>
          <CardDescription>Total (filtered)</CardDescription>
          <CardTitle className="font-heading text-2xl tabular-nums tracking-tight sm:text-3xl">
            {formatCurrency(summary.total, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="animate-fade-up stagger-2">
        <CardHeader>
          <CardDescription>Entries</CardDescription>
          <CardTitle className="font-heading text-2xl tabular-nums tracking-tight sm:text-3xl">
            {summary.count}
          </CardTitle>
        </CardHeader>
      </Card>
      {summary.byPaymentMethod.length > 0 ? (
        <Card className="animate-fade-up stagger-3 sm:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardDescription>By payment method</CardDescription>
            <div className="mt-2 space-y-2">
              {summary.byPaymentMethod.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
                >
                  <span className="truncate text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="shrink-0 font-heading font-semibold tabular-nums">
                    {formatCurrency(item.total, currency)}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
