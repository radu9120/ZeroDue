"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, FileText } from "lucide-react";
import CompanyBanner from "./companies-banner";
import { memo, useEffect, useMemo, useState } from "react";

const FloatingPaths = memo(function FloatingPaths({
  position,
}: {
  position: number;
}) {
  const paths = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 6 * position} -${189 + i * 8}C-${
          380 - i * 6 * position
        } -${189 + i * 8} -${312 - i * 6 * position} ${216 - i * 8} ${
          152 - i * 6 * position
        } ${343 - i * 8}C${616 - i * 6 * position} ${470 - i * 8} ${
          684 - i * 6 * position
        } ${875 - i * 8} ${684 - i * 6 * position} ${875 - i * 8}`,
        width: 0.7 + i * 0.05,
        duration: 15 + Math.random() * 10,
      })),
    [position]
  );

  return (
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <svg
        className="w-full h-full text-primary"
        viewBox="0 0 696 316"
        fill="none"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.15}
            initial={{ pathLength: 0.4 }}
            animate={{
              pathLength: 0.8,
              pathOffset: [0, 0.5, 0],
            }}
            transition={{
              duration: path.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
});
FloatingPaths.displayName = "FloatingPaths";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updateMatch = () => setIsDesktop(mediaQuery.matches);
    updateMatch();

    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  return isDesktop;
}

export default function Hero() {
  const isDesktop = useIsDesktop();

  return (
    <div className="relative w-full min-h-[100vh] overflow-hidden flex items-center pt-28 md:pt-32">
      {/* Background elements OUTSIDE of Bounded */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        aria-hidden="true"
      >
        {isDesktop && <FloatingPaths position={1} />}
      </div>

      {/* Background blobs kept for larger viewports to reduce mobile paint cost */}
      {isDesktop && (
        <>
          <div className="absolute top-20 right-10 md:right-40 w-64 md:w-96 h-64 md:h-96 rounded-full bg-blue-100/40 dark:bg-blue-900/20 mix-blend-multiply dark:mix-blend-screen blur-3xl" />
          <div className="absolute bottom-20 left-10 md:left-40 w-48 md:w-72 h-48 md:h-72 rounded-full bg-cyan-100/30 dark:bg-cyan-900/20 mix-blend-multiply dark:mix-blend-screen blur-3xl" />
        </>
      )}

      {/* Removed Bounded as it need to be a bit more wide */}
      <div className="relative z-10 w-full mx-auto px-4 md:px-6 lg:px-12 lg:py-24 xl:py-24 py-10 max-w-[1500px] space-y-8 md:space-y-16">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-5/12"
          >
            {/* Mobile: smaller text, desktop unchanged */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-8 text-header-text dark:text-slate-100 leading-tight">
              Get paid
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-accent dark:from-[#569cd6] dark:to-[#4ec9b0] ml-2 md:ml-3">
                faster
              </span>
            </h1>

            {/* Mobile: smaller text, desktop unchanged */}
            <p className="text-base md:text-xl text-primary-text dark:text-slate-300 mb-6 md:mb-10 max-w-lg">
              Create professional invoices in seconds and automate your payment
              process.
            </p>

            {/* Mobile: vertical stack, desktop unchanged */}
            <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3 sm:gap-x-8 md:gap-x-12 sm:gap-y-4 mb-6 md:mb-10">
              {[
                "Save 5+ hours weekly",
                "Get paid 3x faster",
                "Professional invoices",
              ].map((feature, i) => (
                <div key={i} className="flex items-center">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary dark:text-blue-400 mr-2 shrink-0" />
                  <span className="text-primary-text dark:text-slate-300 text-sm md:text-base font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile: better button sizing, desktop unchanged */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-10">
              <Button
                size="lg"
                className="flex-none w-full sm:w-auto rounded-xl px-6 md:px-7 text-base md:text-lg font-semibold
                  bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600
                  text-white shadow-md hover:shadow-lg hover:shadow-primary/20"
                asChild
              >
                <Link
                  href="/sign-up"
                  className="flex w-full items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="flex-none w-full sm:w-auto rounded-xl px-6 md:px-7 text-base md:text-lg font-semibold
                  border border-neutral-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-slate-800
                  text-primary-text dark:text-slate-300 hover:bg-blue-50/50 dark:hover:bg-slate-700"
                asChild
              >
                <a
                  href="#features"
                  className="flex w-full items-center justify-center"
                >
                  Learn More
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right column - desktop rich preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex md:w-7/12 justify-center md:justify-end relative"
          >
            {/* Browser mockup - mobile optimized sizing */}
            <div className="relative w-full max-w-sm md:max-w-[550px] shadow-xl rounded-xl border border-neutral-200 dark:border-slate-700 overflow-hidden">
              {/* Browser chrome - smaller on mobile */}
              <div className="h-8 md:h-10 bg-white dark:bg-slate-800 border-b border-neutral-100 dark:border-slate-700 flex items-center px-3 md:px-4">
                <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-2 md:mx-4 flex-1 bg-neutral-50 dark:bg-slate-700 rounded-md text-xs md:text-sm text-secondary-text dark:text-slate-400 px-2 md:px-4 py-0.5 md:py-1 text-center overflow-hidden">
                  <span className="hidden sm:inline">
                    www.invcyflow.com/dashboard
                  </span>
                  <span className="sm:hidden">invcyflow.com</span>
                </div>
              </div>

              {/* App interface - mobile optimized */}
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
                {/* Dashboard content - cleaner stats preview */}
                <div className="p-4 md:p-6">
                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: "Total Invoices", value: "124", icon: "📊" },
                      { label: "Revenue", value: "$45.2K", icon: "💰" },
                      { label: "Clients", value: "28", icon: "👥" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow"
                      >
                        <div className="text-lg mb-1">{stat.icon}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                          {stat.label}
                        </div>
                        <div className="text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue chart */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-slate-700 mb-4">
                    <div className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-3">
                      Monthly Revenue
                    </div>
                    <div className="h-32 flex items-end justify-around gap-2">
                      {[45, 65, 55, 75, 85, 70, 90, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 rounded-t hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <span>+</span> New Invoice
                    </button>
                    <button className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 text-xs font-medium py-2 px-3 rounded-lg transition-colors">
                      View All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating success notification */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="hidden md:block absolute -right-6 top-1/4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-2xl border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                    Payment Received
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    $2,400 • Acme Corp
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating invoice notification */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="hidden md:block absolute -right-6 bottom-1/4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-2xl border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                    Invoice Created
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    INV-2324 • Ready to send
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - mobile lightweight preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:hidden"
          >
            <div className="w-full rounded-xl border border-neutral-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    This week
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    $8,240
                  </p>
                </div>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  +18%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Invoices
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    12 sent
                  </p>
                </div>
                <div className="rounded-lg bg-cyan-50 dark:bg-cyan-900/20 p-3">
                  <p className="text-xs text-cyan-600 dark:text-cyan-300">
                    Payments
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    9 received
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-300">
                    Overdue
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    1 follow-up
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 p-3">
                  <p className="text-xs text-violet-600 dark:text-violet-300">
                    Clients
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    +3 new
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div>
          <CompanyBanner />
        </div>
      </div>
    </div>
  );
}
