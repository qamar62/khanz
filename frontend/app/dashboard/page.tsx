"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, DollarSign, Flame, TrendingUp, Users } from "lucide-react";
import { useStaff, useStaffData } from "@/components/dashboard/staff-context";
import { OrderCard } from "@/components/dashboard/order-card";
import { Card, CardHeader, Empty, ErrorNote, Loading, PageHeader, StatCard, StatusBadge, dateLabel, money, time24to12 } from "@/components/dashboard/ui";
import { Overview, branchParam } from "@/lib/staff-api";

export default function DashboardHome() {
  const { branch, user } = useStaff();
  const { data, error, loading, reload } = useStaffData<Overview>(`/staff/overview/?${branchParam(branch)}`, 20_000);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader title={`${greeting}, ${user?.name.split(" ")[0]}`} subtitle={data ? `${dateLabel(data.date)} · updates every 20 seconds` : "Today at a glance"} />
      {error ? <ErrorNote message={error} /> : null}
      {loading && !data ? <Loading /> : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={DollarSign} label="Revenue today" value={money(data.stats.revenue_today)} hint={`${money(data.stats.revenue_7d)} in the last 7 days`} />
            <StatCard icon={ClipboardList} label="Paid orders today" value={data.stats.orders_today} hint={`${data.stats.active_orders} in the kitchen now`} />
            <StatCard icon={CalendarDays} label="Bookings today" value={data.stats.bookings_today} hint={`${data.stats.pending_bookings} waiting for confirmation`} />
            <StatCard icon={Users} label="Guests today" value={data.stats.guests_today} hint="From table reservations" />
          </div>

          <Card>
            <CardHeader title="Order queue" subtitle="Paid orders being prepared, oldest pickup first" action={<Link href="/dashboard/orders" className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/[.03]">View all</Link>} />
            {data.queue.length ? (
              <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
                {data.queue.map((order) => <OrderCard key={order.reference} order={order} compact onChange={reload} />)}
              </div>
            ) : <Empty icon={Flame} title="The kitchen is clear" text="New paid orders appear here automatically." />}
          </Card>

          <Card>
            <CardHeader title="Upcoming bookings" subtitle="Next tables to welcome" action={<Link href="/dashboard/reservations" className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/[.03]">Open reservations</Link>} />
            {data.upcoming_bookings.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead><tr className="text-left text-xs uppercase tracking-wide text-black/40"><th className="px-5 py-2.5 font-medium">When</th><th className="px-3 py-2.5 font-medium">Guest</th><th className="px-3 py-2.5 font-medium">Party</th><th className="px-3 py-2.5 font-medium">Restaurant</th><th className="px-5 py-2.5 text-right font-medium">Status</th></tr></thead>
                  <tbody className="divide-y divide-black/[.05]">
                    {data.upcoming_bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-black/[.015]">
                        <td className="px-5 py-3 font-medium">{dateLabel(booking.date)} · {time24to12(booking.time)}</td>
                        <td className="px-3 py-3">{booking.name}<span className="block text-xs text-black/45">{booking.reference}</span></td>
                        <td className="px-3 py-3">{booking.guests}</td>
                        <td className="px-3 py-3 text-black/60">{booking.branch}</td>
                        <td className="px-5 py-3 text-right"><StatusBadge status={booking.status} booking /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty icon={TrendingUp} title="No upcoming bookings" />}
          </Card>
        </div>
      ) : null}
    </>
  );
}
