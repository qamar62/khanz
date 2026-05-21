"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    alt: "Signature curry dish",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=800",
    alt: "Restaurant ambience",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
    alt: "Tandoori platter",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800",
    alt: "Biryani presentation",
    span: "col-span-1 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=800",
    alt: "Private dining setup",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=800",
    alt: "Dessert selection",
    span: "col-span-1 row-span-1",
  },
];

export function GalleryPreview() {
  return (
    <Section>
      <Container>
        <FadeIn>
          <SectionHeader
            label="Gallery"
            title="A Visual Journey"
            description="Explore the artistry and ambiance that make every visit to Khanz a memorable experience."
          />
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image, index) => (
            <StaggerItem
              key={index}
              className={`${image.span} relative group overflow-hidden rounded-2xl`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${image.src}')` }}
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300" />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.4} className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-foreground/20 hover:bg-foreground/5"
          >
            <Link href="/gallery">
              View Full Gallery
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </FadeIn>
      </Container>
    </Section>
  );
}
