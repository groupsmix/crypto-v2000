import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import {
  getExchangeContext,
  getBlogContext,
  formatExchangeContext,
  formatBlogContext,
} from "@/lib/chat-context";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";


const CHAT_RATE_LIMIT = { limit: 20, windowSeconds: 60 };

const BLOCKED_TOPICS = [
  "financial advice",
  "guaranteed returns",
  "insider trading",
  "money laundering",
  "tax evasion",
  "pump and dump",
];

function containsBlockedTopic(message: string): boolean {
  const lower = message.toLowerCase();
  return BLOCKED_TOPICS.some((topic) => lower.includes(topic));
}

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request.headers);
  const rateCheck = checkRateLimit(`chat:${clientId}`, CHAT_RATE_LIMIT);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before sending another message." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": String(rateCheck.remaining),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const {
      message,
      conversationId,
      sessionId,
    }: {
      message: string;
      conversationId?: string;
      sessionId: string;
    } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    if (containsBlockedTopic(message)) {
      return NextResponse.json({
        reply:
          "I can help with crypto exchange comparisons, fees, features, and general crypto education. However, I cannot provide specific financial advice, guarantee returns, or assist with any potentially illegal activities. How else can I help you?",
        conversationId: conversationId || null,
        intent: "blocked",
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply:
          "The AI assistant is currently unavailable. Please try again later or browse our exchange comparison and blog pages for helpful information.",
        conversationId: conversationId || null,
        intent: null,
      });
    }

    // Fetch grounding context from DB
    const [exchanges, blogPosts] = await Promise.all([
      getExchangeContext(),
      getBlogContext(),
    ]);

    const exchangeInfo = formatExchangeContext(exchanges);
    const blogInfo = formatBlogContext(blogPosts);

    // Get or create conversation
    let convoId = conversationId;
    let history: ConversationMessage[] = [];

    if (convoId) {
      try {
        const existingMessages = await prisma.chatMessage.findMany({
          where: { conversationId: convoId },
          orderBy: { createdAt: "asc" },
          take: 20,
          select: { role: true, content: true },
        });
        history = existingMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      } catch {
        // If conversation not found, create new one
        convoId = undefined;
      }
    }

    if (!convoId) {
      try {
        const convo = await prisma.chatConversation.create({
          data: { sessionId },
        });
        convoId = convo.id;
      } catch {
        // If DB is unavailable, continue without persistence
        convoId = undefined;
      }
    }

    const systemPrompt = `You are the CryptoCompare AI assistant — a helpful, knowledgeable crypto exchange advisor embedded on the CryptoCompare AI platform. Your role is to:

1. Answer questions about cryptocurrency exchanges, trading fees, features, and security
2. Recommend exchanges from our platform data based on user needs
3. Guide users to relevant pages on the site (compare pages, exchange details, blog articles)
4. Suggest affiliate signup links when naturally relevant (do NOT force them)

IMPORTANT RULES:
- ONLY recommend exchanges that exist in our platform data below. Never make up or hallucinate exchange information.
- Always base your answers on the factual data provided. If you don't have data for something, say so honestly.
- Never provide specific financial advice, price predictions, or guaranteed returns.
- Keep responses concise but helpful (2-4 paragraphs max).
- When recommending exchanges, mention their key differentiators (fees, coin selection, features).
- When relevant, suggest users visit our comparison page at /compare or specific exchange pages.
- Use markdown formatting for readability (bold, links, lists).
- If a user asks about something outside crypto/exchanges, politely redirect them.

PLATFORM DATA — EXCHANGES:
${exchangeInfo}

PLATFORM DATA — RECENT BLOG POSTS:
${blogInfo}

SITE PAGES:
- /compare — Side-by-side exchange comparison tool
- /exchanges — Full exchange directory
- /exchanges/[slug] — Individual exchange detail pages
- /prices — Live cryptocurrency prices
- /blog — Educational blog content
- /tools — Crypto calculators and tools`;

    const messages: { role: "user" | "assistant"; content: string }[] = [
      ...history,
      { role: "user", content: message },
    ];

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && textBlock.type === "text"
      ? textBlock.text
      : "I'm sorry, I couldn't generate a response. Please try again.";

    // Detect intent from the response
    const intent = detectIntent(message);

    // Persist messages and update intent
    if (convoId) {
      try {
        const groundingSources = JSON.stringify({
          exchangeCount: exchanges.length,
          blogPostCount: blogPosts.length,
          exchangeNames: exchanges.map((e) => e.name),
        });

        await prisma.chatMessage.createMany({
          data: [
            { conversationId: convoId, role: "user", content: message },
            {
              conversationId: convoId,
              role: "assistant",
              content: reply,
              groundingSources,
            },
          ],
        });

        if (intent) {
          await prisma.chatConversation.update({
            where: { id: convoId },
            data: { intent },
          });
        }
      } catch {
        // Silently fail persistence - response is still returned
      }
    }

    return NextResponse.json({
      reply,
      conversationId: convoId || null,
      intent,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        reply:
          "I'm having trouble right now. Please try again in a moment, or browse our [exchange comparison](/compare) and [blog](/blog) pages.",
        conversationId: null,
        intent: null,
      },
      { status: 500 }
    );
  }
}

function detectIntent(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("compare") || lower.includes("vs") || lower.includes("versus") || lower.includes("difference between")) {
    return "compare_exchanges";
  }
  if (lower.includes("fee") || lower.includes("cost") || lower.includes("price") || lower.includes("cheap")) {
    return "fee_inquiry";
  }
  if (lower.includes("recommend") || lower.includes("best") || lower.includes("suggest") || lower.includes("which")) {
    return "exchange_recommendation";
  }
  if (lower.includes("sign up") || lower.includes("signup") || lower.includes("register") || lower.includes("join")) {
    return "signup_intent";
  }
  if (lower.includes("security") || lower.includes("safe") || lower.includes("hack") || lower.includes("trust")) {
    return "security_inquiry";
  }
  if (lower.includes("beginner") || lower.includes("start") || lower.includes("new to") || lower.includes("learn")) {
    return "education";
  }
  return "general";
}
