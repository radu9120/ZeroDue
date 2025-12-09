import * as React from "react";
import type { EmailStatusBadge } from "@/lib/email-status";
import type { EmailStatusTimelineEntry } from "./types";
import {
  Send,
  CheckCircle2,
  Eye,
  MousePointer,
  AlertCircle,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceEmailStatusProps {
  badges: EmailStatusBadge[];
  timeline: EmailStatusTimelineEntry[];
}

// Map status labels to icons and colors
const statusConfig: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    barColor: string;
    label: string;
  }
> = {
  sent: {
    icon: Send,
    color: "text-slate-600 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    barColor: "bg-slate-400",
    label: "Sent",
  },
  delivered: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    barColor: "bg-emerald-500",
    label: "Delivered",
  },
  opened: {
    icon: Eye,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    barColor: "bg-blue-500",
    label: "Opened",
  },
  clicked: {
    icon: MousePointer,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    barColor: "bg-purple-500",
    label: "Clicked",
  },
  bounced: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    barColor: "bg-red-500",
    label: "Bounced",
  },
};

export function InvoiceEmailStatus({
  badges,
  timeline,
}: InvoiceEmailStatusProps) {
  const badgeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    badges.forEach((badge) => {
      map[badge.key.toLowerCase()] = badge.label;
    });
    return map;
  }, [badges]);

  const orderedKeys = ["sent", "delivered", "opened", "clicked"];

  const events = orderedKeys.map((key) => {
    const entry = timeline.find((t) => t.label.toLowerCase().includes(key));
    const config = statusConfig[key] || statusConfig.sent;
    const time = entry?.value || null;
    const isCompleted = Boolean(time || badgeMap[key]);

    return {
      key,
      time,
      isCompleted,
      ...config,
    };
  });

  // Find the latest completed status for the notification card
  const latestEvent = [...events].reverse().find((e) => e.isCompleted);

  if (!latestEvent || events.every((e) => !e.isCompleted)) {
    return null;
  }

  const LatestIcon = latestEvent.icon;

  // Format time for display
  const formatTime = (time: string | null) => {
    if (!time) return "";
    return time;
  };

  return (
    <div className="py-4">
      {/* Email Events Header */}
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Email Events
        </span>
      </div>

      {/* Notification Card - shows the latest status */}
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              latestEvent.bgColor
            )}
          >
            <LatestIcon className={cn("w-5 h-5", latestEvent.color)} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Invoice {latestEvent.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(latestEvent.time) || "Just now"}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "text-xs font-bold px-3 py-1.5 rounded-full",
            latestEvent.bgColor,
            latestEvent.color
          )}
        >
          {latestEvent.label}
        </div>
      </div>

      {/* Progress Bar Timeline */}
      <div className="px-1">
        <div className="flex items-center gap-1 w-full">
          {events.map((event) => (
            <div
              key={event.key}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                event.isCompleted
                  ? event.barColor
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {events.map((event) => (
            <span
              key={event.key}
              className={cn(
                "text-[10px] font-medium",
                event.isCompleted
                  ? event.color
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              {event.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
