"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { budgetFormSchema } from "@/lib/validations/budget";

export type BudgetActionState = {
  error?: string;
  message?: string;
};

export async function upsertMonthlyBudget(
  _prevState: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const parsed = budgetFormSchema.safeParse({
    month: formData.get("month"),
    year: formData.get("year"),
    expected_income: formData.get("expected_income"),
    planned_savings: formData.get("planned_savings"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid budget details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase.from("monthly_budget").upsert(
    {
      user_id: user.id,
      month: parsed.data.month,
      year: parsed.data.year,
      expected_income: parsed.data.expected_income,
      planned_savings: parsed.data.planned_savings,
    },
    { onConflict: "user_id,year,month" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { message: "Monthly budget saved." };
}
