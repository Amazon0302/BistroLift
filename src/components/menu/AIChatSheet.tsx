"use client";

import { useState, useEffect, useRef } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  badges: string[];
  ingredients: string[];
  upsellIds: string[];
}

interface ChatSuggestion {
  id: string;
  name: string;
  reason: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: ChatSuggestion[];
}

interface Props {
  slug: string;
  itemMap: Record<string, MenuItem>;
  themeColor: string;
  onClose: () => void;
  onViewItem: (item: MenuItem) => void;
}

const QUICK_PROMPTS = [
  { label: "Light & healthy 🥗", value: "I want something light and healthy" },
  { label: "Comfort food 🍝",    value: "I'm in the mood for something hearty and comforting" },
  { label: "Vegetarian 🌿",      value: "I'm vegetarian, what do you recommend?" },
  { label: "Surprise me! ✨",    value: "Surprise me with your best dish!" },
];

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! Tell me what you're in the mood for — whether it's something light, indulgent, vegetarian, or a total surprise — and I'll find the perfect dish for you! 🍽️",
};

export default function AIChatSheet({ slug, itemMap, themeColor, onClose, onViewItem }: Props) {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function close() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "assistant" || m !== GREETING)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`/api/menu/${slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string };
        console.error("[AIChatSheet] API error", res.status, errBody.error);
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as {
        message: string;
        suggestions: ChatSuggestion[];
      };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, suggestions: data.suggestions ?? [] },
      ]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, something went wrong: ${detail}. Please try again!` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <div className="fixed inset-0 z-[55] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={`relative bg-[#111] rounded-t-3xl flex flex-col max-h-[88vh] transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: `${themeColor}20`, border: `1px solid ${themeColor}40` }}
              >
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Menu Assistant</p>
                <p className="text-zinc-500 text-xs mt-0.5">AI-powered suggestions</p>
              </div>
            </div>
            <button onClick={close} className="text-zinc-500 hover:text-white text-sm transition-colors">
              Close
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                /* User bubble */
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm font-medium text-black"
                    style={{ backgroundColor: themeColor }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* Assistant bubble + suggestion cards */
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      🤖
                    </div>
                    <div className="flex-1 bg-zinc-900 border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-2.5">
                      <p className="text-zinc-200 text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>

                  {/* Suggestion cards */}
                  {(msg.suggestions ?? []).length > 0 && (
                    <div className="ml-9 space-y-2">
                      {(msg.suggestions ?? []).map((s) => {
                        const item = itemMap[s.id];
                        if (!item) return null;
                        return (
                          <button
                            key={s.id}
                            onClick={() => { onViewItem(item); close(); }}
                            className="w-full flex items-center gap-3 bg-zinc-900 border border-white/[0.07] hover:border-white/20 rounded-2xl p-3 text-left active:scale-[0.98] transition-all"
                          >
                            {/* Image or emoji */}
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 text-2xl">
                                🍽️
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                              <p className="text-zinc-500 text-xs mt-0.5 leading-snug line-clamp-2">{s.reason}</p>
                            </div>

                            <div className="flex-shrink-0 text-right">
                              <p className="font-extrabold text-sm" style={{ color: themeColor }}>
                                ${item.price.toFixed(2)}
                              </p>
                              <p className="text-zinc-600 text-[10px] mt-0.5">View →</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                🤖
              </div>
              <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick-start prompts (only before first user message) */}
        {!hasUserMessages && (
          <div className="flex-shrink-0 px-4 pb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.value}
                onClick={() => send(p.value)}
                className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] text-zinc-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 bg-zinc-900 border border-white/[0.08] rounded-2xl px-4 py-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Tell me your mood or preference…"
              disabled={loading}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-black text-base font-bold transition-all disabled:opacity-30 active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
