"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { MonthlyTrendPoint } from "@/features/dashboard/queries";
import { formatCurrency } from "@/utils/finance-calculations";

type IncomeVsExpensesChartProps = {
  data: MonthlyTrendPoint[];
  currency: string;
};

export function IncomeVsExpensesChart({
  data,
  currency,
}: IncomeVsExpensesChartProps) {
  const hasData = data.some((point) => point.income > 0 || point.expenses > 0);

  return (
    <ChartCard
      title="Income vs expenses"
      description="Month-by-month comparison over the last six months."
    >
      {!hasData ? (
        <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
          No trend data yet. Add income and expenses across months.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
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
              <Bar
                dataKey="income"
                name="Income"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
