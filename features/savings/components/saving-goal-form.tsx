"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createSavingGoal,
  updateSavingGoal,
  type SavingsActionState,
} from "@/features/savings/actions";
import type { SavingGoalView } from "@/features/savings/queries";
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
import {
  SAVING_GOAL_TYPE_LABELS,
  SAVING_GOAL_TYPES,
  savingGoalFormSchema,
  type SavingGoalFormValues,
} from "@/lib/validations/savings";

const initialState: SavingsActionState = {};

type SavingGoalFormProps = {
  goal?: SavingGoalView;
  onSuccess?: () => void;
};

export function SavingGoalForm({ goal, onSuccess }: SavingGoalFormProps) {
  const action = goal ? updateSavingGoal : createSavingGoal;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const form = useForm<SavingGoalFormValues>({
    resolver: zodResolver(savingGoalFormSchema),
    defaultValues: {
      goal_name: goal?.displayName ?? "",
      goal_type: goal?.type ?? "goal",
      target_amount: goal ? Number(goal.target_amount) : undefined,
      saved_amount: goal ? Number(goal.saved_amount) : 0,
      deadline: goal?.deadline ?? "",
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
        {goal ? <input type="hidden" name="id" value={goal.id} /> : null}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="goal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Emergency fund, vacation, index funds…"
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
          name="goal_type"
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
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SAVING_GOAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {SAVING_GOAL_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Emergency funds, general goals, or investment allocation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target amount</FormLabel>
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

          <FormField
            control={form.control}
            name="saved_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Already saved</FormLabel>
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
                      field.onChange(value === "" ? 0 : value);
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
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>Optional target date.</FormDescription>
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
          ) : goal ? (
            "Save changes"
          ) : (
            "Create goal"
          )}
        </Button>
      </form>
    </Form>
  );
}
