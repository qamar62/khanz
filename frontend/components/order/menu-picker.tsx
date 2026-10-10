"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import type { MenuItem } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { ItemDialog } from "./item-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: MenuItem, optionIds: number[], quantity: number, notes: string) => void;
  counts: Record<number, number>;
  summary: React.ReactNode;
};

/** Browse the menu inside a sheet and pick dishes (used for reservation pre-orders). */
export function MenuPicker({ open, onOpenChange, onAdd, counts, summary }: Props) {
  const { menu, loadMenu } = useCart();
  const [active, setActive] = useState("");
  const [dialogItem, setDialogItem] = useState<MenuItem | null>(null);

  useEffect(() => { if (open) loadMenu(); }, [open, loadMenu]);
  const categories = useMemo(() => (menu ?? []).filter((category) => category.items.length), [menu]);
  const current = categories.find((category) => category.slug === active) ?? categories[0];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 border-black/10 bg-[#f7efdf] p-0 text-[#242b18] sm:max-w-xl dark:border-white/10 dark:bg-[#1b2112] dark:text-white">
          <div className="border-b border-black/10 px-6 pb-4 pt-6 dark:border-white/10">
            <SheetTitle className="font-serif text-3xl font-medium text-inherit">Pre-order dishes</SheetTitle>
            <SheetDescription className="mt-1 text-sm text-black/50 dark:text-white/50">Your food will be ready when you arrive. You&apos;ll pay for it by card when you book.</SheetDescription>
            <div className="-mx-6 mt-4 flex gap-1 overflow-x-auto px-6">
              {categories.map((category) => (
                <button key={category.slug} type="button" onClick={() => setActive(category.slug)} className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors", current?.slug === category.slug ? "bg-[#242b18] text-white dark:bg-primary dark:text-primary-foreground" : "bg-black/5 dark:bg-white/5")}>{category.name}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            {!menu ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-black/50 dark:text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Loading the menu…</div> : (
              <ul className="divide-y divide-black/10 dark:divide-white/10">
                {current?.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      {item.description ? <p className="mt-0.5 line-clamp-2 text-xs text-black/50 dark:text-white/50">{item.description}</p> : null}
                      <p className="mt-1 text-sm text-primary">{formatMoney(item.price)}</p>
                    </div>
                    <button type="button" onClick={() => (item.options.length ? setDialogItem(item) : onAdd(item, [], 1, ""))} aria-label={`Add ${item.name}`} className="relative flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#242b18] px-4 text-xs font-semibold text-white dark:bg-primary dark:text-primary-foreground">
                      <Plus className="h-3.5 w-3.5" /> Add
                      {counts[item.id] ? <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c79532] px-1 text-[0.6rem] font-bold text-[#17200f]">{counts[item.id]}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-black/10 px-6 pb-6 pt-4 dark:border-white/10">
            {summary}
            <button type="button" onClick={() => onOpenChange(false)} className="mt-3 h-12 w-full rounded-full bg-[#242b18] text-sm font-semibold text-white dark:bg-primary dark:text-primary-foreground">Done</button>
          </div>
        </SheetContent>
      </Sheet>
      <ItemDialog item={dialogItem} onClose={() => setDialogItem(null)} onAdd={onAdd} actionLabel="Add to booking" />
    </>
  );
}
