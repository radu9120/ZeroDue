"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  FileType,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const templates = [
  {
    title: "Basic Invoice Template",
    description: "Simple, clean invoice template for any business",
    formats: ["PDF", "Word", "Excel"],
    icon: FileText,
    color: "blue",
  },
  {
    title: "Professional Invoice Template",
    description: "Detailed invoice with tax breakdown and payment terms",
    formats: ["PDF", "Word"],
    icon: FileText,
    color: "indigo",
  },
  {
    title: "Freelancer Invoice Template",
    description: "Hourly rate invoice perfect for freelancers",
    formats: ["PDF", "Word", "Excel"],
    icon: FileType,
    color: "purple",
  },
  {
    title: "Contractor Invoice Template",
    description: "Job-based invoice with materials and labor",
    formats: ["PDF", "Word"],
    icon: FileSpreadsheet,
    color: "amber",
  },
  {
    title: "Service Invoice Template",
    description: "For service businesses with itemized work",
    formats: ["PDF", "Word", "Excel"],
    icon: FileText,
    color: "green",
  },
  {
    title: "Estimate Template",
    description: "Professional quote template for projects",
    formats: ["PDF", "Word"],
    icon: FilePlus,
    color: "sky",
  },
  {
    title: "Receipt Template",
    description: "Payment receipt for completed transactions",
    formats: ["PDF", "Word"],
    icon: FileText,
    color: "pink",
  },
  {
    title: "VAT Invoice Template (UK)",
    description: "UK-compliant VAT invoice with registration number",
    formats: ["PDF", "Word", "Excel"],
    icon: FileText,
    color: "red",
  },
];

const features = [
  "100% Free to Download",
  "Editable in Word & Excel",
  "Professional Design",
  "Tax Compliant",
  "Print & Digital Ready",
  "Customizable Branding",
];

export default function TemplatesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Free Invoice Templates{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                    for Every Business
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Download professional invoice templates in Word, Excel, and
                  PDF. Fully customizable and ready to use. No signup required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      Create Invoice Online
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Choose Your Template
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Professional invoice templates for freelancers, contractors, and
                small businesses.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {templates.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-${template.color}-100 dark:bg-${template.color}-900/30 flex items-center justify-center mb-4`}
                  >
                    <template.icon
                      className={`w-6 h-6 text-${template.color}-600 dark:text-${template.color}-400`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {template.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.formats.map((format, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                  <Button variant="neutralOutline" className="w-full" asChild>
                    <Link href="/sign-up">
                      <Download className="w-4 h-4 mr-2" />
                      Download Free
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Use ZeroDue */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Or Create Invoices Online
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Skip the downloads. Create, send, and track professional
                invoices online with ZeroDue. Automated reminders, payment
                tracking, and more.
              </p>
              <ul className="text-left inline-block mb-8 space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    No Excel or Word needed—create online in seconds
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Send invoices via email with payment links
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Track when invoices are opened and paid
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Automatic payment reminders—never chase clients again
                  </span>
                </li>
              </ul>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Try ZeroDue Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-6">
                Read more:{" "}
                <Link
                  href="/blog/simplify-service-billing"
                  className="text-blue-600 hover:underline"
                >
                  Simplify service billing
                </Link>{" "}
                |{" "}
                <Link href="/faq" className="text-blue-600 hover:underline">
                  FAQs
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready for Professional Invoicing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Stop using templates. Create, send, and track invoices online with
              ZeroDue. Free to start.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8"
              >
                Start Free Today
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
