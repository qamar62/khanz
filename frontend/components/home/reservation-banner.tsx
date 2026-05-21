"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/components/ui/section";
import { FadeIn } from "@/components/animations";
import { contactInfo } from "@/lib/data";

export function ReservationBanner() {
  return (
    <Section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070')",
          }}
        />
        <div className="absolute inset-0 bg-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <span className="inline-block text-primary text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Reserve Your Experience
            </span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Book Your Table Today
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
              Secure your spot for an unforgettable dining experience. Whether
              it&apos;s a romantic dinner, family celebration, or business meeting,
              we&apos;re ready to welcome you.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-8 mb-10 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span>Open Daily</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Auckland CBD</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base"
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
                className="rounded-full px-8 h-14 text-base border-foreground/20 hover:bg-foreground/5"
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
