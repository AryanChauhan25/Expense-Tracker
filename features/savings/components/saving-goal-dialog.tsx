"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { SavingGoalForm } from "@/features/savings/components/saving-goal-form";
import type { SavingGoalView } from "@/features/savings/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SavingGoalDialogProps = {
  goal?: SavingGoalView;
  trigger?: React.ReactNode;
};

export function SavingGoalDialog({ goal, trigger }: SavingGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(goal);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            {isEdit ? (
              <>
                <Pencil className="mr-2 size-4" aria-hidden />
                Edit
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" aria-hidden />
                Add goal
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit savings goal" : "Add savings goal"}
          </DialogTitle>
          <DialogDescription>
            Track emergency funds, personal targets and investment allocation.
          </DialogDescription>
        </DialogHeader>
        <SavingGoalForm goal={goal} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
