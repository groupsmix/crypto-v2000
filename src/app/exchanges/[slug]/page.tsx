import type { Metadata } from "next";

interface ExchangePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ExchangePageProps): Promise<Metadata> {
  return {
    title: `${params.slug} | CryptoCompare AI`,
    description: `Detailed review and information about ${params.slug}.`,
  };
}

export default function ExchangePage({ params }: ExchangePageProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl capitalize">
          {params.slug}
        </h1>
        <p className="text-muted-foreground">
          Exchange details page coming soon.
        </p>
      </div>
    </main>
  );
}
