import type { InvoiceListItem } from "@/types";

export type EmailStatusPatch = Partial<
  Pick<
    InvoiceListItem,
    | "status"
    | "email_id"
    | "email_sent_at"
    | "email_delivered"
    | "email_delivered_at"
    | "email_opened"
    | "email_opened_at"
    | "email_open_count"
    | "email_clicked"
    | "email_clicked_at"
    | "email_click_count"
    | "email_bounced"
    | "email_bounced_at"
    | "email_complained"
    | "email_complained_at"
  >
>;

export type EmailStatusState = {
  status: string | null;
  email_id: string | null;
  email_sent_at: string | null;
  email_delivered: boolean | null;
  email_delivered_at: string | null;
  email_opened: boolean | null;
  email_opened_at: string | null;
  email_open_count: number;
  email_clicked: boolean | null;
  email_clicked_at: string | null;
  email_click_count: number;
  email_bounced: boolean | null;
  email_bounced_at: string | null;
  email_complained: boolean | null;
  email_complained_at: string | null;
};

type EmailStatusSource = {
  email_sent_at?: string | null;
  email_delivered?: boolean | null;
  email_open_count?: number | null;
  email_opened?: boolean | null;
  email_click_count?: number | null;
  email_clicked?: boolean | null;
  email_bounced?: boolean | null;
  email_complained?: boolean | null;
};

export type EmailStatusBadge = {
  key: string;
  label: string;
  className: string;
};

export const buildEmailStatusBadges = (
  source: EmailStatusSource
): EmailStatusBadge[] => {
  const openCount = source.email_open_count ?? 0;
  const clickCount = source.email_click_count ?? 0;

  const candidates: Array<EmailStatusBadge & { active: boolean }> = [
    {
      key: "spam",
      label: "Marked as spam",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      active: Boolean(source.email_complained),
    },
    {
      key: "bounced",
      label: "Bounced",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      active: Boolean(source.email_bounced),
    },
    {
      key: "clicked",
      label: clickCount > 1 ? `Clicked ${clickCount}` : "Clicked",
      className:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
      active: clickCount > 0 || Boolean(source.email_clicked),
    },
    {
      key: "opened",
      label: openCount > 1 ? `Opened ${openCount}` : "Opened",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      active: openCount > 0 || Boolean(source.email_opened),
    },
    {
      key: "delivered",
      label: "Delivered",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      active: Boolean(source.email_delivered),
    },
    {
      key: "sent",
      label: "Sent",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      active: Boolean(source.email_sent_at),
    },
  ];

  const activeBadge = candidates.find((candidate) => candidate.active);

  if (!activeBadge) {
    return [];
  }

  const { active, ...badge } = activeBadge;
  return [badge];
};

export const toEmailStatusState = (
  source?: EmailStatusPatch | null
): EmailStatusState => {
  const safe = source ?? {};
  return {
    status: safe.status ?? null,
    email_id: safe.email_id ?? null,
    email_sent_at: safe.email_sent_at ?? null,
    email_delivered: safe.email_delivered ?? null,
    email_delivered_at: safe.email_delivered_at ?? null,
    email_opened: safe.email_opened ?? null,
    email_opened_at: safe.email_opened_at ?? null,
    email_open_count:
      typeof safe.email_open_count === "number" &&
      !Number.isNaN(safe.email_open_count)
        ? safe.email_open_count
        : 0,
    email_clicked: safe.email_clicked ?? null,
    email_clicked_at: safe.email_clicked_at ?? null,
    email_click_count:
      typeof safe.email_click_count === "number" &&
      !Number.isNaN(safe.email_click_count)
        ? safe.email_click_count
        : 0,
    email_bounced: safe.email_bounced ?? null,
    email_bounced_at: safe.email_bounced_at ?? null,
    email_complained: safe.email_complained ?? null,
    email_complained_at: safe.email_complained_at ?? null,
  };
};

export const mergeEmailStatusState = (
  prev: EmailStatusState,
  patch: EmailStatusPatch
): EmailStatusState => {
  if (!patch) return prev;

  const next: EmailStatusState = { ...prev };

  if (patch.status !== undefined) {
    next.status = patch.status ?? null;
  }
  if (patch.email_id !== undefined) {
    next.email_id = patch.email_id ?? null;
  }
  if (patch.email_sent_at !== undefined) {
    next.email_sent_at = patch.email_sent_at ?? null;
  }
  if (patch.email_delivered !== undefined) {
    next.email_delivered = patch.email_delivered ?? null;
  }
  if (patch.email_delivered_at !== undefined) {
    next.email_delivered_at = patch.email_delivered_at ?? null;
  }
  if (patch.email_opened !== undefined) {
    next.email_opened = patch.email_opened ?? null;
  }
  if (patch.email_opened_at !== undefined) {
    next.email_opened_at = patch.email_opened_at ?? null;
  }
  if (patch.email_open_count !== undefined) {
    next.email_open_count =
      typeof patch.email_open_count === "number" &&
      !Number.isNaN(patch.email_open_count)
        ? patch.email_open_count
        : 0;
  }
  if (patch.email_clicked !== undefined) {
    next.email_clicked = patch.email_clicked ?? null;
  }
  if (patch.email_clicked_at !== undefined) {
    next.email_clicked_at = patch.email_clicked_at ?? null;
  }
  if (patch.email_click_count !== undefined) {
    next.email_click_count =
      typeof patch.email_click_count === "number" &&
      !Number.isNaN(patch.email_click_count)
        ? patch.email_click_count
        : 0;
  }
  if (patch.email_bounced !== undefined) {
    next.email_bounced = patch.email_bounced ?? null;
  }
  if (patch.email_bounced_at !== undefined) {
    next.email_bounced_at = patch.email_bounced_at ?? null;
  }
  if (patch.email_complained !== undefined) {
    next.email_complained = patch.email_complained ?? null;
  }
  if (patch.email_complained_at !== undefined) {
    next.email_complained_at = patch.email_complained_at ?? null;
  }

  return next;
};

export const shouldStopStatusPolling = (
  latest: EmailStatusPatch | null
): boolean => {
  if (!latest) return false;

  if (latest.email_bounced || latest.email_complained) {
    return true;
  }

  const clickCount =
    typeof latest.email_click_count === "number"
      ? latest.email_click_count
      : null;
  if (latest.email_clicked || (clickCount ?? 0) > 0) {
    return true;
  }

  const openCount =
    typeof latest.email_open_count === "number"
      ? latest.email_open_count
      : null;
  if (latest.email_opened || (openCount ?? 0) > 0) {
    return true;
  }

  return false;
};
