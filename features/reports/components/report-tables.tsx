import type { FinancialReport } from "@/features/reports/queries";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/finance-calculations";

type ReportTablesProps = {
  report: FinancialReport;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function ReportTables({ report }: ReportTablesProps) {
  const { currency } = report;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income</CardTitle>
          <CardDescription>
            {report.income.length} entries in this range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.income.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No income recorded for this period.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.income.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(row.date)}
                      </TableCell>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{row.categoryLabel}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(Number(row.amount), currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses</CardTitle>
          <CardDescription>
            {report.expenses.length} entries in this range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses recorded for this period.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>What</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Paid with</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.expenses.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(row.expense_date)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{row.title}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.vendor || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: row.paymentMethodColor }}
                            aria-hidden
                          />
                          {row.paymentMethodLabel}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(Number(row.amount), currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
