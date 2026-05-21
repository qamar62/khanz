"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/section";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { googleReviews, aggregateRating } from "@/lib/reviews-data";

export function GoogleReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % googleReviews.length);
  };

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

  // Get visible reviews (current + next 2 for desktop view)
  const getVisibleReviews = () => {
    const reviews = [];
    for (let i = 0; i < 3; i++) {
      reviews.push(googleReviews[(currentIndex + i) % googleReviews.length]);
    }
    return reviews;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <Section className="bg-charcoal-dark/30">
      <Container>
        <FadeIn>
          <SectionHeader
            label="Customer Reviews"
            title="What Our Guests Say"
            description="Trusted by over 1,800 satisfied customers on Google"
            align="center"
          />
        </FadeIn>

        {/* Aggregate Rating */}
        <FadeIn delay={0.2}>
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-8 h-8 fill-primary text-primary"
                />
              ))}
            </div>
            <div className="text-center">
              <div className="text-4xl font-serif font-bold text-gradient mb-2">
                {aggregateRating.rating.toFixed(1)} Stars
              </div>
              <p className="text-muted-foreground">
                Based on {aggregateRating.totalReviews.toLocaleString()}+ Google
                Reviews
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2 mt-2"
            >
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
        <div className="relative max-w-4xl mx-auto">
          {/* Single Card Carousel - All Screen Sizes */}
          <div className="relative min-h-[400px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full"
              >
                <ReviewCard review={googleReviews[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
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

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-muted/20 hover:bg-muted/30 transition-colors"
              aria-label="Previous review"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-muted/20 hover:bg-muted/30 transition-colors"
              aria-label="Next review"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ReviewCard({ review }: { review: typeof googleReviews[0] }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass p-8 rounded-2xl h-full flex flex-col"
    >
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="w-10 h-10 text-primary/30" />
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-primary text-primary" />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
        "{review.text}"
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <span className="text-lg font-semibold text-primary">
            {review.author.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-semibold">{review.author}</div>
          <div className="text-sm text-muted-foreground">{review.date}</div>
        </div>
      </div>

      {/* Google Badge */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          />
        </svg>
        <span>Posted on Google</span>
      </div>
    </motion.div>
  );
}
