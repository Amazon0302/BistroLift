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

const BG      = "#0F0D0A";
const SURFACE = "#1A1714";
const SURFACE2= "#211E1A";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT1   = "#F3EEE7";
const TEXT2   = "#998F83";
const TEXT3   = "#5E5852";

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
  const tc = themeColor;

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
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as { message: string; suggestions: ChatSuggestion[] };
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
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={`relative flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ backgroundColor: SURFACE, borderRadius: "28px 28px 0 0", maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-3 pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${tc}18`, border: `1.5px solid ${tc}28`, fontSize: "18px" }}>
                🤖
              </div>
              <div>
                <p className="font-bold leading-none" style={{ fontSize: "14px", color: TEXT1 }}>Menu Assistant</p>
                <p className="mt-0.5" style={{ fontSize: "11px", color: TEXT3 }}>AI-powered suggestions</p>
              </div>
            </div>
            <button onClick={close} className="font-semibold transition-colors" style={{ fontSize: "13px", color: TEXT2 }}>
              Close
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4" style={{ backgroundColor: BG }}>
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md text-white font-medium" style={{ fontSize: "13px", backgroundColor: tc }}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex items-center justify-center flex-shrink-0 mt-0.5" style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: `${tc}18`, fontSize: "14px" }}>
                      🤖
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-md px-4 py-2.5" style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}>
                      <p className="leading-relaxed" style={{ fontSize: "13px", color: TEXT2 }}>{msg.content}</p>
                    </div>
                  </div>

                  {/* Suggestion cards */}
                  {(msg.suggestions ?? []).length > 0 && (
                    <div className="ml-10 space-y-2">
                      {(msg.suggestions ?? []).map((s) => {
                        const item = itemMap[s.id];
                        if (!item) return null;
                        return (
                          <button
                            key={s.id}
                            onClick={() => { onViewItem(item); close(); }}
                            className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                            style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "10px 12px" }}
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="object-cover flex-shrink-0" style={{ width: "52px", height: "52px", borderRadius: "10px" }} />
                            ) : (
                              <div className="flex items-center justify-center flex-shrink-0" style={{ width: "52px", height: "52px", borderRadius: "10px", background: `${tc}15`, fontSize: "22px" }}>
                                🍽️
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate" style={{ fontSize: "13px", color: TEXT1 }}>{item.name}</p>
                              <p className="mt-0.5 line-clamp-2 leading-snug" style={{ fontSize: "11px", color: TEXT3 }}>{s.reason}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="font-bold" style={{ fontSize: "13px", color: tc }}>${item.price.toFixed(2)}</p>
                              <p className="mt-0.5" style={{ fontSize: "10px", color: TEXT3 }}>View →</p>
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

          {/* Loading dots */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: `${tc}18`, fontSize: "14px" }}>
                🤖
              </div>
              <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}>
                <div className="flex gap-1.5">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: TEXT3, animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {!hasUserMessages && (
          <div className="flex-shrink-0 px-4 py-3 flex flex-wrap gap-2" style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.value}
                onClick={() => send(p.value)}
                className="font-semibold px-3 py-1.5 rounded-full transition-colors"
                style={{ fontSize: "12px", color: TEXT2, backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-4" style={{ backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2.5 rounded-full px-4 py-2.5" style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Tell me your mood or preference…"
              disabled={loading}
              className="flex-1 bg-transparent focus:outline-none disabled:opacity-50"
              style={{ fontSize: "13px", color: TEXT1 }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="flex items-center justify-center text-white font-bold transition-all disabled:opacity-30 active:scale-95"
              style={{ width: "32px", height: "32px", borderRadius: "50%", fontSize: "16px", backgroundColor: tc, boxShadow: input.trim() ? `0 3px 10px ${tc}44` : "none" }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
