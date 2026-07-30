"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  contributeFormSchema,
  encodeGoalName,
  savingGoalFormSchema,
} from "@/lib/validations/savings";

export type SavingsActionState = {
  error?: string;
  message?: string;
};

function parseGoalForm(formData: FormData) {
  return savingGoalFormSchema.safeParse({
    goal_name: formData.get("goal_name"),
    goal_type: formData.get("goal_type"),
    target_amount: formData.get("target_amount"),
    saved_amount: formData.get("saved_amount") ?? 0,
    deadline: formData.get("deadline") ?? "",
  });
}

function revalidateSavings() {
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

export async function createSavingGoal(
  _prevState: SavingsActionState,
  formData: FormData,
): Promise<SavingsActionState> {
  const parsed = parseGoalForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid goal details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase.from("saving_goals").insert({
    user_id: user.id,
    goal_name: encodeGoalName(parsed.data.goal_type, parsed.data.goal_name),
    target_amount: parsed.data.target_amount,
    saved_amount: parsed.data.saved_amount,
    deadline: parsed.data.deadline || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateSavings();
  return { message: "Savings goal created." };
}

export async function updateSavingGoal(
  _prevState: SavingsActionState,
  formData: FormData,
): Promise<SavingsActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing goal id." };
  }

  const parsed = parseGoalForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid goal details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("saving_goals")
    .update({
      goal_name: encodeGoalName(parsed.data.goal_type, parsed.data.goal_name),
      target_amount: parsed.data.target_amount,
      saved_amount: parsed.data.saved_amount,
      deadline: parsed.data.deadline || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateSavings();
  return { message: "Savings goal updated." };
}

export async function deleteSavingGoal(
  id: string,
): Promise<SavingsActionState> {
  if (!id) {
    return { error: "Missing goal id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("saving_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateSavings();
  return { message: "Savings goal deleted." };
}

export async function contributeToGoal(
  _prevState: SavingsActionState,
  formData: FormData,
): Promise<SavingsActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing goal id." };
  }

  const parsed = contributeFormSchema.safeParse({
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid contribution.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: goal, error: fetchError } = await supabase
    .from("saving_goals")
    .select("saved_amount, target_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!goal) {
    return { error: "Goal not found." };
  }

  const nextSaved = Number(goal.saved_amount) + parsed.data.amount;
  const target = Number(goal.target_amount);

  if (nextSaved > target) {
    return {
      error: `Contribution would exceed the target of ${target}. Remaining room is ${(target - Number(goal.saved_amount)).toFixed(2)}.`,
    };
  }

  const { error } = await supabase
    .from("saving_goals")
    .update({ saved_amount: nextSaved })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateSavings();
  return { message: "Contribution added." };
}
