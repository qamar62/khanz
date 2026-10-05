"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, CheckCircle2, Clock, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reservationAPI } from "@/lib/api";
import { timeSlots } from "@/lib/data";
import { cn } from "@/lib/utils";

const branches = [
  { value: "khanz-mediterranean", name: "Khanz Mediterranean", area: "Papatoetoe", address: "135 Great South Road" },
  { value: "khanz-botany", name: "Khanz Restaurant Botany", area: "Flat Bush", address: "302 Te Irirangi Drive" },
  { value: "khanz-takeaway", name: "Khanz Takeaway", area: "Panmure", address: "10/71 Jellicoe Road" },
];

const occasions = ["Birthday", "Anniversary", "Date night", "Business dinner", "Celebration", "Other"];

const emptyForm = { branch: "", date: "", time: "", guests: "", name: "", email: "", phone: "", occasion: "", specialRequests: "" };

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const availableDates = useMemo(() => Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { value, label: date.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" }) };
  }), []);

  const update = (field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (status === "error") setStatus("idle");
  };

  const canContinue = Boolean(formData.branch && formData.date && formData.time && formData.guests);
  const canSubmit = Boolean(canContinue && formData.name && formData.email && formData.phone);
  const selectedBranch = branches.find((branch) => branch.value === formData.branch);
  const selectedDate = availableDates.find((date) => date.value === formData.date);

  const convertTo24Hour = (value: string) => {
    const [clock, modifier] = value.split(" ");
    let [hours, minutes] = clock.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = String(Number(hours) + 12);
    return `${hours.padStart(2, "0")}:${minutes}:00`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const response = await reservationAPI.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: convertTo24Hour(formData.time),
        guests: Number(formData.guests),
        occasion: formData.occasion,
        special_requests: formData.specialRequests,
        branch: formData.branch,
      });
      setStatus(response.error ? "error" : "success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main className="flex min-h-[100svh] items-center bg-[#11110e] px-5 py-28 text-white sm:px-8">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-3xl border border-white/12 bg-[#191915] p-7 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dca93f] text-[#171109]"><CheckCircle2 className="h-8 w-8" /></div>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#e7bd64]">Reservation received</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-6xl">Your table is in the works.</h1>
          <p className="mx-auto mt-5 max-w-xl text-white/60">Thanks, {formData.name}. We&apos;ve received your request and will confirm it using the contact details you provided.</p>
          <div className="mx-auto mt-9 grid max-w-2xl gap-px bg-white/10 text-left sm:grid-cols-2">
            <SummaryItem icon={MapPin} label="Restaurant" value={`${selectedBranch?.name}, ${selectedBranch?.area}`} />
            <SummaryItem icon={CalendarDays} label="When" value={`${selectedDate?.label} · ${formData.time}`} />
            <SummaryItem icon={Users} label="Party" value={`${formData.guests} ${formData.guests === "1" ? "guest" : "guests"}`} />
            <SummaryItem icon={Phone} label="Contact" value={formData.phone} />
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-[#dca93f] px-6 py-3 text-sm font-semibold text-[#171109]">Return home</Link>
            <Link href="/menu" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold">View the menu</Link>
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[#11110e] text-white">
      <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-14 lg:pb-28 lg:pt-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=88&w=2200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,6,.97)_0%,rgba(8,8,6,.88)_48%,rgba(8,8,6,.58)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11110e] via-transparent to-black/35" />

        <div className="relative mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.68fr_1fr] lg:items-start lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-36">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e7bd64]">Reservations</p>
            <h1 className="mt-5 font-serif text-[clamp(3.8rem,7vw,7rem)] font-medium leading-[0.86] tracking-[-0.05em]">A table is<br /><span className="italic text-[#e7bd64]">waiting.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">Choose your location, date and time. We&apos;ll take care of the rest.</p>

            <div className="mt-10 hidden border-t border-white/15 pt-7 lg:block">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Your booking</p>
              <div className="mt-5 space-y-4 text-sm">
                <BookingLine icon={MapPin} text={selectedBranch ? `${selectedBranch.name} · ${selectedBranch.area}` : "Choose a restaurant"} active={Boolean(selectedBranch)} />
                <BookingLine icon={CalendarDays} text={selectedDate?.label ?? "Choose a date"} active={Boolean(selectedDate)} />
                <BookingLine icon={Clock} text={formData.time || "Choose a time"} active={Boolean(formData.time)} />
                <BookingLine icon={Users} text={formData.guests ? `${formData.guests} guests` : "Choose party size"} active={Boolean(formData.guests)} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="border border-white/12 bg-[#f5f1e8] text-[#171712] shadow-[0_30px_100px_rgba(0,0,0,.25)] dark:bg-[#191915] dark:text-white">
            <div className="flex border-b border-black/10 dark:border-white/10">
              <Step number="1" label="Table details" active={step === 1} complete={step > 1} />
              <Step number="2" label="Your details" active={step === 2} complete={false} />
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-9 lg:p-10">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="table" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}>
                    <FormHeading eyebrow="Step one" title="When should we expect you?" />

                    <fieldset className="mt-8">
                      <legend className="mb-3 text-sm font-semibold">Choose a restaurant</legend>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {branches.map((branch) => (
                          <button key={branch.value} type="button" onClick={() => update("branch", branch.value)} className={cn("min-h-32 border p-4 text-left transition", formData.branch === branch.value ? "border-primary bg-primary/8 ring-1 ring-primary" : "border-black/12 hover:border-primary/50 dark:border-white/12")}>
                            <MapPin className={cn("h-5 w-5", formData.branch === branch.value ? "text-primary" : "text-black/30 dark:text-white/30")} />
                            <strong className="mt-5 block font-serif text-lg leading-tight">{branch.name}</strong>
                            <span className="mt-2 block text-xs text-black/45 dark:text-white/45">{branch.area}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                      <Field label="Date">
                        <Select value={formData.date} onValueChange={(value) => update("date", value)}>
                          <SelectTrigger className="h-12 w-full rounded-none border-black/15 bg-transparent dark:border-white/15"><SelectValue placeholder="Choose a date" /></SelectTrigger>
                          <SelectContent>{availableDates.map((date) => <SelectItem key={date.value} value={date.value}>{date.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Party size">
                        <Select value={formData.guests} onValueChange={(value) => update("guests", value)}>
                          <SelectTrigger className="h-12 w-full rounded-none border-black/15 bg-transparent dark:border-white/15"><SelectValue placeholder="Number of guests" /></SelectTrigger>
                          <SelectContent>{Array.from({ length: 12 }, (_, index) => <SelectItem key={index + 1} value={String(index + 1)}>{index + 1} {index === 0 ? "guest" : "guests"}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <fieldset className="mt-7">
                      <legend className="mb-3 text-sm font-semibold">Available times</legend>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {timeSlots.map((time) => <button key={time} type="button" onClick={() => update("time", time)} className={cn("min-h-11 border px-2 text-sm font-medium transition", formData.time === time ? "border-[#171712] bg-[#171712] text-white dark:border-primary dark:bg-primary dark:text-primary-foreground" : "border-black/12 hover:border-primary dark:border-white/12")}>{time}</button>)}
                      </div>
                    </fieldset>

                    <Button type="button" disabled={!canContinue} onClick={() => setStep(2)} className="mt-8 h-12 w-full rounded-full bg-[#171712] text-white hover:bg-primary disabled:opacity-35 dark:bg-primary dark:text-primary-foreground">Continue to your details</Button>
                  </motion.div>
                ) : (
                  <motion.div key="guest" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                    <FormHeading eyebrow="Step two" title="Who are we welcoming?" />
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <Field label="Your name"><Input name="name" required value={formData.name} onChange={(event) => update("name", event.target.value)} placeholder="Jane Smith" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field>
                      <Field label="Phone number"><Input name="phone" type="tel" required value={formData.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+64" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field>
                    </div>
                    <div className="mt-5"><Field label="Email address"><Input name="email" type="email" required value={formData.email} onChange={(event) => update("email", event.target.value)} placeholder="jane@example.com" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field></div>
                    <div className="mt-5"><Field label="Occasion (optional)"><Select value={formData.occasion} onValueChange={(value) => update("occasion", value)}><SelectTrigger className="h-12 w-full rounded-none border-black/15 bg-transparent dark:border-white/15"><SelectValue placeholder="What are we celebrating?" /></SelectTrigger><SelectContent>{occasions.map((occasion) => <SelectItem key={occasion} value={occasion.toLowerCase().replace(" ", "-")}>{occasion}</SelectItem>)}</SelectContent></Select></Field></div>
                    <div className="mt-5"><Field label="Special requests (optional)"><Textarea value={formData.specialRequests} onChange={(event) => update("specialRequests", event.target.value)} placeholder="Allergies, accessibility needs or anything else we should know…" rows={5} className="resize-none rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field></div>

                    <div className="mt-7 border border-black/10 bg-black/[.025] p-4 text-sm dark:border-white/10 dark:bg-white/[.025]">
                      <strong className="font-medium">{selectedBranch?.name}</strong>
                      <p className="mt-1 text-black/50 dark:text-white/50">{selectedDate?.label} · {formData.time} · {formData.guests} guests</p>
                    </div>
                    {status === "error" && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">We couldn&apos;t complete that request. Please try again or call the restaurant.</p>}
                    <div className="mt-7 flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 flex-1 rounded-full border-black/20 dark:border-white/20">Back</Button>
                      <Button type="submit" disabled={!canSubmit || status === "sending"} className="h-12 flex-[1.6] rounded-full bg-[#171712] text-white hover:bg-primary dark:bg-primary dark:text-primary-foreground">{status === "sending" ? "Requesting…" : "Request this table"}</Button>
                    </div>
                    <p className="mt-4 text-center text-xs text-black/40 dark:text-white/40">Your booking is confirmed once you receive our confirmation.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function FormHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">{title}</h2></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>;
}

function Step({ number, label, active, complete }: { number: string; label: string; active: boolean; complete: boolean }) {
  return <div className={cn("flex flex-1 items-center gap-3 px-5 py-4 sm:px-8", active ? "bg-primary/8" : "opacity-55")}><span className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold", active || complete ? "border-primary bg-primary text-primary-foreground" : "border-black/20 dark:border-white/20")}>{complete ? <Check className="h-3.5 w-3.5" /> : number}</span><span className="text-sm font-semibold">{label}</span></div>;
}

function BookingLine({ icon: Icon, text, active }: { icon: React.ElementType; text: string; active: boolean }) {
  return <div className={cn("flex items-center gap-3", active ? "text-white" : "text-white/35")}><Icon className="h-4 w-4 text-[#e7bd64]" />{text}</div>;
}

function SummaryItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <div className="bg-[#191915] p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#e7bd64]"><Icon className="h-4 w-4" />{label}</div><p className="mt-2 text-sm text-white/65">{value}</p></div>;
}
