import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildClickUrl } from "@/lib/affiliate";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

/** Extract headings from markdown content for TOC */
export function extractHeadings(content: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      headings.push({ id, text, level });
    }
  }

  return headings;
}

// Hardcoded exchange data for affiliate CTAs in blog posts
const affiliateExchanges = [
  { id: "binance", name: "Binance", offer: "Get 20% off trading fees", slug: "binance" },
  { id: "coinbase", name: "Coinbase", offer: "Earn $10 in Bitcoin on sign up", slug: "coinbase" },
  { id: "bybit", name: "Bybit", offer: "Deposit bonus up to $30,000", slug: "bybit" },
];

function AffiliateCta({ index }: { index: number }) {
  const exchange = affiliateExchanges[index % affiliateExchanges.length];

  return (
    <div className="my-8 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">
            Featured Exchange: {exchange.name}
          </p>
          <p className="text-sm text-muted-foreground">{exchange.offer}</p>
          <Link
            href={`/exchanges/${exchange.slug}`}
            className="text-xs text-primary hover:underline"
          >
            Read our full {exchange.name} review &rarr;
          </Link>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto shrink-0">
          <a
            href={buildClickUrl(exchange.id, "blog-cta")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit {exchange.name}
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

/** Parse inline markdown (bold, italic, links, code, images) */
function parseInline(text: string): string {
  let result = text;
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Inline code
  result = result.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">$1</code>');
  // Links
  result = result.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" class="text-primary hover:underline">$1</a>'
  );
  return result;
}

/** Convert markdown content to rendered sections with affiliate CTAs */
export function ArticleBody({ content }: { content: string }) {
  const lines = content.split("\n");
  const sections: React.ReactNode[] = [];
  let ctaCount = 0;
  let sectionCount = 0;
  let currentParagraph: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inList = false;
  let listItems: { text: string; ordered: boolean; index: number }[] = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ").trim();
      if (text) {
        sections.push(
          <p
            key={`p-${sections.length}`}
            className="text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseInline(text) }}
          />
        );
      }
      currentParagraph = [];
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      const isOrdered = listItems[0].ordered;
      const Tag = isOrdered ? "ol" : "ul";
      sections.push(
        <Tag
          key={`list-${sections.length}`}
          className={`space-y-1.5 text-muted-foreground ${isOrdered ? "list-decimal" : "list-disc"} list-inside`}
        >
          {listItems.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: parseInline(item.text) }}
            />
          ))}
        </Tag>
      );
      listItems = [];
      inList = false;
    }
  }

  function flushTable() {
    if (tableHeaders.length > 0 && tableRows.length > 0) {
      sections.push(
        <div key={`table-${sections.length}`} className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {tableHeaders.map((h, i) => (
                  <th
                    key={i}
                    className="text-left py-2 px-3 font-semibold text-foreground"
                  >
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-0"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="py-2 px-3 text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: parseInline(cell.trim()),
                      }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Heading
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushTable();
      sectionCount++;

      // Insert affiliate CTA every 3 sections
      if (sectionCount > 0 && sectionCount % 3 === 0) {
        sections.push(<AffiliateCta key={`cta-${ctaCount}`} index={ctaCount} />);
        ctaCount++;
      }

      const level = headingMatch[1].length;
      const text = headingMatch[2].replace(/\*\*/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      if (level === 2) {
        sections.push(
          <h2
            key={`h2-${sections.length}`}
            id={id}
            className="text-xl font-bold tracking-tight mt-8 mb-3 scroll-mt-20"
          >
            {text}
          </h2>
        );
      } else {
        sections.push(
          <h3
            key={`h3-${sections.length}`}
            id={id}
            className="text-lg font-semibold mt-6 mb-2 scroll-mt-20"
          >
            {text}
          </h3>
        );
      }
      continue;
    }

    // Table detection
    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      const cells = line
        .split("|")
        .filter((c) => c.trim() !== "");

      // Separator row (|----|----)
      if (cells.every((c) => /^[\s-:]+$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Unordered list
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (inList && listItems.length > 0 && listItems[0].ordered) {
        flushList();
      }
      inList = true;
      listItems.push({ text: ulMatch[1], ordered: false, index: listItems.length });
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (inList && listItems.length > 0 && !listItems[0].ordered) {
        flushList();
      }
      inList = true;
      listItems.push({ text: olMatch[1], ordered: true, index: listItems.length });
      continue;
    }

    // End of list on non-list line
    if (inList && line.trim() === "") {
      flushList();
      continue;
    } else if (inList && line.trim() !== "") {
      flushList();
    }

    // Empty line = flush paragraph
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Regular text line
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();
  flushTable();

  // Add final affiliate CTA
  sections.push(<AffiliateCta key={`cta-final`} index={ctaCount} />);

  return <div className="space-y-4">{sections}</div>;
}
