"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { MoneyLoanForm } from "@/features/loans/components/money-loan-form";
import type { MoneyLoanView } from "@/features/loans/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MoneyLoanDialogProps = {
  loan?: MoneyLoanView;
  trigger?: React.ReactNode;
};

export function MoneyLoanDialog({ loan, trigger }: MoneyLoanDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(loan);

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
                Add entry
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit borrow / lend" : "Add borrow / lend"}
          </DialogTitle>
          <DialogDescription>
            Track money you lent so you can collect it, or money you borrowed so
            you can repay it.
          </DialogDescription>
        </DialogHeader>
        <MoneyLoanForm loan={loan} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
