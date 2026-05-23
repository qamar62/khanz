"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { PageHero, Section, Container } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "All" },
  { value: "food", label: "Cuisine" },
  { value: "ambience", label: "Ambience" },
  { value: "events", label: "Events" },
];

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1200",
    alt: "Signature curry dish beautifully plated",
    category: "food",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
    alt: "Elegant restaurant interior",
    category: "ambience",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200",
    alt: "Wedding catering setup",
    category: "events",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1200",
    alt: "Tandoori platter presentation",
    category: "food",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
    alt: "Fine dining ambience",
    category: "ambience",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200",
    alt: "Corporate event catering",
    category: "events",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200",
    alt: "Butter chicken close-up",
    category: "food",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1200",
    alt: "Private dining room",
    category: "ambience",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200",
    alt: "Birthday celebration setup",
    category: "events",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1200",
    alt: "Biryani presentation",
    category: "food",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200",
    alt: "Restaurant bar area",
    category: "ambience",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=1200",
    alt: "Outdoor event setup",
    category: "events",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=1200",
    alt: "Dessert platter",
    category: "food",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200",
    alt: "Cozy dining corner",
    category: "ambience",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200",
    alt: "Gala dinner event",
    category: "events",
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages =
    activeCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const currentIndex = selectedImage !== null
    ? filteredImages.findIndex((img) => img.id === selectedImage)
    : -1;

  const navigateImage = (direction: "prev" | "next") => {
    if (currentIndex === -1) return;
    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + filteredImages.length) % filteredImages.length
        : (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[newIndex].id);
  };

  return (
    <main>
        <PageHero
          title="Gallery"
          subtitle="A visual journey through our culinary artistry and memorable moments"
        />

        <Section className="pt-0 -mt-8">
          <Container>
            {/* Filter Tabs */}
            <FadeIn>
              <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto py-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={cn(
                      "px-6 py-3 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                      activeCategory === category.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </FadeIn>

            {/* Masonry Grid */}
            <StaggerContainer className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {filteredImages.map((image, index) => (
                <StaggerItem key={image.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="break-inside-avoid"
                  >
                    <button
                      onClick={() => setSelectedImage(image.id)}
                      className="group relative w-full overflow-hidden rounded-2xl"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-foreground font-medium">
                            View
                          </span>
                        </div>
                      </motion.div>
                    </button>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Results Count */}
            <FadeIn className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Showing {filteredImages.length} images
              </p>
            </FadeIn>
          </Container>
        </Section>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors z-10"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("prev");
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("next");
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Image */}
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl max-h-[80vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={
                    filteredImages.find((img) => img.id === selectedImage)?.src || ""
                  }
                  alt={
                    filteredImages.find((img) => img.id === selectedImage)?.alt || ""
                  }
                  className="w-full h-full object-contain rounded-lg"
                />
                <p className="text-center text-muted-foreground mt-4">
                  {filteredImages.find((img) => img.id === selectedImage)?.alt}
                </p>
              </motion.div>

              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground text-sm">
                {currentIndex + 1} / {filteredImages.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
  );
}
