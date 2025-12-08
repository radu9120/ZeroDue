"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    total_revenue: number;
    pending_amount: number;
    overdue_amount: number;
    revenue_growth?: number;
    pending_growth?: number;
    overdue_growth?: number;
  };
  currencySymbol: string;
}

export function StatsCards({ stats, currencySymbol }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: stats.total_revenue,
      growth: stats.revenue_growth || 0,
      icon: DollarSign,
      trend: "up" as const,
      color: "blue",
    },
    {
      title: "Pending Invoices",
      value: stats.pending_amount,
      growth: stats.pending_growth || 0,
      icon: FileText,
      trend: "up" as const,
      color: "purple",
    },
    {
      title: "Overdue",
      value: stats.overdue_amount,
      growth: stats.overdue_growth || 0,
      icon: AlertCircle,
      trend: "down" as const,
      color: "red",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          {/* Gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-[0.08] dark:opacity-[0.15]",
              card.color === "blue" && "from-blue-500 to-transparent",
              card.color === "purple" && "from-purple-500 to-transparent",
              card.color === "red" && "from-red-500 to-transparent"
            )}
          />

          <div className="relative z-10">
            {/* Header row */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </div>
              <div
                className={cn(
                  "p-1.5 rounded-lg",
                  card.color === "blue" &&
                    "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
                  card.color === "purple" &&
                    "bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
                  card.color === "red" &&
                    "bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                )}
              >
                {card.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Value */}
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              {currencySymbol}
              {card.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            {/* Growth indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "font-medium",
                  card.growth > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : card.growth < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-500"
                )}
              >
                {card.growth > 0 ? "+" : ""}
                {card.growth}%
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                vs last month
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
