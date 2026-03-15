import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | CryptoCompare AI",
  description: "Latest news, guides, and insights about crypto exchanges.",
};

export default function BlogPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="text-muted-foreground">Blog posts coming soon.</p>
      </div>
    </main>
  );
}
