"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MessageCircle,
  Clock,
  Send,
  MapPin,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `${formData.subject}\n\n${formData.message}`,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "We couldn't send your message.");
      }

      setFeedback({
        type: "success",
        message: "Thanks! We received your message and will respond soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact form submission failed", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
              <MessageCircle className="h-6 w-6 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100">
                Contact Us
              </h1>
              <p className="text-secondary-text mt-1">
                We'd love to hear from you. Send us a message and we'll respond
                as soon as possible.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-header-text mb-6">
                  Get in Touch
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5 text-primary dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-header-text dark:text-slate-100">
                        Email
                      </h3>
                      <a
                        href="mailto:support@invoiceflow.com"
                        className="text-secondary-text hover:text-primary transition-colors"
                      >
                        support@invoiceflow.com
                      </a>
                      <p className="text-sm text-secondary-text mt-1">
                        For general inquiries and support
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-header-text dark:text-slate-100">
                        Business Hours
                      </h3>
                      <p className="text-secondary-text dark:text-slate-400">
                        Monday - Friday: 9:00 AM - 6:00 PM (GMT)
                        <br />
                        Weekend: Emergency support only
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-header-text mb-4">
                  Quick Help
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/help"
                    className="flex items-center text-secondary-text hover:text-primary transition-colors group"
                  >
                    <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Help Center & FAQ
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center text-secondary-text hover:text-primary transition-colors group"
                  >
                    <Globe className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/cookies"
                    className="flex items-center text-secondary-text hover:text-primary transition-colors group"
                  >
                    <Globe className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-header-text mb-6">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-primary-text mb-2"
                      >
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-primary-text mb-2"
                      >
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-primary-text mb-2"
                    >
                      Subject *
                    </label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full"
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-primary-text mb-2"
                    >
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-cyan-500 text-white"
                    disabled={submitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Sending…" : "Send Message"}
                  </Button>

                  {feedback && (
                    <p
                      className={`text-sm ${
                        feedback.type === "success"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {feedback.message}
                    </p>
                  )}
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-primary dark:text-blue-400">
                    <strong>💡 Tip:</strong> For faster support, include as much
                    detail as possible about your issue or question. We
                    typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
