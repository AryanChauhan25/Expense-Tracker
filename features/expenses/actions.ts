"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { expenseFormSchema, parseRecurringFlag } from "@/lib/validations/expense";

export type ExpenseActionState = {
  error?: string;
  message?: string;
};

function parseExpenseForm(formData: FormData) {
  return expenseFormSchema.safeParse({
    title: formData.get("title"),
    category_id: formData.get("category_id"),
    amount: formData.get("amount"),
    expense_date: formData.get("expense_date"),
    is_recurring: parseRecurringFlag(formData.get("is_recurring")),
    notes: formData.get("notes") ?? "",
  });
}

async function assertCategoryAccessible(
  categoryId: string,
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_categories")
    .select("id")
    .eq("id", categoryId)
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .maybeSingle();

  if (error) {
    return error.message;
  }

  if (!data) {
    return "Selected category is not available.";
  }

  return null;
}

export async function createExpense(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const parsed = parseExpenseForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid expense details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const categoryError = await assertCategoryAccessible(
    parsed.data.category_id,
    user.id,
  );
  if (categoryError) {
    return { error: categoryError };
  }

  const notes = parsed.data.notes?.trim() || null;

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    title: parsed.data.title.trim(),
    category_id: parsed.data.category_id,
    amount: parsed.data.amount,
    expense_date: parsed.data.expense_date,
    is_recurring: parsed.data.is_recurring,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { message: "Expense added." };
}

export async function updateExpense(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing expense id." };
  }

  const parsed = parseExpenseForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid expense details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const categoryError = await assertCategoryAccessible(
    parsed.data.category_id,
    user.id,
  );
  if (categoryError) {
    return { error: categoryError };
  }

  const notes = parsed.data.notes?.trim() || null;

  const { error } = await supabase
    .from("expenses")
    .update({
      title: parsed.data.title.trim(),
      category_id: parsed.data.category_id,
      amount: parsed.data.amount,
      expense_date: parsed.data.expense_date,
      is_recurring: parsed.data.is_recurring,
      notes,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { message: "Expense updated." };
}

export async function deleteExpense(id: string): Promise<ExpenseActionState> {
  if (!id) {
    return { error: "Missing expense id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { message: "Expense deleted." };
}
