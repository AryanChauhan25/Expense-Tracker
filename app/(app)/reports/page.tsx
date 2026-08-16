import type { Metadata } from "next";
import { Suspense } from "react";
import { LineChart } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { requireProfile } from "@/features/auth/queries";
import { ReportBreakdown } from "@/features/reports/components/report-breakdown";
import { ReportExportButtons } from "@/features/reports/components/report-export-buttons";
import { ReportFiltersBar } from "@/features/reports/components/report-filters";
import { ReportSummaryCards } from "@/features/reports/components/report-summary";
import { ReportTables } from "@/features/reports/components/report-tables";
import { resolveReportRange } from "@/features/reports/period";
import { getFinancialReport } from "@/features/reports/queries";
import {
  REPORT_PRESET_LABELS,
  reportFiltersSchema,
  type ReportPreset,
} from "@/lib/validations/reports";

export const metadata: Metadata = {
  title: "Reports",
};

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseFilters(
  raw: Record<string, string | string[] | undefined>,
): { preset: ReportPreset; from?: string; to?: string } {
  const pick = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const parsed = reportFiltersSchema.safeParse({
    preset: pick("preset") || "monthly",
    from: pick("from") || undefined,
    to: pick("to") || undefined,
  });

  if (!parsed.success) {
    return { preset: "monthly" };
  }

  return {
    preset: parsed.data.preset,
    from: parsed.data.from || undefined,
    to: parsed.data.to || undefined,
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const profile = await requireProfile();
  const filters = parseFilters(await searchParams);
  const resolved = resolveReportRange(filters);

  const { report, error } = await getFinancialReport({
    preset: filters.preset,
    from: filters.from,
    to: filters.to,
    currency: profile.currency,
  });

  const hasActivity =
    Boolean(report) &&
    (report!.summary.incomeCount > 0 || report!.summary.expenseCount > 0);

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${REPORT_PRESET_LABELS[resolved.preset]} report · ${resolved.label}`}
        action={report ? <ReportExportButtons report={report} /> : undefined}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load report</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        <Suspense fallback={<Skeleton className="h-28 w-full rounded-lg" />}>
          <ReportFiltersBar
            preset={resolved.preset}
            from={resolved.from}
            to={resolved.to}
          />
        </Suspense>

        {report ? (
          <>
            <ReportSummaryCards report={report} />

            {!hasActivity ? (
              <EmptyState
                icon={LineChart}
                title="No activity in this range"
                description="Try another period, or add income and expenses first."
              />
            ) : (
              <>
                <ReportBreakdown report={report} />
                <ReportTables report={report} />
              </>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
