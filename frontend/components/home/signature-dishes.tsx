"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/animations";
import { menuItems } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SignatureDishes() {
  const signatureDishes = menuItems
    .filter((item) => item.isChefSpecial || item.isPopular)
    .slice(0, 6);

const dishImages = [
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=85&w=1000",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=85&w=1000",
  "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=85&w=1000",
  "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=85&w=1000",
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=85&w=1000",
  "https://images.unsplash.com/photo-1574484284002-952d92456975?q=85&w=1000",
];

  return (
    <Section className="bg-[#f2eee5] text-[#171712] dark:bg-[#171713] dark:text-white">
      <Container>
        <FadeIn>
          <SectionHeader
            label="From the kitchen"
            title="The dishes people return for."
            description="Rich curries, fragrant rice and food from the fire—made for sharing, with spice adjusted to your table."
          />
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {signatureDishes.map((dish, index) => (
            <StaggerItem key={dish.id}>
              <ScaleOnHover>
                <div className="group relative overflow-hidden border border-black/10 bg-[#faf8f2] transition-colors hover:border-primary/50 dark:border-white/10 dark:bg-[#1f1f1a]">
                  {/* Image */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ 
                        backgroundImage: `url('${dishImages[index]}')`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {dish.isChefSpecial && (
                        <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                          Chef&apos;s Special
                        </span>
                      )}
                      {dish.isPopular && !dish.isChefSpecial && (
                        <span className="px-3 py-1 bg-foreground/90 text-background text-xs font-medium rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 lg:p-7">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {dish.name}
                      </h3>
                      <span className="text-primary font-semibold shrink-0">
                        ${dish.price}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                      {dish.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4">
                      {dish.spiceLevel && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Flame
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < dish.spiceLevel!
                                  ? "text-orange-500"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      )}
                      {dish.dietary && dish.dietary.length > 0 && (
                        <div className="flex gap-2">
                          {dish.dietary.slice(0, 2).map((label) => (
                            <span
                              key={label}
                              className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScaleOnHover>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.4} className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
          >
            <Link href="/menu">View the full menu</Link>
          </Button>
        </FadeIn>
      </Container>
    </Section>
  );
}
