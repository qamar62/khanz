"use client";

import { useState } from "react";
import { CalendarDays, Clock, Package, Phone, ShoppingBag, UtensilsCrossed } from "lucide-react";
import type { Order } from "@/lib/api";
import { staffFetch } from "@/lib/staff-api";
import { cn } from "@/lib/utils";
import { Button, StatusBadge, money, timeLabel } from "./ui";

const NEXT_STEP: Partial<Record<Order["status"], { status: Order["status"]; label: string }>> = {
  confirmed: { status: "preparing", label: "Start cooking" },
  preparing: { status: "ready", label: "Mark ready" },
  ready: { status: "collected", label: "Collected" },
};

/** One order in the queue, with the next kitchen step as a button. */
export function OrderCard({ order, onChange, compact = false }: { order: Order; onChange?: (order: Order) => void; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const next = NEXT_STEP[order.status];
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);

  async function move(status: string) {
    setBusy(true); setError("");
    const response = await staffFetch<Order>(`/staff/orders/${order.reference}/`, { method: "PATCH", body: JSON.stringify({ status }) });
    setBusy(false);
    if (response.data) onChange?.(response.data); else setError(response.error ?? "Could not update.");
  }

  return (
    <article className={cn("flex flex-col rounded-2xl border border-black/[.08] bg-white p-4", order.status === "ready" && "border-emerald-200 bg-emerald-50/40")}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-black/55">#{order.reference}</span>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-3 truncate font-semibold">{order.name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-black/50">
        {order.kind === "preorder" ? <CalendarDays className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
        {order.kind === "preorder" ? `Table booking ${order.reservation_reference ?? ""}` : order.pickup_asap ? "ASAP pickup" : "Pickup"} · {timeLabel(order.pickup_at)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-2 py-1 hover:bg-black/[.03]"><Package className="h-3.5 w-3.5" />{count} items</button>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-2 py-1">{order.kind === "preorder" ? <UtensilsCrossed className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}{order.kind === "preorder" ? "Dine-in" : "Takeaway"}</span>
        {!compact ? <span className="ml-auto font-semibold tabular-nums">{money(order.total, order.currency)}</span> : null}
      </div>
      {open || !compact ? (
        <ul className="mt-3 space-y-1 border-t border-dashed border-black/10 pt-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-2"><span className="w-6 shrink-0 font-semibold">{item.quantity}×</span><span className="min-w-0">{item.name}{item.options.length ? <span className="block text-xs text-black/50">{item.options.map((o) => o.name).join(", ")}</span> : null}{item.notes ? <span className="block text-xs italic text-amber-700">“{item.notes}”</span> : null}</span></li>
          ))}
          {order.notes ? <li className="rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-800">Note: {order.notes}</li> : null}
        </ul>
      ) : null}
      {!compact ? <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="mt-3 inline-flex items-center gap-1.5 text-xs text-black/50 hover:text-black"><Phone className="h-3.5 w-3.5" />{order.phone}</a> : null}
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
      {next ? (
        <div className="mt-auto flex gap-2 pt-4">
          <Button className="flex-1" disabled={busy} onClick={() => move(next.status)}>{next.label}</Button>
          {order.status !== "ready" && !compact ? <Button variant="danger" disabled={busy} onClick={() => { if (window.confirm(`Cancel order ${order.reference}? Refund it in Stripe if it was paid.`)) move("cancelled"); }}>Cancel</Button> : null}
        </div>
      ) : null}
    </article>
  );
}
