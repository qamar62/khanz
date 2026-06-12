"use client";

import Link from "next/link";
import { ArrowRight, UtensilsCrossed, Leaf, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/ui/section";
import { FadeIn } from "@/components/animations";

const highlights = [
  { icon: UtensilsCrossed, text: "Authentic Mediterranean & fusion cuisine" },
  { icon: Leaf, text: "Fresh, wholesome ingredients in every dish" },
  { icon: MapPin, text: "Three welcoming locations across Auckland" },
];

export function AboutPreview() {
  return (
    <Section className="relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute -top-32 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <FadeIn direction="left" className="relative">
            {/* Offset gold frame */}
            <div className="absolute -bottom-4 -left-4 right-12 top-12 rounded-2xl border border-primary/30 pointer-events-none hidden sm:block" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <div
                className="aspect-[4/3] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/homepage-img.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/40 via-transparent to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 right-4 sm:right-8 glass rounded-2xl px-6 py-4 shadow-xl">
              <div className="font-serif text-2xl font-bold text-gradient">Est. 2018</div>
              <p className="text-xs text-white/70 tracking-wide">A Family Tradition</p>
            </div>
          </FadeIn>

          {/* Content Side */}
          <div className="lg:pl-4">
            <FadeIn>
              <div className="flex items-center gap-4 mb-4">
                <span className="h-px w-10 bg-primary" />
                <span className="text-primary text-sm font-medium tracking-[0.25em] uppercase">
                  Our Story
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
                Nourishing Body &amp; Soul,{" "}
                <span className="text-gradient">One Plate at a Time</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                We proudly bring you the authentic taste and health benefits of
                Mediterranean and various other cuisines. With branches in
                Papatoetoe, Jellicoe Road, and our newest addition, Khanz
                Fusion, we are committed to serving delicious food that
                nourishes the body and soul.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <ul className="space-y-3 mb-9">
                {highlights.map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-sm md:text-base text-foreground/90">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Button
                asChild
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Link href="/menu">
                  Discover More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </div>
      </Container>
    </Section>
  );
}
