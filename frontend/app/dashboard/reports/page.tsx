"use client";

import { useState } from "react";
import { BarChart3, DollarSign, Percent, Receipt, ShoppingBag } from "lucide-react";
import { useStaff, useStaffData } from "@/components/dashboard/staff-context";
import { Card, CardHeader, Empty, ErrorNote, Loading, PageHeader, Segmented, StatCard, money } from "@/components/dashboard/ui";
import { Sales, branchParam } from "@/lib/staff-api";

export default function ReportsPage() {
  const { branch } = useStaff();
  const [days, setDays] = useState<"7" | "30" | "90">("30");
  const { data, error, loading } = useStaffData<Sales>(`/staff/sales/?days=${days}&${branchParam(branch)}`);
  const max = Math.max(1, ...(data?.series.map((point) => Number(point.revenue)) ?? [0]));

  return (
    <>
      <PageHeader title="Sales reports" subtitle="Paid online orders (pickup and table pre-orders). In-restaurant sales are not included yet." actions={<Segmented value={days} onChange={setDays} options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }]} />} />
      {error ? <ErrorNote message={error} /> : null}
      {loading && !data ? <Loading /> : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={DollarSign} label="Revenue" value={money(data.totals.revenue)} hint={`Food ${money(data.totals.food)}`} />
            <StatCard icon={ShoppingBag} label="Paid orders" value={data.totals.orders} hint={`Average ${money(data.average_order)}`} />
            <StatCard icon={Percent} label="Promotion discounts" value={money(data.totals.discount)} />
            <StatCard icon={Receipt} label="Card fees collected" value={money(data.totals.fees)} hint="Charged to customers (2.5%)" />
          </div>

          <Card>
            <CardHeader title="Daily revenue" subtitle={`Last ${data.days} days`} />
            {data.totals.orders ? (
              <div className="px-5 pb-5 pt-6">
                <div className="flex h-56 items-end gap-[3px]">
                  {data.series.map((point) => {
                    const value = Number(point.revenue);
                    return (
                      <div key={point.date} className="group relative flex h-full flex-1 items-end">
                        <div className="w-full rounded-t-[4px] bg-[#c79532] transition-colors group-hover:bg-[#242b18]" style={{ height: `${Math.max((value / max) * 100, value ? 2 : 0.5)}%`, opacity: value ? 1 : 0.25 }} />
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1b2112] px-2.5 py-1.5 text-xs text-white group-hover:block">
                          {new Date(`${point.date}T12:00:00`).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })} · {money(value)} · {point.orders} orders
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-black/40">
                  <span>{new Date(`${data.series[0].date}T12:00:00`).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>
                  <span>Today</span>
                </div>
              </div>
            ) : <Empty icon={BarChart3} title="No paid orders in this period" />}
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader title="Best-selling dishes" />
              {data.top_items.length ? (
                <ul className="divide-y divide-black/[.05]">
                  {data.top_items.map((item, index) => (
                    <li key={item.name} className="flex items-center gap-3 px-5 py-3 text-sm">
                      <span className="w-5 text-xs font-semibold text-black/35">{index + 1}</span>
                      <span className="flex-1 font-medium">{item.name}</span>
                      <span className="w-16 text-right tabular-nums text-black/55">{item.quantity} sold</span>
                      <span className="w-24 text-right font-semibold tabular-nums">{money(item.revenue)}</span>
                    </li>
                  ))}
                </ul>
              ) : <Empty icon={ShoppingBag} title="No sales yet" />}
            </Card>
            <Card>
              <CardHeader title="By order type" />
              <ul className="space-y-4 p-5">
                {(["pickup", "preorder"] as const).map((kind) => {
                  const row = data.by_kind.find((entry) => entry.kind === kind);
                  const share = Number(data.totals.revenue) ? (Number(row?.revenue ?? 0) / Number(data.totals.revenue)) * 100 : 0;
                  return (
                    <li key={kind}>
                      <div className="flex justify-between text-sm"><span className="font-medium">{kind === "pickup" ? "Takeaway pickup" : "Table pre-orders"}</span><span className="tabular-nums">{money(row?.revenue ?? 0)}</span></div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[.05]"><div className="h-full rounded-full bg-[#242b18]" style={{ width: `${share}%` }} /></div>
                      <p className="mt-1 text-xs text-black/45">{row?.orders ?? 0} orders · {share.toFixed(0)}%</p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
