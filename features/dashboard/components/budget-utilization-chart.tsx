"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import { formatPercent } from "@/utils/finance-calculations";

type BudgetUtilizationChartProps = {
  utilization: number;
  hasBudget: boolean;
  isOverspent: boolean;
};

export function BudgetUtilizationChart({
  utilization,
  hasBudget,
  isOverspent,
}: BudgetUtilizationChartProps) {
  const used = Math.min(100, Math.max(0, utilization));
  const remaining = Math.max(0, 100 - used);
  const data = [
    { name: "Used", value: used },
    { name: "Remaining", value: remaining },
  ];

  const usedColor = isOverspent
    ? "var(--destructive)"
    : used >= 90
      ? "#f59e0b"
      : "var(--chart-2)";

  return (
    <ChartCard
      title="Budget utilization"
      description="How much of this month's spendable budget is used."
    >
      {!hasBudget ? (
        <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
          Set a monthly budget to see utilization.
        </div>
      ) : (
        <div className="relative h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={96}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
              >
                <Cell fill={usedColor} />
                <Cell fill="var(--muted)" />
              </Pie>
              <Tooltip formatter={(value) => formatPercent(Number(value ?? 0), 0)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-semibold tabular-nums">
              {formatPercent(used, 0)}
            </p>
            <p className="text-xs text-muted-foreground">used</p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
