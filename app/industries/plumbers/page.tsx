"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Droplet,
  Clock,
  CheckCircle,
  ArrowRight,
  Wrench,
  Receipt,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import IndustryTemplatePreview from "@/components/IndustryTemplatePreview";

const benefits = [
  {
    icon: Wrench,
    title: "Service Call Invoicing",
    description:
      "Create invoices on-site right after completing repairs. Include parts, labor, and call-out fees with one tap.",
  },
  {
    icon: Receipt,
    title: "Parts & Materials Tracking",
    description:
      "Track all pipes, fittings, and fixtures used. Add markup to materials and see profit margins instantly.",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Rate Billing",
    description:
      "Easily apply after-hours, weekend, and emergency rates. Clients see clear breakdown of charges.",
  },
  {
    icon: Clock,
    title: "Time-Based Billing",
    description:
      "Bill by the hour with built-in time tracking. Minimum charges and travel time included automatically.",
  },
];

const features = [
  "On-site invoice creation",
  "Parts & materials database",
  "Emergency rate presets",
  "Travel time billing",
  "Photo documentation",
  "Estimate to invoice",
  "Payment on completion",
  "Recurring maintenance billing",
];

const plumbingServices = [
  "Emergency Plumbers",
  "Residential Plumbing",
  "Commercial Plumbers",
  "Drain Specialists",
  "Heating Engineers",
  "Bathroom Fitters",
];

export default function PlumberInvoicingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm font-medium mb-6">
                  <Droplet className="w-4 h-4" />
                  Built for Plumbers
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Plumbing Invoice Software{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-500">
                    That Works
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Create invoices on the job site. Track parts, labor, and
                  call-out fees. Get paid before you leave with mobile payments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-sky-600 hover:bg-sky-700 text-white px-8"
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
              {plumbingServices.map((service, index) => (
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
                Invoicing Built for Plumbers
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                From emergency call-outs to bathroom installations—bill
                professionally every time.
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
                    <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
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

        {/* Sample Invoice */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                    Feature-Rich for Plumbers
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Sample Emergency Call Invoice
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Emergency Call-Out (After Hours)
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        £85.00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Labour (2.5 hours × £65)
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        £162.50
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        15mm Compression Valve
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        £24.00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Pipe Fittings & Sundries
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        £18.50
                      </span>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-600" />
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Subtotal
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        £290.00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        VAT (20%)
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        £58.00
                      </span>
                    </div>
                    <hr className="border-slate-200 dark:border-slate-600" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-slate-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-sky-600 dark:text-sky-400">
                        £348.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-sky-600 to-blue-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Get Paid On The Spot
            </h2>
            <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
              Create invoices on-site and accept payment before you leave.
              Simple, fast, professional.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-sky-600 hover:bg-sky-50 px-8"
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
