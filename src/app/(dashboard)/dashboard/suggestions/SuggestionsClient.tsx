"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  type: string;
  title: string;
  reasoning: string;
  itemNames: string[];
  itemPrices: number[];
  originalTotal: number;
  comboPrice: number | null;
  status: string;
  createdAt: string;
}

interface Props {
  suggestions: Suggestion[];
}

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-zinc-700/60 text-zinc-300",
  approved: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const TYPE_LABEL: Record<string, string> = {
  addon:   "➕ Add-on",
  combo:   "🎁 Combo",
  upgrade: "⬆️ Upgrade",
};

const TYPE_STYLES: Record<string, string> = {
  addon:   "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  combo:   "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  upgrade: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
};

export default function SuggestionsClient({ suggestions }: Props) {
  const router = useRouter();
  const [generating, startGenerate] = useTransition();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  // Per-suggestion editable combo price (keyed by suggestion id)
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      suggestions
        .filter((s) => s.type === "combo" && s.comboPrice != null)
        .map((s) => [s.id, s.comboPrice!.toFixed(2)])
    )
  );
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const filtered = suggestions.filter((s) => s.status === activeTab);
  const counts = {
    pending:  suggestions.filter((s) => s.status === "pending").length,
    approved: suggestions.filter((s) => s.status === "approved").length,
    rejected: suggestions.filter((s) => s.status === "rejected").length,
  };

  function generate() {
    startGenerate(async () => {
      const res = await fetch("/api/ai/suggestions", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to generate suggestions");
        return;
      }
      router.refresh();
    });
  }

  async function review(s: Suggestion, status: "approved" | "rejected") {
    setSubmitting((prev) => ({ ...prev, [s.id]: true }));

    const body: { status: string; comboPrice?: number } = { status };
    if (status === "approved" && s.type === "combo") {
      const raw = editedPrices[s.id];
      const parsed = parseFloat(raw ?? "");
      if (!isNaN(parsed) && parsed > 0) body.comboPrice = parsed;
    }

    await fetch(`/api/ai/suggestions/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting((prev) => ({ ...prev, [s.id]: false }));
    router.refresh();
  }

  function savingsInfo(s: Suggestion, price: number) {
    const savings = s.originalTotal - price;
    const pct = s.originalTotal > 0 ? Math.round((savings / s.originalTotal) * 100) : 0;
    return { savings, pct };
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Upsell Suggestions</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Claude analyzes your menu and recommends add-ons, combos & upgrades to boost order value.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-xl transition-colors text-sm"
        >
          {generating ? <><span className="animate-spin">⚙️</span> Analyzing…</> : <>✨ Generate Suggestions</>}
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-700 rounded-2xl">
          <p className="text-4xl mb-4">🤖</p>
          <p className="text-zinc-300 font-medium">No suggestions yet</p>
          <p className="text-zinc-500 text-sm mt-1">Click &quot;Generate Suggestions&quot; to let Claude analyze your menu</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["pending", "approved", "rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span className="ml-1.5 bg-zinc-600 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">
                    {counts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-12">No {activeTab} suggestions.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((s) => {
                const isCombo = s.type === "combo";
                const editedRaw = editedPrices[s.id] ?? s.comboPrice?.toFixed(2) ?? "";
                const editedNum = parseFloat(editedRaw);
                const effectivePrice = !isNaN(editedNum) && editedNum > 0 ? editedNum : (s.comboPrice ?? 0);
                const { savings, pct } = savingsInfo(s, effectivePrice);
                const isValidPrice = !isNaN(editedNum) && editedNum > 0 && editedNum < s.originalTotal;
                const isBusy = submitting[s.id];

                return (
                  <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Card header */}
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${TYPE_STYLES[s.type] ?? ""}`}>
                              {TYPE_LABEL[s.type] ?? s.type}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                              {s.status}
                            </span>
                          </div>

                          <h3 className="text-white font-semibold text-base">{s.title}</h3>
                          <p className="text-zinc-400 text-sm mt-1">{s.reasoning}</p>

                          {/* Item pills */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {s.itemNames.map((name, i) => (
                              <span key={i} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                {name}
                                {isCombo && s.itemPrices[i] > 0 && (
                                  <span className="text-zinc-500">${s.itemPrices[i].toFixed(2)}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Approved/Rejected non-combo: action column */}
                        {s.status === "pending" && !isCombo && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => review(s, "approved")}
                              disabled={isBusy}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => review(s, "rejected")}
                              disabled={isBusy}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}

                        {/* Approved combo: show final price */}
                        {s.status === "approved" && isCombo && s.comboPrice != null && (
                          <div className="shrink-0 text-right">
                            <p className="text-emerald-400 font-extrabold text-lg">${s.comboPrice.toFixed(2)}</p>
                            {s.originalTotal > 0 && (
                              <>
                                <p className="text-zinc-500 text-xs line-through">${s.originalTotal.toFixed(2)}</p>
                                <p className="text-emerald-400 text-xs font-semibold">
                                  Saves ${(s.originalTotal - s.comboPrice).toFixed(2)} ({Math.round(((s.originalTotal - s.comboPrice) / s.originalTotal) * 100)}%)
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Combo price editor (pending combos only) ── */}
                    {isCombo && s.status === "pending" && (
                      <div className="border-t border-zinc-800 bg-zinc-950/50 px-5 py-4 space-y-4">
                        {/* Pricing overview */}
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">Individual total</p>
                            <p className="text-white font-semibold">${s.originalTotal.toFixed(2)}</p>
                          </div>
                          <div className="text-zinc-600">→</div>
                          <div>
                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">AI suggested</p>
                            <p className="text-purple-400 font-semibold">${s.comboPrice?.toFixed(2) ?? "—"}</p>
                          </div>
                          {savings > 0 && isValidPrice && (
                            <>
                              <div className="text-zinc-600">·</div>
                              <div>
                                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">Customer saves</p>
                                <p className="text-emerald-400 font-bold">${savings.toFixed(2)} ({pct}%)</p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Editable price */}
                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500 block mb-2">
                            Set combo price
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-[180px]">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold">$</span>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={editedRaw}
                                onChange={(e) =>
                                  setEditedPrices((prev) => ({ ...prev, [s.id]: e.target.value }))
                                }
                                className={`w-full bg-zinc-800 border rounded-xl pl-7 pr-3 py-2.5 text-white font-bold text-lg focus:outline-none transition-colors ${
                                  !isValidPrice && editedRaw !== ""
                                    ? "border-red-500/50 focus:border-red-500"
                                    : "border-zinc-700 focus:border-amber-500"
                                }`}
                              />
                            </div>

                            {/* Quick presets */}
                            <div className="flex gap-1.5">
                              {[10, 15, 20].map((pctOff) => {
                                const price = Math.floor(s.originalTotal * (1 - pctOff / 100) * 100) / 100;
                                return (
                                  <button
                                    key={pctOff}
                                    onClick={() =>
                                      setEditedPrices((prev) => ({
                                        ...prev,
                                        [s.id]: price.toFixed(2),
                                      }))
                                    }
                                    className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                                  >
                                    -{pctOff}%
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Validation hint */}
                          {editedRaw !== "" && !isValidPrice && (
                            <p className="text-red-400 text-xs mt-1.5">
                              Price must be between $0.01 and ${s.originalTotal.toFixed(2)}
                            </p>
                          )}
                          {isValidPrice && savings > 0 && (
                            <p className="text-emerald-400 text-xs mt-1.5 font-medium">
                              ✓ Customers save ${savings.toFixed(2)} ({pct}% off) with this deal
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => review(s, "approved")}
                            disabled={isBusy || !isValidPrice}
                            className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isBusy ? "Saving…" : `✓ Approve at $${effectivePrice.toFixed(2)}`}
                          </button>
                          <button
                            onClick={() => review(s, "rejected")}
                            disabled={isBusy}
                            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
