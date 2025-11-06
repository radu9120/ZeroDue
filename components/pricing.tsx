"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "./ui/SectionTitle";
import { PricingTable } from "@clerk/nextjs";

export default function Pricing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {mounted ? (
          <PricingTable />
        ) : (
          <div
            className="mt-8 rounded-2xl border border-neutral-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-10 text-center text-primary-text dark:text-slate-300"
            aria-live="polite"
            aria-busy="true"
          >
            Loading pricing&hellip;
          </div>
        )}
      </div>
    </section>
  );
}
