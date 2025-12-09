import * as React from "react";
import type { EmailStatusBadge } from "@/lib/email-status";
import type { EmailStatusTimelineEntry } from "./types";
import {
  Send,
  CheckCircle2,
  Mail,
  Eye,
  MousePointer,
  AlertCircle,
  Clock,
} from "lucide-react";

interface InvoiceEmailStatusProps {
  badges: EmailStatusBadge[];
  timeline: EmailStatusTimelineEntry[];
}

// Map status labels to icons and colors
const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; lineColor: string }
> = {
  sent: {
    icon: Send,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    lineColor: "bg-slate-300 dark:bg-slate-700",
  },
  delivered: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    lineColor: "bg-emerald-300 dark:bg-emerald-700",
  },
  opened: {
    icon: Eye,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    lineColor: "bg-blue-300 dark:bg-blue-700",
  },
  clicked: {
    icon: MousePointer,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    lineColor: "bg-purple-300 dark:bg-purple-700",
  },
  bounced: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    lineColor: "bg-red-300 dark:bg-red-700",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    lineColor: "bg-amber-300 dark:bg-amber-700",
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

  const orderedKeys: Array<{ key: string; fallback: string }> = [
    { key: "sent", fallback: "Sent" },
    { key: "delivered", fallback: "Delivered" },
    { key: "opened", fallback: "Opened" },
    { key: "clicked", fallback: "Clicked" },
  ];

  const events = orderedKeys.map(({ key, fallback }, idx) => {
    const entry = timeline.find((t) => t.label.toLowerCase().includes(key));
    const config = statusConfig[key] || statusConfig.sent;
    const label = badgeMap[key] || fallback;
    const time = entry?.value || null;
    const isCompleted = Boolean(time || badgeMap[key]);

    return {
      key,
      label,
      time,
      isCompleted,
      isLast: idx === orderedKeys.length - 1,
      ...config,
    };
  });

  if (events.every((e) => !e.isCompleted)) {
    return null;
  }

  return (
    <div className="py-4">
      {/* Email Events Header */}
      <div className="flex items-center gap-2 mb-5">
        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Email Events
        </span>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto -mx-4 px-4 pb-3">
        <div className="flex items-start gap-6 sm:gap-8 md:gap-10 min-w-max">
          {events.map((event) => {
            const Icon = event.icon;
            const isCompleted = event.isCompleted;

            return (
              <div
                key={event.key}
                className="relative flex flex-col items-center z-10"
                style={{ minWidth: 130 }}
              >
                {/* Icon circle */}
                <div
                  className={[
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center",
                    "transition-all duration-200",
                    isCompleted
                      ? `${event.bgColor} ${event.color} border-current shadow-lg`
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-600 opacity-50",
                  ].join(" ")}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label */}
                <span
                  className={[
                    "mt-2 text-xs font-semibold text-center",
                    isCompleted
                      ? event.color
                      : "text-slate-400 dark:text-slate-500",
                  ].join(" ")}
                >
                  {event.label}
                </span>

                {/* Timestamp */}
                {event.time ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">
                    {event.time}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
