"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Users } from "lucide-react";
import { useStaff, useStaffData } from "@/components/dashboard/staff-context";
import { Card, Empty, ErrorNote, Loading, PageHeader, SearchInput, dateLabel, money } from "@/components/dashboard/ui";
import { CustomerRow, branchParam } from "@/lib/staff-api";

export default function CustomersPage() {
  const { branch } = useStaff();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => { const timer = setTimeout(() => setQuery(input.trim()), 300); return () => clearTimeout(timer); }, [input]);
  const params = [branchParam(branch), query ? `q=${encodeURIComponent(query)}` : ""].filter(Boolean).join("&");
  const { data, error, loading } = useStaffData<{ count: number; verified_accounts: number; results: CustomerRow[] }>(`/staff/customers/?${params}`);

  return (
    <>
      <PageHeader title="Customers" subtitle={data ? `${data.count} people who ordered or booked · ${data.verified_accounts} verified email accounts` : undefined} actions={<SearchInput value={input} onChange={setInput} placeholder="Search name, email, phone" />} />
      {error ? <ErrorNote message={error} /> : null}
      {loading && !data ? <Loading /> : data?.results.length ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-black/[.06] text-left text-xs uppercase tracking-wide text-black/40"><th className="px-5 py-3 font-medium">Customer</th><th className="px-3 py-3 font-medium">Contact</th><th className="px-3 py-3 text-right font-medium">Paid orders</th><th className="px-3 py-3 text-right font-medium">Bookings</th><th className="px-3 py-3 text-right font-medium">Spent online</th><th className="px-5 py-3 text-right font-medium">Last seen</th></tr></thead>
            <tbody className="divide-y divide-black/[.05]">
              {data.results.map((row, index) => (
                <tr key={`${row.email}-${row.phone}-${index}`} className="hover:bg-black/[.015]">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3efe4] text-xs font-semibold uppercase text-[#7a5a1c]">{row.name.slice(0, 2)}</span><span className="font-medium">{row.name}</span></div></td>
                  <td className="px-3 py-3 text-xs text-black/55">
                    {row.email ? <a href={`mailto:${row.email}`} className="flex items-center gap-1 hover:text-black"><Mail className="h-3 w-3" />{row.email}</a> : null}
                    {row.phone ? <a href={`tel:${row.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1 hover:text-black"><Phone className="h-3 w-3" />{row.phone}</a> : null}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{row.orders}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{row.bookings}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{money(row.spend)}</td>
                  <td className="px-5 py-3 text-right text-black/55">{dateLabel(row.last_seen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : <Card><Empty icon={Users} title="No customers yet" text="People appear here after their first paid order or booking." /></Card>}
    </>
  );
}
