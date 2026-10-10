"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, UtensilsCrossed } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { lineUnitPrice, useCart } from "@/contexts/cart-context";
import type { MenuItem } from "@/lib/api";
import { CARD_FEE_PERCENT, cardFee, formatMoney } from "@/lib/money";
import { ItemDialog } from "./item-dialog";
import { bestPromotion, nextPromotion, useLivePromotions } from "@/lib/promotions";

export function CartDrawer() {
  const { lines, subtotal, count, isOpen, setOpen, setQuantity, remove, add, menu, loadMenu } = useCart();
  const [dialogItem, setDialogItem] = useState<MenuItem | null>(null);
  const promotions = useLivePromotions("checkout");
  const { promotion, discount } = bestPromotion(subtotal, promotions, "pickup");
  const upsell = promotion ? null : nextPromotion(subtotal, promotions, "pickup");
  const fee = cardFee(subtotal - discount);

  useEffect(() => { if (isOpen) loadMenu(); }, [isOpen, loadMenu]);

  // Breads, drinks & sides the customer hasn't added yet.
  const suggestions = useMemo(() => {
    const inCart = new Set(lines.map((line) => line.menuItemId));
    return (menu ?? []).filter((category) => category.suggest_at_checkout).flatMap((category) => category.items).filter((item) => !inCart.has(item.id)).slice(0, 10);
  }, [menu, lines]);

  const quickAdd = (item: MenuItem) => (item.options.length ? setDialogItem(item) : add(item));

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 border-black/10 bg-[#f7efdf] p-0 text-[#242b18] sm:max-w-md dark:border-white/10 dark:bg-[#1b2112] dark:text-white">
          <div className="border-b border-black/10 px-6 pb-5 pt-6 dark:border-white/10">
            <SheetTitle className="font-serif text-3xl font-medium text-inherit">Your order</SheetTitle>
            <SheetDescription className="mt-1 text-sm text-black/50 dark:text-white/50">Pickup only · collect from the restaurant you choose at checkout</SheetDescription>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
              <p className="mt-4 font-serif text-2xl">Your order is empty</p>
              <p className="mt-2 text-sm text-black/50 dark:text-white/50">Add dishes from the menu to get started.</p>
              <Link href="/menu" onClick={() => setOpen(false)} className="mt-6 rounded-full bg-[#242b18] px-6 py-3 text-sm font-semibold text-white dark:bg-primary dark:text-primary-foreground">Browse the menu</Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6">
                <ul className="divide-y divide-black/10 dark:divide-white/10">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li key={line.key} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.2 }} className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold leading-snug">{line.name}</p>
                            {line.options.length ? <p className="mt-0.5 text-xs text-black/50 dark:text-white/50">{line.options.map((option) => option.name).join(", ")}</p> : null}
                            {line.notes ? <p className="mt-0.5 text-xs italic text-black/45 dark:text-white/45">“{line.notes}”</p> : null}
                          </div>
                          <span className="shrink-0 font-semibold tabular-nums">{formatMoney(lineUnitPrice(line) * line.quantity)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex h-9 items-stretch border border-black/15 dark:border-white/15">
                            <button type="button" aria-label={`Fewer ${line.name}`} onClick={() => setQuantity(line.key, line.quantity - 1)} className="flex w-9 items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="flex w-9 items-center justify-center border-x border-black/10 text-sm font-semibold tabular-nums dark:border-white/10">{line.quantity}</span>
                            <button type="button" aria-label={`More ${line.name}`} onClick={() => setQuantity(line.key, line.quantity + 1)} className="flex w-9 items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <button type="button" onClick={() => remove(line.key)} className="flex items-center gap-1.5 text-xs text-black/45 hover:text-red-700 dark:text-white/45 dark:hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {suggestions.length ? (
                  <div className="border-t border-black/10 py-5 dark:border-white/10">
                    <p className="text-sm font-semibold">Add naan, sides or drinks?</p>
                    <div className="-mx-6 mt-3 flex gap-3 overflow-x-auto px-6 pb-2">
                      {suggestions.map((item) => (
                        <button key={item.id} type="button" onClick={() => quickAdd(item)} className="w-36 shrink-0 border border-black/12 p-3 text-left transition-colors hover:border-primary dark:border-white/12">
                          <span className="line-clamp-2 block min-h-10 text-sm font-medium leading-snug">{item.name}</span>
                          <span className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-primary">{formatMoney(item.price)}</span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#242b18] text-white dark:bg-primary dark:text-primary-foreground"><Plus className="h-3.5 w-3.5" /></span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-black/10 px-6 pb-6 pt-4 dark:border-white/10">
                <div className="flex justify-between text-sm"><span>Subtotal · {count} {count === 1 ? "item" : "items"}</span><span className="font-semibold tabular-nums">{formatMoney(subtotal)}</span></div>
                {promotion ? <div className="mt-1 flex justify-between text-sm font-medium text-emerald-700 dark:text-emerald-400"><span>{promotion.badge || promotion.title}</span><span className="tabular-nums">−{formatMoney(discount)}</span></div> : null}
                <div className="mt-1 flex justify-between text-sm text-black/55 dark:text-white/55"><span>Card fee ({CARD_FEE_PERCENT}%)</span><span className="tabular-nums">{formatMoney(fee)}</span></div>
                {upsell ? <p className="mt-2 border border-dashed border-[#c79532]/60 px-3 py-2 text-xs">Add <strong>{formatMoney(Number(upsell.min_subtotal) - subtotal)}</strong> more to get <strong>{upsell.badge || upsell.title}</strong></p> : null}
                <Link href="/checkout" onClick={() => setOpen(false)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#242b18] text-sm font-semibold text-white transition-colors hover:bg-primary hover:text-[#17200f] dark:bg-primary dark:text-primary-foreground">
                  <ShoppingBag className="h-4 w-4" /> Checkout · {formatMoney(subtotal - discount + fee)}
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <ItemDialog item={dialogItem} onClose={() => setDialogItem(null)} onAdd={(item, optionIds, quantity, notes) => add(item, optionIds, quantity, notes)} />
    </>
  );
}

export function CartButton({ className = "" }: { className?: string }) {
  const { count, setOpen, ready } = useCart();
  return (
    <button type="button" onClick={() => setOpen(true)} aria-label={`Open your order${count ? `, ${count} items` : ""}`} className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10 ${className}`}>
      <ShoppingBag className="h-5 w-5" />
      <AnimatePresence>
        {ready && count > 0 ? (
          <motion.span key={count} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground">
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}
