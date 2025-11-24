"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  PlayCircle,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  ChevronDown,
  MoreHorizontal,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import CompanyBanner from "./companies-banner";
import { useRef } from "react";
import { HeroGlow } from "@/components/ui/hero-glow";

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section
      ref={containerRef}
      className="relative pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <HeroGlow />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Badge */}
          {/* <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            New: AI-Powered Invoicing
          </div> */}

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Invoicing made <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              beautifully simple.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop chasing payments. Start getting paid. The all-in-one invoicing
            platform designed for freelancers and small businesses.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all w-full sm:w-auto"
              asChild
            >
              <Link href="/sign-up">
                Start for free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="neutralOutline"
              className="hidden sm:inline-flex h-12 px-8 rounded-full text-lg border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              asChild
            >
              <Link href="/blog/simplify-service-billing">Learn more</Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-4 md:gap-x-8 gap-y-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <CheckCircle className="h-4 w-4 text-blue-500" /> No credit card
              required
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <CheckCircle className="h-4 w-4 text-blue-500" /> 60-day free
              trial
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <CheckCircle className="h-4 w-4 text-blue-500" /> Cancel anytime
            </div>
          </div>
        </motion.div>

        {/* Dashboard Preview (No Tilt for Sharpness) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          style={{ y }}
          className="mt-12 md:mt-20 relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        >
          <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-950 ring-1 ring-slate-900/5">
            {/* The Mockup Content */}
            <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-[16/10] md:aspect-[16/9] shadow-inner relative flex flex-col">
              {/* Mockup Header */}
              <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between bg-white dark:bg-slate-900 shrink-0 z-20">
                <div className="flex items-center gap-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  {/* Breadcrumbs / Title */}
                  <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400">App</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 dark:text-white">
                      Dashboard
                    </span>
                  </div>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 w-64">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Search...</span>
                    <div className="ml-auto text-[10px] font-mono text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1">
                      ⌘K
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <div className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-800" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 border-2 border-white dark:border-slate-800 shadow-sm" />
                </div>
              </div>

              {/* Mockup Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 gap-6 shrink-0">
                  <div className="space-y-1">
                    {[
                      {
                        label: "Dashboard",
                        icon: LayoutDashboard,
                        active: true,
                      },
                      { label: "Invoices", icon: FileText, active: false },
                      { label: "Clients", icon: Users, active: false },
                      { label: "Settings", icon: Settings, active: false },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`h-10 w-full rounded-lg flex items-center px-3 gap-3 transition-colors cursor-default ${
                          item.active
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                        {item.label === "Invoices" && (
                          <span className="ml-auto text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                            3
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          Acme Inc.
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Free Plan
                        </div>
                      </div>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-6 overflow-hidden flex flex-col gap-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Total Revenue",
                        value: "$45,231.89",
                        change: "+20.1%",
                        trend: "up",
                        color: "blue",
                      },
                      {
                        label: "Pending Invoices",
                        value: "$2,345.00",
                        change: "+4.5%",
                        trend: "up",
                        color: "purple",
                      },
                      {
                        label: "Overdue",
                        value: "$1,200.00",
                        change: "-12%",
                        trend: "down",
                        color: "red",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden group"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
                            stat.color === "blue"
                              ? "from-blue-500 to-transparent"
                              : stat.color === "purple"
                                ? "from-purple-500 to-transparent"
                                : "from-red-500 to-transparent"
                          }`}
                        />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {stat.label}
                            </div>
                            <div
                              className={`p-1 rounded-md shadow-inner ${
                                stat.color === "blue"
                                  ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300"
                                  : stat.color === "purple"
                                    ? "bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300"
                                    : "bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300"
                              }`}
                            >
                              {stat.trend === "up" ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {stat.value}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span
                              className={
                                stat.trend === "up"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }
                            >
                              {stat.change}
                            </span>
                            <span className="text-slate-400 hidden sm:inline">
                              vs last month
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart & Recent Activity Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
                    {/* Chart Area */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            Revenue Overview
                          </div>
                          <div className="text-xs text-slate-500">
                            Monthly revenue performance
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Last 12 Months
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between gap-3 px-2">
                        {[65, 45, 75, 55, 85, 70, 90, 60, 75, 85, 95, 80].map(
                          (h, i) => (
                            <div
                              key={i}
                              className="w-full flex flex-col gap-2 group cursor-pointer"
                            >
                              <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-sm h-32 md:h-40 overflow-hidden">
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-blue-500 dark:bg-blue-500 rounded-t-sm transition-all duration-500 ease-out group-hover:bg-blue-600"
                                  style={{ height: `${h}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                              </div>
                              <div className="text-[10px] text-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {
                                  [
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec",
                                  ][i]
                                }
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Recent Invoices Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          Recent Invoices
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            {
                              client: "Acme Corp",
                              amount: "$1,200.00",
                              status: "Paid",
                              statusColor: "emerald",
                              date: "Today",
                              initials: "AC",
                            },
                            {
                              client: "Globex Inc",
                              amount: "$850.00",
                              status: "Pending",
                              statusColor: "amber",
                              date: "Yesterday",
                              initials: "GI",
                            },
                            {
                              client: "Soylent Corp",
                              amount: "$2,340.00",
                              status: "Overdue",
                              statusColor: "red",
                              date: "Nov 20",
                              initials: "SC",
                            },
                            {
                              client: "Umbrella",
                              amount: "$4,500.00",
                              status: "Paid",
                              statusColor: "emerald",
                              date: "Nov 18",
                              initials: "UC",
                            },
                          ].map((invoice, i) => (
                            <div
                              key={i}
                              className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {invoice.initials}
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {invoice.client}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {invoice.date}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                  {invoice.amount}
                                </div>
                                <div
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium mt-0.5 ${
                                    invoice.status === "Paid"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : invoice.status === "Pending"
                                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {invoice.status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
                        <span className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                          View All Invoices
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow behind dashboard */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-3xl rounded-[3rem]" />
        </motion.div>

        <div className="mt-24">
          <CompanyBanner />
        </div>
      </div>
    </section>
  );
}
