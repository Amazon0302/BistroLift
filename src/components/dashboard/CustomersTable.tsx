"use client";

import { useState } from "react";

interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  tableNumber: number | null;
  visitedAt: string;
  smsSent: boolean;
  reviewClicked: boolean;
}

interface Props {
  customers: Customer[];
}

export default function CustomersTable({ customers }: Props) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      String(c.tableNumber).includes(q)
    );
  });

  const captured = customers.filter((c) => c.phone).length;

  function exportCSV() {
    const rows = [
      ["Name", "Phone", "Table", "Visited At", "SMS Sent", "Review Clicked"],
      ...customers.map((c) => [
        c.name ?? "",
        c.phone ?? "",
        c.tableNumber?.toString() ?? "",
        new Date(c.visitedAt).toLocaleString(),
        c.smsSent ? "Yes" : "No",
        c.reviewClicked ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or table..."
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm w-64"
        />
        <button
          onClick={exportCSV}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          Export CSV
        </button>
        <p className="text-zinc-500 text-sm ml-auto">
          {captured} contacts captured / {customers.length} total scans
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-4xl mb-3">👥</p>
          <p>No customers yet. Scans will appear here once customers visit your menu.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Table</th>
                <th className="px-5 py-3 text-left">Visited</th>
                <th className="px-5 py-3 text-center">SMS</th>
                <th className="px-5 py-3 text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-white">{c.name ?? <span className="text-zinc-600">—</span>}</td>
                  <td className="px-5 py-3 text-zinc-300">{c.phone ?? <span className="text-zinc-600">—</span>}</td>
                  <td className="px-5 py-3 text-zinc-400">
                    {c.tableNumber ? `Table ${c.tableNumber}` : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-5 py-3 text-zinc-400">
                    {new Date(c.visitedAt).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {c.smsSent ? (
                      <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full">Sent</span>
                    ) : c.phone ? (
                      <span className="text-zinc-500 text-xs">Pending</span>
                    ) : (
                      <span className="text-zinc-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {c.reviewClicked ? (
                      <span className="text-amber-400 text-xs bg-amber-500/10 px-2 py-1 rounded-full">⭐ Clicked</span>
                    ) : (
                      <span className="text-zinc-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
