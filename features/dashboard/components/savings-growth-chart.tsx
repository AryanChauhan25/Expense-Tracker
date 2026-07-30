"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { MonthlyTrendPoint } from "@/features/dashboard/queries";
import { formatCurrency } from "@/utils/finance-calculations";

type SavingsGrowthChartProps = {
  data: MonthlyTrendPoint[];
  currency: string;
};

export function SavingsGrowthChart({
  data,
  currency,
}: SavingsGrowthChartProps) {
  const hasData = data.some(
    (point) => point.income > 0 || point.expenses > 0 || point.savings !== 0,
  );

  return (
    <ChartCard
      title="Savings growth"
      description="Cumulative income minus expenses across the trend window."
    >
      {!hasData ? (
        <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
          Savings growth appears after you log a few months of activity.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value) =>
                  Intl.NumberFormat("en", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(value))
                }
              />
              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0), currency)
                }
              />
              <Area
                type="monotone"
                dataKey="savings"
                name="Cumulative savings"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
