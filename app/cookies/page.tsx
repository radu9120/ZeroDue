"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Cookie, Shield, Eye, Target, Settings } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export default function CookiesPage() {
  const [cookieConsent, setCookieConsent] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    // Set page title
    document.title = "Cookie Policy | InvoiceFlow";

    // Mark as mounted to avoid hydration issues
    setMounted(true);

    // Function to update cookie preferences from localStorage
    const updateConsent = () => {
      const consent = localStorage.getItem("cookie-consent");
      if (consent) {
        setCookieConsent(JSON.parse(consent));
      } else {
        setCookieConsent(null);
      }
    };

    // Get initial cookie preferences
    updateConsent();

    // Listen for storage changes (when preferences are updated in cookie banner)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cookie-consent") {
        updateConsent();
      }
    };

    // Listen for custom event (for same-window updates)
    const handleCookieUpdate = () => {
      updateConsent();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cookiePreferencesUpdated", handleCookieUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "cookiePreferencesUpdated",
        handleCookieUpdate
      );
    };
  }, []);

  const reopenCookieBanner = () => {
    // Remove the consent to trigger the banner again
    localStorage.removeItem("cookie-consent");
    localStorage.removeItem("cookie-consent-date");
    // Reload the page to show the banner
    window.location.reload();
  };

  const getCurrentPreferences = () => {
    if (!cookieConsent) return "No preferences set";

    const active = [];
    if (cookieConsent.necessary) active.push("Necessary");
    if (cookieConsent.analytics) active.push("Analytics");
    if (cookieConsent.marketing) active.push("Marketing");
    if (cookieConsent.functional) active.push("Functional");

    return active.join(", ");
  };

  const getLastUpdatedDate = () => {
    if (!mounted) return "Loading...";
    const dateString = localStorage.getItem("cookie-consent-date");
    if (dateString) {
      return new Date(dateString).toLocaleDateString();
    }
    return "Not set";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "We could not send your message.");
      }

      setFeedback({
        type: "success",
        message: "Thanks! We received your request and will respond shortly.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Cookie policy contact failed", error);
      const description =
        error instanceof Error ? error.message : "Something went wrong.";
      setFeedback({
        type: "error",
        message: description,
      });
    } finally {
      setSubmitting(false);
    }
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
              <Cookie className="h-6 w-6 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100">
                Cookie Policy
              </h1>
              <p className="text-secondary-text mt-1">
                Last updated:{" "}
                {mounted ? new Date().toLocaleDateString() : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          {/* Current Preferences */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-header-text mb-2">
                  Your Current Cookie Preferences
                </h2>
                <p className="text-primary-text mb-2">
                  <strong>Active cookies:</strong> {getCurrentPreferences()}
                </p>
                {cookieConsent && mounted && (
                  <p className="text-sm text-secondary-text dark:text-slate-400">
                    Last updated: {getLastUpdatedDate()}
                  </p>
                )}
              </div>
              <Button
                onClick={reopenCookieBanner}
                className="bg-primary hover:bg-primary-dark text-white whitespace-nowrap"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Preferences
              </Button>
            </div>
          </div>

          {/* Introduction */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700 mb-8">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              What are cookies?
            </h2>
            <p className="text-primary-text leading-relaxed mb-4">
              Cookies are small text files that are stored on your computer or
              mobile device when you visit a website. They help websites
              remember information about your visit, which can make your next
              visit easier and more useful.
            </p>
            <p className="text-primary-text leading-relaxed">
              At InvoiceFlow, we use cookies to enhance your browsing
              experience, analyze site traffic, and personalize content. This
              policy explains what cookies we use and why.
            </p>
          </div>

          {/* Types of Cookies */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-header-text dark:text-slate-100">
              Types of cookies we use
            </h2>

            {/* Necessary Cookies */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-header-text dark:text-slate-100">
                      Necessary Cookies
                    </h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Always Active
                    </span>
                  </div>
                  <p className="text-primary-text mb-3">
                    These cookies are essential for the website to function
                    properly. They enable core functionality such as security,
                    network management, and accessibility.
                  </p>
                  <div className="text-sm text-secondary-text dark:text-slate-400">
                    <strong>Examples:</strong> Session cookies, authentication
                    tokens, security preferences
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="h-5 w-5 text-primary dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-header-text mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-primary-text mb-3">
                    These cookies help us understand how visitors interact with
                    our website by collecting and reporting information
                    anonymously. This helps us improve our website performance.
                  </p>
                  <div className="text-sm text-secondary-text dark:text-slate-400">
                    <strong>Examples:</strong> Google Analytics, page views,
                    bounce rate, session duration
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-header-text mb-2">
                    Marketing Cookies
                  </h3>
                  <p className="text-primary-text mb-3">
                    These cookies track visitors across websites to display
                    relevant advertisements and measure the effectiveness of
                    advertising campaigns.
                  </p>
                  <div className="text-sm text-secondary-text dark:text-slate-400">
                    <strong>Examples:</strong> Facebook Pixel, Google Ads,
                    retargeting pixels
                  </div>
                </div>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-header-text mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-primary-text mb-3">
                    These cookies enable enhanced functionality and
                    personalization, such as remembering your preferences and
                    settings.
                  </p>
                  <div className="text-sm text-secondary-text dark:text-slate-400">
                    <strong>Examples:</strong> Language preferences, theme
                    settings, form data
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700 mb-8">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              Managing your cookie preferences
            </h2>
            <div className="space-y-4">
              <p className="text-primary-text">
                You can control and manage cookies in several ways:
              </p>
              <ul className="space-y-2 text-primary-text">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Cookie Banner:</strong> Use the "Manage Preferences"
                    button above to update your cookie settings
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Browser Settings:</strong> Most browsers allow you
                    to block or delete cookies through their settings
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Third-party Tools:</strong> Use opt-out tools
                    provided by advertising networks
                  </span>
                </li>
              </ul>
              <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700 p-4 rounded-lg">
                <p
                  className="text-sm"
                  style={{ color: "var(--color-primary)" }}
                >
                  <strong>💡 Tip:</strong> You can change your cookie
                  preferences at any time by clicking the "Manage Preferences"
                  button at the top of this page. Your changes will take effect
                  immediately.
                </p>
              </div>
              <p className="text-sm text-secondary-text bg-neutral-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <strong>Note:</strong> Disabling certain cookies may affect the
                functionality of our website and limit your user experience.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              Questions about cookies?
            </h2>
            <p className="text-primary-text mb-4">
              If you have any questions about our use of cookies or this policy,
              send us a note using the form below. We respond within one
              business day.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-secondary-text dark:text-slate-300 mb-1"
                  >
                    Full name
                  </label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    required
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-secondary-text dark:text-slate-300 mb-1"
                  >
                    Email address
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-secondary-text dark:text-slate-300 mb-1"
                >
                  How can we help?
                </label>
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  required
                  placeholder="Share as much detail as you can so we can help quickly."
                />
              </div>
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
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white"
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-cyan-500 text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
