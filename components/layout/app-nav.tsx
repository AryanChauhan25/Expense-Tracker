"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Landmark,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Receipt,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { appModules } from "@/lib/navigation";

const moduleIcons = {
  dashboard: LayoutDashboard,
  income: TrendingUp,
  expenses: Receipt,
  budget: PiggyBank,
  savings: Landmark,
  reports: LineChart,
} as const;

type AppNavProps = {
  orientation?: "vertical" | "horizontal";
  onNavigate?: () => void;
};

export function AppNav({ orientation = "vertical", onNavigate }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn(
        "gap-1",
        orientation === "vertical" ? "grid" : "flex items-center",
      )}
    >
      {appModules.map((module) => {
        const Icon = moduleIcons[module.id as keyof typeof moduleIcons] ?? BarChart3;
        const isActive =
          pathname === module.path || pathname.startsWith(`${module.path}/`);

        return (
          <Link
            key={module.id}
            href={module.path}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {module.label}
          </Link>
        );
      })}
    </nav>
  );
}
