import type { SavingsSummary } from "@/features/savings/queries";
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

type SavingsSummaryCardsProps = {
  summary: SavingsSummary;
  currency: string;
};

export function SavingsSummaryCards({
  summary,
  currency,
}: SavingsSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total saved</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(summary.totalSaved, currency)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            of {formatCurrency(summary.totalTarget, currency)} target
          </p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Remaining to goals</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(summary.totalRemaining, currency)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Emergency fund</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(summary.emergencySaved, currency)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Target {formatCurrency(summary.emergencyTarget, currency)}
          </p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Investments</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatCurrency(summary.investmentSaved, currency)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Target {formatCurrency(summary.investmentTarget, currency)}
          </p>
        </CardHeader>
      </Card>
      <Card className="sm:col-span-2 xl:col-span-4">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardDescription>Overall progress</CardDescription>
              <CardTitle className="text-xl">
                {summary.completedCount} of {summary.goalCount} goals completed
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPercent(summary.overallProgress)} funded
            </p>
          </div>
          <Progress value={summary.overallProgress} className="mt-3" />
        </CardHeader>
      </Card>
    </div>
  );
}
