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
import type {
  ExpenseCategoryRow,
  ExpenseWithCategory,
} from "@/features/expenses/queries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  expenseFormSchema,
  type ExpenseFormValues,
} from "@/lib/validations/expense";

const initialState: ExpenseActionState = {};

type ExpenseFormProps = {
  expense?: ExpenseWithCategory;
  categories: ExpenseCategoryRow[];
  onSuccess?: () => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({
  expense,
  categories,
  onSuccess,
}: ExpenseFormProps) {
  const action = expense ? updateExpense : createExpense;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: expense?.title ?? "",
      category_id: expense?.category_id ?? categories[0]?.id ?? "",
      amount: expense ? Number(expense.amount) : undefined,
      expense_date: expense?.expense_date ?? todayIso(),
      is_recurring: expense?.is_recurring ?? false,
      notes: expense?.notes ?? "",
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Grocery run"
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
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                            aria-hidden
                          />
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    placeholder="0.00"
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
              <FormDescription>
                Use a future date for planned expenses.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border px-3 py-3">
              <div className="space-y-0.5">
                <FormLabel>Recurring expense</FormLabel>
                <FormDescription>
                  Mark subscriptions and repeating bills.
                </FormDescription>
              </div>
              <FormControl>
                <div className="flex items-center gap-2">
                  <input
                    type="hidden"
                    name="is_recurring"
                    value={field.value ? "true" : "false"}
                  />
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Recurring expense"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes" rows={3} {...field} />
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
