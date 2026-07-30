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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total (filtered)</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(summary.total, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Entries</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {summary.count}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Recurring</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(summary.recurringTotal, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Planned future</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(summary.plannedTotal, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      {summary.byCategory.length > 0 ? (
        <Card className="sm:col-span-2 xl:col-span-4">
          <CardHeader>
            <CardDescription>By category</CardDescription>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {summary.byCategory.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden
                    />
                    <span className="truncate">{category.name}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(category.total, currency)}
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
