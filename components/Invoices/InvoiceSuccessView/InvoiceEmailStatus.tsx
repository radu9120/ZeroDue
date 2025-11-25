import { Badge } from "@/components/ui/badge";
import * as React from "react";
import type { EmailStatusBadge } from "@/lib/email-status";
import type { EmailStatusTimelineEntry } from "./types";

interface InvoiceEmailStatusProps {
  badges: EmailStatusBadge[];
  timeline: EmailStatusTimelineEntry[];
}

export function InvoiceEmailStatus({
  badges,
  timeline,
}: InvoiceEmailStatusProps) {
  if (!badges.length && timeline.every((entry) => !entry.value)) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {badges.length ? (
          badges.map((badge, index) => (
            <React.Fragment key={badge.key}>
              <Badge
                className={`${badge.className} rounded-full px-3 py-1 text-xs font-semibold`}
              >
                {badge.label}
              </Badge>
              {index < badges.length - 1 && (
                <span className="text-xs text-gray-300 dark:text-slate-600">
                  →
                </span>
              )}
            </React.Fragment>
          ))
        ) : (
          <span className="text-sm text-gray-400 dark:text-slate-500">
            Not sent yet
          </span>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-slate-400 flex flex-wrap gap-x-6 gap-y-1">
        {timeline.map((entry) =>
          entry.value ? (
            <span key={entry.label} className="flex items-center gap-1.5">
              <span className="text-gray-400 dark:text-slate-500">
                {entry.label}:
              </span>
              <span className="font-medium text-gray-700 dark:text-slate-300">
                {entry.value}
              </span>
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
