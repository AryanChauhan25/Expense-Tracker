import { Pencil, RefreshCw } from "lucide-react";

import { DeleteExpenseButton } from "@/features/expenses/components/delete-expense-button";
import { ExpenseDialog } from "@/features/expenses/components/expense-dialog";
import type {
  ExpenseCategoryRow,
  ExpenseWithCategory,
} from "@/features/expenses/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/finance-calculations";

type ExpenseTableProps = {
  rows: ExpenseWithCategory[];
  categories: ExpenseCategoryRow[];
  currency: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function isPlanned(date: string): boolean {
  return date > new Date().toISOString().slice(0, 10);
}

export function ExpenseTable({
  rows,
  categories,
  currency,
}: ExpenseTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{row.title}</p>
                    {row.is_recurring ? (
                      <Badge variant="secondary" className="gap-1">
                        <RefreshCw className="size-3" aria-hidden />
                        Recurring
                      </Badge>
                    ) : null}
                    {isPlanned(row.expense_date) ? (
                      <Badge variant="outline">Planned</Badge>
                    ) : null}
                  </div>
                  {row.notes ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {row.notes}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                {row.category ? (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: row.category.color }}
                      aria-hidden
                    />
                    {row.category.name}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Uncategorised</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(row.expense_date)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(Number(row.amount), currency)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <ExpenseDialog
                    expense={row}
                    categories={categories}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${row.title}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                    }
                  />
                  <DeleteExpenseButton id={row.id} title={row.title} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
