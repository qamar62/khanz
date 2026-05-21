"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Navbar, Footer, FloatingCTA } from "@/components/layout";
import { PageHero, Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactAPI } from "@/lib/api";

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit to Django API
      const response = await contactAPI.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      if (response.error) {
        console.error("Contact error:", response.error);
        alert(`Failed to send message: ${response.error}`);
        return;
      }

      console.log("Message sent:", response.data);
      alert("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          title="Contact Us"
          subtitle="Get in touch with us at any of our locations"
        />

        {/* Contact Form Section */}
        <Section className="pt-0 -mt-8">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Contact Info */}
              <FadeIn direction="left">
                <div>
                  <span className="inline-block text-primary text-sm font-medium tracking-[0.2em] uppercase mb-4">
                    Get In Touch
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                    We're Ready to Help You
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    Have a question or want to make a reservation? We'd love to
                    hear from you. Reach out to us through any of our locations
                    or send us a message using the form.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Call Us
                        </h3>
                        <a
                          href="tel:+6492501919"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          +64 9 250 1919
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Email Us
                        </h3>
                        <a
                          href="mailto:info@khanz.co.nz"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          info@khanz.co.nz
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Opening Hours
                        </h3>
                        <div className="text-muted-foreground space-y-1">
                          <p>Monday - Thursday: 11:30 AM - 10:00 PM</p>
                          <p>Friday - Saturday: 11:30 AM - 11:00 PM</p>
                          <p>Sunday: 12:00 PM - 9:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Contact Form */}
              <FadeIn direction="right">
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
                    Send Us a Message
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Your Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+64 9 123 4567"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        className="w-full"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                    >
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </FadeIn>
            </div>
          </Container>
        </Section>

        {/* Branches Section */}
        <Section className="bg-secondary/30">
          <Container>
            <FadeIn>
              <SectionHeader
                label="Our Locations"
                title="Visit Us at Any of Our Branches"
                description="We have multiple locations across Auckland to serve you better."
              />
            </FadeIn>

            <StaggerContainer className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {branches.map((branch) => (
                <StaggerItem key={branch.name}>
                  <div className="bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 transition-all duration-300">
                    {branch.featured && (
                      <span className="inline-block text-xs font-medium tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                        Flagship Location
                      </span>
                    )}

                    <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
                      {branch.name}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Address
                          </p>
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
                          <p className="text-sm font-medium text-foreground mb-1">
                            Phone
                          </p>
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
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Email
                          </p>
                          <a
                            href={`mailto:${branch.email}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {branch.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Hours
                          </p>
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
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
