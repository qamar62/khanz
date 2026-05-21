"use client";

import Link from "next/link";
import { ArrowRight, Users, Building2, Heart, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/animations";

const cateringServices = [
  {
    icon: Heart,
    title: "Wedding Catering",
    description:
      "Make your special day unforgettable with our exquisite wedding catering services, tailored to your unique vision.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800",
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description:
      "Impress clients and colleagues with sophisticated corporate catering that elevates any business occasion.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800",
  },
  {
    icon: PartyPopper,
    title: "Private Parties",
    description:
      "From intimate gatherings to grand celebrations, we bring the restaurant experience to your venue.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800",
  },
];

export function CateringSection() {
  return (
    <Section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <FadeIn>
              <span className="inline-block text-primary text-sm font-medium tracking-[0.2em] uppercase mb-4">
                Catering Services
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
                Elevate Your Events with Exceptional Cuisine
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                From intimate gatherings to grand celebrations, our catering
                team brings the same dedication to excellence that defines our
                restaurant experience directly to your event.
              </p>
            </FadeIn>

            <StaggerContainer className="space-y-4 mb-8">
              {cateringServices.map((service, index) => (
                <StaggerItem key={service.title}>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.5}>
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
              >
                <Link href="/catering">
                  Explore Catering
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </FadeIn>
          </div>

          {/* Image Grid */}
          <FadeIn direction="right" className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${cateringServices[0].image}')` }}
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${cateringServices[2].image}')` }}
                  />
                </div>
              </div>
              <div className="pt-8 space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${cateringServices[1].image}')` }}
                  />
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="font-serif text-3xl font-bold text-gradient mb-2">
                    200+
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Successful events catered with perfection
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
