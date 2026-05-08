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
    prisma.customer.count({ where: { restaurantId: restaurant.id, visitedAt: { gte: today } } }),
    prisma.customer.count({ where: { restaurantId: restaurant.id, phone: { not: null } } }),
    prisma.customer.count({ where: { restaurantId: restaurant.id, smsSent: true } }),
    prisma.customer.count({ where: { restaurantId: restaurant.id, reviewClicked: true } }),
  ]);

  const totalScans = restaurant._count.customers;
  const captureRate = totalScans > 0 ? Math.round((captured / totalScans) * 100) : 0;

  const stats = [
    { label: "Total Scans",       value: totalScans, sub: `+${scansToday} today`,           icon: "📱", color: "#6366F1" },
    { label: "Contacts Captured", value: captured,   sub: `${captureRate}% capture rate`,    icon: "👥", color: "#F59E0B" },
    { label: "SMS Sent",          value: smsSent,    sub: "review requests",                 icon: "💬", color: "#10B981" },
    { label: "Reviews Clicked",   value: reviewsClicked, sub: "Google review link taps",     icon: "⭐", color: "#EF4444" },
  ];

  const quickActions = [
    { href: "/dashboard/menu",     label: "Menu Builder",       desc: "Add categories and items",     icon: "🍽️", color: "#FFF7ED" },
    { href: "/dashboard/tables",   label: "Generate QR Codes",  desc: "One per table",                icon: "📱", color: "#F0F9FF" },
    { href: "/dashboard/settings", label: "Restaurant Settings", desc: "Logo, Google review link",     icon: "⚙️", color: "#F0FDF4" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="font-bold tracking-tight" style={{ fontSize: "26px", color: "#1C1A17", letterSpacing: "-0.5px" }}>{restaurant.name}</h2>
        <p className="mt-1" style={{ fontSize: "14px", color: "#9E9A8E" }}>
          Menu live at{" "}
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="font-semibold underline underline-offset-2 transition-colors"
            style={{ color: "#D97706" }}
          >
            /menu/{restaurant.slug}
          </Link>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 space-y-3"
            style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #EDEBE6", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ fontSize: "13px", color: "#9E9A8E" }}>{s.label}</span>
              <div className="flex items-center justify-center" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: `${s.color}15`, fontSize: "16px" }}>
                {s.icon}
              </div>
            </div>
            <div className="font-bold leading-none tracking-tight" style={{ fontSize: "32px", color: "#1C1A17", letterSpacing: "-1px" }}>{s.value}</div>
            <div className="font-medium" style={{ fontSize: "12px", color: "#C7C3BB" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-bold mb-3 tracking-tight" style={{ fontSize: "15px", color: "#1C1A17" }}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-4 p-5 transition-all active:scale-[0.98]"
              style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #EDEBE6", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: a.color, fontSize: "22px" }}>
                {a.icon}
              </div>
              <div>
                <p className="font-bold" style={{ fontSize: "14px", color: "#1C1A17" }}>{a.label}</p>
                <p className="mt-0.5" style={{ fontSize: "12px", color: "#9E9A8E" }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
