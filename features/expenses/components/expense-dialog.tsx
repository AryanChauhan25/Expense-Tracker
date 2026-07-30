"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { ExpenseForm } from "@/features/expenses/components/expense-form";
import type {
  ExpenseCategoryRow,
  ExpenseWithCategory,
} from "@/features/expenses/queries";
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
  expense?: ExpenseWithCategory;
  categories: ExpenseCategoryRow[];
  trigger?: React.ReactNode;
  disabled?: boolean;
};

export function ExpenseDialog({
  expense,
  categories,
  trigger,
  disabled,
}: ExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(expense);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" disabled={disabled || categories.length === 0}>
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
            {isEdit
              ? "Update the details for this expense."
              : "Log spending, mark recurring bills, or plan future costs."}
          </DialogDescription>
        </DialogHeader>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No expense categories are available yet.
          </p>
        ) : (
          <ExpenseForm
            expense={expense}
            categories={categories}
            onSuccess={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
