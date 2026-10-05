"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactAPI } from "@/lib/api";

const branches = [
  { name: "Khanz Fusion Buffet", area: "Papatoetoe", address: "38C East Tamaki Road, Papatoetoe, Auckland 2025", phone: "+64 9 250 1919", hours: "Daily · 11:30 AM – 9:30 PM", featured: true },
  { name: "Khanz Mediterranean", area: "Papatoetoe", address: "135 Great South Road, Papatoetoe, Auckland 2025", phone: "+64 9 250 1623", hours: "Daily · 12:00 PM – 9:00 PM" },
  { name: "Khanz Restaurant Botany", area: "Flat Bush", address: "302 Te Irirangi Drive, Flat Bush, Auckland 2013", phone: "+64 9 250 4414", hours: "Daily · 11:30 AM – 10:00 PM" },
  { name: "Khanz Takeaway", area: "Panmure", address: "10/71 Jellicoe Road, Panmure, Auckland 2025", phone: "+64 9 527 0647", hours: "Daily · 11:00 AM – 9:00 PM" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await contactAPI.create(formData);
      if (response.error) {
        setStatus("error");
        return;
      }
      setFormData({ name: "", email: "", phone: "", message: "" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (status !== "idle") setStatus("idle");
  };

  return (
    <main className="bg-[#f2eee5] text-[#171712] dark:bg-[#11110e] dark:text-white">
      <section className="relative min-h-[72svh] overflow-hidden bg-[#0b0b09] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552566626-52f8b828add9?q=88&w=2200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,5,.96)_0%,rgba(7,7,5,.7)_50%,rgba(7,7,5,.2)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />
        <div className="relative mx-auto flex min-h-[72svh] max-w-[1480px] items-end px-5 pb-16 pt-36 sm:px-8 lg:px-14 lg:pb-20">
          <div className="max-w-5xl">
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#e7bd64]">Four doors · One warm welcome</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-[clamp(4rem,10vw,8.6rem)] font-medium leading-[0.83] tracking-[-0.055em]">
              Let&apos;s talk.
              <span className="block italic text-[#e7bd64]">We&apos;re listening.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 max-w-2xl border-t border-white/20 pt-6 text-base leading-relaxed text-white/70 md:text-lg">
              Questions, celebrations, group dining or feedback—send us a note or contact the location nearest you.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-14">
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.72fr_1fr] lg:gap-20">
          <FadeIn direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Get in touch</p>
            <h2 className="mt-4 font-serif text-4xl leading-[0.98] tracking-[-0.035em] md:text-6xl">A real person will get back to you.</h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-black/55 dark:text-white/55">For same-day reservations or changes to a booking, calling your chosen restaurant is the fastest option.</p>

            <div className="mt-10 border-t border-black/15 dark:border-white/15">
              <a href="tel:+6492501623" className="group flex items-center gap-4 border-b border-black/15 py-5 dark:border-white/15">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10"><Phone className="h-5 w-5 text-primary" /></span>
                <span><small className="block text-xs uppercase tracking-[0.16em] text-black/40 dark:text-white/40">Call us</small><strong className="mt-1 block font-medium group-hover:text-primary">+64 9 250 1623</strong></span>
              </a>
              <a href="mailto:info@khanz.co.nz" className="group flex items-center gap-4 border-b border-black/15 py-5 dark:border-white/15">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10"><Mail className="h-5 w-5 text-primary" /></span>
                <span><small className="block text-xs uppercase tracking-[0.16em] text-black/40 dark:text-white/40">Email</small><strong className="mt-1 block font-medium group-hover:text-primary">info@khanz.co.nz</strong></span>
              </a>
              <a href="https://wa.me/6492501623" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 border-b border-black/15 py-5 dark:border-white/15">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10"><MessageCircle className="h-5 w-5 text-primary" /></span>
                <span><small className="block text-xs uppercase tracking-[0.16em] text-black/40 dark:text-white/40">WhatsApp</small><strong className="mt-1 block font-medium group-hover:text-primary">Message Khanz</strong></span>
              </a>
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div className="border border-black/12 bg-[#faf8f2] p-6 shadow-[0_24px_80px_rgba(25,18,8,.08)] sm:p-9 dark:border-white/12 dark:bg-[#1b1b17]">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Send a message</p><h3 className="mt-2 font-serif text-3xl">How can we help?</h3></div>
                <Send className="h-7 w-7 text-primary/45" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" id="name"><Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Jane Smith" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field>
                  <Field label="Email address" id="email"><Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="jane@example.com" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field>
                </div>
                <Field label="Phone number (optional)" id="phone"><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+64" className="h-12 rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field>
                <Field label="Your message" id="message"><Textarea id="message" name="message" required value={formData.message} onChange={handleChange} placeholder="Tell us what you have in mind…" rows={6} className="resize-none rounded-none border-black/15 bg-transparent dark:border-white/15" /></Field>
                {status === "success" && <p role="status" className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Thanks—your message is on its way.</p>}
                {status === "error" && <p role="alert" className="text-sm text-red-700 dark:text-red-400">We couldn&apos;t send that message. Please call us or try again.</p>}
                <Button type="submit" disabled={status === "sending"} className="h-12 w-full rounded-full bg-[#171712] text-white hover:bg-primary dark:bg-primary dark:text-primary-foreground">
                  {status === "sending" ? "Sending…" : "Send message"}
                </Button>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-[#171713] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-14">
        <div className="mx-auto max-w-[1480px]">
          <FadeIn className="mb-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e7bd64]">Find your table</p>
            <h2 className="mt-4 font-serif text-4xl leading-none md:text-6xl">Khanz around Auckland.</h2>
          </FadeIn>
          <StaggerContainer className="grid gap-px bg-white/10 md:grid-cols-2">
            {branches.map((branch) => (
              <StaggerItem key={branch.name}>
                <article className="group h-full bg-[#171713] p-7 transition hover:bg-[#1d1d18] sm:p-9">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7bd64]">{branch.area}</p><h3 className="mt-2 font-serif text-3xl">{branch.name}</h3></div>
                    {branch.featured && <span className="rounded-full border border-[#e7bd64]/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-[#e7bd64]">Flagship</span>}
                  </div>
                  <div className="mt-8 space-y-3 text-sm text-white/55">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-white"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e7bd64]" />{branch.address}</a>
                    <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-white"><Phone className="h-4 w-4 text-[#e7bd64]" />{branch.phone}</a>
                    <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-[#e7bd64]" />{branch.hours}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </main>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>{children}</div>;
}
