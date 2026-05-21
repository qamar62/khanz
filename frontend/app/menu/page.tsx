"use client";

import { useState, useMemo } from "react";
import { Search, Flame, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar, Footer, FloatingCTA } from "@/components/layout";
import { PageHero, Section, Container } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/animations";
import { menuItems, categoryLabels } from "@/lib/data";
import { MenuCategory, DietaryLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories: MenuCategory[] = [
  "starters",
  "mains",
  "tandoori",
  "biryani",
  "desserts",
  "drinks",
];

const dietaryFilters: { value: DietaryLabel; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten Free" },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<DietaryLabel[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.name.toLowerCase().includes(query) &&
          !item.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Dietary filter
      if (activeDietaryFilters.length > 0) {
        if (!item.dietary || !activeDietaryFilters.some((f) => item.dietary?.includes(f))) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, searchQuery, activeDietaryFilters]);

  const toggleDietaryFilter = (filter: DietaryLabel) => {
    setActiveDietaryFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveDietaryFilters([]);
    setActiveCategory("all");
  };

  const hasActiveFilters =
    searchQuery || activeDietaryFilters.length > 0 || activeCategory !== "all";

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          title="Our Menu"
          subtitle="Discover a symphony of flavors crafted with passion and the finest ingredients"
        />

        <Section className="pt-0 -mt-8">
          <Container>
            {/* Search and Filter Bar */}
            <FadeIn>
              <div className="glass rounded-2xl p-4 lg:p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-secondary border-border rounded-xl"
                    />
                  </div>

                  {/* Filter Toggle (Mobile) */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden h-12 rounded-xl border-border"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {(activeCategory !== "all" ? 1 : 0) + activeDietaryFilters.length}
                      </span>
                    )}
                  </Button>

                  {/* Dietary Filters (Desktop) */}
                  <div className="hidden lg:flex items-center gap-2">
                    {dietaryFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => toggleDietaryFilter(filter.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                          activeDietaryFilters.includes(filter.value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        )}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="h-12 rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Mobile Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="lg:hidden overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-3">
                          Dietary Preferences
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dietaryFilters.map((filter) => (
                            <button
                              key={filter.value}
                              onClick={() => toggleDietaryFilter(filter.value)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                activeDietaryFilters.includes(filter.value)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-foreground"
                              )}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>

            {/* Category Navigation */}
            <FadeIn delay={0.1}>
              <div className="sticky top-20 z-30 -mx-4 px-4 py-4 glass mb-8 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                      activeCategory === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    )}
                  >
                    All Dishes
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                        activeCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      )}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Menu Items */}
            {filteredItems.length > 0 ? (
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <StaggerItem key={item.id}>
                    <ScaleOnHover>
                      <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300">
                        {/* Image */}
                        <div className="aspect-[16/10] relative overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{
                              backgroundImage:
                                "url('https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800')",
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                          {/* Badges */}
                          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {item.isChefSpecial && (
                              <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                Chef&apos;s Special
                              </span>
                            )}
                            {item.isPopular && !item.isChefSpecial && (
                              <span className="px-3 py-1 bg-foreground/90 text-background text-xs font-medium rounded-full">
                                Popular
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="absolute top-4 right-4 px-3 py-1 glass rounded-full">
                            <span className="text-primary font-semibold">
                              ${item.price}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>

                          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center justify-between">
                            {/* Spice Level */}
                            {item.spiceLevel && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground mr-1">
                                  Spice:
                                </span>
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <Flame
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < item.spiceLevel!
                                        ? "text-orange-500"
                                        : "text-muted-foreground/30"
                                    )}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Dietary Labels */}
                            {item.dietary && item.dietary.length > 0 && (
                              <div className="flex gap-1">
                                {item.dietary.slice(0, 2).map((label) => (
                                  <span
                                    key={label}
                                    className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded capitalize"
                                  >
                                    {label.replace("-", " ")}
                                  </span>
                                ))}
                                {item.dietary.length > 2 && (
                                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                    +{item.dietary.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScaleOnHover>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <FadeIn>
                <div className="text-center py-16">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    No dishes found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="rounded-full"
                  >
                    Clear all filters
                  </Button>
                </div>
              </FadeIn>
            )}

            {/* Results Count */}
            {filteredItems.length > 0 && (
              <FadeIn className="mt-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Showing {filteredItems.length} of {menuItems.length} dishes
                </p>
              </FadeIn>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
