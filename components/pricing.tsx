"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PricingTable } from "@clerk/nextjs";

interface PricingProps {
  showTitle?: boolean;
  showBackground?: boolean;
}

export default function Pricing({
  showTitle = true,
  showBackground = true,
}: PricingProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      border: "#e2e8f0",
      shadow: "rgba(15,23,42,0.05)",
    } as const;

    const dark = {
      foreground: "#f8fafc",
      muted: "#94a3b8",
      cardBg: "#1e293b",
      border: "#334155",
      shadow: "rgba(0,0,0,0.2)",
    } as const;

    const palette = isDarkMode ? dark : light;

    return {
      variables: {
        colorPrimary: "#2563eb",
        colorText: palette.foreground,
        colorTextSecondary: palette.muted,
        colorBackground: palette.cardBg,
        borderRadius: "1rem",
        fontFamily: '"Inter", var(--font-sans)',
      },
      elements: {
        pricingTable: "gap-8 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto",
        pricingTableItem:
          "flex flex-col p-6 rounded-2xl border bg-white dark:bg-slate-950 transition-all duration-300 hover:shadow-xl border-slate-200 dark:border-slate-800",
        // We can't easily target the "popular" item via class names here without :nth-child in global CSS
        // But we can style the common elements
        header: "mb-6",
        headerTitle: "text-xl font-bold text-slate-900 dark:text-white mb-2",
        headerSubtitle:
          "text-sm text-slate-500 dark:text-slate-400 min-h-[2.5rem]",
        price: "text-4xl font-bold text-slate-900 dark:text-white",
        pricePeriod: "text-slate-500 dark:text-slate-400 ml-1",
        features: "flex-1 mb-8 space-y-3",
        feature:
          "flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300",
        featureIcon: "text-blue-600 dark:text-blue-400",
        ctaButton:
          "w-full font-semibold transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg py-2",
      },
    } satisfies Record<string, unknown>;
  }, [isDarkMode]);

  return (
    <section
      id="pricing"
      className={`${showTitle ? "py-24" : "py-0"} relative overflow-hidden`}
    >
      {/* Background elements */}
      {showBackground && (
        <>
          <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-slate-950" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse delay-1000" />
          </div>
        </>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {showTitle && (
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white"
            >
              Simple, Transparent{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Pricing
              </span>
            </motion.h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the plan that works best for your business. No hidden fees.
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {mounted && (
            // To customize the content (prices, features, text), you must configure the Pricing Table
            // in the Clerk Dashboard (https://dashboard.clerk.com/).
            //
            // Recommended Configuration based on your request:
            // 1. Free ($0): "Get started with basic invoicing needs"
            // 2. Professional ($5.83/mo): "Perfect for freelancers..."
            // 3. Enterprise ($15.99/mo): "For established businesses..."
            <PricingTable
              appearance={appearance}
              ctaPosition="bottom"
              // pricingTableId="<YOUR_PRICING_TABLE_ID>" // Uncomment and add your ID from Clerk Dashboard
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
