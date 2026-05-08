"use client";

import { useState, useEffect } from "react";
import type { CartItem } from "./CartDrawer";
import type { Combo } from "./ComboDetailSheet";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  badges: string[];
  ingredients?: string[];
}

interface SuggestionItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface Suggestion {
  id: string;
  type: string;
  title: string;
  reasoning: string;
  items: SuggestionItem[];
  comboPrice: number | null;
}

interface Props {
  item: MenuItem;
  allSuggestions: Suggestion[];
  themeColor: string;
  onClose: () => void;
  onAddToCart: (item: CartItem, qty: number) => void;
  onViewCombo: (combo: Combo) => void;
  onViewItem: (item: SuggestionItem) => void;
  cartQty: number;
}

const BADGE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  popular: { label: "Bestseller",  emoji: "🔥", color: "#EF4444" },
  chef:    { label: "Chef's Pick", emoji: "👨‍🍳", color: "#F59E0B" },
  new:     { label: "New",         emoji: "✨", color: "#8B5CF6" },
  spicy:   { label: "Spicy",       emoji: "🌶️", color: "#F97316" },
  vegan:   { label: "Vegan",       emoji: "🌿", color: "#22C55E" },
};

const BG      = "#0F0D0A";
const SURFACE = "#1A1714";
const SURFACE2= "#211E1A";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT1   = "#F3EEE7";
const TEXT2   = "#998F83";
const TEXT3   = "#5E5852";

