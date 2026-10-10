"use client";

import { useEffect, useState } from "react";
import { Check, Flame, Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, optionIds: number[], quantity: number, notes: string) => void;
  actionLabel?: string;
};

/** Choose options, quantity and a note for one dish. */
export function ItemDialog({ item, onClose, onAdd, actionLabel = "Add to order" }: Props) {
  const [optionIds, setOptionIds] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) { setOptionIds([]); setQuantity(1); setNotes(""); }
  }, [item]);

  if (!item) return null;
  const unit = Number(item.price) + item.options.filter((o) => optionIds.includes(o.id)).reduce((sum, o) => sum + Number(o.additional_price), 0);
  const toggle = (id: number) => setOptionIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto rounded-none border-black/10 bg-[#f7efdf] p-0 text-[#242b18] sm:max-w-lg dark:border-white/10 dark:bg-[#222817] dark:text-white">
        <div className="p-6 sm:p-7">
          <p className="text-[0.65rem] font-bold tracking-[0.14em] text-primary">{item.code}</p>
          <DialogTitle className="mt-1 font-serif text-3xl font-semibold leading-tight">{item.name}</DialogTitle>
          {item.description ? <DialogDescription className="mt-3 text-sm leading-relaxed text-black/55 dark:text-white/55">{item.description}</DialogDescription> : <DialogDescription className="sr-only">Choose options for {item.name}</DialogDescription>}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-serif text-2xl font-semibold text-primary">{formatMoney(item.price)}</span>
            {item.spice_level > 0 ? <span className="flex gap-0.5" aria-label={`Spice level ${item.spice_level} of 3`}>{[1, 2, 3].map((level) => <Flame key={level} className={cn("h-3.5 w-3.5", level <= item.spice_level ? "text-orange-500" : "text-black/15 dark:text-white/15")} />)}</span> : null}
            {item.dietary_labels.map((label) => <span key={label} className="text-xs capitalize text-emerald-700 dark:text-emerald-400">{label}</span>)}
          </div>

          {item.options.length ? (
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-semibold">Options</legend>
              <div className="space-y-2">
                {item.options.map((option) => {
                  const selected = optionIds.includes(option.id);
                  return (
                    <button key={option.id} type="button" role="checkbox" aria-checked={selected} onClick={() => toggle(option.id)}
                      className={cn("flex w-full items-center justify-between gap-3 border px-4 py-3 text-left text-sm transition-colors", selected ? "border-primary bg-primary/8" : "border-black/12 hover:border-primary/50 dark:border-white/12")}>
                      <span className="flex items-center gap-3">
                        <span className={cn("flex h-5 w-5 items-center justify-center border", selected ? "border-primary bg-primary text-primary-foreground" : "border-black/25 dark:border-white/25")}>{selected ? <Check className="h-3.5 w-3.5" /> : null}</span>
                        {option.name}
                      </span>
                      <span className="text-black/50 dark:text-white/50">{Number(option.additional_price) > 0 ? `+${formatMoney(option.additional_price)}` : "No extra cost"}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold">Note for the kitchen (optional)</span>
            <input value={notes} onChange={(event) => setNotes(event.target.value.slice(0, 200))} placeholder="e.g. mild, no onion" className="h-11 w-full border border-black/15 bg-transparent px-3 text-sm outline-none focus:border-primary dark:border-white/15" />
          </label>
        </div>
        <div className="sticky bottom-0 flex items-center gap-3 border-t border-black/10 bg-[#f7efdf] p-4 sm:px-7 dark:border-white/10 dark:bg-[#222817]">
          <div className="flex h-12 items-stretch border border-black/15 dark:border-white/15">
            <button type="button" aria-label="Fewer" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="flex w-11 items-center justify-center disabled:opacity-30"><Minus className="h-4 w-4" /></button>
            <span className="flex w-10 items-center justify-center border-x border-black/10 font-semibold tabular-nums dark:border-white/10" aria-live="polite">{quantity}</span>
            <button type="button" aria-label="More" onClick={() => setQuantity((q) => Math.min(50, q + 1))} className="flex w-11 items-center justify-center"><Plus className="h-4 w-4" /></button>
          </div>
          <Button type="button" onClick={() => { onAdd(item, optionIds, quantity, notes); onClose(); }} className="h-12 flex-1 rounded-full bg-[#242b18] text-white hover:bg-primary hover:text-[#17200f] dark:bg-primary dark:text-primary-foreground">
            {actionLabel} · {formatMoney(unit * quantity)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
