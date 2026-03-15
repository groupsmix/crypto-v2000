"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Placeholder — newsletter signup will be implemented in a future task
    setSubmitted(true);
  }

  return (
    <Section>
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border/60 p-8 md:p-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Stay Ahead of the Market
          </h2>
          <p className="text-muted-foreground">
            Get weekly exchange updates, fee changes, and exclusive offers
            delivered to your inbox.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Thanks! You&apos;ll hear from us soon.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" size="sm" className="shrink-0">
                Subscribe
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </Section>
  );
}
