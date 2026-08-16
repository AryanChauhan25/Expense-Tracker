import type { FinancialReport } from "@/features/reports/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  formatPercent,
} from "@/utils/finance-calculations";

type ReportBreakdownProps = {
  report: FinancialReport;
};

export function ReportBreakdown({ report }: ReportBreakdownProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses by payment</CardTitle>
          <CardDescription>
            How spending was paid for in the selected range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.expensesByPaymentMethod.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses in this range.
            </p>
          ) : (
            report.expensesByPaymentMethod.map((row) => (
              <div key={row.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: row.color }}
                      aria-hidden
                    />
                    {row.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCurrency(row.amount, report.currency)} ·{" "}
                    {formatPercent(row.share)}
                  </span>
                </div>
                <Progress value={row.share} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income by category</CardTitle>
          <CardDescription>
            How earnings were distributed in this range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.incomeByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No income categories in this range.
            </p>
          ) : (
            report.incomeByCategory.map((row) => (
              <div key={row.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{row.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCurrency(row.amount, report.currency)} ·{" "}
                    {formatPercent(row.share)}
                  </span>
                </div>
                <Progress value={row.share} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Savings goals snapshot</CardTitle>
          <CardDescription>
            Current goal balances (not limited to the date range).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.savings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No savings goals created yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {report.savings.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg border px-3 py-3 text-sm"
                >
                  <p className="font-medium">{goal.displayName}</p>
                  <p className="text-muted-foreground">{goal.typeLabel}</p>
                  <p className="mt-2 tabular-nums">
                    {formatCurrency(Number(goal.saved_amount), report.currency)}{" "}
                    / {formatCurrency(Number(goal.target_amount), report.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
