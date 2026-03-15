"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogFiltersProps {
  categories: string[];
  tags: string[];
  activeCategory?: string;
  activeTag?: string;
  activeSearch?: string;
}

export function BlogFilters({
  categories,
  tags,
  activeCategory,
  activeTag,
  activeSearch,
}: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(activeSearch ?? "");

  function updateFilters(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    startTransition(() => {
      router.push(`/blog?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search: searchValue || undefined });
  }

  function clearFilters() {
    setSearchValue("");
    startTransition(() => {
      router.push("/blog");
    });
  }

  const hasActiveFilters = activeCategory || activeTag || activeSearch;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border/60 bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              updateFilters({ search: undefined });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Filter className="h-3 w-3" />
          Category:
        </span>
        <Button
          variant={!activeCategory ? "default" : "outline"}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => updateFilters({ category: undefined })}
          disabled={isPending}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs capitalize"
            onClick={() =>
              updateFilters({
                category: activeCategory === cat ? undefined : cat,
              })
            }
            disabled={isPending}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Tags:</span>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() =>
              updateFilters({ tag: activeTag === tag ? undefined : tag })
            }
            disabled={isPending}
            className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium transition-colors ${
              activeTag === tag
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="h-3 w-3 mr-1" />
            Clear all filters
          </Button>
          {isPending && (
            <span className="text-xs text-muted-foreground">Loading...</span>
          )}
        </div>
      )}
    </div>
  );
}
