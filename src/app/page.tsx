import { getTopExchanges, getFeaturedExchanges } from "@/lib/data/exchanges";
import { getLatestBlogPosts } from "@/lib/data/blog-posts";
import { AnnouncementBar } from "@/components/home/announcement-bar";
import { HeroSection } from "@/components/home/hero-section";
import { CryptoTicker } from "@/components/home/crypto-ticker";
import { TopExchangesTable } from "@/components/home/top-exchanges-table";
import { FeaturedExchanges } from "@/components/home/featured-exchanges";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { ToolsStrip } from "@/components/home/tools-strip";
import { NewsletterCta } from "@/components/home/newsletter-cta";

export default async function HomePage() {
  const [topExchanges, featuredExchanges, blogPosts] = await Promise.all([
    getTopExchanges(),
    getFeaturedExchanges(),
    getLatestBlogPosts(3),
  ]);

  return (
    <>
      <AnnouncementBar />
      <HeroSection />
      <CryptoTicker />
      <TopExchangesTable exchanges={topExchanges} />
      <FeaturedExchanges exchanges={featuredExchanges} />
      <BlogTeaser posts={blogPosts} />
      <ToolsStrip />
      <NewsletterCta />
    </>
  );
}
