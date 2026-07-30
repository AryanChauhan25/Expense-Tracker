import Link from "next/link";
import {
  ArrowUpRight,
  Lightbulb,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import type { DashboardInsight, FinancialHealth } from "@/features/dashboard/insights";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type HealthScoreCardProps = {
  health: FinancialHealth;
};

export function HealthScoreCard({ health }: HealthScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Financial health score</CardDescription>
        <CardTitle className="flex items-end gap-2 text-3xl tabular-nums">
          {health.score}
          <span className="pb-1 text-sm font-medium text-muted-foreground">
            / 100 · {health.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={health.score} />
        <p className="text-sm text-muted-foreground">{health.summary}</p>
      </CardContent>
    </Card>
  );
}

type SmartInsightsProps = {
  insights: DashboardInsight[];
};

const toneStyles: Record<
  DashboardInsight["tone"],
  { badge: string; icon: typeof Lightbulb }
> = {
  positive: { badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", icon: Sparkles },
  warning: { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: TriangleAlert },
  danger: { badge: "bg-destructive/10 text-destructive", icon: TriangleAlert },
  neutral: { badge: "bg-muted text-muted-foreground", icon: Lightbulb },
};

export function SmartInsights({ insights }: SmartInsightsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">Smart insights</CardTitle>
          <CardDescription>
            AI-ready highlights based on this month&apos;s activity.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/budget">
            Budget
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Insights will appear once you start logging money in and out.
          </p>
        ) : (
          insights.map((insight) => {
            const style = toneStyles[insight.tone];
            const Icon = style.icon;
            return (
              <div
                key={insight.id}
                className="rounded-lg border px-3 py-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full",
                      style.badge,
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <Badge variant="outline" className="ml-auto capitalize">
                    {insight.tone}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.detail}</p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
