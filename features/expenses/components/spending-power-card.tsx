import Link from "next/link";

import type { SpendingPower } from "@/features/expenses/queries";
import { MONTH_NAMES } from "@/features/expenses/meta";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/finance-calculations";

type SpendingPowerCardProps = {
  power: SpendingPower;
  currency: string;
};

export function SpendingPowerCard({ power, currency }: SpendingPowerCardProps) {
  const periodLabel = `${MONTH_NAMES[power.month - 1]} ${power.year}`;
  const overspent = power.remaining < 0;
  const usedRatio =
    power.capacity > 0
      ? Math.min(100, Math.max(0, (power.spent / power.capacity) * 100))
      : 0;

  return (
    <Card className="animate-fade-up overflow-hidden border-0 bg-gradient-to-br from-primary/15 via-card to-chart-4/10 ring-primary/20">
      <CardHeader>
        <CardDescription className="font-medium text-foreground/70">
          Spending power · {periodLabel}
        </CardDescription>
        <CardTitle
          className={`font-heading text-3xl tabular-nums tracking-tight sm:text-4xl ${overspent ? "text-destructive" : "text-foreground"}`}
        >
          {formatCurrency(power.remaining, currency)}
          <span className="ml-2 text-base font-medium text-muted-foreground">
            left
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="h-2 overflow-hidden rounded-full bg-background/70">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${overspent ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${usedRatio}%` }}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Metric
            label="Income"
            value={formatCurrency(power.income, currency)}
          />
          <Metric
            label="Credit limit"
            value={formatCurrency(power.creditCardLimit, currency)}
          />
          <Metric
            label="Spent"
            value={formatCurrency(power.spent, currency)}
          />
        </div>
        {power.creditCardLimit <= 0 ? (
          <p>
            Set your{" "}
            <Link
              href="/profile"
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              credit card limit
            </Link>{" "}
            on Profile to include it here.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/50 px-3 py-2 ring-1 ring-border/50 transition-colors hover:bg-background/80">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-heading text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
