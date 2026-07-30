import { Pencil } from "lucide-react";

import { DeleteIncomeButton } from "@/features/income/components/delete-income-button";
import { IncomeDialog } from "@/features/income/components/income-dialog";
import type { IncomeRow } from "@/features/income/queries";
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
import { INCOME_CATEGORY_LABELS } from "@/lib/validations/income";
import { formatCurrency } from "@/utils/finance-calculations";

type IncomeTableProps = {
  rows: IncomeRow[];
  currency: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function IncomeTable({ rows, currency }: IncomeTableProps) {
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
                <div className="space-y-0.5">
                  <p className="font-medium">{row.title}</p>
                  {row.notes ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {row.notes}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {INCOME_CATEGORY_LABELS[row.category]}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(row.date)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(Number(row.amount), currency)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <IncomeDialog
                    income={row}
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
                  <DeleteIncomeButton id={row.id} title={row.title} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
