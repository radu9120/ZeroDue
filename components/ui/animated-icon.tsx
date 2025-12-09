"use client";

import { useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  isActive?: boolean;
  isHovered?: boolean;
}

export function AnimatedIcon({
  icon: Icon,
  className = "",
  isActive = false,
  isHovered = false,
}: AnimatedIconProps) {
  return (
    <div className="flex items-center justify-center">
      <Icon className={className} />
    </div>
  );
}

// Dashboard Icon - grid squares fade in sequentially
export function AnimatedDashboardIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const rectVariants: Variants = {
    normal: { opacity: 1, scale: 1 },
    animate: (i: number) => ({
      opacity: [0, 1],
      scale: [0.8, 1],
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.rect x="3" y="3" width="7" height="7" rx="1" variants={rectVariants} animate={controls} custom={0} />
        <motion.rect x="14" y="3" width="7" height="7" rx="1" variants={rectVariants} animate={controls} custom={1} />
        <motion.rect x="3" y="14" width="7" height="7" rx="1" variants={rectVariants} animate={controls} custom={2} />
        <motion.rect x="14" y="14" width="7" height="7" rx="1" variants={rectVariants} animate={controls} custom={3} />
      </svg>
    </div>
  );
}

// Document Icon - lines draw in
export function AnimatedDocumentIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const lineVariants: Variants = {
    normal: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  return (
    <div className="flex items-center justify-center">
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
        <motion.line x1="16" y1="13" x2="8" y2="13" variants={lineVariants} animate={controls} />
        <motion.line x1="16" y1="17" x2="8" y2="17" variants={lineVariants} animate={controls} />
      </svg>
    </div>
  );
}

// Users Icon - second user slides in
export function AnimatedUsersIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const pathVariants: Variants = {
    normal: {
      translateX: 0,
      transition: { type: "spring", stiffness: 200, damping: 13 },
    },
    animate: {
      translateX: [-6, 0],
      transition: { delay: 0.1, type: "spring", stiffness: 200, damping: 13 },
    },
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <motion.path d="M22 21v-2a4 4 0 0 0-3-3.87" variants={pathVariants} animate={controls} />
        <motion.path d="M16 3.13a4 4 0 0 1 0 7.75" variants={pathVariants} animate={controls} />
      </svg>
    </div>
  );
}

// Chart Icon - bars grow up
export function AnimatedChartIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const lineVariants: Variants = {
    normal: { pathLength: 1, opacity: 1 },
    animate: (i: number) => ({
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.line x1="6" y1="20" x2="6" y2="14" variants={lineVariants} animate={controls} custom={0} />
        <motion.line x1="12" y1="20" x2="12" y2="10" variants={lineVariants} animate={controls} custom={1} />
        <motion.line x1="18" y1="20" x2="18" y2="4" variants={lineVariants} animate={controls} custom={2} />
      </svg>
    </div>
  );
}

// Refresh/Recurring Icon - spins
export function AnimatedRefreshIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const svgVariants: Variants = {
    normal: { rotate: 0 },
    animate: {
      rotate: 180,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={svgVariants}
        animate={controls}
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </motion.svg>
    </div>
  );
}

// Receipt/Expenses Icon - dollar sign draws
export function AnimatedReceiptIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const pathVariants: Variants = {
    normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1],
      pathOffset: [1, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <div className="flex items-center justify-center">
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
        <motion.path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" variants={pathVariants} animate={controls} />
        <motion.path d="M12 17V7" variants={pathVariants} animate={controls} />
      </svg>
    </div>
  );
}

// Clipboard/Estimates Icon - checkmarks draw in
export function AnimatedClipboardIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const lineVariants: Variants = {
    normal: { pathLength: 1, opacity: 1 },
    animate: (i: number) => ({
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { delay: i * 0.15, duration: 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <div className="flex items-center justify-center">
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
        <motion.path d="M12 11h4" variants={lineVariants} animate={controls} custom={0} />
        <motion.path d="M12 16h4" variants={lineVariants} animate={controls} custom={1} />
        <motion.path d="M8 11h.01" variants={lineVariants} animate={controls} custom={2} />
        <motion.path d="M8 16h.01" variants={lineVariants} animate={controls} custom={3} />
      </svg>
    </div>
  );
}

// Settings Icon - gear rotates
export function AnimatedSettingsIcon({
  className = "",
  isActive = false,
  isHovered = false,
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isHovered, controls]);

  const svgVariants: Variants = {
    normal: { rotate: 0 },
    animate: {
      rotate: 180,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={svgVariants}
        animate={controls}
      >
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        <circle cx="12" cy="12" r="3" />
      </motion.svg>
    </div>
  );
}
