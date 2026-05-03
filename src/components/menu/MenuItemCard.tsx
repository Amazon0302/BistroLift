"use client";

import { useState } from "react";
import UpsellStrip from "./UpsellStrip";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  badges: string[];
}

interface Props {
  item: MenuItem;
  upsellItems: MenuItem[];
  themeColor: string;
  featured?: boolean;
  upgrade?: { name: string; priceDiff: number };
  onTap?: () => void;
}

const BADGE_CONFIG: Record<string, { label: string; emoji: string; bg: string }> = {
  popular:  { label: "Bestseller", emoji: "🔥", bg: "bg-red-500/80"    },
  chef:     { label: "Chef's Pick", emoji: "👨‍🍳", bg: "bg-amber-500/80"  },
  new:      { label: "New",         emoji: "✨", bg: "bg-purple-500/80" },
  spicy:    { label: "Spicy",       emoji: "🌶️", bg: "bg-orange-500/80" },
  vegan:    { label: "Vegan",       emoji: "🌿", bg: "bg-green-500/80"  },
};

export default function MenuItemCard({ item, upsellItems, themeColor, featured = false, upgrade, onTap }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasImage = !!item.imageUrl;
  const imageHeight = featured ? "h-64" : "h-52";

  return (
    <div
      onClick={onTap}
      className={`group relative bg-[#141414] rounded-3xl overflow-hidden border border-white/[0.06] shadow-xl active:scale-[0.985] transition-transform duration-150 ${onTap ? "cursor-pointer" : ""}`}
    >
      {/* ── Image area ── */}
      {hasImage ? (
        <div className={`relative ${imageHeight} overflow-hidden`}>
          <img
            src={item.imageUrl!}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges — top left */}
          {item.badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {item.badges.map((badge) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                return (
                  <span
                    key={badge}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white backdrop-blur-sm ${cfg.bg}`}
                  >
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Name + price overlay — bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <h3 className="text-white font-bold text-base leading-tight drop-shadow-lg flex-1">
                {item.name}
              </h3>
              <span
                className="text-xl font-extrabold drop-shadow-lg flex-shrink-0 leading-none"
                style={{ color: themeColor }}
              >
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* No-image fallback — gradient card */
        <div className={`relative ${imageHeight} overflow-hidden`}
          style={{ background: `linear-gradient(135deg, #1a1a1a 0%, #222 50%, #1a1a1a 100%)` }}
        >
          {/* Subtle food icon placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl select-none">
            🍽️
          </div>

          {/* Accent stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(to right, ${themeColor}, transparent)` }}
          />

          {/* Badges */}
          {item.badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
              {item.badges.map((badge) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                return (
                  <span
                    key={badge}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white ${cfg.bg}`}
                  >
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Name + price in center */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <h3 className="text-white font-bold text-base leading-tight flex-1">{item.name}</h3>
              <span className="text-xl font-extrabold flex-shrink-0" style={{ color: themeColor }}>
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Description ── */}
      {item.description && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-zinc-400 text-sm leading-relaxed">
            {expanded || item.description.length <= 90
              ? item.description
              : item.description.slice(0, 90) + "…"}
            {item.description.length > 90 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 font-medium text-xs"
                style={{ color: themeColor }}
              >
                {expanded ? "less" : "more"}
              </button>
            )}
          </p>
        </div>
      )}

      {/* ── Strategy: Upgrade nudge ── */}
      {upgrade && upgrade.priceDiff > 0 && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5">
          <span className="text-base">⬆️</span>
          <p className="text-xs text-zinc-300 flex-1 leading-snug">
            Upgrade to <span className="text-white font-semibold">{upgrade.name}</span>
          </p>
          <span className="text-xs font-bold flex-shrink-0" style={{ color: themeColor }}>
            +${upgrade.priceDiff.toFixed(2)}
          </span>
        </div>
      )}

      {/* ── Upsell strip ── */}
      {upsellItems.length > 0 && (
        <div className={item.description || upgrade ? "mt-2" : "mt-3"}>
          <UpsellStrip items={upsellItems} themeColor={themeColor} />
        </div>
      )}

      {/* Bottom padding */}
      <div className={upsellItems.length === 0 && !item.description ? "" : "pb-1"} />
    </div>
  );
}
