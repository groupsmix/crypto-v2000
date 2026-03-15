"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Star,
  GitCompareArrows,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: Star },
  { label: "Saved Comparisons", href: "/dashboard/saved-comparisons", icon: GitCompareArrows },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const displayName = session.user.name || session.user.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20"
        aria-label="User menu"
      >
        <span className="text-sm font-semibold text-primary">{initial}</span>
      </Button>

      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card shadow-lg transition-all duration-200 z-50",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"
        )}
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {session.user.email}
          </p>
        </div>

        <nav className="p-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-1 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-16 rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  if (session) {
    return <UserMenu />;
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/login">Log in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">Sign up</Link>
      </Button>
    </>
  );
}

export function MobileAuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
        <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  if (session) {
    const displayName = session.user.name || session.user.email.split("@")[0];
    return (
      <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{session.user.email}</p>
        </div>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground rounded-md hover:text-foreground hover:bg-accent transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground rounded-md hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href="/auth/login">Log in</Link>
      </Button>
      <Button size="sm" className="w-full" asChild>
        <Link href="/auth/signup">Sign up</Link>
      </Button>
    </div>
  );
}
