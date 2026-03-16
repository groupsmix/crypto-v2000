import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Clock, Tag, ChevronRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { prisma } from "@/lib/prisma";


export const metadata: Metadata = {
  title: "Chat Conversations | Admin",
  description: "View recent AI chatbot conversation logs.",
};

type ConversationWithMessages = {
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

const fallbackConversations: ConversationWithMessages[] = [];

async function getConversations(): Promise<ConversationWithMessages[]> {
  try {
    const conversations = await prisma.chatConversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
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

    return conversations;
  } catch {
    return fallbackConversations;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getIntentLabel(intent: string | null): string {
  if (!intent) return "General";
  const labels: Record<string, string> = {
    compare_exchanges: "Compare",
    fee_inquiry: "Fees",
    exchange_recommendation: "Recommendation",
    signup_intent: "Signup",
    security_inquiry: "Security",
    education: "Education",
    blocked: "Blocked",
    general: "General",
  };
  return labels[intent] || intent;
}

function getIntentColor(intent: string | null): string {
  if (!intent) return "bg-muted text-muted-foreground";
  const colors: Record<string, string> = {
    compare_exchanges: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    fee_inquiry: "bg-green-500/10 text-green-600 dark:text-green-400",
    exchange_recommendation: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    signup_intent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    security_inquiry: "bg-red-500/10 text-red-600 dark:text-red-400",
    education: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    blocked: "bg-red-500/10 text-red-600 dark:text-red-400",
    general: "bg-muted text-muted-foreground",
  };
  return colors[intent] || "bg-muted text-muted-foreground";
}

export default async function AdminConversationsPage() {
  const conversations = await getConversations();

  return (
    <Section>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Chat Conversations
            </h1>
            <p className="text-sm text-muted-foreground">
              {conversations.length} recent conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Conversation list */}
        {conversations.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h2 className="mt-4 text-lg font-semibold">No conversations yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Conversations will appear here once users start chatting with the
              AI assistant.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => {
              const userMessages = convo.messages.filter(
                (m) => m.role === "user"
              );
              const firstMessage =
                userMessages.length > 0
                  ? userMessages[0].content
                  : "No user message";
              const messageCount = convo.messages.length;

              return (
                <Link
                  key={convo.id}
                  href={`/admin/conversations/${convo.id}`}
                  className="block rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm font-medium truncate">
                        {firstMessage}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(convo.createdAt)}
                        </span>
                        <span>{messageCount} message{messageCount !== 1 ? "s" : ""}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getIntentColor(convo.intent)}`}
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {getIntentLabel(convo.intent)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}
