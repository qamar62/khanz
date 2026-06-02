"use client";

import { useState } from "react";
import { ChevronDown, UtensilsCrossed, Flame, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero, Section, Container } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { menuItems, categoryLabels } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const branches = [
  {
    id: "khanz-mediterranean",
    name: "Khanz Mediterranean Restaurant",
    location: "Papatoetoe",
    menuFile: "/menus/khanz-mediterranean-menu.pdf", // Replace with actual file path
  },
  {
    id: "khanz-botany",
    name: "Khanz Restaurant Botany",
    location: "Flat Bush",
    menuFile: "/menus/khanz-botany-menu.pdf", // Replace with actual file path
  },
  {
    id: "khanz-takeaway",
    name: "Khanz Takeaway",
    location: "Panmure",
    menuFile: "/menus/khanz-takeaway-menu.pdf", // Replace with actual file path
  },
];

export default function MenuPage() {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  const toggleBranch = (branchId: string) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  // Group menu items by category
  const categories = ["starters", "mains", "tandoori", "biryani", "desserts", "drinks"];
  const itemsByCategory = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.category === category),
  }));

  return (
    <main>
      <PageHero
        title="Our Menu"
        subtitle="Discover a symphony of flavors crafted with passion and the finest ingredients"
      />

      <Section className="pt-0 -mt-8">
        <Container size="narrow">
          <StaggerContainer className="space-y-4">
            {branches.map((branch, index) => (
              <StaggerItem key={branch.id}>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {/* Branch Header */}
                  <div className="flex items-center justify-between p-6">
                    <button
                      onClick={() => toggleBranch(branch.id)}
                      className="flex-1 flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <UtensilsCrossed className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-serif text-xl font-bold text-foreground">
                          {branch.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {branch.location}
                        </p>
                      </div>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {/* View Menu File Button */}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        <a
                          href={branch.menuFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Menu
                        </a>
                      </Button>
                      
                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleBranch(branch.id)}
                        className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: expandedBranch === branch.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="h-6 w-6 text-muted-foreground" />
                        </motion.div>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Menu Content */}
                  <AnimatePresence>
                    {expandedBranch === branch.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border p-6 space-y-8">
                          {itemsByCategory.map(({ category, items }) => (
                            <div key={category}>
                              <h4 className="font-serif text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                                {categoryLabels[category]}
                              </h4>
                              <div className="space-y-4">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex justify-between items-start gap-4 group"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-start gap-2 mb-1">
                                        <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                          {item.name}
                                        </h5>
                                        {item.isChefSpecial && (
                                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                                            Chef's Special
                                          </span>
                                        )}
                                        {item.isPopular && !item.isChefSpecial && (
                                          <span className="px-2 py-0.5 bg-secondary text-foreground text-xs font-medium rounded">
                                            Popular
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.description}
                                      </p>
                                      <div className="flex items-center gap-3 mt-2">
                                        {item.spiceLevel && (
                                          <div className="flex items-center gap-1">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                              <Flame
                                                key={i}
                                                className={cn(
                                                  "h-3 w-3",
                                                  i < item.spiceLevel!
                                                    ? "text-orange-500"
                                                    : "text-muted-foreground/30"
                                                )}
                                              />
                                            ))}
                                          </div>
                                        )}
                                        {item.dietary && item.dietary.length > 0 && (
                                          <div className="flex gap-1">
                                            {item.dietary.map((label) => (
                                              <span
                                                key={label}
                                                className="text-xs text-muted-foreground capitalize"
                                              >
                                                {label.replace("-", " ")}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-primary font-semibold whitespace-nowrap">
                                      ${item.price}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>
    </main>
  );
}
