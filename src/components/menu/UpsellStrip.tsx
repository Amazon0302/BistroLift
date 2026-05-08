"use client";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface Props {
  items: MenuItem[];
  themeColor: string;
}

export default function UpsellStrip({ items, themeColor }: Props) {
  return (
    <div className="px-4 pb-4">
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: "#5E5852" }}>
        Pairs well with
      </p>
      <div className="flex gap-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 flex items-center gap-2.5 rounded-2xl px-3 py-2 min-w-0"
            style={{ backgroundColor: "#211E1A", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ backgroundColor: "#1A1714" }}>
                🍽️
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate max-w-[90px] leading-tight" style={{ color: "#F3EEE7" }}>
                {item.name}
              </p>
              <p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>
                ${item.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
