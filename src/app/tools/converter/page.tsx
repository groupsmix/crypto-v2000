"use client";

import { useState, useEffect, useCallback } from "react";
import { Section } from "@/components/ui/section";
import {
  ArrowDownUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
};

const FIAT_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

// Approximate fiat rates relative to USD
const FIAT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
};

const FALLBACK_COINS: CoinPrice[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 87432, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3241, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "binancecoin", symbol: "bnb", name: "BNB", current_price: 612, image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  { id: "solana", symbol: "sol", name: "Solana", current_price: 142, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { id: "ripple", symbol: "xrp", name: "XRP", current_price: 0.62, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { id: "cardano", symbol: "ada", name: "Cardano", current_price: 0.45, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin", current_price: 0.082, image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "polkadot", symbol: "dot", name: "Polkadot", current_price: 7.2, image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
];

type ConversionMode = "crypto_to_fiat" | "fiat_to_crypto" | "crypto_to_crypto";

export default function ConverterPage() {
  const [coins, setCoins] = useState<CoinPrice[]>(FALLBACK_COINS);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [mode, setMode] = useState<ConversionMode>("crypto_to_fiat");
  const [amount, setAmount] = useState("1");
  const [fromCoin, setFromCoin] = useState(0);
  const [toCoin, setToCoin] = useState(1);
  const [fiatCurrency, setFiatCurrency] = useState("USD");

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
      );
      if (res.ok) {
        const data = await res.json();
        setCoins(data);
        setLastUpdated(new Date());
      }
    } catch {
      // Use fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const result = (() => {
    const qty = parseFloat(amount) || 0;
    if (qty <= 0) return null;

    const from = coins[fromCoin];
    const to = coins[toCoin];
    const fiatRate = FIAT_RATES[fiatCurrency] ?? 1;
    const fiat = FIAT_CURRENCIES.find((f) => f.code === fiatCurrency)!;

    if (mode === "crypto_to_fiat") {
      const usdValue = qty * from.current_price;
      const fiatValue = usdValue * fiatRate;
      return {
        fromLabel: `${qty} ${from.symbol.toUpperCase()}`,
        toLabel: `${fiat.symbol}${fiatValue.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${fiatCurrency}`,
        rate: `1 ${from.symbol.toUpperCase()} = ${fiat.symbol}${(from.current_price * fiatRate).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${fiatCurrency}`,
        usdValue,
      };
    }

    if (mode === "fiat_to_crypto") {
      const usdAmount = qty / fiatRate;
      const cryptoAmount = usdAmount / from.current_price;
      return {
        fromLabel: `${fiat.symbol}${qty.toLocaleString()} ${fiatCurrency}`,
        toLabel: `${cryptoAmount < 1 ? cryptoAmount.toFixed(8) : cryptoAmount.toFixed(6)} ${from.symbol.toUpperCase()}`,
        rate: `1 ${fiatCurrency} = ${(1 / fiatRate / from.current_price).toFixed(8)} ${from.symbol.toUpperCase()}`,
        usdValue: usdAmount,
      };
    }

    // crypto_to_crypto
    const usdValue = qty * from.current_price;
    const toAmount = usdValue / to.current_price;
    return {
      fromLabel: `${qty} ${from.symbol.toUpperCase()}`,
      toLabel: `${toAmount < 1 ? toAmount.toFixed(8) : toAmount.toFixed(6)} ${to.symbol.toUpperCase()}`,
      rate: `1 ${from.symbol.toUpperCase()} = ${(from.current_price / to.current_price).toFixed(8)} ${to.symbol.toUpperCase()}`,
      usdValue,
    };
  })();

  return (
    <Section>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <ArrowDownUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Crypto Converter
              </h1>
              <p className="text-sm text-muted-foreground">
                Convert between cryptocurrencies and fiat currencies with live rates
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "crypto_to_fiat", label: "Crypto → Fiat" },
            { value: "fiat_to_crypto", label: "Fiat → Crypto" },
            { value: "crypto_to_crypto", label: "Crypto → Crypto" },
          ] as { value: ConversionMode; label: string }[]).map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Converter Card */}
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {mode === "fiat_to_crypto" ? "Amount" : "Quantity"}
            </label>
            <div className="relative">
              {mode === "fiat_to_crypto" && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {FIAT_CURRENCIES.find((f) => f.code === fiatCurrency)?.symbol}
                </span>
              )}
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1"
                min="0"
                step="any"
                className={`w-full rounded-lg border border-border/60 bg-background pr-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 ${
                  mode === "fiat_to_crypto" ? "pl-7" : "pl-4"
                }`}
              />
            </div>
          </div>

          {/* From Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {mode === "fiat_to_crypto" ? "Fiat Currency" : "From"}
            </label>
            {mode === "fiat_to_crypto" ? (
              <select
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                {FIAT_CURRENCIES.map((f) => (
                  <option key={f.code} value={f.code}>{f.code} — {f.name}</option>
                ))}
              </select>
            ) : (
              <select
                value={fromCoin}
                onChange={(e) => setFromCoin(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                {coins.map((c, i) => (
                  <option key={c.id} value={i}>{c.name} ({c.symbol.toUpperCase()})</option>
                ))}
              </select>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* To Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            {mode === "crypto_to_fiat" ? (
              <select
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                {FIAT_CURRENCIES.map((f) => (
                  <option key={f.code} value={f.code}>{f.code} — {f.name}</option>
                ))}
              </select>
            ) : mode === "fiat_to_crypto" ? (
              <select
                value={fromCoin}
                onChange={(e) => setFromCoin(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                {coins.map((c, i) => (
                  <option key={c.id} value={i}>{c.name} ({c.symbol.toUpperCase()})</option>
                ))}
              </select>
            ) : (
              <select
                value={toCoin}
                onChange={(e) => setToCoin(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                {coins.map((c, i) => (
                  <option key={c.id} value={i}>{c.name} ({c.symbol.toUpperCase()})</option>
                ))}
              </select>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="border-t border-border/60 pt-4 space-y-3">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">{result.fromLabel} =</p>
                <p className="text-2xl font-bold tabular-nums">{result.toLabel}</p>
                <p className="text-xs text-muted-foreground">{result.rate}</p>
              </div>
            </div>
          )}

          {/* Refresh */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Using cached rates"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={fetchPrices}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Conversions */}
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold">Popular Conversions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {coins.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <img src={c.image} alt={c.name} width={20} height={20} className="rounded-full" loading="lazy" />
                  <span className="text-sm font-medium">1 {c.symbol.toUpperCase()}</span>
                </div>
                <span className="text-sm tabular-nums text-muted-foreground">
                  ${c.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
