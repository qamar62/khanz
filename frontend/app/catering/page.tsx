"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Building2,
  PartyPopper,
  Users,
  Check,
  Phone,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar, Footer, FloatingCTA } from "@/components/layout";
import { PageHero, Section, Container, SectionHeader, Divider } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/animations";
import { eventTypes, contactInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

const cateringServices = [
  {
    icon: Heart,
    title: "Wedding Catering",
    description:
      "Create unforgettable memories with our exquisite wedding catering. From intimate ceremonies to grand celebrations, we craft menus that reflect your love story.",
    features: [
      "Customized wedding menus",
      "Professional service staff",
      "Elegant presentation",
      "Dietary accommodations",
      "Cake and dessert options",
      "Bar service available",
    ],
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000",
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description:
      "Impress clients and colleagues with sophisticated corporate catering that elevates any business occasion, from board meetings to company celebrations.",
    features: [
      "Business lunch packages",
      "Conference catering",
      "Networking event menus",
      "Executive dining",
      "Team building events",
      "Product launch catering",
    ],
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000",
  },
  {
    icon: PartyPopper,
    title: "Private Parties",
    description:
      "From milestone birthdays to intimate gatherings, we bring the restaurant experience to your venue with personalized menus and impeccable service.",
    features: [
      "Birthday celebrations",
      "Anniversary dinners",
      "Holiday parties",
      "Family gatherings",
      "Cocktail receptions",
      "Theme-based events",
    ],
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1000",
  },
];

const packages = [
  {
    name: "Essential",
    description: "Perfect for casual gatherings",
    priceFrom: 45,
    features: [
      "Starter selection (2 items)",
      "Main course selection (2 items)",
      "Accompaniments",
      "Basic table setup",
    ],
    highlighted: false,
  },
  {
    name: "Premium",
    description: "Our most popular choice",
    priceFrom: 75,
    features: [
      "Starter selection (4 items)",
      "Main course selection (4 items)",
      "Premium accompaniments",
      "Dessert selection",
      "Professional service staff",
      "Elegant table setup",
    ],
    highlighted: true,
  },
  {
    name: "Luxury",
    description: "The ultimate experience",
    priceFrom: 120,
    features: [
      "Full starter selection",
      "Full main course selection",
      "Chef specials included",
      "Premium desserts",
      "Dedicated event manager",
      "Premium presentation",
      "Customized menu options",
      "Bar service available",
    ],
    highlighted: false,
  },
];

const guestRanges = [
  { value: "20-50", label: "20-50 guests" },
  { value: "50-100", label: "50-100 guests" },
  { value: "100-200", label: "100-200 guests" },
  { value: "200+", label: "200+ guests" },
];

const budgetRanges = [
  { value: "under-2000", label: "Under $2,000" },
  { value: "2000-5000", label: "$2,000 - $5,000" },
  { value: "5000-10000", label: "$5,000 - $10,000" },
  { value: "over-10000", label: "Over $10,000" },
];

export default function CateringPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    budget: "",
    message: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          title="Catering & Events"
          subtitle="Transform your special occasions into extraordinary culinary experiences"
        />

        {/* Services Section */}
        <Section className="pt-0 -mt-8">
          <Container>
            <FadeIn>
              <SectionHeader
                label="Our Services"
                title="Exceptional Catering for Every Occasion"
                description="From intimate gatherings to grand celebrations, we bring our passion for culinary excellence directly to your event."
              />
            </FadeIn>

            <div className="space-y-24">
              {cateringServices.map((service, index) => (
                <FadeIn key={service.title} delay={index * 0.1}>
                  <div
                    className={cn(
                      "grid lg:grid-cols-2 gap-12 lg:gap-20 items-center",
                      index % 2 === 1 && "lg:direction-rtl"
                    )}
                  >
                    {/* Image */}
                    <div
                      className={cn(
                        "relative",
                        index % 2 === 1 && "lg:order-2"
                      )}
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${service.image}')` }}
                        />
                      </div>
                      <div className="absolute -bottom-4 -right-4 lg:-right-8 w-32 h-32 border-2 border-primary/20 rounded-2xl -z-10" />
                    </div>

                    {/* Content */}
                    <div className={cn(index % 2 === 1 && "lg:order-1")}>
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <service.icon className="h-8 w-8 text-primary" />
                      </div>

                      <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
                        {service.title}
                      </h3>

                      <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                        {service.description}
                      </p>

                      <ul className="grid grid-cols-2 gap-3">
                        {service.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-sm text-foreground"
                          >
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </Container>
        </Section>

        {/* Packages Section */}
        <Section className="bg-secondary/30">
          <Container>
            <FadeIn>
              <SectionHeader
                label="Packages"
                title="Catering Packages"
                description="Choose from our carefully curated packages or work with our team to create a custom menu tailored to your event."
              />
            </FadeIn>

            <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {packages.map((pkg) => (
                <StaggerItem key={pkg.name}>
                  <ScaleOnHover>
                    <div
                      className={cn(
                        "relative bg-card rounded-2xl p-8 border transition-colors h-full flex flex-col",
                        pkg.highlighted
                          ? "border-primary shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {pkg.highlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                          Most Popular
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                          {pkg.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {pkg.description}
                        </p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-sm text-muted-foreground">
                            From
                          </span>
                          <span className="font-serif text-4xl font-bold text-primary">
                            ${pkg.priceFrom}
                          </span>
                          <span className="text-muted-foreground">
                            /person
                          </span>
                        </div>
                      </div>

                      <Divider ornament className="my-6" />

                      <ul className="space-y-3 flex-1">
                        {pkg.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        asChild
                        className={cn(
                          "w-full mt-8 rounded-full h-12",
                          pkg.highlighted
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        )}
                      >
                        <a href="#inquiry-form">Get Quote</a>
                      </Button>
                    </div>
                  </ScaleOnHover>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>

        {/* Inquiry Form Section */}
        <Section id="inquiry-form">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Info Side */}
              <FadeIn>
                <span className="inline-block text-primary text-sm font-medium tracking-[0.2em] uppercase mb-4">
                  Get in Touch
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                  Let&apos;s Plan Your Perfect Event
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Tell us about your event and our catering team will work with
                  you to create a customized menu and experience that exceeds
                  your expectations.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Call Us
                      </h4>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Email Us
                      </h4>
                      <a
                        href={`mailto:catering@khanz.co.nz`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        catering@khanz.co.nz
                      </a>
                    </div>
                  </div>
                </div>

                {/* Gallery Preview */}
                <div className="mt-12 grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden"
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-${
                            i === 1
                              ? "1519225421980-715cb0215aed"
                              : i === 2
                              ? "1511578314322-379afb476865"
                              : "1530103862676-de8c9debad1d"
                          }?q=80&w=400')`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* Form Side */}
              <FadeIn delay={0.2}>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-2xl p-8 lg:p-10 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                      Thank You!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      We&apos;ve received your inquiry and will be in touch within 24
                      hours to discuss your event details.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          eventType: "",
                          eventDate: "",
                          guestCount: "",
                          budget: "",
                          message: "",
                        });
                      }}
                      variant="outline"
                      className="rounded-full"
                    >
                      Submit Another Inquiry
                    </Button>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-card border border-border rounded-2xl p-6 lg:p-8"
                  >
                    <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">
                      Inquiry Form
                    </h3>

                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              updateFormData("name", e.target.value)
                            }
                            placeholder="Your name"
                            className="h-12 rounded-xl bg-secondary border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              updateFormData("email", e.target.value)
                            }
                            placeholder="your@email.com"
                            className="h-12 rounded-xl bg-secondary border-border"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              updateFormData("phone", e.target.value)
                            }
                            placeholder="+64 21 123 4567"
                            className="h-12 rounded-xl bg-secondary border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Event Type</Label>
                          <Select
                            value={formData.eventType}
                            onValueChange={(v) =>
                              updateFormData("eventType", v)
                            }
                          >
                            <SelectTrigger className="h-12 rounded-xl bg-secondary border-border">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate">Event Date</Label>
                          <Input
                            id="eventDate"
                            type="date"
                            value={formData.eventDate}
                            onChange={(e) =>
                              updateFormData("eventDate", e.target.value)
                            }
                            className="h-12 rounded-xl bg-secondary border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Expected Guests</Label>
                          <Select
                            value={formData.guestCount}
                            onValueChange={(v) =>
                              updateFormData("guestCount", v)
                            }
                          >
                            <SelectTrigger className="h-12 rounded-xl bg-secondary border-border">
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                              {guestRanges.map((range) => (
                                <SelectItem
                                  key={range.value}
                                  value={range.value}
                                >
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Budget Range</Label>
                        <Select
                          value={formData.budget}
                          onValueChange={(v) => updateFormData("budget", v)}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-secondary border-border">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Tell Us About Your Event</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            updateFormData("message", e.target.value)
                          }
                          placeholder="Share any details about your event, menu preferences, or special requirements..."
                          className="min-h-[120px] rounded-xl bg-secondary border-border resize-none"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Submit Inquiry
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </FadeIn>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
