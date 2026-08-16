"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  moneyLoanFormSchema,
  repayFormSchema,
} from "@/lib/validations/loans";

export type LoanActionState = {
  error?: string;
  message?: string;
};

function parseLoanForm(formData: FormData) {
  return moneyLoanFormSchema.safeParse({
    direction: formData.get("direction"),
    person_name: formData.get("person_name"),
    amount: formData.get("amount"),
    repaid_amount: formData.get("repaid_amount") ?? 0,
    loan_date: formData.get("loan_date"),
    due_date: formData.get("due_date") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

function revalidateLoans() {
  revalidatePath("/loans");
  revalidatePath("/dashboard");
}

export async function createMoneyLoan(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const parsed = parseLoanForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid loan details.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const notes = parsed.data.notes?.trim() || null;

  const { error } = await supabase.from("money_loans").insert({
    user_id: user.id,
    direction: parsed.data.direction,
    person_name: parsed.data.person_name.trim(),
    amount: parsed.data.amount,
    repaid_amount: parsed.data.repaid_amount,
    loan_date: parsed.data.loan_date,
    due_date: parsed.data.due_date || null,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateLoans();
  return { message: "Entry added." };
}

export async function updateMoneyLoan(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing loan id." };
  }

  const parsed = parseLoanForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid loan details.",
    };
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
    .from("money_loans")
    .update({
      direction: parsed.data.direction,
      person_name: parsed.data.person_name.trim(),
      amount: parsed.data.amount,
      repaid_amount: parsed.data.repaid_amount,
      loan_date: parsed.data.loan_date,
      due_date: parsed.data.due_date || null,
      notes,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateLoans();
  return { message: "Entry updated." };
}

export async function deleteMoneyLoan(id: string): Promise<LoanActionState> {
  if (!id) {
    return { error: "Missing loan id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("money_loans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateLoans();
  return { message: "Entry deleted." };
}

export async function recordRepayment(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing loan id." };
  }

  const parsed = repayFormSchema.safeParse({
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid repayment.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: loan, error: fetchError } = await supabase
    .from("money_loans")
    .select("amount, repaid_amount, direction, person_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!loan) {
    return { error: "Entry not found." };
  }

  const nextRepaid = Number(loan.repaid_amount) + parsed.data.amount;
  const total = Number(loan.amount);

  if (nextRepaid > total) {
    return {
      error: `That exceeds the remaining balance of ${(total - Number(loan.repaid_amount)).toFixed(2)}.`,
    };
  }

  const { error } = await supabase
    .from("money_loans")
    .update({ repaid_amount: nextRepaid })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateLoans();

  const settled = nextRepaid >= total;
  return {
    message: settled
      ? `Settled with ${loan.person_name}.`
      : `Repayment recorded for ${loan.person_name}.`,
  };
}
