import { z } from "zod";

import { INCOME_CATEGORIES, type IncomeCategory } from "@/types/finance";

const incomeCategoryEnum = z.enum(
  INCOME_CATEGORIES as unknown as [IncomeCategory, ...IncomeCategory[]],
);
export const incomeFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  category: incomeCategoryEnum,
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
