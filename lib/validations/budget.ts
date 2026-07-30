import { z } from "zod";

export const budgetFormSchema = z
  .object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2000).max(2200),
    expected_income: z.coerce
      .number({ invalid_type_error: "Expected income must be a number" })
      .min(0, "Expected income cannot be negative")
      .max(999_999_999.99, "Amount is too large"),
    planned_savings: z.coerce
      .number({ invalid_type_error: "Planned savings must be a number" })
      .min(0, "Planned savings cannot be negative")
      .max(999_999_999.99, "Amount is too large"),
  })
  .refine((data) => data.planned_savings <= data.expected_income, {
    message: "Planned savings cannot exceed expected income",
    path: ["planned_savings"],
  });

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export const budgetPeriodSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2200),
});

export type BudgetPeriod = z.infer<typeof budgetPeriodSchema>;
