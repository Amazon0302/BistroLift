"use client";

interface Props {
  count: number;
  total: number;
  themeColor: string;
  onClick: () => void;
}

export default function CartButton({ count, total, themeColor, onClick }: Props) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-400">
      <button
        onClick={onClick}
        className="flex items-center gap-3 pl-3 pr-5 py-3 rounded-full font-semibold text-white transition-transform active:scale-95"
        style={{
          backgroundColor: themeColor,
          boxShadow: `0 8px 32px ${themeColor}55, 0 2px 8px rgba(0,0,0,0.30)`,
        }}
      >
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold"
          style={{ backgroundColor: "rgba(0,0,0,0.22)" }}>
          {count}
        </span>
        <span className="text-base font-bold">View Order</span>
        <span className="text-sm font-extrabold" style={{ opacity: 0.85 }}>${total.toFixed(2)}</span>
      </button>
    </div>
  );
}
