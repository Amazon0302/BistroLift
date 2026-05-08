"use client";

import { useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  themeColor: string;
  discountText: string;
}

interface Props {
  restaurant: Restaurant;
  tableId?: string;
  onClose: () => void;
}

const SURFACE = "#1A1714";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT1   = "#F3EEE7";
const TEXT2   = "#998F83";

export default function WelcomePopup({ restaurant, tableId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const tc = restaurant.themeColor;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        tableId,
        restaurantId: restaurant.id,
      }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        style={{ backgroundColor: SURFACE, borderRadius: "28px 28px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.40)" }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} />
        </div>

        {submitted ? (
          <div className="px-6 pt-5 pb-8 text-center space-y-4">
            <div className="mx-auto flex items-center justify-center" style={{ width: "64px", height: "64px", borderRadius: "20px", background: `linear-gradient(135deg, ${tc}28, ${tc}10)`, border: `1px solid ${tc}25` }}>
              <span style={{ fontSize: "28px" }}>🎉</span>
            </div>
            <div>
              <h2 className="font-bold tracking-tight" style={{ fontSize: "20px", color: TEXT1, letterSpacing: "-0.3px" }}>You&apos;re all set!</h2>
              <p className="leading-relaxed mt-1.5" style={{ fontSize: "13px", color: TEXT2 }}>
                We&apos;ll send your discount via SMS. Enjoy your meal at{" "}
                <span className="font-semibold" style={{ color: TEXT1 }}>{restaurant.name}</span>!
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-full font-bold text-white active:scale-[0.98] transition-transform"
              style={{ paddingTop: "14px", paddingBottom: "14px", fontSize: "15px", backgroundColor: tc, boxShadow: `0 6px 20px ${tc}44` }}
            >
              Browse Menu →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-8 space-y-5">
            {/* Icon + heading */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex items-center justify-center" style={{ width: "64px", height: "64px", borderRadius: "20px", background: `linear-gradient(135deg, ${tc}28, ${tc}10)`, border: `1px solid ${tc}25` }}>
                <span style={{ fontSize: "28px" }}>🎁</span>
              </div>
              <div>
                <h2 className="font-bold tracking-tight" style={{ fontSize: "20px", color: TEXT1, letterSpacing: "-0.3px" }}>
                  Welcome to {restaurant.name}!
                </h2>
                <p className="leading-relaxed mt-1.5" style={{ fontSize: "13px", color: TEXT2 }}>
                  Share your details and unlock{" "}
                  <span className="font-bold" style={{ color: tc }}>{restaurant.discountText}</span>
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full transition-colors focus:outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  color: TEXT1,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = tc)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              />
              <input
                name="phone"
                type="tel"
                required
                placeholder="Phone number"
                className="w-full transition-colors focus:outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  color: TEXT1,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = tc)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-50"
              style={{ paddingTop: "14px", paddingBottom: "14px", fontSize: "15px", backgroundColor: tc, boxShadow: `0 6px 20px ${tc}44` }}
            >
              {loading ? "Saving…" : "Claim Discount 🎉"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center py-1 transition-colors"
              style={{ fontSize: "13px", color: TEXT2 }}
            >
              Skip for now
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
