"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Megaphone } from "lucide-react";

const messages = [
  "🔥 Binance: Get 20% off trading fees with our exclusive link!",
  "💰 Bybit: Up to $30,000 deposit bonus for new users",
  "⚡ KuCoin: Sign up now and earn up to $500 in rewards",
  "📊 Compare 50+ exchanges side-by-side — find your perfect match",
];

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rotate = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(rotate, 5000);
    return () => clearInterval(interval);
  }, [dismissed, rotate]);

  if (!mounted || dismissed) return null;

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center gap-2 px-4 py-2 text-center text-sm sm:px-6">
        <Megaphone className="hidden h-4 w-4 shrink-0 sm:block" />
        <p className="truncate font-medium">{messages[currentIndex]}</p>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
