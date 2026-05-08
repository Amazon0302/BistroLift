# BistroLift Design System — Warm Modern Hospitality

A plain-text specification for AI agents. Every component, page, and feature must conform to these tokens. Reference this file before writing any UI code.

**Design Lineage:** Starbucks (warm materiality, pill CTAs, multi-layer shadows) × Airbnb (photography-first, single accent, editorial typography) × Apple (type precision, depth from surface contrast).

---

## 1. Visual Theme

**Mood:** Premium café warmth. The UI recedes gracefully so food photography and the restaurant brand can lead. Think high-end hospitality app — confident, airy, tactile.

**Not:** Cold gray SaaS, dark mode, neon accents, heavy drop shadows, busy backgrounds.

---

## 2. Color Palette

### Canvas & Surfaces
| Role | Value | Use |
|---|---|---|
| Canvas | `#FAFAF8` | Page backgrounds, sheet scroll areas, input backgrounds |
| Surface | `#FFFFFF` | Cards, drawers, popup panels |
| Surface warm | `#F0EEE9` | Qty controls, secondary buttons, tag chips |

### Borders
| Role | Value | Use |
|---|---|---|
| Hairline | `#EDEBE6` | Card borders, dividers, input borders |
| Border strong | `#E0DDD7` | Active input focus fallback |

### Ink (Text)
| Role | Value | Use |
|---|---|---|
| Ink | `#1C1A17` | All primary text, headings, prices |
| Ink secondary | `#706B5E` | Descriptions, supporting copy |
| Ink muted | `#9E9A8E` | Placeholders, metadata, eyebrows |
| Ink faint | `#C7C3BB` | Strikethrough prices, disabled |

### Brand Accent (Dynamic)
- `themeColor` prop drives **all** interactive color: buttons, prices, active states, icon bg tints.
- Tints: `${themeColor}15` (8%), `${themeColor}18` (10%), `${themeColor}25` (15%)
- Shadows: `${themeColor}40` (25%), `${themeColor}44` (27%)
- **Never hardcode** `#D4A017` or any amber value in components.

### Navigation Active State
Active category pills use **`#1C1A17`** (warm near-black), NOT themeColor. This is the Airbnb/Linear editorial approach — dark ink as the navigation anchor.

### Semantic (static)
| Role | Value | Tailwind equivalent |
|---|---|---|
| Success | `#22C55E` / bg `#DCFCE7` | green-500 / green-100 |
| Warning | `#D97706` / bg `#FEF3C7` | amber-600 / amber-100 |
| Danger | `#EF4444` / bg `#FEE2E2` | red-500 / red-100 |

### Badge Colors (menu item labels)
| Badge | Color |
|---|---|
| popular | `#EF4444` |
| chef | `#F59E0B` |
| new | `#8B5CF6` |
| spicy | `#F97316` |
| vegan | `#22C55E` |

---

## 3. Typography

**Stack:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

All headings use `letterSpacing: "-0.3px"` to `-0.5px` (Apple tight cadence).

| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title | 26px | 700 | `letterSpacing: "-0.5px"` |
| Section heading | 17px | 700 | `letterSpacing: "-0.2px"` |
| Hero name (menu) | 22px | 700 | `letterSpacing: "-0.4px"` |
| Card title | 13–14px | 600 | `letterSpacing: "-0.15px"` |
| Body / description | 13–14px | 400 | `lineHeight: 1.55` |
| Price (primary) | 15–22px | 700 | themeColor |
| Meta / caption | 11–12px | 500 | color: ink-muted |
| Eyebrow | 11px | 700 uppercase | `letterSpacing: "0.08em"` |
| Button text | 14–16px | 700 | inside pill CTAs |

---

## 4. Shape / Border Radius

| Role | Value | Use |
|---|---|---|
| `xs` | 8px | Small tags |
| `sm` | 10–12px | Image thumbnails, icon containers |
| `md` | 14–16px | Inputs, combo/nudge cards, cart items |
| `lg` | 18–20px | Menu item cards |
| `xl` | 24px | Main sheet panels, quick-add tiles |
| `sheet` | 28px top-only | All bottom sheets (`borderRadius: "28px 28px 0 0"`) |
| `pill` | 9999px | **All primary/secondary CTAs, nav pills, stat chips** |

**Rule:** All CTAs are pill-shaped (`borderRadius: "9999px"`). This is the Starbucks signature. No `rounded-2xl` on buttons — pills only.

---

## 5. Elevation & Shadows

Depth comes from surface contrast + warm multi-layer shadows (Starbucks DNA). No heavy single-layer drops.

| Level | Shadow | Use |
|---|---|---|
| 0 — canvas | none | Page background |
| 1 — card | `0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05)` | All menu cards, dashboard stat cards |
| 2 — combo card | `0 2px 12px rgba(0,0,0,0.07)` | Combo scroll cards |
| 3 — featured | `0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)` | Featured today card |
| 4 — floating | `0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)` | CartBoostBanner, sticky bars |
| 5 — CTA glow | `0 6px 20px ${themeColor}44` | Primary buttons |
| 6 — CTA glow XL | `0 8px 24px ${themeColor}44` | Hero CTA, call-waiter button |

---

## 6. Component Patterns

