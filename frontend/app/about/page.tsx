"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Flame, Heart, Leaf, MapPin, Users } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

const values = [
  { icon: Flame, title: "Cook with intent", copy: "We build flavour patiently—with heat, spice, balance and respect for every ingredient." },
  { icon: Heart, title: "Welcome generously", copy: "Hospitality is more than service. It is noticing the details and making every table feel cared for." },
  { icon: Leaf, title: "Keep it fresh", copy: "Fresh produce and thoughtful preparation bring brightness and honesty to every plate." },
  { icon: Users, title: "Make room for everyone", copy: "Khanz is for weeknight dinners, big family tables, celebrations and everything between." },
];

const locations = [
  { place: "Papatoetoe", name: "Khanz Mediterranean", detail: "The original table" },
  { place: "Flat Bush", name: "Khanz Botany", detail: "The neighbourhood gathering place" },
  { place: "Panmure", name: "Khanz Takeaway", detail: "The flavours you love, to go" },
];

export default function AboutPage() {
  return (
    <main className="bg-[#f4ecdc] text-[#242b18] dark:bg-[#171c0f] dark:text-white">
      <section className="relative min-h-[88svh] overflow-hidden bg-[#11170c] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=88&w=2200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,5,.94)_0%,rgba(7,7,5,.62)_50%,rgba(7,7,5,.2)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
        <div className="relative mx-auto flex min-h-[88svh] max-w-[1480px] items-end px-5 pb-16 pt-36 sm:px-8 lg:px-14 lg:pb-20">
          <div className="max-w-5xl">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#d8ad52]">Our story · Auckland since 2018</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-[clamp(3.8rem,9.5vw,8.5rem)] font-medium leading-[0.84] tracking-[-0.055em]">
              Food is how we
              <span className="block italic text-[#d8ad52]">bring people closer.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 max-w-2xl border-t border-white/20 pt-6 text-base leading-relaxed text-white/70 md:text-lg">
              Khanz grew from one Auckland dining room and a simple belief: familiar flavours, made with care, can turn an ordinary meal into a memory.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-14">
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <FadeIn direction="left" className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?q=88&w=1200')] bg-cover bg-center" />
            </div>
            <div className="absolute -bottom-6 right-0 bg-[#c79532] px-6 py-5 text-[#17200f] sm:right-8">
              <span className="block font-serif text-4xl">2018</span>
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Where it began</span>
            </div>
          </FadeIn>

          <FadeIn className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">The Khanz way</p>
            <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.035em] md:text-6xl">Tradition in our hands. Auckland in our heart.</h2>
            <div className="mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-black/58 dark:text-white/58 md:text-lg">
              <p>Our food draws from the generous tables of the Mediterranean and the layered spice traditions of Asia. We are not interested in choosing between heritage and evolution—we believe the most exciting cooking honours both.</p>
              <p>That means slow-cooked sauces, food from the flame, fragrant rice and dishes designed to travel across the table. It also means listening to the city around us, sourcing thoughtfully and making space for the way Auckland eats today.</p>
              <p>Across every Khanz location, the promise stays the same: full flavour, genuine warmth and a table worth returning to.</p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/menu" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#242b18] px-6 text-sm font-semibold text-white hover:bg-primary dark:bg-primary dark:text-primary-foreground">Explore the menu</Link>
              <Link href="/reservation" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/20 px-6 text-sm font-semibold hover:border-primary dark:border-white/20"><CalendarDays className="h-4 w-4" /> Reserve a table</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-[#202617] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-14">
        <div className="mx-auto max-w-[1480px]">
          <FadeIn>
            <div className="mb-14 grid gap-6 border-b border-white/15 pb-10 md:grid-cols-2 md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8ad52]">What guides us</p>
                <h2 className="mt-4 font-serif text-4xl leading-none md:text-6xl">Simple values.<br /><span className="italic text-[#d8ad52]">Felt in every detail.</span></h2>
              </div>
              <p className="max-w-lg text-base leading-relaxed text-white/55 md:justify-self-end">From the kitchen pass to the last plate cleared, these are the principles behind the experience.</p>
            </div>
          </FadeIn>
          <StaggerContainer className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <StaggerItem key={value.title}>
                <article className="h-full bg-[#202617] p-7 lg:p-8">
                  <div className="flex items-center justify-between">
                    <value.icon className="h-6 w-6 text-[#d8ad52]" />
                    <span className="font-serif text-2xl italic text-white/20">0{index + 1}</span>
                  </div>
                  <h3 className="mt-12 font-serif text-2xl">{value.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/52">{value.copy}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-14">
        <div className="mx-auto max-w-[1480px]">
          <FadeIn className="mb-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Our Auckland story</p>
            <h2 className="mt-4 font-serif text-4xl leading-none md:text-6xl">One family of restaurants.<br />Three local neighbourhoods.</h2>
          </FadeIn>
          <div className="grid border-t border-black/15 dark:border-white/15 md:grid-cols-3">
            {locations.map((location, index) => (
              <FadeIn key={location.place} delay={index * 0.1}>
                <article className="border-b border-black/15 py-8 md:min-h-64 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 dark:border-white/15">
                  <span className="font-serif text-5xl italic text-primary/35">0{index + 1}</span>
                  <div className="mt-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><MapPin className="h-4 w-4" />{location.place}</div>
                  <h3 className="mt-3 font-serif text-2xl">{location.name}</h3>
                  <p className="mt-2 text-sm text-black/50 dark:text-white/50">{location.detail}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
