import { CheckCircle2, Pencil } from "lucide-react";

import { ContributeDialog } from "@/features/savings/components/contribute-dialog";
import { DeleteSavingGoalButton } from "@/features/savings/components/delete-saving-goal-button";
import { SavingGoalDialog } from "@/features/savings/components/saving-goal-dialog";
import type { SavingGoalView } from "@/features/savings/queries";
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
import { SAVING_GOAL_TYPE_LABELS } from "@/lib/validations/savings";
import {
  formatCurrency,
  formatPercent,
} from "@/utils/finance-calculations";

type SavingGoalsListProps = {
  goals: SavingGoalView[];
  currency: string;
};

function formatDeadline(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function SavingGoalsList({ goals, currency }: SavingGoalsListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {goals.map((goal) => {
        const deadlineLabel = formatDeadline(goal.deadline);

        return (
          <Card key={goal.id}>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {goal.displayName}
                    </CardTitle>
                    <Badge variant="secondary">
                      {SAVING_GOAL_TYPE_LABELS[goal.type]}
                    </Badge>
                    {goal.isCompleted ? (
                      <Badge className="gap-1">
                        <CheckCircle2 className="size-3" aria-hidden />
                        Completed
                      </Badge>
                    ) : null}
                    {goal.isOverdue ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    {deadlineLabel
                      ? `Deadline ${deadlineLabel}`
                      : "No deadline set"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <SavingGoalDialog
                    goal={goal}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${goal.displayName}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                    }
                  />
                  <DeleteSavingGoalButton
                    id={goal.id}
                    name={goal.displayName}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatCurrency(Number(goal.saved_amount), currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {formatCurrency(Number(goal.target_amount), currency)}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatPercent(goal.progress)} ·{" "}
                  {formatCurrency(goal.remaining, currency)} left
                </p>
              </div>
              <Progress
                value={goal.progress}
                className={
                  goal.isOverdue && !goal.isCompleted
                    ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                    : goal.isCompleted
                      ? "[&_[data-slot=progress-indicator]]:bg-emerald-500"
                      : undefined
                }
              />
              <div className="flex justify-end">
                <ContributeDialog goal={goal} currency={currency} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
