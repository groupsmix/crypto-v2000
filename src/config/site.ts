export const siteConfig = {
  name: "CryptoCompare AI",
  description:
    "Compare crypto exchanges side-by-side. Find the best fees, features, and security for your trading needs.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    twitter: "#",
    github: "#",
  },
  nav: [
    { title: "Home", href: "/" },
    { title: "Compare", href: "/compare" },
    { title: "Exchanges", href: "/exchanges" },
    { title: "Blog", href: "/blog" },
  ],
} as const;
