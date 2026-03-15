import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free CryptoCompare AI account to save comparisons, set price alerts, and track your favorite cryptocurrencies.",
};

export default function SignupPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              CryptoCompare AI
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Start tracking exchanges, saving comparisons, and setting alerts
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
