"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  exportReportToExcel,
  exportReportToPdf,
} from "@/features/reports/export";
import type { FinancialReport } from "@/features/reports/queries";
import { Button } from "@/components/ui/button";

type ReportExportButtonsProps = {
  report: FinancialReport;
};

export function ReportExportButtons({ report }: ReportExportButtonsProps) {
  const [pending, setPending] = useState<"pdf" | "excel" | null>(null);

  async function handleExport(kind: "pdf" | "excel") {
    setPending(kind);
    try {
      if (kind === "pdf") {
        await exportReportToPdf(report);
        toast.success("PDF downloaded.");
      } else {
        await exportReportToExcel(report);
        toast.success("Excel file downloaded.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Export failed. Try again.",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleExport("excel")}
        disabled={pending !== null}
      >
        {pending === "excel" ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        ) : (
          <FileSpreadsheet className="mr-2 size-4" aria-hidden />
        )}
        Export Excel
      </Button>
      <Button
        size="sm"
        onClick={() => handleExport("pdf")}
        disabled={pending !== null}
      >
        {pending === "pdf" ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        ) : (
          <FileText className="mr-2 size-4" aria-hidden />
        )}
        Export PDF
      </Button>
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Download className="size-3.5" aria-hidden />
        Downloads use the selected range
      </span>
    </div>
  );
}
