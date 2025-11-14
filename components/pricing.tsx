"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionTitle } from "./ui/SectionTitle";
import { PricingTable } from "@clerk/nextjs";

export default function Pricing() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      setIsDarkMode(root.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const appearance = useMemo(() => {
    const light = {
      foreground: "#0f172a",
      muted: "#64748b",
      cardBg: "#ffffff",
      border: "#e5e7eb",
      shadow: "rgba(15,23,42,0.12)",
    } as const;

    const dark = {
      foreground: "#f8fafc",
      muted: "#cbd5e1",
      cardBg: "#0b1221",
      border: "#1f2937",
      shadow: "rgba(8,47,73,0.45)",
    } as const;

    const palette = isDarkMode ? dark : light;

    return {
      variables: {
        colorPrimary: "#2563eb",
        colorPrimaryForeground: "#f8fafc",
        colorForeground: palette.foreground,
        colorMutedForeground: palette.muted,
        colorBackground: palette.cardBg,
        colorBackgroundSecondary: isDarkMode ? "#101a2c" : "#f8fafc",
        colorBorder: palette.border,
        colorShadow: palette.shadow,
        fontFamily: '"Space Grotesk", "Inter", var(--font-sans)',
        borderRadius: "10px",
        spacing: "1rem",
      },
    } satisfies Record<string, unknown>;
  }, [isDarkMode]);

  return (
    <section
      id="pricing"
      className="py-24 bg-white dark:bg-slate-900 transition-colors"
    >
      <div className="container mx-auto px-4 md:px-6">
        <SectionTitle
          regularText="Simple, Transparent"
          highlightedText="Pricing"
          description="Choose the plan that works best for your business."
        />

        <PricingTable appearance={appearance} ctaPosition="bottom" />
      </div>
    </section>
  );
}
