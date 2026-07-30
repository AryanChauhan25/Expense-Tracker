"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { SavingsSummary } from "@/features/savings/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatPercent,
} from "@/utils/finance-calculations";

const TYPE_COLORS: Record<string, string> = {
  emergency: "#ef4444",
  goal: "#0ea5e9",
  investment: "#22c55e",
};

type AllocationChartProps = {
  summary: SavingsSummary;
  currency: string;
};

export function AllocationChart({ summary, currency }: AllocationChartProps) {
  const data = summary.allocation
    .filter((slice) => slice.saved > 0)
    .map((slice) => ({
      name: slice.label,
      value: slice.saved,
      color: TYPE_COLORS[slice.type] ?? "#64748b",
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Investment & allocation mix</CardTitle>
        <CardDescription>
          How your saved balance is split across emergency, goals and
          investments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Contribute to goals to see allocation.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={2}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value ?? 0), currency)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {summary.allocation.map((slice) => (
                <li
                  key={slice.type}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{
                        backgroundColor: TYPE_COLORS[slice.type] ?? "#64748b",
                      }}
                      aria-hidden
                    />
                    {slice.label}
                  </span>
                  <span className="tabular-nums">
                    {formatPercent(slice.share, 0)} ·{" "}
                    {formatCurrency(slice.saved, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
