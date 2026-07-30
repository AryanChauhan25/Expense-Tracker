"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartCard } from "@/features/dashboard/components/chart-card";
import type { CategorySlice } from "@/features/dashboard/queries";
import { formatCurrency } from "@/utils/finance-calculations";

type ExpensesByCategoryChartProps = {
  data: CategorySlice[];
  currency: string;
};

export function ExpensesByCategoryChart({
  data,
  currency,
}: ExpensesByCategoryChartProps) {
  const chartData = data.map((slice) => ({
    name: slice.name,
    value: slice.amount,
    color: slice.color,
  }));

  return (
    <ChartCard
      title="Expenses by category"
      description="Share of spending across categories this month."
    >
      {chartData.length === 0 ? (
        <EmptyChart message="No expenses recorded for this period." />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={96}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0), currency)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
