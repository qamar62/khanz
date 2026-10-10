"use client";

import { useMemo, useState } from "react";
import { Check, ChefHat, Flame, Pencil, Star, X } from "lucide-react";
import { useStaffData } from "@/components/dashboard/staff-context";
import { Card, Empty, ErrorNote, Loading, PageHeader, SearchInput, money } from "@/components/dashboard/ui";
import { StaffMenuCategory, staffFetch } from "@/lib/staff-api";
import { cn } from "@/lib/utils";

type Item = StaffMenuCategory["items"][number];
const TINTS = ["#f3efe4", "#e9f1ea", "#f6ebe6", "#e8eef3", "#f1ecf5", "#eef0e4"];

export default function MenuManagementPage() {
  const { data, error, loading, setData } = useStaffData<StaffMenuCategory[]>("/staff/menu/");
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const items = useMemo(() => {
    const categories = (data ?? []).filter((category) => active === "all" || category.slug === active);
    const q = query.trim().toLowerCase();
    return categories.flatMap((category, index) => category.items.map((item) => ({ ...item, category: category.name, tint: TINTS[index % TINTS.length] })))
      .filter((item) => !q || item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q));
  }, [data, active, query]);

  async function save(item: Item, changes: Partial<Pick<Item, "is_active" | "is_popular" | "price">>) {
    const response = await staffFetch<Partial<Item>>(`/staff/menu/items/${item.id}/`, { method: "PATCH", body: JSON.stringify(changes) });
    if (!response.data) { setNotice(response.error ?? "Could not save."); return false; }
    setNotice("");
    setData((current) => (current ?? []).map((category) => ({ ...category, items: category.items.map((row) => (row.id === item.id ? { ...row, ...response.data } : row)) })));
    return true;
  }

  const unavailable = (data ?? []).reduce((sum, category) => sum + category.items.filter((item) => !item.is_active).length, 0);

  return (
    <>
      <PageHeader title="Menu management" subtitle={data ? `${items.length} dishes shown · ${unavailable} hidden from the website` : undefined} actions={<SearchInput value={query} onChange={setQuery} placeholder="Search dish or code" />} />
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {[{ slug: "all", name: "All" }, ...(data ?? [])].map((category) => (
          <button key={category.slug} onClick={() => setActive(category.slug)} className={cn("shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors", active === category.slug ? "bg-[#242b18] text-white" : "bg-white text-black/60 hover:text-black")}>{category.name}</button>
        ))}
      </div>
      {error ? <ErrorNote message={error} /> : null}
      {notice ? <div className="mb-4"><ErrorNote message={notice} /></div> : null}
      {loading && !data ? <Loading /> : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => <DishCard key={item.id} item={item} onSave={save} />)}
        </div>
      ) : <Card><Empty icon={ChefHat} title="No dishes found" /></Card>}
      <p className="mt-6 text-xs text-black/40">Changes go live on the website menu immediately. To add dishes, options or categories, use Django admin.</p>
    </>
  );
}

function DishCard({ item, onSave }: { item: Item & { category: string; tint: string }; onSave: (item: Item, changes: Partial<Item>) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(item.price);
  const [busy, setBusy] = useState(false);
  const run = async (changes: Partial<Item>) => { setBusy(true); const ok = await onSave(item, changes); setBusy(false); return ok; };

  return (
    <article className={cn("flex flex-col overflow-hidden rounded-2xl border border-black/[.07] bg-white transition-opacity", !item.is_active && "opacity-60")}>
      <div className="relative flex h-28 items-center justify-center" style={{ background: item.tint }}>
        <span className="font-serif text-3xl font-semibold text-black/15">{item.code}</span>
        {item.is_popular ? <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[0.68rem] font-semibold text-[#9a7224]"><Star className="h-3 w-3 fill-current" />Popular</span> : null}
        {!item.is_active ? <span className="absolute right-3 top-3 rounded-md bg-zinc-800 px-2 py-0.5 text-[0.68rem] font-semibold text-white">Hidden</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-black/45">{item.category}</p>
        <h3 className="mt-0.5 font-semibold leading-snug">{item.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-black/45">
          {item.spice_level > 0 ? <span className="flex">{Array.from({ length: item.spice_level }, (_, i) => <Flame key={i} className="h-3 w-3 text-orange-500" />)}</span> : null}
          {item.options.length ? <span>{item.options.length} options</span> : null}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {editing ? (
            <form className="flex items-center gap-1.5" onSubmit={async (event) => { event.preventDefault(); if (await run({ price })) setEditing(false); }}>
              <span className="text-sm">$</span>
              <input autoFocus inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value.replace(/[^\d.]/g, ""))} className="h-8 w-20 rounded-lg border border-black/15 px-2 text-sm outline-none focus:border-[#9a7224]" />
              <button type="submit" disabled={busy} aria-label="Save price" className="rounded-lg bg-[#242b18] p-1.5 text-white"><Check className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Cancel" onClick={() => { setEditing(false); setPrice(item.price); }} className="rounded-lg p-1.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
            </form>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="group inline-flex items-center gap-1.5 text-lg font-semibold tabular-nums">{money(item.price)}<Pencil className="h-3.5 w-3.5 text-black/25 group-hover:text-black/60" /></button>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-black/[.06] pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <button type="button" role="switch" aria-checked={item.is_active} disabled={busy} onClick={() => run({ is_active: !item.is_active })} className={cn("relative h-5 w-9 rounded-full transition-colors", item.is_active ? "bg-emerald-600" : "bg-black/20")}>
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", item.is_active ? "left-[18px]" : "left-0.5")} />
            </button>
            {item.is_active ? "Available" : "Sold out"}
          </label>
          <button type="button" disabled={busy} onClick={() => run({ is_popular: !item.is_popular })} className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium", item.is_popular ? "bg-[#f3efe4] text-[#9a7224]" : "text-black/45 hover:bg-black/[.04]")}><Star className={cn("h-3.5 w-3.5", item.is_popular && "fill-current")} />Popular</button>
        </div>
      </div>
    </article>
  );
}
