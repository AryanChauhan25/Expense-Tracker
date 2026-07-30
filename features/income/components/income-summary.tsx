import type { IncomeSummary } from "@/features/income/queries";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INCOME_CATEGORY_LABELS } from "@/lib/validations/income";
import { INCOME_CATEGORIES } from "@/types/finance";
import { formatCurrency } from "@/utils/finance-calculations";

type IncomeSummaryCardsProps = {
  summary: IncomeSummary;
  currency: string;
};

export function IncomeSummaryCards({
  summary,
  currency,
}: IncomeSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      <Card className="sm:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardDescription>By category</CardDescription>
          <div className="mt-1 space-y-1.5">
            {INCOME_CATEGORIES.map((category) => {
              const amount = summary.byCategory[category];
              if (amount <= 0) return null;
              return (
                <div
                  key={category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {INCOME_CATEGORY_LABELS[category]}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              );
            })}
            {summary.count === 0 ? (
              <p className="text-sm text-muted-foreground">No income yet</p>
            ) : null}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