### Bottom Sheet
```
borderRadius: "28px 28px 0 0"
backgroundColor: "#FFFFFF"
maxHeight: "88–92vh"
transition: translate-y 300ms ease-out
Backdrop: rgba(0,0,0,0.52) + backdropFilter: blur(4px)
Drag handle: w-10 h-1 rounded-full bg-[#EDEBE6] mx-auto
```

### Primary CTA Button
```
borderRadius: "9999px"    ← pill, always
backgroundColor: themeColor
color: "#FFFFFF"
fontWeight: 700
fontSize: "15–16px"
padding: "14px 0" (full-width) or "12px 24px" (inline)
boxShadow: `0 6px 20px ${themeColor}44`
active: scale(0.98)
```

### Secondary Button
```
borderRadius: "9999px"
backgroundColor: "#F0EEE9"
border: "1px solid #EDEBE6"
color: "#706B5E"
fontWeight: 600
```

### Nav Pill (active)
```
backgroundColor: "#1C1A17"    ← dark ink, NOT themeColor
color: "#FFFFFF"
borderRadius: "9999px"
fontWeight: 700
```

### Nav Pill (inactive)
```
backgroundColor: "#F0EEE9"
color: "#706B5E"
borderRadius: "9999px"
fontWeight: 600
```

### Menu Item Card (2-col grid)
```
borderRadius: "18px"
backgroundColor: "#FFFFFF"
border: "1px solid #EDEBE6"
boxShadow: level-1
Image height: 160px
"+" button: rounded-full, themeColor bg
active: scale(0.97)
```

### Input Field
```
backgroundColor: "#FAFAF8"
border: "1.5px solid #EDEBE6"
borderRadius: "12px"
padding: "12px 16px"
focus: borderColor = themeColor (or "#1C1A17" for dashboard)
```

### Dashboard Card
```
backgroundColor: "#FFFFFF"
borderRadius: "20px"
border: "1px solid #EDEBE6"
boxShadow: level-1
padding: "20px"
```

### Sidebar Nav (active)
```
backgroundColor: "#1C1A17"
color: "#FFFFFF"
borderRadius: "10px"
```

---

## 7. Hero Section (menu page)

No cover image — uses themeColor gradient:
```
background: `linear-gradient(150deg, ${tc} 0%, ${tc}CC 50%, ${tc}77 100%)`
height: 220px
```

Decorative blobs (glassmorphism):
- `-top-12 -right-12 w-52 h-52 rounded-full bg-white/10`
- `top-8 right-20 w-24 h-24 rounded-full bg-white/07`
- `-bottom-16 -left-10 w-60 h-60 rounded-full bg-black/08`

Stats pills: `bg-white/18 + backdropFilter: blur(8px)` — glassmorphism

---

## 8. Do's

- Use `#FAFAF8` for all canvas/page backgrounds — never `#F5F5F7` or cold grays
- Use `#1C1A17` for active nav pills and dashboard sidebar active items (editorial anchor)
- Make ALL primary CTAs pill-shaped (`borderRadius: "9999px"`)
- Use multi-layer shadows (two rgba layers) instead of a single heavy drop
- Use `letterSpacing: "-0.3px"` to `"-0.5px"` on all headings ≥17px
- Add `backdropFilter: blur(4px)` on all bottom-sheet backdrops
- Keep `${themeColor}` dynamic — never hardcode the amber value
- Use `scrollbarWidth: "none"` on all horizontal scroll containers
- Use `active:scale-[0.97]` on tappable cards, `active:scale-[0.98]` on large buttons, `active:scale-95` on icon buttons

---

## 9. Don'ts

- Don't use `#F5F5F7`, `bg-gray-100`, or any cool-toned canvas
- Don't use themeColor for active nav pills — use `#1C1A17`
- Don't use `rounded-2xl` on CTA buttons — use `rounded-full` (pill)
- Don't use colorful background tiles for category quick grids — use clean `#FFFFFF border #EDEBE6`
- Don't use `bg-zinc-*`, `bg-[#0f0f0f]`, or any dark backgrounds
- Don't hardcode `#D4A017`, `#amber-400`, or any specific accent
- Don't use a single large drop-shadow — use the multi-layer tokens above
- Don't add `border-gray-100` — use `border: "1px solid #EDEBE6"` (warm hairline)

---

## 10. Responsive & Touch

- Customer menu: mobile-only (390px wide). All touch targets ≥44px.
- Dashboard: desktop-first, sidebar fixed at `w-60`.
- Sheets: always `maxHeight: "88–92vh"` — leaves top 8–12% visible.
- Images: always `object-cover` with fixed heights.
- Horizontal scrollers: `overflow-x-auto` + `scrollbarWidth: "none"` + no Tailwind scrollbar classes.

---

## 11. Z-index Ladder

| Layer | z-index | Component |
|---|---|---|
| Base | 0 | Menu page |
| Sticky nav | 30 | CategoryNav |
| Cart boost | 30 | CartBoostBanner |
| AI FAB | 40 | AI chat button |
| Cart drawer | 50 | CartDrawer |
| Secondary sheets | 55 | ComboDetailSheet, AIChatSheet, ItemDetailSheet |
| Full-screen | 60 | OrderSummaryScreen |
| Toast | 100 | Toaster |
