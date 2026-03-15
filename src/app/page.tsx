import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Zap, Gift } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: BarChart3,
    title: "Side-by-Side Comparison",
    description: "Compare fees, features, and security across 50+ exchanges in one view.",
  },
  {
    icon: Shield,
    title: "Security Ratings",
    description: "Independent security scores based on track record, audits, and insurance.",
  },
  {
    icon: Zap,
    title: "Real-Time Data",
    description: "Live fee updates and trading volume data refreshed every minute.",
  },
  {
    icon: Gift,
    title: "Exclusive Offers",
    description: "Sign-up bonuses and fee discounts available only through our referral links.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Section className="py-20 md:py-28 lg:py-36">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            Trusted by 10,000+ traders worldwide
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Find the{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Best Crypto Exchange
            </span>{" "}
            for You
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {siteConfig.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/compare">
                Compare Exchanges
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/blog">Read Our Guides</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="border-t border-border/40 bg-muted/30">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why CryptoCompare AI?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make an informed decision about where to trade.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border/60 bg-card p-6 space-y-3 transition-shadow hover:shadow-md"
            >
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border/60 p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to find your perfect exchange?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of traders who use CryptoCompare AI to save on fees and find the best trading platforms.
          </p>
          <Button asChild size="lg">
            <Link href="/compare">
              Start Comparing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
