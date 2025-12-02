"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";

const faqs = [
  {
    question: "How does the free plan work?",
    answer:
      "Our free plan includes 3 invoices per month, basic templates, and essential features. Perfect for testing the platform or very small businesses. You can upgrade anytime as your needs grow.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your subscription at any time with no penalties. Your account will remain active until the end of your current billing period, and you'll still have access to all features during that time.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. Your clients can also pay via these methods directly through the invoice.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Absolutely. We use bank-level 256-bit SSL encryption for all data transmission and storage. Our infrastructure is hosted on secure servers with regular security audits and compliance with GDPR, SOC 2, and PCI DSS standards.",
  },
  {
    question: "Can I customize invoice templates?",
    answer:
      "Yes! All paid plans include fully customizable templates. Add your logo, change colors, modify layouts, and even create your own templates from scratch. You can also save multiple templates for different client types.",
  },
  {
    question: "Do you offer multi-currency support?",
    answer:
      "Professional and Enterprise plans include multi-currency support with automatic exchange rate updates. Invoice clients in their local currency and track everything in your preferred currency.",
  },
  {
    question: "How do automated reminders work?",
    answer:
      "You can set up automatic email reminders to be sent before and after invoice due dates. Customize the timing and message for each reminder. This feature reduces late payments by an average of 40%.",
  },
  {
    question: "Can I add team members?",
    answer:
      "Yes! Professional plans include 2 team member seats, and Enterprise plans include up to 4 seats. Team members can have different permission levels to control what they can view and edit.",
  },
  {
    question: "What if I need help or have questions?",
    answer:
      "Free users get email support with 48-hour response time. Paid plans get priority support with 24-hour response (Professional) or 6-hour response (Enterprise). We also have extensive documentation, video tutorials, and live chat for Enterprise customers.",
  },
  {
    question: "Can I import existing invoices and clients?",
    answer:
      "Yes! You can easily import your existing invoices, clients, and products via CSV upload. We also provide migration assistance for Enterprise customers switching from other platforms.",
  },
  {
    question: "Do you have an AI assistant?",
    answer:
      "Yes! InvoiceFlow includes a smart AI assistant available 24/7. Click the chat icon to get instant help with creating invoices, understanding features, troubleshooting issues, or any questions about your account. It's like having a support team member always ready to help.",
  },
] as const;

type FAQ = (typeof faqs)[number];

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="border-b border-gray-200 dark:border-slate-700 last:border-b-0"
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors px-6 rounded-lg"
        aria-expanded={isOpen}
        aria-controls={panelId}
        type="button"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 pr-8">
          {faq.question}
        </h3>
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 0.95 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400"
        >
          {isOpen ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="pb-6 px-6 text-gray-600 dark:text-slate-400 leading-relaxed"
            >
              {faq.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-800 transition-colors">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-slate-100"
          >
            Frequently Asked{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
              Questions
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Everything you need to know about InvoiceFlow
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {faqs.map((faq, index) => (
              <FAQItem key={faq.question} faq={faq} index={index} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              Still have questions?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              Contact our support team →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
