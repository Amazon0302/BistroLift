"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Table {
  id: string;
  number: number;
  restaurantId: string;
}

interface Props {
  restaurantId: string;
  restaurantSlug: string;
  initialTables: Table[];
}

function menuUrl(slug: string, tableId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/menu/${slug}?table=${tableId}`;
}

function QRCode({ url, tableNumber }: { url: string; tableNumber: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    import("qrcode").then((QRCodeLib) => {
      QRCodeLib.default
        .toDataURL(url, {
          width: 300,
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        })
        .then(setDataUrl);
    });
  }, [url]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `table-${tableNumber}-qr.png`;
    a.click();
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-4">
      <p className="text-white font-semibold">Table {tableNumber}</p>
      {dataUrl ? (
        <img src={dataUrl} alt={`QR Table ${tableNumber}`} className="rounded-xl w-36 h-36" />
      ) : (
        <div className="w-36 h-36 bg-zinc-800 rounded-xl animate-pulse" />
      )}
      <p className="text-xs text-zinc-500 text-center break-all max-w-[140px]">{url}</p>
      <div className="flex gap-2 w-full">
        <button
          onClick={download}
          disabled={!dataUrl}
          className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-sm font-medium py-2 rounded-xl transition-colors"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

export default function TablesManager({ restaurantId, restaurantSlug, initialTables }: Props) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [nextNumber, setNextNumber] = useState(
    initialTables.length > 0 ? Math.max(...initialTables.map((t) => t.number)) + 1 : 1
  );
  const [adding, setAdding] = useState(false);

  async function addTable() {
    setAdding(true);
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: nextNumber }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) { toast.error(data.error ?? "Failed"); return; }
    setTables((prev) => [...prev, data]);
    setNextNumber((n) => n + 1);
    toast.success(`Table ${nextNumber} added`);
  }

  async function deleteTable(id: string) {
    if (!confirm("Delete this table?")) return;
    const res = await fetch("/api/tables", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { toast.error("Failed"); return; }
    setTables((prev) => prev.filter((t) => t.id !== id));
    toast.success("Table removed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={addTable}
          disabled={adding}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          {adding ? "Adding..." : `+ Add Table ${nextNumber}`}
        </button>
        <p className="text-zinc-500 text-sm">
          {tables.length} table{tables.length !== 1 ? "s" : ""} configured
        </p>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-5xl mb-4">📱</p>
          <p className="text-lg">No tables yet. Add your first table to generate a QR code.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="relative group">
              <QRCode
                url={menuUrl(restaurantSlug, table.id)}
                tableNumber={table.number}
              />
              <button
                onClick={() => deleteTable(table.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs px-2 py-1 rounded-lg transition-all"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
