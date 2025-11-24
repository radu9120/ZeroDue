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
      title: "Pending Invoices",
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
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.title}
            </CardTitle>
            <div className={cn("p-2 rounded-full", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}
              {card.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {card.growth !== 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                <span
                  className={cn(
                    "flex items-center mr-1",
                    card.growth > 0
                      ? "text-green-600 dark:text-green-500"
                      : "text-red-600 dark:text-red-500"
                  )}
                >
                  {card.growth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
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
