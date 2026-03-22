import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}. Learn how we collect, use, and protect your data.`,
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  const lastUpdated = "March 22, 2026";

  return (
    <Section>
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you voluntarily provide, such as your email
              address when subscribing to our newsletter. We also automatically
              collect certain technical data when you visit our site, including
              your IP address (stored as a one-way hash for fraud prevention),
              browser type, and referring URL.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use collected information to operate and improve our services,
              send newsletter updates (if you subscribed), track affiliate link
              clicks for analytics purposes, and prevent fraud or abuse.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Affiliate Links &amp; Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our site contains affiliate links to cryptocurrency exchanges.
              When you click these links, we record the click (source page,
              timestamp, hashed IP) for analytics. You will be redirected to the
              exchange&apos;s website, which has its own privacy policy. We
              encourage you to review their policies before providing personal
              information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Cookies &amp; Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use local storage to save your theme preference (light/dark
              mode) and portfolio data (if you use the portfolio tracker tool).
              This data stays on your device and is never transmitted to our
              servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Newsletter email addresses are retained until you unsubscribe.
              Affiliate click data is retained for analytics and reporting
              purposes. We do not sell or share your personal data with third
              parties for marketing purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal
              data. You can unsubscribe from our newsletter at any time using the
              link in any email. For data deletion requests, please contact us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including HTTPS
              encryption, secure headers (HSTS, CSP), and hashing of sensitive
              identifiers. However, no method of transmission over the Internet
              is 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. Changes will
              be posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </div>
    </Section>
  );
}
