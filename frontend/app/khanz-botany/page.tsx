"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, Section, Container } from "@/components/ui/section";
import { FadeIn } from "@/components/animations";

export default function KhanzBotanyPage() {
  return (
    <main>
      <PageHero
        title="Khanz Botany"
        subtitle="Experience authentic Mediterranean, Asian and Sub-Continental flavours in Botany"
      />

      <Section>
        <Container size="narrow">
          <FadeIn>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                Welcome to Khanz Restaurant – Now Open in Botany!
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-4">
                We're proud to bring the rich, vibrant flavours of the Mediterranean, Asian and Sub-Continental cuisines to our newest location in Botany. At Khanz Restaurant, our menu is a celebration of authentic and diverse culinary traditions—crafted with love, tradition, and a modern twist.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-4">
                Each meal is prepared using a careful blend of aromatic herbs and spices with traditional and contemporary cooking techniques. From sizzling grills to fresh salads and hearty mains, every bite offers a delightful fusion of Mediterranean warmth and Asian / Sub-Continental richness.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                We believe in generous portions, fresh ingredients, and exceptional quality—ensuring that every meal is not only satisfying, but truly memorable. At our Botany branch, you'll enjoy:
              </p>

              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>A warm and welcoming atmosphere perfect for families, friends, and food lovers alike</li>
                <li>Friendly and attentive service that makes you feel at home</li>
                <li>A thoughtfully curated menu featuring classic favourites and chef's specials</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mb-8">
                Whether you're stopping by for a relaxed lunch or a special dinner, Khanz in Botany invites you to savour the true essence of global flavours (Mediterranean, Asian, and Sub-Continental), brought together with heart and hospitality. Come and experience the flavours, the aromas, and the warmth of Khanz – now serving at Botany. Your table is waiting.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
                Location & Contact
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Address</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      302 Te Irirangi Drive, Flat Bush, Auckland 2013
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
                      href="tel:+6492504414"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      +64 9 250 4414
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
                      Monday - Sunday: 11:30 AM - 10:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
              >
                <Link href="/reservation">
                  Reserve Your Table
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 border-foreground/20 hover:bg-foreground/5"
              >
                <Link href="/menu">View Full Menu</Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </main>
  );
}
