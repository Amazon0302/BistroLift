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

export default function CartDrawer({
  entries, themeColor, tableId, restaurantName,
  combos = [], categoryNudges = [],
  onClose, onUpdateQty, onRemove, onClear, onAddToCart,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function quickAdd(item: CartItem) {
    onAddToCart?.(item, 1);
    setAddedIds((prev) => new Set([...prev, item.id]));
  }

  // ── Combo upsell: find a combo where ≥2 items are already in cart ────────
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

  // ── Category nudges: only show categories with no item in cart ────────────
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
        themeColor={themeColor}
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
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Drawer */}
      <div
        className={`relative bg-[#111] rounded-t-3xl flex flex-col max-h-[88vh] transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">Your Order</h2>
            <button onClick={close} className="text-zinc-500 hover:text-white text-sm transition-colors">
              Close
            </button>
          </div>
          {tableId && (
            <p className="text-xs text-zinc-500 mt-0.5">Table #{tableId}</p>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">🛒</p>
              <p className="text-zinc-400 font-medium">Your order is empty</p>
              <p className="text-zinc-600 text-sm mt-1">Tap any item to add it</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 bg-zinc-900 border border-white/[0.06] rounded-2xl p-3">
                {entry.imageUrl
                  ? <img src={entry.imageUrl} alt={entry.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 text-2xl">🍽️</div>}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{entry.name}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>
                    ${(entry.price * entry.quantity).toFixed(2)}
                  </p>
                </div>
                {/* Qty controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => entry.quantity <= 1 ? onRemove(entry.id) : onUpdateQty(entry.id, entry.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white text-base font-bold hover:bg-zinc-700 transition-colors"
                  >
                    {entry.quantity <= 1 ? "🗑" : "−"}
                  </button>
                  <span className="text-white font-bold text-sm w-4 text-center">{entry.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(entry.id, entry.quantity + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-base font-bold transition-colors"
                    style={{ backgroundColor: themeColor }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}

          {/* ── Combo upsell ── */}
          {comboUpsell && entries.length > 0 && (
            <div className="mt-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-3.5">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                🎁 Almost a combo!
              </p>
              <p className="text-white text-sm font-semibold leading-snug">
                {comboUpsell.combo.title}
              </p>
              <p className="text-zinc-400 text-xs mt-0.5 mb-3">{comboUpsell.combo.reasoning}</p>
              <div className="flex flex-col gap-2">
                {comboUpsell.missing.map((item) => {
                  const added = addedIds.has(item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-2.5">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        : <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 text-lg">🍽️</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                        <p className="text-zinc-500 text-xs">${item.price.toFixed(2)}</p>
                      </div>
                      {comboUpsell.savings > 0.01 && (
                        <span className="text-emerald-400 text-xs font-bold flex-shrink-0">
                          Save ${comboUpsell.savings.toFixed(2)}
                        </span>
                      )}
                      <button
                        onClick={() => quickAdd(item)}
                        disabled={added}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-60"
                        style={added ? { backgroundColor: "#22c55e22", color: "#4ade80" } : { backgroundColor: themeColor, color: "#000" }}
                      >
                        {added ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Drink / dessert nudges ── */}
          {activeNudges.length > 0 && entries.length > 0 && (
            <div className="mt-3">
              {activeNudges.map((nudge) => (
                <div key={nudge.categoryName} className="mb-3">
                  <p className="text-zinc-400 text-xs font-semibold mb-2">
                    {nudge.emoji ?? "🍹"} Add {nudge.categoryName}?
                  </p>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: "none" }}>
                    {nudge.items.slice(0, 5).map((item) => {
                      const added = addedIds.has(item.id) || cartIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex-shrink-0 w-28 bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden"
                        >
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} className="w-full h-16 object-cover" />
                            : <div className="w-full h-16 bg-zinc-800 flex items-center justify-center text-2xl">{nudge.emoji ?? "🍹"}</div>}
                          <div className="p-2">
                            <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{item.name}</p>
                            <p className="text-zinc-500 text-[10px] mt-0.5">${item.price.toFixed(2)}</p>
                            <button
                              onClick={() => quickAdd(item)}
                              disabled={added}
                              className="mt-1.5 w-full text-[11px] font-bold py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                              style={added ? { backgroundColor: "#22c55e22", color: "#4ade80" } : { backgroundColor: `${themeColor}22`, color: themeColor }}
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
            <div className="mt-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special requests? (allergies, preferences…)"
                rows={2}
                className="w-full bg-zinc-900 border border-white/[0.07] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Subtotal</span>
              <span className="text-white font-extrabold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSummary(true)}
                className="flex-1 py-3.5 rounded-xl font-bold text-black text-base transition-colors"
                style={{ backgroundColor: themeColor }}
              >
                🧾 Show to Waiter
              </button>
              <button
                onClick={() => setShowSummary(true)}
                className="px-4 py-3.5 rounded-xl font-bold text-white text-sm bg-zinc-800 border border-white/[0.08] hover:bg-zinc-700 transition-colors"
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
