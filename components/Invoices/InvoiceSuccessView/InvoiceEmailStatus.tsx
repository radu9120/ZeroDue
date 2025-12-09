import { Badge } from "@/components/ui/badge";
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
  if (!badges.length && timeline.every((entry) => !entry.value)) {
    return null;
  }

  // Build timeline events from badges
  const events = badges.map((badge, index) => {
    const key = badge.key.toLowerCase();
    const config = statusConfig[key] || statusConfig.sent;
    const timelineEntry = timeline.find(
      (t) =>
        t.label.toLowerCase().includes(key) ||
        key.includes(t.label.toLowerCase())
    );

    return {
      ...badge,
      ...config,
      time: timelineEntry?.value || null,
      isLast: index === badges.length - 1,
      isCompleted: true,
    };
  });

  return (
    <div className="py-4">
      {/* Email Events Header */}
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Email Events
        </span>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-0">
        {events.length > 0 ? (
          events.map((event, index) => {
            const Icon = event.icon;
            return (
              <React.Fragment key={event.key}>
                {/* Event Node */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full ${event.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${event.color}`} />
                  </div>
                  <span className={`mt-2 text-xs font-semibold ${event.color}`}>
                    {event.label}
                  </span>
                  {event.time && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {event.time}
                    </span>
                  )}
                </div>

                {/* Connector Line */}
                {!event.isLast && (
                  <div
                    className={`h-0.5 w-12 sm:w-16 md:w-20 ${event.lineColor} mx-1`}
                  />
                )}
              </React.Fragment>
            );
          })
        ) : (
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm">Not sent yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
