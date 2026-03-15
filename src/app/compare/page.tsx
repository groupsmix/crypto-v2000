import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ComparisonTable } from "@/components/compare/comparison-table";
import { getAllExchangesForComparison } from "@/lib/data/exchanges";

export const metadata: Metadata = {
  title: "Compare Crypto Exchanges – Side-by-Side Fees, Features & Bonuses",
  description:
    "Compare crypto exchanges side-by-side. Analyze trading fees, supported coins, signup bonuses, KYC requirements, and more to find the best platform for you.",
  openGraph: {
    title: "Compare Crypto Exchanges | CryptoCompare AI",
    description:
      "Side-by-side comparison of top crypto exchanges including Binance, Coinbase, Kraken, Bybit, and KuCoin. Filter by KYC, spot, and futures trading.",
  },
};

export default async function ComparePage() {
  const exchanges = await getAllExchangesForComparison();

  return (
    <Section>
      <div className="space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compare Crypto Exchanges
          </h1>
          <p className="text-muted-foreground">
            Filter and compare exchanges by fees, features, bonuses, and more.
            Select two or more to compare side-by-side.
          </p>
        </div>

        <ComparisonTable exchanges={exchanges} />
      </div>
    </Section>
  );
}
