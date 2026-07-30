"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { IncomeForm } from "@/features/income/components/income-form";
import type { IncomeRow } from "@/features/income/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type IncomeDialogProps = {
  income?: IncomeRow;
  trigger?: React.ReactNode;
};

export function IncomeDialog({ income, trigger }: IncomeDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(income);

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
                Add income
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit income" : "Add income"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this income entry."
              : "Record salary, business, freelance or other income."}
          </DialogDescription>
        </DialogHeader>
        <IncomeForm income={income} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
