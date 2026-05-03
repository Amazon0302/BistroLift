import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      _count: { select: { customers: true, tables: true, categories: true } },
    },
  });

  if (!restaurant) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [scansToday, captured, smsSent, reviewsClicked] = await Promise.all([
    prisma.customer.count({
      where: { restaurantId: restaurant.id, visitedAt: { gte: today } },
    }),
    prisma.customer.count({
      where: { restaurantId: restaurant.id, phone: { not: null } },
    }),
    prisma.customer.count({
      where: { restaurantId: restaurant.id, smsSent: true },
    }),
    prisma.customer.count({
      where: { restaurantId: restaurant.id, reviewClicked: true },
    }),
  ]);

  const totalScans = restaurant._count.customers;
  const captureRate = totalScans > 0 ? Math.round((captured / totalScans) * 100) : 0;

  const stats = [
    { label: "Total Scans", value: totalScans, sub: `+${scansToday} today`, icon: "📱" },
    { label: "Contacts Captured", value: captured, sub: `${captureRate}% capture rate`, icon: "👥" },
    { label: "SMS Sent", value: smsSent, sub: "review requests", icon: "💬" },
    { label: "Reviews Clicked", value: reviewsClicked, sub: "Google review link taps", icon: "⭐" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{restaurant.name}</h2>
        <p className="text-zinc-400 mt-1">
          Your menu is live at{" "}
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            /menu/{restaurant.slug}
          </Link>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">{s.label}</span>
              <span className="text-xl">{s.icon}</span>
            </div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-zinc-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/menu", label: "Build Your Menu", desc: "Add categories and items", icon: "🍽️" },
          { href: "/dashboard/tables", label: "Generate QR Codes", desc: "One per table", icon: "📱" },
          { href: "/dashboard/settings", label: "Restaurant Settings", desc: "Logo, Google review link", icon: "⚙️" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 flex items-center gap-4 transition-colors"
          >
            <span className="text-3xl">{a.icon}</span>
            <div>
              <p className="font-semibold text-white">{a.label}</p>
              <p className="text-sm text-zinc-400">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
