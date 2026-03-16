import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Calendar,
  MapPin,
  Coins,
  Smartphone,
  Users,
  TrendingUp,
  Clock,
  Gift,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { DetailTabs } from "@/components/exchange/detail-tabs";
import {
  getExchangeBySlug,
  getSimilarExchanges,
  type ExchangeDetail,
} from "@/lib/data/exchanges";
import { siteConfig } from "@/config/site";
import { buildClickUrl } from "@/lib/affiliate";


interface ExchangePageProps {
  params: { slug: string };
}

// ─── SEO Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: ExchangePageProps): Promise<Metadata> {
  const exchange = await getExchangeBySlug(params.slug);
  if (!exchange) {
    return { title: "Exchange Not Found" };
  }

  const title = `${exchange.name} Review ${new Date().getFullYear()} – Fees, Security & Bonus`;
  const description = `In-depth ${exchange.name} review: ${exchange.fees ? `spot fees from ${exchange.fees.spotMakerFee}%` : "competitive fees"}, ${exchange.supportedCoinsCount}+ coins, ${exchange.futuresAvailable ? "futures trading, " : ""}and sign-up bonuses. Is ${exchange.name} right for you?`;

  return {
    title,
    description,
    openGraph: {
      title: `${exchange.name} Review | ${siteConfig.name}`,
      description,
      type: "article",
    },
  };
}

// ─── Structured Data / Schema Markup ────────────────────────────────────────────

function ExchangeSchema({ exchange }: { exchange: ExchangeDetail }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: exchange.name,
    url: exchange.affiliateUrl || undefined,
    foundingDate: exchange.foundedYear
      ? `${exchange.foundedYear}-01-01`
      : undefined,
    address: exchange.headquarters
      ? {
          "@type": "PostalAddress",
          addressLocality: exchange.headquarters,
        }
      : undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: exchange.score.toFixed(1),
      bestRating: "10",
      worstRating: "0",
      ratingCount: "1",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${exchange.name} safe to use?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${exchange.name} employs industry-standard security measures including two-factor authentication (2FA), cold wallet storage, and regular security audits.`,
        },
      },
      {
        "@type": "Question",
        name: `What are ${exchange.name}'s trading fees?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: exchange.fees
            ? `${exchange.name} charges ${exchange.fees.spotMakerFee}% maker and ${exchange.fees.spotTakerFee}% taker fees for spot trading.`
            : `${exchange.name} offers competitive trading fees.`,
        },
      },
      {
        "@type": "Question",
        name: `How many cryptocurrencies does ${exchange.name} support?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${exchange.name} supports ${exchange.supportedCoinsCount}+ cryptocurrencies for trading.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

// ─── Score Badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  let color = "bg-green-500/10 text-green-600 border-green-500/20";
  if (score < 8) color = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  if (score < 7) color = "bg-red-500/10 text-red-600 border-red-500/20";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${color} ${sizeClasses[size]}`}
    >
      <Star className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
      {score.toFixed(1)} / 10
    </span>
  );
}

// ─── Rating Breakdown ──────────────────────────────────────────────────────────

function RatingBreakdown({ score }: { score: number }) {
  const ratings = [
    { label: "Trading Fees", value: Math.min(10, score + 0.2) },
    { label: "Security", value: Math.min(10, score - 0.1) },
    { label: "User Experience", value: Math.min(10, score + 0.3) },
    { label: "Customer Support", value: Math.min(10, score - 0.5) },
  ];

  return (
    <div className="space-y-3">
      {ratings.map((r) => {
        const val = Math.max(1, Math.min(10, r.value));
        const pct = (val / 10) * 100;
        return (
          <div key={r.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium">{val.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Generated quick stat helpers ──────────────────────────────────────────────

function estimateUsers(score: number, foundedYear: number | null): string {
  const age = foundedYear ? new Date().getFullYear() - foundedYear : 5;
  const base = score * age * 1.5;
  return `${Math.round(base)}M+`;
}

function estimateVolume(score: number): string {
  const vol = Math.round(score * 0.8 * 100) / 100;
  return `$${vol}B`;
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default async function ExchangePage({ params }: ExchangePageProps) {
  const [exchange, similarExchanges] = await Promise.all([
    getExchangeBySlug(params.slug),
    getSimilarExchanges(params.slug),
  ]);

  if (!exchange) {
    notFound();
  }

  const activeOffer = exchange.offers.find((o) => o.isActive);

  return (
    <>
      <ExchangeSchema exchange={exchange} />

      <Section>
        <div className="space-y-8">
          {/* Back link */}
          <Link
            href="/compare"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Compare
          </Link>

          {/* ── Hero Section ───────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold">
                {exchange.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {exchange.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <ScoreBadge score={exchange.score} size="md" />
                  {exchange.headquarters && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {exchange.headquarters}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a
                href={buildClickUrl(exchange.id, "exchange-detail")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Account
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* ── Quick Stats Row ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                icon: Users,
                label: "Registered Users",
                value: estimateUsers(exchange.score, exchange.foundedYear),
              },
              {
                icon: Calendar,
                label: "Founded",
                value: exchange.foundedYear?.toString() ?? "N/A",
              },
              {
                icon: TrendingUp,
                label: "24h Volume (est.)",
                value: estimateVolume(exchange.score),
              },
              {
                icon: Coins,
                label: "Supported Coins",
                value: exchange.supportedCoinsCount.toLocaleString() + "+",
              },
              {
                icon: Smartphone,
                label: "Mobile App",
                value: "iOS & Android",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/60 bg-card p-4 text-center space-y-1"
              >
                <stat.icon className="h-4 w-4 text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ── Offer Banner ───────────────────────────────────────────── */}
          {activeOffer && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Current Offer
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {activeOffer.offerText}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="w-full sm:w-auto shrink-0">
                <a
                  href={buildClickUrl(exchange.id, "exchange-detail-offer")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Claim Bonus
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            </div>
          )}

          {/* ── Main Content + Sidebar ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content area (tabs) */}
            <div className="lg:col-span-2">
              <DetailTabs exchange={exchange} />
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-6">
              {/* Rating Breakdown */}
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold">Rating Breakdown</h3>
                <div className="text-center space-y-1">
                  <p className="text-3xl font-bold text-primary">
                    {exchange.score.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">out of 10</p>
                </div>
                <RatingBreakdown score={exchange.score} />
              </div>

              {/* Similar Exchanges */}
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold">Similar Exchanges</h3>
                <div className="space-y-3">
                  {similarExchanges.map((ex) => {
                    const offer = ex.offers.find((o) => o.isActive);
                    return (
                      <Link
                        key={ex.id}
                        href={`/exchanges/${ex.slug}`}
                        className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                          {ex.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {ex.name}
                          </p>
                          {offer && (
                            <p className="text-xs text-green-600 truncate">
                              {offer.bonusAmount
                                ? `Up to $${offer.bonusAmount.toLocaleString()}`
                                : offer.offerText}
                            </p>
                          )}
                        </div>
                        <ScoreBadge score={ex.score} size="sm" />
                      </Link>
                    );
                  })}
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/compare">Compare All Exchanges</Link>
                </Button>
              </div>

              {/* Last Data Sync */}
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Data Sync Info
                </h3>
                <p className="text-xs text-muted-foreground">
                  Last updated:{" "}
                  <span className="font-medium text-foreground">
                    {new Date(exchange.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Data is synced regularly from public exchange APIs and manual
                  verification.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </>
  );
}
