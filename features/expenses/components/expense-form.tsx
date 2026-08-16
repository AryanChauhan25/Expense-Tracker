"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createExpense,
  updateExpense,
  type ExpenseActionState,
} from "@/features/expenses/actions";
import type { ExpenseRow } from "@/features/expenses/queries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  expenseFormSchema,
  type ExpenseFormValues,
} from "@/lib/validations/expense";

const initialState: ExpenseActionState = {};

type ExpenseFormProps = {
  expense?: ExpenseRow;
  onSuccess?: () => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const action = expense ? updateExpense : createExpense;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: expense?.title ?? "",
      vendor: expense?.vendor ?? "",
      amount: expense ? Number(expense.amount) : undefined,
      payment_method: expense?.payment_method ?? "credit_card",
      expense_date: expense?.expense_date ?? todayIso(),
    },
  });

  useEffect(() => {
    if (state.message) {
      toast.success(state.message);
      onSuccess?.();
    }
  }, [state.message, onSuccess]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        {expense ? <input type="hidden" name="id" value={expense.id} /> : null}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What</FormLabel>
              <FormControl>
                <Input
                  placeholder="Swiggy food, whey protein…"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From</FormLabel>
              <FormControl>
                <Input
                  placeholder="Swiggy, Beastlife, Amazon…"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    placeholder="350"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? undefined : value);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid with</FormLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expense_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : expense ? (
            "Save changes"
          ) : (
            "Add expense"
          )}
        </Button>
      </form>
    </Form>
  );
}
