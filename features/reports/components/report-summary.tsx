import type { FinancialReport } from "@/features/reports/queries";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatPercent,
} from "@/utils/finance-calculations";

type ReportSummaryCardsProps = {
  report: FinancialReport;
};

export function ReportSummaryCards({ report }: ReportSummaryCardsProps) {
  const { summary, currency } = report;

  const cards = [
    {
      label: "Total income",
      value: formatCurrency(summary.totalIncome, currency),
      hint: `${summary.incomeCount} entries`,
    },
    {
      label: "Total expenses",
      value: formatCurrency(summary.totalExpenses, currency),
      hint: `${summary.expenseCount} entries`,
    },
    {
      label: "Balance",
      value: formatCurrency(summary.balance, currency),
      hint: `Savings rate ${formatPercent(summary.savingsRate)}`,
    },
    {
      label: "Expense share",
      value: formatPercent(summary.expenseShare),
      hint: summary.topPaymentMethod
        ? `Top payment: ${summary.topPaymentMethod}`
        : "No expenses yet",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle
              className={`text-2xl tabular-nums ${
                card.label === "Balance" && summary.balance < 0
                  ? "text-destructive"
                  : ""
              }`}
            >
              {card.value}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
