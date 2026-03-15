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
Bybit has rapidly grown into a top derivatives exchange with deep liquidity and innovative trading features.

## How We Rate Exchanges

Our ratings are based on a weighted scoring system that considers:
1. **Fee Structure** (25%) - Spot, futures, and withdrawal fees
2. **Security Track Record** (25%) - History, insurance, and cold storage
3. **Asset Selection** (20%) - Number and quality of supported coins
4. **User Experience** (15%) - Interface, mobile app, and onboarding
5. **Regulatory Compliance** (15%) - Licensing and KYC standards

## Conclusion

There is no single "best" exchange for everyone. Your ideal choice depends on your trading style, location, and priorities. Use our comparison tool to see how these exchanges stack up side by side.`,
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

### Use Exchange Tokens
Many exchanges offer their own native tokens that can be used to pay fees at a discount. For example, using BNB on Binance can save you up to 25% on trading fees.

### Volume-Based Discounts
Most exchanges offer tiered fee structures where higher trading volumes unlock lower fee rates. If you trade frequently, look into VIP or loyalty programs.

### Limit Orders Over Market Orders
Since maker fees are typically lower than taker fees, using limit orders instead of market orders can save you money on every trade.

### Referral Programs
Sign up through referral links to get permanent fee discounts. Many exchanges offer 10-20% off fees for referred users.

## Hidden Fees to Watch For

Beyond trading fees, be aware of:
- **Withdrawal fees**: Can vary significantly between exchanges and cryptocurrencies
- **Deposit fees**: Some exchanges charge for fiat deposits via certain methods
- **Conversion spreads**: The difference between buy and sell prices on simple buy/sell interfaces
- **Inactivity fees**: Some exchanges charge if your account is dormant

## Conclusion

Trading fees might seem small on individual trades, but they add up significantly over time. By understanding fee structures and using the strategies above, you can save hundreds or even thousands of dollars annually.`,
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

## Supported Payment Methods

Before signing up, check that the exchange supports your preferred payment methods:
- **Bank Transfer**: Usually the cheapest option, available on most exchanges
- **Credit/Debit Card**: Convenient but often comes with higher fees (2-5%)
- **PayPal**: Limited availability, mainly Coinbase
- **Crypto Deposits**: Free on most exchanges if you already hold crypto

## Mobile Experience

If you plan to trade on the go, test the exchange's mobile app. Look for:
- Intuitive interface and easy navigation
- Full feature parity with the desktop version
- Biometric login (fingerprint or face ID)
- Push notifications for price alerts

## Customer Support

