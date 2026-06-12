"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { googleReviews, aggregateRating } from "@/lib/reviews-data";

export function GoogleReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % googleReviews.length);
  }, []);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + googleReviews.length) % googleReviews.length
    );
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-slide every 6 seconds, paused on hover
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [paused, handleNext]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Section className="relative bg-secondary/30 overflow-hidden">
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-72 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative">
        <FadeIn>
          <SectionHeader
            label="Customer Reviews"
            title="What Our Guests Say"
            description="Trusted by over 1,800 satisfied customers on Google"
            align="center"
          />
        </FadeIn>

        {/* Aggregate Rating */}
        <FadeIn delay={0.15}>
          <div className="flex flex-col items-center gap-3 mb-12 -mt-4">
            <div className="inline-flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
              <div className="font-serif text-5xl font-bold text-gradient leading-none">
                {aggregateRating.rating.toFixed(1)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {aggregateRating.totalReviews.toLocaleString()}+ Google Reviews
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-primary">
              <a
                href={aggregateRating.googleUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View All Reviews on Google
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </FadeIn>

        {/* Reviews Carousel */}
        <div
          className="relative max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Side arrows (desktop) */}
          <button
            onClick={handlePrev}
            className="hidden lg:flex absolute -left-20 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:border-primary/40 hover:text-primary transition-all duration-300 hover:scale-105"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:border-primary/40 hover:text-primary transition-all duration-300 hover:scale-105"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="relative min-h-[380px] md:min-h-[340px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 32 },
                  opacity: { duration: 0.25 },
                }}
                className="absolute w-full"
              >
                <ReviewCard review={googleReviews[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots + mobile arrows */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={handlePrev}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2">
              {googleReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ReviewCard({ review }: { review: (typeof googleReviews)[0] }) {
  return (
    <div className="relative bg-card border border-border p-8 md:p-10 rounded-2xl h-full flex flex-col shadow-sm">
      {/* Quote + stars row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-primary text-primary" />
          ))}
        </div>
        <Quote className="w-10 h-10 text-primary/20" />
      </div>

      {/* Review Text */}
      <p className="text-foreground/85 text-base md:text-lg leading-relaxed mb-8 flex-grow">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Author + Google badge */}
      <div className="flex items-center justify-between pt-5 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/20 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {review.author.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-foreground">{review.author}</div>
            <div className="text-sm text-muted-foreground">{review.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            />
          </svg>
          <span className="hidden sm:inline">Posted on Google</span>
        </div>
      </div>
    </div>
  );
}
