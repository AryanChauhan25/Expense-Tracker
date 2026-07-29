import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Landmark,
  LineChart,
  PiggyBank,
  Receipt,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { appModules } from "@/lib/navigation";

const moduleIcons = {
  dashboard: BarChart3,
  income: TrendingUp,
  expenses: Receipt,
  budget: PiggyBank,
  savings: Landmark,
  reports: LineChart,
} as const;

export default async function HomePage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  return (
    <>
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
          <section className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              Phase 2 · Auth &amp; database ready
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Personal expense tracker &amp; monthly funds manager
            </h1>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              Track income and spending, plan monthly budgets, and watch your
              savings grow. Built on Next.js and Supabase with row-level security
              so your data stays yours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={user ? "/dashboard" : "/signup"}>
                  {user ? "Open dashboard" : "Create your account"}
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Link>
              </Button>
              {!user ? (
                <Button variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              ) : null}
            </div>
          </section>

          <Card>
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <ShieldCheck
                  className="size-5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
              </span>
              <CardTitle>Secure by default</CardTitle>
              <CardDescription>
                Every table enables row-level security, so each signed-in user
                reads and writes only their own income, expenses, budgets and
                goals.
              </CardDescription>
            </CardHeader>
          </Card>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Modules</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {appModules.map((module) => {
                const Icon = moduleIcons[module.id as keyof typeof moduleIcons];
                return (
                  <div
                    key={module.id}
                    className="flex items-start gap-3 rounded-lg border bg-card p-4"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{module.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {module.path}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
