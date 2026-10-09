"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import { useRef } from "react";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-[#11170c] text-white"
    >
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=88&w=2200')] bg-cover bg-[58%_center] md:bg-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,6,4,.96)_0%,rgba(6,6,4,.76)_44%,rgba(6,6,4,.16)_78%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.35)_0%,transparent_25%,rgba(0,0,0,.45)_100%)]" />
      <div className="absolute inset-0 bg-noise opacity-40" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-end px-5 pb-12 pt-32 sm:px-8 md:justify-center md:pb-16 lg:px-14"
      >
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-7 flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d8ad52]"
          >
            <span className="h-px w-10 bg-[#d8ad52]" />
            Auckland · Since 2018
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl font-serif text-[clamp(3.5rem,9vw,8.8rem)] font-medium leading-[0.82] tracking-[-0.055em]"
          >
            Auckland,
            <span className="block italic text-[#d8ad52]">served with soul.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.42 }}
            className="mt-8 flex max-w-3xl flex-col gap-7 border-t border-white/20 pt-6 md:flex-row md:items-end md:justify-between"
          >
            <p className="max-w-xl text-base leading-relaxed text-white/72 md:text-lg">
              Mediterranean generosity meets the warmth and spice of Asia—
              cooked over flame, shared around the table, and made for our city.
            </p>
            <div className="flex flex-wrap gap-3 md:shrink-0">
              <Link
                href="/reservation"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c79532] px-6 text-sm font-semibold text-[#17200f] transition hover:bg-[#dfb85e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dfb85e]"
              >
                <CalendarDays className="h-4 w-4" />
                Reserve a table
              </Link>
              <Link
                href="#locations"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-black/15 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/70 hover:bg-white/10"
              >
                <MapPin className="h-4 w-4" />
                Find your Khanz
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.25em] text-white/50 md:absolute md:bottom-10 md:right-14 md:mt-0 md:[writing-mode:vertical-rl]"
        >
          <span>Scroll to discover</span>
          <span className="h-12 w-px bg-gradient-to-b from-[#d8ad52] to-transparent md:h-16" />
        </motion.div>
      </motion.div>
    </section>
  );
}
