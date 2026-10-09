"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

const chapters = [
  {
    number: "01",
    eyebrow: "The fire",
    title: "Char, smoke,\nand patience.",
    copy: "Our grills and tandoor build flavour slowly—layer by layer, until spice, smoke and texture arrive together.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=88&w=1800",
    note: "Cooked to order",
  },
  {
    number: "02",
    eyebrow: "The craft",
    title: "Old recipes.\nAuckland rhythm.",
    copy: "We respect the dishes that raised us, then let New Zealand produce and a contemporary point of view move them forward.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=88&w=1800",
    note: "Fresh local produce",
  },
  {
    number: "03",
    eyebrow: "The table",
    title: "Made to be\nshared.",
    copy: "Family dinners, first dates, quick lunches and full-room celebrations—Khanz is at its best when the table is alive.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=88&w=1800",
    note: "Three Auckland locations",
  },
];

export function ScrollStory() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActive(Math.min(chapters.length - 1, Math.floor(value * chapters.length)));
  });

  return (
    <section ref={ref} className="relative h-[300vh] bg-[#171c0f] text-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        {chapters.map((chapter, index) => (
          <motion.div
            key={chapter.number}
            animate={{ opacity: active === index ? 1 : 0, scale: active === index ? 1 : 1.045 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${chapter.image}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,8,.96)_0%,rgba(11,11,8,.76)_43%,rgba(11,11,8,.2)_80%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

        <div className="relative z-10 mx-auto grid h-full max-w-[1480px] grid-cols-1 content-end px-5 pb-14 pt-28 sm:px-8 md:content-center lg:grid-cols-[1fr_0.72fr] lg:px-14">
          <div className="max-w-2xl">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-serif text-lg italic text-[#d8ad52]">{chapters[active].number}</span>
              <span className="h-px w-10 bg-white/25" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">{chapters[active].eyebrow}</span>
            </div>
            <motion.h2
              key={`title-${active}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="whitespace-pre-line font-serif text-[clamp(3.1rem,7vw,7rem)] font-medium leading-[0.9] tracking-[-0.045em]"
            >
              {chapters[active].title}
            </motion.h2>
            <motion.p
              key={`copy-${active}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-7 max-w-xl text-base leading-relaxed text-white/68 md:text-lg"
            >
              {chapters[active].copy}
            </motion.p>
          </div>

          <div className="mt-9 flex items-end justify-between border-t border-white/20 pt-5 lg:mt-0 lg:self-end">
            <span className="text-xs uppercase tracking-[0.24em] text-white/55">{chapters[active].note}</span>
            <span className="font-serif text-4xl italic text-white/20">{active + 1}/3</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/10">
          <motion.div style={{ width: progress }} className="h-full bg-[#c79532]" />
        </div>
      </div>
    </section>
  );
}
