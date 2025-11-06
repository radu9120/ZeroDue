"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Returns true when we should avoid heavy animations. We simplify motion on
 * devices that prefer reduced motion or small viewports where complex
 * animations tend to stutter.
 */
export function useSimplifiedMotion(maxWidth = 768): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsMobileViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, [maxWidth]);

  return prefersReducedMotion || isMobileViewport;
}
