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
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  return (
    <Card className="col-span-full md:col-span-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-gray-200/60 dark:border-slate-800/60 text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-shadow duration-300 w-full overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6 gap-2 sm:gap-0">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Revenue Overview
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monthly revenue performance
          </p>
        </div>
        <div className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-medium bg-slate-100/80 dark:bg-slate-800/80 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
          Last 12 Months
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="h-[250px] sm:h-[350px] w-full min-w-0 pr-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={30}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Bar
                dataKey="total"
                fill="url(#colorRevenue)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                className="hover:opacity-90 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
