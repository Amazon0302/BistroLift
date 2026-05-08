"use client";

import { useState, useEffect } from "react";
import OrderSummaryScreen from "./OrderSummaryScreen";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface CartEntry extends CartItem {
  quantity: number;
  note?: string;
}

export interface ComboSuggestion {
  id: string;
  title: string;
  reasoning: string;
  items: CartItem[];
  comboPrice: number | null;
}

export interface CategoryNudge {
  categoryName: string;
  emoji: string | null;
  items: CartItem[];
}

interface Props {
  entries: CartEntry[];
  themeColor: string;
  tableId?: string;
  restaurantName: string;
  combos?: ComboSuggestion[];
  categoryNudges?: CategoryNudge[];
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onAddToCart?: (item: CartItem, qty: number) => void;
}

const BG      = "#0F0D0A";
const SURFACE = "#1A1714";
const SURFACE2= "#211E1A";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT1   = "#F3EEE7";
const TEXT2   = "#998F83";
const TEXT3   = "#5E5852";

export default function CartDrawer({
  entries, themeColor, tableId, restaurantName,
  combos = [], categoryNudges = [],
  onClose, onUpdateQty, onRemove, onClear, onAddToCart,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const tc = themeColor;

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function quickAdd(item: CartItem) {
    onAddToCart?.(item, 1);
    setAddedIds((prev) => new Set([...prev, item.id]));
  }

  const cartIds = new Set(entries.map((e) => e.id));

  const comboUpsell = (() => {
    for (const combo of combos) {
      const inCart  = combo.items.filter((i) => cartIds.has(i.id));
      const missing = combo.items.filter((i) => !cartIds.has(i.id));
      if (inCart.length >= 2 && missing.length >= 1) {
        const originalTotal = combo.items.reduce((s, i) => s + i.price, 0);
        const savings = combo.comboPrice != null ? originalTotal - combo.comboPrice : 0;
        return { combo, missing, savings };
      }
    }
    return null;
  })();

  const activeNudges = categoryNudges.filter(
    (n) => !n.items.some((i) => cartIds.has(i.id))
  );

  function close() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  const subtotal = entries.reduce((sum, e) => sum + e.price * e.quantity, 0);

  if (showSummary) {
    return (
      <OrderSummaryScreen
        entries={entries}
        note={note}
        subtotal={subtotal}
        themeColor={tc}
        tableId={tableId}
        restaurantName={restaurantName}
        onClose={() => setShowSummary(false)}
        onDone={() => { onClear(); close(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={close}
      />

      {/* Drawer */}
      <div
        className={`relative flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ backgroundColor: SURFACE, borderRadius: "28px 28px 0 0", maxHeight: "88vh" }}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-3 pb-3 border-b" style={{ borderColor: BORDER }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold tracking-tight" style={{ fontSize: "18px", color: TEXT1, letterSpacing: "-0.3px" }}>Your Order</h2>
              {tableId && <p className="mt-0.5 font-medium" style={{ fontSize: "12px", color: TEXT3 }}>Table #{tableId}</p>}
            </div>
            <button onClick={close} className="font-semibold transition-colors" style={{ fontSize: "13px", color: TEXT2 }}>
              Close
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3" style={{ backgroundColor: BG }}>
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p style={{ fontSize: "48px" }}>🛒</p>
              <p className="font-bold mt-3" style={{ fontSize: "15px", color: TEXT1 }}>Your order is empty</p>
              <p className="mt-1" style={{ fontSize: "13px", color: TEXT2 }}>Tap any item to add it</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-3"
                style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: "16px" }}>
                {entry.imageUrl
                  ? <img src={entry.imageUrl} alt={entry.name} className="object-cover flex-shrink-0" style={{ width: "56px", height: "56px", borderRadius: "12px" }} />
                  : (
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "56px", height: "56px", borderRadius: "12px", background: `${tc}15`, fontSize: "22px" }}>
                      🍽️
                    </div>
                  )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ fontSize: "13px", color: TEXT1 }}>{entry.name}</p>
                  <p className="font-bold mt-0.5" style={{ fontSize: "13px", color: tc }}>
                    ${(entry.price * entry.quantity).toFixed(2)}
                  </p>
                </div>
                {/* Qty controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => entry.quantity <= 1 ? onRemove(entry.id) : onUpdateQty(entry.id, entry.quantity - 1)}
                    className="flex items-center justify-center font-bold"
                    style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: SURFACE, border: `1px solid ${BORDER}`, fontSize: "14px", color: TEXT2 }}
                  >
                    {entry.quantity <= 1 ? "🗑" : "−"}
                  </button>
                  <span className="font-bold text-center" style={{ width: "16px", fontSize: "14px", color: TEXT1 }}>{entry.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(entry.id, entry.quantity + 1)}
                    className="flex items-center justify-center text-white font-bold"
                    style={{ width: "32px", height: "32px", borderRadius: "10px", fontSize: "18px", backgroundColor: tc }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Combo upsell */}
          {comboUpsell && entries.length > 0 && (
            <div className="p-3.5 rounded-2xl" style={{ border: "1px solid rgba(217,119,6,0.30)", backgroundColor: "rgba(217,119,6,0.10)" }}>
              <p className="font-bold uppercase tracking-wider mb-2" style={{ fontSize: "11px", color: "#F59E0B" }}>🎁 Almost a combo!</p>
              <p className="font-bold leading-snug" style={{ fontSize: "13px", color: TEXT1 }}>{comboUpsell.combo.title}</p>
              <p className="mt-0.5 mb-3" style={{ fontSize: "12px", color: TEXT2 }}>{comboUpsell.combo.reasoning}</p>
              <div className="flex flex-col gap-2">
                {comboUpsell.missing.map((item) => {
                  const added = addedIds.has(item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-2.5">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="object-cover flex-shrink-0" style={{ width: "40px", height: "40px", borderRadius: "10px" }} />
                        : <div className="flex items-center justify-center flex-shrink-0" style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(217,119,6,0.15)", fontSize: "16px" }}>🍽️</div>}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate" style={{ fontSize: "12px", color: TEXT1 }}>{item.name}</p>
                        <p style={{ fontSize: "11px", color: TEXT2 }}>${item.price.toFixed(2)}</p>
                      </div>
                      {comboUpsell.savings > 0.01 && (
                        <span className="font-bold flex-shrink-0" style={{ fontSize: "11px", color: "#22C55E" }}>
                          Save ${comboUpsell.savings.toFixed(2)}
                        </span>
                      )}
                      <button
                        onClick={() => quickAdd(item)}
                        disabled={added}
                        className="flex-shrink-0 font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-60"
                        style={added
                          ? { backgroundColor: "rgba(34,197,94,0.15)", color: "#22C55E", fontSize: "12px", border: "1px solid rgba(34,197,94,0.25)" }
                          : { backgroundColor: tc, color: "#fff", fontSize: "12px" }}
                      >
                        {added ? "✓" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drink / dessert nudges */}
          {activeNudges.length > 0 && entries.length > 0 && (
            <div>
              {activeNudges.map((nudge) => (
                <div key={nudge.categoryName} className="mb-3">
                  <p className="font-semibold mb-2" style={{ fontSize: "12px", color: TEXT2 }}>
                    {nudge.emoji ?? "🍹"} Add {nudge.categoryName}?
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {nudge.items.slice(0, 5).map((item) => {
                      const added = addedIds.has(item.id) || cartIds.has(item.id);
                      return (
                        <div key={item.id} className="flex-shrink-0 overflow-hidden"
                          style={{ width: "112px", backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: "14px" }}>
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} className="w-full object-cover" style={{ height: "64px" }} />
                            : (
                              <div className="w-full flex items-center justify-center" style={{ height: "64px", background: `${tc}15`, fontSize: "24px" }}>
                                {nudge.emoji ?? "🍹"}
                              </div>
                            )}
                          <div className="p-2">
                            <p className="font-bold leading-tight line-clamp-2" style={{ fontSize: "11px", color: TEXT1 }}>{item.name}</p>
                            <p className="mt-0.5" style={{ fontSize: "10px", color: TEXT2 }}>${item.price.toFixed(2)}</p>
                            <button
                              onClick={() => quickAdd(item)}
                              disabled={added}
                              className="mt-1.5 w-full font-bold py-1 rounded-full transition-all active:scale-95 disabled:opacity-50"
                              style={added
                                ? { backgroundColor: "rgba(34,197,94,0.15)", color: "#22C55E", fontSize: "11px" }
                                : { backgroundColor: tc, color: "#fff", fontSize: "11px" }}
                            >
                              {added ? "✓" : "+"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special requests */}
          {entries.length > 0 && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special requests? (allergies, preferences…)"
              rows={2}
              className="w-full focus:outline-none resize-none transition-colors"
              style={{
                backgroundColor: SURFACE2,
                border: `1px solid ${BORDER}`,
                borderRadius: "14px",
                padding: "12px 16px",
                fontSize: "13px",
                color: TEXT1,
              }}
            />
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="flex-shrink-0 px-5 py-4 space-y-3" style={{ backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ fontSize: "14px", color: TEXT2 }}>Subtotal</span>
              <span className="font-bold tracking-tight" style={{ fontSize: "22px", color: TEXT1, letterSpacing: "-0.4px" }}>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSummary(true)}
                className="flex-1 rounded-full font-bold text-white transition-all active:scale-[0.98]"
                style={{ paddingTop: "14px", paddingBottom: "14px", fontSize: "15px", backgroundColor: tc, boxShadow: `0 6px 20px ${tc}44` }}
              >
                🧾 Show to Waiter
              </button>
              <button
                onClick={() => setShowSummary(true)}
                className="rounded-full font-bold transition-colors"
                style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px", fontSize: "13px", color: TEXT2, backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}
              >
                🔔 Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
