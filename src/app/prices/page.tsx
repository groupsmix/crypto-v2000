import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { getTop200 } from "@/lib/data/coingecko";
import { PricesTable } from "@/components/prices/prices-table";
import { Coins } from "lucide-react";

export const metadata: Metadata = {
  title: "Crypto Prices — Top 200 Coins by Market Cap",
  description:
    "Live cryptocurrency prices for the top 200 coins. Track Bitcoin, Ethereum, and altcoin prices with 24h changes, market cap, volume, and 7-day sparkline charts.",
};

export const revalidate = 120; // ISR: revalidate every 2 minutes

export default async function PricesPage() {
  const coins = await getTop200();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cryptocurrency Prices",
    description: metadata.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/prices`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: coins.length,
      itemListElement: coins.slice(0, 10).map((coin, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Thing",
          name: coin.name,
          description: `${coin.name} (${coin.symbol.toUpperCase()}) cryptocurrency`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section>
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Cryptocurrency Prices
                </h1>
                <p className="text-sm text-muted-foreground">
                  Top {coins.length} coins by market capitalization
                </p>
              </div>
            </div>
          </div>

          <PricesTable coins={coins} />

          <p className="text-center text-xs text-muted-foreground">
            Prices updated every 2 minutes via CoinGecko API. Data cached in
            Redis for performance.
          </p>
        </div>
      </Section>
    </>
  );
}
