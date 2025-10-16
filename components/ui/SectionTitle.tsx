"use client";

import { motion } from "framer-motion";

interface SectionTitleProps {
  regularText: string;
  highlightedText: string;
  description: string;
  className?: string;
}

export function SectionTitle({
  regularText,
  highlightedText,
  description,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neutral-900 dark:text-slate-100"
      >
        {regularText}{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-[#569cd6] dark:to-[#4ec9b0]">
          {highlightedText}
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-lg text-primary-text dark:text-slate-300 max-w-2xl mx-auto"
      >
        {description}
      </motion.p>
    </div>
  );
}
