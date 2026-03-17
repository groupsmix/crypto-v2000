import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  ArrowLeftRight,
  BookOpen,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <Section className="py-20 md:py-28 lg:py-36">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-Powered Exchange Comparisons
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Compare Crypto Exchanges{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            &amp; Track Prices
          </span>{" "}
          in Real Time
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Compare fees, bonuses &amp; features across 50+ exchanges. Track live
          prices and make smarter trading decisions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto text-base">
            <Link href="/compare">
              Compare Exchanges
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base"
          >
            <Link href="/prices">See Live Prices</Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/prices"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Live Prices
          </Link>
          <Link
            href="/vs/binance-vs-coinbase"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Binance vs Coinbase
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Guides &amp; Reviews
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Live data
          </span>
          <span>50+ exchanges</span>
          <span>Updated every 60s</span>
        </div>
      </div>
    </Section>
  );
}
