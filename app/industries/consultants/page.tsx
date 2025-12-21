"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Clock,
  CreditCard,
  Users,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import IndustryTemplatePreview from "@/components/IndustryTemplatePreview";

const benefits = [
  {
    icon: Clock,
    title: "Hourly & Project Billing",
    description:
      "Bill by the hour with time tracking or set fixed project rates. Automatically calculate totals based on logged hours.",
  },
  {
    icon: Calendar,
    title: "Retainer Management",
    description:
      "Set up recurring invoices for monthly retainers. Never miss a billing cycle with automatic invoice generation.",
  },
  {
    icon: FileCheck,
    title: "Scope Documentation",
    description:
      "Clearly itemize deliverables, phases, and milestones. Professional invoices that match your proposals.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Tracking",
    description:
      "Track earnings by client, project, or time period. See your most profitable clients at a glance.",
  },
];

const features = [
  "Time tracking integration",
  "Retainer billing",
  "Hourly rate management",
  "Project-based invoicing",
  "Multi-client dashboard",
  "Payment schedules",
  "Contract-to-invoice flow",
  "Professional proposals",
];

const consultingTypes = [
  "Management Consultants",
  "IT Consultants",
  "Business Advisors",
  "Strategy Consultants",
  "Marketing Consultants",
  "HR Consultants",
];

export default function ConsultantInvoicingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
                  <Briefcase className="w-4 h-4" />
                  Built for Consultants
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Consulting Invoice Software{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
                    for Professionals
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Track hours, manage retainers, and invoice clients
                  professionally. Built for consultants who value their time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8"
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

        {/* Consulting Types */}
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
              Trusted by
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {consultingTypes.map((type, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm"
                >
                  {type}
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
                Billing That Matches Your Expertise
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Professional invoicing for professional services.
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
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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

        {/* Features Checklist */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                    Everything Consultants Need
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    From tracking billable hours to managing multiple client
                    retainers.
                  </p>
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Retainer Billing Example
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          Monthly Retainer
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          £2,500.00
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          Included Hours
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          20 hrs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Additional Hours (5 × £150)
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          £750.00
                        </span>
                      </div>
                      <hr className="my-3 border-slate-200 dark:border-slate-600" />
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-900 dark:text-white">
                          Total Due
                        </span>
                        <span className="text-purple-600 dark:text-purple-400">
                          £3,250.00
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-center">
                      Auto-generated monthly with hour tracking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Focus on Consulting, Not Paperwork
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Automate your invoicing and spend more time delivering value to
              clients.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 px-8"
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
