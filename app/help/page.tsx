"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Mail,
  Book,
} from "lucide-react";
import { useState } from "react";

export default function HelpCenterPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create my first invoice?",
          answer:
            "To create your first invoice, log into your account and click 'Create Invoice' on your dashboard. Fill in your client's details, add items or services, set your payment terms, and click 'Send'. Your invoice will be automatically generated and sent to your client.",
        },
        {
          question: "How do I set up my business profile?",
          answer:
            "Go to Settings > Business Profile to add your company information, logo, contact details, and tax information. This information will appear on all your invoices automatically.",
        },
        {
          question: "Can I customize my invoice templates?",
          answer:
            "Yes! InvoiceFlow offers several professional templates. You can customize colors, add your logo, and modify the layout to match your brand. Go to Settings > Invoice Templates to get started.",
        },
      ],
    },
    {
      category: "Billing & Payments",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. Your clients can pay invoices using their preferred method through our secure payment gateway.",
        },
        {
          question: "How do I track payment status?",
          answer:
            "All invoice payments are tracked in real-time on your dashboard. You'll receive email notifications when invoices are viewed, paid, or overdue. You can also check the status anytime in your Invoices section.",
        },
        {
          question: "Can I set up recurring invoices?",
          answer:
            "Absolutely! You can set up recurring invoices for regular clients. Choose weekly, monthly, quarterly, or annual billing cycles. The system will automatically generate and send invoices according to your schedule.",
        },
        {
          question: "What are your transaction fees?",
          answer:
            "We charge a small processing fee of 2.9% + $0.30 per successful transaction. There are no hidden fees, setup costs, or monthly minimums. You only pay when you get paid.",
        },
      ],
    },
    {
      category: "Account Management",
      questions: [
        {
          question: "How do I upgrade or downgrade my plan?",
          answer:
            "You can change your plan anytime in Settings > Billing. Upgrades take effect immediately, while downgrades will take effect at the end of your current billing cycle. No cancellation fees apply.",
        },
        {
          question: "Can I export my data?",
          answer:
            "Yes, you can export all your invoices, client data, and reports in CSV or PDF format. Go to Settings > Data Export to download your information at any time.",
        },
        {
          question: "How do I cancel my account?",
          answer:
            "We're sorry to see you go! You can cancel anytime in Settings > Account. Your account will remain active until the end of your current billing period. All your data will be safely stored for 90 days in case you change your mind.",
        },
      ],
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen pt-24 md:pt-28 bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100">
                Help Center
              </h1>
              <p className="text-secondary-text mt-1">
                Find answers to frequently asked questions and get help with
                InvoiceFlow.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary-text"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/contact"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6 text-primary dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-header-text dark:text-slate-100">Contact Us</h3>
                  <p className="text-sm text-secondary-text dark:text-slate-400">
                    Get personalized help
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="mailto:privacy@invoiceflow.com"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-header-text dark:text-slate-100">
                    Email Support
                  </h3>
                  <p className="text-sm text-secondary-text dark:text-slate-400">
                    Send us an email
                  </p>
                </div>
              </div>
            </Link>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Book className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-header-text dark:text-slate-100">
                    Documentation
                  </h3>
                  <p className="text-sm text-secondary-text dark:text-slate-400">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqData.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700"
              >
                <h2 className="text-xl font-semibold text-header-text mb-6">
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.questions.map((faq, faqIndex) => {
                    const globalIndex = sectionIndex * 100 + faqIndex;
                    const isExpanded = expandedFaq === globalIndex;

                    return (
                      <div
                        key={faqIndex}
                        className="border border-blue-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full px-6 py-4 text-left bg-blue-50 hover:bg-blue-100 dark:bg-slate-700 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-primary-text">
                            {faq.question}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-primary dark:text-blue-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-primary dark:text-blue-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-6 py-4 bg-white">
                            <p className="text-primary-text leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-center mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Still need help?
            </h2>
            <p className="text-blue-50 mb-6">
              Can't find what you're looking for? Our support team is here to
              help you.
            </p>
            <Link href="/contact">
              <Button className="bg-white text-primary hover:bg-blue-50">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
