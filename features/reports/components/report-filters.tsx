"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REPORT_PRESET_LABELS,
  REPORT_PRESETS,
  type ReportPreset,
} from "@/lib/validations/reports";

type ReportFiltersBarProps = {
  preset: ReportPreset;
  from: string;
  to: string;
};

export function ReportFiltersBar({
  preset,
  from,
  to,
}: ReportFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function push(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border p-4 ${isPending ? "opacity-70" : ""}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="report-preset">Period</Label>
          <Select
            value={preset}
            onValueChange={(value) => {
              const nextPreset = (value ?? "monthly") as ReportPreset;
              if (nextPreset === "custom") {
                push({
                  preset: nextPreset,
                  from: from || new Date().toISOString().slice(0, 10),
                  to: to || new Date().toISOString().slice(0, 10),
                });
              } else {
                const params = new URLSearchParams();
                params.set("preset", nextPreset);
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`);
                });
              }
            }}
          >
            <SelectTrigger id="report-preset" className="w-full">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_PRESETS.map((item) => (
                <SelectItem key={item} value={item}>
                  {REPORT_PRESET_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preset === "custom" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="report-from">From</Label>
              <Input
                id="report-from"
                type="date"
                defaultValue={from}
                onChange={(event) => push({ from: event.target.value, preset: "custom", to })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-to">To</Label>
              <Input
                id="report-to"
                type="date"
                defaultValue={to}
                onChange={(event) => push({ to: event.target.value, preset: "custom", from })}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  push({
                    preset: "custom",
                    from,
                    to,
                  })
                }
              >
                Apply range
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
