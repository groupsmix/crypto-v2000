export default function Loading() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero skeleton */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="h-8 w-64 rounded-full bg-muted/60 animate-pulse mx-auto" />
          <div className="space-y-3">
            <div className="h-12 w-3/4 rounded-lg bg-muted/60 animate-pulse mx-auto" />
            <div className="h-12 w-1/2 rounded-lg bg-muted/60 animate-pulse mx-auto" />
          </div>
          <div className="h-6 w-2/3 rounded-lg bg-muted/40 animate-pulse mx-auto" />
          <div className="flex justify-center gap-4">
            <div className="h-12 w-44 rounded-md bg-muted/60 animate-pulse" />
            <div className="h-12 w-44 rounded-md bg-muted/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card p-6 space-y-3"
              >
                <div className="h-10 w-10 rounded-lg bg-muted/60 animate-pulse" />
                <div className="h-5 w-3/4 rounded bg-muted/60 animate-pulse" />
                <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
