/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Exclude heavy packages not needed in the Cloudflare Worker bundle
    outputFileTracingExcludes: {
      "*": [
        "node_modules/@anthropic-ai/**",
        "node_modules/@swc/**",
        "node_modules/esbuild/**",
        "node_modules/prisma/**",
        "node_modules/ts-node/**",
        "node_modules/typescript/**",
        "node_modules/eslint/**",
        "node_modules/eslint-config-next/**",
        "node_modules/@next/swc-*/**",
        "node_modules/sharp/**",
      ],
    },
    serverMinification: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/coins/images/**",
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
