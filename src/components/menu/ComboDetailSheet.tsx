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

const BG      = "#0F0D0A";
const SURFACE = "#1A1714";
const SURFACE2= "#211E1A";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT1   = "#F3EEE7";
const TEXT2   = "#998F83";
const TEXT3   = "#5E5852";

export default function ComboDetailSheet({ combo, themeColor, onClose, onAddToCart }: Props) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const tc = themeColor;

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
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={`relative overflow-hidden flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ backgroundColor: SURFACE, borderRadius: "28px 28px 0 0", maxHeight: "90vh" }}
      >
        {/* Drag handle */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* Image mosaic */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "200px" }}>
          <div className="flex h-full">
            {combo.items.slice(0, 3).map((item, idx) => (
              <div key={item.id} className="flex-1 overflow-hidden relative">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tc}22, ${tc}0C)`, fontSize: "32px" }}>🍽️</div>
                  )}
                {idx < combo.items.length - 1 && idx < 2 && (
                  <div className="absolute top-0 right-0 bottom-0 w-px" style={{ backgroundColor: BORDER }} />
                )}
              </div>
            ))}
          </div>
          {/* Gradient */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${SURFACE} 0%, rgba(26,23,20,0.20) 40%, transparent 100%)` }} />

          {/* Close */}
          <button
            onClick={close}
            className="absolute flex items-center justify-center transition-colors"
            style={{ top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(15,13,10,0.70)", backdropFilter: "blur(10px)", border: `1px solid ${BORDER}`, fontSize: "14px", color: TEXT2 }}
          >
            ✕
          </button>

          {/* Savings badge */}
          {savings > 0.01 && (
            <div className="absolute" style={{ top: "16px", left: "16px" }}>
              <span className="text-white font-bold px-3 py-1 rounded-full" style={{ fontSize: "11px", backgroundColor: "#22C55E", boxShadow: "0 2px 8px rgba(34,197,94,0.35)" }}>
                🎁 Save {savingsPct}% · ${savings.toFixed(2)} off
              </span>
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <p className="font-bold uppercase tracking-widest mb-1" style={{ fontSize: "11px", color: TEXT3 }}>Combo Deal</p>
            <h2 className="font-bold leading-tight tracking-tight" style={{ fontSize: "22px", color: TEXT1, letterSpacing: "-0.4px" }}>{combo.title}</h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ backgroundColor: BG }}>
          <div className="px-5 pt-3 pb-4 space-y-5">
            <p className="leading-relaxed italic" style={{ fontSize: "14px", color: TEXT2 }}>&ldquo;{combo.reasoning}&rdquo;</p>

            {/* What's included */}
            <div>
              <h3 className="font-bold uppercase tracking-widest mb-3" style={{ fontSize: "11px", color: TEXT3 }}>What&apos;s included</h3>
              <div className="space-y-2.5">
                {combo.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3"
                    style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: "14px" }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="object-cover flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "10px" }} />
                      : (
                        <div className="flex items-center justify-center flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "10px", background: `${tc}18`, fontSize: "20px" }}>🍽️</div>
                      )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" style={{ fontSize: "13px", color: TEXT1 }}>{item.name}</p>
                      <p style={{ fontSize: "12px", color: TEXT3, marginTop: "2px" }}>Individually ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-center text-white flex-shrink-0" style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: tc, fontSize: "12px", fontWeight: 700 }}>
                      ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="p-4 space-y-3" style={{ backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: "16px" }}>
              <div className="flex items-center justify-between" style={{ fontSize: "13px" }}>
                <span className="font-medium" style={{ color: TEXT2 }}>Regular price</span>
                <span className="line-through" style={{ color: TEXT3 }}>${originalTotal.toFixed(2)}</span>
              </div>

              {savings > 0.01 && (
                <div className="flex items-center justify-between" style={{ fontSize: "13px" }}>
                  <span className="font-bold" style={{ color: "#22C55E" }}>You save</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded-full" style={{ fontSize: "10px", backgroundColor: "rgba(34,197,94,0.15)", color: "#22C55E" }}>{savingsPct}% off</span>
                    <span className="font-bold" style={{ color: "#22C55E" }}>${savings.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="h-px" style={{ backgroundColor: BORDER }} />

              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ fontSize: "14px", color: TEXT1 }}>Combo price</span>
                <span className="font-bold tracking-tight" style={{ fontSize: "26px", color: tc, letterSpacing: "-0.5px" }}>
                  ${combo.comboPrice?.toFixed(2) ?? originalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-5 py-4" style={{ backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={handleAdd}
            disabled={added}
            className="w-full rounded-full font-bold text-white transition-all active:scale-[0.98]"
            style={{
              paddingTop: "16px",
              paddingBottom: "16px",
              fontSize: "16px",
              backgroundColor: added ? "#10b981" : tc,
              boxShadow: `0 8px 24px ${added ? "#10b98144" : tc + "44"}`,
            }}
          >
            {added ? "✓ Added to Order!" : `Add Combo · $${combo.comboPrice?.toFixed(2) ?? originalTotal.toFixed(2)}`}
          </button>
          {savings > 0.01 && !added && (
            <p className="text-center font-semibold mt-2" style={{ fontSize: "12px", color: "#22C55E" }}>
              You&apos;re saving ${savings.toFixed(2)} with this deal
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
