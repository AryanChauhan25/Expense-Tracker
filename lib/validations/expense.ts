import { z } from "zod";

export const expenseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  category_id: z.string().uuid("Select a category"),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(999_999_999.99, "Amount is too large"),
  expense_date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  is_recurring: z.boolean(),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const expenseTimingValues = ["all", "past", "planned"] as const;
export type ExpenseTiming = (typeof expenseTimingValues)[number];

export const expenseFiltersSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2200).optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  recurring: z.enum(["all", "yes", "no"]).optional(),
  timing: z.enum(expenseTimingValues).optional(),
  q: z.string().max(120).optional(),
});

export type ExpenseFilters = z.infer<typeof expenseFiltersSchema>;

export function parseRecurringFlag(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}
