"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Container, Divider } from "@/components/ui/section";
import { FadeIn } from "@/components/animations";
import { contactInfo } from "@/lib/data";

const infoChips = [
  { icon: Clock, text: "Open Daily" },
  { icon: Phone, text: contactInfo.phone },
  { icon: MapPin, text: "Auckland" },
];

export function ReservationBanner() {
  return (
    <Section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070')",
          }}
        />
        <div className="absolute inset-0 bg-background/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-noise pointer-events-none" />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <Divider ornament className="mb-8" />
          </FadeIn>

          <FadeIn delay={0.1}>
            <span className="inline-block text-primary text-sm font-medium tracking-[0.25em] uppercase mb-4">
              Reserve Your Experience
            </span>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Book Your Table <span className="text-gradient">Today</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Whether it&apos;s a romantic dinner, family celebration, or
              business meeting — we&apos;re ready to welcome you.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {infoChips.map((chip) => (
                <div
                  key={chip.text}
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground"
                >
                  <chip.icon className="h-4 w-4 text-primary" />
                  <span>{chip.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Link href="/reservation">
                  <Calendar className="mr-2 h-5 w-5" />
                  Make a Reservation
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base border-foreground/25 bg-background/40 backdrop-blur-sm hover:bg-foreground/10 hover:border-primary/50 transition-all duration-300"
              >
                <Link href={`tel:${contactInfo.phone}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
