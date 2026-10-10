"use client";

import { useEffect, useState } from "react";
import { Promotion, promotionAPI } from "@/lib/api";

export type OrderKind = "pickup" | "preorder";

const round = (value: number) => Math.round(value * 100 + Number.EPSILON) / 100;

/** Client-side estimate that mirrors the backend: the live promotion with the biggest discount wins. */
export function bestPromotion(subtotal: number, promotions: Promotion[], kind: OrderKind) {
  let best: Promotion | null = null;
  let bestDiscount = 0;
  for (const promotion of promotions) {
    if (!isLive(promotion) || (promotion.applies_to !== "all" && promotion.applies_to !== kind)) continue;
    const discount = discountFor(promotion, subtotal);
    if (discount > bestDiscount) { best = promotion; bestDiscount = discount; }
  }
  return { promotion: best, discount: bestDiscount };
}

export function discountFor(promotion: Promotion, subtotal: number) {
  const value = Number(promotion.discount_value) || 0;
  if (promotion.discount_type === "none" || subtotal <= 0 || subtotal < Number(promotion.min_subtotal)) return 0;
  const amount = promotion.discount_type === "percent" ? (subtotal * value) / 100 : value;
  return round(Math.min(amount, subtotal));
}

/** The closest promotion the customer hasn't reached yet because of its minimum spend. */
export function nextPromotion(subtotal: number, promotions: Promotion[], kind: OrderKind) {
  return promotions
    .filter((p) => isLive(p) && p.discount_type !== "none" && (p.applies_to === "all" || p.applies_to === kind) && Number(p.min_subtotal) > subtotal)
    .sort((a, b) => Number(a.min_subtotal) - Number(b.min_subtotal))[0] ?? null;
}

export function isLive(promotion: Promotion, now = Date.now()) {
  return new Date(promotion.starts_at).getTime() <= now && now < new Date(promotion.ends_at).getTime();
}

export function useLivePromotions(placement?: "home" | "checkout") {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  useEffect(() => {
    let active = true;
    promotionAPI.live(placement).then((response) => { if (active && response.data) setPromotions(response.data); });
    return () => { active = false; };
  }, [placement]);
  // Drop a promotion from the page the moment it expires.
  const now = useNow(30_000);
  return promotions.filter((promotion) => isLive(promotion, now));
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** "Ends in 2d 4h 12m", or the end date when it is more than a week away. */
export function endsLabel(endsAt: string, now: number) {
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return "Ended";
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days >= 7) {
    return `Until ${new Date(endsAt).toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short", timeZone: "Pacific/Auckland" })}`;
  }
  if (days > 0) return `Ends in ${days}d ${hours}h`;
  if (hours > 0) return `Ends in ${hours}h ${mins}m`;
  const secs = Math.floor((ms % 60_000) / 1000);
  return `Ends in ${mins}m ${String(secs).padStart(2, "0")}s`;
}
