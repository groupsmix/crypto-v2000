import Link from "next/link";
import { ExternalLink, Star, Gift } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { type ExchangeWithOffers } from "@/lib/data/exchanges";

export function FeaturedExchanges({
  exchanges,
}: {
  exchanges: ExchangeWithOffers[];
}) {
  return (
    <Section className="bg-muted/30 border-y border-border/40">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Featured Exchanges
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our top picks based on fees, security, and exclusive sign-up bonuses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exchanges.map((exchange) => {
            const activeOffer = exchange.offers.find((o) => o.isActive);
            return (
              <div
                key={exchange.id}
                className="rounded-xl border border-border/60 bg-card p-6 space-y-4 transition-all hover:shadow-lg hover:border-primary/30"
              >
                {/* Logo placeholder & score */}
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-lg font-bold">
                    {exchange.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    {exchange.score.toFixed(1)}
                  </div>
                </div>

                {/* Name & description */}
                <div>
                  <Link
                    href={`/exchanges/${exchange.slug}`}
                    className="text-lg font-semibold hover:text-primary transition-colors"
                  >
                    {exchange.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {exchange.description}
                  </p>
                </div>

                {/* Offer badge */}
                {activeOffer && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
                    <Gift className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="text-xs font-medium text-green-600 line-clamp-1">
                      {activeOffer.bonusAmount
                        ? `$${activeOffer.bonusAmount.toLocaleString()} Bonus`
                        : activeOffer.offerText}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <Button asChild size="sm" className="w-full">
                  <a
                    href={exchange.affiliateUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit {exchange.name}
                    <ExternalLink className="ml-1.5 h-3 w-3" />
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
