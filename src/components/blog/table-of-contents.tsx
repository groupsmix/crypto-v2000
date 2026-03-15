import { List } from "lucide-react";
import { type TocItem } from "./article-body";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <List className="h-4 w-4 text-primary" />
        Table of Contents
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm text-muted-foreground hover:text-primary transition-colors ${
                item.level === 3 ? "pl-4" : ""
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
