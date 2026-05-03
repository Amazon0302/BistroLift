"use client";

import { useState, useEffect } from "react";
import type { CartEntry } from "./CartDrawer";

interface Props {
  entries: CartEntry[];
  note: string;
  subtotal: number;
  themeColor: string;
  tableId?: string;
  restaurantName: string;
  onClose: () => void;
  onDone: () => void;
}

export default function OrderSummaryScreen({
  entries, note, subtotal, themeColor, tableId, restaurantName, onClose, onDone,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleDone() {
    setConfirmed(true);
    setTimeout(onDone, 2000);
  }

  return (
    <div
      className={`fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-safe-top pt-6 pb-5 border-b border-white/[0.06]"
        style={{ background: `linear-gradient(to bottom, ${themeColor}18, transparent)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-1">
              {restaurantName}
            </p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              {confirmed ? "Order Placed! 🎉" : "Your Order"}
            </h1>
            {tableId && !confirmed && (
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-bold border"
                style={{ borderColor: `${themeColor}50`, backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                📍 Table {tableId}
              </div>
            )}
          </div>
          {!confirmed && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
          )}
        </div>

        {!confirmed && (
          <p className="text-sm text-zinc-500 mt-3">
            Show this screen to your server or at the counter
          </p>
        )}
      </div>

      {/* Confirmed state */}
      {confirmed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${themeColor}20`, border: `2px solid ${themeColor}` }}
          >
            ✓
          </div>
          <p className="text-white font-bold text-xl">Your waiter is on the way!</p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sit back and enjoy. We&apos;ll take it from here.
          </p>
        </div>
      ) : (
        <>
          {/* Order list */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4">
                {/* Qty bubble */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-black flex-shrink-0"
                  style={{ backgroundColor: themeColor }}
                >
                  {entry.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base truncate">{entry.name}</p>
                  <p className="text-zinc-500 text-sm">${entry.price.toFixed(2)} each</p>
                </div>
                <p className="text-white font-bold text-base flex-shrink-0">
                  ${(entry.price * entry.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            {/* Divider */}
            <div className="border-t border-white/[0.06] pt-3 mt-3">
              {note && (
                <div className="mb-4 bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Special Requests</p>
                  <p className="text-zinc-300 text-sm">{note}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white font-extrabold text-xl">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-zinc-600 text-xs mt-1">Payment at the table — your server will assist</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex-shrink-0 px-5 py-5 border-t border-white/[0.06] space-y-3">
            <button
              onClick={handleDone}
              className="w-full py-4 rounded-2xl font-extrabold text-black text-lg shadow-xl transition-transform active:scale-[0.98]"
              style={{ backgroundColor: themeColor, boxShadow: `0 8px 24px ${themeColor}55` }}
            >
              🔔 Call Waiter Now
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-semibold text-zinc-400 hover:text-white text-sm transition-colors"
            >
              ← Back to order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
