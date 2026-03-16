import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SettingsForm } from "@/components/dashboard/settings-form";


export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your CryptoCompare AI account settings.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      <SettingsForm user={session.user} />
    </div>
  );
}
