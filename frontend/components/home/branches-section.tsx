"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

const branches = [
  {
    name: "Khanz Fusion Buffet",
    address: "38C East Tamaki Road, Papatoetoe, Auckland 2025",
    phone: "+64 09 250 1919",
    email: "info@khanz.co.nz",
    hours: "Monday - Sunday: 11:30 AM - 9:30 PM",
    featured: true,
  },
  {
    name: "Khanz Mediterranean Restaurant",
    address: "135 Great South Road, Papatoetoe, Auckland 2025",
    phone: "+64 09 250 1623",
    email: "info@khanz.co.nz",
    hours: "Monday - Sunday: 12:00 PM - 9:00 PM",
  },
  {
    name: "Khanz Restaurant Botany",
    address: "302 Te Irirangi Drive, Flat Bush, Auckland 2013",
    phone: "+64 9 250 4414",
    email: "info@khanz.co.nz",
    hours: "Monday - Sunday: 11:30 AM - 10:00 PM",
  },
  {
    name: "Khanz Takeaway",
    address: "10/71 Jellicoe Road, Panmure, Auckland 2025",
    phone: "+64 09 527 0647",
    email: "info@khanz.co.nz",
    hours: "Monday - Sunday: 11:00 AM - 9:00 PM",
  },
];

export function BranchesSection() {
  return (
    <Section className="bg-secondary/30">
      <Container>
        <FadeIn>
          <SectionHeader
            label="Our Locations"
            title="Visit Us at Any of Our Branches"
            description="Experience Khanz hospitality at multiple convenient locations across Auckland."
          />
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          {branches.map((branch) => (
            <StaggerItem key={branch.name}>
              <div className="group bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                {branch.featured && (
                  <span className="inline-block text-xs font-medium tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                    Flagship Location
                  </span>
                )}
                
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors">
                  {branch.name}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Address</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {branch.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Phone</p>
                      <a
                        href={`tel:${branch.phone}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {branch.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Hours</p>
                      <p className="text-sm text-muted-foreground">
                        {branch.hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
