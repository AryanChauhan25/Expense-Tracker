import { z } from "zod";

export const REPORT_PRESETS = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
] as const;

export type ReportPreset = (typeof REPORT_PRESETS)[number];

export const REPORT_PRESET_LABELS: Record<ReportPreset, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom range",
};

export const reportFiltersSchema = z
  .object({
    preset: z.enum(REPORT_PRESETS).default("monthly"),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.preset !== "custom") {
      return;
    }
    if (!data.from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is required for a custom range",
        path: ["from"],
      });
    }
    if (!data.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required for a custom range",
        path: ["to"],
      });
    }
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be on or before end date",
        path: ["to"],
      });
    }
  });

export type ReportFilters = z.infer<typeof reportFiltersSchema>;
