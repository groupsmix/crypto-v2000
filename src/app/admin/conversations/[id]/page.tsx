import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, User, Clock, Tag } from "lucide-react";
import { Section } from "@/components/ui/section";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Conversation Detail | Admin",
  description: "View conversation details.",
};

type ConversationDetail = {
  id: string;
  sessionId: string;
  userId: string | null;
  intent: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: string;
    content: string;
    groundingSources: string | null;
    createdAt: Date;
  }[];
};

async function getConversation(id: string): Promise<ConversationDetail | null> {
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            groundingSources: true,
            createdAt: true,
          },
        },
      },
    });

    return conversation;
  } catch {
    return null;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getIntentLabel(intent: string | null): string {
  if (!intent) return "General";
  const labels: Record<string, string> = {
    compare_exchanges: "Compare Exchanges",
    fee_inquiry: "Fee Inquiry",
    exchange_recommendation: "Exchange Recommendation",
    signup_intent: "Signup Intent",
    security_inquiry: "Security Inquiry",
    education: "Education",
    blocked: "Blocked Content",
    general: "General",
  };
  return labels[intent] || intent;
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) {
    notFound();
  }

  return (
    <Section>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/conversations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to conversations
          </Link>
        </div>

        {/* Conversation metadata */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
          <h1 className="text-lg font-semibold">Conversation Details</h1>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>{" "}
              <span className="font-mono text-xs">{conversation.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Session:</span>{" "}
              <span className="font-mono text-xs">
                {conversation.sessionId.substring(0, 20)}...
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Started:</span>{" "}
              {formatDate(conversation.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Intent:</span>{" "}
              {getIntentLabel(conversation.intent)}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Messages ({conversation.messages.length})
          </h2>

          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border border-border/60 p-4 ${
                msg.role === "user" ? "bg-primary/5" : "bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-3 w-3 text-primary" />
                  ) : (
                    <Bot className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium capitalize">
                  {msg.role}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap pl-8">
                {msg.content}
              </div>
              {msg.groundingSources && (
                <div className="mt-2 pl-8">
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">
                      Grounding sources
                    </summary>
                    <pre className="mt-1 rounded bg-muted p-2 overflow-x-auto">
                      {JSON.stringify(
                        JSON.parse(msg.groundingSources),
                        null,
                        2
                      )}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
