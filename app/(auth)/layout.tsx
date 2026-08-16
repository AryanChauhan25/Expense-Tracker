import Link from "next/link";
import { Wallet } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-heading text-sm font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Wallet className="size-4" aria-hidden />
          </span>
          Finance Manager
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="animate-scale-in w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
