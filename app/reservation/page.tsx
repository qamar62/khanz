"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  MessageSquare,
  Check,
  PartyPopper,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
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
import { Navbar, Footer } from "@/components/layout";
import { PageHero, Section, Container } from "@/components/ui/section";
import { FadeIn } from "@/components/animations";
import { timeSlots, contactInfo } from "@/lib/data";
import { cn } from "@/lib/utils";
import { reservationAPI } from "@/lib/api";

const occasions = [
  { value: "none", label: "Select occasion (optional)" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "date", label: "Date Night" },
  { value: "business", label: "Business Dinner" },
  { value: "celebration", label: "Celebration" },
  { value: "other", label: "Other" },
];

const guestOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} ${i === 0 ? "Guest" : "Guests"}`,
}));

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: "",
    name: "",
    email: "",
    phone: "",
    occasion: "",
    specialRequests: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Convert 12-hour time format to 24-hour format for Django
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert time to 24-hour format
      const time24h = convertTo24Hour(formData.time);
      
      // Submit to Django API
      const response = await reservationAPI.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: time24h,
        guests: parseInt(formData.guests),
        occasion: formData.occasion,
        special_requests: formData.specialRequests,
      });

      if (response.error) {
        console.error("Reservation error:", response.error);
        alert(`Failed to create reservation: ${response.error}`);
        setIsSubmitting(false);
        return;
      }

      console.log("Reservation created:", response.data);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.date && formData.time && formData.guests;
  const canSubmit =
    canProceedToStep2 && formData.name && formData.email && formData.phone;

  // Generate dates for next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-NZ", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  });

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <main>
          <Section className="min-h-[80vh] flex items-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ 
                    y: [null, 800],
                    opacity: [0, 1, 0],
                    x: [0, Math.random() * 100 - 50]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                  className="absolute w-2 h-2 bg-primary/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </motion.div>

            <Container size="narrow">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center relative z-10"
              >
                <motion.div 
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-8 relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.5, 
                      type: "spring", 
                      stiffness: 300,
                      damping: 10
                    }}
                  >
                    <Check className="h-12 w-12 text-primary" />
                  </motion.div>
                  
                  {/* Pulse ring effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                  />
                </motion.div>

                <motion.h1 
                  className="font-serif text-3xl md:text-4xl font-bold text-gradient mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Reservation Confirmed! 🎉
                </motion.h1>

                <motion.p 
                  className="text-muted-foreground text-lg mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Thank you for your reservation, {formData.name}! We&apos;ve
                  sent a confirmation email to {formData.email}.
                </motion.p>

                <motion.div 
                  className="bg-card border border-border rounded-2xl p-6 mb-8 text-left max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h2 className="font-semibold text-foreground mb-4">
                    Reservation Details
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">
                        {new Date(formData.date).toLocaleDateString("en-NZ", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">
                        {formData.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">
                        {formData.guests}{" "}
                        {parseInt(formData.guests) === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
                  >
                    <Link href="/">Return Home</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full px-8 border-foreground/20"
                  >
                    <Link href="/menu">View Menu</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </Container>
          </Section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          title="Reserve Your Table"
          subtitle="Experience exceptional dining - Book your table for an unforgettable evening"
        />

        <Section className="pt-0 -mt-8">
          <Container size="narrow">
            <FadeIn>
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    step >= 1 ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                      step >= 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    Date & Time
                  </span>
                </div>

                <div
                  className={cn(
                    "w-12 h-0.5",
                    step >= 2 ? "bg-primary" : "bg-border"
                  )}
                />

                <div
                  className={cn(
                    "flex items-center gap-2",
                    step >= 2 ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                      step >= 2
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    2
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    Your Details
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
                        <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                          Select Date & Time
                        </h2>

                        <div className="space-y-6">
                          {/* Date Selection */}
                          <div className="space-y-3">
                            <Label className="text-foreground">
                              <Calendar className="h-4 w-4 inline mr-2" />
                              Select Date
                            </Label>
                            <Select
                              value={formData.date}
                              onValueChange={(v) => updateFormData("date", v)}
                            >
                              <SelectTrigger className="h-12 rounded-xl bg-secondary border-border">
                                <SelectValue placeholder="Choose a date" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDates.map((date) => (
                                  <SelectItem key={date.value} value={date.value}>
                                    {date.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Time Selection */}
                          <div className="space-y-3">
                            <Label className="text-foreground">
                              <Clock className="h-4 w-4 inline mr-2" />
                              Select Time
                            </Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {timeSlots.map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => updateFormData("time", time)}
                                  className={cn(
                                    "py-3 px-4 rounded-xl text-sm font-medium transition-colors",
                                    formData.time === time
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-secondary text-foreground hover:bg-secondary/80"
                                  )}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Guest Count */}
                          <div className="space-y-3">
                            <Label className="text-foreground">
                              <Users className="h-4 w-4 inline mr-2" />
                              Number of Guests
                            </Label>
                            <Select
                              value={formData.guests}
                              onValueChange={(v) => updateFormData("guests", v)}
                            >
                              <SelectTrigger className="h-12 rounded-xl bg-secondary border-border">
                                <SelectValue placeholder="Select guests" />
                              </SelectTrigger>
                              <SelectContent>
                                {guestOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              For parties larger than 12, please call us at{" "}
                              {contactInfo.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!canProceedToStep2}
                        className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base"
                      >
                        Continue to Your Details
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {/* Summary Card */}
                      <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4 text-primary" />
                              {new Date(formData.date).toLocaleDateString(
                                "en-NZ",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4 text-primary" />
                              {formData.time}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4 text-primary" />
                              {formData.guests} guests
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-primary text-sm hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>

                      <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
                        <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                          Your Details
                        </h2>

                        <div className="space-y-6">
                          {/* Name */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground">
                              <User className="h-4 w-4 inline mr-2" />
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                updateFormData("name", e.target.value)
                              }
                              placeholder="Enter your full name"
                              className="h-12 rounded-xl bg-secondary border-border"
                              required
                            />
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">
                              <Mail className="h-4 w-4 inline mr-2" />
                              Email Address
                            </Label>
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

                          {/* Phone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-foreground">
                              <Phone className="h-4 w-4 inline mr-2" />
                              Phone Number
                            </Label>
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

                          {/* Occasion */}
                          <div className="space-y-2">
                            <Label className="text-foreground">
                              <PartyPopper className="h-4 w-4 inline mr-2" />
                              Special Occasion
                            </Label>
                            <Select
                              value={formData.occasion}
                              onValueChange={(v) =>
                                updateFormData("occasion", v)
                              }
                            >
                              <SelectTrigger className="h-12 rounded-xl bg-secondary border-border">
                                <SelectValue placeholder="Select occasion (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                {occasions.map((occasion) => (
                                  <SelectItem
                                    key={occasion.value}
                                    value={occasion.value}
                                  >
                                    {occasion.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Special Requests */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="requests"
                              className="text-foreground"
                            >
                              <MessageSquare className="h-4 w-4 inline mr-2" />
                              Special Requests
                            </Label>
                            <Textarea
                              id="requests"
                              value={formData.specialRequests}
                              onChange={(e) =>
                                updateFormData("specialRequests", e.target.value)
                              }
                              placeholder="Any dietary requirements or special requests..."
                              className="min-h-[100px] rounded-xl bg-secondary border-border resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="h-14 rounded-xl border-foreground/20 sm:w-auto"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={!canSubmit || isSubmitting}
                          className="flex-1 h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base"
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
                            "Confirm Reservation"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </FadeIn>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
