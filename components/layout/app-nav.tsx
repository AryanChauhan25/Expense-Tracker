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
              "group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
              isActive
                ? "bg-primary/12 text-foreground shadow-sm shadow-primary/10"
                : "text-muted-foreground hover:-translate-y-px hover:bg-accent/70 hover:text-foreground hover:shadow-sm",
            )}
          >
            <span
              className={cn(
                "absolute inset-y-2 left-0 w-1 rounded-full bg-primary transition-all duration-300",
                isActive
                  ? "opacity-100"
                  : "scale-y-50 opacity-0 group-hover:opacity-40",
              )}
              aria-hidden
            />
            <Icon
              className={cn(
                "size-4 shrink-0 transition-transform duration-300",
                isActive ? "text-primary" : "group-hover:scale-110",
              )}
              aria-hidden
            />
            {module.label}
          </Link>
        );
      })}
    </nav>
  );
}
