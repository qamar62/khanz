"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2, MapPin, Phone, ShoppingBag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Order, orderAPI } from "@/lib/api";
import { readCustomerSession, rememberedOrderEmail, rememberedOrderToken } from "@/lib/customer-session";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<Order["status"], string> = {
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  preparing: "Being prepared",
  ready: "Ready for pickup",
  collected: "Collected",
  cancelled: "Cancelled",
};

export default function OrderPage() {
  const params = useParams<{ reference: string }>();
  const reference = String(params.reference ?? "").toUpperCase();
  const { clear } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const auth = useCallback(() => ({ token: readCustomerSession()?.token ?? null, email: rememberedOrderEmail(reference), orderToken: rememberedOrderToken(reference) }), [reference]);

  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get("payment");
    setResult(payment);
    let attempts = 0;
    let cancelled = false;
    const load = async () => {
      // After returning from Stripe, ask the backend to confirm the payment with Stripe directly.
      const response = await orderAPI.get(reference, { ...auth(), sync: payment === "success" });
      if (cancelled) return;
      if (!response.data) { setError(response.error ?? "We couldn't find this order."); return; }
      setOrder(response.data);
      if (response.data.payment_status === "paid") {
        if (payment === "success") clear();
        return;
      }
      // Stripe's confirmation can arrive a moment after the redirect: check again briefly.
      if (payment === "success" && ++attempts < 8) setTimeout(load, 2000);
    };
    load();
    return () => { cancelled = true; };
  }, [reference, auth, clear]);

  async function payAgain() {
    setPaying(true); setPayError("");
    const response = await orderAPI.checkout(reference, auth());
    if (response.data?.checkout_url) { window.location.assign(response.data.checkout_url); return; }
    setPaying(false); setPayError(response.error ?? "Secure checkout isn't available right now.");
  }

  if (error) {
    return (
      <Shell>
        <XCircle className="mx-auto h-10 w-10 text-amber-300" />
        <h1 className="mt-5 font-serif text-4xl">Order not found</h1>
        <p className="mt-3 text-white/60">{error} Check the link in your confirmation email.</p>
        <Link href="/menu" className="mt-8 inline-flex rounded-full bg-[#c79532] px-6 py-3 text-sm font-semibold text-[#17200f]">Back to the menu</Link>
      </Shell>
    );
  }
  if (!order) return <Shell><Loader2 className="mx-auto h-8 w-8 animate-spin text-[#d8ad52]" /></Shell>;

  const paid = order.payment_status === "paid";
  const expired = order.status === "cancelled";
  const confirming = !paid && result === "success" && !expired;
  const when = order.pickup_at ? new Date(order.pickup_at).toLocaleString("en-NZ", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Pacific/Auckland" }) : "";

  return (
    <Shell>
      <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full", paid ? "bg-[#c79532] text-[#17200f]" : "bg-white/10 text-amber-200")}>
        {paid ? <CheckCircle2 className="h-8 w-8" /> : confirming ? <Loader2 className="h-8 w-8 animate-spin" /> : <XCircle className="h-8 w-8" />}
      </div>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8ad52]">Order {order.reference} · {STATUS_COPY[order.status]}</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-6xl">{paid ? "Order confirmed." : confirming ? "Confirming payment…" : expired ? "This order expired." : "Payment not completed."}</h1>
      <p className="mx-auto mt-5 max-w-xl text-white/60">
        {paid ? (order.email ? `Thanks, ${order.name}. We've emailed your receipt to ${order.email}.` : `Thanks, ${order.name}. Show reference ${order.reference} when you collect.`)
          : confirming ? "Thanks — we're confirming your payment with Stripe. This takes a few seconds."
          : expired ? "No money was taken. Please place a new order."
          : "No money was taken. You can try the payment again below."}
      </p>

      <div className="mx-auto mt-9 grid max-w-2xl gap-px bg-white/10 text-left sm:grid-cols-2">
        <Info icon={MapPin} label="Collect from" value={`${order.branch_name} · ${order.branch_address}`} />
        <Info icon={Clock} label="Pickup" value={order.pickup_asap ? `ASAP · ready around ${when}` : when} />
      </div>

      <div className="mx-auto mt-6 max-w-2xl border border-white/10 p-5 text-left text-sm">
        <ul className="divide-y divide-white/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2.5">
              <span>{item.quantity} × {item.name}{item.options.length ? <span className="block text-xs text-white/45">{item.options.map((option) => option.name).join(", ")}</span> : null}</span>
              <span className="tabular-nums">{formatMoney(item.line_total, order.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 space-y-1 border-t border-white/10 pt-3">
          <div className="flex justify-between text-white/65"><span>Subtotal</span><span>{formatMoney(order.subtotal, order.currency)}</span></div>
          {Number(order.discount) > 0 ? <div className="flex justify-between text-emerald-400"><span>{order.promotion_title || "Promotion"}</span><span>−{formatMoney(order.discount, order.currency)}</span></div> : null}
          <div className="flex justify-between text-white/65"><span>Card fee ({Number(order.card_fee_percent)}%)</span><span>{formatMoney(order.card_fee, order.currency)}</span></div>
          <div className="flex justify-between pt-1 text-base font-semibold"><span>{paid ? "Paid" : "Total"}</span><span>{formatMoney(order.total, order.currency)}</span></div>
        </div>
      </div>

      {!paid && !expired && !confirming ? (
        <div className="mx-auto mt-7 max-w-md">
          <Button onClick={payAgain} disabled={paying} className="h-12 w-full rounded-full bg-[#c79532] text-[#17200f] hover:bg-[#dfb85e]">{paying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening secure checkout…</> : `Pay ${formatMoney(order.total, order.currency)} by card`}</Button>
          {payError ? <p className="mt-3 text-sm text-amber-200">{payError}</p> : null}
        </div>
      ) : null}

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        {order.branch_phone ? <a href={`tel:${order.branch_phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold"><Phone className="h-4 w-4" /> Call the restaurant</a> : null}
        <Link href="/menu" className="inline-flex items-center gap-2 rounded-full bg-[#c79532] px-6 py-3 text-sm font-semibold text-[#17200f]"><ShoppingBag className="h-4 w-4" /> {paid ? "Order more" : "Back to the menu"}</Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[100svh] items-center bg-[#171c0f] px-5 py-28 text-white sm:px-8">
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-3xl border border-white/12 bg-[#222817] p-7 text-center sm:p-12">{children}</motion.section>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <div className="bg-[#202617] p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#d8ad52]"><Icon className="h-4 w-4" />{label}</div><p className="mt-2 text-sm text-white/70">{value}</p></div>;
}
