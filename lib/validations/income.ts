import { z } from "zod";

import { INCOME_CATEGORIES, type IncomeCategory } from "@/types/finance";

const incomeCategoryEnum = z.enum(
  INCOME_CATEGORIES as unknown as [IncomeCategory, ...IncomeCategory[]],
);

export const incomeFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  category: incomeCategoryEnum,
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(999_999_999.99, "Amount is too large"),
  date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;

export const incomeFiltersSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2200).optional(),
  category: incomeCategoryEnum.optional().or(z.literal("")),
  q: z.string().max(120).optional(),
});

export type IncomeFilters = z.infer<typeof incomeFiltersSchema>;

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  salary: "Salary",
  business: "Business",
  freelance: "Freelance",
  other: "Other",
};
