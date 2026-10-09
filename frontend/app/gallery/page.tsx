"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "All moments" },
  { value: "food", label: "From the kitchen" },
  { value: "ambience", label: "Our spaces" },
  { value: "events", label: "Celebrations" },
];

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=88&w=1400", alt: "A richly spiced curry served at Khanz", category: "food" },
  { id: 2, src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=88&w=1400", alt: "A warm, welcoming restaurant dining room", category: "ambience" },
  { id: 3, src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=88&w=1400", alt: "An elegant wedding table prepared for guests", category: "events" },
  { id: 4, src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=88&w=1400", alt: "A colourful tandoori platter made for sharing", category: "food" },
  { id: 5, src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=88&w=1400", alt: "An intimate table set for dinner", category: "ambience" },
  { id: 6, src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=88&w=1400", alt: "Guests gathering for a catered event", category: "events" },
  { id: 7, src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=88&w=1400", alt: "Golden samosas fresh from the kitchen", category: "food" },
  { id: 8, src: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=88&w=1400", alt: "A refined private dining space", category: "ambience" },
  { id: 9, src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=88&w=1400", alt: "A joyful birthday celebration", category: "events" },
  { id: 10, src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=88&w=1400", alt: "A fragrant house curry ready to serve", category: "food" },
  { id: 11, src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=88&w=1400", alt: "The restaurant bar and dining area", category: "ambience" },
  { id: 12, src: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=88&w=1400", alt: "A shared feast at an outdoor gathering", category: "events" },
  { id: 13, src: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=88&w=1400", alt: "A table filled with dishes to share", category: "food" },
  { id: 14, src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=88&w=1400", alt: "A cosy corner of the dining room", category: "ambience" },
  { id: 15, src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=88&w=1400", alt: "A candlelit gala dinner", category: "events" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const filteredImages = activeCategory === "all" ? galleryImages : galleryImages.filter((image) => image.category === activeCategory);
  const currentIndex = selectedImage === null ? -1 : filteredImages.findIndex((image) => image.id === selectedImage);

  const navigate = (direction: number) => {
    if (currentIndex < 0) return;
    const next = (currentIndex + direction + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[next].id);
  };

  useEffect(() => {
    if (selectedImage === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
      if (event.key === "ArrowLeft") navigate(-1);
      if (event.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedImage, currentIndex]);

  return (
    <main className="bg-[#f4ecdc] text-[#242b18] dark:bg-[#171c0f] dark:text-white">
      <section className="relative min-h-[82svh] overflow-hidden bg-[#11170c] text-white">
        <div className="absolute inset-0 grid grid-cols-3">
          <div className="bg-[url('https://images.unsplash.com/photo-1601050690597-df0568f70950?q=88&w=1000')] bg-cover bg-center" />
          <div className="bg-[url('https://images.unsplash.com/photo-1552566626-52f8b828add9?q=88&w=1000')] bg-cover bg-center" />
          <div className="bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=88&w=1000')] bg-cover bg-center" />
        </div>
        <div className="absolute inset-0 bg-black/58" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />
        <div className="relative mx-auto flex min-h-[82svh] max-w-[1480px] items-end px-5 pb-16 pt-36 sm:px-8 lg:px-14 lg:pb-20">
          <div className="max-w-5xl">
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#d8ad52]">Life at Khanz</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-[clamp(4rem,10vw,9rem)] font-medium leading-[0.82] tracking-[-0.055em]">
              Flavour. People.
              <span className="block italic text-[#d8ad52]">Moments.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 max-w-2xl border-t border-white/20 pt-6 text-base leading-relaxed text-white/68 md:text-lg">A glimpse into the plates, places and celebrations that make our restaurants feel alive.</motion.p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-14">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-12 flex flex-col gap-7 border-b border-black/12 pb-7 md:flex-row md:items-end md:justify-between dark:border-white/12">
            <div><p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">The collection</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Choose your view.</h2></div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Gallery categories">
              {categories.map((category) => (
                <button key={category.value} role="tab" aria-selected={activeCategory === category.value} onClick={() => { setActiveCategory(category.value); setSelectedImage(null); }} className={cn("whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition", activeCategory === category.value ? "bg-[#242b18] text-white dark:bg-primary dark:text-primary-foreground" : "border border-black/12 text-black/55 hover:border-primary dark:border-white/12 dark:text-white/55")}>{category.label}</button>
              ))}
            </div>
          </div>

          <motion.div key={activeCategory} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[280px]">
            {filteredImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image.id)}
                className={cn(
                  "group relative overflow-hidden bg-black text-left",
                  activeCategory === "all" && (index === 0 || index === 7) && "sm:row-span-2",
                  activeCategory === "all" && (index === 3 || index === 10) && "sm:col-span-2"
                )}
                aria-label={`Open image: ${image.alt}`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-focus-visible:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-75 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-4 p-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <div><span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#d8ad52]">{categories.find((category) => category.value === image.category)?.label}</span><p className="mt-1 text-sm text-white/80">{image.alt}</p></div>
                  <Maximize2 className="h-5 w-5 shrink-0 text-white" />
                </div>
              </button>
            ))}
          </motion.div>

          <p className="mt-6 text-right text-xs uppercase tracking-[0.18em] text-black/35 dark:text-white/35">{filteredImages.length} moments</p>
        </div>
      </section>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Gallery image viewer" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#090907]/96 p-4 backdrop-blur-xl" onClick={() => setSelectedImage(null)}>
            <button onClick={() => setSelectedImage(null)} className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10" aria-label="Close gallery"><X className="h-5 w-5" /></button>
            <button onClick={(event) => { event.stopPropagation(); navigate(-1); }} className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur hover:bg-white/10 md:left-7" aria-label="Previous image"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={(event) => { event.stopPropagation(); navigate(1); }} className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur hover:bg-white/10 md:right-7" aria-label="Next image"><ChevronRight className="h-6 w-6" /></button>
            <motion.figure key={selectedImage} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="mx-auto max-w-6xl" onClick={(event) => event.stopPropagation()}>
              <img src={filteredImages.find((image) => image.id === selectedImage)?.src} alt={filteredImages.find((image) => image.id === selectedImage)?.alt} className="max-h-[78vh] w-auto max-w-full object-contain" />
              <figcaption className="mt-5 flex items-center justify-between gap-5 text-sm text-white/60"><span>{filteredImages.find((image) => image.id === selectedImage)?.alt}</span><span className="shrink-0 font-serif text-xl text-[#d8ad52]">{currentIndex + 1} / {filteredImages.length}</span></figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
