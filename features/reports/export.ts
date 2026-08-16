import type { FinancialReport } from "@/features/reports/queries";
import { formatCurrency, formatPercent } from "@/utils/finance-calculations";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function slugifyRange(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function exportReportToExcel(report: FinancialReport) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Personal Finance Report"],
    ["Period", report.range.label],
    ["Preset", report.range.preset],
    ["From", report.range.from],
    ["To", report.range.to],
    ["Currency", report.currency],
    [],
    ["Metric", "Value"],
    ["Total income", report.summary.totalIncome],
    ["Total expenses", report.summary.totalExpenses],
    ["Balance", report.summary.balance],
    ["Savings rate %", report.summary.savingsRate],
    ["Expense share %", report.summary.expenseShare],
    ["Income entries", report.summary.incomeCount],
    ["Expense entries", report.summary.expenseCount],
    ["Recurring expenses", report.summary.recurringExpenses],
    ["Top payment method", report.summary.topPaymentMethod ?? ""],
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  const incomeSheet = XLSX.utils.json_to_sheet(
    report.income.map((row) => ({
      Date: row.date,
      Title: row.title,
      Category: row.categoryLabel,
      Amount: Number(row.amount),
      Notes: row.notes ?? "",
    })),
  );
  XLSX.utils.book_append_sheet(workbook, incomeSheet, "Income");

  const expenseSheet = XLSX.utils.json_to_sheet(
    report.expenses.map((row) => ({
      Date: row.expense_date,
      Title: row.title,
      Vendor: row.vendor ?? "",
      Payment: row.paymentMethodLabel,
      Amount: Number(row.amount),
    })),
  );
  XLSX.utils.book_append_sheet(workbook, expenseSheet, "Expenses");

  const paymentSheet = XLSX.utils.json_to_sheet(
    report.expensesByPaymentMethod.map((row) => ({
      PaymentMethod: row.name,
      Amount: row.amount,
      SharePercent: row.share,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, paymentSheet, "By Payment");

  const savingsSheet = XLSX.utils.json_to_sheet(
    report.savings.map((row) => ({
      Name: row.displayName,
      Type: row.typeLabel,
      Target: Number(row.target_amount),
      Saved: Number(row.saved_amount),
      Deadline: row.deadline ?? "",
    })),
  );
  XLSX.utils.book_append_sheet(workbook, savingsSheet, "Savings Goals");

  const filename = `finance-report-${slugifyRange(report.range.label)}.xlsx`;
  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer;
  downloadBlob(
    new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename,
  );
}

export async function exportReportToPdf(report: FinancialReport) {
  const [jspdfModule, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const JsPDF = jspdfModule.default;
  const autoTable = autoTableModule.default;
  const doc = new JsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const currency = report.currency;

  function finalY(fallback: number): number {
    const extended = doc as unknown as { lastAutoTable?: { finalY: number } };
    return extended.lastAutoTable?.finalY ?? fallback;
  }

  doc.setFontSize(16);
  doc.text("Personal Finance Report", 40, 40);
  doc.setFontSize(11);
  doc.text(`Period: ${report.range.label}`, 40, 62);
  doc.text(`Range: ${report.range.from} to ${report.range.to}`, 40, 78);
  doc.text(`Currency: ${currency}`, 40, 94);

  autoTable(doc, {
    startY: 110,
    head: [["Metric", "Value"]],
    body: [
      ["Total income", formatCurrency(report.summary.totalIncome, currency)],
      ["Total expenses", formatCurrency(report.summary.totalExpenses, currency)],
      ["Balance", formatCurrency(report.summary.balance, currency)],
      ["Savings rate", formatPercent(report.summary.savingsRate)],
      ["Expense share", formatPercent(report.summary.expenseShare)],
      ["Income entries", String(report.summary.incomeCount)],
      ["Expense entries", String(report.summary.expenseCount)],
      [
        "Recurring expenses",
        formatCurrency(report.summary.recurringExpenses, currency),
      ],
      ["Top payment method", report.summary.topPaymentMethod ?? "—"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
  });

  const afterSummaryY = finalY(110);

  doc.setFontSize(12);
  doc.text("Income", 40, afterSummaryY + 28);
  autoTable(doc, {
    startY: afterSummaryY + 36,
    head: [["Date", "Title", "Category", "Amount"]],
    body:
      report.income.length > 0
        ? report.income.map((row) => [
            row.date,
            row.title,
            row.categoryLabel,
            formatCurrency(Number(row.amount), currency),
          ])
        : [["—", "No income in this range", "—", "—"]],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  const afterIncomeY = finalY(afterSummaryY);

  doc.setFontSize(12);
  doc.text("Expenses", 40, afterIncomeY + 28);
  autoTable(doc, {
    startY: afterIncomeY + 36,
    head: [["Date", "What", "From", "Paid with", "Amount"]],
    body:
      report.expenses.length > 0
        ? report.expenses.map((row) => [
            row.expense_date,
            row.title,
            row.vendor ?? "—",
            row.paymentMethodLabel,
            formatCurrency(Number(row.amount), currency),
          ])
        : [["—", "No expenses in this range", "—", "—", "—"]],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  const afterExpensesY = finalY(afterIncomeY);

  doc.setFontSize(12);
  doc.text("Expenses by payment", 40, afterExpensesY + 28);
  autoTable(doc, {
    startY: afterExpensesY + 36,
    head: [["Payment", "Amount", "Share"]],
    body:
      report.expensesByPaymentMethod.length > 0
        ? report.expensesByPaymentMethod.map((row) => [
            row.name,
            formatCurrency(row.amount, currency),
            formatPercent(row.share),
          ])
        : [["—", "—", "—"]],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  doc.save(`finance-report-${slugifyRange(report.range.label)}.pdf`);
}
