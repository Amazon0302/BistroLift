"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const INPUT_STYLE = {
  backgroundColor: "#FAFAF8",
  border: "1.5px solid #EDEBE6",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  color: "#1C1A17",
  width: "100%",
} as const;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        name: fd.get("name"),
        restaurantName: fd.get("restaurantName"),
        slug: fd.get("slug"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Registration failed");
    } else {
      toast.success("Account created! Please sign in.");
      router.push("/login");
    }
  }

  function focusBorder(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#1C1A17";
  }
  function blurBorder(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#EDEBE6";
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{ backgroundColor: "rgba(217,119,6,0.07)" }} />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full" style={{ backgroundColor: "rgba(217,119,6,0.05)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4" style={{ width: "60px", height: "60px", borderRadius: "18px", backgroundColor: "#1C1A17", fontSize: "24px", boxShadow: "0 8px 24px rgba(0,0,0,0.16)" }}>
            🍽️
          </div>
          <h1 className="font-bold tracking-tight" style={{ fontSize: "28px", color: "#1C1A17", letterSpacing: "-0.5px" }}>
            Bistro<span style={{ color: "#D97706" }}>Lift</span>
          </h1>
          <p className="mt-1" style={{ fontSize: "14px", color: "#9E9A8E" }}>Create your restaurant account</p>
        </div>

        {/* Card */}
        <div className="p-7 space-y-4" style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #EDEBE6", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold" style={{ fontSize: "13px", color: "#706B5E" }}>Your Name</label>
                <input name="name" type="text" placeholder="John" className="focus:outline-none transition-colors" style={INPUT_STYLE} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold" style={{ fontSize: "13px", color: "#706B5E" }}>Email *</label>
                <input name="email" type="email" required placeholder="you@email.com" className="focus:outline-none transition-colors" style={INPUT_STYLE} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold" style={{ fontSize: "13px", color: "#706B5E" }}>Restaurant Name *</label>
              <input name="restaurantName" type="text" required placeholder="Bella Cucina" className="focus:outline-none transition-colors" style={INPUT_STYLE} onFocus={focusBorder} onBlur={blurBorder} />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold" style={{ fontSize: "13px", color: "#706B5E" }}>
                Menu URL Slug *{" "}
                <span className="font-normal" style={{ fontSize: "12px", color: "#C7C3BB" }}>e.g. bella-cucina</span>
              </label>
              <input name="slug" type="text" required placeholder="bella-cucina" pattern="[a-z0-9\-]+" className="focus:outline-none transition-colors" style={INPUT_STYLE} onFocus={focusBorder} onBlur={blurBorder} />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold" style={{ fontSize: "13px", color: "#706B5E" }}>Password *</label>
              <input name="password" type="password" required minLength={8} placeholder="Min. 8 characters" className="focus:outline-none transition-colors" style={INPUT_STYLE} onFocus={focusBorder} onBlur={blurBorder} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full font-bold text-white disabled:opacity-50 transition-all active:scale-[0.98] mt-1"
              style={{ paddingTop: "14px", paddingBottom: "14px", fontSize: "15px", backgroundColor: "#1C1A17", boxShadow: "0 4px 16px rgba(28,26,23,0.25)" }}
            >
              {loading ? "Creating account…" : "Create Restaurant →"}
            </button>
          </form>

          <p className="text-center" style={{ fontSize: "13px", color: "#9E9A8E" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold transition-colors" style={{ color: "#D97706" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
