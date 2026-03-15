import Link from "next/link";
import { Calculator, ArrowLeftRight, Percent, BarChart3, Wallet, Clock } from "lucide-react";
import { Section } from "@/components/ui/section";

const tools = [
  {
    icon: Calculator,
    title: "Profit Calculator",
    description: "Calculate your potential crypto trading profits",
    href: "/tools#calculator",
  },
  {
    icon: ArrowLeftRight,
    title: "Currency Converter",
    description: "Convert between crypto and fiat currencies",
    href: "/tools#converter",
  },
  {
    icon: Percent,
    title: "Fee Comparison",
    description: "Compare trading fees across exchanges",
    href: "/compare",
  },
  {
    icon: BarChart3,
    title: "Market Overview",
    description: "Real-time market data and charts",
    href: "/prices",
  },
  {
    icon: Wallet,
    title: "Portfolio Tracker",
    description: "Track your crypto portfolio performance",
    href: "/tools#portfolio",
  },
  {
    icon: Clock,
    title: "Price Alerts",
    description: "Get notified when prices hit your targets",
    href: "/tools#alerts",
  },
];

export function ToolsStrip() {
  return (
    <Section className="bg-muted/30 border-y border-border/40">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Crypto Tools
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Free tools to help you trade smarter and manage your portfolio.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-center transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <tool.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{tool.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground hidden sm:block">
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
