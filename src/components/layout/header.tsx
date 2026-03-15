"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, TrendingUp } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthButtons, MobileAuthButtons } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <AuthButtons />
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border/40",
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <Container className="py-4 space-y-3">
          <nav className="flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2.5 text-sm text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <MobileAuthButtons />
        </Container>
      </div>
    </header>
  );
}
