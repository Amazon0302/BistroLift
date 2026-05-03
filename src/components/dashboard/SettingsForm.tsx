"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Props {
  restaurant: {
    name: string;
    slug: string;
    description: string | null;
    googleReviewLink: string | null;
    themeColor: string;
    discountText: string;
    logoUrl: string | null;
    coverUrl: string | null;
  };
}

const PRESET_COLORS = [
  "#D4A017", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981", "#3B82F6", "#EC4899", "#F97316",
];

export default function SettingsForm({ restaurant }: Props) {
  const [form, setForm] = useState({ ...restaurant });
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved!");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold text-white">Restaurant Info</h3>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Restaurant Name *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Menu URL Slug</label>
          <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
            <span className="px-3 text-zinc-500 text-sm border-r border-zinc-700 py-3">/menu/</span>
            <input
              value={form.slug}
              disabled
              className="flex-1 bg-transparent px-3 py-3 text-zinc-400 text-sm focus:outline-none"
            />
          </div>
          <p className="text-xs text-zinc-600">Slug cannot be changed after creation</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Description</label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="Fine Italian dining in the heart of the city"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Google Review Link</label>
          <input
            type="url"
            value={form.googleReviewLink ?? ""}
            onChange={(e) => set("googleReviewLink", e.target.value)}
            placeholder="https://g.page/r/your-review-link/review"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Branding */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold text-white">Branding</h3>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Logo URL</label>
          <input
            type="url"
            value={form.logoUrl ?? ""}
            onChange={(e) => set("logoUrl", e.target.value)}
            placeholder="https://..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
          {form.logoUrl && (
            <img src={form.logoUrl} alt="logo" className="w-16 h-16 rounded-xl object-cover mt-2" />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Cover Photo URL</label>
          <input
            type="url"
            value={form.coverUrl ?? ""}
            onChange={(e) => set("coverUrl", e.target.value)}
            placeholder="https://..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
          {form.coverUrl && (
            <img src={form.coverUrl} alt="cover" className="w-full h-24 rounded-xl object-cover mt-2" />
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm text-zinc-400">Accent Color</label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => set("themeColor", color)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: color,
                  borderColor: form.themeColor === color ? "#fff" : "transparent",
                  transform: form.themeColor === color ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
            <input
              type="color"
              value={form.themeColor}
              onChange={(e) => set("themeColor", e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      </div>

      {/* Customer capture */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold text-white">Customer Capture</h3>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Discount Offer Text</label>
          <input
            value={form.discountText}
            onChange={(e) => set("discountText", e.target.value)}
            placeholder="Get 10% off your next visit"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <p className="text-xs text-zinc-600">Shown in the welcome popup to encourage customers to share their phone number</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
