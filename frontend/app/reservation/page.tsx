"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, CalendarDays, Check, CheckCircle2, Clock, CreditCard, Loader2,
  MapPin, Minus, Plus, Trash2, UtensilsCrossed, Users, Wallet, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvailabilitySlot, Branch, Reservation, ReservationLookup, branchAPI, reservationAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CartLine, buildLine, lineUnitPrice, mergeLine, toOrderInput } from "@/contexts/cart-context";
import { MenuPicker } from "@/components/order/menu-picker";
import { CARD_FEE_PERCENT, cardFee, formatMoney } from "@/lib/money";
import { bestPromotion, useLivePromotions } from "@/lib/promotions";
import type { MenuItem } from "@/lib/api";

const fallbackDefaults = { phone: "", email: "", hours: "", is_active: true, booking_enabled: true, currency: "NZD", booking_interval_minutes: 30, default_booking_duration_minutes: 90, min_advance_minutes: 120, max_advance_days: 30, max_online_party_size: 12, deposit_policy: "none" as const, deposit_amount: "0.00", online_payments_enabled: false };
const fallbackBranches: Branch[] = [
  { ...fallbackDefaults, id: 1, slug: "khanz-mediterranean", code: "MEDIT_PAP", name: "Khanz Mediterranean", address: "135 Great South Road, Papatoetoe", is_flagship: true, online_capacity: 80, sort_order: 1 },
  { ...fallbackDefaults, id: 2, slug: "khanz-botany", code: "BOTANY", name: "Khanz Restaurant Botany", address: "302 Te Irirangi Drive, Flat Bush", is_flagship: false, online_capacity: 80, sort_order: 2 },
  { ...fallbackDefaults, id: 3, slug: "khanz-takeaway", code: "PANMURE", name: "Khanz Takeaway", address: "10/71 Jellicoe Road, Panmure", is_flagship: false, online_capacity: 40, sort_order: 3 },
];
const occasions = [
  { label: "Birthday", value: "birthday" },
  { label: "Anniversary", value: "anniversary" },
  { label: "Date night", value: "date" },
  { label: "Business dinner", value: "business" },
  { label: "Celebration", value: "celebration" },
  { label: "Other", value: "other" },
];

