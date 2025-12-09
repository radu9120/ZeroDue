"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  isActive?: boolean;
}

export function AnimatedIcon({
  icon: Icon,
  className = "",
  isActive = false,
}: AnimatedIconProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.2,
        rotate: [0, -10, 10, -5, 0],
        transition: { duration: 0.4 },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <Icon className={className} />
    </motion.div>
  );
}
