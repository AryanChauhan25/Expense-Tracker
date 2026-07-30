"use client";

import { useActionState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  upsertMonthlyBudget,
  type BudgetActionState,
} from "@/features/budget/actions";
import { MONTH_NAMES } from "@/features/budget/meta";
import type { MonthlyBudgetRow } from "@/features/budget/queries";
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
  budgetFormSchema,
  type BudgetFormValues,
} from "@/lib/validations/budget";
import { formatCurrency } from "@/utils/finance-calculations";

const initialState: BudgetActionState = {};

type BudgetFormProps = {
  month: number;
  year: number;
  budget: MonthlyBudgetRow | null;
  currency: string;
};

export function BudgetForm({
  month,
  year,
  budget,
  currency,
}: BudgetFormProps) {
  const [state, formAction, isPending] = useActionState(
    upsertMonthlyBudget,
    initialState,
  );

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      month,
      year,
      expected_income: budget ? Number(budget.expected_income) : undefined,
      planned_savings: budget ? Number(budget.planned_savings) : 0,
    },
  });

  useEffect(() => {
    if (state.message) {
      toast.success(state.message);
    }
  }, [state.message]);

  const expectedIncome = Number(
    useWatch({ control: form.control, name: "expected_income" }) || 0,
  );
  const plannedSavings = Number(
    useWatch({ control: form.control, name: "planned_savings" }) || 0,
  );
  const spendable = Math.max(0, expectedIncome - plannedSavings);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="month" value={month} />
        <input type="hidden" name="year" value={year} />

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <p className="text-sm text-muted-foreground">
          Planning for {MONTH_NAMES[month - 1]} {year}
        </p>

        <FormField
          control={form.control}
          name="expected_income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected income</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
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
              <FormDescription>
                What you expect to earn this month.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="planned_savings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Planned savings</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
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
              <FormDescription>
                Amount set aside before category spending limits.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          Spendable budget:{" "}
          <span className="font-medium tabular-nums">
            {formatCurrency(spendable, currency)}
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : budget ? (
            "Update budget"
          ) : (
            "Save budget"
          )}
        </Button>
      </form>
    </Form>
  );
}
