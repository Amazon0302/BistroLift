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
  offerEndsAt: string | null;
  status: string;
  createdAt: string;
}

interface Props {
  suggestions: Suggestion[];
}

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-gray-100 text-gray-500",
  approved: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  rejected: "bg-red-50 text-red-500 border border-red-200",
};

const TYPE_LABEL: Record<string, string> = {
  addon:   "➕ Add-on",
  combo:   "🎁 Combo",
  upgrade: "⬆️ Upgrade",
  special: "⭐ Special",
};

const TYPE_STYLES: Record<string, string> = {
  addon:   "bg-amber-50 text-amber-600 border border-amber-200",
  combo:   "bg-purple-50 text-purple-600 border border-purple-200",
  upgrade: "bg-sky-50 text-sky-600 border border-sky-200",
  special: "bg-rose-50 text-rose-600 border border-rose-200",
};

const DURATION_OPTIONS = [
  { value: "never", label: "Always active",  desc: "No expiry" },
  { value: "1d",    label: "24 hours",        desc: "Today only" },
  { value: "3d",    label: "3 days",          desc: "Weekend special" },
  { value: "7d",    label: "1 week",          desc: "Weekly promotion" },
] as const;

type Duration = "never" | "1d" | "3d" | "7d";

function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3_600_000);
  if (h < 24) return `${h}h left`;
  return `${Math.floor(h / 24)}d left`;
}

function revenueHint(s: Suggestion): string | null {
  if (s.type === "combo" && s.comboPrice != null && s.originalTotal > 0) {
    const extraPerTable = s.comboPrice;
    return `~$${extraPerTable.toFixed(0)} revenue per order vs ordering nothing`;
  }
  if (s.type === "addon" && s.itemPrices[1] > 0) {
    return `+$${s.itemPrices[1].toFixed(2)} per table when accepted`;
  }
  if (s.type === "upgrade" && s.comboPrice != null) {
    return `+$${s.comboPrice.toFixed(2)} revenue per upgrade accepted`;
  }
  if (s.type === "special" && s.comboPrice != null) {
    const saving = s.itemPrices[0] - s.comboPrice;
    if (saving > 0) return `Drives 30% more orders on featured item`;
  }
  return null;
}

