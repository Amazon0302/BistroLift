"use client";

import { useRef, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  emoji: string | null;
}

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
  themeColor: string;
}

export default function CategoryNav({ categories, activeId, onSelect, themeColor }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const btn = activeRef.current;
      const scrollLeft = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <div className="sticky top-0 z-30 border-b" style={{ backgroundColor: "rgba(15,13,10,0.95)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={
                isActive
                  ? { backgroundColor: themeColor, color: "#FFFFFF" }
                  : { backgroundColor: "rgba(255,255,255,0.07)", color: "#998F83" }
              }
            >
              {cat.emoji && (
                <span className={`text-base ${isActive ? "" : "opacity-60"}`}>
                  {cat.emoji}
                </span>
              )}
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