export default function ItemDetailSheet({
  item, allSuggestions, themeColor, onClose, onAddToCart, onViewCombo, onViewItem, cartQty,
}: Props) {
  const [qty, setQty] = useState(Math.max(1, cartQty));
  const [visible, setVisible] = useState(false);
  const tc = themeColor;

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  const relatedCombos = allSuggestions.filter(
    (s) => s.type === "combo" && s.items.some((si) => si.id === item.id)
  );
  const relatedAddons = allSuggestions.filter(
    (s) => s.type === "addon" && s.items.some((si) => si.id === item.id)
  );
  const upgrade = allSuggestions.find(
    (s) => s.type === "upgrade" && s.items[0]?.id === item.id
  );

  function handleAdd() {
    onAddToCart({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl }, qty);
    close();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={`relative flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ backgroundColor: SURFACE, borderRadius: "28px 28px 0 0", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Drag handle */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* ── Image ── */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "280px" }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ fontSize: "80px", background: `linear-gradient(135deg, ${tc}22, ${tc}0C)` }}>
              🍽️
            </div>
          )}
          {/* Gradient fade to surface */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${SURFACE} 0%, rgba(26,23,20,0.15) 45%, transparent 100%)` }} />

          {/* Close */}
          <button
            onClick={close}
            className="absolute flex items-center justify-center font-medium transition-colors"
            style={{ top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(15,13,10,0.70)", backdropFilter: "blur(12px)", border: `1px solid ${BORDER}`, fontSize: "14px", color: TEXT2 }}
          >
            ✕
          </button>

          {/* Badges */}
          {item.badges.length > 0 && (
            <div className="absolute flex flex-wrap gap-1.5" style={{ top: "16px", left: "16px" }}>
              {item.badges.map((badge) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                return (
                  <span key={badge} className="font-bold px-2.5 py-1 rounded-full leading-none"
                    style={{ fontSize: "11px", backgroundColor: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}35` }}>
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Name + price overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-bold leading-tight tracking-tight" style={{ fontSize: "22px", color: TEXT1, letterSpacing: "-0.4px" }}>{item.name}</h2>
              <span className="font-bold flex-shrink-0" style={{ fontSize: "22px", color: tc }}>
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ backgroundColor: BG }}>
          <div className="px-5 pt-4 pb-6 space-y-5">

            {item.description && (
              <p className="leading-relaxed" style={{ fontSize: "14px", color: TEXT2 }}>{item.description}</p>
            )}

            {/* Ingredients */}
            {(item.ingredients ?? []).length > 0 && (
              <div>
                <h3 className="font-bold uppercase tracking-widest mb-2.5" style={{ fontSize: "11px", color: TEXT3 }}>Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {(item.ingredients ?? []).map((ing) => (
                    <span key={ing} className="font-medium px-3 py-1.5 rounded-full"
                      style={{ fontSize: "12px", color: TEXT1, backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}>
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade nudge */}
            {upgrade && upgrade.comboPrice != null && upgrade.comboPrice > 0 && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ border: `1px solid ${tc}28`, backgroundColor: `${tc}0C` }}>
                <span style={{ fontSize: "22px" }}>⬆️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold" style={{ fontSize: "13px", color: TEXT1 }}>{upgrade.title}</p>
                  <p className="mt-0.5" style={{ fontSize: "12px", color: TEXT3 }}>{upgrade.reasoning}</p>
                </div>
                <span className="font-bold flex-shrink-0" style={{ fontSize: "14px", color: tc }}>+${upgrade.comboPrice.toFixed(2)}</span>
              </div>
            )}

            {/* Combo deals */}
            {relatedCombos.length > 0 && (
              <div>
                <h3 className="font-bold uppercase tracking-widest mb-3" style={{ fontSize: "11px", color: TEXT3 }}>🎁 Best Value Deals</h3>
                <div className="space-y-2.5">
                  {relatedCombos.map((combo) => {
                    const originalTotal = combo.items.reduce((s, i) => s + i.price, 0);
                    const savings = combo.comboPrice != null ? originalTotal - combo.comboPrice : 0;
                    const savingsPct = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
                    return (
                      <button
                        key={combo.id}
                        onClick={() => onViewCombo(combo)}
                        className="w-full text-left overflow-hidden active:scale-[0.98] transition-transform"
                        style={{ borderRadius: "16px", backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}
                      >
                        {combo.items.some((i) => i.imageUrl) && (
                          <div className="flex relative" style={{ height: "76px" }}>
                            {combo.items.slice(0, 3).map((ci, idx) => (
                              <div key={ci.id} className="flex-1 overflow-hidden relative">
                                {ci.imageUrl
                                  ? <img src={ci.imageUrl} alt={ci.name} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-xl" style={{ backgroundColor: SURFACE }}>🍽️</div>}
                                {idx < combo.items.length - 1 && (
                                  <div className="absolute top-0 right-0 bottom-0 w-px" style={{ backgroundColor: BORDER }} />
                                )}
                              </div>
                            ))}
                            {savings > 0.01 && (
                              <span className="absolute top-2 left-2 text-white font-bold px-2 py-0.5 rounded-full" style={{ fontSize: "10px", backgroundColor: "#22C55E" }}>
                                Save ${savings.toFixed(2)}
                              </span>
                            )}
                            <span className="absolute top-2 right-2 font-medium px-2 py-0.5 rounded-full" style={{ fontSize: "10px", color: TEXT2, backgroundColor: "rgba(15,13,10,0.70)", border: `1px solid ${BORDER}` }}>
                              View →
                            </span>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-bold" style={{ fontSize: "13px", color: TEXT1 }}>{combo.title}</p>
                              <p className="mt-0.5" style={{ fontSize: "11px", color: TEXT3 }}>{combo.reasoning}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {combo.items.map((ci) => (
                                  <span key={ci.id} className="font-medium px-1.5 py-0.5 rounded-md"
                                    style={{ fontSize: "10px", color: TEXT2, backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
                                    {ci.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="font-bold" style={{ fontSize: "15px", color: tc }}>${combo.comboPrice?.toFixed(2)}</p>
                              {savings > 0.01 && (
                                <>
                                  <p className="line-through" style={{ fontSize: "11px", color: TEXT3 }}>${originalTotal.toFixed(2)}</p>
                                  <p className="font-bold" style={{ fontSize: "11px", color: "#22C55E" }}>{savingsPct}% off</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pairs well with */}
            {relatedAddons.length > 0 && (
              <div>
                <h3 className="font-bold uppercase tracking-widest mb-3" style={{ fontSize: "11px", color: TEXT3 }}>Pairs Well With</h3>
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {relatedAddons.map((addon) => {
                    const partner = addon.items.find((i) => i.id !== item.id);
                    if (!partner) return null;
                    return (
                      <button
                        key={addon.id}
                        onClick={() => onViewItem(partner)}
                        className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 text-left active:scale-95 transition-transform"
                        style={{ borderRadius: "14px", backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}
                      >
                        {partner.imageUrl
                          ? <img src={partner.imageUrl} alt={partner.name} className="object-cover flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "10px" }} />
                          : <div className="flex items-center justify-center flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "10px", backgroundColor: SURFACE, fontSize: "20px" }}>🍽️</div>}
                        <div className="min-w-0">
                          <p className="font-bold truncate" style={{ fontSize: "12px", color: TEXT1, maxWidth: "90px" }}>{partner.name}</p>
                          <p className="font-bold mt-0.5" style={{ fontSize: "12px", color: tc }}>${partner.price.toFixed(2)}</p>
                          <p className="leading-snug truncate mt-0.5" style={{ fontSize: "10px", color: TEXT3, maxWidth: "90px" }}>{addon.reasoning}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="h-2" />
          </div>
        </div>

        {/* ── Sticky CTA ── */}
        <div className="flex-shrink-0 px-5 py-4" style={{ backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            {/* Qty control */}
            <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex items-center justify-center font-bold rounded-full"
                style={{ width: "28px", height: "28px", fontSize: "18px", color: TEXT1 }}>
                −
              </button>
              <span className="text-center font-bold" style={{ width: "20px", fontSize: "15px", color: TEXT1 }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}
                className="flex items-center justify-center font-bold rounded-full"
                style={{ width: "28px", height: "28px", fontSize: "18px", color: TEXT1 }}>
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 rounded-full font-bold text-white transition-all active:scale-[0.98]"
              style={{ paddingTop: "14px", paddingBottom: "14px", fontSize: "15px", backgroundColor: tc, boxShadow: `0 6px 20px ${tc}44` }}
            >
              Add to Order · ${(item.price * qty).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
