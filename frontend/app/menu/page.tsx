"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Flame, Leaf, MapPin, UtensilsCrossed } from "lucide-react";
import { menuItems, categoryLabels } from "@/lib/data";
import { cn } from "@/lib/utils";

const categories = ["starters", "mains", "tandoori", "biryani", "desserts", "drinks"];

const categoryNotes: Record<string, string> = {
  starters: "Small plates to begin, pass around and share.",
  mains: "Slow-cooked curries and generous house favourites.",
  tandoori: "Marinated, charred and finished over fierce heat.",
  biryani: "Aromatic basmati, layered spices and saffron.",
  desserts: "A sweet final note, from classic to contemporary.",
  drinks: "Cooling, spiced and made to refresh.",
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("mains");
  const visibleItems = menuItems.filter((item) => item.category === activeCategory);

  return (
    <main className="bg-[#f2eee5] text-[#171712] dark:bg-[#11110e] dark:text-white">
      <section className="relative min-h-[76svh] overflow-hidden bg-[#0b0b09] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547592180-85f173990554?q=88&w=2200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,5,.96)_0%,rgba(7,7,5,.72)_48%,rgba(7,7,5,.18)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />
        <div className="relative mx-auto flex min-h-[76svh] max-w-[1480px] items-end px-5 pb-16 pt-36 sm:px-8 lg:px-14 lg:pb-20">
          <div className="max-w-4xl">
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#e7bd64]">
              <UtensilsCrossed className="h-4 w-4" /> The Khanz menu
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-[clamp(4rem,10vw,9rem)] font-medium leading-[0.82] tracking-[-0.055em]">
              Come hungry.
              <span className="block italic text-[#e7bd64]">Leave happy.</span>
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 flex max-w-3xl flex-col gap-6 border-t border-white/20 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                A menu that moves from bright, crisp starters to slow-cooked curries, fragrant biryani and dishes kissed by the tandoor.
              </p>
              <Link href="/reservation" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#dca93f] px-6 text-sm font-semibold text-[#171109] hover:bg-[#edc56f]">
                <CalendarDays className="h-4 w-4" /> Reserve a table
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#f2eee5]/95 dark:border-white/10 dark:bg-[#11110e]/95">
        <div className="mx-auto max-w-[1480px] overflow-x-auto px-5 sm:px-8 lg:px-14">
          <div className="flex min-w-max gap-1 py-4" role="tablist" aria-label="Menu categories">
            {categories.map((category) => (
              <button
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition",
                  activeCategory === category
                    ? "bg-[#171712] text-white dark:bg-[#dca93f] dark:text-[#171109]"
                    : "text-black/55 hover:bg-black/5 hover:text-black dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-14">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-12 lg:grid-cols-[0.55fr_1fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Selected course</span>
              <h2 className="mt-4 font-serif text-5xl leading-none tracking-[-0.035em] md:text-6xl">
                {categoryLabels[activeCategory]}
              </h2>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-black/55 dark:text-white/55">
                {categoryNotes[activeCategory]}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em] text-black/45 dark:text-white/45">
                <span className="inline-flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Spice level</span>
                <span className="inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-600" /> Dietary options</span>
              </div>
            </div>

            <motion.div key={activeCategory} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-x-10 md:grid-cols-2">
              {visibleItems.map((item, index) => (
                <article key={item.id} className="group border-t border-black/15 py-7 dark:border-white/15">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-2xl font-semibold transition group-hover:text-primary">{item.name}</h3>
                        {(item.isChefSpecial || item.isPopular) && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary">
                            {item.isChefSpecial ? "Chef's pick" : "Popular"}
                          </span>
                        )}
                      </div>
                      <p className="max-w-md text-sm leading-relaxed text-black/55 dark:text-white/55">{item.description}</p>
                    </div>
                    <span className="font-serif text-2xl font-semibold text-primary">${item.price}</span>
                  </div>
                  <div className="mt-4 flex min-h-6 flex-wrap items-center gap-3">
                    {item.spiceLevel ? (
                      <div className="flex gap-1" aria-label={`Spice level ${item.spiceLevel} of 3`}>
                        {[0, 1, 2].map((level) => <Flame key={level} className={cn("h-3.5 w-3.5", level < item.spiceLevel! ? "text-orange-500" : "text-black/15 dark:text-white/15")} />)}
                      </div>
                    ) : null}
                    {item.dietary?.map((label) => (
                      <span key={label} className="text-xs capitalize text-emerald-700 dark:text-emerald-400">{label.replace("-", " ")}</span>
                    ))}
                  </div>
                </article>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#181814] px-5 py-16 text-white sm:px-8 lg:px-14">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e7bd64]">Across Auckland</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">One menu. Three ways to join us.</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-white/70">
            {["Papatoetoe", "Flat Bush", "Panmure"].map((place) => <span key={place} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><MapPin className="h-4 w-4 text-[#e7bd64]" />{place}</span>)}
          </div>
        </div>
      </section>
    </main>
  );
}
