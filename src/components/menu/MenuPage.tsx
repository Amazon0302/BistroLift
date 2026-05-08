"use client";

import { useEffect, useRef, useState } from "react";
import WelcomePopup from "./WelcomePopup";
import ItemDetailSheet from "./ItemDetailSheet";
import ComboDetailSheet from "./ComboDetailSheet";
import type { Combo } from "./ComboDetailSheet";
import CartButton from "./CartButton";
import CartDrawer from "./CartDrawer";
import type { CartItem, CartEntry, ComboSuggestion, CategoryNudge } from "./CartDrawer";
import AIChatSheet from "./AIChatSheet";
import CartBoostBanner from "./CartBoostBanner";

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
  slug: string;
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
  offerEndsAt?: string | null;
}

interface Props {
  restaurant: Restaurant;
  categories: Category[];
  approvedSuggestions?: ApprovedSuggestion[];
  tableId?: string;
}

const BADGE_META: Record<string, { label: string; color: string }> = {
  popular: { label: "Bestseller", color: "#EF4444" },
  chef:    { label: "Chef's Pick", color: "#F59E0B" },
  new:     { label: "New",        color: "#8B5CF6" },
  spicy:   { label: "Spicy",      color: "#F97316" },
  vegan:   { label: "Vegan",      color: "#22C55E" },
};

// ── Design tokens ──────────────────────────────────────────────────────────
const BG       = "#0F0D0A";   // warm near-black canvas
const SURFACE  = "#1A1714";   // card surface
const SURFACE2 = "#211E1A";   // elevated cards
const BORDER   = "rgba(255,255,255,0.08)";
const TEXT1    = "#F3EEE7";   // warm cream primary
const TEXT2    = "#998F83";   // warm gray secondary
const TEXT3    = "#5E5852";   // dark warm muted