When things go wrong, you want responsive support. Check for:
- Live chat availability and response times
- Email support quality
- Comprehensive help center or knowledge base
- Social media presence and community forums

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
    prisma.blogPost.create({
      data: {
        slug: "binance-vs-coinbase-2026",
        title: "Binance vs Coinbase 2026: Which Exchange Is Better?",
        content: `Binance and Coinbase are the two most popular cryptocurrency exchanges in the world, but they serve very different audiences. This head-to-head comparison will help you decide which one is right for you.

## Overview

### Binance
- Founded: 2017
- Headquarters: Cayman Islands
- Supported Coins: 400+
- Best For: Experienced traders looking for low fees and advanced features

### Coinbase
- Founded: 2012
- Headquarters: San Francisco, USA
- Supported Coins: 250+
- Best For: Beginners and US-based users prioritizing compliance

## Fee Comparison

### Trading Fees
Binance offers significantly lower trading fees than Coinbase:
- **Binance**: 0.10% maker / 0.10% taker (with up to 25% discount using BNB)
- **Coinbase**: 0.40% maker / 0.60% taker (Advanced Trade)

### Withdrawal Fees
- **Binance**: Variable by asset (e.g., 0.0005 BTC)
- **Coinbase**: Network fees only for crypto, varies for fiat

## Security Comparison

Both exchanges have strong security measures, but with different approaches:

### Binance
- SAFU insurance fund ($1B+)
- Proof of reserves published regularly
- Advanced anti-phishing measures
- Has experienced security incidents but handled them well

### Coinbase
- Publicly traded company (NASDAQ: COIN)
- 98% of assets in cold storage
- FDIC insurance on USD balances up to $250K
- SOC 2 Type II certified
- No major security breaches

## Supported Cryptocurrencies

Binance supports over 400 cryptocurrencies while Coinbase supports around 250. Binance tends to list new tokens faster, making it better for early adopters. Coinbase is more selective, which some users see as a form of quality control.

## User Experience

### Binance
Binance offers a more complex interface with advanced charting tools, multiple order types, and a wealth of features. This can be overwhelming for beginners but is appreciated by experienced traders.

### Coinbase
Coinbase is known for its clean, simple interface that makes buying crypto as easy as online shopping. The Coinbase Advanced Trade platform offers more features for experienced users.

## Verdict

Choose **Binance** if you prioritize low fees, advanced trading features, and a wide selection of altcoins.

Choose **Coinbase** if you value ease of use, regulatory compliance, and are based in the US.

Both exchanges are excellent choices, and many serious traders use both for different purposes.`,
        metaTitle: "Binance vs Coinbase 2026 - Complete Comparison",
        metaDescription:
          "Binance vs Coinbase detailed comparison for 2026. Compare fees, security, supported coins, user experience, and more to find your ideal crypto exchange.",
        category: "comparison",
        tags: ["binance", "coinbase", "comparison", "exchanges"],
        publishedAt: new Date("2026-02-20"),
      },
    }),
    prisma.blogPost.create({
      data: {
        slug: "crypto-security-best-practices",
        title: "Crypto Security Best Practices: Protect Your Digital Assets",
        content: `Security should be your top priority when dealing with cryptocurrency. This comprehensive guide covers everything you need to know to protect your digital assets from theft and loss.

## Exchange Security

### Choosing a Secure Exchange
- Look for exchanges with a clean security track record
- Check for proof of reserves and insurance funds
- Verify the exchange is regulated in your jurisdiction
- Read reviews and check community sentiment

### Account Security
- Enable two-factor authentication (2FA) immediately
- Use an authenticator app, never SMS-based 2FA
- Create a unique, strong password for each exchange
- Set up anti-phishing codes when available
- Enable withdrawal address whitelisting

## Wallet Security

### Types of Wallets
1. **Hardware wallets** (e.g., Ledger, Trezor) - Most secure for long-term storage
2. **Software wallets** (e.g., MetaMask, Trust Wallet) - Convenient for regular use
3. **Paper wallets** - Offline but fragile and easy to lose
4. **Exchange wallets** - Convenient but you don't control the keys

### The Golden Rule
"Not your keys, not your crypto." For significant holdings, use a hardware wallet where you control the private keys.

## Common Scams to Avoid

### Phishing Attacks
- Always verify URLs before entering credentials
- Bookmark exchange websites and use bookmarks to access them
- Never click links in emails claiming to be from exchanges
- Check for SSL certificates and correct domain names

### Social Engineering
- No legitimate exchange will ever ask for your password or 2FA codes
- Be wary of unsolicited messages on social media or messaging apps
- Never share your seed phrase or private keys with anyone

### Rug Pulls and Fake Projects
- Research projects thoroughly before investing
- Be skeptical of guaranteed returns or "too good to be true" offers
- Check the team, audits, and community engagement
- Start with small amounts when trying new platforms

## Backup and Recovery

### Seed Phrase Management
- Write down your seed phrase on paper (never digitally)
- Store copies in multiple secure locations
- Consider using metal seed phrase storage for fire/water protection
- Never take photos or screenshots of your seed phrase

### Creating a Recovery Plan
- Document which exchanges and wallets you use
- Store recovery information in a secure location (e.g., safety deposit box)
- Consider sharing recovery instructions with a trusted person for estate planning

## Staying Updated

Security is an ongoing process. Stay informed about:
- New types of scams and attack vectors
- Exchange security updates and announcements
- Best practices in the evolving crypto security landscape

Follow reputable crypto security researchers and news outlets to stay ahead of threats.`,
        metaTitle: "Crypto Security Best Practices - Protect Your Assets",
        metaDescription:
          "Complete guide to cryptocurrency security. Learn how to protect your digital assets with best practices for exchange security, wallet management, and scam prevention.",
        category: "education",
        tags: ["security", "wallets", "education", "beginners"],
        publishedAt: new Date("2026-03-05"),
      },
    }),
    prisma.blogPost.create({
      data: {
        slug: "defi-vs-cefi-exchanges",
        title: "DeFi vs CeFi: Decentralized vs Centralized Exchanges Compared",
        content: `The debate between decentralized finance (DeFi) and centralized finance (CeFi) is one of the most important topics in crypto today. Understanding the differences will help you make informed decisions about where to trade.

## What Is CeFi?

Centralized Finance (CeFi) refers to traditional cryptocurrency exchanges like Binance, Coinbase, and Kraken. These platforms:
- Act as intermediaries between buyers and sellers
- Hold custody of user funds
- Require KYC/AML verification
- Offer customer support and insurance

## What Is DeFi?

Decentralized Finance (DeFi) refers to peer-to-peer financial services built on blockchain technology. Popular DEXes include Uniswap, SushiSwap, and dYdX. These platforms:
- Operate through smart contracts without intermediaries
- Let users maintain custody of their funds
- Require no identity verification
- Are permissionless and open-source

## Key Differences

### Security
**CeFi**: Your funds are held by the exchange. If the exchange is hacked or goes bankrupt, you could lose your assets. However, many CeFi platforms have insurance funds and regulatory protections.

**DeFi**: You maintain custody of your funds via your own wallet. However, smart contract bugs can lead to exploits, and there's no customer support if something goes wrong.

### Fees
**CeFi**: Typically charge 0.1-0.6% per trade, with additional withdrawal fees. Fee structures are transparent and predictable.

**DeFi**: Gas fees on Ethereum can be high during network congestion. Layer 2 solutions and alternative blockchains (Solana, Avalanche) offer lower fees.

### Liquidity
**CeFi**: Generally offers deeper liquidity, especially for large trades. Order book model allows for precise pricing.

**DeFi**: Liquidity depends on liquidity providers. Automated Market Makers (AMMs) can lead to slippage on large orders.

### Available Assets
**CeFi**: Curated selection of vetted assets. New listings go through a review process.

**DeFi**: Anyone can create and list a token, leading to more options but also more scam risk.

## When to Use CeFi

- You're a beginner and want a user-friendly experience
- You need fiat on/off ramps (converting USD/EUR to crypto)
- You want customer support and account recovery
- You're trading large volumes and need deep liquidity
- You need regulatory compliance for tax purposes

## When to Use DeFi

- You prioritize privacy and self-custody
- You want access to new or niche tokens
- You want to participate in yield farming or liquidity provision
- You're comfortable managing your own wallet security
- You want to use advanced financial instruments without KYC

## The Hybrid Approach

Many experienced crypto users use both CeFi and DeFi:
1. Use CeFi for fiat on-ramps and major trades
2. Transfer to DeFi for yield farming and token swaps
3. Store long-term holdings in personal hardware wallets

This approach combines the convenience of CeFi with the flexibility and earning potential of DeFi.

## Conclusion

Neither CeFi nor DeFi is inherently better. The best choice depends on your experience level, priorities, and use case. As the space matures, we're seeing more convergence between the two, with CeFi platforms offering DeFi features and DeFi protocols improving their user experience.`,
        metaTitle: "DeFi vs CeFi Exchanges - Complete Comparison Guide",
        metaDescription:
          "Compare decentralized (DeFi) and centralized (CeFi) exchanges. Understand the trade-offs in security, fees, liquidity, and user experience.",
        category: "education",
        tags: ["defi", "comparison", "education", "exchanges"],
        publishedAt: new Date("2026-03-10"),
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
