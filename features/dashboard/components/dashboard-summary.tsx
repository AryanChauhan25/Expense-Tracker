import type { DashboardAnalytics } from "@/features/dashboard/queries";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  formatPercent,
} from "@/utils/finance-calculations";

type DashboardSummaryCardsProps = {
  analytics: DashboardAnalytics;
  currency: string;
};

export function DashboardSummaryCards({
  analytics,
  currency,
}: DashboardSummaryCardsProps) {
  const cards = [
    {
      label: "Total income",
      value: formatCurrency(analytics.totalIncome, currency),
      hint: null as string | null,
    },
    {
      label: "Total expenses",
      value: formatCurrency(analytics.totalExpenses, currency),
      hint:
        analytics.recurringExpenseTotal > 0
          ? `${formatCurrency(analytics.recurringExpenseTotal, currency)} recurring`
          : null,
    },
    {
      label: "Remaining balance",
      value: formatCurrency(analytics.remainingBalance, currency),
      hint: `Savings rate ${formatPercent(analytics.savingsRate)}`,
    },
    {
      label: "Savings",
      value: formatCurrency(analytics.savings, currency),
      hint:
        analytics.plannedExpenseTotal > 0
          ? `${formatCurrency(analytics.plannedExpenseTotal, currency)} planned ahead`
          : null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle
              className={`text-2xl tabular-nums ${
                card.label === "Remaining balance" &&
                analytics.remainingBalance < 0
                  ? "text-destructive"
                  : ""
              }`}
            >
              {card.value}
            </CardTitle>
            {card.hint ? (
              <p className="text-xs text-muted-foreground">{card.hint}</p>
            ) : null}
          </CardHeader>
        </Card>
      ))}

      <Card className="sm:col-span-2 xl:col-span-4">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardDescription>Budget progress</CardDescription>
              <CardTitle className="text-xl tabular-nums">
                {formatCurrency(analytics.totalExpenses, currency)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  of {formatCurrency(analytics.spendableBudget, currency)}{" "}
                  spendable
                </span>
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(analytics.remainingBudget, currency)} remaining ·{" "}
              {formatPercent(analytics.budgetUtilization)} used
            </p>
          </div>
          <Progress
            value={analytics.budgetUtilization}
            className={
              analytics.isOverallOverspent
                ? "mt-3 [&_[data-slot=progress-indicator]]:bg-destructive"
                : "mt-3"
            }
          />
        </CardHeader>
      </Card>
    </div>
  );
}
