import Link from "next/link";
import { Section } from "@/components/ui/section";

export default function CoinNotFound() {
  return (
    <Section>
      <div className="max-w-2xl mx-auto text-center space-y-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight">Coin Not Found</h1>
        <p className="text-muted-foreground">
          The cryptocurrency you&apos;re looking for doesn&apos;t exist or isn&apos;t tracked yet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/prices"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View All Prices
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </Section>
  );
}
