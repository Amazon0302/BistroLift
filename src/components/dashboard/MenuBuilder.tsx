"use client";

import { useState } from "react";
import { toast } from "sonner";
import MenuItemForm from "./MenuItemForm";

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

interface Category {
  id: string;
  name: string;
  emoji: string | null;
  order: number;
  items: MenuItem[];
}

interface Props {
  restaurantId: string;
  initialCategories: Category[];
}

export default function MenuBuilder({ restaurantId, initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeCatId, setActiveCatId] = useState<string>(initialCategories[0]?.id ?? "");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [newItemCatId, setNewItemCatId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  const activeCategory = categories.find((c) => c.id === activeCatId);

  async function addCategory() {
    if (!newCatName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim(), emoji: newCatEmoji || null }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setCategories((prev) => [...prev, { ...data, items: [] }]);
    setActiveCatId(data.id);
    setNewCatName("");
    setNewCatEmoji("");
    setAddingCat(false);
    toast.success("Category added");
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { toast.error("Failed to delete"); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (activeCatId === id) setActiveCatId(categories[0]?.id ?? "");
    toast.success("Category deleted");
  }

  async function toggleItem(item: MenuItem) {
    const res = await fetch("/api/menu-items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
    });
    if (!res.ok) { toast.error("Failed to update"); return; }
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((i) =>
          i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
        ),
      }))
    );
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch("/api/menu-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { toast.error("Failed to delete"); return; }
    setCategories((prev) =>
      prev.map((c) => ({ ...c, items: c.items.filter((i) => i.id !== id) }))
    );
    toast.success("Item deleted");
  }

  function onItemSaved(item: MenuItem, isNew: boolean) {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== item.categoryId) return c;
        if (isNew) return { ...c, items: [...c.items, item] };
        return { ...c, items: c.items.map((i) => (i.id === item.id ? item : i)) };
      })
    );
    setEditItem(null);
    setNewItemCatId(null);
  }

  const allItems = categories.flatMap((c) => c.items);

  return (
    <div className="flex gap-6 h-[calc(100vh-160px)]">
      {/* Category sidebar */}
      <div className="w-56 flex-shrink-0 space-y-2">
        <p className="text-xs text-zinc-500 uppercase tracking-wider px-2 mb-3">Categories</p>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              activeCatId === cat.id
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
            onClick={() => setActiveCatId(cat.id)}
          >
            <span className="text-sm font-medium truncate">
              {cat.emoji} {cat.name}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}

        {addingCat ? (
          <div className="space-y-2 p-2">
            <div className="flex gap-2">
              <input
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                placeholder="📋"
                className="w-10 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addCategory} className="flex-1 bg-amber-500 text-black text-xs font-medium py-1.5 rounded-lg">
                Add
              </button>
              <button onClick={() => setAddingCat(false)} className="flex-1 bg-zinc-800 text-zinc-400 text-xs py-1.5 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingCat(true)}
            className="w-full text-left px-3 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors text-sm"
          >
            + Add category
          </button>
        )}
      </div>

      {/* Items panel */}
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        {activeCategory ? (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="font-semibold text-white">
                {activeCategory.emoji} {activeCategory.name}
                <span className="text-zinc-500 text-sm ml-2">
                  ({activeCategory.items.length} items)
                </span>
              </h3>
              <button
                onClick={() => setNewItemCatId(activeCategory.id)}
                className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                + Add Item
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeCategory.items.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">
                  <p className="text-4xl mb-3">🍽️</p>
                  <p>No items yet. Add your first item!</p>
                </div>
              ) : (
                activeCategory.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-zinc-800 rounded-xl p-4"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">{item.name}</p>
                        {!item.isAvailable && (
                          <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{item.description}</p>
                      )}
                      <p className="text-sm font-semibold text-amber-400 mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleItem(item)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          item.isAvailable
                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Hidden"}
                      </button>
                      <button
                        onClick={() => setEditItem(item)}
                        className="text-xs px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600">
            <div className="text-center">
              <p className="text-4xl mb-3">👈</p>
              <p>Select or create a category to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Item form sheet */}
      {(editItem || newItemCatId) && (
        <MenuItemForm
          item={editItem}
          categoryId={newItemCatId ?? editItem?.categoryId ?? ""}
          allItems={allItems}
          onSaved={onItemSaved}
          onClose={() => { setEditItem(null); setNewItemCatId(null); }}
        />
      )}
    </div>
  );
}
