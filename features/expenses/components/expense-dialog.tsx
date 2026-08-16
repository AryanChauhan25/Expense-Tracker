"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { ExpenseForm } from "@/features/expenses/components/expense-form";
import type { ExpenseRow } from "@/features/expenses/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ExpenseDialogProps = {
  expense?: ExpenseRow;
  trigger?: React.ReactNode;
};

export function ExpenseDialog({ expense, trigger }: ExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(expense);

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
                Add expense
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            Example: ₹350 Swiggy food on credit card, or ₹4500 whey from
            Beastlife.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm expense={expense} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
