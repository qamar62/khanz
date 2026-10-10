"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import { useStaffData } from "@/components/dashboard/staff-context";
import { Card, Empty, ErrorNote, Loading, PageHeader, StatusBadge, dateLabel, money } from "@/components/dashboard/ui";
import { PromotionRow } from "@/lib/staff-api";

const ADMIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "/admin/orders/promotion/");

export default function PromotionsPage() {
  const { data, error, loading } = useStaffData<PromotionRow[]>("/staff/promotions/");
  return (
    <>
      <PageHeader
        title="Promotions"
        subtitle="Live promotions show on the home page and checkout, and their discount applies automatically."
        actions={<a href={ADMIN} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#242b18] px-3.5 text-sm font-medium text-white hover:bg-[#33401f]"><ExternalLink className="h-4 w-4" />Create or edit in admin</a>}
      />
      {error ? <ErrorNote message={error} /> : null}
      {loading && !data ? <Loading /> : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((promo) => (
            <Card key={promo.id} className="flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">{promo.badge ? <span className="rounded-full bg-[#c79532] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-[#17200f]">{promo.badge}</span> : <Sparkles className="h-4 w-4 text-[#9a7224]" />}<StatusBadge status={promo.state} /></div>
              <h3 className="mt-3 font-semibold leading-snug">{promo.title}</h3>
              <p className="mt-1 text-xs text-black/50">{promo.applies_to}{Number(promo.min_subtotal) > 0 ? ` · min ${money(promo.min_subtotal)}` : ""}</p>
              <p className="mt-3 text-sm text-black/60">{dateLabel(promo.starts_at, true)} → {dateLabel(promo.ends_at, true)}</p>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                <div className="rounded-xl bg-black/[.03] px-3 py-2"><p className="text-xs text-black/45">Paid orders</p><p className="font-semibold tabular-nums">{promo.paid_orders}</p></div>
                <div className="rounded-xl bg-black/[.03] px-3 py-2"><p className="text-xs text-black/45">Discount given</p><p className="font-semibold tabular-nums">{money(promo.discount_given)}</p></div>
              </div>
            </Card>
          ))}
        </div>
      ) : <Card><Empty icon={Sparkles} title="No promotions yet" text="Create one in Django admin with a start and end time." /></Card>}
    </>
  );
}
