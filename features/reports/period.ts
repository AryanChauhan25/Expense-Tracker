import type { ReportPreset } from "@/lib/validations/reports";

export type DateRange = {
  from: string;
  to: string;
  label: string;
  preset: ReportPreset;
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatRangeLabel(from: string, to: string): string {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const fromLabel = formatter.format(new Date(`${from}T00:00:00`));
  const toLabel = formatter.format(new Date(`${to}T00:00:00`));
  return from === to ? fromLabel : `${fromLabel} – ${toLabel}`;
}

export function resolveReportRange(input: {
  preset: ReportPreset;
  from?: string;
  to?: string;
  now?: Date;
}): DateRange {
  const now = startOfDay(input.now ?? new Date());

  if (input.preset === "daily") {
    const today = toIsoDate(now);
    return {
      preset: "daily",
      from: today,
      to: today,
      label: formatRangeLabel(today, today),
    };
  }

  if (input.preset === "weekly") {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const from = toIsoDate(monday);
    const to = toIsoDate(sunday);
    return {
      preset: "weekly",
      from,
      to,
      label: `Week of ${formatRangeLabel(from, to)}`,
    };
  }

  if (input.preset === "monthly") {
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const from = toIsoDate(fromDate);
    const to = toIsoDate(toDate);
    return {
      preset: "monthly",
      from,
      to,
      label: new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
      }).format(fromDate),
    };
  }

  if (input.preset === "yearly") {
    const from = `${now.getFullYear()}-01-01`;
    const to = `${now.getFullYear()}-12-31`;
    return {
      preset: "yearly",
      from,
      to,
      label: String(now.getFullYear()),
    };
  }

  const from = input.from || toIsoDate(now);
  const to = input.to || from;
  return {
    preset: "custom",
    from,
    to: to < from ? from : to,
    label: formatRangeLabel(from, to < from ? from : to),
  };
}
