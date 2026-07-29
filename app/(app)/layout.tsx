import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/features/auth/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <AppShell name={profile.name} email={profile.email}>
      {children}
    </AppShell>
  );
}
