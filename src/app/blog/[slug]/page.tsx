import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Tag, Clock } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ArticleBody, extractHeadings } from "@/components/blog/article-body";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { RelatedPosts } from "@/components/blog/related-posts";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/data/blog-posts";
import { siteConfig } from "@/config/site";

interface BlogPostPageProps {
  params: { slug: string };
}

// ─── SEO Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription ||
    post.content.replace(/[#*\[\]|`-]/g, "").trim().slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [siteConfig.name],
      tags: post.tags,
      ...(post.featuredImage ? { images: [post.featuredImage] } : {}),
    },
  };
}

// ─── Article Schema Markup ──────────────────────────────────────────────────────

function ArticleSchema({
  post,
}: {
  post: {
    title: string;
    content: string;
    metaDescription: string | null;
    featuredImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    category: string | null;
    tags: string[];
  };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.metaDescription ||
      post.content.replace(/[#*\[\]|`-]/g, "").trim().slice(0, 160),
    ...(post.featuredImage ? { image: post.featuredImage } : {}),
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.createdAt.toISOString(),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog`,
    },
    keywords: post.tags.join(", "),
    ...(post.category
      ? { articleSection: post.category }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(
    post.slug,
    post.category,
    post.tags,
    3
  );

  const headings = extractHeadings(post.content);
  const readTime = estimateReadTime(post.content);

  return (
    <>
      <ArticleSchema post={post} />

      <Section>
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Blog
          </Link>

          {/* Article header */}
          <header className="space-y-4">
            {/* Category + Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <Link
                  href={`/blog?category=${post.category}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary capitalize hover:underline"
                >
                  <Tag className="h-3 w-3" />
                  {post.category}
                </Link>
              )}
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </span>
            </div>
          </header>

          {/* Featured image */}
          {post.featuredImage && (
            <div className="rounded-xl overflow-hidden border border-border/60">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Main content + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article body */}
            <article className="lg:col-span-3">
              <ArticleBody content={post.content} />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Table of Contents */}
              <TableOfContents items={headings} />

              {/* Quick links to exchange pages */}
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold">Popular Exchanges</h3>
                <ul className="space-y-2">
                  {[
                    { name: "Binance", slug: "binance" },
                    { name: "Coinbase", slug: "coinbase" },
                    { name: "Kraken", slug: "kraken" },
                    { name: "KuCoin", slug: "kucoin" },
                    { name: "Bybit", slug: "bybit" },
                  ].map((ex) => (
                    <li key={ex.slug}>
                      <Link
                        href={`/exchanges/${ex.slug}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold">
                          {ex.name.charAt(0)}
                        </span>
                        {ex.name} Review
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/compare"
                  className="block text-xs text-primary hover:underline"
                >
                  Compare all exchanges &rarr;
                </Link>
              </div>
            </aside>
          </div>

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} />
        </div>
      </Section>
    </>
  );
}
