"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Timer } from "lucide-react";
import type { Promotion } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { endsLabel, useLivePromotions, useNow } from "@/lib/promotions";
import { cn } from "@/lib/utils";

const scope = (promotion: Promotion) =>
  promotion.applies_to === "pickup" ? "Online pickup orders" : promotion.applies_to === "preorder" ? "Table bookings with pre-ordered food" : "Pickup orders & table pre-orders";

/** Home page: one full-width banner per live promotion. Renders nothing when none are live. */
export function HomePromotions() {
  const promotions = useLivePromotions("home");
  const now = useNow(1000);
  if (!promotions.length) return null;

  return (
    <section aria-label="Current promotions" className="bg-[#171c0f] px-5 py-10 text-white sm:px-8 md:py-14 lg:px-14">
      <div className="mx-auto grid max-w-[1480px] gap-5">
        {promotions.map((promotion, index) => (
          <motion.article
            key={promotion.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden border border-[#d8ad52]/30 bg-[#222817]"
          >
            {promotion.image_url ? (
              <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-cover bg-center md:block" style={{ backgroundImage: `url('${promotion.image_url}')` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#222817] via-[#222817]/60 to-transparent" />
              </div>
            ) : (
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d8ad52]/10 blur-3xl" />
            )}
            <div className="relative flex flex-col gap-6 p-7 sm:p-10 md:max-w-[62%] md:p-12">
              <div className="flex flex-wrap items-center gap-3">
                {promotion.badge ? <span className="rounded-full bg-[#c79532] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#17200f]">{promotion.badge}</span> : <Sparkles className="h-5 w-5 text-[#d8ad52]" />}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d8ad52]"><Timer className="h-3.5 w-3.5" /><span className="tabular-nums">{endsLabel(promotion.ends_at, now)}</span></span>
              </div>
              <div>
                <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.03em]">{promotion.title}</h2>
                {promotion.description ? <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">{promotion.description}</p> : null}
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/40">
                  {scope(promotion)}{Number(promotion.min_subtotal) > 0 ? ` · on food over ${formatMoney(promotion.min_subtotal)}` : ""}{promotion.discount_type !== "none" ? " · applied automatically at checkout" : ""}
                </p>
              </div>
              <Link href={promotion.cta_url || "/menu"} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#c79532] px-6 py-3 text-sm font-semibold text-[#17200f] transition hover:bg-[#dfb85e]">
                {promotion.cta_label || "Order now"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/** Compact strip for checkout: the live promotion(s) with countdown. */
export function CheckoutPromotionStrip({ appliedId, className }: { appliedId?: number | null; className?: string }) {
  const promotions = useLivePromotions("checkout");
  const now = useNow(1000);
  if (!promotions.length) return null;
  return (
    <div className={cn("space-y-2", className)}>
      {promotions.map((promotion) => (
        <motion.div key={promotion.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3 border border-[#c79532]/40 bg-[#c79532]/12 px-4 py-3 text-sm">
          <span className="flex items-center gap-3">
            {promotion.badge ? <span className="rounded-full bg-[#c79532] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#17200f]">{promotion.badge}</span> : <Sparkles className="h-4 w-4 text-primary" />}
            <span><strong>{promotion.title}</strong>{appliedId === promotion.id ? <span className="ml-2 text-emerald-700 dark:text-emerald-400">· applied to your order</span> : promotion.description ? <span className="ml-2 opacity-70">{promotion.description}</span> : null}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums opacity-80"><Timer className="h-3.5 w-3.5" />{endsLabel(promotion.ends_at, now)}</span>
        </motion.div>
      ))}
    </div>
  );
}
