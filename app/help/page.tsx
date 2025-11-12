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
import { useEffect, useState } from "react";

export default function HelpCenterPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create my first company?",
          answer:
            'Open the dashboard and select the "Create Your First Company" button (or "New Company" if you already have one). Add your business name, contact details, and save—this company becomes the profile used on every invoice you generate.',
        },
        {
          question: "How do I create my first invoice?",
          answer:
            'From the dashboard, click into a company card and choose "Create Invoice". Fill in the line items, taxes, and client details, then save. You can immediately view, download, or send the invoice to your customer.',
        },
        {
          question: "How do I add clients to a company?",
          answer:
            'Use the "Manage Clients" quick action (or visit /dashboard/clients) with the relevant business selected. Click "Add Client", complete their contact information, and they will appear in dropdowns when you build invoices.',
        },
      ],
    },
    {
      category: "Invoices & Payments",
      questions: [
        {
          question: "How do I send an invoice to a client?",
          answer:
            'After creating an invoice, open it from the invoice list and use the "Send to Client" option. InvoiceFlow emails the branded PDF and begins tracking delivery, opens, and clicks directly in the invoice table.',
        },
        {
          question: "How do payment statuses update?",
          answer:
            "Statuses move from Draft to Sent when you email the invoice. Mark it as Paid once you confirm payment, or set it to Overdue if the due date passes. These statuses flow through analytics on the dashboard automatically.",
        },
        {
          question: "Can clients pay invoices online inside InvoiceFlow?",
          answer:
            "Not yet. Today, invoices include the payment instructions you provide (such as bank details). Once the client pays through your normal process, update the invoice status to keep records accurate.",
        },
      ],
    },
    {
      category: "Plans & Limits",
      questions: [
        {
          question: "What limits apply to each plan?",
          answer:
            "Free users can manage one business profile and create up to 2 invoices per month with unlimited clients. Professional users can manage up to three business profiles and send up to 15 invoices per month. Enterprise removes all limits and unlocks customizable templates.",
        },
        {
          question: "What happens when I hit my plan limits?",
          answer:
            "The app highlights the relevant counters on the dashboard and invoice pages. You can still view historical data, but new invoices or companies are blocked until you upgrade or archive existing ones.",
        },
        {
          question: "How do I upgrade or manage my subscription?",
          answer:
            "Visit /upgrade (also available via the dashboard banners) to review plans and switch tiers. Changes take effect immediately and the dashboard refreshes as soon as the new plan activates.",
        },
      ],
    },
    {
      category: "Account & Data",
      questions: [
        {
          question: "How do I update business details?",
          answer:
            'Open a company from the dashboard and use the "Settings" button to edit its name, email, address, or VAT information. Updates sync instantly to new invoices you generate for that company.',
        },
        {
          question: "Can I export or download invoices?",
          answer:
            'Yes. Every invoice has a "Download PDF" action on the success view and within the invoice table. You can share the PDF or attach it manually outside InvoiceFlow whenever needed.',
        },
        {
          question: "How can I get support if something isn't working?",
          answer:
            "Use the contact form, email support@invoiceflow.com, or submit feedback from within the dashboard. Our team monitors these channels and replies from Monday through Friday.",
        },
      ],
    },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFaqData = normalizedQuery
    ? faqData
        .map((section) => {
          const questions = section.questions.filter(
            (faq) =>
              faq.question.toLowerCase().includes(normalizedQuery) ||
              faq.answer.toLowerCase().includes(normalizedQuery)
          );
          return { ...section, questions };
        })
        .filter((section) => section.questions.length > 0)
    : faqData;

  useEffect(() => {
    setExpandedFaq(null);
  }, [normalizedQuery]);

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
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text dark:text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary-text dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/contact"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6 text-primary dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-header-text dark:text-slate-100">
                    Contact Us
                  </h3>
                  <p className="text-sm text-secondary-text dark:text-slate-400">
                    Get personalized help
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="mailto:support@invoiceflow.com"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-300" />
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
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                  <Book className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-header-text dark:text-slate-100">
                    Documentation
                  </h3>
                  <p className="text-sm text-secondary-text dark:text-slate-400">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {filteredFaqData.length === 0 && normalizedQuery && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700 text-center">
                <p className="text-primary-text dark:text-slate-200">
                  No articles matched "{searchQuery}". Try another keyword or
                  browse the sections below.
                </p>
              </div>
            )}
            {filteredFaqData.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700"
              >
                <h2 className="text-xl font-semibold text-header-text dark:text-slate-100 mb-6">
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.questions.map((faq, faqIndex) => {
                    const globalIndex = sectionIndex * 100 + faqIndex;
                    const isExpanded = expandedFaq === globalIndex;

                    return (
                      <div
                        key={faqIndex}
                        className="border border-blue-200 dark:border-slate-700 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full px-6 py-4 text-left bg-blue-50 hover:bg-blue-100 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium text-primary-text dark:text-slate-100">
                            {faq.question}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-primary dark:text-blue-300" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-primary dark:text-blue-300" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-6 py-4 bg-white dark:bg-slate-900">
                            <p className="text-primary-text leading-relaxed dark:text-slate-200">
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
