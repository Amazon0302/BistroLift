"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FAFAF8" }}>
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
          <p className="mt-1" style={{ fontSize: "14px", color: "#9E9A8E" }}>Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="p-7 space-y-5" style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #EDEBE6", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-semibold" htmlFor="email" style={{ fontSize: "13px", color: "#706B5E" }}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@restaurant.com"
                className="w-full focus:outline-none transition-colors"
                style={{ backgroundColor: "#FAFAF8", border: "1.5px solid #EDEBE6", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#1C1A17" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1C1A17")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#EDEBE6")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold" htmlFor="password" style={{ fontSize: "13px", color: "#706B5E" }}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full focus:outline-none transition-colors"
                style={{ backgroundColor: "#FAFAF8", border: "1.5px solid #EDEBE6", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#1C1A17" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1C1A17")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#EDEBE6")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full font-bold text-white disabled:opacity-50 transition-all active:scale-[0.98] mt-2"
              style={{ paddingTop: "14px", paddingBottom: "14px", fontSize: "15px", backgroundColor: "#1C1A17", boxShadow: "0 4px 16px rgba(28,26,23,0.25)" }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="text-center" style={{ fontSize: "13px", color: "#9E9A8E" }}>
            No account?{" "}
            <Link href="/register" className="font-semibold transition-colors" style={{ color: "#D97706" }}>
              Register your restaurant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
