"use client";

import { motion } from "framer-motion";
import { UserPlus, FileEdit, Send, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="h-8 w-8" />,
    title: "Create Account",
    description: "Sign up in seconds with email or social login.",
    step: "01",
  },
  {
    icon: <FileEdit className="h-8 w-8" />,
    title: "Design Invoice",
    description:
      "Choose a template, add your details, and customize your professional invoice.",
    step: "02",
  },
  {
    icon: <Send className="h-8 w-8" />,
    title: "Send & Track",
    description:
      "Email directly to clients and get real-time notifications when they view or pay.",
    step: "03",
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: "Get Paid",
    description:
      "Receive payments instantly through multiple payment methods. Money in your account faster.",
    step: "04",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-slate-100"
          >
            How It{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
              Works
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto px-4"
          >
            Get started with professional invoicing in just 4 simple steps
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 md:gap-8 relative">
          {/* Connection line for large screens only */}
          <div
            className="hidden lg:block absolute top-14 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 dark:from-blue-900 dark:via-cyan-900 dark:to-blue-900"
            style={{ marginLeft: "10%", marginRight: "10%" }}
          ></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-7 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700 hover:-translate-y-1 relative z-10 h-full">
                {/* Step number badge */}
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                  {step.step}
                </div>

                {/* Icon container */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 sm:mb-5 md:mb-6">
                  <div className="scale-90 sm:scale-100">{step.icon}</div>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 sm:mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow for mobile/tablet (between cards) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center lg:hidden my-4 sm:my-6">
                  <div className="w-0.5 h-8 sm:h-10 bg-gradient-to-b from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
