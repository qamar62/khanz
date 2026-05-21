"use client";

import Link from "next/link";
import { Instagram, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { contactInfo } from "@/lib/data";

const instagramPosts = [
  {
    src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400",
    likes: "1.2k",
  },
  {
    src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=400",
    likes: "987",
  },
  {
    src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400",
    likes: "2.1k",
  },
  {
    src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400",
    likes: "1.5k",
  },
  {
    src: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=400",
    likes: "856",
  },
  {
    src: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=400",
    likes: "1.8k",
  },
];

export function InstagramSection() {
  return (
    <Section className="bg-secondary/30">
      <Container>
        <FadeIn>
          <div className="text-center mb-12">
            <a
              href={contactInfo.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm font-medium tracking-wide">@khanzrestaurant</span>
            </a>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Follow Our Journey
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join us on Instagram for behind-the-scenes moments, new dishes,
              and culinary inspiration.
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <StaggerItem key={index}>
              <a
                href={contactInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative aspect-square rounded-xl overflow-hidden"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${post.src}')` }}
                  />
                </motion.div>
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <ArrowUpRight className="h-8 w-8 text-foreground mx-auto mb-1" />
                    <span className="text-sm text-foreground font-medium">
                      {post.likes} likes
                    </span>
                  </div>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
