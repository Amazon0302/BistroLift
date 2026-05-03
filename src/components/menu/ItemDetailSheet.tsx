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

const BADGE_CONFIG: Record<string, { label: string; emoji: string; bg: string }> = {
  popular: { label: "Bestseller",  emoji: "🔥", bg: "bg-red-500/80"    },
  chef:    { label: "Chef's Pick", emoji: "👨‍🍳", bg: "bg-amber-500/80"  },
  new:     { label: "New",         emoji: "✨", bg: "bg-purple-500/80" },
  spicy:   { label: "Spicy",       emoji: "🌶️", bg: "bg-orange-500/80" },
  vegan:   { label: "Vegan",       emoji: "🌿", bg: "bg-green-500/80"  },
};

export default function ItemDetailSheet({
  item, allSuggestions, themeColor, onClose, onAddToCart, onViewCombo, onViewItem, cartQty,
}: Props) {
  const [qty, setQty] = useState(Math.max(1, cartQty));
  const [visible, setVisible] = useState(false);

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
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={`relative bg-[#111] rounded-t-3xl overflow-hidden max-h-[92vh] flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* ── Image ── */}
        <div className="relative h-64 flex-shrink-0 overflow-hidden">
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-7xl">🍽️</div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />

          <button
            onClick={close}
            className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-lg border border-white/10"
          >
            ✕
          </button>

          {item.badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
              {item.badges.map((badge) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                return (
                  <span key={badge} className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white backdrop-blur-sm ${cfg.bg}`}>
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-white leading-tight">{item.name}</h2>
              <span className="text-2xl font-extrabold flex-shrink-0" style={{ color: themeColor }}>
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 pt-4 pb-6 space-y-6">

            {item.description && (
              <p className="text-zinc-300 text-sm leading-relaxed">{item.description}</p>
            )}

            {/* Ingredients */}
            {(item.ingredients ?? []).length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-2.5">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(item.ingredients ?? []).map((ing) => (
                    <span key={ing} className="text-xs text-zinc-300 bg-zinc-800/70 border border-white/[0.07] px-3 py-1.5 rounded-full">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade nudge */}
            {upgrade && upgrade.comboPrice != null && upgrade.comboPrice > 0 && (
              <div
                className="flex items-center gap-3 p-3.5 rounded-2xl border"
                style={{ borderColor: `${themeColor}40`, backgroundColor: `${themeColor}10` }}
              >
                <span className="text-2xl">⬆️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{upgrade.title}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{upgrade.reasoning}</p>
                </div>
                <span className="text-sm font-extrabold flex-shrink-0" style={{ color: themeColor }}>
                  +${upgrade.comboPrice.toFixed(2)}
                </span>
              </div>
            )}

            {/* ── Combo deals — CLICKABLE ── */}
            {relatedCombos.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-3">
                  🎁 Best Value Deals
                </h3>
                <div className="space-y-3">
                  {relatedCombos.map((combo) => {
                    const originalTotal = combo.items.reduce((s, i) => s + i.price, 0);
                    const savings = combo.comboPrice != null ? originalTotal - combo.comboPrice : 0;
                    const savingsPct = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
                    return (
                      <button
                        key={combo.id}
                        onClick={() => onViewCombo(combo)}
                        className="w-full text-left bg-zinc-900 border border-white/[0.07] rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
                      >
                        {/* Split mini images */}
                        {combo.items.some((i) => i.imageUrl) && (
                          <div className="flex h-20 relative">
                            {combo.items.slice(0, 3).map((ci, idx) => (
                              <div key={ci.id} className="flex-1 overflow-hidden relative">
                                {ci.imageUrl
                                  ? <img src={ci.imageUrl} alt={ci.name} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full bg-zinc-800" />}
                                {idx < combo.items.length - 1 && (
                                  <div className="absolute top-0 right-0 bottom-0 w-px bg-black/40" />
                                )}
                              </div>
                            ))}
                            {/* Savings badge */}
                            {savings > 0.01 && (
                              <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow">
                                Save ${savings.toFixed(2)}
                              </span>
                            )}
                            {/* Tap hint */}
                            <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                              View deal →
                            </span>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-white font-bold text-sm">{combo.title}</p>
                              <p className="text-zinc-500 text-[11px] mt-0.5">{combo.reasoning}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {combo.items.map((ci) => (
                                  <span key={ci.id} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">
                                    {ci.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="font-extrabold text-base" style={{ color: themeColor }}>
                                ${combo.comboPrice?.toFixed(2)}
                              </p>
                              {savings > 0.01 && (
                                <>
                                  <p className="text-[11px] text-zinc-500 line-through">${originalTotal.toFixed(2)}</p>
                                  <p className="text-[11px] font-bold text-emerald-400">{savingsPct}% off</p>
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

            {/* ── Pairs well with — CLICKABLE ── */}
            {relatedAddons.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-3">
                  Pairs Well With
                </h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: "none" }}>
                  {relatedAddons.map((addon) => {
                    const partner = addon.items.find((i) => i.id !== item.id);
                    if (!partner) return null;
                    return (
                      <button
                        key={addon.id}
                        onClick={() => onViewItem(partner)}
                        className="flex-shrink-0 flex items-center gap-2.5 bg-zinc-900 border border-white/[0.07] rounded-2xl px-3 py-2.5 min-w-0 active:scale-95 transition-transform text-left"
                      >
                        {partner.imageUrl
                          ? <img src={partner.imageUrl} alt={partner.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          : <div className="w-12 h-12 rounded-xl bg-zinc-700 flex items-center justify-center flex-shrink-0 text-xl">🍽️</div>}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-[90px]">{partner.name}</p>
                          <p className="text-xs font-extrabold mt-0.5" style={{ color: themeColor }}>
                            ${partner.price.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-zinc-500 leading-snug truncate max-w-[90px] mt-0.5">
                            {addon.reasoning}
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-1 font-medium">Tap to view →</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>

        {/* ── Sticky CTA ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.06] bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-white text-lg font-bold rounded-lg hover:bg-zinc-700 transition-colors"
              >
                −
              </button>
              <span className="w-5 text-center text-white font-bold text-base">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-white text-lg font-bold rounded-lg hover:bg-zinc-700 transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 py-3 rounded-xl font-bold text-base text-black transition-colors active:scale-[0.98]"
              style={{ backgroundColor: themeColor }}
            >
              Add to Order · ${(item.price * qty).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
