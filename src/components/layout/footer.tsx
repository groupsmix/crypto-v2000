import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-screen-2xl px-4 mx-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link href="/compare" className="hover:text-foreground transition-colors">
            Compare
          </Link>
        </nav>
      </div>
    </footer>
  );
}
