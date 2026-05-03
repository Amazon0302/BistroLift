"use client";

import { useEffect, useRef, useState } from "react";
import WelcomePopup from "./WelcomePopup";
import CategoryNav from "./CategoryNav";
import MenuItemCard from "./MenuItemCard";
import PopularPicks from "./PopularPicks";
import ItemDetailSheet from "./ItemDetailSheet";
import ComboDetailSheet from "./ComboDetailSheet";
import type { Combo } from "./ComboDetailSheet";
import CartButton from "./CartButton";
import CartDrawer from "./CartDrawer";
import type { CartItem, CartEntry } from "./CartDrawer";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  badges: string[];
  ingredients: string[];
  upsellIds: string[];
}

interface Category {
  id: string;
  name: string;
  emoji: string | null;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  themeColor: string;
  discountText: string;
}

interface SuggestionItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface ApprovedSuggestion {
  id: string;
  type: string;
  title: string;
  reasoning: string;
  items: SuggestionItem[];
  comboPrice: number | null;
}

interface Props {
  restaurant: Restaurant;
  categories: Category[];
  approvedSuggestions?: ApprovedSuggestion[];
  tableId?: string;
}

const POPULAR_BADGES = ["popular", "chef"];

export default function MenuPage({ restaurant, categories, approvedSuggestions = [], tableId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [showBestDeal, setShowBestDeal] = useState(false);

  // Cart state
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Detail sheet state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const combosRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const key = `bl_popup_${restaurant.id}`;
    if (!sessionStorage.getItem(key)) {
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, [mounted, restaurant.id]);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => setShowBestDeal(true), 5000);
    return () => clearTimeout(timer);
  }, [mounted]);

  function handlePopupClose() {
    sessionStorage.setItem(`bl_popup_${restaurant.id}`, "1");
    setShowPopup(false);
  }

  // ── Cart helpers ────────────────────────────────────────────────────────
  function addToCart(item: CartItem, qty: number) {
    setCartEntries((prev) => {
      const existing = prev.find((e) => e.id === item.id);
      if (existing) {
        return prev.map((e) => e.id === item.id ? { ...e, quantity: e.quantity + qty } : e);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }

  function updateCartQty(id: string, qty: number) {
    setCartEntries((prev) => prev.map((e) => e.id === id ? { ...e, quantity: qty } : e));
  }

  function removeFromCart(id: string) {
    setCartEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function clearCart() {
    setCartEntries([]);
  }

  const cartCount = cartEntries.reduce((s, e) => s + e.quantity, 0);
  const cartTotal = cartEntries.reduce((s, e) => s + e.price * e.quantity, 0);

  // ── Menu data ────────────────────────────────────────────────────────────
  const itemMap: Record<string, MenuItem> = {};
  categories.forEach((cat) => cat.items.forEach((item) => (itemMap[item.id] = item)));

  const categoryIdByItemId: Record<string, string> = {};
  categories.forEach((cat) => cat.items.forEach((item) => { categoryIdByItemId[item.id] = cat.id; }));

  const popularItems = categories
    .flatMap((cat) =>
      cat.items
        .filter((item) => item.badges.some((b) => POPULAR_BADGES.includes(b)))
        .map((item) => ({ ...item, categoryName: cat.name }))
    )
    .slice(0, 8);

  const sortedCategories = categories.map((cat) => ({
    ...cat,
    items: [...cat.items].sort((a, b) => {
      const score = (item: MenuItem) =>
        item.badges.includes("popular") ? 2 : item.badges.includes("chef") ? 1 : 0;
      // Secondary sort by id keeps order deterministic on both server and client
      const diff = score(b) - score(a);
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    }),
  }));

  // ── Scroll observer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id.replace("cat-", ""));
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [mounted, categories]);

  function scrollToCategory(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Suggestions ──────────────────────────────────────────────────────────
  const combos   = approvedSuggestions.filter((s) => s.type === "combo");
  const addons   = approvedSuggestions.filter((s) => s.type === "addon");
  const upgrades = approvedSuggestions.filter((s) => s.type === "upgrade");

  const bestDeal = combos
    .filter((c) => c.comboPrice !== null)
    .map((c) => ({ ...c, savings: c.items.reduce((s, i) => s + i.price, 0) - (c.comboPrice ?? 0) }))
    .sort((a, b) => b.savings - a.savings)[0];

  // Cart qty for selected item (for detail sheet)
  const selectedCartQty = selectedItem
    ? (cartEntries.find((e) => e.id === selectedItem.id)?.quantity ?? 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-28" suppressHydrationWarning>

      {/* ── Hero ── */}
      <div className="relative h-64 overflow-hidden">
        {restaurant.coverUrl
          ? <img src={restaurant.coverUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#111 0%,#1a1a1a 50%,#111 100%)" }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end gap-4">
            {restaurant.logoUrl
              ? <img src={restaurant.logoUrl} alt="logo" className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-2xl flex-shrink-0" />
              : <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl shadow-2xl border border-white/10"
                  style={{ background: `linear-gradient(135deg,${restaurant.themeColor}33,${restaurant.themeColor}11)` }}>🍽️</div>}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-sm text-zinc-400 mt-0.5 leading-snug line-clamp-2">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category nav ── */}
      <CategoryNav categories={categories} activeId={activeCategory} onSelect={scrollToCategory} themeColor={restaurant.themeColor} />

      {/* ── Strategy 1: Popular Picks ── */}
      <PopularPicks
        items={popularItems}
        themeColor={restaurant.themeColor}
        onScrollTo={scrollToCategory}
        categoryIdByItemId={categoryIdByItemId}
      />

      {/* ── Strategy 2: Featured Combos with savings ── */}
      {combos.length > 0 && (
        <div className="mt-6 px-4" ref={combosRef}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎁</span>
            <h2 className="text-base font-bold text-white">Best Value Combos</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto uppercase tracking-wide"
              style={{ backgroundColor: `${restaurant.themeColor}22`, color: restaurant.themeColor }}>
              Save More
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: "none" }}>
            {combos.map((combo) => {
              const originalTotal = combo.items.reduce((s, i) => s + i.price, 0);
              const savings = combo.comboPrice != null ? originalTotal - combo.comboPrice : 0;
              const savingsPct = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
              return (
                <button
                  key={combo.id}
                  onClick={() => setSelectedCombo(combo)}
                  className="flex-shrink-0 w-56 bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
                >
                  {combo.items.some((i) => i.imageUrl) && (
                    <div className="flex h-24 relative">
                      {combo.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex-1 overflow-hidden">
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-zinc-800" />}
                        </div>
                      ))}
                      {savings > 0.01 && (
                        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-lg">
                          Save ${savings.toFixed(2)}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                        View →
                      </span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-white font-bold text-sm">{combo.title}</p>
                    <p className="text-zinc-500 text-[11px] mt-0.5">{combo.reasoning}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {combo.items.map((item) => (
                        <span key={item.id} className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded-lg">{item.name}</span>
                      ))}
                    </div>
                    {combo.comboPrice != null && (
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-extrabold text-base" style={{ color: restaurant.themeColor }}>${combo.comboPrice.toFixed(2)}</span>
                        {savings > 0.01 && (
                          <>
                            <span className="text-[11px] text-zinc-500 line-through">${originalTotal.toFixed(2)}</span>
                            <span className="text-[11px] font-bold text-emerald-400">{savingsPct}% off</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Menu sections ── */}
      <div className="px-4 space-y-12 mt-8">
        {sortedCategories.map((cat, catIndex) => (
          <section key={cat.id} id={`cat-${cat.id}`} ref={(el) => { sectionRefs.current[cat.id] = el; }}>
            <div className="flex items-center gap-2 mb-5">
              {cat.emoji && <span className="text-2xl">{cat.emoji}</span>}
              <h2 className="text-xl font-extrabold text-white tracking-tight">{cat.name}</h2>
              <div className="flex-1 h-px bg-white/[0.05] ml-2" />
            </div>
            <div className="space-y-4">
              {cat.items.map((item, itemIndex) => {
                const aiAddons = addons.filter((s) => s.items.some((si) => si.id === item.id));
                const manualUpsells = item.upsellIds.map((id) => itemMap[id]).filter(Boolean);
                const upsellItems: MenuItem[] = manualUpsells.length > 0
                  ? manualUpsells
                  : aiAddons.flatMap((s) => s.items.filter((si) => si.id !== item.id))
                      .slice(0, 3)
                      .map((si) => ({ ...si, description: null, badges: [], ingredients: [], upsellIds: [] }));
                const upgrade = upgrades.find((u) => u.items[0]?.id === item.id);
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    upsellItems={upsellItems}
                    themeColor={restaurant.themeColor}
                    featured={itemIndex === 0 && catIndex < 2}
                    upgrade={upgrade ? { name: upgrade.items[1]?.name ?? upgrade.title, priceDiff: upgrade.comboPrice ?? 0 } : undefined}
                    onTap={() => setSelectedItem(item)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* ── Strategy 4: Sticky Best-Deal Pill (hides when cart is visible) ── */}
      {mounted && showBestDeal && bestDeal && bestDeal.savings > 0.5 && cartCount === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-500"
          style={{ maxWidth: "calc(100vw - 32px)" }}>
          <button
            onClick={() => { combosRef.current?.scrollIntoView({ behavior: "smooth" }); setShowBestDeal(false); }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg,${restaurant.themeColor}dd,${restaurant.themeColor}99)` }}
          >
            <span className="text-base">🎁</span>
            <span className="truncate max-w-[180px]">{bestDeal.title}</span>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              Save ${bestDeal.savings.toFixed(2)}
            </span>
            <span className="text-white/70 text-xs flex-shrink-0">→</span>
          </button>
        </div>
      )}

      {/* ── Cart FAB ── */}
      {mounted && (
        <CartButton
          count={cartCount}
          total={cartTotal}
          themeColor={restaurant.themeColor}
          onClick={() => setShowCart(true)}
        />
      )}

      {/* ── Item Detail Sheet ── */}
      {selectedItem && (
        <ItemDetailSheet
          item={selectedItem}
          allSuggestions={approvedSuggestions}
          themeColor={restaurant.themeColor}
          onClose={() => setSelectedItem(null)}
          onAddToCart={addToCart}
          cartQty={selectedCartQty}
          onViewCombo={(combo) => setSelectedCombo(combo)}
          onViewItem={(si) => {
            const full = itemMap[si.id];
            if (full) setSelectedItem(full);
          }}
        />
      )}

      {/* ── Combo Detail Sheet ── */}
      {selectedCombo && (
        <ComboDetailSheet
          combo={selectedCombo}
          themeColor={restaurant.themeColor}
          onClose={() => setSelectedCombo(null)}
          onAddToCart={(items, _title) => {
            items.forEach((item) => addToCart(item, 1));
            setSelectedCombo(null);
          }}
        />
      )}

      {/* ── Cart Drawer ── */}
      {showCart && (
        <CartDrawer
          entries={cartEntries}
          themeColor={restaurant.themeColor}
          tableId={tableId}
          restaurantName={restaurant.name}
          onClose={() => setShowCart(false)}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}

      {/* ── Welcome popup ── */}
      {mounted && showPopup && (
        <WelcomePopup restaurant={restaurant} tableId={tableId} onClose={handlePopupClose} />
      )}
    </div>
  );
}
