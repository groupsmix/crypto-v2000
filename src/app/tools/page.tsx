import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import {
  Calculator,
  DollarSign,
  Calendar,
  ArrowDownUp,
  Wallet,
  Wrench,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Crypto Tools — Calculators, Converters & Portfolio Tracker",
  description:
    "Free crypto trading tools: fee calculator, profit/loss calculator, DCA calculator, currency converter, and portfolio tracker. All with live market data.",
};

const tools = [
  {
    href: "/tools/fee-calculator",
    icon: Calculator,
    title: "Fee Calculator",
    description:
      "Calculate exact trading fees for spot and futures across Binance, Coinbase, Kraken, Bybit, and KuCoin.",
  },
  {
    href: "/tools/profit-calculator",
    icon: DollarSign,
    title: "Profit / Loss Calculator",
    description:
      "Enter buy price, sell price, quantity, and fees to see your net profit or loss with full breakdown.",
  },
  {
    href: "/tools/dca-calculator",
    icon: Calendar,
    title: "DCA Calculator",
    description:
      "Simulate dollar-cost averaging strategies. See how regular investments accumulate over time for any coin.",
  },
  {
    href: "/tools/converter",
    icon: ArrowDownUp,
    title: "Crypto Converter",
    description:
      "Convert between cryptocurrencies and fiat currencies with live rates from CoinGecko.",
  },
  {
    href: "/tools/portfolio-tracker",
    icon: Wallet,
    title: "Portfolio Tracker",
    description:
      "Track your crypto holdings with live prices, pie chart distribution, and 24h change. Saved locally.",
  },
];

export default function ToolsPage() {
  return (
    <Section>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Crypto Tools
              </h1>
              <p className="text-sm text-muted-foreground">
                Free calculators and trackers for smarter crypto trading
              </p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl border border-border/60 bg-card p-6 space-y-3 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <tool.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold group-hover:text-primary transition-colors flex items-center gap-1">
                  {tool.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
