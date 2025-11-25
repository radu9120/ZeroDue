"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Cookie,
  X,
  Shield,
  BarChart3,
  Megaphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const cookieTypes = [
  {
    key: "necessary" as const,
    label: "Essential",
    description:
      "Required for core functionality like security and accessibility",
    icon: Shield,
    alwaysOn: true,
  },
  {
    key: "analytics" as const,
    label: "Analytics",
    description: "Help us understand how you use InvoiceFlow",
    icon: BarChart3,
    alwaysOn: false,
  },
  {
    key: "marketing" as const,
    label: "Marketing",
    description: "Personalized ads and promotional content",
    icon: Megaphone,
    alwaysOn: false,
  },
  {
    key: "functional" as const,
    label: "Preferences",
    description: "Remember your settings and personalization",
    icon: Sparkles,
    alwaysOn: false,
  },
];

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    saveCookiePreferences(allAccepted);
    setShowBanner(false);
  };

  const acceptSelected = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(onlyNecessary);
    saveCookiePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("cookiePreferencesUpdated"));

    if (prefs.analytics) {
      // Initialize Google Analytics, etc.
    }
    if (prefs.marketing) {
      // Initialize marketing pixels, etc.
    }
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 border border-neutral-200/60 dark:border-slate-700/60 overflow-hidden">
          {!showSettings ? (
            // Compact main banner
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Cookie className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                    Cookie preferences
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-slate-400 mt-1 leading-relaxed">
                    We use cookies to improve your experience.{" "}
                    <Link
                      href="/cookies"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-5">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium h-10 rounded-xl"
                  >
                    Accept all
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={rejectAll}
                    className="flex-1 bg-neutral-100 dark:bg-slate-800 border-0 text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-slate-700 font-medium h-10 rounded-xl"
                  >
                    Reject all
                  </Button>
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-sm text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200 transition-colors py-2 font-medium"
                >
                  Manage preferences
                </button>
              </div>
            </div>
          ) : (
            // Settings panel
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                  Cookie settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-neutral-500 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cookieTypes.map((cookie) => {
                  const Icon = cookie.icon;
                  const isEnabled = preferences[cookie.key];

                  return (
                    <div
                      key={cookie.key}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        cookie.alwaysOn
                          ? "bg-neutral-50 dark:bg-slate-800/50"
                          : "bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isEnabled || cookie.alwaysOn
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            : "bg-neutral-100 dark:bg-slate-700 text-neutral-400 dark:text-slate-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-neutral-900 dark:text-white">
                            {cookie.label}
                          </h4>
                          {cookie.alwaysOn && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {cookie.description}
                        </p>
                      </div>
                      {!cookie.alwaysOn && (
                        <button
                          onClick={() => handlePreferenceChange(cookie.key)}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                            isEnabled
                              ? "bg-blue-600 dark:bg-blue-500"
                              : "bg-neutral-200 dark:bg-slate-600"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                              isEnabled ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      )}
                      {cookie.alwaysOn && (
                        <div className="w-11 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={rejectAll}
                  className="flex-1 bg-neutral-100 dark:bg-slate-800 border-0 text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-slate-700 font-medium h-10 rounded-xl"
                >
                  Reject all
                </Button>
                <Button
                  size="sm"
                  onClick={acceptSelected}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium h-10 rounded-xl"
                >
                  Save preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
