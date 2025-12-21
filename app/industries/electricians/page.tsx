"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Wrench,
  Receipt,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import IndustryTemplatePreview from "@/components/IndustryTemplatePreview";

const benefits = [
  {
    icon: Wrench,
    title: "Job-Based Invoicing",
    description:
      "Create detailed invoices for each electrical job. Itemize labor, materials, and testing certificates.",
  },
  {
    icon: ShieldCheck,
    title: "Certification Documentation",
    description:
      "Attach electrical certificates and compliance documents directly to invoices for complete records.",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Rate Presets",
    description:
      "Quickly apply call-out fees, after-hours rates, and emergency charges with preset rate cards.",
  },
  {
    icon: Receipt,
    title: "Materials & Parts Tracking",
    description:
      "Track cable, fittings, consumer units, and more. Apply markup and see margins on every job.",
  },
];

const features = [
  "On-site mobile invoicing",
  "Certificate attachments",
  "Call-out fee automation",
  "Material cost tracking",
  "Labour time tracking",
  "Quote to invoice conversion",
  "Recurring maintenance billing",
  "Multi-property management",
];

const electricalServices = [
  "Domestic Electricians",
  "Commercial Electricians",
  "Emergency Electricians",
  "EV Charger Installers",
  "Solar Panel Installers",
  "Security System Installers",
];

export default function ElectricianInvoicingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  Built for Electricians
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Electrician Invoice Software{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-500">
                    Made Easy
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Create professional invoices for every job. Track materials,
                  attach certificates, and get paid faster—all from your phone.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-8"
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
              {electricalServices.map((service, index) => (
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
                Invoicing Built for Electricians
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                From socket changes to full rewires—bill professionally every
                time.
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
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
                    Everything Electricians Need
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
                  industry="electricians"
                  title="Sample Consumer Unit Replacement Invoice"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-yellow-600 to-amber-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Power Up Your Invoicing
            </h2>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Professional invoicing for professional electricians. Start your
              free trial today.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-yellow-600 hover:bg-yellow-50 px-8"
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
