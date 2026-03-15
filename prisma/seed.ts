import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Exchanges ──────────────────────────────────────────────────────────────

  const binance = await prisma.exchange.create({
    data: {
      slug: "binance",
      name: "Binance",
      logoUrl: "/images/exchanges/binance.png",
      affiliateUrl: "https://www.binance.com/en/register?ref=EXAMPLE1",
      score: 9.5,
      foundedYear: 2017,
      headquarters: "George Town, Cayman Islands",
      description:
        "Binance is the world's largest cryptocurrency exchange by trading volume, offering a wide range of crypto assets, spot and futures trading, staking, and more.",
      supportedCoinsCount: 400,
      kycRequired: true,
      spotAvailable: true,
      futuresAvailable: true,
      fees: {
        create: {
          spotMakerFee: 0.1,
          spotTakerFee: 0.1,
          futuresMakerFee: 0.02,
          futuresTakerFee: 0.04,
          withdrawalFee: 0.0005,
        },
      },
      offers: {
        create: {
          offerText: "Get 20% off trading fees with our referral link",
          bonusAmount: 100,
          expiresAt: new Date("2026-12-31"),
          isActive: true,
        },
      },
    },
  });

  const coinbase = await prisma.exchange.create({
    data: {
      slug: "coinbase",
      name: "Coinbase",
      logoUrl: "/images/exchanges/coinbase.png",
      affiliateUrl: "https://www.coinbase.com/join/EXAMPLE2",
      score: 9.0,
      foundedYear: 2012,
      headquarters: "San Francisco, USA",
      description:
        "Coinbase is the most trusted US-based cryptocurrency exchange, known for its user-friendly interface, regulatory compliance, and strong security measures.",
      supportedCoinsCount: 250,
      kycRequired: true,
      spotAvailable: true,
      futuresAvailable: false,
      fees: {
        create: {
          spotMakerFee: 0.4,
          spotTakerFee: 0.6,
          futuresMakerFee: null,
          futuresTakerFee: null,
          withdrawalFee: 0.0,
        },
      },
      offers: {
        create: {
          offerText: "Earn $10 in Bitcoin when you sign up and trade $100",
          bonusAmount: 10,
          expiresAt: new Date("2026-06-30"),
          isActive: true,
        },
      },
    },
  });

  const kraken = await prisma.exchange.create({
    data: {
      slug: "kraken",
      name: "Kraken",
      logoUrl: "/images/exchanges/kraken.png",
      affiliateUrl: "https://www.kraken.com/sign-up?ref=EXAMPLE3",
      score: 8.8,
      foundedYear: 2011,
      headquarters: "San Francisco, USA",
      description:
        "Kraken is a veteran exchange known for its robust security, extensive fiat currency support, and advanced trading features including margin and futures trading.",
      supportedCoinsCount: 200,
      kycRequired: true,
      spotAvailable: true,
      futuresAvailable: true,
      fees: {
        create: {
          spotMakerFee: 0.16,
          spotTakerFee: 0.26,
          futuresMakerFee: 0.02,
          futuresTakerFee: 0.05,
          withdrawalFee: 0.00015,
        },
      },
    },
  });

  const kucoin = await prisma.exchange.create({
    data: {
      slug: "kucoin",
      name: "KuCoin",
      logoUrl: "/images/exchanges/kucoin.png",
      affiliateUrl: "https://www.kucoin.com/r/EXAMPLE4",
      score: 8.5,
      foundedYear: 2017,
      headquarters: "Seychelles",
      description:
        "KuCoin is a global exchange known for its extensive altcoin selection, competitive fees, and innovative features like trading bots and lending services.",
      supportedCoinsCount: 700,
      kycRequired: false,
      spotAvailable: true,
      futuresAvailable: true,
      fees: {
        create: {
          spotMakerFee: 0.1,
          spotTakerFee: 0.1,
          futuresMakerFee: 0.02,
          futuresTakerFee: 0.06,
          withdrawalFee: 0.0004,
        },
      },
      offers: {
        create: {
          offerText: "Up to $500 sign-up bonus for new users",
          bonusAmount: 500,
          expiresAt: new Date("2026-09-30"),
          isActive: true,
        },
      },
    },
  });

  const bybit = await prisma.exchange.create({
    data: {
      slug: "bybit",
      name: "Bybit",
      logoUrl: "/images/exchanges/bybit.png",
      affiliateUrl: "https://www.bybit.com/register?ref=EXAMPLE5",
      score: 8.7,
      foundedYear: 2018,
      headquarters: "Dubai, UAE",
      description:
        "Bybit is a fast-growing derivatives exchange offering perpetual contracts, spot trading, and NFT marketplace, popular among advanced traders for its deep liquidity.",
      supportedCoinsCount: 500,
      kycRequired: true,
      spotAvailable: true,
      futuresAvailable: true,
      fees: {
        create: {
          spotMakerFee: 0.1,
          spotTakerFee: 0.1,
          futuresMakerFee: 0.01,
          futuresTakerFee: 0.06,
          withdrawalFee: 0.0002,
        },
      },
      offers: {
        create: {
          offerText: "Deposit bonus up to $30,000 for new users",
          bonusAmount: 30000,
          expiresAt: new Date("2026-12-31"),
          isActive: true,
        },
      },
    },
  });

  console.log(
    `Created ${5} exchanges: ${[binance, coinbase, kraken, kucoin, bybit].map((e) => e.name).join(", ")}`
  );

  // ─── Blog Posts ─────────────────────────────────────────────────────────────

  const blogPosts = await Promise.all([
    prisma.blogPost.create({
      data: {
        slug: "best-crypto-exchanges-2026",
        title: "Best Crypto Exchanges in 2026: Complete Comparison Guide",
        content: `Choosing the right cryptocurrency exchange is one of the most important decisions for any crypto trader or investor. In this comprehensive guide, we compare the top exchanges across fees, security, supported coins, and user experience.

## What to Look for in an Exchange

When evaluating exchanges, consider these key factors:
- **Trading Fees**: Lower fees mean more of your profits stay in your pocket
- **Security**: Look for exchanges with strong track records and insurance funds
- **Coin Selection**: More coins means more trading opportunities
- **User Experience**: A clean, intuitive interface makes trading easier

## Our Top Picks

### 1. Binance
Binance continues to dominate with the lowest fees and largest selection of trading pairs. Their BNB token provides additional fee discounts.

### 2. Coinbase
For US-based traders who prioritize regulatory compliance and ease of use, Coinbase remains the gold standard.

### 3. Kraken
Kraken offers an excellent balance of security, features, and competitive fees, making it ideal for intermediate traders.

### 4. KuCoin
With over 700 supported coins, KuCoin is the go-to exchange for altcoin traders looking for hidden gems.

### 5. Bybit
Bybit has rapidly grown into a top derivatives exchange with deep liquidity and innovative trading features.`,
        metaTitle: "Best Crypto Exchanges 2026 - Compare Top Platforms",
        metaDescription:
          "Compare the best cryptocurrency exchanges in 2026. Detailed analysis of fees, security, coins, and features for Binance, Coinbase, Kraken, KuCoin, and Bybit.",
        category: "guides",
        tags: ["exchanges", "comparison", "guide", "2026"],
        publishedAt: new Date("2026-01-15"),
      },
    }),
    prisma.blogPost.create({
      data: {
        slug: "crypto-trading-fees-explained",
        title: "Crypto Trading Fees Explained: Maker vs Taker and How to Save",
        content: `Understanding trading fees is crucial for maximizing your returns in cryptocurrency trading. This guide breaks down the different fee structures used by major exchanges.

## Maker vs Taker Fees

**Maker fees** are charged when you add liquidity to the order book by placing a limit order that doesn't immediately match.

**Taker fees** are charged when you remove liquidity by placing an order that matches immediately (market orders or matching limit orders).

Most exchanges charge lower maker fees to incentivize liquidity provision.

## Fee Comparison Across Exchanges

| Exchange | Spot Maker | Spot Taker |
|----------|-----------|-----------|
| Binance  | 0.10%     | 0.10%     |
| Coinbase | 0.40%     | 0.60%     |
| Kraken   | 0.16%     | 0.26%     |
| KuCoin   | 0.10%     | 0.10%     |
| Bybit    | 0.10%     | 0.10%     |

## How to Reduce Fees

1. Use exchange native tokens (e.g., BNB on Binance)
2. Increase your trading volume for VIP tier discounts
3. Use limit orders instead of market orders
4. Take advantage of referral fee discounts`,
        metaTitle: "Crypto Trading Fees Explained - Maker vs Taker Guide",
        metaDescription:
          "Learn about crypto trading fees, maker vs taker models, and how to minimize costs across Binance, Coinbase, Kraken, and other top exchanges.",
        category: "education",
        tags: ["fees", "trading", "education", "maker-taker"],
        publishedAt: new Date("2026-02-10"),
      },
    }),
    prisma.blogPost.create({
      data: {
        slug: "how-to-choose-a-crypto-exchange",
        title: "How to Choose a Crypto Exchange: A Beginner's Checklist",
        content: `If you're new to cryptocurrency, choosing your first exchange can feel overwhelming. This beginner-friendly checklist will help you find the perfect platform.

## Security Checklist

- Does the exchange offer two-factor authentication (2FA)?
- Has the exchange been hacked before? How did they handle it?
- Does the exchange have an insurance fund or proof of reserves?
- Are the majority of funds stored in cold wallets?

## KYC and Regulations

KYC (Know Your Customer) requirements vary by exchange:
- **Required**: Binance, Coinbase, Kraken, Bybit
- **Optional for basic features**: KuCoin

For US-based users, regulatory compliance is especially important. Coinbase and Kraken are fully licensed in the United States.

## Getting Started

1. Research and compare exchanges using our comparison tool
2. Start with a well-known, regulated exchange
3. Enable all security features before depositing funds
4. Start with a small amount to test the platform
5. Gradually explore advanced features as you gain confidence

Remember: never invest more than you can afford to lose, and always do your own research.`,
        metaTitle: "How to Choose a Crypto Exchange - Beginner's Guide",
        metaDescription:
          "A complete beginner's guide to choosing the right cryptocurrency exchange. Security checklist, KYC requirements, and step-by-step setup instructions.",
        category: "guides",
        tags: ["beginners", "guide", "security", "kyc"],
        publishedAt: new Date("2026-03-01"),
      },
    }),
  ]);

  console.log(
    `Created ${blogPosts.length} blog posts: ${blogPosts.map((p) => p.slug).join(", ")}`
  );

  // ─── Automation Job (sample) ────────────────────────────────────────────────

  await prisma.automationJob.create({
    data: {
      jobType: "exchange_data_sync",
      status: "completed",
      startedAt: new Date("2026-03-15T10:00:00Z"),
      completedAt: new Date("2026-03-15T10:05:00Z"),
      resultSummary: "Synced data for 5 exchanges successfully",
    },
  });

  console.log("Created 1 sample automation job");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
