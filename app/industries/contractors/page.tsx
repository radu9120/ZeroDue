"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Clock,
  CreditCard,
  BarChart3,
  CheckCircle,
  ArrowRight,
  HardHat,
  Receipt,
  Calculator,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import IndustryTemplatePreview from "@/components/IndustryTemplatePreview";

const benefits = [
  {
    icon: FileText,
    title: "Job-Based Invoicing",
    description:
      "Create invoices for each project or job site. Track materials, labor, and expenses separately for clear billing.",
  },
  {
    icon: Receipt,
    title: "Estimates to Invoices",
    description:
      "Send professional estimates and convert them to invoices with one click when the job is approved.",
  },
  {
    icon: Calculator,
    title: "Material & Labor Tracking",
    description:
      "Track costs by job. Add materials, labor hours, and subcontractor fees. Know your profit margins instantly.",
  },
  {
    icon: CreditCard,
    title: "Progress Billing",
    description:
      "Bill clients in stages as work progresses. Request deposits, milestone payments, and final payments easily.",
  },
];

const features = [
  "Job site management",
  "Material cost tracking",
  "Labor hour logging",
  "Progress/milestone billing",
  "Deposit requests",
  "Change order tracking",
  "Subcontractor invoicing",
  "Tax-compliant receipts",
];

const industries = [
  "General Contractors",
  "Home Builders",
  "Renovation Specialists",
  "Subcontractors",
  "Handymen",
  "Remodeling Companies",
];

export default function ContractorInvoicingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-6">
                  <HardHat className="w-4 h-4" />
                  Built for Contractors
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Contractor Invoice Software{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
                    Made Simple
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  From estimates to final payment—manage job invoicing,
                  materials, and progress billing all in one place. Built for
                  construction professionals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-amber-600 hover:bg-amber-700 text-white px-8"
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
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Trusted by 5,000+ contractors and construction businesses
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Industries Served */}
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
              Perfect for
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {industries.map((industry, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm"
                >
                  {industry}
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
                Invoicing Built for the Job Site
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                From small repairs to major construction projects—ZeroDue
                handles your billing needs.
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
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
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
                    Contractor-Specific Features
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    We understand construction billing. ZeroDue includes
                    everything contractors need.
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
                    How Progress Billing Works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">
                        Send estimate and request deposit (25-50%)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">
                        Bill at milestones (rough-in, inspection, etc.)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">
                        Send final invoice upon project completion
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-sm font-bold">
                        4
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">
                        Track all payments against the original estimate
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Simplify Your Job Billing?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Join thousands of contractors who&apos;ve streamlined their
              invoicing with ZeroDue. Start your free trial today.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-amber-600 hover:bg-amber-50 px-8"
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
