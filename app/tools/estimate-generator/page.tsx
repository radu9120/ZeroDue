"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileCheck,
  Zap,
  CheckCircle,
  ArrowRight,
  Calculator,
  Mail,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const features = [
  {
    icon: Calculator,
    title: "Accurate Pricing",
    description: "Calculate project costs with line items and totals",
  },
  {
    icon: FileCheck,
    title: "Convert to Invoice",
    description: "Turn approved estimates into invoices with one click",
  },
  {
    icon: Mail,
    title: "Send for Approval",
    description: "Email estimates to clients for quick approval",
  },
  {
    icon: FileText,
    title: "Professional Design",
    description: "Impress clients with beautifully formatted estimates",
  },
];

const benefits = [
  "Unlimited estimates",
  "Professional templates",
  "Tax calculation",
  "Discount & markup tools",
  "Notes & terms section",
  "Expiration dates",
  "Version history",
  "PDF export",
];

const estimateTypes = [
  {
    title: "Construction Estimate",
    description: "Materials, labor, and project phases",
  },
  {
    title: "Service Estimate",
    description: "Hourly rates and service breakdown",
  },
  {
    title: "Project Estimate",
    description: "Fixed-price project quotes",
  },
  {
    title: "Repair Estimate",
    description: "Parts and labor for repairs",
  },
];

export default function EstimateGeneratorPage() {
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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Free Estimate Generator{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
                    Online
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Create professional estimates and quotes in minutes. Send to
                  clients for approval, then convert to invoices automatically.
                  Perfect for contractors and service businesses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      Create Free Estimate
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button
                      size="lg"
                      variant="neutralOutline"
                      className="border-slate-300 dark:border-slate-600"
                    >
                      Download Template
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Free forever • No credit card required
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Why Use an Online Estimate Generator?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Win more jobs with professional estimates that clients can
                approve instantly.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Estimate Types */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                Create Any Type of Estimate
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {estimateTypes.map((type, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {type.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {type.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits List */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                Everything You Need in an Estimate Tool
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-slate-700 dark:text-slate-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                From Estimate to Payment in 3 Steps
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Create Your Estimate
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Add line items, materials, labor, and any notes. The
                      system automatically calculates totals, taxes, and
                      discounts.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Send for Approval
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Email the estimate to your client with an approval button.
                      Get notified instantly when they accept or have questions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Convert to Invoice
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Once approved, convert the estimate to an invoice with one
                      click. Request deposits or bill in milestones. Get paid
                      online instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Win More Jobs With Professional Estimates
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Create estimates that close deals. Start free—upgrade when you
              need more.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8"
              >
                Create Your First Estimate Free
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
