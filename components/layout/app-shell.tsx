import Link from "next/link";
import { Wallet } from "lucide-react";

import { AppNav } from "@/components/layout/app-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/features/auth/components/user-menu";

type AppShellProps = {
  name: string;
  email: string;
  children: React.ReactNode;
};

export function AppShell({ name, email, children }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
          <MobileNav />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">Finance Manager</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu name={name} email={email} />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r px-3 py-4 lg:block">
          <AppNav />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
