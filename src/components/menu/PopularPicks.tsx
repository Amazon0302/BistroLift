"use client";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  badges: string[];
  categoryName: string;
}

interface Props {
  items: MenuItem[];
  themeColor: string;
  onScrollTo: (categoryId: string) => void;
  categoryIdByItemId: Record<string, string>;
}

const PRIORITY = ["popular", "chef", "new", "spicy", "vegan"];
const BADGE_LABEL: Record<string, string> = {
  popular: "🔥 Bestseller",
  chef: "👨‍🍳 Chef's Pick",
  new: "✨ New",
  spicy: "🌶️ Spicy",
  vegan: "🌿 Vegan",
};

export default function PopularPicks({ items, themeColor, onScrollTo, categoryIdByItemId }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="px-4 flex items-center gap-2 mb-3">
        <h2 className="text-base font-bold" style={{ color: "#F3EEE7" }}>Popular Picks</h2>
        <span className="text-xs" style={{ color: "#5E5852" }}>· loved by guests</span>
      </div>
      <div
        className="flex gap-3 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => {
          const topBadge = PRIORITY.find((b) => item.badges.includes(b));
          const catId = categoryIdByItemId[item.id];
          return (
            <button
              key={item.id}
              onClick={() => catId && onScrollTo(catId)}
              className="flex-shrink-0 w-36 overflow-hidden active:scale-95 transition-transform text-left"
              style={{ borderRadius: "18px", backgroundColor: "#1A1714", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Image */}
              <div className="relative h-28 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ background: `linear-gradient(135deg, ${themeColor}22, ${themeColor}0C)` }}
                  >
                    🍽️
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }} />
                {topBadge && (
                  <span
                    className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {BADGE_LABEL[topBadge]}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="font-semibold text-xs leading-tight line-clamp-2" style={{ color: "#F3EEE7" }}>{item.name}</p>
                <p className="text-xs font-bold mt-1" style={{ color: themeColor }}>
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
