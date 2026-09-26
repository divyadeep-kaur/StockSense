"use client";

import { useEffect, useRef, useState } from "react";
import { SparkleIcon, XIcon, SendIcon } from "@/components/icons";
import { useAssistant } from "@/components/assistant-context";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi! I'm the StockSense assistant. Ask me about stock levels, pending receipts or deliveries, low-stock items, or how a feature works.";

const SUGGESTED_QUESTIONS = [
  "Which products need reordering?",
  "What's low in stock?",
  "Show pending deliveries",
];

export function AssistantWidget() {
  const { open, setOpen } = useAssistant();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(overrideText?: string) {
    const content = (overrideText ?? input).trim();
    if (!content || loading) return;

    const nextHistory = [...messages, { role: "user" as const, content }];
    setMessages(nextHistory);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: nextHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The assistant is unavailable right now.");
      setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="animate-panel-slide-in fixed bottom-24 right-6 z-50 flex h-[calc(100vh-7rem)] max-h-[520px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl sm:right-6 max-sm:inset-x-4 max-sm:bottom-4 max-sm:h-[calc(100vh-2rem)] max-sm:w-auto">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-accent-soft px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <SparkleIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">StockSense Assistant</p>
                <p className="text-xs text-muted">Grounded in your live inventory data</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-foreground"
              aria-label="Close assistant"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <Bubble role="assistant" content={GREETING} />
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/50 hover:text-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && <Bubble role="assistant" content="Thinking…" pending />}
            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-end gap-2 border-t border-border p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about stock, orders, or how to..."
              rows={1}
              className="max-h-24 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground disabled:opacity-40"
              aria-label="Send message"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform hover:scale-105 active:scale-95"
          aria-label="Open assistant"
        >
          <SparkleIcon className="h-5 w-5" />
        </button>
      )}
    </>
  );
}

function Bubble({ role, content, pending }: { role: "user" | "assistant"; content: string; pending?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
          isUser
            ? "bg-accent text-accent-foreground"
            : "bg-background text-foreground" + (pending ? " text-muted italic" : "")
        }`}
      >
        {content}
      </div>
    </div>
  );
}
