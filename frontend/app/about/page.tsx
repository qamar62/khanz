"use client";

import Link from "next/link";
import { ArrowRight, Award, Users, Clock, Utensils, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, Footer, FloatingCTA } from "@/components/layout";
import { PageHero, Section, Container, SectionHeader, Divider } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

const timeline = [
  {
    year: "2018",
    title: "The Beginning",
    description:
      "Khanz opened its doors in Auckland with a vision to bring authentic Asian flavors to New Zealand.",
  },
  {
    year: "2020",
    title: "Expansion",
    description:
      "Expanded our services with multiple locations and enhanced catering capabilities.",
  },
  {
    year: "2022",
    title: "Recognition",
    description:
      "Received the Auckland Restaurant Excellence Award for outstanding Asian cuisine.",
  },
  {
    year: "2024",
    title: "Growth",
    description:
      "Launched our catering division, bringing Khanz experiences to weddings and corporate events.",
  },
  {
    year: "2025",
    title: "Today",
    description:
      "Celebrating 7+ years of culinary excellence with over 50,000 happy guests served.",
  },
];

const values = [
  {
    icon: Utensils,
    title: "Authentic Flavors",
    description:
      "We honor traditional recipes while embracing modern culinary techniques.",
  },
  {
    icon: Users,
    title: "Warm Hospitality",
    description:
      "Every guest is treated like family, with genuine care and attention.",
  },
  {
    icon: Award,
    title: "Quality Excellence",
    description:
      "Only the finest ingredients, carefully sourced and expertly prepared.",
  },
  {
    icon: Clock,
    title: "Time-Honored Craft",
    description:
      "Patience and precision in every dish, honoring centuries of culinary tradition.",
  },
];

const team = [
  {
    name: "Chef Rajesh Kumar",
    role: "Executive Chef",
    description:
      "With over 25 years of experience in premier kitchens across India and New Zealand, Chef Rajesh brings unparalleled expertise to every dish.",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=600",
  },
  {
    name: "Priya Sharma",
    role: "Head Pastry Chef",
    description:
      "Priya crafts our signature desserts, blending traditional Indian sweets with contemporary techniques.",
    image: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?q=80&w=600",
  },
  {
    name: "Arjun Patel",
    role: "Tandoor Master",
    description:
      "A third-generation tandoor specialist, Arjun brings the art of clay oven cooking to perfection.",
    image: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=600",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          title="Our Story"
          subtitle="A journey of passion, tradition, and culinary excellence"
        />

        {/* Story Section */}
        <Section className="pt-0 -mt-8">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image */}
              <FadeIn direction="left">
                <div className="relative">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1000')",
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 lg:-right-12 glass rounded-2xl p-6 max-w-[280px]">
                    <div className="font-serif text-4xl font-bold text-gradient mb-2">
                      Since 2018
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Crafting extraordinary culinary experiences in Auckland
                    </p>
                  </div>
                </div>
              </FadeIn>

              {/* Content */}
              <FadeIn>
                <span className="inline-block text-primary text-sm font-medium tracking-[0.2em] uppercase mb-4">
                  About Khanz
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                  Where Tradition Meets Innovation
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Founded with a passion to bring the authentic flavors of Asia
                    to New Zealand, Khanz Restaurant has become a destination for
                    those who appreciate the finer aspects of Asian cuisine.
                  </p>
                  <p>
                    Our journey began in 2018 when our founder envisioned a space
                    where traditional recipes could be honored while embracing
                    modern culinary sensibilities. Every dish tells a story of
                    heritage, passed down through generations and perfected in our
                    kitchen.
                  </p>
                  <p>
                    Today, we continue to push boundaries, creating memorable
                    dining experiences that celebrate the rich tapestry of Asian
                    culinary arts while catering to contemporary tastes.
                  </p>
                </div>
              </FadeIn>
            </div>
          </Container>
        </Section>

        {/* Values Section */}
        <Section className="bg-secondary/30">
          <Container>
            <FadeIn>
              <SectionHeader
                label="Our Philosophy"
                title="Values That Define Us"
                description="The principles that guide everything we do, from sourcing ingredients to serving our guests."
              />
            </FadeIn>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <StaggerItem key={value.title}>
                  <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/30 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>

        {/* Timeline Section */}
        <Section>
          <Container size="narrow">
            <FadeIn>
              <SectionHeader
                label="Our Journey"
                title="Milestones Along the Way"
                description="Key moments that have shaped Khanz into what it is today."
              />
            </FadeIn>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <FadeIn
                    key={item.year}
                    delay={index * 0.1}
                    direction={index % 2 === 0 ? "left" : "right"}
                  >
                    <div
                      className={`relative flex items-start gap-8 ${
                        index % 2 === 0
                          ? "md:flex-row"
                          : "md:flex-row-reverse md:text-right"
                      }`}
                    >
                      {/* Dot */}
                      <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full md:-translate-x-1/2 mt-2" />

                      {/* Content */}
                      <div className="flex-1 ml-12 md:ml-0 md:w-1/2 md:px-8">
                        <span className="text-primary font-serif text-2xl font-bold">
                          {item.year}
                        </span>
                        <h3 className="font-semibold text-foreground text-lg mt-1 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* Team Section */}
        <Section className="bg-secondary/30">
          <Container>
            <FadeIn>
              <SectionHeader
                label="Meet the Team"
                title="The Masters Behind the Magic"
                description="Passionate culinary artists dedicated to creating unforgettable dining experiences."
              />
            </FadeIn>

            <StaggerContainer className="grid md:grid-cols-3 gap-8">
              {team.map((member) => (
                <StaggerItem key={member.name}>
                  <div className="group text-center">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${member.image}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <span className="text-primary text-sm font-medium mb-3 block">
                      {member.role}
                    </span>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>

        {/* CTA Section */}
        <Section>
          <Container size="narrow">
            <FadeIn className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                <ChefHat className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Experience Our Story
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
                Join us for an unforgettable dining experience and become part
                of our continuing journey.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
                >
                  <Link href="/reservation">
                    Reserve a Table
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 border-foreground/20"
                >
                  <Link href="/menu">View Our Menu</Link>
                </Button>
              </div>
            </FadeIn>
          </Container>
        </Section>
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
