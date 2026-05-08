"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard",             label: "Overview",     icon: "📊" },
  { href: "/dashboard/menu",        label: "Menu Builder", icon: "🍽️" },
  { href: "/dashboard/tables",      label: "QR Codes",     icon: "📱" },
  { href: "/dashboard/customers",   label: "Customers",    icon: "👥" },
  { href: "/dashboard/suggestions", label: "AI Upsells",   icon: "✨" },
  { href: "/dashboard/settings",    label: "Settings",     icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col" style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #EDEBE6", boxShadow: "2px 0 12px rgba(0,0,0,0.04)" }}>
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid #EDEBE6" }}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#1C1A17", fontSize: "16px" }}>
            🍽️
          </div>
          <div>
            <h1 className="font-bold leading-none" style={{ fontSize: "17px", color: "#1C1A17" }}>
              Bistro<span style={{ color: "#D97706" }}>Lift</span>
            </h1>
            <p className="mt-0.5" style={{ fontSize: "11px", color: "#9E9A8E" }}>Restaurant Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all"
              style={{
                fontSize: "13px",
                backgroundColor: isActive ? "#1C1A17" : "transparent",
                color: isActive ? "#FFFFFF" : "#9E9A8E",
              }}
            >
              <span style={{ fontSize: "15px", lineHeight: 1 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3" style={{ borderTop: "1px solid #EDEBE6" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl font-semibold transition-all"
          style={{ fontSize: "13px", color: "#9E9A8E" }}
        >
          <span style={{ fontSize: "15px", lineHeight: 1 }}>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
