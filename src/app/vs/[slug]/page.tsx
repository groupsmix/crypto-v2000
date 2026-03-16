import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftRight,
  ExternalLink,
  Star,
  Check,
  X,
  Trophy,
  Users,
  TrendingUp,
  Coins,
  Shield,
  Zap,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { buildClickUrl } from "@/lib/affiliate";
import { getVsComparison } from "@/lib/data/vs-comparisons";
import { type ExchangeDetail } from "@/lib/data/exchanges";
import { generateVsVerdict, type VsVerdict } from "@/lib/vs-verdict";

export const dynamic = "force-dynamic";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface VsPageProps {
  params: { slug: string };
}

// ─── SEO Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: VsPageProps): Promise<Metadata> {
  const data = await getVsComparison(params.slug);
  if (!data) {
    return { title: "Comparison Not Found" };
  }

  const { exchangeA: a, exchangeB: b } = data;
  const year = new Date().getFullYear();

  const title = `${a.name} vs ${b.name} ${year} – Compare Fees, Features & Signup Bonus`;
  const description = `${a.name} vs ${b.name}: side-by-side comparison of trading fees, supported coins, signup bonuses, KYC requirements, and more. Find out which exchange is best for you in ${year}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${a.name} vs ${b.name} | ${siteConfig.name}`,
      description,
      type: "article",
      url: `${siteConfig.url}/vs/${params.slug}`,
    },
    alternates: {
      canonical: `${siteConfig.url}/vs/${params.slug}`,
    },
  };
}

// ─── JSON-LD Schema ────────────────────────────────────────────────────────────

function VsSchema({
  a,
  b,
  verdict,
  slug,
}: {
  a: ExchangeDetail;
  b: ExchangeDetail;
  verdict: VsVerdict;
  slug: string;
}) {
  const year = new Date().getFullYear();

  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${a.name} vs ${b.name} ${year} – Compare Fees, Features & Signup Bonus`,
    description: verdict.summary,
    url: `${siteConfig.url}/vs/${slug}`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    dateModified: new Date().toISOString(),
    about: [
      {
        "@type": "Organization",
        name: a.name,
        url: a.affiliateUrl || undefined,
      },
      {
        "@type": "Organization",
        name: b.name,
        url: b.affiliateUrl || undefined,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Which is better, ${a.name} or ${b.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: verdict.summary,
        },
      },
      {
        "@type": "Question",
        name: `Which has lower fees, ${a.name} or ${b.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: verdict.forFees.reason,
        },
      },
      {
        "@type": "Question",
        name: `Which is better for beginners, ${a.name} or ${b.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: verdict.forBeginners.reason,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-green-500/10 text-green-600 border-green-500/20";
  if (score < 8) color = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  if (score < 7) color = "bg-red-500/10 text-red-600 border-red-500/20";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold border ${color}`}
    >
      <Star className="h-3.5 w-3.5" />
      {score.toFixed(1)}
    </span>
  );
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
      <Check className="h-4 w-4" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
      <X className="h-4 w-4" />
      No
    </span>
  );
}

function ComparisonRow({
  label,
  valueA,
  valueB,
  highlight,
}: {
  label: string;
  valueA: React.ReactNode;
  valueB: React.ReactNode;
  highlight?: "a" | "b" | null;
}) {
  return (
    <tr className="border-b border-border/40 last:border-0">
      <td className="py-4 px-4 text-sm font-medium text-muted-foreground w-1/3 text-center">
        {label}
      </td>
      <td
        className={`py-4 px-4 text-sm text-center ${highlight === "a" ? "bg-green-500/5 font-semibold" : ""}`}
      >
        {valueA}
      </td>
      <td
        className={`py-4 px-4 text-sm text-center ${highlight === "b" ? "bg-green-500/5 font-semibold" : ""}`}
      >
        {valueB}
      </td>
    </tr>
  );
}

