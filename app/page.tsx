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
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 sm:py-16">
          <section className="animate-fade-up space-y-5">
            <Badge variant="secondary" className="w-fit">
              Daily spending, simply tracked
            </Badge>
            <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Personal expense tracker &amp; monthly funds manager
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
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

          <Card className="animate-fade-up stagger-1">
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <CardTitle>Secure by default</CardTitle>
              <CardDescription>
                Every table enables row-level security, so each signed-in user
                reads and writes only their own income, expenses, budgets and
                goals.
              </CardDescription>
            </CardHeader>
          </Card>

          <section className="animate-fade-up stagger-2 space-y-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Modules
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {appModules.map((module) => {
                const Icon = moduleIcons[module.id as keyof typeof moduleIcons];
                return (
                  <div
                    key={module.id}
                    className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-semibold">
                        {module.label}
                      </p>
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
