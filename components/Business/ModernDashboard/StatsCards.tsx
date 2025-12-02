"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      trend: "up",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Draft Invoices",
      value: stats.pending_amount,
      growth: stats.pending_growth || 0,
      icon: FileText,
      trend: "up",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Overdue",
      value: stats.overdue_amount,
      growth: stats.overdue_growth || 0,
      icon: AlertCircle,
      trend: "down",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-gray-200/60 dark:border-slate-800/60 text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br",
              card.color.replace("text-", "from-").replace("500", "400"),
              "to-transparent"
            )}
          />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 md:p-6 pb-2 relative z-10">
            <CardTitle
              className={cn(
                "text-xs sm:text-sm font-medium transition-all duration-300",
                card.title === "Total Revenue"
                  ? "text-blue-700 dark:text-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-800/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-100 dark:border-blue-800/50"
                  : card.title === "Draft Invoices"
                    ? "text-purple-700 dark:text-purple-100 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/40 dark:to-purple-800/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-purple-100 dark:border-purple-800/50"
                    : card.title === "Overdue"
                      ? "text-red-700 dark:text-red-100 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/40 dark:to-red-800/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-red-100 dark:border-red-800/50"
                      : "text-slate-500 dark:text-slate-400"
              )}
            >
              {card.title}
            </CardTitle>
            <div
              className={cn(
                "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors duration-300",
                card.bgColor,
                "group-hover:bg-opacity-80"
              )}
            >
              <card.icon
                className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", card.color)}
              />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold truncate tracking-tight">
              {currencySymbol}
              {card.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {card.growth !== 0 && (
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center font-medium">
                <span
                  className={cn(
                    "flex items-center mr-1 sm:mr-1.5 px-1 sm:px-1.5 py-0.5 rounded-md",
                    card.growth > 0
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                  )}
                >
                  {card.growth > 0 ? (
                    <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  ) : (
                    <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  )}
                  {Math.abs(card.growth)}%
                </span>
                vs last month
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
