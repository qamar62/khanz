"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations";

const stats = [
  { value: "7+", label: "Years of Excellence" },
  { value: "50k+", label: "Happy Guests" },
  { value: "200+", label: "Events Catered" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute inset-0 bg-noise pointer-events-none" />
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-1/4 -left-20 w-[32rem] h-[32rem] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-32 pb-24">
        <div className="max-w-4xl">
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-4 mb-8">
              <span className="h-px w-12 bg-primary" />
              <span className="text-primary text-xs md:text-sm font-medium tracking-[0.35em] uppercase">
                Premium Asian &amp; Mediterranean Cuisine
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-8 leading-[1.05] text-balance">
              Where Every Dish
              <span className="block text-gradient">Tells a Story</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Khanz Group of Restaurants — authentic flavours reimagined with
              contemporary elegance, served with warmth across Auckland.
            </p>
          </FadeIn>

          <FadeIn delay={0.55}>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Link href="/reservation">
                  Reserve Your Table
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base border-foreground/25 bg-background/40 backdrop-blur-sm hover:bg-foreground/10 hover:border-primary/50 transition-all duration-300"
              >
                <Link href="/menu">Explore Menu</Link>
              </Button>
            </div>
          </FadeIn>

          {/* Social proof strip */}
          <FadeIn delay={0.7}>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm px-4 py-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Rated by <span className="text-foreground font-medium">1,800+</span> guests on Google
              </span>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.85}>
            <div className="mt-14 pt-10 border-t border-border/40 flex flex-wrap gap-x-12 gap-y-8 max-w-lg">
              {stats.map((stat) => (
                <div key={stat.label} className="relative">
                  <div className="font-serif text-3xl md:text-4xl font-bold text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-xs md:text-sm mt-1 tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border border-foreground/25 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
