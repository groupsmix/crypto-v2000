"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type ExchangeDetail } from "@/lib/data/exchanges";
import {
  Shield,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TABS = ["Overview", "Fees", "Security", "Pros & Cons", "FAQ"] as const;
type TabId = (typeof TABS)[number];

// ─── Generated content helpers ──────────────────────────────────────────────────

function generatePros(exchange: ExchangeDetail): string[] {
  const pros: string[] = [];
  if (exchange.score >= 9) pros.push("Industry-leading overall rating");
  if (exchange.fees && exchange.fees.spotTakerFee <= 0.1)
    pros.push("Very competitive spot trading fees");
  if (exchange.supportedCoinsCount >= 400)
    pros.push(`Wide selection of ${exchange.supportedCoinsCount}+ supported coins`);
  if (exchange.futuresAvailable)
    pros.push("Supports futures and derivatives trading");
  if (exchange.offers.length > 0)
    pros.push("Attractive sign-up bonus for new users");
  if (exchange.foundedYear && exchange.foundedYear <= 2015)
    pros.push("Well-established with a long operating history");
  if (!exchange.kycRequired)
    pros.push("Trading available without mandatory KYC verification");
  if (pros.length < 3) pros.push("User-friendly trading interface");
  return pros;
}

function generateCons(exchange: ExchangeDetail): string[] {
  const cons: string[] = [];
  if (exchange.fees && exchange.fees.spotTakerFee > 0.2)
    cons.push("Higher-than-average spot trading fees");
  if (!exchange.futuresAvailable)
    cons.push("No futures or derivatives trading available");
  if (exchange.kycRequired)
    cons.push("Mandatory KYC verification required for all users");
  if (exchange.supportedCoinsCount < 300)
    cons.push("Relatively limited coin selection compared to competitors");
  if (cons.length < 2)
    cons.push("Customer support response times can vary");
  if (cons.length < 3)
    cons.push("Advanced features may have a learning curve for beginners");
  return cons;
}

function generateFAQ(exchange: ExchangeDetail): { question: string; answer: string }[] {
  return [
    {
      question: `Is ${exchange.name} safe to use?`,
      answer: `${exchange.name} employs industry-standard security measures including two-factor authentication (2FA), cold wallet storage for the majority of funds, and regular security audits. ${exchange.foundedYear ? `Operating since ${exchange.foundedYear}, ` : ""}the exchange has built a strong reputation for security in the crypto industry.`,
    },
    {
      question: `What are ${exchange.name}'s trading fees?`,
      answer: `${exchange.name} charges ${exchange.fees ? `${exchange.fees.spotMakerFee}% maker and ${exchange.fees.spotTakerFee}% taker fees for spot trading` : "competitive fees for spot trading"}. ${exchange.fees?.futuresMakerFee != null ? `Futures trading fees are ${exchange.fees.futuresMakerFee}% maker and ${exchange.fees.futuresTakerFee}% taker.` : ""} Fee discounts may be available through volume tiers or platform tokens.`,
    },
    {
      question: `Does ${exchange.name} require KYC verification?`,
      answer: exchange.kycRequired
        ? `Yes, ${exchange.name} requires KYC (Know Your Customer) verification for all users. You will need to provide identity documents to start trading. This is in line with regulatory requirements.`
        : `${exchange.name} allows basic trading without KYC verification. However, some features and higher withdrawal limits may require identity verification.`,
    },
    {
      question: `How many cryptocurrencies does ${exchange.name} support?`,
      answer: `${exchange.name} currently supports ${exchange.supportedCoinsCount}+ cryptocurrencies for trading, including major coins like Bitcoin, Ethereum, and a wide range of altcoins.`,
    },
    {
      question: `Does ${exchange.name} offer futures trading?`,
      answer: exchange.futuresAvailable
        ? `Yes, ${exchange.name} offers futures and derivatives trading with competitive fees${exchange.fees?.futuresMakerFee != null ? ` starting at ${exchange.fees.futuresMakerFee}% maker / ${exchange.fees.futuresTakerFee}% taker` : ""}. Perpetual contracts and various leverage options are available.`
        : `No, ${exchange.name} does not currently offer futures or derivatives trading. The platform focuses on spot trading and other services.`,
    },
    {
      question: `Does ${exchange.name} have a mobile app?`,
      answer: `Yes, ${exchange.name} offers mobile apps for both iOS and Android, providing full trading functionality, portfolio tracking, and account management on the go.`,
    },
    {
      question: `Where is ${exchange.name} headquartered?`,
      answer: exchange.headquarters
        ? `${exchange.name} is headquartered in ${exchange.headquarters}. The exchange operates globally and serves users in most countries, though availability may vary by region.`
        : `${exchange.name} operates globally and serves users in most countries, though availability may vary by region.`,
    },
    {
      question: `How do I withdraw funds from ${exchange.name}?`,
      answer: `You can withdraw funds from ${exchange.name} by navigating to the withdrawal section, selecting your asset, entering the destination address, and confirming the transaction. ${exchange.fees?.withdrawalFee != null ? `Withdrawal fees vary by asset; for example, BTC withdrawals cost approximately ${exchange.fees.withdrawalFee} BTC.` : "Withdrawal fees vary by asset."}`,
    },
  ];
}

// ─── Security content ───────────────────────────────────────────────────────────

function SecurityContent({ exchange }: { exchange: ExchangeDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Two-Factor Authentication",
            desc: "2FA via authenticator app and SMS supported",
            available: true,
          },
          {
            title: "Cold Storage",
            desc: "Majority of funds stored in offline cold wallets",
            available: true,
          },
          {
            title: "Insurance Fund",
            desc: "Platform maintains a security insurance fund",
            available: exchange.score >= 8.5,
          },
          {
            title: "Proof of Reserves",
            desc: "Regular proof-of-reserves audits published",
            available: exchange.score >= 8.8,
          },
          {
            title: "Bug Bounty Program",
            desc: "Active bug bounty program for security researchers",
            available: exchange.score >= 8.5,
          },
          {
            title: "Regulatory Compliance",
            desc: "Licensed and regulated in operating jurisdictions",
            available: exchange.kycRequired,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4"
          >
            <Shield
              className={cn(
                "h-5 w-5 mt-0.5 shrink-0",
                item.available ? "text-green-500" : "text-muted-foreground"
              )}
            />
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground italic">
        Security information is based on publicly available data and may not
        reflect the most recent changes. Always verify directly with the
        exchange.
      </p>
    </div>
  );
}

// ─── FAQ Accordion ──────────────────────────────────────────────────────────────

function FAQAccordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border/60 rounded-xl border border-border/60">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              {item.question}
            </span>
            {openIndex === i ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed pl-10">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Tabs Component ────────────────────────────────────────────────────────

export function DetailTabs({ exchange }: { exchange: ExchangeDetail }) {
  const [activeTab, setActiveTab] = useState<TabId>("Overview");

  const pros = generatePros(exchange);
  const cons = generateCons(exchange);
  const faqItems = generateFAQ(exchange);

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "Overview" && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h3 className="text-lg font-semibold mb-3">
              {exchange.name} Review
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {exchange.description}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">KYC Required</p>
                <p className="text-sm font-medium">
                  {exchange.kycRequired ? "Yes" : "No"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Spot Trading</p>
                <p className="text-sm font-medium">
                  {exchange.spotAvailable ? "Available" : "Not Available"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Futures Trading
                </p>
                <p className="text-sm font-medium">
                  {exchange.futuresAvailable ? "Available" : "Not Available"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Headquarters</p>
                <p className="text-sm font-medium">
                  {exchange.headquarters ?? "Undisclosed"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Fees" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{exchange.name} Fee Schedule</h3>
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/50">
                    <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                      Maker
                    </th>
                    <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                      Taker
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">Spot Trading</td>
                    <td className="px-4 py-3">
                      {exchange.fees ? `${exchange.fees.spotMakerFee}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {exchange.fees ? `${exchange.fees.spotTakerFee}%` : "—"}
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">Futures Trading</td>
                    <td className="px-4 py-3">
                      {exchange.fees?.futuresMakerFee != null
                        ? `${exchange.fees.futuresMakerFee}%`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {exchange.fees?.futuresTakerFee != null
                        ? `${exchange.fees.futuresTakerFee}%`
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {exchange.fees?.withdrawalFee != null && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  BTC Withdrawal Fee
                </p>
                <p className="text-sm font-medium">
                  {exchange.fees.withdrawalFee} BTC
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground italic">
              Fees shown are base rates. Volume-based discounts and token
              holdings may reduce fees further.
            </p>
          </div>
        )}

        {activeTab === "Security" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {exchange.name} Security Features
            </h3>
            <SecurityContent exchange={exchange} />
          </div>
        )}

        {activeTab === "Pros & Cons" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {exchange.name} Pros & Cons
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <h4 className="text-sm font-semibold text-green-600">Pros</h4>
                </div>
                <ul className="space-y-2">
                  {pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  <h4 className="text-sm font-semibold text-red-600">Cons</h4>
                </div>
                <ul className="space-y-2">
                  {cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "FAQ" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Frequently Asked Questions about {exchange.name}
            </h3>
            <FAQAccordion items={faqItems} />
          </div>
        )}
      </div>
    </div>
  );
}
