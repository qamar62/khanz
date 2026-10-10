"use client";

import { useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useStaff, useStaffData } from "@/components/dashboard/staff-context";
import { OrderCard } from "@/components/dashboard/order-card";
import { Button, Card, Empty, ErrorNote, Loading, PageHeader, SearchInput, Segmented, StatusBadge, dateLabel, money } from "@/components/dashboard/ui";
import type { Order } from "@/lib/api";
import { branchParam } from "@/lib/staff-api";

type View = "active" | "all" | "collected" | "cancelled" | "awaiting_payment";

export default function OrdersPage() {
  const { branch } = useStaff();
  const [view, setView] = useState<View>("active");
  const [kind, setKind] = useState<"" | "pickup" | "preorder">("");
  const [query, setQuery] = useState("");
  const params = [branchParam(branch), `status=${view}`, kind ? `kind=${kind}` : "", query ? `q=${encodeURIComponent(query)}` : ""].filter(Boolean).join("&");
  const { data, error, loading, reload, setData } = useStaffData<Order[]>(`/staff/orders/?${params}`, view === "active" ? 15_000 : 0);
  const update = (next: Order) => setData((current) => (current ?? []).map((order) => (order.reference === next.reference ? next : order)).filter((order) => view !== "active" || ["confirmed", "preparing", "ready"].includes(order.status)));
  const columns: { status: Order["status"]; title: string }[] = [
    { status: "confirmed", title: "New" }, { status: "preparing", title: "On cooking" }, { status: "ready", title: "Ready to collect" },
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Pickup orders and table pre-orders. Only paid orders reach the kitchen."
        actions={<><SearchInput value={query} onChange={setQuery} placeholder="Search reference, name, phone" /><Button variant="outline" onClick={reload}><RefreshCw className="h-4 w-4" />Refresh</Button></>}
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented<View> value={view} onChange={setView} options={[
          { value: "active", label: "Kitchen board" }, { value: "all", label: "All orders" }, { value: "collected", label: "Collected" },
          { value: "awaiting_payment", label: "Unpaid" }, { value: "cancelled", label: "Cancelled" },
        ]} />
        <Segmented<"" | "pickup" | "preorder"> value={kind} onChange={setKind} options={[{ value: "", label: "All types" }, { value: "pickup", label: "Takeaway" }, { value: "preorder", label: "Dine-in pre-orders" }]} />
      </div>
      {error ? <ErrorNote message={error} /> : null}
      {loading && !data ? <Loading /> : !data ? null : view === "active" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => {
            const orders = data.filter((order) => order.status === column.status);
            return (
              <div key={column.status} className="rounded-2xl bg-black/[.03] p-3">
                <div className="mb-3 flex items-center justify-between px-1"><span className="text-sm font-semibold">{column.title}</span><span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold tabular-nums">{orders.length}</span></div>
                <div className="space-y-3">
                  {orders.length ? orders.map((order) => <OrderCard key={order.reference} order={order} onChange={update} />) : <p className="rounded-xl border border-dashed border-black/10 px-3 py-8 text-center text-sm text-black/40">Nothing here</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : data.length ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b border-black/[.06] text-left text-xs uppercase tracking-wide text-black/40"><th className="px-5 py-3 font-medium">Order</th><th className="px-3 py-3 font-medium">Customer</th><th className="px-3 py-3 font-medium">Type</th><th className="px-3 py-3 font-medium">Pickup / table</th><th className="px-3 py-3 font-medium">Restaurant</th><th className="px-3 py-3 text-right font-medium">Total</th><th className="px-5 py-3 text-right font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-black/[.05]">
              {data.map((order) => (
                <tr key={order.reference} className="hover:bg-black/[.015]">
                  <td className="px-5 py-3"><span className="font-mono text-xs font-semibold">{order.reference}</span><span className="block text-xs text-black/45">{dateLabel(order.created_at, true)}</span></td>
                  <td className="px-3 py-3">{order.name}<span className="block text-xs text-black/45">{order.phone}{order.is_guest ? " · guest" : ""}</span></td>
                  <td className="px-3 py-3">{order.kind === "preorder" ? "Dine-in pre-order" : "Takeaway"}</td>
                  <td className="px-3 py-3">{dateLabel(order.pickup_at, true)}</td>
                  <td className="px-3 py-3 text-black/60">{order.branch_name}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{money(order.total, order.currency)}{Number(order.discount) > 0 ? <span className="block text-xs font-normal text-emerald-700">−{money(order.discount)} promo</span> : null}</td>
                  <td className="px-5 py-3 text-right"><StatusBadge status={order.status} /><span className="mt-1 block"><StatusBadge status={order.payment_status} /></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : <Card><Empty icon={ClipboardList} title="No orders found" text="Try another filter or restaurant." /></Card>}
    </>
  );
}
