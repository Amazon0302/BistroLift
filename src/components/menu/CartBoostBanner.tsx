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

export default function CartBoostBanner({ suggestion, themeColor, onAdd, onDismiss }: Props) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    setAdded(true);
    onAdd(
      {
        id: suggestion.boostItem.id,
        name: suggestion.boostItem.name,
        price: suggestion.boostItem.price,
        imageUrl: suggestion.boostItem.imageUrl,
      },
      1
    );
    setTimeout(onDismiss, 1200);
  }

  return (
    <div
      className="fixed bottom-[4.5rem] left-3 right-3 z-30 animate-in slide-in-from-bottom-4 duration-400"
      style={{ maxWidth: "calc(100vw - 24px)" }}
    >
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: "rgba(20,20,20,0.96)", backdropFilter: "blur(20px)" }}
      >
        {suggestion.boostItem.imageUrl ? (
          <img
            src={suggestion.boostItem.imageUrl}
            alt={suggestion.boostItem.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
            style={{ backgroundColor: `${themeColor}22` }}
          >
            🍽️
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">{suggestion.boostItem.name}</p>
          <p className="text-zinc-400 text-[11px] mt-0.5 leading-snug line-clamp-1">{suggestion.reasoning}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold" style={{ color: themeColor }}>
            +${suggestion.boostItem.price.toFixed(2)}
          </span>
          {added ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              ✓ Added
            </span>
          ) : (
            <button
              onClick={handleAdd}
              className="text-xs font-bold px-3 py-1.5 rounded-xl transition-transform active:scale-95"
              style={{ backgroundColor: themeColor, color: "#000" }}
            >
              Add it
            </button>
          )}
          <button onClick={onDismiss} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none p-0.5">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