function VerdictCard({
  icon: Icon,
  label,
  winner,
  reason,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  winner: string;
  reason: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-primary/10 p-1.5">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{label}</h3>
      </div>
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
        <span className="text-sm font-bold text-primary">{winner}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default async function VsPage({ params }: VsPageProps) {
  const data = await getVsComparison(params.slug);
  if (!data) {
    notFound();
  }

  const { exchangeA: a, exchangeB: b } = data;
  const verdict = generateVsVerdict(a, b);

  const year = new Date().getFullYear();
  const aOffer = a.offers.find((o) => o.isActive);
  const bOffer = b.offers.find((o) => o.isActive);

  // Determine highlights for each comparison row
  return (
    <>
      <VsSchema a={a} b={b} verdict={verdict} slug={params.slug} />

      <Section>
        <div className="space-y-10 max-w-5xl mx-auto">
          {/* ── Breadcrumb ────────────────────────────────────────── */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/compare"
              className="hover:text-foreground transition-colors"
            >
              Compare
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {a.name} vs {b.name}
            </span>
          </nav>

          {/* ── Hero ──────────────────────────────────────────────── */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {a.name} vs {b.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Detailed side-by-side comparison of {a.name} and {b.name} fees,
              features, supported coins, and signup bonuses for {year}.
            </p>
          </div>

          {/* ── Exchange Cards (Mobile-first Hero) ────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { exchange: a, offer: aOffer },
              { exchange: b, offer: bOffer },
            ].map(({ exchange, offer }) => (
              <div
                key={exchange.slug}
                className="rounded-xl border border-border/60 bg-card p-6 text-center space-y-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold mx-auto">
                  {exchange.name.charAt(0)}
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{exchange.name}</h2>
                  <ScoreBadge score={exchange.score} />
                </div>
                {offer && (
                  <p className="text-sm text-green-600 font-medium">
                    {offer.bonusAmount
                      ? `Up to $${offer.bonusAmount.toLocaleString()} bonus`
                      : offer.offerText}
                  </p>
                )}
                <Button asChild className="w-full">
                  <a
                    href={buildClickUrl(exchange.id, "vs-comparison")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open {exchange.name}
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
                <Link
                  href={`/exchanges/${exchange.slug}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors block"
                >
                  View full {exchange.name} review &rarr;
                </Link>
              </div>
            ))}
          </div>

          {/* ── Side-by-Side Comparison Table ─────────────────────── */}
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-4 py-3 border-b border-border/40">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                Feature Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center w-1/3">
                      Feature
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      {a.name}
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      {b.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    label="Overall Score"
                    valueA={<ScoreBadge score={a.score} />}
                    valueB={<ScoreBadge score={b.score} />}
                    highlight={a.score > b.score ? "a" : a.score < b.score ? "b" : null}
                  />
                  <ComparisonRow
                    label="Spot Maker Fee"
                    valueA={a.fees ? `${a.fees.spotMakerFee}%` : "N/A"}
                    valueB={b.fees ? `${b.fees.spotMakerFee}%` : "N/A"}
                    highlight={
                      a.fees && b.fees
                        ? a.fees.spotMakerFee < b.fees.spotMakerFee
                          ? "a"
                          : a.fees.spotMakerFee > b.fees.spotMakerFee
                            ? "b"
                            : null
                        : null
                    }
                  />
                  <ComparisonRow
                    label="Spot Taker Fee"
                    valueA={a.fees ? `${a.fees.spotTakerFee}%` : "N/A"}
                    valueB={b.fees ? `${b.fees.spotTakerFee}%` : "N/A"}
                    highlight={
                      a.fees && b.fees
                        ? a.fees.spotTakerFee < b.fees.spotTakerFee
                          ? "a"
                          : a.fees.spotTakerFee > b.fees.spotTakerFee
                            ? "b"
                            : null
                        : null
                    }
                  />
                  <ComparisonRow
                    label="Futures Maker Fee"
                    valueA={
                      a.fees?.futuresMakerFee != null
                        ? `${a.fees.futuresMakerFee}%`
                        : "N/A"
                    }
                    valueB={
                      b.fees?.futuresMakerFee != null
                        ? `${b.fees.futuresMakerFee}%`
                        : "N/A"
                    }
                    highlight={
                      a.fees?.futuresMakerFee != null &&
                      b.fees?.futuresMakerFee != null
                        ? a.fees.futuresMakerFee < b.fees.futuresMakerFee
                          ? "a"
                          : a.fees.futuresMakerFee > b.fees.futuresMakerFee
                            ? "b"
                            : null
                        : null
                    }
                  />
                  <ComparisonRow
                    label="Futures Taker Fee"
                    valueA={
                      a.fees?.futuresTakerFee != null
                        ? `${a.fees.futuresTakerFee}%`
                        : "N/A"
                    }
                    valueB={
                      b.fees?.futuresTakerFee != null
                        ? `${b.fees.futuresTakerFee}%`
                        : "N/A"
                    }
                    highlight={
                      a.fees?.futuresTakerFee != null &&
                      b.fees?.futuresTakerFee != null
                        ? a.fees.futuresTakerFee < b.fees.futuresTakerFee
                          ? "a"
                          : a.fees.futuresTakerFee > b.fees.futuresTakerFee
                            ? "b"
                            : null
                        : null
                    }
                  />
                  <ComparisonRow
                    label="Withdrawal Fee (BTC)"
                    valueA={
                      a.fees?.withdrawalFee != null
                        ? a.fees.withdrawalFee > 0
                          ? `${a.fees.withdrawalFee} BTC`
                          : "Free"
                        : "N/A"
                    }
                    valueB={
                      b.fees?.withdrawalFee != null
                        ? b.fees.withdrawalFee > 0
                          ? `${b.fees.withdrawalFee} BTC`
                          : "Free"
                        : "N/A"
                    }
                    highlight={
                      a.fees?.withdrawalFee != null &&
                      b.fees?.withdrawalFee != null
                        ? a.fees.withdrawalFee < b.fees.withdrawalFee
                          ? "a"
                          : a.fees.withdrawalFee > b.fees.withdrawalFee
                            ? "b"
                            : null
                        : null
                    }
                  />
                  <ComparisonRow
                    label="Supported Coins"
                    valueA={`${a.supportedCoinsCount.toLocaleString()}+`}
                    valueB={`${b.supportedCoinsCount.toLocaleString()}+`}
                    highlight={
                      a.supportedCoinsCount > b.supportedCoinsCount
                        ? "a"
                        : a.supportedCoinsCount < b.supportedCoinsCount
                          ? "b"
                          : null
                    }
                  />
                  <ComparisonRow
                    label="Signup Bonus"
                    valueA={
                      aOffer ? (
                        <span className="text-green-600 font-medium">
                          {aOffer.bonusAmount
                            ? `$${aOffer.bonusAmount.toLocaleString()}`
                            : aOffer.offerText}
                        </span>
                      ) : (
                        "—"
                      )
                    }
                    valueB={
                      bOffer ? (
                        <span className="text-green-600 font-medium">
                          {bOffer.bonusAmount
                            ? `$${bOffer.bonusAmount.toLocaleString()}`
                            : bOffer.offerText}
                        </span>
                      ) : (
                        "—"
                      )
                    }
                    highlight={
                      aOffer && bOffer
                        ? (aOffer.bonusAmount ?? 0) > (bOffer.bonusAmount ?? 0)
                          ? "a"
                          : (aOffer.bonusAmount ?? 0) < (bOffer.bonusAmount ?? 0)
                            ? "b"
                            : null
                        : aOffer
                          ? "a"
                          : bOffer
                            ? "b"
                            : null
                    }
                  />
                  <ComparisonRow
                    label="KYC Required"
                    valueA={<BoolCell value={a.kycRequired} />}
                    valueB={<BoolCell value={b.kycRequired} />}
                    highlight={null}
                  />
                  <ComparisonRow
                    label="Spot Trading"
                    valueA={<BoolCell value={a.spotAvailable} />}
                    valueB={<BoolCell value={b.spotAvailable} />}
                    highlight={null}
                  />
                  <ComparisonRow
                    label="Futures Trading"
                    valueA={<BoolCell value={a.futuresAvailable} />}
                    valueB={<BoolCell value={b.futuresAvailable} />}
                    highlight={
                      a.futuresAvailable && !b.futuresAvailable
                        ? "a"
                        : !a.futuresAvailable && b.futuresAvailable
                          ? "b"
                          : null
                    }
                  />
                  <ComparisonRow
                    label="Founded"
                    valueA={a.foundedYear?.toString() ?? "N/A"}
                    valueB={b.foundedYear?.toString() ?? "N/A"}
                    highlight={null}
                  />
                  <ComparisonRow
                    label="Headquarters"
                    valueA={a.headquarters ?? "N/A"}
                    valueB={b.headquarters ?? "N/A"}
                    highlight={null}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* ── AI Verdict Section ────────────────────────────────── */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Our Verdict: {a.name} vs {b.name}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-sm leading-relaxed">
                {verdict.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <VerdictCard
                icon={Users}
                label="Best for Beginners"
                winner={verdict.forBeginners.winner}
                reason={verdict.forBeginners.reason}
              />
              <VerdictCard
                icon={TrendingUp}
                label="Best for Advanced Traders"
                winner={verdict.forAdvanced.winner}
                reason={verdict.forAdvanced.reason}
              />
              <VerdictCard
                icon={Coins}
                label="Best for Low Fees"
                winner={verdict.forFees.winner}
                reason={verdict.forFees.reason}
              />
              <VerdictCard
                icon={Shield}
                label="Best Coin Variety"
                winner={verdict.forCoinVariety.winner}
                reason={verdict.forCoinVariety.reason}
              />
              <VerdictCard
                icon={Zap}
                label="Best User Experience"
                winner={verdict.forUx.winner}
                reason={verdict.forUx.reason}
              />
            </div>
          </div>

          {/* ── CTA Section ───────────────────────────────────────── */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">
                Ready to Start Trading?
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Open an account on {a.name} or {b.name} using our referral
                links to get exclusive signup bonuses.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg">
                  <a
                    href={buildClickUrl(a.id, "vs-comparison")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open {a.name}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a
                    href={buildClickUrl(b.id, "vs-comparison")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open {b.name}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* ── Internal Links ────────────────────────────────────── */}
          <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold">Related Pages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                href="/compare"
                className="flex items-center gap-2 rounded-lg p-3 bg-muted/30 hover:bg-muted/60 transition-colors text-sm font-medium"
              >
                <ArrowLeftRight className="h-4 w-4 text-primary shrink-0" />
                Compare All Exchanges
              </Link>
              <Link
                href={`/exchanges/${a.slug}`}
                className="flex items-center gap-2 rounded-lg p-3 bg-muted/30 hover:bg-muted/60 transition-colors text-sm font-medium"
              >
                <Star className="h-4 w-4 text-primary shrink-0" />
                {a.name} Full Review
              </Link>
              <Link
                href={`/exchanges/${b.slug}`}
                className="flex items-center gap-2 rounded-lg p-3 bg-muted/30 hover:bg-muted/60 transition-colors text-sm font-medium"
              >
                <Star className="h-4 w-4 text-primary shrink-0" />
                {b.name} Full Review
              </Link>
            </div>
          </div>

          {/* ── Footer Note ───────────────────────────────────────── */}
          <p className="text-center text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
            Data sourced from public exchange APIs and verified manually.
            This comparison is for informational purposes only and does not constitute financial advice.
          </p>
        </div>
      </Section>
    </>
  );
}
