"use client";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { DailySpendPoint } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/finance-calculations";

type DailySpendingHeatmapProps = {
  data: DailySpendPoint[];
  currency: string;
  month: number;
  year: number;
};

function intensityClass(amount: number, max: number): string {
  if (amount <= 0 || max <= 0) {
    return "bg-muted";
  }

  const ratio = amount / max;
  if (ratio > 0.75) return "bg-foreground/80";
  if (ratio > 0.5) return "bg-foreground/55";
  if (ratio > 0.25) return "bg-foreground/35";
  return "bg-foreground/20";
}

export function DailySpendingHeatmap({
  data,
  currency,
  month,
  year,
}: DailySpendingHeatmapProps) {
  const max = Math.max(...data.map((point) => point.amount), 0);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const blanks = Array.from({ length: firstWeekday }, (_, index) => index);
  const hasData = max > 0;

  return (
    <ChartCard
      title="Daily spending"
      description="Heatmap of spend intensity for each day in the selected month."
    >
      {!hasData ? (
        <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
          No daily expenses to map for this month.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="aspect-square" />
            ))}
            {data.map((point) => (
              <div
                key={point.date}
                title={`${point.date}: ${formatCurrency(point.amount, currency)}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-sm text-[10px] tabular-nums text-background",
                  intensityClass(point.amount, max),
                  point.amount <= 0 && "text-muted-foreground",
                )}
              >
                {point.day}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <span className="size-3 rounded-sm bg-muted" />
            <span className="size-3 rounded-sm bg-foreground/20" />
            <span className="size-3 rounded-sm bg-foreground/35" />
            <span className="size-3 rounded-sm bg-foreground/55" />
            <span className="size-3 rounded-sm bg-foreground/80" />
            <span>More</span>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
