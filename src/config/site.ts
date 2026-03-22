export const siteConfig = {
  name: "CryptoCompare AI",
  description:
    "Compare crypto exchanges side-by-side. Find the best fees, features, and security for your trading needs.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    twitter: "",
    github: "",
    discord: "",
    telegram: "",
  },
  nav: [
    { title: "Home", href: "/" },
    { title: "Prices", href: "/prices" },
    { title: "Comparisons", href: "/compare" },
    { title: "Blog", href: "/blog" },
    { title: "Tools", href: "/tools" },
  ],
  footerNav: {
    quickLinks: [
      { title: "Live Prices", href: "/prices" },
      { title: "Compare Exchanges", href: "/compare" },
      { title: "Blog", href: "/blog" },
      { title: "Tools", href: "/tools" },
    ],
    comparisons: [
      { title: "Binance vs Coinbase", href: "/vs/binance-vs-coinbase" },
      { title: "Binance vs Bybit", href: "/vs/binance-vs-bybit" },
      { title: "Kraken vs Coinbase", href: "/vs/kraken-vs-coinbase" },
      { title: "Binance vs Kraken", href: "/vs/binance-vs-kraken" },
    ],
    exchanges: [
      { title: "Binance", href: "/exchanges/binance" },
      { title: "Coinbase", href: "/exchanges/coinbase" },
      { title: "Kraken", href: "/exchanges/kraken" },
      { title: "Bybit", href: "/exchanges/bybit" },
      { title: "KuCoin", href: "/exchanges/kucoin" },
    ],
    legal: [
      { title: "About", href: "/about" },
      { title: "Privacy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
    ],
  },
} as const;
