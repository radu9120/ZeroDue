"use client";

import { useState, useEffect, useRef, TouchEvent, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SectionTitle } from "./ui/SectionTitle";
import Image from "next/image";
import { useSimplifiedMotion } from "@/lib/hooks/useSimplifiedMotion";

function FloatingPaths({
  position,
  simplify,
}: {
  position: number;
  simplify: boolean;
}) {
  // Keep existing FloatingPaths code
  const pathCount = simplify ? 10 : 36;
  const paths = useMemo(
    () =>
      Array.from({ length: pathCount }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
      })),
    [pathCount, position]
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-primary/30"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) =>
          simplify ? (
            <path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.12}
            />
          ) : (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.08 + path.id * 0.01}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.6, 0.3],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          )
        )}
      </svg>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "InvoiceFlow has completely transformed how we handle our billing. The automated reminders have reduced our late payments by 75%. The dashboard gives us insights we never had before.",
    author: "Sarah Johnson",
    position: "CFO, TechStart Inc.",
    rating: 5,
    image: "/reviews/sarah-johnson.jpg",
    company: "TechStart Inc.",
  },
  {
    quote:
      "The customizable templates and multi-currency support make it easy to work with international clients. Our invoicing process is now 3x faster, and we can focus on growing our business instead of chasing payments.",
    author: "Michael Chen",
    position: "Freelance Designer",
    rating: 5,
    image: "/reviews/michael-chen.jpg",
    company: "Chen Design Studio",
  },
  {
    quote:
      "As a small business owner, I needed something simple yet powerful. InvoiceFlow strikes the perfect balance and their customer support is exceptional. I've recommended it to all my business contacts.",
    author: "Emma Rodriguez",
    position: "Owner, Bright Ideas Consulting",
    rating: 4,
    image: "/reviews/emma-rodriguez.jpg",
    company: "Bright Ideas Consulting",
  },
  {
    quote:
      "The financial insights have given us visibility we never had before. We've been able to identify our most profitable clients and optimize our pricing. It's like having a financial advisor built into our invoicing system.",
    author: "David Wilson",
    position: "Director, Wilson Accounting",
    rating: 5,
    image: "/reviews/david-wilson.jpg",
    company: "Wilson Accounting",
  },
];

const stats = [
  { label: "Customer Satisfaction", value: "98%" },
  { label: "Time Saved on Invoicing", value: "75%" },
  { label: "Faster Payments", value: "3x" },
  { label: "ROI for Customers", value: "320%" },
];

