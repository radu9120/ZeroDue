"use client";

import { SectionTitle } from "./ui/SectionTitle";
import { PricingTable } from "@clerk/nextjs";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24  bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <SectionTitle
          regularText="Simple, Transparent"
          highlightedText="Pricing"
          description="Choose the plan that works best for your business."
        />
        <PricingTable />
      </div>
    </section>
  );
}
