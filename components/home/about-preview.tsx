"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Container, SectionHeader, Divider } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

export function AboutPreview() {
  return (
    <Section className="relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <FadeIn direction="left" className="relative">
            <div className="relative">
              {/* Main Image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=2070')" 
                  }}
                />
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 lg:-right-12 glass rounded-2xl p-6 max-w-[240px]">
                <div className="font-serif text-4xl font-bold text-gradient mb-2">7+</div>
                <p className="text-sm text-muted-foreground">Years crafting exceptional culinary experiences</p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-primary/20 rounded-2xl -z-10" />
            </div>
          </FadeIn>

          {/* Content Side */}
          <div className="lg:pl-8">
            <FadeIn>
              <span className="inline-block text-primary text-sm font-medium tracking-[0.2em] uppercase mb-4">
                Our Story
              </span>
            </FadeIn>
            
            <FadeIn delay={0.1}>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
                Where Tradition Meets Contemporary Elegance
              </h2>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Founded with a vision to bring the authentic flavors of Asia to 
                New Zealand, Khanz has become a destination for those who 
                appreciate the finer aspects of Asian cuisine.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Our master chefs, trained in prestigious kitchens across Asia, 
                blend time-honored recipes with innovative techniques to create 
                dishes that honor tradition while embracing modern sensibilities.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Divider ornament className="mb-8" />
            </FadeIn>

            <StaggerContainer className="grid grid-cols-2 gap-6 mb-8">
              <StaggerItem>
                <div className="text-center">
                  <div className="font-serif text-2xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Fresh Ingredients</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="font-serif text-2xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">Signature Dishes</div>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <FadeIn delay={0.5}>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-6 border-foreground/20 hover:bg-foreground/5"
              >
                <Link href="/about">
                  Discover Our Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </div>
      </Container>
    </Section>
  );
}
