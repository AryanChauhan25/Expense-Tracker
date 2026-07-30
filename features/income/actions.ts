"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { incomeFormSchema } from "@/lib/validations/income";

export type IncomeActionState = {
  error?: string;
  message?: string;
};

function parseIncomeForm(formData: FormData) {
  return incomeFormSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    notes: formData.get("notes") ?? "",
  });
}

export async function createIncome(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const parsed = parseIncomeForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid income details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const notes = parsed.data.notes?.trim() || null;

  const { error } = await supabase.from("income").insert({
    user_id: user.id,
    title: parsed.data.title.trim(),
    category: parsed.data.category,
    amount: parsed.data.amount,
    date: parsed.data.date,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return { message: "Income added." };
}

export async function updateIncome(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing income id." };
  }

  const parsed = parseIncomeForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid income details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const notes = parsed.data.notes?.trim() || null;

  const { error } = await supabase
    .from("income")
    .update({
      title: parsed.data.title.trim(),
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: parsed.data.date,
      notes,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return { message: "Income updated." };
}

export async function deleteIncome(id: string): Promise<IncomeActionState> {
  if (!id) {
    return { error: "Missing income id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("income")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return { message: "Income deleted." };
}
