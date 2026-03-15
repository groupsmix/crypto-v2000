export const siteConfig = {
  name: "CryptoCompare AI",
  description:
    "Compare crypto exchanges side-by-side. Find the best fees, features, and security for your trading needs.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    twitter: "#",
    github: "#",
    discord: "#",
    telegram: "#",
  },
  nav: [
    { title: "Home", href: "/" },
    { title: "Compare", href: "/compare" },
    { title: "Exchanges", href: "/exchanges" },
    { title: "Prices", href: "/prices" },
    { title: "Offers", href: "/offers" },
    { title: "Blog", href: "/blog" },
    { title: "Tools", href: "/tools" },
    { title: "Learn", href: "/learn" },
  ],
  footerNav: {
    legal: [
      { title: "About", href: "/about" },
      { title: "Privacy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
    ],
    quickLinks: [
      { title: "Compare", href: "/compare" },
      { title: "Blog", href: "/blog" },
      { title: "Tools", href: "/tools" },
      { title: "Learn", href: "/learn" },
    ],
  },
} as const;
