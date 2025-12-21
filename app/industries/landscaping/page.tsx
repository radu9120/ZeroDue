"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  TreeDeciduous,
  Clock,
  CheckCircle,
  ArrowRight,
  Leaf,
  Receipt,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import IndustryTemplatePreview from "@/components/IndustryTemplatePreview";

const benefits = [
  {
    icon: Leaf,
    title: "Property-Based Invoicing",
    description:
      "Bill by property size, service type, or job complexity. Perfect for maintenance contracts or one-time projects.",
  },
  {
    icon: Calendar,
    title: "Seasonal Billing",
    description:
      "Set up recurring invoices for lawn care, seasonal cleanups, or year-round maintenance contracts with ease.",
  },
  {
    icon: MapPin,
    title: "Route-Based Billing",
    description:
      "Manage multiple properties along your route. Track services and billing for each location efficiently.",
  },
  {
    icon: Receipt,
    title: "Materials & Equipment",
    description:
      "Track plants, mulch, equipment rental, and materials. Apply markup and see profit margins per job.",
  },
];

const features = [
  "Property size calculator",
  "Seasonal service billing",
  "Recurring maintenance",
  "Material cost tracking",
  "Equipment rental billing",
  "Before/after photos",
  "Multi-property management",
  "Weather delay documentation",
];

const landscapingServices = [
  "Lawn Care Services",
  "Landscape Design",
  "Garden Maintenance",
  "Tree Services",
  "Hardscaping",
  "Snow Removal",
];

export default function LandscapingInvoicingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                  <TreeDeciduous className="w-4 h-4" />
                  Built for Landscapers
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Landscaping Invoice Software{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
                    That Grows With You
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  From lawn care to landscape design—manage properties, track
                  materials, and bill seasonally with professional invoicing
                  built for landscapers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="neutralOutline"
                      className="border-slate-300 dark:border-slate-600"
                    >
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
              Perfect for
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {landscapingServices.map((service, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Billing That Blooms
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Professional invoicing for every season and every service.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                    Landscaping-Specific Features
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <IndustryTemplatePreview
                  industry="landscaping"
                  title="Sample Landscape Design Invoice"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Cultivate Better Billing
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Grow your landscaping business with professional invoicing. Start
              your free trial today.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
