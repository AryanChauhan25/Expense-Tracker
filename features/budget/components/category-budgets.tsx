import type { CategoryBudgetStatus } from "@/features/budget/queries";
import { Badge } from "@/components/ui/badge";
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

type CategoryBudgetsProps = {
  categories: CategoryBudgetStatus[];
  currency: string;
  hasBudget: boolean;
};

export function CategoryBudgets({
  categories,
  currency,
  hasBudget,
}: CategoryBudgetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category budgets</CardTitle>
        <CardDescription>
          Limits are derived from each category&apos;s budget percentage of the
          spendable monthly budget.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasBudget ? (
          <p className="text-sm text-muted-foreground">
            Save a monthly budget to calculate category limits.
          </p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories with budget percentages are available.
          </p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                    aria-hidden
                  />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="secondary">
                    {formatPercent(category.budgetPercentage, 0)}
                  </Badge>
                  {category.isOverspent ? (
                    <Badge variant="destructive">Overspent</Badge>
                  ) : null}
                </div>
                <div className="text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(category.spent, currency)} /{" "}
                  {formatCurrency(category.limit, currency)}
                </div>
              </div>
              <Progress
                value={category.utilization}
                className={
                  category.isOverspent
                    ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                    : category.utilization >= 90
                      ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
                      : undefined
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatPercent(category.utilization)} used</span>
                <span
                  className={
                    category.remaining < 0 ? "text-destructive" : undefined
                  }
                >
                  {formatCurrency(category.remaining, currency)} remaining
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
