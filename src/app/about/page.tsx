import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Calculator,
  Shield,
  Target,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name} — a cryptocurrency comparison platform helping traders find the best exchanges, track live prices, and make informed decisions.`,
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <Section>
      <div className="max-w-3xl mx-auto space-y-10 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About {siteConfig.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We help crypto traders compare exchanges, track prices, and make
            smarter decisions with unbiased data and free tools.
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The cryptocurrency exchange landscape is fragmented and confusing.
            Different platforms charge different fees, support different coins,
            and cater to different types of traders. {siteConfig.name} exists to
            cut through the noise — we provide transparent, side-by-side
            comparisons so you can find the exchange that fits your needs.
          </p>
        </div>

        {/* What We Offer */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: ArrowLeftRight,
                title: "Exchange Comparisons",
                description:
                  "Side-by-side comparison of fees, features, supported coins, and signup bonuses across leading exchanges.",
              },
              {
                icon: BarChart3,
                title: "Live Price Tracking",
                description:
                  "Real-time cryptocurrency prices for the top coins by market cap, updated frequently with data from CoinGecko.",
              },
              {
                icon: Calculator,
                title: "Free Trading Tools",
                description:
                  "Fee calculators, profit/loss calculators, DCA simulators, converters, and a local portfolio tracker.",
              },
              {
                icon: BookOpen,
                title: "Guides & Reviews",
                description:
                  "In-depth exchange reviews, trading guides, and market insights to help you navigate the crypto space.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/60 bg-card p-5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency */}
        <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Transparency</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Some links on this site are affiliate links — if you sign up through
            them, we may earn a commission at no extra cost to you. This is how
            we keep the site free. We clearly disclose this on every page and
            never let affiliate relationships influence our comparisons or
            ratings.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-muted-foreground">
            Ready to find the right exchange?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link href="/compare">Compare Exchanges</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/prices">View Live Prices</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
