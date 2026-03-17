import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { getTopCoins } from "@/lib/price-service";
import { PricesTable } from "@/components/prices/prices-table";
import { siteConfig } from "@/config/site";
import { Coins, ArrowLeftRight, BookOpen } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cryptocompare.ai";

export const metadata: Metadata = {
  title: "Crypto Prices — Top 200 Coins by Market Cap",
  description:
    "Live cryptocurrency prices for the top 200 coins. Track Bitcoin, Ethereum, and altcoin prices with 24h changes, market cap, volume, and 7-day sparkline charts.",
  alternates: {
    canonical: "/prices",
  },
  openGraph: {
    title: `Crypto Prices | ${siteConfig.name}`,
    description:
      "Live cryptocurrency prices for the top 200 coins. Track Bitcoin, Ethereum, and altcoin prices with 24h changes, market cap, volume, and 7-day sparkline charts.",
    type: "website",
    url: `${siteUrl}/prices`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Crypto Prices | ${siteConfig.name}`,
    description:
      "Live cryptocurrency prices for the top 200 coins by market cap.",
  },
};

export const revalidate = 600; // ISR: revalidate every 10 minutes

export default async function PricesPage() {
  const coins = await getTopCoins();

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
            Prices updated every 10 minutes. Data provided by CoinGecko with
            CryptoCompare fallback.
          </p>

          {/* Internal Links */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors border border-border/60 rounded-full px-4 py-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Compare Exchanges
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors border border-border/60 rounded-full px-4 py-1.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Crypto Blog
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
