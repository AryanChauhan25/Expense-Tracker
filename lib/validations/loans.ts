import { z } from "zod";

export const MONEY_DIRECTIONS = ["lent", "borrowed"] as const;
export type MoneyDirection = (typeof MONEY_DIRECTIONS)[number];

export const MONEY_DIRECTION_LABELS: Record<MoneyDirection, string> = {
  lent: "I lent (they owe me)",
  borrowed: "I borrowed (I owe them)",
};

export const MONEY_DIRECTION_SHORT: Record<MoneyDirection, string> = {
  lent: "Lent",
  borrowed: "Borrowed",
};

export const LOAN_STATUSES = ["open", "partial", "settled", "overdue"] as const;
export type LoanStatusFilter = (typeof LOAN_STATUSES)[number] | "all";

export const moneyLoanFormSchema = z
  .object({
    direction: z.enum(MONEY_DIRECTIONS),
    person_name: z
      .string()
      .min(1, "Who is this with?")
      .max(120, "Name is too long"),
    amount: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be greater than zero")
      .max(999_999_999.99, "Amount is too large"),
    repaid_amount: z.coerce
      .number({ invalid_type_error: "Repaid amount must be a number" })
      .min(0, "Repaid amount cannot be negative")
      .max(999_999_999.99, "Amount is too large"),
    loan_date: z
      .string()
      .min(1, "Date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.repaid_amount <= data.amount, {
    message: "Repaid amount cannot exceed the total",
    path: ["repaid_amount"],
  });

export type MoneyLoanFormValues = z.infer<typeof moneyLoanFormSchema>;

export const repayFormSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(999_999_999.99, "Amount is too large"),
});

export type RepayFormValues = z.infer<typeof repayFormSchema>;

export const moneyLoanFiltersSchema = z.object({
  direction: z.enum(MONEY_DIRECTIONS).optional().or(z.literal("")),
  status: z
    .enum(["all", "open", "partial", "settled", "overdue"])
    .optional()
    .or(z.literal("")),
  q: z.string().max(120).optional(),
});

export type MoneyLoanFilters = z.infer<typeof moneyLoanFiltersSchema>;
