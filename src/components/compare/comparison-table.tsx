"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Star, Check, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ExchangeForComparison } from "@/lib/data/exchanges";
import { buildClickUrl } from "@/lib/affiliate";

// ─── Filter State ──────────────────────────────────────────────────────────────

type FilterState = {
  kycRequired: "all" | "yes" | "no";
  spotAvailable: "all" | "yes" | "no";
  futuresAvailable: "all" | "yes" | "no";
};

// ─── Score Badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-green-500/10 text-green-600";
  if (score < 8) color = "bg-yellow-500/10 text-yellow-600";
  if (score < 7) color = "bg-red-500/10 text-red-600";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      <Star className="h-3 w-3" />
      {score.toFixed(1)}
    </span>
  );
}

// ─── Boolean Badge ─────────────────────────────────────────────────────────────

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
      <Check className="h-3.5 w-3.5" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <X className="h-3.5 w-3.5" />
      No
    </span>
  );
}

// ─── Filter Button ─────────────────────────────────────────────────────────────

function FilterButton({
  label,
  value,
  activeValue,
  onClick,
}: {
  label: string;
  value: string;
  activeValue: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        value === activeValue
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
    </button>
  );
}

// ─── Compare Selection Bar ─────────────────────────────────────────────────────

function CompareBar({
  selected,
  exchanges,
  onClear,
}: {
  selected: Set<string>;
  exchanges: ExchangeForComparison[];
  onClear: () => void;
}) {
  if (selected.size === 0) return null;

  const selectedExchanges = exchanges.filter((e) => selected.has(e.id));

  return (
    <div className="sticky bottom-4 z-10 mx-auto max-w-3xl">
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {selected.size} selected:
            </span>
            {selectedExchanges.map((ex) => (
              <span
                key={ex.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {ex.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear
            </Button>
            <Button size="sm" disabled={selected.size < 2}>
              Compare ({selected.size})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ComparisonTable({
  exchanges,
}: {
  exchanges: ExchangeForComparison[];
}) {
  const [filters, setFilters] = useState<FilterState>({
    kycRequired: "all",
    spotAvailable: "all",
    futuresAvailable: "all",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredExchanges = useMemo(() => {
    return exchanges.filter((ex) => {
      if (filters.kycRequired !== "all") {
        const wantKyc = filters.kycRequired === "yes";
        if (ex.kycRequired !== wantKyc) return false;
      }
      if (filters.spotAvailable !== "all") {
        const wantSpot = filters.spotAvailable === "yes";
        if (ex.spotAvailable !== wantSpot) return false;
      }
      if (filters.futuresAvailable !== "all") {
        const wantFutures = filters.futuresAvailable === "yes";
        if (ex.futuresAvailable !== wantFutures) return false;
      }
      return true;
    });
  }, [exchanges, filters]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const activeFilterCount = Object.values(filters).filter((v) => v !== "all").length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border border-border/60 bg-card p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* KYC Required */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              KYC Required
            </label>
            <div className="flex gap-1.5">
              {(["all", "yes", "no"] as const).map((val) => (
                <FilterButton
                  key={val}
                  label={val === "all" ? "All" : val === "yes" ? "Yes" : "No"}
                  value={val}
                  activeValue={filters.kycRequired}
                  onClick={() => setFilter("kycRequired", val)}
                />
              ))}
            </div>
          </div>
          {/* Spot Trading */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Spot Trading
            </label>
            <div className="flex gap-1.5">
              {(["all", "yes", "no"] as const).map((val) => (
                <FilterButton
                  key={val}
                  label={val === "all" ? "All" : val === "yes" ? "Yes" : "No"}
                  value={val}
                  activeValue={filters.spotAvailable}
                  onClick={() => setFilter("spotAvailable", val)}
                />
              ))}
            </div>
          </div>
          {/* Futures Trading */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Futures Trading
            </label>
            <div className="flex gap-1.5">
              {(["all", "yes", "no"] as const).map((val) => (
                <FilterButton
                  key={val}
                  label={val === "all" ? "All" : val === "yes" ? "Yes" : "No"}
                  value={val}
                  activeValue={filters.futuresAvailable}
                  onClick={() => setFilter("futuresAvailable", val)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredExchanges.length} of {exchanges.length} exchanges
      </p>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/40 bg-muted/50">
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Exchange
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Spot Fee
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Futures Fee
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Signup Bonus
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Coins
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filteredExchanges.map((exchange) => {
              const activeOffer = exchange.offers.find((o) => o.isActive);
              const isSelected = selected.has(exchange.id);
              return (
                <tr
                  key={exchange.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleSelect(exchange.id)}
                      className={cn(
                        "h-5 w-5 rounded border-2 transition-colors flex items-center justify-center",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                      aria-label={`Select ${exchange.name} for comparison`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/exchanges/${exchange.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                        {exchange.name.charAt(0)}
                      </div>
                      <span className="font-semibold group-hover:text-primary transition-colors">
                        {exchange.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <ScoreBadge score={exchange.score} />
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {exchange.fees ? (
                      <span>
                        {exchange.fees.spotMakerFee}% / {exchange.fees.spotTakerFee}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {exchange.fees?.futuresMakerFee != null &&
                    exchange.fees?.futuresTakerFee != null ? (
                      <span>
                        {exchange.fees.futuresMakerFee}% / {exchange.fees.futuresTakerFee}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {activeOffer ? (
                      <span className="text-sm text-green-600 font-medium">
                        {activeOffer.bonusAmount
                          ? `Up to $${activeOffer.bonusAmount.toLocaleString()}`
                          : activeOffer.offerText}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {exchange.supportedCoinsCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button asChild size="sm">
                      <a
                        href={buildClickUrl({ exchangeSlug: exchange.slug, sourceType: "compare", sourcePath: "/compare" })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Account
                        <ExternalLink className="ml-1.5 h-3 w-3" />
                      </a>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filteredExchanges.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No exchanges match the selected filters. Try adjusting your
                  criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredExchanges.map((exchange) => {
          const activeOffer = exchange.offers.find((o) => o.isActive);
          const isSelected = selected.has(exchange.id);
          return (
            <div
              key={exchange.id}
              className={cn(
                "rounded-xl border border-border/60 bg-card p-4 space-y-4",
                isSelected && "border-primary/50 bg-primary/5"
              )}
            >
              {/* Top row: checkbox + name + score */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSelect(exchange.id)}
                  className={cn(
                    "h-5 w-5 rounded border-2 transition-colors flex items-center justify-center shrink-0",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  )}
                  aria-label={`Select ${exchange.name} for comparison`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </button>
                <Link
                  href={`/exchanges/${exchange.slug}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                    {exchange.name.charAt(0)}
                  </div>
                  <span className="font-semibold truncate">{exchange.name}</span>
                </Link>
                <ScoreBadge score={exchange.score} />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pl-8">
                <div>
                  <span className="text-xs text-muted-foreground">Spot Fee</span>
                  <p className="font-medium">
                    {exchange.fees
                      ? `${exchange.fees.spotMakerFee}% / ${exchange.fees.spotTakerFee}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Futures Fee</span>
                  <p className="font-medium">
                    {exchange.fees?.futuresMakerFee != null &&
                    exchange.fees?.futuresTakerFee != null
                      ? `${exchange.fees.futuresMakerFee}% / ${exchange.fees.futuresTakerFee}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Coins</span>
                  <p className="font-medium">
                    {exchange.supportedCoinsCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Bonus</span>
                  <p className="font-medium">
                    {activeOffer ? (
                      <span className="text-green-600">
                        {activeOffer.bonusAmount
                          ? `$${activeOffer.bonusAmount.toLocaleString()}`
                          : activeOffer.offerText}
                      </span>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">KYC</span>
                  <p><BoolBadge value={exchange.kycRequired} /></p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Futures</span>
                  <p><BoolBadge value={exchange.futuresAvailable} /></p>
                </div>
              </div>

              {/* CTA */}
              <div className="pl-8">
                <Button asChild size="sm" className="w-full">
                  <a
                    href={buildClickUrl({ exchangeSlug: exchange.slug, sourceType: "compare", sourcePath: "/compare" })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Account
                    <ExternalLink className="ml-1.5 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
        {filteredExchanges.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No exchanges match the selected filters.
            </p>
          </div>
        )}
      </div>

      {/* Compare selection bar */}
      <CompareBar
        selected={selected}
        exchanges={exchanges}
        onClear={clearSelection}
      />
    </div>
  );
}
