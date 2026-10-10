"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Phone, UtensilsCrossed } from "lucide-react";
import { useStaff, useStaffData } from "@/components/dashboard/staff-context";
import { Button, Card, Empty, ErrorNote, Loading, PageHeader, SearchInput, Segmented, StatusBadge, dateLabel, money, time24to12 } from "@/components/dashboard/ui";
import { StaffReservation, branchParam, staffFetch } from "@/lib/staff-api";

const todayNZ = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());
const shiftDate = (iso: string, days: number) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

const ACTIONS: Record<string, { status: string; label: string; endpoint?: string }[]> = {
  pending: [{ status: "confirmed", label: "Confirm", endpoint: "confirm" }],
  payment_pending: [],
  confirmed: [{ status: "seated", label: "Seat" }, { status: "no_show", label: "No-show" }],
  waiting: [{ status: "seated", label: "Seat" }],
  table_ready: [{ status: "seated", label: "Seat" }],
  seated: [{ status: "completed", label: "Complete" }],
};

export default function ReservationsPage() {
  const { branch } = useStaff();
  const [date, setDate] = useState(todayNZ());
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const params = [branchParam(branch), `date=${date}`, status !== "all" ? `status=${status}` : "", query ? `q=${encodeURIComponent(query)}` : "", "page_size=200"].filter(Boolean).join("&");
  const { data, error, loading, reload } = useStaffData<{ results: StaffReservation[]; count: number }>(`/reservations/?${params}`, 30_000);
  const rows = data?.results ?? [];
  const guests = rows.filter((r) => !["cancelled", "no_show"].includes(r.status)).reduce((sum, r) => sum + r.guests, 0);

  async function act(row: StaffReservation, next: { status: string; endpoint?: string }) {
    setBusy(row.id); setActionError("");
    const path = next.endpoint ? `/reservations/${row.id}/${next.endpoint}/` : `/reservations/${row.id}/transition/`;
    const response = await staffFetch(path, { method: "POST", body: JSON.stringify({ status: next.status }) });
    setBusy(null);
    if (response.error) setActionError(response.error); else reload();
  }

  return (
    <>
      <PageHeader title="Reservations" subtitle={`${rows.length} bookings · ${guests} guests`} actions={<SearchInput value={query} onChange={setQuery} placeholder="Search name, phone, reference" />} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1">
          <button aria-label="Previous day" onClick={() => setDate(shiftDate(date, -1))} className="rounded-lg p-1.5 hover:bg-black/5"><ChevronLeft className="h-4 w-4" /></button>
          <input type="date" value={date} onChange={(event) => event.target.value && setDate(event.target.value)} className="bg-transparent px-1 text-sm font-medium outline-none" />
          <button aria-label="Next day" onClick={() => setDate(shiftDate(date, 1))} className="rounded-lg p-1.5 hover:bg-black/5"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <Button variant="outline" onClick={() => setDate(todayNZ())}>Today</Button>
        <Segmented value={status} onChange={setStatus} options={[
          { value: "all", label: "All" }, { value: "pending", label: "Pending" }, { value: "confirmed", label: "Confirmed" },
          { value: "seated", label: "Seated" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" },
        ]} />
      </div>
      {error ? <ErrorNote message={error} /> : null}
      {actionError ? <div className="mb-4"><ErrorNote message={actionError} /></div> : null}
      {loading && !data ? <Loading /> : rows.length ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead><tr className="border-b border-black/[.06] text-left text-xs uppercase tracking-wide text-black/40"><th className="px-5 py-3 font-medium">Time</th><th className="px-3 py-3 font-medium">Guest</th><th className="px-3 py-3 font-medium">Party</th><th className="px-3 py-3 font-medium">Restaurant</th><th className="px-3 py-3 font-medium">Notes</th><th className="px-3 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-black/[.05]">
              {rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-black/[.015]">
                  <td className="px-5 py-3.5 font-semibold">{time24to12(row.time)}<span className="block text-xs font-normal text-black/45">{dateLabel(row.date)}</span></td>
                  <td className="px-3 py-3.5">{row.name}<a href={`tel:${row.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1 text-xs text-black/45 hover:text-black"><Phone className="h-3 w-3" />{row.phone}</a><span className="text-xs text-black/35">{row.reference}</span></td>
                  <td className="px-3 py-3.5">{row.guests}<span className="block text-xs text-black/45">{row.adult_guests}A · {row.child_guests}C</span></td>
                  <td className="px-3 py-3.5 text-black/60">{row.branch_details?.name ?? row.branch}</td>
                  <td className="max-w-[220px] px-3 py-3.5 text-xs text-black/60">
                    {row.occasion && row.occasion !== "none" ? <span className="mb-1 inline-block rounded-md bg-[#f3efe4] px-1.5 py-0.5 font-medium capitalize text-[#7a5a1c]">{row.occasion}</span> : null}
                    {row.special_requests ? <p className="line-clamp-2">{row.special_requests}</p> : null}
                    {row.preorder ? <p className="mt-1 flex items-center gap-1 text-[#1b2112]"><UtensilsCrossed className="h-3 w-3" />Pre-order {money(row.preorder.total, row.preorder.currency)} · {row.preorder.payment_status}</p> : null}
                  </td>
                  <td className="px-3 py-3.5"><StatusBadge status={row.status} booking /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      {(ACTIONS[row.status] ?? []).map((next) => <Button key={next.status} variant={next.status === "no_show" ? "outline" : "primary"} disabled={busy === row.id} onClick={() => act(row, next)}>{next.label}</Button>)}
                      {!["cancelled", "completed", "no_show"].includes(row.status) ? <Button variant="ghost" disabled={busy === row.id} onClick={() => { if (window.confirm(`Cancel booking ${row.reference} for ${row.name}?`)) act(row, { status: "cancelled", endpoint: "cancel" }); }}>Cancel</Button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : <Card><Empty icon={CalendarDays} title="No bookings for this day" text="Use the arrows to check another date." /></Card>}
    </>
  );
}
