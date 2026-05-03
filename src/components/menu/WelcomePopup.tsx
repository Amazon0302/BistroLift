"use client";

import { useState } from "react";
import { toast } from "sonner";

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

export default function WelcomePopup({ restaurant, tableId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        tableId: tableId,
        restaurantId: restaurant.id,
      }),
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(to right, ${restaurant.themeColor}, #92400e)` }}
        />

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold text-white">You&apos;re all set!</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We&apos;ll send your discount code via SMS. Enjoy your meal at{" "}
              <span className="text-white font-medium">{restaurant.name}</span>!
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-black transition-colors"
              style={{ backgroundColor: restaurant.themeColor }}
            >
              Browse Menu →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="text-3xl mb-2">🎁</div>
              <h2 className="text-xl font-bold text-white">Welcome to {restaurant.name}!</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Share your details and get{" "}
                <span className="font-semibold" style={{ color: restaurant.themeColor }}>
                  {restaurant.discountText}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
              <input
                name="phone"
                type="tel"
                required
                placeholder="Phone number (e.g. +1 555 000 0000)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black transition-colors disabled:opacity-50"
              style={{ backgroundColor: restaurant.themeColor }}
            >
              {loading ? "Saving..." : "Claim Discount 🎉"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-1"
            >
              Skip for now
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
