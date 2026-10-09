"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

const ease = [0.22, 1, 0.36, 1] as const;

/** Our story in three chapters. Scrolls normally; each chapter fades in as it enters the viewport. */
export function ScrollStory() {
  return (
    <section className="bg-[#171c0f] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-14">
      <div className="mx-auto max-w-[1480px] space-y-20 md:space-y-28">
        {chapters.map((chapter, index) => {
          const flipped = index % 2 === 1;
          return (
            <article key={chapter.number} className="grid items-center gap-8 md:grid-cols-2 md:gap-14 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease }}
                className={cn("relative aspect-[4/3] overflow-hidden", flipped && "md:order-2")}
              >
                <motion.div
                  initial={{ scale: 1.08 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.2, ease }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${chapter.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.24em] text-white/80">{chapter.note}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: 0.12, ease }}
                className={cn("max-w-xl", flipped && "md:order-1 md:justify-self-end")}
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-lg italic text-[#d8ad52]">{chapter.number}</span>
                  <span className="h-px w-10 bg-white/25" />
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">{chapter.eyebrow}</span>
                </div>
                <h2 className="whitespace-pre-line font-serif text-[clamp(2.6rem,5vw,5rem)] font-medium leading-[0.92] tracking-[-0.04em]">
                  {chapter.title}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-white/68 md:text-lg">{chapter.copy}</p>
              </motion.div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
