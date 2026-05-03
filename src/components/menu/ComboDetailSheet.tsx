"use client";

import { useState, useEffect } from "react";
import type { CartItem } from "./CartDrawer";

interface ComboItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface Combo {
  id: string;
  title: string;
  reasoning: string;
  items: ComboItem[];
  comboPrice: number | null;
}

interface Props {
  combo: Combo;
  themeColor: string;
  onClose: () => void;
  onAddToCart: (items: CartItem[], comboTitle: string) => void;
}

export default function ComboDetailSheet({ combo, themeColor, onClose, onAddToCart }: Props) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  const originalTotal = combo.items.reduce((s, i) => s + i.price, 0);
  const savings = combo.comboPrice != null ? originalTotal - combo.comboPrice : 0;
  const savingsPct = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  function handleAdd() {
    onAddToCart(
      combo.items.map((i) => ({ id: i.id, name: i.name, price: i.price, imageUrl: i.imageUrl })),
      combo.title
    );
    setAdded(true);
    setTimeout(close, 900);
  }

  return (
    <div className="fixed inset-0 z-[55] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={`relative bg-[#111] rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* ── Image mosaic ── */}
        <div className="relative h-52 flex-shrink-0 flex overflow-hidden">
          {combo.items.slice(0, 3).map((item, idx) => (
            <div key={item.id} className="flex-1 overflow-hidden relative">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl">🍽️</div>}
              {/* Vertical dividers */}
              {idx < combo.items.length - 1 && idx < 2 && (
                <div className="absolute top-0 right-0 bottom-0 w-px bg-black/40" />
              )}
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent" />

          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
          >
            ✕
          </button>

          {/* Savings badge on image */}
          {savings > 0.01 && (
            <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
              <span className="bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                🎁 Save {savingsPct}% · ${savings.toFixed(2)} off
              </span>
            </div>
          )}

          {/* Title on image */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <p className="text-xs uppercase tracking-widest font-semibold text-zinc-400 mb-1">Combo Deal</p>
            <h2 className="text-2xl font-extrabold text-white leading-tight">{combo.title}</h2>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 pt-4 pb-4 space-y-5">

            {/* Reasoning */}
            <p className="text-zinc-400 text-sm leading-relaxed italic">&ldquo;{combo.reasoning}&rdquo;</p>

            {/* Item list */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-3">
                What&apos;s included
              </h3>
              <div className="space-y-2.5">
                {combo.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-zinc-900 border border-white/[0.06] rounded-2xl p-2.5">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xl">🍽️</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Individually ${item.price.toFixed(2)}</p>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-black"
                      style={{ backgroundColor: themeColor }}
                    >
                      ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Pricing breakdown ── */}
            <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-4 space-y-3">
              {/* Individual total */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Regular price</span>
                <span className="text-zinc-500 line-through">${originalTotal.toFixed(2)}</span>
              </div>

              {/* Savings line */}
              {savings > 0.01 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-semibold">You save</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/15 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {savingsPct}% off
                    </span>
                    <span className="text-emerald-400 font-extrabold">${savings.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Combo price */}
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">Combo price</span>
                <span className="text-2xl font-extrabold" style={{ color: themeColor }}>
                  ${combo.comboPrice?.toFixed(2) ?? originalTotal.toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── CTA ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.06] bg-[#111]">
          <button
            onClick={handleAdd}
            disabled={added}
            className="w-full py-4 rounded-2xl font-extrabold text-black text-base transition-all active:scale-[0.98] disabled:opacity-70"
            style={{
              backgroundColor: added ? "#10b981" : themeColor,
              boxShadow: `0 8px 24px ${added ? "#10b98155" : themeColor + "55"}`,
            }}
          >
            {added ? "✓ Added to Order!" : `Add Combo · $${combo.comboPrice?.toFixed(2) ?? originalTotal.toFixed(2)}`}
          </button>
          {savings > 0.01 && !added && (
            <p className="text-center text-emerald-400 text-xs font-semibold mt-2">
              You&apos;re saving ${savings.toFixed(2)} with this deal
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
