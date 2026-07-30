import type { BudgetOverview } from "@/features/budget/queries";
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

type BudgetSummaryCardsProps = {
  overview: BudgetOverview;
  currency: string;
};

export function BudgetSummaryCards({
  overview,
  currency,
}: BudgetSummaryCardsProps) {
  const expectedIncome = Number(overview.budget?.expected_income ?? 0);
  const plannedSavings = Number(overview.budget?.planned_savings ?? 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Expected income</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(expectedIncome, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Spendable budget</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(overview.spendableBudget, currency)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            After {formatCurrency(plannedSavings, currency)} planned savings
          </p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Actual expenses</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(overview.actualExpenses, currency)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Income logged: {formatCurrency(overview.actualIncome, currency)}
          </p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Remaining budget</CardDescription>
          <CardTitle
            className={`text-2xl tabular-nums ${overview.remainingBudget < 0 ? "text-destructive" : ""}`}
          >
            {formatCurrency(overview.remainingBudget, currency)}
          </CardTitle>
          <div className="space-y-1.5 pt-2">
            <Progress
              value={overview.overallUtilization}
              className={
                overview.isOverallOverspent
                  ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                  : undefined
              }
            />
            <p className="text-xs text-muted-foreground">
              {formatPercent(overview.overallUtilization)} utilized
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
