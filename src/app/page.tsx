import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {siteConfig.description}
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <a
            href="/compare"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Compare Exchanges
          </a>
          <a
            href="/blog"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Read Blog
          </a>
        </div>
      </div>
    </main>
  );
}
