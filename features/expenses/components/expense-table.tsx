import { Pencil } from "lucide-react";

import { DeleteExpenseButton } from "@/features/expenses/components/delete-expense-button";
import { ExpenseDialog } from "@/features/expenses/components/expense-dialog";
import type { ExpenseRow } from "@/features/expenses/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/validations/expense";
import { formatCurrency } from "@/utils/finance-calculations";

type ExpenseTableProps = {
  rows: ExpenseRow[];
  currency: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function ExpenseTable({ rows, currency }: ExpenseTableProps) {
  return (
    <div className="animate-fade-up stagger-2 overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm shadow-black/5 ring-1 ring-border/40 backdrop-blur-sm">
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>What</TableHead>
            <TableHead>From</TableHead>
            <TableHead>Paid with</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-medium">{row.title}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.vendor || "—"}
              </TableCell>
              <TableCell>
                {PAYMENT_METHOD_LABELS[row.payment_method as PaymentMethod] ??
                  row.payment_method}
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
    </div>
  );
}
