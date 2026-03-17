"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Exchanges", href: "/admin/exchanges", icon: Database },
  { title: "Blog", href: "/admin/blog", icon: FileText },
  { title: "Affiliate", href: "/admin/affiliate", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-border/40 bg-card/50">
      <div className="p-6 border-b border-border/40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground">CryptoCompare AI</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {adminNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/40">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          &larr; Back to Site
        </Link>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden border-b border-border/40 bg-card/50 overflow-x-auto">
      <div className="flex items-center gap-1 p-3 min-w-max">
        {adminNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
