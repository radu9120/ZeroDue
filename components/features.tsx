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

const features = [
  {
    icon: <FileText className="h-10 w-10 text-primary dark:text-blue-400" />,
    title: "Professional Invoices",
    description:
      "Create beautiful, customizable invoices in seconds with our intuitive template system.",
  },
  {
    icon: <CreditCard className="h-10 w-10 text-primary dark:text-blue-400" />,
    title: "Multiple Payment Options",
    description:
      "Accept payments via credit card, bank transfer, PayPal, and more with integrated payment processing.",
  },
  {
    icon: <BarChart4 className="h-10 w-10 text-primary dark:text-blue-400" />,
    title: "Financial Insights",
    description:
      "Track your business performance with detailed reports and analytics dashboards.",
  },
  {
    icon: <Clock className="h-10 w-10 text-primary dark:text-blue-400" />,
    title: "Automated Reminders",
    description:
      "Set up automatic payment reminders to reduce late payments and improve cash flow.",
  },
  {
    icon: <Globe className="h-10 w-10 text-primary dark:text-blue-400" />,
    title: "Multi-Currency Support",
    description:
      "Invoice clients in their local currency with automatic exchange rate calculations.",
  },
  {
    icon: <Shield className="h-10 w-10 text-primary dark:text-blue-400" />,
    title: "Secure & Compliant",
    description:
      "Bank-level security and compliance with global tax regulations for peace of mind.",
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
      className="relative py-24 bg-neutral-50 dark:bg-slate-800"
    >
      <BackgroundDecoration />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neutral-900 dark:text-slate-100"
          >
            Powerful Features for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-[#569cd6] dark:to-[#4ec9b0]">
              Modern Businesses
            </span>
          </motion.h2>

          <motion.p
            variants={subheadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-lg text-primary-text dark:text-slate-300 max-w-2xl mx-auto"
          >
            Everything you need to streamline your invoicing process and get
            paid faster
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={featureCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-md border border-neutral-200 dark:border-slate-700 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4">{feature.icon}</div>

              <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-slate-100">
                {feature.title}
              </h3>

              <p className="text-primary-text dark:text-slate-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
