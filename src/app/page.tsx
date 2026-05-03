import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-sm">
          ✦ Smart Digital Menu Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Bistro<span className="text-amber-400">Lift</span>
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Turn your menu into a premium digital experience. Increase orders,
          collect customer data, and grow your reviews — all from a QR code.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Start Free →
          </Link>
          <Link
            href="/login"
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-8 py-4 rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800 text-center">
          {[
            { label: "QR Menus", icon: "📱" },
            { label: "Upselling", icon: "📈" },
            { label: "SMS Reviews", icon: "⭐" },
          ].map((f) => (
            <div key={f.label} className="space-y-2">
              <div className="text-2xl">{f.icon}</div>
              <div className="text-sm text-zinc-400">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
