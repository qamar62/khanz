"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, ArrowRight, Store } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Button } from "@/components/ui/button";

const branches = [
  {
    name: "Khanz Mediterranean Restaurant",
    address: "135 Great South Road, Papatoetoe, Auckland 2025",
    phone: "+64 09 250 1623",
    email: "info@khanz.co.nz",
    hours: "Mon – Sun · 12:00 PM – 9:00 PM",
    slug: "khanz-mediterranean-restaurant",
    featured: true,
  },
  {
    name: "Khanz Restaurant Botany",
    address: "302 Te Irirangi Drive, Flat Bush, Auckland 2013",
    phone: "+64 9 250 4414",
    email: "info@khanz.co.nz",
    hours: "Mon – Sun · 11:30 AM – 10:00 PM",
    slug: "khanz-botany",
  },
  {
    name: "Khanz Takeaway",
    address: "10/71 Jellicoe Road, Panmure, Auckland 2025",
    phone: "+64 09 527 0647",
    email: "info@khanz.co.nz",
    hours: "Mon – Sun · 11:00 AM – 9:00 PM",
    slug: null,
  },
];

export function BranchesSection() {
  return (
    <Section className="relative bg-secondary/30 overflow-hidden">
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      <Container className="relative">
        <FadeIn>
          <SectionHeader
            label="Our Locations"
            title="Visit Us at Any of Our Branches"
            description="Experience Khanz hospitality at multiple convenient locations across Auckland."
          />
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {branches.map((branch) => (
            <StaggerItem key={branch.name} className="h-full">
              <div
                className={`group relative bg-card border rounded-2xl p-7 lg:p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 ${
                  branch.featured
                    ? "border-primary/40 shadow-lg shadow-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {/* Gold top accent on hover */}
                <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {branch.featured && (
                  <span className="absolute -top-3 left-7 text-[11px] font-semibold tracking-wider uppercase text-primary-foreground bg-primary px-3 py-1 rounded-full shadow-md shadow-primary/30">
                    Flagship
                  </span>
                )}

                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Store className="h-6 w-6 text-primary" />
                </div>

                <h3 className="font-serif text-xl lg:text-2xl font-bold text-foreground mb-5 group-hover:text-primary transition-colors leading-snug">
                  {branch.name}
                </h3>

                <div className="space-y-3.5 flex-grow text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-muted-foreground leading-relaxed">
                      {branch.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <a
                      href={`tel:${branch.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {branch.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-muted-foreground">{branch.hours}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  {branch.slug ? (
                    <Button
                      asChild
                      className="w-full group/btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md shadow-primary/15"
                    >
                      <Link href={`/${branch.slug}`}>
                        View Menu &amp; Reserve
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-xl border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
                    >
                      <a href={`tel:${branch.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call to Order
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
