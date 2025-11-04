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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {badges.length ? (
          badges.map((badge, index) => (
            <React.Fragment key={badge.key}>
              <Badge className={badge.className}>{badge.label}</Badge>
              {index < badges.length - 1 && (
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  →
                </span>
              )}
            </React.Fragment>
          ))
        ) : (
          <span className="text-xs text-gray-400 dark:text-slate-500">
            Not sent
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
        {timeline.map((entry) =>
          entry.value ? (
            <span key={entry.label}>
              {entry.label}: {entry.value}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
