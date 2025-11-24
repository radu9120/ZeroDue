"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building,
  FileText,
  Mail,
  MailOpen,
  MousePointerClick,
  AlertCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

// Define the type locally if not available, or import it
interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  target_name: string | null;
  details: any;
  created_at: string;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return format(date, "MMM d");
};

interface RecentActivityListProps {
  recentActivities: UserActivityLog[];
}

export function RecentActivityList({
  recentActivities,
}: RecentActivityListProps) {
  const aggregatedActivities = React.useMemo(() => {
    if (!recentActivities || recentActivities.length === 0) {
      return [] as Array<{
        latest: UserActivityLog;
        count: number;
        latestTimestamp: number;
      }>;
    }

    const groups = new Map<
      string,
      {
        latest: UserActivityLog;
        count: number;
        latestTimestamp: number;
      }
    >();

    for (const activity of recentActivities) {
      const date = activity.created_at ? new Date(activity.created_at) : null;
      const timestamp =
        date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
      const dayKey =
        date && !Number.isNaN(date.getTime())
          ? date.toISOString().slice(0, 10)
          : "unknown";

      const key = [
        activity.action,
        activity.target_id ?? activity.target_name ?? "",
        dayKey,
      ].join("|");

      const existing = groups.get(key);

      if (existing) {
        existing.count += 1;
        if (timestamp > existing.latestTimestamp) {
          existing.latest = activity;
          existing.latestTimestamp = timestamp;
        }
      } else {
        groups.set(key, {
          latest: activity,
          count: 1,
          latestTimestamp: timestamp,
        });
      }
    }

    return Array.from(groups.values()).sort(
      (a, b) => b.latestTimestamp - a.latestTimestamp
    );
  }, [recentActivities]);

  const getActivityIcon = (activity: UserActivityLog) => {
    // Email-related activities
    if (activity.action === "Sent invoice") {
      return (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email delivered") {
      return (
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border border-green-200 dark:border-green-800/50">
          <MailOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email opened") {
      return (
        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center border border-amber-200 dark:border-amber-800/50">
          <MailOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email clicked") {
      return (
        <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center border border-violet-200 dark:border-violet-800/50">
          <MousePointerClick className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email bounced") {
      return (
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center border border-red-200 dark:border-red-800/50">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email marked as spam") {
      return (
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center border border-orange-200 dark:border-orange-800/50">
          <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
      );
    }

    // Default icons for other activities
    if (activity.target_type === "business") {
      return (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
          <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    }
    if (activity.target_type === "invoice") {
      return (
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border border-green-200 dark:border-green-800/50">
          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </div>
    );
  };

  return (
    <Card className="col-span-full md:col-span-7 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-gray-200/60 dark:border-slate-800/60 text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {aggregatedActivities.slice(0, 5).map((group, index) => {
            const activity = group.latest;
            const isLast =
              index === aggregatedActivities.slice(0, 5).length - 1;

            return (
              <div key={index} className="flex gap-4 group">
                <div className="relative flex flex-col items-center">
                  <div className="z-10 bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-900 rounded-full transition-transform group-hover:scale-110 duration-200">
                    {getActivityIcon(activity)}
                  </div>
                  {!isLast && (
                    <div className="w-px h-full bg-gray-200 dark:bg-slate-800 absolute top-8 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors" />
                  )}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {activity.action}
                        {group.count > 1 && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full align-middle">
                            x{group.count}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {activity.target_name || "Unknown item"}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {aggregatedActivities.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No recent activity found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
