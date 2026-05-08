"use client";

import { useState } from "react";
import type { CartItem } from "./CartDrawer";

interface SuggestionItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface BoostSuggestion {
  id: string;
  reasoning: string;
  boostItem: SuggestionItem;
}

interface Props {
  suggestion: BoostSuggestion;
  themeColor: string;
  onAdd: (item: CartItem, qty: number) => void;
  onDismiss: () => void;
}

const SURFACE = "#1A1714";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT1   = "#F3EEE7";
const TEXT2   = "#998F83";

export default function CartBoostBanner({ suggestion, themeColor, onAdd, onDismiss }: Props) {
  const [added, setAdded] = useState(false);
  const tc = themeColor;

  function handleAdd() {
    setAdded(true);
    onAdd(
      { id: suggestion.boostItem.id, name: suggestion.boostItem.name, price: suggestion.boostItem.price, imageUrl: suggestion.boostItem.imageUrl },
      1
    );
    setTimeout(onDismiss, 1200);
  }

  return (
    <div className="fixed z-30 animate-in slide-in-from-bottom-4 duration-400"
      style={{ bottom: "76px", left: "12px", right: "12px", maxWidth: "calc(100vw - 24px)" }}>
      <div className="flex items-center gap-3 px-3 py-2.5"
        style={{ backgroundColor: SURFACE, borderRadius: "18px", border: `1px solid ${BORDER}`, boxShadow: "0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.20)" }}>

        {suggestion.boostItem.imageUrl ? (
          <img src={suggestion.boostItem.imageUrl} alt={suggestion.boostItem.name}
            className="object-cover flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "12px" }} />
        ) : (
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: `${tc}18`, fontSize: "20px" }}>
            🍽️
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold leading-tight truncate" style={{ fontSize: "13px", color: TEXT1 }}>{suggestion.boostItem.name}</p>
          <p className="mt-0.5 line-clamp-1" style={{ fontSize: "11px", color: TEXT2 }}>{suggestion.reasoning}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold" style={{ fontSize: "13px", color: tc }}>
            +${suggestion.boostItem.price.toFixed(2)}
          </span>
          {added ? (
            <span className="font-bold px-3 py-1.5 rounded-full" style={{ fontSize: "11px", color: "#22C55E", backgroundColor: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}>
              ✓ Added
            </span>
          ) : (
            <button
              onClick={handleAdd}
              className="font-bold px-3 py-1.5 rounded-full text-white transition-transform active:scale-95"
              style={{ fontSize: "12px", backgroundColor: tc }}
            >
              Add it
            </button>
          )}
          <button
            onClick={onDismiss}
            className="transition-colors p-0.5 leading-none"
            style={{ fontSize: "18px", color: TEXT2 }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
