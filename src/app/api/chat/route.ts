import { NextResponse } from "next/server";
import { buildGuideStep, buildPartnerStep } from "@/lib/knowledge/prompts";
import { getKnowledgeTopic } from "@/lib/knowledge/topics";

export const runtime = "nodejs";

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 600;
const MAX_ANSWER_CHARS = 1500;
const MAX_REPLY_TOKENS = 220;

/** The only answers each kind of chat reads. Anything else the browser sends is ignored. */
const ANSWER_NAMES: Record<string, string[]> = {
  guide: ["life_connections", "matters_most", "story_text"],
  partner: ["their_sentence"],
};

/**
 * A light brake on how often one visitor can ask, since the site has no login. It lives in the
 * server's memory, so on a serverless host it is per instance and only a best effort.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 40;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    hits.forEach((times, key) => {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    });
  }
  return recent.length > MAX_PER_WINDOW;
}

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Fills {names} in the instructions with what the visitor told us. A name with no answer stays as it is. */
function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{([a-z_]+)\}/g, (token, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : token,
  );
}

const LANGUAGE_RULE =
  "Never use profanity, slurs, or insults. Never give legal, medical or financial advice. If the person seems upset or in distress, be kind and suggest they take a break.";

const OFFLINE_REPLY =
  "This is a placeholder reply, because this site has no AI key yet. With one, the guide or partner would answer here.";

/**
 * One AI turn. The browser sends which chat it is (guide or partner), which topic, what the
 * person told us, and the conversation so far; the instructions are written here, never taken
 * from the browser. Nothing is stored.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return bad("That's a lot of messages in a short time. Please wait a few minutes.", 429);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Invalid request");

  const kind = body.kind;
  if (kind !== "guide" && kind !== "partner") return bad("Unknown chat");
  const topic = getKnowledgeTopic(typeof body.topicId === "string" ? body.topicId : undefined);
  if (!topic) return bad("Unknown topic");

  const vars: Record<string, string> = { topic: topic.topicPreset };
  const given = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};
  for (const name of ANSWER_NAMES[kind]) {
    const v = given[name];
    if (typeof v === "string") vars[name] = v.slice(0, MAX_ANSWER_CHARS);
  }

  const raw = body.messages;
  if (!Array.isArray(raw) || raw.length > MAX_MESSAGES) return bad("Too many messages");
  const history: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of raw) {
    const ok =
      m && typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" && m.content.trim() !== "" && m.content.length <= MAX_MESSAGE_CHARS;
    if (!ok) return bad("Messages must be non-empty text, up to 600 characters");
    history.push({ role: m.role, content: m.content });
  }
  if (history.length > 0 && history[history.length - 1].role !== "user") return bad("The last message must be theirs");

  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return NextResponse.json({ reply: OFFLINE_REPLY, offline: true });

  const step = kind === "guide" ? buildGuideStep(topic, body.hasLife === true) : buildPartnerStep(topic);
  const system = `${fill(step.aiPromptText, vars)}\n\n${LANGUAGE_RULE}`;
  const messages =
    history.length === 0 ? [{ role: "user" as const, content: fill(step.openingInstruction, vars) }] : history;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || "grok-4.20-0309-non-reasoning",
        messages: [{ role: "system", content: system }, ...messages],
        max_tokens: MAX_REPLY_TOKENS,
        temperature: history.length === 0 ? 0.9 : 0.8,
      }),
    });
    if (!res.ok) {
      console.log(`[chat] ${kind} upstream ${res.status}`);
      return bad("The AI didn't respond. Try again.", 502);
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return bad("The AI didn't respond. Try again.", 502);
    return NextResponse.json({ reply });
  } catch {
    return bad("The AI didn't respond. Try again.", 502);
  }
}
