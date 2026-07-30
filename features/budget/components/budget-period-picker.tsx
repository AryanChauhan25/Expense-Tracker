"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { MONTH_NAMES } from "@/features/budget/meta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BudgetPeriodPickerProps = {
  month: number;
  year: number;
  years: number[];
};

export function BudgetPeriodPicker({
  month,
  year,
  years,
}: BudgetPeriodPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: "month" | "year", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (!params.get("month")) {
      params.set("month", String(month));
    }
    if (!params.get("year")) {
      params.set("year", String(year));
    }
    params.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${isPending ? "opacity-70" : ""}`}
    >
      <Select
        value={String(month)}
        onValueChange={(value) => update("month", value ?? String(month))}
      >
        <SelectTrigger className="w-[160px]" aria-label="Budget month">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, index) => (
            <SelectItem key={name} value={String(index + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(year)}
        onValueChange={(value) => update("year", value ?? String(year))}
      >
        <SelectTrigger className="w-[120px]" aria-label="Budget year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
