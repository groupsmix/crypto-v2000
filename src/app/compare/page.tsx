import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Compare Exchanges",
  description:
    "Compare crypto exchanges side-by-side. Analyze fees, security, features, and more.",
};

export default function ComparePage() {
  return (
    <Section>
      <div className="space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compare Exchanges
          </h1>
          <p className="text-muted-foreground">
            Select two or more exchanges to compare fees, features, security,
            and more side-by-side.
          </p>
        </div>

        {/* Comparison tool placeholder */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 md:p-20 text-center">
          <p className="text-sm text-muted-foreground">
            Comparison tool will be implemented here.
          </p>
        </div>
      </div>
    </Section>
  );
}
