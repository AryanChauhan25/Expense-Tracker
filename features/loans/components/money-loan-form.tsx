"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createMoneyLoan,
  updateMoneyLoan,
  type LoanActionState,
} from "@/features/loans/actions";
import type { MoneyLoanView } from "@/features/loans/queries";
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
import { Textarea } from "@/components/ui/textarea";
import {
  MONEY_DIRECTION_LABELS,
  MONEY_DIRECTIONS,
  moneyLoanFormSchema,
  type MoneyLoanFormValues,
} from "@/lib/validations/loans";

const initialState: LoanActionState = {};

type MoneyLoanFormProps = {
  loan?: MoneyLoanView;
  onSuccess?: () => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MoneyLoanForm({ loan, onSuccess }: MoneyLoanFormProps) {
  const action = loan ? updateMoneyLoan : createMoneyLoan;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<MoneyLoanFormValues>({
    resolver: zodResolver(moneyLoanFormSchema),
    defaultValues: {
      direction: loan?.direction ?? "lent",
      person_name: loan?.person_name ?? "",
      amount: loan ? Number(loan.amount) : undefined,
      repaid_amount: loan ? Number(loan.repaid_amount) : 0,
      loan_date: loan?.loan_date ?? todayIso(),
      due_date: loan?.due_date ?? "",
      notes: loan?.notes ?? "",
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
        {loan ? <input type="hidden" name="id" value={loan.id} /> : null}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="direction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lent or borrowed" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MONEY_DIRECTIONS.map((direction) => (
                    <SelectItem key={direction} value={direction}>
                      {MONEY_DIRECTION_LABELS[direction]}
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
          name="person_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Person</FormLabel>
              <FormControl>
                <Input
                  placeholder="Rahul, Priya, office friend…"
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
                    placeholder="2000"
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

          {loan ? (
            <FormField
              control={form.control}
              name="repaid_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Already repaid</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
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
          ) : (
            <input type="hidden" name="repaid_amount" value="0" />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="loan_date"
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

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Optional reminder date.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional — reason, UPI ref, etc."
                  rows={3}
                  {...field}
                />
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
          ) : loan ? (
            "Save changes"
          ) : (
            "Add entry"
          )}
        </Button>
      </form>
    </Form>
  );
}
