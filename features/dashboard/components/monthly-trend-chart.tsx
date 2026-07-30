"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { MonthlyTrendPoint } from "@/features/dashboard/queries";
import { formatCurrency } from "@/utils/finance-calculations";

type MonthlyTrendChartProps = {
  data: MonthlyTrendPoint[];
  currency: string;
};

export function MonthlyTrendChart({
  data,
  currency,
}: MonthlyTrendChartProps) {
  const hasData = data.some((point) => point.income > 0 || point.expenses > 0);

  return (
    <ChartCard
      title="Monthly trend"
      description="Income and expense movement over recent months."
    >
      {!hasData ? (
        <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
          Not enough history for a trend line yet.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
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
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