export default function Testimonials() {
  const simplifyMotion = useSimplifiedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and on window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fixed minimum heights that won't change
  const minHeights = {
    mobile: 600,
    desktop: 400,
  };

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  const handlePrev = () => {
    setAutoplay(false);
    setActiveIndex(
      (current) => (current - 1 + testimonials.length) % testimonials.length
    );
  };

  const handleNext = () => {
    setAutoplay(false);
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  // Touch handlers for mobile swiping
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    // Minimum distance required for a swipe - adjust as needed
    const minSwipeDistance = 50;
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swiped left, go to next
      handleNext();
    } else {
      // Swiped right, go to previous
      handlePrev();
    }
  };

  return (
    <section
      id="testimonials"
      className="relative py-16 md:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
        <FloatingPaths position={1} simplify={simplifyMotion} />
        <FloatingPaths position={-1} simplify={simplifyMotion} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16 max-w-3xl mx-auto">
          <SectionTitle
            regularText="What Our"
            highlightedText="Customers Say"
            description="Thousands of businesses trust InvoiceFlow to handle their invoicing needs"
          />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-200 dark:bg-cyan-900/20 rounded-full opacity-20 blur-3xl"></div>

          {/* Testimonial carousel with swipe support */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full touch-pan-y"
            style={{
              minHeight: isMobile
                ? `${minHeights.mobile}px`
                : `${minHeights.desktop}px`,
              cursor: "grab",
            }}
          >
            <AnimatePresence mode="wait">
              {/* This wrapper contains both the card AND the navigation buttons */}
              <motion.div
                key={activeIndex}
                initial={
                  simplifyMotion ? { opacity: 0 } : { opacity: 0, x: 100 }
                }
                animate={simplifyMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={simplifyMotion ? { opacity: 0 } : { opacity: 0, x: -100 }}
                transition={{
                  duration: simplifyMotion ? 0.35 : 0.5,
                  ease: "easeInOut",
                }}
                className="relative" // Added relative positioning to this wrapper
              >
                {/* Navigation buttons now inside the animated wrapper */}
                <div className="hidden md:block">
                  <button
                    onClick={handlePrev}
                    className="absolute cursor-pointer left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-[#569cd6] transition-colors flex items-center justify-center"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-0 cursor-pointer  top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-[#569cd6] transition-colors flex items-center justify-center"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </button>
                </div>

                {/* The actual card */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-12 border border-blue-100 dark:border-slate-700 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
                    {/* Keep all your existing card content */}
                    <div className="md:col-span-4 flex flex-col items-center md:items-start">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 md:mb-4 border-4 border-white shadow-lg">
                        <Image
                          width={200}
                          height={200}
                          src={
                            testimonials[activeIndex].image ||
                            "/placeholder.svg"
                          }
                          alt={testimonials[activeIndex].author}
                          className="w-full h-full object-cover"
                          quality={80}
                        />
                      </div>

                      <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-slate-100 mb-1 text-center md:text-left">
                        {testimonials[activeIndex].author}
                      </h3>
                      <p className="text-sm md:text-base text-neutral-600 dark:text-slate-400 mb-3 text-center md:text-left">
                        {testimonials[activeIndex].position}
                      </p>

                      <div className="flex mb-3 md:mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 md:h-5 md:w-5 ${
                              i < testimonials[activeIndex].rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-neutral-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Fixed quote position that doesn't overlap text */}
                    <div className="md:col-span-8 relative">
                      {/* Quote icon in its own container */}
                      <div className="hidden md:block absolute -top-4 -left-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full p-2 border border-blue-100 dark:border-blue-800">
                          <Quote className="h-8 w-8 text-blue-300 dark:text-blue-600" />
                        </div>
                      </div>

                      {/* Quote for mobile that won't overlap */}
                      <div className="flex md:hidden justify-center mb-3">
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full p-2 border border-blue-100 dark:border-blue-800">
                          <Quote className="h-5 w-5 text-blue-300 dark:text-blue-600" />
                        </div>
                      </div>

                      {/* Text with proper padding */}
                      <div className="md:pt-6 md:pl-6">
                        <p className="text-base md:text-xl text-primary-text dark:text-slate-300 italic leading-relaxed">
                          "{testimonials[activeIndex].quote}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Keep the rest of your component the same */}
          <div className="flex justify-center mt-4 md:mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoplay(false);
                  setActiveIndex(index);
                }}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === index
                    ? "w-8 h-3 bg-blue-600"
                    : "w-3 h-3 bg-blue-200 hover:bg-blue-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Stats cards with reliable design - reduced spacing */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={simplifyMotion ? false : { opacity: 0, y: 20 }}
                whileInView={simplifyMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={simplifyMotion ? undefined : { once: true }}
                transition={simplifyMotion ? undefined : { delay: i * 0.1 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-blue-100 dark:border-slate-700 text-center"
              >
                <p className="text-xs md:text-sm text-neutral-600 dark:text-slate-400 mb-1 md:mb-2">
                  {stat.label}
                </p>
                <div className="relative">
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA section - better spacing */}
          <div className="mt-10 md:mt-16 text-center">
            <Button
              asChild
              className="rounded-xl px-6 py-4 md:px-8 md:py-6 text-base md:text-lg font-medium 
              bg-gradient-to-r from-blue-600 to-accent hover:from-primary-dark hover:to-cyan-600
              text-white transition-all duration-300 shadow-lg hover:shadow-xl shadow-primary/20"
            >
              <Link href="/sign-up">Join Thousands of Happy Customers</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
