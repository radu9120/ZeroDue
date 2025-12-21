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
  Briefcase,
  Globe,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import IndustryTemplatePreview from "@/components/IndustryTemplatePreview";

const benefits = [
  {
    icon: FileText,
    title: "Professional Invoice Templates",
    description:
      "Impress clients with beautifully designed invoices that reflect your personal brand. Customize colors, add your logo, and stand out.",
  },
  {
    icon: Clock,
    title: "Save Hours Every Week",
    description:
      "Stop spending evenings on admin work. Create invoices in seconds, not hours. Automate recurring invoices for retainer clients.",
  },
  {
    icon: CreditCard,
    title: "Get Paid Faster",
    description:
      "Accept credit cards, bank transfers, and PayPal. Clients can pay with one click. Freelancers using ZeroDue get paid 40% faster.",
  },
  {
    icon: BarChart3,
    title: "Track Your Income",
    description:
      "See your earnings at a glance. Track pending payments, monitor cash flow, and export reports for tax season.",
  },
];

const features = [
  "Unlimited professional invoices",
  "Automatic payment reminders",
  "Multi-currency support",
  "Time tracking integration",
  "Expense tracking",
  "Client management portal",
  "Recurring invoices",
  "Tax calculation (VAT/GST)",
];

const testimonials = [
  {
    quote:
      "ZeroDue changed my freelance game. I used to spend Sundays doing invoices. Now it takes minutes.",
    name: "Alex Thompson",
    role: "Freelance Web Developer",
  },
  {
    quote:
      "The automatic reminders are amazing. I no longer have to awkwardly chase clients for payment.",
    name: "Maria Santos",
    role: "Graphic Designer",
  },
];

export default function FreelancerInvoicingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                  <Briefcase className="w-4 h-4" />
                  Built for Freelancers
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Freelance Invoice Software That{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                    Gets You Paid
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Stop chasing payments. Create professional invoices in
                  seconds, automate reminders, and get paid faster. Free to
                  start, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      Start Invoicing Free
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
                  Join 10,000+ freelancers already using ZeroDue
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Why Freelancers Choose ZeroDue
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Everything you need to manage your freelance finances in one
                place.
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
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                    Everything a Freelancer Needs
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    From creating your first invoice to managing multiple
                    clients, ZeroDue has you covered.
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
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Work With Anyone, Anywhere
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Multi-currency & international invoicing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Secure & Tax Compliant
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Bank-level security, GDPR compliant
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-amber-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        AI-Powered Assistant
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get help 24/7 with smart suggestions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Trusted by Freelancers Worldwide
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Paid Faster?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers who&apos;ve simplified their
              invoicing with ZeroDue. Start free today.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8"
              >
                Create Your First Invoice
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
