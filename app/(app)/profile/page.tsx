import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { requireProfile } from "@/features/auth/queries";
import { CURRENCIES } from "@/lib/validations/auth";

export const metadata: Metadata = {
  title: "Profile",
};

type Currency = (typeof CURRENCIES)[number];

function toCurrency(value: string): Currency {
  return (CURRENCIES as readonly string[]).includes(value)
    ? (value as Currency)
    : "INR";
}

export default async function ProfilePage() {
  const profile = await requireProfile();

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your account, currency, and credit card limit."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Changes apply immediately across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={profile.email}
            defaultValues={{
              name: profile.name,
              currency: toCurrency(profile.currency),
              credit_card_limit: Number(profile.credit_card_limit ?? 0),
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
