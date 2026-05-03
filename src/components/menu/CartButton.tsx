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
        className="flex items-center gap-3 pl-3 pr-5 py-3 rounded-2xl shadow-2xl border border-white/10 font-semibold text-black transition-transform active:scale-95"
        style={{
          backgroundColor: themeColor,
          boxShadow: `0 8px 32px ${themeColor}66`,
        }}
      >
        {/* Count badge */}
        <span className="w-8 h-8 bg-black/20 rounded-xl flex items-center justify-center text-sm font-extrabold">
          {count}
        </span>
        <span className="text-base font-bold">View Order</span>
        <span className="text-sm font-extrabold opacity-80">${total.toFixed(2)}</span>
      </button>
    </div>
  );
}
