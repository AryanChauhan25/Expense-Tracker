"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  contributeToGoal,
  type SavingsActionState,
} from "@/features/savings/actions";
import type { SavingGoalView } from "@/features/savings/queries";
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
import {
  contributeFormSchema,
  type ContributeFormValues,
} from "@/lib/validations/savings";
import { formatCurrency } from "@/utils/finance-calculations";

const initialState: SavingsActionState = {};

type ContributeDialogProps = {
  goal: SavingGoalView;
  currency: string;
};

export function ContributeDialog({ goal, currency }: ContributeDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prev: SavingsActionState, formData: FormData) => {
      const result = await contributeToGoal(prev, formData);
      if (result.message) {
        toast.success(result.message);
        setOpen(false);
      }
      return result;
    },
    initialState,
  );

  const form = useForm<ContributeFormValues>({
    resolver: zodResolver(contributeFormSchema),
    defaultValues: { amount: undefined },
  });

  if (goal.isCompleted) {
    return null;
  }

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
          <Plus className="mr-1 size-4" aria-hidden />
          Contribute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to {goal.displayName}</DialogTitle>
          <DialogDescription>
            Remaining to target: {formatCurrency(goal.remaining, currency)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={goal.id} />

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
                      max={goal.remaining}
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
                    Current saved:{" "}
                    {formatCurrency(Number(goal.saved_amount), currency)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Adding…
                </>
              ) : (
                "Add contribution"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
