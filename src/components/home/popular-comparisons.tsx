import Link from "next/link";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

const comparisons = [
  {
    slug: "binance-vs-bybit",
    a: "Binance",
    b: "Bybit",
    tagline: "Lowest fees head-to-head",
  },
  {
    slug: "binance-vs-coinbase",
    a: "Binance",
    b: "Coinbase",
    tagline: "Global vs US-focused",
  },
  {
    slug: "kraken-vs-coinbase",
    a: "Kraken",
    b: "Coinbase",
    tagline: "Security & compliance compared",
  },
  {
    slug: "binance-vs-kraken",
    a: "Binance",
    b: "Kraken",
    tagline: "Feature depth vs trust",
  },
  {
    slug: "bybit-vs-kucoin",
    a: "Bybit",
    b: "KuCoin",
    tagline: "Derivatives vs altcoin variety",
  },
  {
    slug: "coinbase-vs-kucoin",
    a: "Coinbase",
    b: "KuCoin",
    tagline: "Simplicity vs selection",
  },
];

export function PopularComparisons() {
  return (
    <Section>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular Comparisons
            </h2>
            <p className="text-muted-foreground">
              See how top exchanges stack up side by side.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
          >
            <Link href="/compare">
              Compare All
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/vs/${c.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate group-hover:text-primary transition-colors">
                  {c.a} vs {c.b}
                </p>
                <p className="text-xs text-muted-foreground">{c.tagline}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
