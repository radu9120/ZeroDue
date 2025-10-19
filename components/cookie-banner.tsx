"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings } from "lucide-react";
import Link from "next/link";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
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

    // Here you would typically initialize your analytics/marketing scripts
    // based on the user's preferences
    if (prefs.analytics) {
      // Initialize Google Analytics, etc.
    }
    if (prefs.marketing) {
      // Initialize marketing pixels, etc.
    }
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Can't disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1e293b] backdrop-blur-md border-t border-neutral-200 dark:border-[#475569] shadow-lg"
      >
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          {!showSettings ? (
            // Main banner
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-[#e2e8f0] mb-1">
                    We use cookies
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-[#cbd5e1] leading-relaxed">
                    We use cookies to enhance your browsing experience, serve
                    personalized content, and analyze our traffic. By clicking
                    "Accept All", you consent to our use of cookies.{" "}
                    <Link
                      href="/cookies"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="border-neutral-300 dark:border-[#475569] text-neutral-700 dark:text-[#cbd5e1] hover:bg-neutral-50 dark:hover:bg-[#334155]"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={rejectAll}
                  className="border-neutral-300 dark:border-[#475569] text-neutral-700 dark:text-[#cbd5e1] hover:bg-neutral-50 dark:hover:bg-[#334155]"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Settings panel
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 dark:text-[#e2e8f0]">
                  Cookie Preferences
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-[#334155]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-3 bg-neutral-50 dark:bg-[#334155] rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-neutral-900 dark:text-[#e2e8f0]">
                        Necessary
                      </h4>
                      <span className="text-xs bg-neutral-200 dark:bg-[#475569] text-neutral-700 dark:text-[#cbd5e1] px-2 py-0.5 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-[#94a3b8]">
                      Essential for the website to function properly. Cannot be
                      disabled.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-3 border border-neutral-200 dark:border-[#475569] rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1 text-neutral-900 dark:text-[#e2e8f0]">
                      Analytics
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-[#94a3b8]">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange("analytics")}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        preferences.analytics
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-neutral-300 dark:bg-[#475569]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white dark:bg-[#e2e8f0] rounded-full shadow transition-transform mt-1 ${
                          preferences.analytics
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-3 border border-neutral-200 dark:border-[#475569] rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1 text-neutral-900 dark:text-[#e2e8f0]">
                      Marketing
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-[#94a3b8]">
                      Used to track visitors and display relevant ads.
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange("marketing")}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        preferences.marketing
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-neutral-300 dark:bg-[#475569]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white dark:bg-[#e2e8f0] rounded-full shadow transition-transform mt-1 ${
                          preferences.marketing
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start justify-between p-3 border border-neutral-200 dark:border-[#475569] rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1 text-neutral-900 dark:text-[#e2e8f0]">
                      Functional
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-[#94a3b8]">
                      Enable enhanced functionality and personalization.
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handlePreferenceChange("functional")}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        preferences.functional
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-neutral-300 dark:bg-[#475569]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white dark:bg-[#e2e8f0] rounded-full shadow transition-transform mt-1 ${
                          preferences.functional
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={rejectAll}
                  className="flex-1 border-neutral-300 dark:border-[#475569] text-neutral-700 dark:text-[#cbd5e1] hover:bg-neutral-50 dark:hover:bg-[#334155]"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={acceptSelected}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
