"use client";

import { motion } from "framer-motion";

export function HeroGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Very subtle, clean gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-blue-100/50 to-transparent dark:from-blue-900/20 dark:to-transparent blur-3xl rounded-full"
      />
    </div>
  );
}
