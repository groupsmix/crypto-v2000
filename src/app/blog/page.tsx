import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Latest news, guides, and insights about crypto exchanges, trading fees, and the best platforms.",
};

export default function BlogPage() {
  return (
    <Section>
      <div className="space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Blog
          </h1>
          <p className="text-muted-foreground">
            Expert guides, exchange reviews, and crypto trading insights to help
            you make smarter decisions.
          </p>
        </div>

        {/* Blog posts grid placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card overflow-hidden"
            >
              <div className="h-40 bg-muted/50" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted/70" />
                  <div className="h-3 w-5/6 rounded bg-muted/70" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Blog content will be loaded from the database.
        </p>
      </div>
    </Section>
  );
}
