"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TriggerButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleTrigger() {
    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch("/api/content-engine/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicLimit: 3,
          publishAsDraft: true,
          mode: "direct",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(
          `Created ${data.result.articlesCreated} article(s), ${data.result.imagesGenerated} image(s).`
        );
        // Reload page to show updated data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setResult(`Error: ${data.error ?? "Unknown error"}`);
      }
    } catch (err) {
      setResult(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate">
          {result}
        </span>
      )}
      <Button size="sm" onClick={handleTrigger} disabled={isRunning}>
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1.5" />
            Run Now
          </>
        )}
      </Button>
    </div>
  );
}
