import { z } from "zod";

export const PAYMENT_METHODS = [
  "cash",
  "upi",
  "debit_card",
  "credit_card",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  debit_card: "Debit card",
  credit_card: "Credit card",
  other: "Other",
};

export const expenseFormSchema = z.object({
  title: z.string().min(1, "What did you buy?").max(120),
  vendor: z.string().min(1, "Where did you buy it?").max(120),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(999_999_999.99, "Amount is too large"),
  payment_method: z.enum(PAYMENT_METHODS),
  expense_date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const expenseFiltersSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2200).optional(),
  payment_method: z.enum(PAYMENT_METHODS).optional().or(z.literal("")),
  q: z.string().max(120).optional(),
});

export type ExpenseFilters = z.infer<typeof expenseFiltersSchema>;