export default function MenuPage({ restaurant, categories, approvedSuggestions = [], tableId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [dismissedBoosts, setDismissedBoosts] = useState<Set<string>>(new Set());
  const [promoSlide, setPromoSlide] = useState(0);

  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const key = `bl_popup_${restaurant.id}`;
    if (!sessionStorage.getItem(key)) {
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, [mounted, restaurant.id]);

  function handlePopupClose() {
    sessionStorage.setItem(`bl_popup_${restaurant.id}`, "1");
    setShowPopup(false);
  }

  function addToCart(item: CartItem, qty: number) {
    setCartEntries((prev) => {
      const existing = prev.find((e) => e.id === item.id);
      if (existing) return prev.map((e) => e.id === item.id ? { ...e, quantity: e.quantity + qty } : e);
      return [...prev, { ...item, quantity: qty }];
    });
  }

  function updateCartQty(id: string, qty: number) {
    setCartEntries((prev) => prev.map((e) => e.id === id ? { ...e, quantity: qty } : e));
  }

  function removeFromCart(id: string) {
    setCartEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function clearCart() { setCartEntries([]); }

  const cartCount = cartEntries.reduce((s, e) => s + e.quantity, 0);
  const cartTotal = cartEntries.reduce((s, e) => s + e.price * e.quantity, 0);

  const itemMap: Record<string, MenuItem> = {};
  categories.forEach((cat) => cat.items.forEach((item) => (itemMap[item.id] = item)));

  const sortedCategories = categories.map((cat) => ({
    ...cat,
    items: [...cat.items].sort((a, b) => {
      const score = (i: MenuItem) => i.badges.includes("popular") ? 2 : i.badges.includes("chef") ? 1 : 0;
      const diff = score(b) - score(a);
      return diff !== 0 ? diff : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }),
  }));

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

  const now = mounted ? Date.now() : 0;
  const activeSuggestions = mounted
    ? approvedSuggestions.filter((s) => !s.offerEndsAt || new Date(s.offerEndsAt).getTime() > now)
    : approvedSuggestions;

  const combos   = activeSuggestions.filter((s) => s.type === "combo");
  const addons   = activeSuggestions.filter((s) => s.type === "addon");
  const upgrades = activeSuggestions.filter((s) => s.type === "upgrade");
  const specials = activeSuggestions.filter((s) => s.type === "special");

  const cartItemIds = new Set(cartEntries.map((e) => e.id));
  const cartBoostSuggestion = mounted
    ? (() => {
        for (const addon of addons) {
          if (dismissedBoosts.has(addon.id)) continue;
          const inCart    = addon.items.filter((i) => cartItemIds.has(i.id));
          const notInCart = addon.items.filter((i) => !cartItemIds.has(i.id));
          if (inCart.length >= 1 && notInCart.length >= 1) {
            return { id: addon.id, reasoning: addon.reasoning, boostItem: notInCart[0] };
          }
        }
        return null;
      })()
    : null;

  const cartComboSuggestions: ComboSuggestion[] = combos.map((c) => ({
    id: c.id, title: c.title, reasoning: c.reasoning, items: c.items, comboPrice: c.comboPrice,
  }));

  const DRINK_RE   = /drink|drinks|beverage|beverages|juice|coffee|tea|cocktail|wine|beer|soda|water|smoothie|shake/i;
  const DESSERT_RE = /dessert|desserts|sweet|sweets|cake|ice.?cream|pudding|pastry|bakery/i;

  const cartCategoryNudges: CategoryNudge[] = categories
    .filter((cat) => DRINK_RE.test(cat.name) || DESSERT_RE.test(cat.name))
    .map((cat) => ({
      categoryName: cat.name,
      emoji: cat.emoji,
      items: cat.items.slice(0, 5).map((item) => ({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl })),
    }))
    .filter((n) => n.items.length > 0);

  const selectedCartQty = selectedItem
    ? (cartEntries.find((e) => e.id === selectedItem.id)?.quantity ?? 0)
    : 0;

  const featuredSpecial = mounted ? (specials[0] ?? null) : null;
  const featuredItemId  = featuredSpecial?.items[0]?.id ?? null;
  const featuredItem    = featuredItemId
    ? (itemMap[featuredItemId] ?? null)
    : (categories.flatMap((c) => c.items).find((i) => i.badges.includes("popular") || i.badges.includes("chef")) ?? null);

  const promoSlides = [
    { tag: "TODAY", title: "Discover Something Delicious", subtitle: `Explore our full menu at ${restaurant.name}`, code: null as string | null },
    ...(mounted ? specials.map((s) => ({
      tag: "SPECIAL",
      title: s.title,
      subtitle: s.reasoning,
      code: s.comboPrice != null ? `$${s.comboPrice.toFixed(0)}` : null,
    })) : []),
  ];
  const slide = promoSlides[promoSlide % promoSlides.length];

  const specialPriceMap: Record<string, number> = {};
  if (mounted) {
    specials.forEach((s) => {
      if (s.comboPrice != null && s.items[0]) specialPriceMap[s.items[0].id] = s.comboPrice;
    });
  }

  const tc = restaurant.themeColor;

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: BG, color: TEXT1 }}>

      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "240px" }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${tc} 0%, ${tc}CC 50%, ${tc}66 100%)` }} />
        {/* Cinematic blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute top-6 right-24 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full" style={{ background: "rgba(0,0,0,0.18)" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between px-5 pt-10 pb-5">
          <div className="flex items-center gap-3">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant.name}
                className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                style={{ border: "2px solid rgba(255,255,255,0.35)", boxShadow: "0 4px 20px rgba(0,0,0,0.30)" }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.20)" }}>
                🍽️
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-white font-bold leading-tight tracking-tight" style={{ fontSize: "23px", letterSpacing: "-0.5px" }}>{restaurant.name}</h1>
              {restaurant.description && (
                <p className="mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px" }}>{restaurant.description}</p>
              )}
              {tableId && (
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-white font-semibold"
                  style={{ fontSize: "11px", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
                  📍 Table {tableId}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { icon: "⭐", label: "4.8" },
              { icon: "🍽️", label: "Dine In" },
              { icon: "📋", label: `${categories.reduce((s, c) => s + c.items.length, 0)} items` },
            ].map((p) => (
              <span key={p.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-white"
                style={{ fontSize: "11px", background: "rgba(0,0,0,0.22)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                {p.icon} {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Nav ── */}
      <div className="sticky top-0 z-30 border-b" style={{ backgroundColor: `${BG}F5`, backdropFilter: "blur(20px)", borderColor: BORDER, boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }}>
        <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex-shrink-0 px-4 py-2 rounded-full font-bold transition-all"
            style={{ backgroundColor: tc, color: "#FFFFFF", fontSize: "13px" }}
          >
            All
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition-all"
                style={{
                  fontSize: "13px",
                  backgroundColor: isActive ? tc : "rgba(255,255,255,0.07)",
                  color: isActive ? "#FFFFFF" : TEXT2,
                }}
              >
                {cat.emoji && <span style={{ fontSize: "14px" }}>{cat.emoji}</span>}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Promo Carousel ── */}
      <div className="px-4 pt-4">
        <div
          className="relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
          style={{ borderRadius: "24px", minHeight: "160px" }}
          onClick={() => setPromoSlide((p) => (p + 1) % promoSlides.length)}
        >
          {(() => {
            const bgItem = featuredSpecial?.items[0] ? itemMap[featuredSpecial.items[0].id] : null;
            return bgItem?.imageUrl ? (
              <img src={bgItem.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tc}EE 0%, ${tc}88 100%)` }} />
            );
          })()}
          <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.40) 60%, rgba(0,0,0,0.10) 100%)" }} />

          <div className="relative z-10 p-5 flex flex-col justify-between h-full min-h-[160px]">
            <div>
              <span className="inline-block px-3 py-1 rounded-full font-bold text-white uppercase tracking-widest"
                style={{ fontSize: "10px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                {slide.tag}
              </span>
              <h2 className="text-white font-bold leading-tight mt-2.5" style={{ fontSize: "21px", maxWidth: "220px", letterSpacing: "-0.3px" }}>{slide.title}</h2>
              <p className="mt-1 line-clamp-2 leading-snug" style={{ color: "rgba(255,255,255,0.58)", fontSize: "12px", maxWidth: "200px" }}>{slide.subtitle}</p>
            </div>
            <div className="flex items-end justify-between mt-4">
              {slide.code ? (
                <span className="px-4 py-1.5 rounded-full font-bold text-gray-900 bg-white" style={{ fontSize: "13px", boxShadow: "0 2px 12px rgba(0,0,0,0.20)" }}>
                  {slide.code}
                </span>
              ) : <div />}
              {promoSlides.length > 1 && (
                <div className="flex gap-1.5 items-center">
                  {promoSlides.map((_, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation(); setPromoSlide(i); }}
                      className="rounded-full transition-all cursor-pointer"
                      style={{ width: i === promoSlide % promoSlides.length ? "20px" : "6px", height: "6px", backgroundColor: "rgba(255,255,255,0.75)" }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Quick Grid ── */}
      <div className="px-4 mt-4 grid grid-cols-4 gap-2">
        {categories.slice(0, 8).map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className="rounded-2xl py-3.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <span style={{ fontSize: "22px", lineHeight: 1 }}>{cat.emoji ?? "🍽️"}</span>
            <span className="text-center leading-tight line-clamp-1 px-1 font-medium" style={{ fontSize: "10px", color: TEXT2 }}>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* ── Featured Today ── */}
      {mounted && featuredItem && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: "17px", letterSpacing: "-0.2px", color: TEXT1 }}>Featured Today</h2>
            <span className="font-bold" style={{ fontSize: "11px", color: tc }}>Chef&apos;s Pick ✦</span>
          </div>
          <div
            className="relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            style={{ borderRadius: "20px", height: "240px", boxShadow: `0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.20)` }}
            onClick={() => setSelectedItem(featuredItem)}
          >
            {featuredItem.imageUrl ? (
              <img src={featuredItem.imageUrl} alt={featuredItem.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl"
                style={{ background: `linear-gradient(135deg, ${tc}44, ${tc}18)` }}>🍽️</div>
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.0) 100%)" }} />

            {featuredItem.badges[0] && BADGE_META[featuredItem.badges[0]] && (
              <span className="absolute top-3 left-3 text-white font-bold px-3 py-1 rounded-full"
                style={{ fontSize: "10px", backgroundColor: BADGE_META[featuredItem.badges[0]].color }}>
                {BADGE_META[featuredItem.badges[0]].label}
              </span>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold leading-tight" style={{ fontSize: "20px", letterSpacing: "-0.3px" }}>{featuredItem.name}</h3>
                {featuredItem.description && (
                  <p className="mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>{featuredItem.description}</p>
                )}
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-white font-bold" style={{ fontSize: "19px" }}>
                    ${(specialPriceMap[featuredItem.id] ?? featuredItem.price).toFixed(2)}
                  </span>
                  {specialPriceMap[featuredItem.id] && (
                    <span className="line-through" style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>${featuredItem.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({ id: featuredItem.id, name: featuredItem.name, price: featuredItem.price, imageUrl: featuredItem.imageUrl }, 1);
                }}
                className="flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-white active:scale-95 transition-transform"
                style={{ fontSize: "13px", backgroundColor: tc, boxShadow: `0 4px 16px ${tc}55` }}
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Combo Deals ── */}
      {combos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-4">
            <h2 className="font-bold tracking-tight" style={{ fontSize: "17px", letterSpacing: "-0.2px", color: TEXT1 }}>Combo Deals</h2>
            <span className="font-bold" style={{ fontSize: "11px", color: tc }}>Save up to 25%</span>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {combos.slice(0, 5).map((combo) => {
              const item1 = combo.items[0];
              const item2 = combo.items[1];
              if (!item1 || !item2) return null;
              const originalTotal = combo.items.reduce((s, i) => s + i.price, 0);
              const savings = combo.comboPrice != null ? originalTotal - combo.comboPrice : 0;
              return (
                <div
                  key={combo.id}
                  className="flex-shrink-0 overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
                  style={{ width: "225px", borderRadius: "18px", backgroundColor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}
                  onClick={() => setSelectedCombo(combo)}
                >
                  <div className="flex relative" style={{ height: "120px" }}>
                    <div className="flex-1 overflow-hidden">
                      {item1.imageUrl ? <img src={item1.imageUrl} alt={item1.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: `${tc}22` }}>🍽️</div>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {item2.imageUrl ? <img src={item2.imageUrl} alt={item2.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: `${tc}22` }}>🍽️</div>}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md"
                        style={{ fontSize: "15px", color: TEXT1, backgroundColor: SURFACE2, border: `1px solid ${BORDER}` }}>+</div>
                    </div>
                    {savings > 0 && (
                      <div className="absolute top-2 right-2 text-white font-bold px-2.5 py-1 rounded-full" style={{ fontSize: "10px", backgroundColor: "#22C55E" }}>
                        Save ${savings.toFixed(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold truncate" style={{ fontSize: "13px", color: TEXT1 }}>{combo.title}</p>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-bold" style={{ fontSize: "15px", color: tc }}>
                          ${combo.comboPrice?.toFixed(2) ?? originalTotal.toFixed(2)}
                        </span>
                        {combo.comboPrice != null && (
                          <span className="line-through" style={{ fontSize: "11px", color: TEXT3 }}>${originalTotal.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); combo.items.forEach((i) => addToCart(i, 1)); }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold active:scale-90 transition-transform flex-shrink-0"
                      style={{ fontSize: "20px", backgroundColor: tc, boxShadow: `0 3px 12px ${tc}44` }}
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sponsored Banner ── */}
      {mounted && specials.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background: `linear-gradient(135deg, ${tc}18, ${tc}08)`, border: `1px solid ${tc}20` }}>
            <div className="flex-1 min-w-0">
              <p className="font-bold uppercase tracking-widest mb-0.5" style={{ fontSize: "9px", color: tc }}>FEATURED</p>
              <h3 className="font-bold leading-tight tracking-tight" style={{ fontSize: "14px", color: TEXT1 }}>{specials[0].title}</h3>
              <p className="mt-0.5 line-clamp-1" style={{ fontSize: "12px", color: TEXT2 }}>{specials[0].reasoning}</p>
            </div>
            {specials[0].items[0] && itemMap[specials[0].items[0].id]?.imageUrl && (
              <img src={itemMap[specials[0].items[0].id]!.imageUrl!} alt={specials[0].title}
                className="w-16 h-16 object-cover flex-shrink-0" style={{ borderRadius: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.30)" }} />
            )}
          </div>
        </div>
      )}

      {/* ── All Dishes ── */}
      <div className="px-4 mt-7">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-bold tracking-tight" style={{ fontSize: "17px", letterSpacing: "-0.2px", color: TEXT1 }}>All Dishes</h2>
          <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
        </div>

        {sortedCategories.map((cat) => (
          <section
            key={cat.id}
            id={`cat-${cat.id}`}
            ref={(el) => { sectionRefs.current[cat.id] = el; }}
            className="mb-10"
          >
            {/* Category header */}
            <div className="flex items-center gap-2.5 mb-4">
              {cat.emoji && <span style={{ fontSize: "16px", lineHeight: 1 }}>{cat.emoji}</span>}
              <h3 className="font-bold tracking-tight" style={{ fontSize: "15px", color: TEXT1, letterSpacing: "-0.15px" }}>{cat.name}</h3>
              <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
              <span className="font-medium" style={{ fontSize: "11px", color: TEXT3 }}>{cat.items.length}</span>
            </div>

            {/* 2-column card grid */}
            <div className="grid grid-cols-2 gap-3">
              {cat.items.map((item) => {
                const topBadge        = item.badges.find((b) => BADGE_META[b]);
                const cartQty         = cartEntries.find((e) => e.id === item.id)?.quantity ?? 0;
                const discountedPrice = specialPriceMap[item.id] ?? null;
                const pairAddon       = addons.find((s) => s.items.some((si) => si.id === item.id));
                const pairPartner     = pairAddon?.items.find((si) => si.id !== item.id);
                const upgrade         = upgrades.find((u) => u.items[0]?.id === item.id);

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-150"
                    style={{
                      borderRadius: "18px",
                      backgroundColor: SURFACE,
                      border: `1px solid ${BORDER}`,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.30)",
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Image */}
                    <div className="relative" style={{ height: "152px", background: `linear-gradient(135deg, ${tc}22, ${tc}0C)` }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ fontSize: "48px" }}>🍽️</div>
                      )}

                      {topBadge && BADGE_META[topBadge] && (
                        <span className="absolute text-white font-bold px-2.5 py-1 rounded-full"
                          style={{ top: "10px", left: "10px", fontSize: "9px", backgroundColor: BADGE_META[topBadge].color }}>
                          {BADGE_META[topBadge].label}
                        </span>
                      )}

                      {cartQty > 0 && (
                        <div className="absolute flex items-center justify-center rounded-full text-white font-bold"
                          style={{ top: "10px", right: "10px", width: "22px", height: "22px", fontSize: "10px", backgroundColor: tc, boxShadow: "0 2px 8px rgba(0,0,0,0.30)" }}>
                          {cartQty}
                        </div>
                      )}

                      {discountedPrice && (
                        <div className="absolute bottom-0 left-0 right-0 h-7 flex items-end px-2.5 pb-1"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.60), transparent)" }}>
                          <span className="text-white font-bold uppercase tracking-wide" style={{ fontSize: "9px" }}>Special Offer</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h4 className="font-semibold leading-snug line-clamp-2 tracking-tight" style={{ fontSize: "13px", color: TEXT1 }}>{item.name}</h4>

                      {(upgrade || pairPartner) && (
                        <p className="mt-1 line-clamp-1 font-medium" style={{ fontSize: "10px", color: TEXT3 }}>
                          {upgrade?.comboPrice != null
                            ? `⬆ Upgrade +$${upgrade.comboPrice.toFixed(0)}`
                            : pairPartner ? `🤝 Pairs w/ ${pairPartner.name}` : null}
                        </p>
                      )}

                      <div className="flex items-end justify-between mt-2.5 gap-1">
                        <div>
                          <span className="font-bold" style={{ fontSize: "15px", color: tc }}>
                            ${(discountedPrice ?? item.price).toFixed(2)}
                          </span>
                          {discountedPrice && (
                            <p className="line-through" style={{ fontSize: "10px", color: TEXT3, marginTop: "1px" }}>${item.price.toFixed(2)}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cartQty === 0) addToCart({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl }, 1);
                            else updateCartQty(item.id, cartQty + 1);
                          }}
                          className="flex items-center justify-center text-white font-bold active:scale-90 transition-transform flex-shrink-0 rounded-full"
                          style={{ width: "34px", height: "34px", fontSize: "20px", backgroundColor: tc, boxShadow: `0 2px 10px ${tc}44` }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* ── Cart Boost Banner ── */}
      {cartBoostSuggestion && cartCount > 0 && !showCart && (
        <CartBoostBanner
          suggestion={cartBoostSuggestion}
          themeColor={tc}
          onAdd={addToCart}
          onDismiss={() => setDismissedBoosts((prev) => new Set([...prev, cartBoostSuggestion.id]))}
        />
      )}

      {/* ── AI Chat FAB ── */}
      {mounted && !showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed z-40 flex items-center justify-center active:scale-95 transition-transform"
          style={{
            bottom: cartCount > 0 ? "88px" : "24px",
            right: "16px",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: SURFACE,
            border: `1px solid ${BORDER}`,
            boxShadow: `0 4px 20px ${tc}30, 0 2px 8px rgba(0,0,0,0.30)`,
            fontSize: "22px",
          }}
        >
          🤖
        </button>
      )}

      {/* ── Cart FAB ── */}
      {mounted && (
        <CartButton count={cartCount} total={cartTotal} themeColor={tc} onClick={() => setShowCart(true)} />
      )}

      {/* ── Sheets & Overlays ── */}
      {selectedItem && (
        <ItemDetailSheet
          item={selectedItem}
          allSuggestions={approvedSuggestions}
          themeColor={tc}
          onClose={() => setSelectedItem(null)}
          onAddToCart={addToCart}
          cartQty={selectedCartQty}
          onViewCombo={(combo) => setSelectedCombo(combo)}
          onViewItem={(si) => { const full = itemMap[si.id]; if (full) setSelectedItem(full); }}
        />
      )}

      {selectedCombo && (
        <ComboDetailSheet
          combo={selectedCombo}
          themeColor={tc}
          onClose={() => setSelectedCombo(null)}
          onAddToCart={(items) => { items.forEach((item) => addToCart(item, 1)); setSelectedCombo(null); }}
        />
      )}

      {showCart && (
        <CartDrawer
          entries={cartEntries}
          themeColor={tc}
          tableId={tableId}
          restaurantName={restaurant.name}
          combos={cartComboSuggestions}
          categoryNudges={cartCategoryNudges}
          onClose={() => setShowCart(false)}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClear={clearCart}
          onAddToCart={addToCart}
        />
      )}

      {showChat && (
        <AIChatSheet
          slug={restaurant.slug}
          itemMap={itemMap}
          themeColor={tc}
          onClose={() => setShowChat(false)}
          onViewItem={(item) => { setShowChat(false); setSelectedItem(item); }}
        />
      )}

      {mounted && showPopup && (
        <WelcomePopup restaurant={restaurant} tableId={tableId} onClose={handlePopupClose} />
      )}
    </div>
  );
}
