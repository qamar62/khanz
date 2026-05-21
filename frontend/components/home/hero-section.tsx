"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image Placeholder */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[96px]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-32">
        <div className="max-w-4xl">
          <FadeIn delay={0.2}>
            <span className="inline-block text-primary text-sm font-medium tracking-[0.3em] uppercase mb-6">
              Premium Asian Cuisine
            </span>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-6 leading-[1.1]">
              A Culinary
              <br />
              <span className="text-gradient">Journey</span> Awaits
            </h1>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Experience the artistry of authentic Asian flavors, reimagined
              with contemporary elegance. Every dish tells a story of tradition,
              passion, and culinary excellence.
            </p>
          </FadeIn>

          <FadeIn delay={0.8}>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base"
              >
                <Link href="/reservation">
                  Reserve Your Table
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base border-foreground/20 hover:bg-foreground/5"
              >
                <Link href="/menu">Explore Menu</Link>
              </Button>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={1}>
            <div className="mt-16 pt-16 border-t border-border/50 grid grid-cols-3 gap-8 max-w-lg">
              <div>
                <div className="font-serif text-3xl md:text-4xl font-bold text-gradient">
                  7+
                </div>
                <div className="text-muted-foreground text-sm mt-1">
                  Years of Excellence
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl md:text-4xl font-bold text-gradient">
                  50k+
                </div>
                <div className="text-muted-foreground text-sm mt-1">
                  Happy Guests
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl md:text-4xl font-bold text-gradient">
                  200+
                </div>
                <div className="text-muted-foreground text-sm mt-1">
                  Events Catered
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
