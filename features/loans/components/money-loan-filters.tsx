"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MONEY_DIRECTION_SHORT,
  MONEY_DIRECTIONS,
} from "@/lib/validations/loans";

type MoneyLoanFiltersProps = {
  direction?: string;
  status?: string;
  q?: string;
};

export function MoneyLoanFiltersBar({
  direction,
  status,
  q = "",
}: MoneyLoanFiltersProps) {
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

  const hasFilters = Boolean(direction || status || q);

  return (
    <div
      className={`flex flex-col gap-3 transition-opacity duration-200 sm:flex-row sm:flex-wrap sm:items-center ${isPending ? "opacity-70" : ""}`}
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
          placeholder="Search person…"
          className="pl-8"
          aria-label="Search by person"
        />
      </div>

      <Select
        value={direction || "all"}
        onValueChange={(value) => update("direction", value ?? "all")}
      >
        <SelectTrigger
          className="w-full sm:w-[160px]"
          aria-label="Filter by type"
        >
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {MONEY_DIRECTIONS.map((item) => (
            <SelectItem key={item} value={item}>
              {MONEY_DIRECTION_SHORT[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status || "all"}
        onValueChange={(value) => update("status", value ?? "all")}
      >
        <SelectTrigger
          className="w-full sm:w-[150px]"
          aria-label="Filter by status"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="settled">Settled</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
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
