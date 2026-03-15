import type { Metadata } from "next";
import { Settings, Database, FileText, BarChart3, Users } from "lucide-react";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing CryptoCompare AI.",
};

const adminSections = [
  { icon: Database, title: "Exchanges", description: "Manage exchange listings and data" },
  { icon: FileText, title: "Blog Posts", description: "Create and edit blog content" },
  { icon: BarChart3, title: "Analytics", description: "View traffic and affiliate clicks" },
  { icon: Users, title: "Users", description: "Manage user accounts" },
];

export default function AdminPage() {
  return (
    <Section>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your CryptoCompare AI platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {adminSections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-border/60 bg-card p-6 space-y-2 cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <section.icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Admin functionality will be implemented in a future task.
        </p>
      </div>
    </Section>
  );
}