const PENDING_KEY = "khanz:pending-payment";
type PendingPayment = { id: number; email: string; reference: string; branchName: string; when: string; party: string };
function savePending(value: PendingPayment) { try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(value)); } catch { /* storage unavailable */ } }
function readPending(): PendingPayment | null { try { const raw = sessionStorage.getItem(PENDING_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }

const emptyForm = { branch: "", date: "", time: "", slotId: "", adults: "2", children: "0", name: "", email: "", phone: "", occasion: "", specialRequests: "" };
const toCount = (value: string) => { const parsed = parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : 0; };
const seats = (count: number) => `${count} ${count === 1 ? "seat" : "seats"}`;

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<Branch[]>(fallbackBranches);
  const [formData, setFormData] = useState(emptyForm);
  const [preorder, setPreorder] = useState<CartLine[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Availability: fetched once per restaurant + date; party size is applied client-side, so typing
  // guest counts or picking a time never re-requests or blanks the grid.
  const cache = useRef(new Map<string, AvailabilitySlot[]>());
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [slotsKey, setSlotsKey] = useState<string | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "redirecting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "loading" | "error">("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentReturn, setPaymentReturn] = useState<{ result: "success" | "cancelled"; reference: string } | null>(null);

  useEffect(() => { branchAPI.list().then((response) => { if (response.data?.length) setBranches(response.data.filter((branch) => branch.booking_enabled)); }); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("payment");
    if (result === "success" || result === "cancelled") setPaymentReturn({ result, reference: params.get("reference") ?? "" });
  }, []);

  const selectedBranch = branches.find((branch) => branch.slug === formData.branch);
  const maxAdvanceDays = selectedBranch?.max_advance_days ?? 30;
  const maxParty = selectedBranch?.max_online_party_size ?? 12;
  const availableDates = useMemo(() => Array.from({ length: maxAdvanceDays }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() + index + 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { value, label: date.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" }) };
  }), [maxAdvanceDays]);
  const selectedDate = availableDates.find((date) => date.value === formData.date);
  const adults = toCount(formData.adults);
  const children = toCount(formData.children);
  const totalGuests = adults + children;

  const currentKey = formData.branch && formData.date ? `${formData.branch}|${formData.date}` : null;
  useEffect(() => {
    if (!formData.branch || !formData.date) { setSlots(null); setSlotsKey(null); setAvailabilityLoading(false); return; }
    const key = `${formData.branch}|${formData.date}`;
    const cached = cache.current.get(key);
    if (cached) { setSlots(cached); setSlotsKey(key); }
    let active = true;
    setAvailabilityLoading(true); setAvailabilityError("");
    reservationAPI.availability(formData.branch, formData.date, 1).then((response) => {
      if (!active) return;
      setAvailabilityLoading(false);
      if (response.data) { cache.current.set(key, response.data.slots); setSlots(response.data.slots); setSlotsKey(key); }
      else setAvailabilityError(response.error ?? "We couldn't load live times. Please try again.");
    });
    return () => { active = false; };
  }, [formData.branch, formData.date, refreshToken]);

  const slotsReady = Boolean(currentKey && slotsKey === currentKey && slots);
  const visibleSlots = slotsReady ? slots ?? [] : [];
  const selectedSlot = visibleSlots.find((slot) => String(slot.id) === formData.slotId);

  // If a refresh removed the chosen time entirely, clear it.
  useEffect(() => {
    if (slotsReady && formData.slotId && !selectedSlot) setFormData((current) => ({ ...current, time: "", slotId: "" }));
  }, [slotsReady, formData.slotId, selectedSlot]);

  const maxRemaining = visibleSlots.length ? Math.max(...visibleSlots.map((slot) => slot.remaining_capacity)) : null;
  const capacityNotice = useMemo(() => {
    if (!selectedBranch || totalGuests < 1) return null;
    if (totalGuests > maxParty) return `Online bookings are for up to ${maxParty} guests. For a larger group please call ${selectedBranch.phone || "the restaurant"}.`;
    if (selectedSlot && totalGuests > selectedSlot.remaining_capacity) {
      return selectedSlot.remaining_capacity === 0
        ? `${selectedSlot.label} has just filled up. Please choose another time.`
        : `Only ${seats(selectedSlot.remaining_capacity)} left at ${selectedSlot.label}. Reduce your party or choose another time.`;
    }
    if (!selectedSlot && slotsReady && maxRemaining !== null && totalGuests > maxRemaining) {
      return maxRemaining === 0
        ? `${selectedDate?.label ?? "This date"} is fully booked. Please try another date.`
        : `Only ${seats(maxRemaining)} left in any time on ${selectedDate?.label ?? "this date"}. Reduce your party or try another date.`;
    }
    return null;
  }, [selectedBranch, totalGuests, maxParty, selectedSlot, slotsReady, maxRemaining, selectedDate]);

  // Optional pre-ordered food: paid by card (food + card fee). No food = free booking.
  const currency = selectedBranch?.currency ?? "NZD";
  const feePercent = Number(selectedBranch?.card_fee_percent ?? CARD_FEE_PERCENT);
  const preorderSubtotal = Math.round(preorder.reduce((sum, line) => sum + lineUnitPrice(line) * line.quantity, 0) * 100) / 100;
  const livePromotions = useLivePromotions("checkout");
  const { promotion: preorderPromotion, discount: preorderDiscount } = bestPromotion(preorderSubtotal, livePromotions, "preorder");
  const preorderFee = cardFee(preorderSubtotal - preorderDiscount, feePercent);
  const preorderTotal = Math.round((preorderSubtotal - preorderDiscount + preorderFee) * 100) / 100;
  const preorderCounts = useMemo(() => preorder.reduce<Record<number, number>>((acc, line) => ({ ...acc, [line.menuItemId]: (acc[line.menuItemId] ?? 0) + line.quantity }), {}), [preorder]);
  const addPreorder = (item: MenuItem, optionIds: number[], quantity: number, notes: string) => setPreorder((current) => mergeLine(current, buildLine(item, optionIds, quantity, notes)));
  const setPreorderQuantity = (key: string, quantity: number) => setPreorder((current) => (quantity <= 0 ? current.filter((line) => line.key !== key) : current.map((line) => (line.key === key ? { ...line, quantity } : line))));
  const cardUnavailable = preorder.length > 0 && !selectedBranch?.online_payments_enabled;

  const update = (field: keyof typeof emptyForm, value: string) => { setFormData((current) => ({ ...current, [field]: value })); if (status === "error") setStatus("idle"); };
  const chooseBranch = (slug: string) => setFormData((current) => (current.branch === slug ? current : { ...current, branch: slug, time: "", slotId: "" }));
  const chooseDate = (value: string) => setFormData((current) => (current.date === value ? current : { ...current, date: value, time: "", slotId: "" }));

  const canContinue = Boolean(formData.branch && formData.date && selectedSlot && adults >= 1 && !capacityNotice);
  const canSubmit = Boolean(canContinue && formData.name && formData.email && formData.phone && !cardUnavailable);
  const whenLabel = `${selectedDate?.label ?? formData.date} · ${formData.time}`;
  const partyLabel = `${adults} ${adults === 1 ? "adult" : "adults"} · ${children} ${children === 1 ? "child" : "children"}`;

  const openCheckout = useCallback(async (id: number, email: string) => {
    setPaymentState("loading"); setPaymentMessage("");
    const response = await reservationAPI.createCheckoutSession(id, email);
    if (response.data?.checkout_url) { window.location.assign(response.data.checkout_url); return true; }
    setPaymentState("error"); setPaymentMessage(response.error ?? "Secure checkout isn't available right now. Your seats are held — please try again shortly.");
    return false;
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("sending"); setErrorMessage("");
    const response = await reservationAPI.create({
      name: formData.name, email: formData.email, phone: formData.phone, date: formData.date,
      time_slot_id: Number(formData.slotId), adult_guests: adults, child_guests: children,
      occasion: formData.occasion, special_requests: formData.specialRequests,
      branch_slug: formData.branch, payment_method: "card", source: "web",
      preorder_items: preorder.length ? toOrderInput(preorder) : undefined,
    });
    if (!response.data) {
      setStatus("error");
      setErrorMessage(response.error ?? "We couldn't complete that request. Please try again.");
      cache.current.delete(currentKey ?? ""); setRefreshToken((token) => token + 1);
      return;
    }
    setReservation(response.data);
    if (response.data.preorder && response.data.preorder.payment_status !== "paid") {
      savePending({ id: response.data.id, email: formData.email, reference: response.data.reference, branchName: selectedBranch?.name ?? formData.branch, when: whenLabel, party: partyLabel });
      setStatus("redirecting");
      const redirected = await openCheckout(response.data.id, formData.email);
      if (!redirected) setStatus("success");
      return;
    }
    setStatus("success");
  }

  if (paymentReturn) return <PaymentReturn result={paymentReturn.result} reference={paymentReturn.reference} onRetry={openCheckout} paymentState={paymentState} paymentMessage={paymentMessage} />;

  if (status === "success" && reservation) {
    const cardPending = Boolean(reservation.preorder && reservation.preorder.payment_status !== "paid");
    return (
      <ResultShell>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#c79532] text-[#17200f]"><CheckCircle2 className="h-8 w-8" /></div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8ad52]">Reservation {reservation.reference}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-6xl">{cardPending ? "Almost there." : "Your table is booked."}</h1>
        <p className="mx-auto mt-5 max-w-xl text-white/60">
          {cardPending
            ? `Thanks, ${formData.name}. Your table is held while you pay for your pre-order.`
            : `Thanks, ${formData.name}. We've sent the details to ${formData.email}.`}
        </p>
        <div className="mx-auto mt-9 grid max-w-2xl gap-px bg-white/10 text-left sm:grid-cols-2">
          <SummaryItem icon={MapPin} label="Restaurant" value={selectedBranch?.name ?? formData.branch} />
          <SummaryItem icon={CalendarDays} label="When" value={whenLabel} />
          <SummaryItem icon={Users} label="Party" value={partyLabel} />
          <SummaryItem icon={Wallet} label="Pre-ordered food" value={reservation.preorder ? `${formatMoney(reservation.preorder.total, reservation.preorder.currency)} by card` : "None — pay at the restaurant"} />
        </div>
        {cardPending ? (
          <div className="mx-auto mt-7 max-w-2xl border border-[#d8ad52]/35 bg-[#d8ad52]/8 p-5 text-left">
            <div className="flex gap-3"><CreditCard className="mt-0.5 h-5 w-5 text-[#d8ad52]" /><div><strong>Pre-order total: {formatMoney(reservation.preorder?.total ?? 0, reservation.preorder?.currency)}</strong><p className="mt-1 text-sm text-white/55">Secure checkout opens on Stripe. No card details pass through Khanz servers.</p></div></div>
            <Button onClick={() => openCheckout(reservation.id, formData.email)} disabled={paymentState === "loading"} className="mt-5 h-12 w-full rounded-full bg-[#c79532] text-[#17200f] hover:bg-[#dfb85e]">{paymentState === "loading" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening secure checkout…</> : "Pay securely by card"}</Button>
            {paymentMessage ? <p className="mt-3 text-sm text-amber-200">{paymentMessage}</p> : null}
          </div>
        ) : null}
        <ResultLinks />
      </ResultShell>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[#171c0f] text-white">
      <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-14 lg:pb-28 lg:pt-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=88&w=2200')] bg-cover bg-center" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,20,9,.97)_0%,rgba(15,20,9,.88)_48%,rgba(15,20,9,.58)_100%)]" /><div className="absolute inset-0 bg-gradient-to-t from-[#171c0f] via-transparent to-black/35" />
        <div className="relative mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.68fr_1fr] lg:items-start lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-36">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8ad52]">Reservations</p><h1 className="mt-5 font-serif text-[clamp(3.8rem,7vw,7rem)] font-medium leading-[0.86] tracking-[-0.05em]">A table is<br /><span className="italic text-[#d8ad52]">waiting.</span></h1><p className="mt-7 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">Live availability, free booking, and the option to pre-order your food so it's ready when you arrive.</p>
            <div className="mt-10 hidden border-t border-white/15 pt-7 lg:block"><p className="text-xs uppercase tracking-[0.2em] text-white/35">Your booking</p><div className="mt-5 space-y-4 text-sm"><BookingLine icon={MapPin} text={selectedBranch?.name ?? "Choose a restaurant"} active={Boolean(selectedBranch)} /><BookingLine icon={CalendarDays} text={selectedDate?.label ?? "Choose a date"} active={Boolean(selectedDate)} /><BookingLine icon={Clock} text={formData.time || "Choose a time"} active={Boolean(formData.time)} /><BookingLine icon={Users} text={partyLabel} active={totalGuests > 0} /><BookingLine icon={Wallet} text={preorder.length ? `Pre-order · ${formatMoney(preorderTotal, currency)}` : "No pre-order · free booking"} active={preorder.length > 0} /></div></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="border border-white/12 bg-[#f7efdf] text-[#242b18] shadow-[0_30px_100px_rgba(0,0,0,.25)] dark:bg-[#222817] dark:text-white">
            <div className="flex border-b border-black/10 dark:border-white/10"><Step number="1" label="Table details" active={step === 1} complete={step > 1} /><Step number="2" label="Details & payment" active={step === 2} complete={false} /></div>
            <form onSubmit={handleSubmit} className="p-6 sm:p-9 lg:p-10"><AnimatePresence mode="wait" initial={false}>{step === 1 ? (
              <motion.div key="table" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.22 }}>
                <FormHeading eyebrow="Step one" title="When should we expect you?" />
                <fieldset className="mt-8"><legend className="mb-3 text-sm font-semibold">Choose a restaurant</legend><div className="grid gap-3 sm:grid-cols-2">{branches.map((branch) => <button key={branch.slug} type="button" onClick={() => chooseBranch(branch.slug)} className={cn("min-h-32 border p-4 text-left transition-colors duration-200", formData.branch === branch.slug ? "border-primary bg-primary/8 ring-1 ring-primary" : "border-black/12 hover:border-primary/50 dark:border-white/12")}><MapPin className={cn("h-5 w-5 transition-colors", formData.branch === branch.slug ? "text-primary" : "text-black/30 dark:text-white/30")} /><strong className="mt-5 block font-serif text-lg leading-tight">{branch.name}</strong><span className="mt-2 block text-xs text-black/45 dark:text-white/45">{branch.address}</span></button>)}</div></fieldset>

                <div className="mt-7 grid gap-5 sm:grid-cols-3">
                  <Field label="Date"><Select value={formData.date} onValueChange={chooseDate}><SelectTrigger className="h-12 w-full rounded-none border-black/15 bg-transparent dark:border-white/15"><SelectValue placeholder="Choose a date" /></SelectTrigger><SelectContent>{availableDates.map((date) => <SelectItem key={date.value} value={date.value}>{date.label}</SelectItem>)}</SelectContent></Select></Field>
                  <GuestStepper label="Adults" value={formData.adults} min={1} onChange={(value) => update("adults", value)} />
                  <GuestStepper label="Children" value={formData.children} min={0} onChange={(value) => update("children", value)} />
                </div>
                <AnimatePresence initial={false}>
                  {capacityNotice ? (
                    <motion.div key="capacity-notice" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
                      <motion.div key={capacityNotice} initial={{ y: -6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} role="status" aria-live="polite" className="mt-4 flex items-start gap-3 border border-amber-600/30 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" /><span>{capacityNotice}</span>
                      </motion.div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <fieldset className="mt-7">
                  <legend className="mb-3 flex w-full items-center justify-between text-sm font-semibold"><span>Available times · {totalGuests} {totalGuests === 1 ? "person" : "people"}</span><AvailabilityIndicator loading={availabilityLoading && Boolean(currentKey)} /></legend>
                  <div className="relative min-h-[8.5rem]">
                    <AnimatePresence mode="wait" initial={false}>
                      {!currentKey ? (
                        <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="border border-dashed border-black/15 p-5 text-sm text-black/45 dark:border-white/15 dark:text-white/45">Choose a restaurant and date to see live times.</motion.p>
                      ) : !slotsReady ? (
                        availabilityError ? (
                          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-dashed border-red-700/30 p-5 text-sm text-red-800 dark:text-red-300">{availabilityError} <button type="button" onClick={() => setRefreshToken((token) => token + 1)} className="ml-1 font-semibold underline">Try again</button></motion.div>
                        ) : (
                          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden>
                            {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-14 overflow-hidden border border-black/8 bg-black/[.04] dark:border-white/8 dark:bg-white/[.04]"><div className="khanz-shimmer h-full w-full" style={{ animationDelay: `${index * 70}ms` }} /></div>)}
                          </motion.div>
                        )
                      ) : visibleSlots.length === 0 ? (
                        <motion.p key={`none-${currentKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-dashed border-black/15 p-5 text-sm text-black/45 dark:border-white/15 dark:text-white/45">No online times on this day. Please try another date.</motion.p>
                      ) : (
                        <motion.div key={`slots-${currentKey}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: "easeOut" }} className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {visibleSlots.map((slot, index) => {
                            const fits = slot.remaining_capacity >= Math.max(totalGuests, 1);
                            const selected = formData.slotId === String(slot.id);
                            return (
                              <motion.button key={slot.id} type="button" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.25), duration: 0.2 }}
                                disabled={slot.remaining_capacity === 0 || (!fits && !selected)}
                                onClick={() => setFormData((current) => ({ ...current, time: slot.label, slotId: String(slot.id) }))}
                                className={cn("min-h-14 border px-2 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-30",
                                  selected && fits && "border-[#242b18] bg-[#242b18] text-white dark:border-primary dark:bg-primary dark:text-primary-foreground",
                                  selected && !fits && "border-amber-600 bg-amber-100 text-amber-950 ring-1 ring-amber-600 dark:bg-amber-400/15 dark:text-amber-100",
                                  !selected && "border-black/12 hover:border-primary dark:border-white/12")}>
                                <span className="block">{slot.label}</span>
                                <span className="mt-0.5 block text-[0.65rem] font-normal opacity-60">{slot.remaining_capacity === 0 ? "Full" : `${slot.remaining_capacity} left`}</span>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </fieldset>
                <Button type="button" disabled={!canContinue} onClick={() => setStep(2)} className="mt-8 h-12 w-full rounded-full bg-[#242b18] text-white transition-colors hover:bg-primary hover:text-[#17200f] disabled:opacity-35 dark:bg-primary dark:text-primary-foreground">Continue to your details</Button>
              </motion.div>
            ) : (
              <motion.div key="guest" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.22 }}>
                <FormHeading eyebrow="Step two" title="Who are we welcoming?" />
                <div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Your name"><Input required value={formData.name} onChange={(event) => update("name", event.target.value)} placeholder="Jane Smith" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field><Field label="Phone number"><Input type="tel" required value={formData.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+64" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field></div>
                <div className="mt-5"><Field label="Email address"><Input type="email" required value={formData.email} onChange={(event) => update("email", event.target.value)} placeholder="jane@example.com" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field></div>
                <div className="mt-5"><Field label="Occasion (optional)"><Select value={formData.occasion} onValueChange={(value) => update("occasion", value)}><SelectTrigger className="h-12 w-full rounded-none border-black/15 bg-transparent dark:border-white/15"><SelectValue placeholder="What are we celebrating?" /></SelectTrigger><SelectContent>{occasions.map((occasion) => <SelectItem key={occasion.value} value={occasion.value}>{occasion.label}</SelectItem>)}</SelectContent></Select></Field></div>
                <div className="mt-5"><Field label="Special requests (optional)"><Textarea value={formData.specialRequests} onChange={(event) => update("specialRequests", event.target.value)} placeholder="Allergies, accessibility needs or anything else we should know…" rows={4} className="resize-none rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field></div>

                <div className="mt-7 border border-black/10 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <UtensilsCrossed className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="text-sm">
                        <strong className="block">Pre-order food (optional)</strong>
                        <span className="mt-0.5 block text-xs text-black/50 dark:text-white/50">Choose dishes now and they&apos;ll be ready when you arrive. Skip this to book for free and order at the table.</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setPickerOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"><Plus className="h-3.5 w-3.5" /> {preorder.length ? "Add more" : "Add dishes"}</button>
                  </div>
                  <AnimatePresence initial={false}>
                    {preorder.length ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <ul className="mt-4 divide-y divide-black/10 text-sm dark:divide-white/10">
                          {preorder.map((line) => (
                            <li key={line.key} className="flex items-center justify-between gap-3 py-2.5">
                              <div className="min-w-0"><p className="font-medium">{line.name}</p>{line.options.length ? <p className="text-xs text-black/50 dark:text-white/50">{line.options.map((option) => option.name).join(", ")}</p> : null}</div>
                              <div className="flex shrink-0 items-center gap-3">
                                <div className="flex h-8 items-stretch border border-black/15 dark:border-white/15">
                                  <button type="button" aria-label={`Fewer ${line.name}`} onClick={() => setPreorderQuantity(line.key, line.quantity - 1)} className="flex w-8 items-center justify-center">{line.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}</button>
                                  <span className="flex w-8 items-center justify-center border-x border-black/10 text-xs font-semibold dark:border-white/10">{line.quantity}</span>
                                  <button type="button" aria-label={`More ${line.name}`} onClick={() => setPreorderQuantity(line.key, Math.min(50, line.quantity + 1))} className="flex w-8 items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                                </div>
                                <span className="w-16 text-right tabular-nums">{formatMoney(lineUnitPrice(line) * line.quantity, currency)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 space-y-1 border-t border-black/10 pt-3 text-sm dark:border-white/10">
                          <div className="flex justify-between"><span>Food subtotal</span><span className="tabular-nums">{formatMoney(preorderSubtotal, currency)}</span></div>
                          {preorderPromotion ? <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400"><span>{preorderPromotion.badge || "Promotion"} · {preorderPromotion.title}</span><span className="tabular-nums">−{formatMoney(preorderDiscount, currency)}</span></div> : null}
                          <div className="flex justify-between text-black/55 dark:text-white/55"><span>Card fee ({feePercent}%)</span><span className="tabular-nums">{formatMoney(preorderFee, currency)}</span></div>
                          <div className="flex justify-between pt-1 font-semibold"><span>Pay now by card</span><span className="tabular-nums">{formatMoney(preorderTotal, currency)}</span></div>
                        </div>
                        {cardUnavailable ? <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">Online payment is unavailable right now. Remove the dishes to book for free, or call {selectedBranch?.phone || "the restaurant"}.</p> : null}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className="mt-7 border border-black/10 bg-black/[.025] p-4 text-sm dark:border-white/10 dark:bg-white/[.025]"><strong>{selectedBranch?.name}</strong><p className="mt-1 text-black/50 dark:text-white/50">{whenLabel} · {partyLabel}</p></div>
                <AnimatePresence>{status === "error" ? <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">{errorMessage || "We couldn't complete that request."} If your time just filled, go back and pick another.</motion.p> : null}</AnimatePresence>
                <div className="mt-7 flex gap-3"><Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 flex-1 rounded-full border-black/20 dark:border-white/20">Back</Button><Button type="submit" disabled={!canSubmit || status === "sending" || status === "redirecting"} className="h-12 flex-[1.6] rounded-full bg-[#242b18] text-white hover:bg-primary hover:text-[#17200f] dark:bg-primary dark:text-primary-foreground">{status === "sending" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reserving…</> : status === "redirecting" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening secure checkout…</> : preorder.length ? `Reserve & pay ${formatMoney(preorderTotal, currency)}` : "Confirm reservation"}</Button></div>
                <p className="mt-4 text-center text-xs text-black/40 dark:text-white/40">Adults and children both count toward the restaurant&apos;s live capacity.</p>
              </motion.div>
            )}</AnimatePresence></form>
          </motion.div>
        </div>
      </section>
      <MenuPicker open={pickerOpen} onOpenChange={setPickerOpen} onAdd={addPreorder} counts={preorderCounts}
        summary={<div className="flex justify-between text-sm"><span>{preorder.reduce((sum, line) => sum + line.quantity, 0)} dishes · card fee {feePercent}% added</span><span className="font-semibold tabular-nums">{formatMoney(preorderSubtotal, currency)}</span></div>} />
    </main>
  );
}

function PaymentReturn({ result, reference, onRetry, paymentState, paymentMessage }: { result: "success" | "cancelled"; reference: string; onRetry: (id: number, email: string) => Promise<boolean>; paymentState: string; paymentMessage: string }) {
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [lookup, setLookup] = useState<ReservationLookup | null>(null);

  useEffect(() => {
    const saved = readPending();
    const match = saved && (!reference || saved.reference === reference) ? saved : null;
    setPending(match);
    if (!match) return;
    let attempts = 0; let cancelled = false;
    const check = async () => {
      const response = await reservationAPI.lookup(match.reference, match.email, result === "success");
      if (cancelled) return;
      if (response.data) setLookup(response.data);
      // Stripe's webhook can land a moment after the redirect: poll briefly until it is marked paid.
      if (result === "success" && response.data?.payment_status !== "paid" && ++attempts < 6) setTimeout(check, 2000);
    };
    check();
    return () => { cancelled = true; };
  }, [reference, result]);

  const paid = lookup?.payment_status === "paid";
  const expired = lookup?.status === "cancelled";
  const success = result === "success";
  return (
    <ResultShell>
      <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full", success ? "bg-[#c79532] text-[#17200f]" : "bg-white/10 text-amber-200")}>{success ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}</div>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8ad52]">Reservation {reference}</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-6xl">{success ? "Payment received." : expired ? "This hold has expired." : "Payment not completed."}</h1>
      <p className="mx-auto mt-5 max-w-xl text-white/60">
        {success
          ? paid ? "Your table is confirmed and a confirmation email is on its way." : "Thanks — we're confirming your payment with Stripe. Your confirmation email will follow shortly."
          : expired ? "The table was released because the pre-order wasn't paid in time. Please make a new booking." : "No money was taken. Your seats are held for 30 minutes so you can try again."}
      </p>
      {pending ? (
        <div className="mx-auto mt-9 grid max-w-2xl gap-px bg-white/10 text-left sm:grid-cols-2">
          <SummaryItem icon={MapPin} label="Restaurant" value={pending.branchName} /><SummaryItem icon={CalendarDays} label="When" value={pending.when} /><SummaryItem icon={Users} label="Party" value={pending.party} /><SummaryItem icon={Wallet} label="Status" value={paid ? "Confirmed · pre-order paid" : expired ? "Released" : success ? "Confirming payment…" : "Awaiting payment"} />
        </div>
      ) : null}
      {!success && !expired && pending ? (
        <div className="mx-auto mt-7 max-w-md">
          <Button onClick={() => onRetry(pending.id, pending.email)} disabled={paymentState === "loading"} className="h-12 w-full rounded-full bg-[#c79532] text-[#17200f] hover:bg-[#dfb85e]">{paymentState === "loading" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening secure checkout…</> : "Try payment again"}</Button>
          {paymentMessage ? <p className="mt-3 text-sm text-amber-200">{paymentMessage}</p> : null}
        </div>
      ) : null}
      <div className="mt-9 flex flex-wrap justify-center gap-3"><a href="/reservation" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold">New booking</a><Link href="/" className="rounded-full bg-[#c79532] px-6 py-3 text-sm font-semibold text-[#17200f]">Return home</Link></div>
    </ResultShell>
  );
}

function ResultShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[100svh] items-center bg-[#171c0f] px-5 py-28 text-white sm:px-8">
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-3xl border border-white/12 bg-[#222817] p-7 text-center sm:p-12">{children}</motion.section>
    </main>
  );
}
function ResultLinks() { return <div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-full bg-[#c79532] px-6 py-3 text-sm font-semibold text-[#17200f]">Return home</Link><Link href="/menu" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold">View the menu</Link></div>; }

function AvailabilityIndicator({ loading }: { loading: boolean }) {
  return (
    <AnimatePresence>
      {loading ? (
        <motion.span key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 font-normal text-black/45 dark:text-white/45">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
          Checking availability…
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

function GuestStepper({ label, value, min, onChange }: { label: string; value: string; min: number; onChange: (value: string) => void }) {
  const count = toCount(value);
  const set = (next: number) => onChange(String(Math.min(Math.max(next, min), 99)));
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="flex h-12 items-stretch border border-black/15 dark:border-white/15">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => set(count - 1)} disabled={count <= min} className="flex w-11 items-center justify-center text-black/60 transition-colors hover:bg-black/5 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/5"><Minus className="h-4 w-4" /></button>
        <input aria-label={label} inputMode="numeric" pattern="[0-9]*" value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 2))}
          onBlur={() => { if (toCount(value) < min) onChange(String(min)); }}
          onFocus={(event) => event.target.select()}
          className="w-full min-w-0 border-x border-black/10 bg-transparent text-center text-base font-semibold tabular-nums outline-none focus:bg-primary/5 dark:border-white/10" />
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => set(count + 1)} className="flex w-11 items-center justify-center text-black/60 transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function FormHeading({ eyebrow, title }: { eyebrow: string; title: string }) { return <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">{title}</h2></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function Step({ number, label, active, complete }: { number: string; label: string; active: boolean; complete: boolean }) { return <div className={cn("flex flex-1 items-center gap-3 px-5 py-4 transition-opacity duration-300 sm:px-8", active ? "bg-primary/8" : "opacity-55")}><span className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold", active || complete ? "border-primary bg-primary text-primary-foreground" : "border-black/20 dark:border-white/20")}>{complete ? <Check className="h-3.5 w-3.5" /> : number}</span><span className="text-sm font-semibold">{label}</span></div>; }
function BookingLine({ icon: Icon, text, active }: { icon: React.ElementType; text: string; active: boolean }) { return <div className={cn("flex items-center gap-3 transition-colors duration-300", active ? "text-white" : "text-white/35")}><Icon className="h-4 w-4 text-[#d8ad52]" />{text}</div>; }
function SummaryItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) { return <div className="bg-[#202617] p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#d8ad52]"><Icon className="h-4 w-4" />{label}</div><p className="mt-2 text-sm text-white/65">{value}</p></div>; }
