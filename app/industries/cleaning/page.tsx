"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Sparkles as SparklesIcon,
  Clock,
  CheckCircle,
  ArrowRight,
  Home,
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
    icon: Home,
    title: "Property-Based Billing",
    description:
      "Invoice by property, room, or job size. Perfect for residential, commercial, or one-time deep cleans.",
  },
  {
    icon: Calendar,
    title: "Recurring Service Billing",
    description:
      "Automate weekly, bi-weekly, or monthly cleaning invoices. Set it once and never miss a billing cycle.",
  },
  {
    icon: MapPin,
    title: "Multi-Property Management",
    description:
      "Manage multiple locations for commercial clients. Track services and billing for each property separately.",
  },
  {
    icon: Receipt,
    title: "Service Add-Ons",
    description:
      "Easily add deep cleaning, carpet cleaning, or window washing to standard services with preset pricing.",
  },
];

const features = [
  "Recurring billing automation",
  "Property management",
  "Service package pricing",
  "Add-on services",
  "Team assignment tracking",
  "Before/after photos",
  "Supply cost tracking",
  "Route optimization billing",
];

const cleaningServices = [
  "House Cleaning Services",
  "Commercial Cleaning",
  "Office Cleaning",
  "Carpet Cleaning",
  "Window Cleaning",
  "Deep Cleaning Specialists",
];

export default function CleaningInvoicingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium mb-6">
                  <SparklesIcon className="w-4 h-4" />
                  Built for Cleaning Businesses
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Cleaning Business Invoice Software{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500">
                    That Shines
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Automate recurring billing, manage multiple properties, and
                  get paid on time. Built for cleaning services that care about
                  efficiency.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-teal-600 hover:bg-teal-700 text-white px-8"
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
              {cleaningServices.map((service, index) => (
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
                Clean Books for Your Cleaning Business
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Professional invoicing that saves you time and gets you paid
                faster.
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
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
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
                    Cleaning-Specific Features
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
                  industry="cleaning"
                  title="Sample Recurring Cleaning Invoice"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Automate Your Billing Today
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Stop chasing payments. Set up recurring invoices and get paid
              automatically. Start your free trial.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-teal-50 px-8"
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
