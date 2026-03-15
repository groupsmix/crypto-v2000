import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { type ExchangeWithOffers } from "@/lib/data/exchanges";

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-green-500/10 text-green-600";
  if (score < 8) color = "bg-yellow-500/10 text-yellow-600";
  if (score < 7) color = "bg-red-500/10 text-red-600";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      <Star className="h-3 w-3" />
      {score.toFixed(1)}
    </span>
  );
}

export function TopExchangesTable({
  exchanges,
}: {
  exchanges: ExchangeWithOffers[];
}) {
  return (
    <Section>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Top Crypto Exchanges
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ranked by our comprehensive scoring system covering fees, security,
            features, and user experience.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/40 bg-muted/50">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Exchange
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Signup Bonus
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {exchanges.map((exchange, i) => {
                const activeOffer = exchange.offers.find((o) => o.isActive);
                return (
                  <tr
                    key={exchange.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/exchanges/${exchange.slug}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                          {exchange.name.charAt(0)}
                        </div>
                        <span className="font-semibold group-hover:text-primary transition-colors">
                          {exchange.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <ScoreBadge score={exchange.score} />
                    </td>
                    <td className="px-6 py-4">
                      {activeOffer ? (
                        <span className="text-sm text-green-600 font-medium">
                          {activeOffer.bonusAmount
                            ? `Up to $${activeOffer.bonusAmount.toLocaleString()}`
                            : activeOffer.offerText}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={exchange.affiliateUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {exchanges.map((exchange, i) => {
            const activeOffer = exchange.offers.find((o) => o.isActive);
            return (
              <div
                key={exchange.id}
                className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/exchanges/${exchange.slug}`}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs font-medium text-muted-foreground w-5">
                      {i + 1}.
                    </span>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                      {exchange.name.charAt(0)}
                    </div>
                    <span className="font-semibold">{exchange.name}</span>
                  </Link>
                  <ScoreBadge score={exchange.score} />
                </div>
                {activeOffer && (
                  <p className="text-sm text-green-600 font-medium pl-8">
                    🎁{" "}
                    {activeOffer.bonusAmount
                      ? `Up to $${activeOffer.bonusAmount.toLocaleString()} bonus`
                      : activeOffer.offerText}
                  </p>
                )}
                <div className="pl-8">
                  <Button asChild size="sm" className="w-full">
                    <a
                      href={exchange.affiliateUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Exchange
                      <ExternalLink className="ml-1.5 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/compare">View All Exchanges →</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
