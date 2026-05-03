"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Bistro<span className="text-amber-400">Lift</span>
          </h1>
          <p className="text-zinc-400 mt-2">Create your restaurant account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Your Name</label>
              <input
                name="name"
                type="text"
                placeholder="John"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Email *</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@email.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Restaurant Name *</label>
            <input
              name="restaurantName"
              type="text"
              required
              placeholder="Bella Cucina"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              Menu URL Slug *{" "}
              <span className="text-zinc-600 text-xs">(e.g. bella-cucina → /menu/bella-cucina)</span>
            </label>
            <input
              name="slug"
              type="text"
              required
              placeholder="bella-cucina"
              pattern="[a-z0-9\-]+"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Password *</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Creating account..." : "Create Restaurant →"}
          </button>

          <p className="text-center text-zinc-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
