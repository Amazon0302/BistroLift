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

const BADGE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  popular: { label: "Bestseller", emoji: "🔥", color: "#EF4444" },
  chef:    { label: "Chef's Pick", emoji: "👨‍🍳", color: "#F59E0B" },
  new:     { label: "New",         emoji: "✨", color: "#8B5CF6" },
  spicy:   { label: "Spicy",       emoji: "🌶️", color: "#F97316" },
  vegan:   { label: "Vegan",       emoji: "🌿", color: "#22C55E" },
};

export default function MenuItemCard({ item, upsellItems, themeColor, featured = false, upgrade, onTap }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasImage = !!item.imageUrl;
  const imageHeight = featured ? "h-64" : "h-52";

  return (
    <div
      onClick={onTap}
      className={`group relative rounded-3xl overflow-hidden active:scale-[0.985] transition-transform duration-150 ${onTap ? "cursor-pointer" : ""}`}
      style={{ backgroundColor: "#1A1714", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* ── Image area ── */}
      {hasImage ? (
        <div className={`relative ${imageHeight} overflow-hidden`}>
          <img
            src={item.imageUrl!}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.20) 50%, transparent 100%)" }} />

          {item.badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {item.badges.map((badge) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                return (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: `${cfg.color}CC` }}
                  >
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <h3 className="font-bold text-base leading-tight drop-shadow-lg flex-1" style={{ color: "#F3EEE7" }}>
                {item.name}
              </h3>
              <span className="text-xl font-extrabold drop-shadow-lg flex-shrink-0 leading-none" style={{ color: themeColor }}>
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative ${imageHeight} overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${themeColor}22, ${themeColor}0C)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl select-none">
            🍽️
          </div>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${themeColor}, transparent)` }} />

          {item.badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
              {item.badges.map((badge) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                return (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: `${cfg.color}CC` }}
                  >
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <h3 className="font-bold text-base leading-tight flex-1" style={{ color: "#F3EEE7" }}>{item.name}</h3>
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
          <p className="text-sm leading-relaxed" style={{ color: "#998F83" }}>
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

      {/* ── Upgrade nudge ── */}
      {upgrade && upgrade.priceDiff > 0 && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <span className="text-base">⬆️</span>
          <p className="text-xs flex-1 leading-snug" style={{ color: "#998F83" }}>
            Upgrade to <span className="font-semibold" style={{ color: "#F3EEE7" }}>{upgrade.name}</span>
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

      <div className={upsellItems.length === 0 && !item.description ? "" : "pb-1"} />
    </div>
  );
}
