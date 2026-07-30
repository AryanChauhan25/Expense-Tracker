import { z } from "zod";

export const SAVING_GOAL_TYPES = ["emergency", "goal", "investment"] as const;
export type SavingGoalType = (typeof SAVING_GOAL_TYPES)[number];

export const SAVING_GOAL_TYPE_LABELS: Record<SavingGoalType, string> = {
  emergency: "Emergency fund",
  goal: "Savings goal",
  investment: "Investment",
};

const TYPE_PREFIX_RE = /^(emergency|goal|investment)::([\s\S]+)$/;

export function encodeGoalName(type: SavingGoalType, name: string): string {
  return `${type}::${name.trim()}`;
}

export function decodeGoalName(raw: string): {
  type: SavingGoalType;
  name: string;
} {
  const match = raw.match(TYPE_PREFIX_RE);
  if (match) {
    return {
      type: match[1] as SavingGoalType,
      name: match[2],
    };
  }
  return { type: "goal", name: raw };
}

export const savingGoalFormSchema = z
  .object({
    goal_name: z.string().min(1, "Goal name is required").max(120),
    goal_type: z.enum(SAVING_GOAL_TYPES),
    target_amount: z.coerce
      .number({ invalid_type_error: "Target must be a number" })
      .positive("Target must be greater than zero")
      .max(999_999_999.99, "Amount is too large"),
    saved_amount: z.coerce
      .number({ invalid_type_error: "Saved amount must be a number" })
      .min(0, "Saved amount cannot be negative")
      .max(999_999_999.99, "Amount is too large"),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => Number(data.saved_amount) <= Number(data.target_amount),
    {
      message: "Saved amount cannot exceed the target",
      path: ["saved_amount"],
    },
  );

export type SavingGoalFormValues = z.infer<typeof savingGoalFormSchema>;

export const contributeFormSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(999_999_999.99, "Amount is too large"),
});

export type ContributeFormValues = z.infer<typeof contributeFormSchema>;

export const savingsFiltersSchema = z.object({
  type: z.enum([...SAVING_GOAL_TYPES, "all"] as const).optional(),
  status: z.enum(["all", "active", "completed", "overdue"]).optional(),
  q: z.string().max(120).optional(),
});

export type SavingsFilters = z.infer<typeof savingsFiltersSchema>;
