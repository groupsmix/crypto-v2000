import type { Metadata } from "next";
import {
  Settings,
  Key,
  Database,
  Globe,
  Shield,
  Server,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Platform Settings",
  description: "Configure API keys, environment variables, and platform settings.",
};

type EnvVarConfig = {
  name: string;
  description: string;
  required: boolean;
  category: string;
  isSet: boolean;
};

function getEnvVarStatus(): EnvVarConfig[] {
  return [
    {
      name: "DATABASE_URL",
      description: "PostgreSQL connection string",
      required: true,
      category: "Database",
      isSet: !!process.env.DATABASE_URL,
    },
    {
      name: "NEXTAUTH_SECRET",
      description: "NextAuth.js encryption secret",
      required: true,
      category: "Authentication",
      isSet: !!process.env.NEXTAUTH_SECRET,
    },
    {
      name: "NEXTAUTH_URL",
      description: "Application base URL for NextAuth",
      required: true,
      category: "Authentication",
      isSet: !!process.env.NEXTAUTH_URL,
    },
    {
      name: "NEXT_PUBLIC_APP_URL",
      description: "Public application URL",
      required: true,
      category: "Application",
      isSet: !!process.env.NEXT_PUBLIC_APP_URL,
    },
    {
      name: "UPSTASH_REDIS_REST_URL",
      description: "Upstash Redis REST endpoint for caching",
      required: false,
      category: "Cache",
      isSet: !!process.env.UPSTASH_REDIS_REST_URL,
    },
    {
      name: "UPSTASH_REDIS_REST_TOKEN",
      description: "Upstash Redis REST authentication token",
      required: false,
      category: "Cache",
      isSet: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    {
      name: "REDIS_URL",
      description: "TCP Redis connection for BullMQ job queue",
      required: false,
      category: "Queue",
      isSet: !!process.env.REDIS_URL,
    },
    {
      name: "ANTHROPIC_API_KEY",
      description: "API key for Claude AI content generation",
      required: false,
      category: "AI / Content Engine",
      isSet: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      name: "NEWSAPI_KEY",
      description: "NewsAPI key for trending topic discovery",
      required: false,
      category: "AI / Content Engine",
      isSet: !!process.env.NEWSAPI_KEY,
    },
    {
      name: "HUGGINGFACE_API_KEY",
      description: "Hugging Face API key for image generation",
      required: false,
      category: "AI / Content Engine",
      isSet: !!process.env.HUGGINGFACE_API_KEY,
    },
  ];
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-red-400" />
  );
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Database: Database,
  Authentication: Shield,
  Application: Globe,
  Cache: Server,
  Queue: Server,
  "AI / Content Engine": Key,
};

export default function AdminSettingsPage() {
  const envVars = getEnvVarStatus();
  const categories = Array.from(new Set(envVars.map((v) => v.category)));
  const configuredCount = envVars.filter((v) => v.isSet).length;
  const requiredMissing = envVars.filter((v) => v.required && !v.isSet);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Platform configuration and environment variable status
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Configured
            </span>
          </div>
          <p className="text-2xl font-bold">
            {configuredCount} / {envVars.length}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Required Missing
            </span>
          </div>
          <p className={`text-2xl font-bold ${requiredMissing.length > 0 ? "text-red-500" : "text-green-500"}`}>
            {requiredMissing.length}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Environment
            </span>
          </div>
          <p className="text-2xl font-bold capitalize">
            {process.env.NODE_ENV || "development"}
          </p>
        </div>
      </div>

      {/* Required Missing Warning */}
      {requiredMissing.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 space-y-2">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Missing Required Environment Variables
          </p>
          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
            {requiredMissing.map((v) => (
              <li key={v.name} className="flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                <code className="font-mono text-xs">{v.name}</code>
                <span className="text-muted-foreground">- {v.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Environment Variables by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const CategoryIcon = categoryIcons[category] || Key;
          const vars = envVars.filter((v) => v.category === category);

          return (
            <div
              key={category}
              className="rounded-xl border border-border/60 bg-card overflow-hidden"
            >
              <div className="p-4 border-b border-border/40 flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">{category}</h2>
              </div>
              <div className="divide-y divide-border/40">
                {vars.map((envVar) => (
                  <div
                    key={envVar.name}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-medium">
                          {envVar.name}
                        </code>
                        {envVar.required && (
                          <span className="text-[10px] font-medium text-red-500 uppercase">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {envVar.description}
                      </p>
                    </div>
                    <StatusIcon ok={envVar.isSet} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Environment variables must be configured in your deployment platform (Vercel, Railway, etc.)
        or in a local <code className="font-mono">.env</code> file. Values are never displayed for security.
      </p>
    </div>
  );
}
