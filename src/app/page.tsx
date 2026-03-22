import { Metadata } from "next";
import { getTopExchanges, getFeaturedExchanges } from "@/lib/data/exchanges";
import { getLatestBlogPosts } from "@/lib/data/blog-posts";
import { siteConfig } from "@/config/site";
import { HeroSection } from "@/components/home/hero-section";
import { TrendingCoins } from "@/components/home/trending-coins";
import { PopularComparisons } from "@/components/home/popular-comparisons";
import { TopExchangesTable } from "@/components/home/top-exchanges-table";
import { FeaturedExchanges } from "@/components/home/featured-exchanges";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { ToolsStrip } from "@/components/home/tools-strip";
import { NewsletterCta } from "@/components/home/newsletter-cta";

export const metadata: Metadata = {
  title: "CryptoCompare — Compare Crypto Exchanges & Track Prices",
  description:
    "Compare fees, features, and security across top crypto exchanges. Live prices, side-by-side comparisons, expert reviews, and exclusive signup bonuses.",
  alternates: {
    canonical: siteConfig.url,
  },
};

export default async function HomePage() {
  const [topExchanges, featuredExchanges, blogPosts] = await Promise.all([
    getTopExchanges(),
    getFeaturedExchanges(),
    getLatestBlogPosts(5),
  ]);

  return (
    <>
      <HeroSection />
      <TrendingCoins />
      <PopularComparisons />
      <TopExchangesTable exchanges={topExchanges} />
      <FeaturedExchanges exchanges={featuredExchanges} />
      <BlogTeaser posts={blogPosts} />
      <ToolsStrip />
      <NewsletterCta />
    </>
  );
}
