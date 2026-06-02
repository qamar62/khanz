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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side - Restaurant Interior */}
          <FadeIn direction="left" className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Placeholder for restaurant interior image */}
              <div 
                className="aspect-[4/3] bg-cover bg-center"
                style={{ 
                  backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070')" 
                }}
              />
            </div>
          </FadeIn>

          {/* Content Side */}
          <div className="lg:pl-8">
            <FadeIn delay={0.2}>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We proudly bring you the authentic taste and health benefits of Mediterranean and various other cuisines. With branches in Papatoetoe, Jellicoe Road, and our newest addition, Khanz Fusion, we are committed to serving up delicious food that nourishes the body and soul.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Button
                asChild
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6"
              >
                <Link href="/menu">
                  Discover More
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
