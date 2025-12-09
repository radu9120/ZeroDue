"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  isActive?: boolean;
}

// Different animation variants for different icon types
const iconAnimations = {
  // Wiggle animation (good for dashboard, settings)
  wiggle: {
    rotate: [0, -12, 12, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
  // Bounce animation (good for notifications, alerts)
  bounce: {
    y: [0, -4, 0, -2, 0],
    transition: { duration: 0.4 },
  },
  // Pulse/scale animation (good for documents, files)
  pulse: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.3 },
  },
  // Spin animation (good for refresh, sync)
  spin: {
    rotate: 360,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export function AnimatedIcon({
  icon: Icon,
  className = "",
  isActive = false,
}: AnimatedIconProps) {
  return (
    <motion.div
      whileHover={iconAnimations.wiggle}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <Icon className={className} />
    </motion.div>
  );
}

// Specialized animated icons with unique animations
export function AnimatedDashboardIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        rotate: [0, -10, 10, -5, 5, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 0.5 },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </motion.div>
  );
}

export function AnimatedDocumentIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        y: [0, -3, 0],
        rotate: [0, -3, 3, 0],
        transition: { duration: 0.4 },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    </motion.div>
  );
}

export function AnimatedUsersIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        scale: [1, 1.1, 1],
        x: [0, 2, -2, 0],
        transition: { duration: 0.4 },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </motion.div>
  );
}

export function AnimatedChartIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        scaleY: [1, 1.15, 1],
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center origin-bottom"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    </motion.div>
  );
}

export function AnimatedRefreshIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        rotate: 180,
        transition: { duration: 0.4, ease: "easeInOut" },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    </motion.div>
  );
}

export function AnimatedReceiptIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        y: [0, -2, 2, 0],
        rotate: [0, 2, -2, 0],
        transition: { duration: 0.4 },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 17V7" />
      </svg>
    </motion.div>
  );
}

export function AnimatedClipboardIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        scale: [1, 1.1, 1],
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.4 },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    </motion.div>
  );
}

export function AnimatedSettingsIcon({ className = "", isActive = false }) {
  return (
    <motion.div
      whileHover={{
        rotate: 90,
        transition: { duration: 0.4, ease: "easeInOut" },
      }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center"
    >
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </motion.div>
  );
}
