"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChefHat, Flame, Leaf, MapPin, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { Branch, MenuCategory, MenuItem, branchAPI, menuAPI } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { ItemDialog } from "@/components/order/item-dialog";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogItem, setDialogItem] = useState<MenuItem | null>(null);
  const cart = useCart();
  const addToCart = (item: MenuItem, optionIds: number[] = [], quantity = 1, notes = "") => {
    cart.add(item, optionIds, quantity, notes);
    toast.success(`${quantity > 1 ? `${quantity} × ` : ""}${item.name} added`, { action: { label: "View order", onClick: () => cart.setOpen(true) } });
  };
  const quickAdd = (item: MenuItem) => (item.options.length ? setDialogItem(item) : addToCart(item));

  useEffect(() => {
    let active = true;
    Promise.all([menuAPI.list(), branchAPI.list()]).then(([menuResponse, branchResponse]) => {
      if (!active) return;
      const menuCategories = menuResponse.data ?? [];
      setCategories(menuCategories);
      setBranches(branchResponse.data ?? []);
      setActiveCategory(menuCategories[0]?.slug ?? "");
      setError(menuResponse.error ?? "");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (selectedBranch === "all") return;
    setLoading(true);
    menuAPI.list(selectedBranch).then((response) => {
      const next = response.data ?? [];
      setCategories(next);
      if (!next.some((category) => category.slug === activeCategory)) setActiveCategory(next[0]?.slug ?? "");
      setError(response.error ?? "");
      setLoading(false);
    });
  }, [selectedBranch]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = useMemo(() => categories.find((category) => category.slug === activeCategory) ?? categories[0], [categories, activeCategory]);

  return (
    <main className="bg-[#f4ecdc] text-[#242b18] dark:bg-[#171c0f] dark:text-white">
      <section className="relative min-h-[76svh] overflow-hidden bg-[#11170c] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547592180-85f173990554?q=88&w=2200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,15,7,.97)_0%,rgba(15,20,9,.76)_48%,rgba(15,20,9,.2)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171c0f] via-transparent to-black/25" />
        <div className="relative mx-auto flex min-h-[76svh] max-w-[1480px] items-end px-5 pb-16 pt-36 sm:px-8 lg:px-14 lg:pb-20">
          <div className="max-w-4xl">
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#d8ad52]"><UtensilsCrossed className="h-4 w-4" /> The Khanz menu</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-[clamp(4rem,10vw,9rem)] font-medium leading-[0.82] tracking-[-0.055em]">Come hungry.<span className="block italic text-[#d8ad52]">Leave happy.</span></motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 flex max-w-3xl flex-col gap-6 border-t border-white/20 pt-6 md:flex-row md:items-center md:justify-between"><p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">Order online for pickup, or explore the full Khanz menu. Prices are in New Zealand dollars.</p><Link href="/reservation" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#c79532] px-6 text-sm font-semibold text-[#17200f] transition hover:bg-[#dfb85e]"><CalendarDays className="h-4 w-4" /> Reserve a table</Link></motion.div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-black/10 bg-[#f4ecdc]/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#171c0f]/95">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-14">
          <div className="flex items-center gap-3 border-b border-black/8 py-3 dark:border-white/8">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <select aria-label="Filter menu by restaurant" value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className="max-w-full bg-transparent text-sm font-semibold outline-none">
              <option value="all">Menu at all locations</option>{branches.map((branch) => <option key={branch.slug} value={branch.slug}>{branch.name}</option>)}
            </select>
          </div>
          <div className="flex gap-1 overflow-x-auto py-4" role="tablist" aria-label="Menu categories">
            {categories.map((category) => <button key={category.slug} role="tab" aria-selected={current?.slug === category.slug} onClick={() => setActiveCategory(category.slug)} className={cn("shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition", current?.slug === category.slug ? "bg-[#242b18] text-white dark:bg-[#d8ad52] dark:text-[#17200f]" : "text-black/55 hover:bg-black/5 hover:text-black dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white")}>{category.name}</button>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-14">
        <div className="mx-auto max-w-[1480px]">
          {loading ? <MenuMessage title="Preparing the menu" text="Loading today’s dishes and prices…" /> : error ? <MenuMessage title="Menu unavailable" text={error} /> : current ? (
            <div className="grid gap-12 lg:grid-cols-[0.34fr_1fr] lg:gap-20">
              <motion.aside key={`${current.slug}-heading`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-44 lg:self-start">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Selected course</span><h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.035em] md:text-6xl">{current.name}</h2><p className="mt-5 max-w-sm text-base leading-relaxed text-black/55 dark:text-white/55">{current.description}</p><div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em] text-black/45 dark:text-white/45"><span className="inline-flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Spice level</span><span className="inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-600" /> Dietary options</span></div>
              </motion.aside>
              <motion.div key={current.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-x-10 md:grid-cols-2">
                {current.items.map((item) => <article key={item.code} className="group border-t border-black/15 py-7 dark:border-white/15"><div className="flex items-start justify-between gap-5"><div><div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-[0.65rem] font-bold tracking-[0.14em] text-primary">{item.code}</span><h3 className="font-serif text-2xl font-semibold transition group-hover:text-primary">{item.name}</h3>{item.is_chef_special || item.is_popular ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-primary">{item.is_chef_special ? "Chef’s pick" : "Popular"}</span> : null}</div><p className="max-w-md text-sm leading-relaxed text-black/55 dark:text-white/55">{item.description}</p></div><div className="flex shrink-0 flex-col items-end gap-3"><span className="font-serif text-2xl font-semibold text-primary">{formatMoney(item.price)}</span><button type="button" onClick={() => quickAdd(item)} aria-label={`Add ${item.name} to your order`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#242b18] px-4 text-xs font-semibold text-white transition hover:bg-primary hover:text-[#17200f] dark:bg-[#d8ad52] dark:text-[#17200f] dark:hover:bg-[#dfb85e]"><Plus className="h-3.5 w-3.5" /> Add</button></div></div><div className="mt-4 flex min-h-6 flex-wrap items-center gap-3">{item.spice_level > 0 ? <div className="flex gap-1" aria-label={`Spice level ${item.spice_level} of 3`}>{[1,2,3].map((level) => <Flame key={level} className={cn("h-3.5 w-3.5", level <= item.spice_level ? "text-orange-500" : "text-black/15 dark:text-white/15")} />)}</div> : null}{item.dietary_labels.map((label) => <span key={label} className="text-xs capitalize text-emerald-700 dark:text-emerald-400">{label}</span>)}{item.options.map((option) => <span key={option.id} className="text-xs text-black/45 dark:text-white/45">{option.name}{Number(option.additional_price) > 0 ? ` +$${option.additional_price}` : ""}</span>)}</div></article>)}
              </motion.div>
            </div>
          ) : <MenuMessage title="Menu coming shortly" text="Our team is updating this section." />}
        </div>
      </section>

      <ItemDialog item={dialogItem} onClose={() => setDialogItem(null)} onAdd={addToCart} />
      <AnimatePresence>
        {cart.ready && cart.count > 0 ? (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
            <button type="button" onClick={() => cart.setOpen(true)} className="flex h-14 w-full max-w-md items-center justify-between gap-4 rounded-full bg-[#242b18] px-6 text-sm font-semibold text-white shadow-2xl shadow-black/30 dark:bg-[#d8ad52] dark:text-[#17200f]">
              <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> View order · {cart.count} {cart.count === 1 ? "item" : "items"}</span>
              <span className="tabular-nums">{formatMoney(cart.subtotal)}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="bg-[#202617] px-5 py-16 text-white sm:px-8 lg:px-14"><div className="mx-auto flex max-w-[1480px] flex-col gap-8 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8ad52]">Made for sharing</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Bring the table together.</h2></div><Link href="/reservation" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold transition hover:border-[#d8ad52] hover:text-[#d8ad52]"><ChefHat className="h-4 w-4" /> Book your Khanz table</Link></div></section>
    </main>
  );
}

function MenuMessage({ title, text }: { title: string; text: string }) { return <div className="flex min-h-96 flex-col items-center justify-center text-center"><UtensilsCrossed className="h-8 w-8 text-primary" /><h2 className="mt-5 font-serif text-4xl">{title}</h2><p className="mt-3 text-black/50 dark:text-white/50">{text}</p></div>; }
