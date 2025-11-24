"use client";

import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "InvoiceFlow has completely transformed how we handle our billing. The automated reminders have reduced our late payments by 75%.",
    author: "Sarah Johnson",
    position: "CFO, TechStart Inc.",
    rating: 5,
    image: "/reviews/sarah-johnson.jpg",
    company: "TechStart Inc.",
    className: "md:col-span-2",
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    quote:
      "The customizable templates make it easy to work with international clients. Our invoicing process is now 3x faster.",
    author: "Michael Chen",
    position: "Freelance Designer",
    rating: 5,
    image: "/reviews/michael-chen.jpg",
    company: "Chen Design Studio",
    className: "md:col-span-1",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    quote:
      "Simple yet powerful. InvoiceFlow strikes the perfect balance and their customer support is exceptional.",
    author: "Emma Rodriguez",
    position: "Owner, Bright Ideas",
    rating: 4,
    image: "/reviews/emma-rodriguez.jpg",
    company: "Bright Ideas Consulting",
    className: "md:col-span-1",
    gradient: "from-orange-500/10 to-red-500/10",
  },
  {
    quote:
      "The financial insights have given us visibility we never had before. It's like having a financial advisor built into our invoicing system.",
    author: "David Wilson",
    position: "Director, Wilson Accounting",
    rating: 5,
    image: "/reviews/david-wilson.jpg",
    company: "Wilson Accounting",
    className: "md:col-span-2",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-slate-50/50 dark:bg-slate-950/50" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Trusted by 10,000+ Businesses</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight"
          >
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Businesses
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands of freelancers and small businesses who trust
            InvoiceFlow.
          </motion.p>
        </div>

        {/* Mobile Slider / Desktop Grid */}
        <div className="relative">
          {/* Mobile View: Horizontal Scroll */}
          <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="snap-center shrink-0 w-[85vw] bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-200 dark:text-slate-700"
                      )}
                    />
                  ))}
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-lg mb-6 leading-relaxed font-medium">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white dark:ring-slate-800">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {testimonial.author}
                      <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.position}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "group relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col overflow-hidden",
                  testimonial.className
                )}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                    testimonial.gradient
                  )}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < testimonial.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-200 dark:text-slate-700"
                          )}
                        />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-slate-100 dark:text-slate-800 group-hover:text-blue-100 dark:group-hover:text-blue-900/30 transition-colors duration-500" />
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-lg mb-8 leading-relaxed font-medium flex-grow">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors duration-500">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white dark:ring-slate-800 group-hover:ring-blue-100 dark:group-hover:ring-blue-900/30 transition-all duration-500">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {testimonial.author}
                        <CheckCircle2 className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.position}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
