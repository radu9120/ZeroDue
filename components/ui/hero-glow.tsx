"use client";

import { motion } from "framer-motion";

export function HeroGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 dark:bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-20 w-[800px] h-[400px] bg-cyan-400/20 dark:bg-cyan-400/10 blur-[100px] rounded-full mix-blend-screen"
      />
    </div>
  );
}
