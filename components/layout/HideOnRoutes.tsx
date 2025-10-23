"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface HideOnRoutesProps {
  children: ReactNode;
  routes: string[];
}

export default function HideOnRoutes({ children, routes }: HideOnRoutesProps) {
  const pathname = usePathname() || "";
  const shouldHide = routes.some((route) => pathname.startsWith(route));
  if (shouldHide) {
    return null;
  }
  return <>{children}</>;
}
