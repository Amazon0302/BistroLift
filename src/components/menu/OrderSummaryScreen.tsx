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

const BG      = "#0F0D0A";
const SURFACE = "#1A1714";
const SURFACE2= "#211E1A";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT1   = "#F3EEE7";
const TEXT2   = "#998F83";
const TEXT3   = "#5E5852";

export default function OrderSummaryScreen({
  entries, note, subtotal, themeColor, tableId, restaurantName, onClose, onDone,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const tc = themeColor;

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleDone() {
    setConfirmed(true);
    setTimeout(onDone, 2200);
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ backgroundColor: BG }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-6 pb-5" style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold uppercase tracking-widest mb-1" style={{ fontSize: "11px", color: TEXT3 }}>
              {restaurantName}
            </p>
            <h1 className="font-bold leading-tight tracking-tight" style={{ fontSize: "24px", color: TEXT1, letterSpacing: "-0.4px" }}>
              {confirmed ? "Order Placed! 🎉" : "Your Order"}
            </h1>
            {tableId && !confirmed && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full font-bold" style={{ fontSize: "12px", backgroundColor: `${tc}18`, color: tc, border: `1px solid ${tc}28` }}>
                📍 Table {tableId}
              </div>
            )}
          </div>
          {!confirmed && (
            <button
              onClick={onClose}
              className="flex items-center justify-center transition-colors"
              style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: SURFACE2, color: TEXT2, fontSize: "14px", border: `1px solid ${BORDER}` }}
            >
              ✕
            </button>
          )}
        </div>

        {!confirmed && (
          <p className="font-medium mt-3" style={{ fontSize: "13px", color: TEXT2 }}>
            Show this screen to your server or at the counter
          </p>
        )}
      </div>

      {/* Confirmed state */}
      {confirmed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="flex items-center justify-center" style={{ width: "96px", height: "96px", borderRadius: "28px", backgroundColor: `${tc}18`, border: `2px solid ${tc}35`, fontSize: "40px", color: tc }}>
            ✓
          </div>
          <div>
            <p className="font-bold tracking-tight" style={{ fontSize: "22px", color: TEXT1, letterSpacing: "-0.3px" }}>Your waiter is on the way!</p>
            <p className="leading-relaxed mt-2" style={{ fontSize: "14px", color: TEXT2 }}>
              Sit back and enjoy. We&apos;ll take it from here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Order list */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 px-4 py-3"
                style={{ backgroundColor: SURFACE2, borderRadius: "16px", border: `1px solid ${BORDER}` }}>
                {/* Qty bubble */}
                <div className="flex items-center justify-center text-white flex-shrink-0" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: tc, fontSize: "14px", fontWeight: 800 }}>
                  {entry.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ fontSize: "14px", color: TEXT1 }}>{entry.name}</p>
                  <p className="mt-0.5" style={{ fontSize: "12px", color: TEXT2 }}>${entry.price.toFixed(2)} each</p>
                </div>
                <p className="font-bold flex-shrink-0" style={{ fontSize: "15px", color: TEXT1 }}>
                  ${(entry.price * entry.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            {/* Special note */}
            {note && (
              <div className="px-4 py-3" style={{ backgroundColor: SURFACE2, borderRadius: "16px", border: `1px solid ${BORDER}` }}>
                <p className="font-bold uppercase tracking-widest mb-1" style={{ fontSize: "11px", color: TEXT3 }}>Special Requests</p>
                <p style={{ fontSize: "13px", color: TEXT2 }}>{note}</p>
              </div>
            )}

            {/* Subtotal */}
            <div className="px-4 py-4" style={{ backgroundColor: SURFACE2, borderRadius: "16px", border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ fontSize: "14px", color: TEXT2 }}>Subtotal</span>
                <span className="font-bold tracking-tight" style={{ fontSize: "24px", color: TEXT1, letterSpacing: "-0.5px" }}>${subtotal.toFixed(2)}</span>
              </div>
              <p className="mt-1" style={{ fontSize: "12px", color: TEXT3 }}>Payment at the table — your server will assist</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex-shrink-0 px-5 py-5 space-y-3" style={{ backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}` }}>
            <button
              onClick={handleDone}
              className="w-full rounded-full font-bold text-white transition-transform active:scale-[0.98]"
              style={{ paddingTop: "16px", paddingBottom: "16px", fontSize: "16px", backgroundColor: tc, boxShadow: `0 8px 24px ${tc}44` }}
            >
              🔔 Call Waiter Now
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-full font-semibold transition-colors"
              style={{ paddingTop: "12px", paddingBottom: "12px", fontSize: "14px", color: TEXT2, backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}
            >
              ← Back to order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
