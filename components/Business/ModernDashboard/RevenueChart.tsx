"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  data: { name: string; total: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium text-slate-900 dark:text-white">
            Revenue Overview
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monthly revenue performance
          </p>
        </div>
        <div className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
          Last 12 Months
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                contentStyle={{
                  backgroundColor: "var(--tooltip-bg, #0f172a)",
                  border: "1px solid var(--tooltip-border, #1e293b)",
                  borderRadius: "8px",
                  color: "var(--tooltip-text, #fff)",
                }}
              />
              <Bar
                dataKey="total"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                className="fill-blue-600 dark:fill-blue-500"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
