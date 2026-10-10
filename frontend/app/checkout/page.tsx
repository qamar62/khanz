"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, Clock, Loader2, Lock, Mail, MapPin, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, toOrderInput, lineUnitPrice } from "@/contexts/cart-context";
import { Branch, PickupTimes, Quote, branchAPI, customerAuthAPI, orderAPI } from "@/lib/api";
import { CustomerSession, clearCustomerSession, readCustomerSession, rememberOrder, saveCustomerSession } from "@/lib/customer-session";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CheckoutPromotionStrip } from "@/components/promotions/promotion-banner";
import { nextPromotion, useLivePromotions } from "@/lib/promotions";

const BRANCH_KEY = "khanz:pickup-branch";
const timeLabel = (iso: string, tz = "Pacific/Auckland") =>
  new Date(iso).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", timeZone: tz });

export default function CheckoutPage() {
  const cart = useCart();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branch, setBranch] = useState("");
  const [times, setTimes] = useState<PickupTimes | null>(null);
  const [timesError, setTimesError] = useState("");
  const [mode, setMode] = useState<"asap" | "scheduled">("asap");
  const [dayIndex, setDayIndex] = useState(0);
  const [pickupTime, setPickupTime] = useState("");

  const [session, setSession] = useState<CustomerSession | null>(null);
  const [guest, setGuest] = useState(true);
  const [guestEmail, setGuestEmail] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpStage, setOtpStage] = useState<"email" | "code">("email");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  // Order already created on this page whose payment didn't open yet: retry it instead of creating another.
  const [pending, setPending] = useState<{ reference: string; signature: string; auth: { token?: string; orderToken?: string } } | null>(null);
  const livePromotions = useLivePromotions("checkout");
  const upsell = quote && !quote.promotion ? nextPromotion(Number(quote.subtotal), livePromotions, "pickup") : null;

  // Restaurants and a returning customer's session.
  useEffect(() => {
    branchAPI.list().then((response) => {
      const pickup = (response.data ?? []).filter((item) => item.pickup_enabled !== false && item.is_active);
      setBranches(pickup);
      let saved = "";
      try { saved = localStorage.getItem(BRANCH_KEY) ?? ""; } catch { /* ignore */ }
      setBranch(pickup.some((item) => item.slug === saved) ? saved : pickup[0]?.slug ?? "");
    });
    const existing = readCustomerSession();
    if (existing) {
      setSession(existing);
      setGuest(false);
      setName(existing.customer.name);
      setPhone(existing.customer.phone);
      customerAuthAPI.me(existing.token).then((response) => {
        if (response.error) { clearCustomerSession(); setSession(null); }
      });
    }
  }, []);

  // Pickup times for the chosen restaurant.
  useEffect(() => {
    if (!branch) return;
    try { localStorage.setItem(BRANCH_KEY, branch); } catch { /* ignore */ }
    setTimes(null); setTimesError(""); setPickupTime(""); setDayIndex(0);
    orderAPI.pickupTimes(branch).then((response) => {
      if (!response.data) { setTimesError(response.error ?? "Pickup times are unavailable."); return; }
      setTimes(response.data);
      setMode(response.data.asap.available ? "asap" : "scheduled");
    });
  }, [branch]);

  // Server-side prices (the cart's numbers are only a preview).
  const cartInput = useMemo(() => toOrderInput(cart.lines), [cart.lines]);
  useEffect(() => {
    if (!branch || !cartInput.length) { setQuote(null); return; }
    let active = true;
    setQuoting(true);
    const timer = setTimeout(() => {
      orderAPI.quote(branch, cartInput).then((response) => {
        if (!active) return;
        setQuoting(false);
        if (response.data) { setQuote(response.data); setQuoteError(""); }
        else { setQuoteError(response.error ?? "We couldn't price your order."); }
      });
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [branch, cartInput]);

  const selectedBranch = branches.find((item) => item.slug === branch);
  const tz = times?.timezone ?? "Pacific/Auckland";
  const day = times?.days[dayIndex];
  const pickupValue = mode === "asap" ? "asap" : pickupTime;
  const pickupReady = mode === "asap" ? Boolean(times?.asap.available) : Boolean(pickupTime);
  const identified = guest || Boolean(session);
  const canPay = Boolean(identified && name.trim() && phone.trim() && quote && !quoteError && pickupReady && cart.lines.length && !placing);

  async function sendCode() {
    setOtpBusy(true); setOtpMessage(""); setDebugCode("");
    const response = await customerAuthAPI.requestCode(email.trim());
    setOtpBusy(false);
    if (response.error) { setOtpMessage(response.error); return; }
    setOtpStage("code");
    setOtpMessage(`We've emailed a 6-digit code to ${email.trim()}.`);
    if (response.data?.debug_code) setDebugCode(response.data.debug_code);
  }

  async function verifyCode() {
    setOtpBusy(true); setOtpMessage("");
    const response = await customerAuthAPI.verifyCode(email.trim(), code.trim());
    setOtpBusy(false);
    if (!response.data) { setOtpMessage(response.error ?? "That code didn't work."); return; }
    saveCustomerSession(response.data);
    setSession(response.data);
    setName((current) => current || response.data!.customer.name);
    setPhone((current) => current || response.data!.customer.phone);
    setCode(""); setOtpStage("email");
  }

  function signOut() {
    clearCustomerSession(); setSession(null); setOtpStage("email"); setCode(""); setOtpMessage("");
  }

  async function openPayment(reference: string, auth: { token?: string; orderToken?: string }) {
    const checkout = await orderAPI.checkout(reference, auth);
    if (checkout.data?.checkout_url) { window.location.assign(checkout.data.checkout_url); return; }
    setPlacing(false);
    setPlaceError(`${checkout.error ?? "Secure checkout isn't available right now."} Your order ${reference} is saved — press Pay again to retry.`);
  }

  async function placeOrder() {
    if (!canPay) return;
    const asGuest = guest || !session;
    setPlacing(true); setPlaceError("");
    const signature = JSON.stringify({ branch, cartInput, name, phone, pickupValue, notes, asGuest, guestEmail });
    if (pending && pending.signature === signature) { await openPayment(pending.reference, pending.auth); return; }
    const created = await orderAPI.create(asGuest ? null : session!.token, {
      branch, items: cartInput, name: name.trim(), phone: phone.trim(), pickup: pickupValue, notes,
      ...(asGuest ? { guest: true, email: guestEmail.trim() } : {}),
    });
    if (!created.data) {
      setPlacing(false);
      setPlaceError(created.error ?? "We couldn't place your order.");
      if (!asGuest && created.error?.includes("verify your email")) signOut();
      return;
    }
    rememberOrder(created.data.reference, created.data.email, created.data.access_token);
    const auth = asGuest ? { orderToken: created.data.access_token } : { token: session!.token };
    setPending({ reference: created.data.reference, signature, auth });
    await openPayment(created.data.reference, auth);
  }

  if (cart.ready && cart.lines.length === 0) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#171c0f] px-5 py-32 text-center text-white">
        <div>
          <ShoppingBag className="mx-auto h-9 w-9 text-[#d8ad52]" />
          <h1 className="mt-5 font-serif text-5xl">Your order is empty.</h1>
          <p className="mt-3 text-white/60">Add a few dishes from the menu, then come back to check out.</p>
          <Link href="/menu" className="mt-8 inline-flex rounded-full bg-[#c79532] px-6 py-3 text-sm font-semibold text-[#17200f]">Browse the menu</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[#f4ecdc] text-[#242b18] dark:bg-[#171c0f] dark:text-white">
      <section className="bg-[#11170c] px-5 pb-12 pt-32 text-white sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[1280px]">
          <Link href="/menu" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#d8ad52]"><ArrowLeft className="h-4 w-4" /> Back to menu</Link>
          <h1 className="mt-5 font-serif text-[clamp(2.8rem,6vw,5rem)] font-medium leading-[0.9] tracking-[-0.04em]">Checkout <span className="italic text-[#d8ad52]">for pickup.</span></h1>
          <p className="mt-4 max-w-xl text-white/60">Pay securely by card, then collect your order from the restaurant. No account needed — we just confirm your email.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 pt-8 sm:px-8 lg:px-14"><CheckoutPromotionStrip appliedId={quote?.promotion?.id ?? null} /></div>
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_420px] lg:px-14 lg:py-16">
        <div className="space-y-6">
          {/* 1. Pickup */}
          <Section number="1" title="Where & when to collect">
            <div className="grid gap-3 sm:grid-cols-2">
              {branches.map((item) => (
                <button key={item.slug} type="button" onClick={() => setBranch(item.slug)} className={cn("border p-4 text-left transition-colors", branch === item.slug ? "border-primary bg-primary/8 ring-1 ring-primary" : "border-black/12 hover:border-primary/50 dark:border-white/12")}>
                  <Store className={cn("h-5 w-5", branch === item.slug ? "text-primary" : "text-black/30 dark:text-white/30")} />
                  <strong className="mt-3 block font-serif text-lg leading-tight">{item.name}</strong>
                  <span className="mt-1 block text-xs text-black/50 dark:text-white/50">{item.address}</span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              {timesError ? <Notice tone="warn">{timesError}</Notice> : !times ? (
                <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Checking pickup times…</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Choice active={mode === "asap"} disabled={!times.asap.available} onClick={() => setMode("asap")} title="As soon as possible" subtitle={times.asap.available ? `Ready in about ${times.asap.minutes} min` : "Not available right now"} />
                    <Choice active={mode === "scheduled"} disabled={!times.days.length} onClick={() => setMode("scheduled")} title="Schedule pickup" subtitle={times.days.length ? "Choose a time" : "No times available"} />
                  </div>
                  <AnimatePresence initial={false}>
                    {mode === "scheduled" && times.days.length ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 flex gap-2">
                          {times.days.map((item, index) => (
                            <button key={item.date} type="button" onClick={() => { setDayIndex(index); setPickupTime(""); }} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", dayIndex === index ? "bg-[#242b18] text-white dark:bg-primary dark:text-primary-foreground" : "bg-black/5 dark:bg-white/5")}>{item.label}</button>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {day?.times.map((iso) => (
                            <button key={iso} type="button" onClick={() => setPickupTime(iso)} className={cn("h-11 border text-sm font-medium transition-colors", pickupTime === iso ? "border-[#242b18] bg-[#242b18] text-white dark:border-primary dark:bg-primary dark:text-primary-foreground" : "border-black/12 hover:border-primary dark:border-white/12")}>{timeLabel(iso, tz)}</button>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  {!times.asap.available && !times.days.length ? <div className="mt-4"><Notice tone="warn">{selectedBranch?.name ?? "This restaurant"} isn&apos;t taking pickup orders for today or tomorrow. Please choose another location.</Notice></div> : null}
                </>
              )}
            </div>
          </Section>

          {/* 2. Email verification + details */}
          <Section number="2" title="Your details">
            <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 bg-black/5 p-1 text-sm font-semibold dark:bg-white/5">
              <button type="button" role="tab" aria-selected={guest} onClick={() => setGuest(true)} className={cn("h-10 transition-colors", guest ? "bg-[#f7efdf] shadow-sm dark:bg-[#2c341f]" : "opacity-60")}>Continue as guest</button>
              <button type="button" role="tab" aria-selected={!guest} onClick={() => setGuest(false)} className={cn("h-10 transition-colors", !guest ? "bg-[#f7efdf] shadow-sm dark:bg-[#2c341f]" : "opacity-60")}>Verify email</button>
            </div>
            {guest ? (
              <p className="text-sm text-black/55 dark:text-white/55">Just your name and phone number. Add an email if you&apos;d like a receipt.</p>
            ) : session ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border border-emerald-700/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-100">
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Verified as <strong>{session.customer.email}</strong></span>
                <button type="button" onClick={signOut} className="text-xs font-semibold underline">Use another email</button>
              </div>
            ) : (
              <div>
                <p className="mb-3 text-sm text-black/55 dark:text-white/55">Enter your email and we&apos;ll send a one-time code. No password or account needed.</p>
                {otpStage === "email" ? (
                  <form onSubmit={(event) => { event.preventDefault(); if (email.includes("@")) sendCode(); }} className="flex flex-col gap-3 sm:flex-row">
                    <Field icon={Mail}><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full bg-transparent outline-none" /></Field>
                    <Button type="submit" disabled={otpBusy || !email.includes("@")} className="h-12 rounded-full bg-[#242b18] px-6 text-white hover:bg-primary hover:text-[#17200f] dark:bg-primary dark:text-primary-foreground">{otpBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send code"}</Button>
                  </form>
                ) : (
                  <form onSubmit={(event) => { event.preventDefault(); if (code.length === 6) verifyCode(); }} className="flex flex-col gap-3 sm:flex-row">
                    <Field icon={Lock}><input inputMode="numeric" autoComplete="one-time-code" autoFocus value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" className="h-12 w-full bg-transparent tracking-[0.4em] outline-none placeholder:tracking-normal" /></Field>
                    <Button type="submit" disabled={otpBusy || code.length !== 6} className="h-12 rounded-full bg-[#242b18] px-6 text-white hover:bg-primary hover:text-[#17200f] dark:bg-primary dark:text-primary-foreground">{otpBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}</Button>
                  </form>
                )}
                {otpMessage ? <p className="mt-3 text-sm text-black/60 dark:text-white/60">{otpMessage} {otpStage === "code" ? <><button type="button" onClick={() => { setOtpStage("email"); setCode(""); }} className="font-semibold underline">Change email</button> · <button type="button" onClick={sendCode} disabled={otpBusy} className="font-semibold underline">Resend</button></> : null}</p> : null}
                {debugCode ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Local testing: your code is <strong>{debugCode}</strong> (shown only while email is printed to the console).</p> : null}
              </div>
            )}

            <div className={cn("mt-5 grid gap-4 transition-opacity sm:grid-cols-2", !identified && "pointer-events-none opacity-40")} aria-disabled={!identified}>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Name</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Jane Smith" className="h-12 w-full border border-black/15 bg-transparent px-3 outline-none focus:border-primary dark:border-white/15" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Phone</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+64" className="h-12 w-full border border-black/15 bg-transparent px-3 outline-none focus:border-primary dark:border-white/15" /></label>
              {guest ? <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Email for receipt (optional)</span><input type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className="h-12 w-full border border-black/15 bg-transparent px-3 outline-none focus:border-primary dark:border-white/15" /></label> : null}
              <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Note for the restaurant (optional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value.slice(0, 500))} rows={3} placeholder="Allergies or anything we should know" className="w-full resize-none border border-black/15 bg-transparent p-3 outline-none focus:border-primary dark:border-white/15" /></label>
            </div>
          </Section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-black/10 bg-[#f7efdf] p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] dark:border-white/10 dark:bg-[#222817]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Order summary</h2>
              <button type="button" onClick={() => cart.setOpen(true)} className="text-xs font-semibold text-primary underline">Edit</button>
            </div>
            <ul className="mt-4 divide-y divide-black/10 text-sm dark:divide-white/10">
              {cart.lines.map((line) => (
                <li key={line.key} className="flex justify-between gap-3 py-3">
                  <span><span className="font-semibold">{line.quantity} ×</span> {line.name}{line.options.length ? <span className="block text-xs text-black/50 dark:text-white/50">{line.options.map((option) => option.name).join(", ")}</span> : null}</span>
                  <span className="shrink-0 tabular-nums">{formatMoney(lineUnitPrice(line) * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className={cn("mt-2 space-y-1.5 border-t border-black/10 pt-4 text-sm transition-opacity dark:border-white/10", quoting && "opacity-50")}>
              <Row label="Subtotal" value={quote ? formatMoney(quote.subtotal, quote.currency) : "—"} />
              {quote && Number(quote.discount) > 0 ? <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400"><span>{quote.promotion?.badge || "Promotion"} · {quote.promotion_title}</span><span className="tabular-nums">−{formatMoney(quote.discount, quote.currency)}</span></div> : null}
              <Row label={`Card fee (${quote ? Number(quote.card_fee_percent) : 2.5}%)`} value={quote ? formatMoney(quote.card_fee, quote.currency) : "—"} muted />
              <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold dark:border-white/10"><span>Total</span><span className="tabular-nums">{quote ? formatMoney(quote.total, quote.currency) : "—"}</span></div>
            </div>
            {upsell && quote ? (
              <p className="mt-3 border border-dashed border-[#c79532]/60 px-3 py-2 text-xs">Add <strong>{formatMoney(Number(upsell.min_subtotal) - Number(quote.subtotal), quote.currency)}</strong> more to get <strong>{upsell.badge || upsell.title}</strong>.</p>
            ) : null}
            {selectedBranch ? (
              <div className="mt-4 space-y-1 text-xs text-black/55 dark:text-white/55">
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" /> Pickup at {selectedBranch.name}</p>
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> {mode === "asap" ? (times?.asap.available ? `ASAP · about ${times.asap.minutes} min` : "Choose a time") : pickupTime ? `${day?.label.split(" · ")[0]} at ${timeLabel(pickupTime, tz)}` : "Choose a time"}</p>
              </div>
            ) : null}
            {quoteError ? <div className="mt-4"><Notice tone="warn">{quoteError}</Notice></div> : null}
            {placeError ? <div className="mt-4"><Notice tone="error">{placeError}</Notice></div> : null}
            <Button type="button" onClick={placeOrder} disabled={!canPay} className="mt-5 h-12 w-full rounded-full bg-[#c79532] text-[#17200f] hover:bg-[#dfb85e] disabled:opacity-40">
              {placing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening secure checkout…</> : quote ? `Pay ${formatMoney(quote.total, quote.currency)} by card` : "Pay by card"}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-black/45 dark:text-white/45"><Lock className="h-3 w-3" /> Secure payment by Stripe. Pickup only — no delivery.</p>
            {!identified ? <p className="mt-2 text-center text-xs text-black/45 dark:text-white/45">Verify your email or continue as a guest.</p> : !name.trim() || !phone.trim() ? <p className="mt-2 text-center text-xs text-black/45 dark:text-white/45">Add your name and phone number to continue.</p> : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border border-black/10 bg-[#f7efdf] p-6 sm:p-8 dark:border-white/10 dark:bg-[#222817]">
      <h2 className="mb-5 flex items-center gap-3 font-serif text-2xl"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-sans text-sm font-bold text-primary-foreground">{number}</span>{title}</h2>
      {children}
    </section>
  );
}

function Choice({ active, disabled, onClick, title, subtitle }: { active: boolean; disabled?: boolean; onClick: () => void; title: string; subtitle: string }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cn("border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40", active ? "border-primary bg-primary/8 ring-1 ring-primary" : "border-black/12 hover:border-primary/50 dark:border-white/12")}>
      <strong className="block text-sm">{title}</strong>
      <span className="mt-1 block text-xs text-black/50 dark:text-white/50">{subtitle}</span>
    </button>
  );
}

function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return <div className="flex flex-1 items-center gap-3 border border-black/15 px-3 focus-within:border-primary dark:border-white/15"><Icon className="h-4 w-4 shrink-0 text-black/35 dark:text-white/35" />{children}</div>;
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className={cn("flex justify-between", muted && "text-black/55 dark:text-white/55")}><span>{label}</span><span className="tabular-nums">{value}</span></div>;
}

function Notice({ tone, children }: { tone: "warn" | "error"; children: React.ReactNode }) {
  return (
    <div role="alert" className={cn("flex items-start gap-2 border px-3 py-2.5 text-sm", tone === "warn" ? "border-amber-600/30 bg-amber-100/70 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100" : "border-red-700/30 bg-red-50 text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100")}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{children}</span>
    </div>
  );
}
