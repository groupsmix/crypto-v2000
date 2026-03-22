import Link from "next/link";
import { Section } from "@/components/ui/section";

export default function ComparisonNotFound() {
  return (
    <Section>
      <div className="max-w-2xl mx-auto text-center space-y-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight">Comparison Not Found</h1>
        <p className="text-muted-foreground">
          The exchange comparison you&apos;re looking for doesn&apos;t exist. Try one of the popular comparisons below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/vs/binance-vs-coinbase"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Binance vs Coinbase
          </Link>
          <Link
            href="/vs/binance-vs-bybit"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Binance vs Bybit
          </Link>
          <Link
            href="/vs/kraken-vs-coinbase"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Kraken vs Coinbase
          </Link>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Compare All Exchanges
        </Link>
      </div>
    </Section>
  );
}
