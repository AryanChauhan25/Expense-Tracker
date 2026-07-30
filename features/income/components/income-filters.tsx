"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { MONTH_NAMES } from "@/features/income/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INCOME_CATEGORY_LABELS } from "@/lib/validations/income";
import { INCOME_CATEGORIES } from "@/types/finance";

type IncomeFiltersProps = {
  month?: number;
  year?: number;
  category?: string;
  q?: string;
  years: number[];
};

export function IncomeFiltersBar({
  month,
  year,
  category,
  q = "",
  years,
}: IncomeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [searchSeed, setSearchSeed] = useState(q);
  const searchTimer = useRef<number | null>(null);

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function update(key: string, value: string) {
    pushParams((params) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
  }

  function onSearchChange(value: string) {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
    searchTimer.current = window.setTimeout(() => {
      update("q", value.trim());
    }, 300);
  }

  function clearFilters() {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
    setSearchSeed("");
    setSearchInputKey((value) => value + 1);
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilters = Boolean(month || year || category || q);

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${isPending ? "opacity-70" : ""}`}
    >
      <div className="relative min-w-[180px] flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          key={searchInputKey}
          defaultValue={searchSeed}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search title…"
          className="pl-8"
          aria-label="Search income by title"
        />
      </div>

      <Select
        value={month ? String(month) : "all"}
        onValueChange={(value) => update("month", value ?? "all")}
      >
        <SelectTrigger className="w-full sm:w-[140px]" aria-label="Filter by month">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All months</SelectItem>
          {MONTH_NAMES.map((name, index) => (
            <SelectItem key={name} value={String(index + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year ? String(year) : "all"}
        onValueChange={(value) => update("year", value ?? "all")}
      >
        <SelectTrigger className="w-full sm:w-[120px]" aria-label="Filter by year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All years</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={category || "all"}
        onValueChange={(value) => update("category", value ?? "all")}
      >
        <SelectTrigger
          className="w-full sm:w-[150px]"
          aria-label="Filter by category"
        >
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {INCOME_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {INCOME_CATEGORY_LABELS[cat]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 size-4" aria-hidden />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
