"use client";

import { motion } from "framer-motion";
import {
  FileText,
  CreditCard,
  BarChart4,
  Clock,
  Globe,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FileText,
    title: "Professional Invoices",
    description:
      "Create beautiful, customizable invoices in seconds. Choose from professional themes that match your brand.",
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Options",
    description:
      "Accept credit cards, bank transfers, and PayPal directly on your invoices.",
  },
  {
    icon: BarChart4,
    title: "Financial Insights",
    description:
      "Track revenue, outstanding invoices, and business growth with detailed analytics.",
  },
  {
    icon: Clock,
    title: "Automated Reminders",
    description:
      "Set up automatic payment reminders. Let the system chase payments for you while you focus on work.",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description:
      "Invoice clients in their local currency with automatic exchange rate calculations.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "Bank-level security and compliance with global tax regulations. Your data is encrypted and backed up daily.",
  },
];

const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const subheadingVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.1, ease: "easeOut" },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function BackgroundDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-100/20 dark:bg-blue-900/10 mix-blend-multiply dark:mix-blend-screen blur-2xl"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-100/10 dark:bg-cyan-900/10 mix-blend-multiply dark:mix-blend-screen blur-2xl"></div>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-24 bg-white dark:bg-slate-950 overflow-hidden"
    >
      <BackgroundDecoration />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white"
          >
            Powerful Features for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Modern Businesses
            </span>
          </motion.h2>

          <motion.p
            variants={subheadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Everything you need to streamline your invoicing process and get
            paid faster.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={featureCardVariants}
              className="relative group h-full"
            >
              <div className="absolute -inset-px bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="relative h-full bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <feature.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
