"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Star,
  GitCompareArrows,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: Star },
  { label: "Saved Comparisons", href: "/dashboard/saved-comparisons", icon: GitCompareArrows },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0">
      <nav className="sticky top-20 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex overflow-x-auto gap-1 pb-4 -mx-1 px-1 scrollbar-none">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors shrink-0",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
