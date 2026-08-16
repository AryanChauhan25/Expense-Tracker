"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { expenseFormSchema } from "@/lib/validations/expense";

export type ExpenseActionState = {
  error?: string;
  message?: string;
};

function parseExpenseForm(formData: FormData) {
  return expenseFormSchema.safeParse({
    title: formData.get("title"),
    vendor: formData.get("vendor"),
    amount: formData.get("amount"),
    payment_method: formData.get("payment_method"),
    expense_date: formData.get("expense_date"),
  });
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

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    title: parsed.data.title.trim(),
    vendor: parsed.data.vendor.trim(),
    amount: parsed.data.amount,
    payment_method: parsed.data.payment_method,
    expense_date: parsed.data.expense_date,
    category_id: null,
    is_recurring: false,
    notes: null,
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

  const { error } = await supabase
    .from("expenses")
    .update({
      title: parsed.data.title.trim(),
      vendor: parsed.data.vendor.trim(),
      amount: parsed.data.amount,
      payment_method: parsed.data.payment_method,
      expense_date: parsed.data.expense_date,
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