export default function SuggestionsClient({ suggestions }: Props) {
  const router = useRouter();
  const [generating, startGenerate] = useTransition();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  const [editedPrices, setEditedPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      suggestions
        .filter((s) => (s.type === "combo" || s.type === "special") && s.comboPrice != null)
        .map((s) => [s.id, s.comboPrice!.toFixed(2)])
    )
  );
  const [durations, setDurations] = useState<Record<string, Duration>>({});
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

    const body: { status: string; comboPrice?: number; offerDuration?: string } = { status };

    if (status === "approved") {
      // Price for combos and specials
      if (s.type === "combo" || s.type === "special") {
        const raw = editedPrices[s.id];
        const parsed = parseFloat(raw ?? "");
        if (!isNaN(parsed) && parsed > 0) body.comboPrice = parsed;
      }
      // Offer duration
      const dur = durations[s.id] ?? "never";
      body.offerDuration = dur;
    }

    const res = await fetch(`/api/ai/suggestions/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting((prev) => ({ ...prev, [s.id]: false }));

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to save — please try again");
      return;
    }

    router.refresh();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-gray-900">AI Upsell Suggestions</h1>
          <p className="text-gray-400 mt-1 text-[14px]">
            Claude analyzes your menu using 5 research-backed AOV strategies and generates offers for your approval.
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

      {/* Strategy legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { type: "combo",   icon: "🎁", label: "Combo",   desc: "3-item bundles, 18% off" },
          { type: "addon",   icon: "➕", label: "Add-on",  desc: "Smart sensory pairings" },
          { type: "upgrade", icon: "⬆️", label: "Upgrade", desc: "Premium version upsell" },
          { type: "special", icon: "⭐", label: "Special",  desc: "Featured daily promotion" },
        ].map((s) => (
          <div key={s.type} className={`rounded-xl p-3 border ${TYPE_STYLES[s.type]}`}>
            <p className="font-semibold text-sm">{s.icon} {s.label}</p>
            <p className="text-[11px] opacity-70 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 rounded-3xl bg-white">
          <p className="text-4xl mb-4">🤖</p>
          <p className="text-gray-700 font-bold text-[15px]">No suggestions yet</p>
          <p className="text-gray-400 text-[13px] mt-1">Click &quot;Generate Suggestions&quot; to let Claude analyze your menu</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["pending", "approved", "rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-2xl text-[13px] font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white"
                }`}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-400 text-[13px] text-center py-12">No {activeTab} suggestions.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((s) => {
                const needsPrice   = s.type === "combo" || s.type === "special";
                const isUpgrade    = s.type === "upgrade";
                const editedRaw    = editedPrices[s.id] ?? s.comboPrice?.toFixed(2) ?? "";
                const editedNum    = parseFloat(editedRaw);
                const effectivePrice = !isNaN(editedNum) && editedNum > 0
                  ? editedNum
                  : (s.comboPrice ?? 0);
                const savings      = s.originalTotal - effectivePrice;
                const pct          = s.originalTotal > 0 ? Math.round((savings / s.originalTotal) * 100) : 0;
                const isValidPrice = !isNaN(editedNum) && editedNum > 0 && editedNum < s.originalTotal;
                const isBusy       = submitting[s.id];
                const dur          = durations[s.id] ?? "never";
                const hint         = revenueHint(s);
                const isExpired    = s.offerEndsAt ? new Date(s.offerEndsAt) < new Date() : false;

                return (
                  <div key={s.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                    {/* Card header */}
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${TYPE_STYLES[s.type] ?? ""}`}>
                              {TYPE_LABEL[s.type] ?? s.type}
                            </span>
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[s.status]}`}>
                              {s.status}
                            </span>
                            {s.status === "approved" && s.offerEndsAt && (
                              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${isExpired ? "bg-red-50 text-red-500 border-red-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}>
                                {isExpired ? "⏱ Expired" : `⏱ ${timeLeft(s.offerEndsAt)}`}
                              </span>
                            )}
                            {s.status === "approved" && !s.offerEndsAt && (
                              <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                🟢 Always active
                              </span>
                            )}
                            {hint && (
                              <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 ml-auto hidden sm:inline-flex">
                                💰 {hint}
                              </span>
                            )}
                          </div>

                          <h3 className="text-gray-900 font-bold text-[15px]">{s.title}</h3>
                          <p className="text-gray-400 text-[13px] mt-1">{s.reasoning}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {s.itemNames.map((name, i) => (
                              <span key={i} className="bg-gray-100 text-gray-600 text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-medium">
                                {name}
                                {s.itemPrices[i] > 0 && (
                                  <span className="text-gray-400">${s.itemPrices[i].toFixed(2)}</span>
                                )}
                              </span>
                            ))}
                          </div>

                          {isUpgrade && s.comboPrice != null && (
                            <p className="text-sky-600 text-[12px] mt-2 font-semibold">
                              Upgrade fee: +${s.comboPrice.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {s.status === "rejected" && (
                          <span className="text-[12px] text-gray-400 shrink-0 font-medium">Rejected</span>
                        )}

                        {s.status === "approved" && needsPrice && s.comboPrice != null && (
                          <div className="shrink-0 text-right">
                            <p className="text-emerald-600 font-extrabold text-[18px]">${s.comboPrice.toFixed(2)}</p>
                            {s.originalTotal > 0 && (
                              <>
                                <p className="text-gray-300 text-[12px] line-through">${s.originalTotal.toFixed(2)}</p>
                                <p className="text-emerald-500 text-[11px] font-bold">
                                  Saves ${(s.originalTotal - s.comboPrice).toFixed(2)} ({Math.round(((s.originalTotal - s.comboPrice) / s.originalTotal) * 100)}%)
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Approval panel for combos/specials (pending) ── */}
                    {needsPrice && s.status === "pending" && (
                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">
                        <div className="flex items-center gap-6 text-sm flex-wrap">
                          <div>
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-0.5">Individual total</p>
                            <p className="text-gray-900 font-bold">${s.originalTotal.toFixed(2)}</p>
                          </div>
                          <div className="text-gray-300">→</div>
                          <div>
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-0.5">AI suggested</p>
                            <p className="text-purple-600 font-bold">${s.comboPrice?.toFixed(2) ?? "—"}</p>
                          </div>
                          {savings > 0 && isValidPrice && (
                            <>
                              <div className="text-gray-300">·</div>
                              <div>
                                <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-0.5">Customer saves</p>
                                <p className="text-emerald-600 font-bold">${savings.toFixed(2)} ({pct}%)</p>
                              </div>
                            </>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-2">Set price</label>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative flex-1 max-w-[180px]">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={editedRaw}
                                onChange={(e) => setEditedPrices((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                className={`w-full bg-white border rounded-2xl pl-7 pr-3 py-2.5 text-gray-900 font-bold text-[16px] focus:outline-none transition-colors shadow-sm ${
                                  !isValidPrice && editedRaw !== ""
                                    ? "border-red-300 focus:border-red-400"
                                    : "border-gray-200 focus:border-amber-400"
                                }`}
                              />
                            </div>
                            <div className="flex gap-1.5">
                              {[10, 15, 20].map((pctOff) => {
                                const price = Math.floor(s.originalTotal * (1 - pctOff / 100) * 100) / 100;
                                return (
                                  <button
                                    key={pctOff}
                                    onClick={() => setEditedPrices((prev) => ({ ...prev, [s.id]: price.toFixed(2) }))}
                                    className="text-[12px] px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors font-medium"
                                  >
                                    -{pctOff}%
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          {editedRaw !== "" && !isValidPrice && (
                            <p className="text-red-500 text-[12px] mt-1.5">Price must be between $0.01 and ${s.originalTotal.toFixed(2)}</p>
                          )}
                          {isValidPrice && savings > 0 && (
                            <p className="text-emerald-600 text-[12px] mt-1.5 font-semibold">✓ Customers save ${savings.toFixed(2)} ({pct}% off)</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2">Offer duration</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {DURATION_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setDurations((prev) => ({ ...prev, [s.id]: opt.value }))}
                                className={`text-left px-3 py-2 rounded-2xl border text-[12px] transition-colors ${
                                  dur === opt.value
                                    ? "border-amber-400 bg-amber-50 text-amber-700"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                <p className="font-semibold">{opt.label}</p>
                                <p className="opacity-60 text-[11px]">{opt.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => review(s, "approved")}
                            disabled={isBusy || !isValidPrice}
                            className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[13px] font-bold rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isBusy ? "Saving…" : `✓ Approve at $${effectivePrice.toFixed(2)}${dur !== "never" ? ` · ${DURATION_OPTIONS.find((o) => o.value === dur)?.label}` : ""}`}
                          </button>
                          <button
                            onClick={() => review(s, "rejected")}
                            disabled={isBusy}
                            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[13px] font-bold rounded-2xl transition-colors disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Approval panel for non-price pending (addon/upgrade) */}
                    {!needsPrice && s.status === "pending" && (
                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2">Offer duration</p>
                          <div className="flex gap-2 flex-wrap">
                            {DURATION_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setDurations((prev) => ({ ...prev, [s.id]: opt.value }))}
                                className={`px-3 py-1.5 rounded-2xl border text-[12px] font-medium transition-colors ${
                                  dur === opt.value
                                    ? "border-amber-400 bg-amber-50 text-amber-700"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => review(s, "approved")}
                            disabled={isBusy}
                            className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[13px] font-bold rounded-2xl transition-colors disabled:opacity-50"
                          >
                            {isBusy ? "Saving…" : `✓ Approve${dur !== "never" ? ` · ${DURATION_OPTIONS.find((o) => o.value === dur)?.label}` : ""}`}
                          </button>
                          <button
                            onClick={() => review(s, "rejected")}
                            disabled={isBusy}
                            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[13px] font-bold rounded-2xl transition-colors disabled:opacity-50"
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
