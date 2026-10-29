"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MessageBubble } from "@/components/chat/MessageBubble";

const MAX_CHARS = 500;

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

/**
 * A chat with the AI guide or the AI partner. It talks to /api/chat, which holds the
 * instructions itself: the browser only says which of the two it is, which topic, and what the
 * person has told us so far. Nothing is saved.
 */
export function LabChat({
  kind,
  topicId,
  hasLife,
  answers,
  maxTurns,
  name,
  avatar,
  initialInput,
  helpers,
  helpersLabel,
  onMessagesChange,
  onFinish,
}: {
  kind: "guide" | "partner";
  topicId: string;
  /** Guide only: whether they'd told us about their life when the chat began. */
  hasLife?: boolean;
  /** What they've told us, by name; the server fills it into its instructions. */
  answers: Record<string, string>;
  maxTurns: number;
  /** Shown in the header and while the AI is typing. */
  name: string;
  avatar?: React.ReactNode;
  /** What's already in the reply box when the chat opens, for them to send or change. */
  initialInput?: string;
  /** Ways to begin a sentence, shown on request above the reply box; tapping one adds it to the box. */
  helpers?: string[];
  helpersLabel?: string;
  onMessagesChange: (messages: ChatMsg[]) => void;
  onFinish: (messages: ChatMsg[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState(initialInput ?? "");
  const [showHelpers, setShowHelpers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [finished, setFinished] = useState(false);
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const atMax = userTurns >= maxTurns;

  // Kept in a ref so a parent passing a fresh function each render doesn't re-run the effect
  // below on every render (which, since the parent stores the messages, never settles).
  const onMessagesChangeRef = useRef(onMessagesChange);
  onMessagesChangeRef.current = onMessagesChange;

  // The latest answers, read when a message is sent, so a chat already under way picks up later ones.
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    onMessagesChangeRef.current(messages);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ask(history: ChatMsg[]): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, topicId, hasLife, answers: answersRef.current, messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setOffline(data.offline === true);
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }

  // The AI speaks first. The ref stops React's dev double-run from asking twice.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void ask([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading || finished) return;
    const history: ChatMsg[] = [...messages, { role: "user", content: text }];
    setInput("");
    setMessages(history);
    await ask(history);
  }

  function finish() {
    setFinished(true);
    onFinish(messages);
  }

  return (
    <div className="flex h-full min-h-[26rem] flex-col rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-4 py-2">
        <span className="font-body text-sm font-semibold text-ink">
          {name}
          <span className="ml-2 font-normal text-ink-muted">
            {userTurns} of {maxTurns} messages
          </span>
        </span>
        <div className="flex-1" />
        {userTurns >= 2 && !finished && (
          <Button size="sm" variant="outline" disabled={loading} onClick={finish}>
            Wrap up
          </Button>
        )}
      </div>

      {offline && (
        <div className="border-b border-line bg-plume-100 px-4 py-2 font-body text-xs text-plume-700">
          This site has no AI key yet, so the replies here are placeholders, not real AI replies.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} avatar={avatar} />
        ))}
        {loading && <p className="font-body text-xs text-ink-muted">{name} is typing…</p>}
        {error && (
          <div className="flex items-center gap-3 font-body text-sm text-plume-500">
            <span>{error}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                ask(messages.length && messages[messages.length - 1].role === "assistant" ? messages.slice(0, -1) : messages)
              }
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-line px-3.5 py-2.5">
        {helpers && helpers.length > 0 && !finished && !atMax && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setShowHelpers((s) => !s)}
              className="font-body text-xs font-semibold text-ink-soft hover:text-ink"
            >
              {helpersLabel ?? "Need help?"}
            </button>
            {showHelpers && (
              <div className="mt-2 flex flex-wrap gap-2">
                {helpers.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setInput((prev) => (prev.trim() ? `${prev.trimEnd()} ${h}` : h))}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-left font-body text-xs text-ink-soft transition-colors hover:border-ink-muted hover:text-ink"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {finished ? (
          <p className="text-center font-body text-sm text-ink-soft">Conversation finished.</p>
        ) : atMax ? (
          <div className="text-center">
            <p className="mb-2 font-body text-sm text-ink-soft">All messages used.</p>
            <Button onClick={finish}>Finish</Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              maxLength={MAX_CHARS}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || messages.length === 0}
              placeholder="Your reply…"
              aria-label="Your message"
              className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 font-body text-sm text-ink focus:border-primary focus:outline-none"
            />
            <Button type="submit" size="sm" disabled={loading || !input.trim() || messages.length === 0}>
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
