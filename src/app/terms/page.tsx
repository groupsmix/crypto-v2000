import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${siteConfig.name}. Read the terms and conditions governing your use of our platform.`,
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  const lastUpdated = "March 22, 2026";

  return (
    <Section>
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using {siteConfig.name}, you agree to be bound by
              these Terms of Service. If you do not agree with any part of these
              terms, please do not use our website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Not Financial Advice</h2>
            <p className="text-muted-foreground leading-relaxed">
              The content on {siteConfig.name} is for informational purposes
              only and does not constitute financial, investment, or trading
              advice. Cryptocurrency trading involves substantial risk of loss.
              You should consult with a qualified financial advisor before making
              any investment decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Accuracy of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to provide accurate and up-to-date information about
              cryptocurrency exchanges, prices, and fees. However, we make no
              warranties or representations regarding the completeness,
              accuracy, or reliability of any information on this site. Exchange
              fees, features, and availability may change without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Affiliate Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some links on this site are affiliate links. If you click through
              and make a purchase or sign up, we may earn a commission at no
              extra cost to you. This helps us keep the site running and provide
              free tools and content. We only recommend exchanges we have
              reviewed and believe offer genuine value.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Third-Party Websites</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our site contains links to third-party websites (cryptocurrency
              exchanges). We are not responsible for the content, privacy
              policies, or practices of these external sites. Your use of
              third-party services is at your own risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on {siteConfig.name}, including text, graphics, logos,
              and software, is the property of {siteConfig.name} and is
              protected by copyright laws. You may not reproduce, distribute, or
              create derivative works without our written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              {siteConfig.name} shall not be liable for any direct, indirect,
              incidental, or consequential damages arising from your use of this
              website or reliance on any information provided. This includes, but
              is not limited to, financial losses from cryptocurrency trading.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting to this page. Your
              continued use of the site after changes constitutes acceptance of
              the updated terms.
            </p>
          </section>
        </div>
      </div>
    </Section>
  );
}
