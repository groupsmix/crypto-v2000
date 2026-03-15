import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

interface ExchangePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ExchangePageProps): Promise<Metadata> {
  const name = params.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${name} Review`,
    description: `In-depth review of ${name}: fees, security, features, and sign-up bonuses.`,
  };
}

export default function ExchangePage({ params }: ExchangePageProps) {
  const name = params.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <Section>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Compare
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-lg font-bold">
                {name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Cryptocurrency Exchange
                </p>
              </div>
            </div>
            <Button size="sm" className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Visit Exchange
            </Button>
          </div>
        </div>

        {/* Exchange details placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Overview", "Fees", "Security"].map((section) => (
            <div
              key={section}
              className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center"
            >
              <p className="text-sm font-medium mb-1">{section}</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
