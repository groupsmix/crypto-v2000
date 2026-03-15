import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Exchanges | CryptoCompare AI",
  description: "Compare crypto exchanges side-by-side.",
};

export default function ComparePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Compare Exchanges
        </h1>
        <p className="text-muted-foreground">
          Exchange comparison tool coming soon.
        </p>
      </div>
    </main>
  );
}
