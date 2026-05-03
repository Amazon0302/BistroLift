"use client";

import { useState } from "react";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  badges: string[];
  isAvailable: boolean;
  categoryId: string;
  order: number;
  upsellIds: string[];
}

interface Props {
  item: MenuItem | null;
  categoryId: string;
  allItems: MenuItem[];
  onSaved: (item: MenuItem, isNew: boolean) => void;
  onClose: () => void;
}

const ALL_BADGES = [
  { value: "popular", label: "🔥 Popular" },
  { value: "chef", label: "👨‍🍳 Chef's Choice" },
  { value: "new", label: "✨ New" },
  { value: "spicy", label: "🌶️ Spicy" },
  { value: "vegan", label: "🌿 Vegan" },
];

export default function MenuItemForm({ item, categoryId, allItems, onSaved, onClose }: Props) {
  const isNew = !item;
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [badges, setBadges] = useState<string[]>(item?.badges ?? []);
  const [upsellIds, setUpsellIds] = useState<string[]>(item?.upsellIds ?? []);
  const [loading, setLoading] = useState(false);

  const otherItems = allItems.filter((i) => i.id !== item?.id);

  function toggleBadge(val: string) {
    setBadges((prev) => prev.includes(val) ? prev.filter((b) => b !== val) : [...prev, val]);
  }

  function toggleUpsell(id: string) {
    setUpsellIds((prev) => prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    setLoading(true);

    const payload = {
      ...(item ? { id: item.id } : {}),
      name,
      description: description || null,
      price: parseFloat(price),
      imageUrl: imageUrl || null,
      badges,
      upsellIds,
      categoryId,
    };

    const res = await fetch("/api/menu-items", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to save");
      return;
    }

    toast.success(isNew ? "Item added!" : "Item updated!");
    onSaved(
      {
        ...data,
        price: Number(data.price),
        isAvailable: data.isAvailable ?? true,
        order: data.order ?? 0,
      },
      isNew
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h3 className="font-semibold text-white">{isNew ? "Add Menu Item" : "Edit Item"}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Truffle Risotto"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Rich, creamy arborio rice with black truffle shavings..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Price (USD) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="24.00"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="w-full h-32 object-cover rounded-xl mt-2" />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Badges</label>
            <div className="flex flex-wrap gap-2">
              {ALL_BADGES.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => toggleBadge(b.value)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    badges.includes(b.value)
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {otherItems.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Upsell (pairs well with)</label>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {otherItems.map((i) => (
                  <label key={i.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={upsellIds.includes(i.id)}
                      onChange={() => toggleUpsell(i.id)}
                      className="accent-amber-500"
                    />
                    <span className="text-sm text-zinc-300">{i.name}</span>
                    <span className="text-xs text-zinc-500 ml-auto">${i.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Saving..." : isNew ? "Add Item" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
