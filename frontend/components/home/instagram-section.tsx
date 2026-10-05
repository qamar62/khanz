"use client";

import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { contactInfo } from "@/lib/data";

const fallbackPosts = [
  {
    id: "1",
    permalink: "https://www.instagram.com/khanzrestaurant",
    media_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400",
    media_type: "IMAGE",
  },
  {
    id: "2",
    permalink: "https://www.instagram.com/khanzrestaurant",
    media_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=400",
    media_type: "IMAGE",
  },
  {
    id: "3",
    permalink: "https://www.instagram.com/khanzrestaurant",
    media_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400",
    media_type: "IMAGE",
  },
  {
    id: "4",
    permalink: "https://www.instagram.com/khanzrestaurant",
    media_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400",
    media_type: "IMAGE",
  },
  {
    id: "5",
    permalink: "https://www.instagram.com/khanzrestaurant",
    media_url: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=400",
    media_type: "IMAGE",
  },
  {
    id: "6",
    permalink: "https://www.instagram.com/khanzrestaurant",
    media_url: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=400",
    media_type: "IMAGE",
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
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors mb-5"
            >
              <Instagram className="h-4 w-4" />
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
            {fallbackPosts.map((post) => (
              <StaggerItem key={post.id}>
                <a
                  href={post.permalink}
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
                      style={{ backgroundImage: `url('${post.media_url}')` }}
                    />
                    {post.media_type === "VIDEO" && (
                      <div className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/85 via-charcoal-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300 text-center">
                      <Instagram className="h-6 w-6 text-white mx-auto mb-1" />
                      <span className="text-xs text-white/90 font-medium tracking-wide">
                        View Post
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
