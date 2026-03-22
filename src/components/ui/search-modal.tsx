"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Coins, ArrowLeftRight, BookOpen, Calculator } from "lucide-react";

const quickLinks = [
  { title: "Live Prices", href: "/prices", icon: Coins, description: "Track top cryptocurrencies" },
  { title: "Compare Exchanges", href: "/compare", icon: ArrowLeftRight, description: "Side-by-side comparisons" },
  { title: "Blog", href: "/blog", icon: BookOpen, description: "Guides, reviews & insights" },
  { title: "Fee Calculator", href: "/tools/fee-calculator", icon: Calculator, description: "Calculate trading fees" },
  { title: "Profit Calculator", href: "/tools/profit-calculator", icon: Calculator, description: "Calculate profit & loss" },
  { title: "DCA Calculator", href: "/tools/dca-calculator", icon: Calculator, description: "Dollar-cost averaging simulator" },
  { title: "Crypto Converter", href: "/tools/converter", icon: Coins, description: "Convert between currencies" },
  { title: "Portfolio Tracker", href: "/tools/portfolio-tracker", icon: Coins, description: "Track your holdings" },
];

const exchangeLinks = [
  { title: "Binance", href: "/exchanges/binance" },
  { title: "Coinbase", href: "/exchanges/coinbase" },
  { title: "Kraken", href: "/exchanges/kraken" },
  { title: "Bybit", href: "/exchanges/bybit" },
  { title: "KuCoin", href: "/exchanges/kucoin" },
];

const comparisonLinks = [
  { title: "Binance vs Coinbase", href: "/vs/binance-vs-coinbase" },
  { title: "Binance vs Bybit", href: "/vs/binance-vs-bybit" },
  { title: "Kraken vs Coinbase", href: "/vs/kraken-vs-coinbase" },
  { title: "Binance vs Kraken", href: "/vs/binance-vs-kraken" },
];

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  function navigate(href: string) {
    onClose();
    router.push(href);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/blog?search=${encodeURIComponent(query.trim())}`);
    }
  }

  const q = query.toLowerCase().trim();

  const filteredQuickLinks = q
    ? quickLinks.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      )
    : quickLinks;

  const filteredExchanges = q
    ? exchangeLinks.filter((l) => l.title.toLowerCase().includes(q))
    : exchangeLinks;

  const filteredComparisons = q
    ? comparisonLinks.filter((l) => l.title.toLowerCase().includes(q))
    : comparisonLinks;

  const hasResults =
    filteredQuickLinks.length > 0 ||
    filteredExchanges.length > 0 ||
    filteredComparisons.length > 0;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-auto mt-[15vh] w-full max-w-lg px-4">
        <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, exchanges, tools..."
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </form>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {hasResults ? (
              <>
                {filteredQuickLinks.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Pages & Tools
                    </p>
                    {filteredQuickLinks.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => navigate(link.href)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left"
                      >
                        <link.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{link.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {link.description}
                          </p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredExchanges.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Exchanges
                    </p>
                    {filteredExchanges.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => navigate(link.href)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">
                          {link.title.charAt(0)}
                        </div>
                        <span className="font-medium flex-1">{link.title}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredComparisons.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Comparisons
                    </p>
                    {filteredComparisons.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => navigate(link.href)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left"
                      >
                        <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium flex-1">{link.title}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
                {query.trim() && (
                  <button
                    onClick={handleSearchSubmit}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Search blog for &ldquo;{query}&rdquo;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Navigate with keyboard</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              ESC
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
