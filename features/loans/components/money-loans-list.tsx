import { CheckCircle2, Pencil } from "lucide-react";

import { DeleteMoneyLoanButton } from "@/features/loans/components/delete-money-loan-button";
import { MoneyLoanDialog } from "@/features/loans/components/money-loan-dialog";
import { RepayDialog } from "@/features/loans/components/repay-dialog";
import type { MoneyLoanView } from "@/features/loans/queries";
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
import { MONEY_DIRECTION_SHORT } from "@/lib/validations/loans";
import {
  formatCurrency,
  formatPercent,
} from "@/utils/finance-calculations";

type MoneyLoansListProps = {
  loans: MoneyLoanView[];
  currency: string;
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function MoneyLoansList({ loans, currency }: MoneyLoansListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {loans.map((loan) => {
        const dueLabel = formatDate(loan.due_date);
        const dateLabel = formatDate(loan.loan_date);

        return (
          <Card key={loan.id} className="animate-fade-up">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {loan.person_name}
                    </CardTitle>
                    <Badge
                      variant={
                        loan.direction === "lent" ? "default" : "secondary"
                      }
                    >
                      {MONEY_DIRECTION_SHORT[loan.direction]}
                    </Badge>
                    {loan.isSettled ? (
                      <Badge className="gap-1">
                        <CheckCircle2 className="size-3" aria-hidden />
                        Settled
                      </Badge>
                    ) : null}
                    {loan.isOverdue ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    {loan.direction === "lent"
                      ? "They owe you"
                      : "You owe them"}
                    {dateLabel ? ` · since ${dateLabel}` : null}
                    {dueLabel ? ` · due ${dueLabel}` : null}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <MoneyLoanDialog
                    loan={loan}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${loan.person_name}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                    }
                  />
                  <DeleteMoneyLoanButton
                    id={loan.id}
                    name={loan.person_name}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
                    {formatCurrency(loan.remaining, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    remaining of {formatCurrency(Number(loan.amount), currency)}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatPercent(loan.progress)} settled
                </p>
              </div>
              <Progress
                value={loan.progress}
                className={
                  loan.isOverdue && !loan.isSettled
                    ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                    : loan.isSettled
                      ? "[&_[data-slot=progress-indicator]]:bg-primary"
                      : undefined
                }
              />
              {loan.notes ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {loan.notes}
                </p>
              ) : null}
              <div className="flex justify-end">
                <RepayDialog loan={loan} currency={currency} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
