"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  recordRepayment,
  type LoanActionState,
} from "@/features/loans/actions";
import type { MoneyLoanView } from "@/features/loans/queries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { repayFormSchema, type RepayFormValues } from "@/lib/validations/loans";
import { formatCurrency } from "@/utils/finance-calculations";

const initialState: LoanActionState = {};

type RepayDialogProps = {
  loan: MoneyLoanView;
  currency: string;
};

export function RepayDialog({ loan, currency }: RepayDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prev: LoanActionState, formData: FormData) => {
      const result = await recordRepayment(prev, formData);
      if (result.message) {
        toast.success(result.message);
        setOpen(false);
      }
      return result;
    },
    initialState,
  );

  const form = useForm<RepayFormValues>({
    resolver: zodResolver(repayFormSchema),
    defaultValues: { amount: undefined },
  });

  if (loan.isSettled) {
    return null;
  }

  const actionLabel =
    loan.direction === "lent" ? "Record collection" : "Record repayment";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset({ amount: undefined });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <ArrowLeftRight className="mr-1 size-4" aria-hidden />
          {loan.direction === "lent" ? "Got money back" : "Paid back"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{actionLabel}</DialogTitle>
          <DialogDescription>
            Remaining with {loan.person_name}:{" "}
            {formatCurrency(loan.remaining, currency)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={loan.id} />

            {state.error ? (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

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
                      max={loan.remaining}
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
                    Already settled:{" "}
                    {formatCurrency(Number(loan.repaid_amount), currency)}
                  </FormDescription>
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
              ) : (
                actionLabel
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
