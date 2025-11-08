"use client";
import * as React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/ui/CustomButton";
import { downloadElementAsPDF } from "@/lib/pdf";
import type { InvoiceListItem, BusinessType } from "@/types";
import currencies from "@/lib/currencies.json";
import {
  EmailStatusPatch,
  EmailStatusState,
  buildEmailStatusBadges,
  mergeEmailStatusState,
  shouldStopStatusPolling,
  toEmailStatusState,
} from "@/lib/email-status";
import { getCurrencySymbol, normalizeCurrencyCode } from "@/lib/utils";
import { SuccessBanner } from "./SuccessBanner";
import { InvoiceActionsBar } from "./InvoiceActionsBar";
import { InvoiceEmailStatus } from "./InvoiceEmailStatus";
import { InvoiceHeaderSection } from "./InvoiceHeaderSection";
import { BillToSection } from "./BillToSection";
import { InvoiceDescriptionSection } from "./InvoiceDescriptionSection";
import { InvoiceItemsTable } from "./InvoiceItemsTable";
import { InvoiceNotesSection } from "./InvoiceNotesSection";
import { InvoiceSummarySection } from "./InvoiceSummarySection";
import type {
  BankDetailsDisplay,
  EmailStatusTimelineEntry,
  InvoiceItemRow,
  ParsedBillTo,
} from "./types";

interface InvoiceSuccessViewProps {
  invoice: InvoiceListItem;
  company: BusinessType;
  editMode?: boolean;
  userPlan?: string;
  publicView?: boolean;
}

const parseInvoiceItems = (
  items: InvoiceListItem["items"]
): InvoiceItemRow[] => {
  try {
    if (Array.isArray(items)) {
      return items as InvoiceItemRow[];
    }
    if (typeof items === "string") {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    }
    if (items && typeof items === "object") {
      return Object.values(items) as InvoiceItemRow[];
    }
  } catch (error) {
    console.error("Error parsing items:", error);
  }
  return [];
};

const parseBillTo = (
  billTo: InvoiceListItem["bill_to"]
): ParsedBillTo | null => {
  try {
    if (!billTo) {
      return null;
    }
    if (typeof billTo === "string") {
      const parsed = JSON.parse(billTo);
      return parsed && typeof parsed === "object"
        ? (parsed as ParsedBillTo)
        : null;
    }
    if (typeof billTo === "object") {
      return billTo as ParsedBillTo;
    }
  } catch (error) {
    console.error("Error parsing bill_to:", error);
  }
  return null;
};

const buildBankDetailsDisplay = (rawValue: string): BankDetailsDisplay => {
  const raw = rawValue.trim();
  if (!raw) {
    return { type: "empty" };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const toLabel = (key: string) =>
        key
          .replace(/[_-]+/g, " ")
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/(^|\s)\w/g, (match) => match.toUpperCase());

      const entries = Object.entries(parsed)
        .filter(
          ([, value]) =>
            value !== null && value !== undefined && String(value).trim()
        )
        .map(([key, value]) => ({
          label: toLabel(key),
          value: String(value).trim(),
        }));

      if (entries.length > 0) {
        return { type: "list", entries };
      }
    }
  } catch (error) {
    // ignore JSON parse failures
  }

  return { type: "text", text: raw };
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function InvoiceSuccessView({
  invoice,
  company,
  editMode = false,
  userPlan = "free",
  publicView = false,
}: InvoiceSuccessViewProps) {
  const isEnterprise = userPlan === "enterprise";
  const isPublicView = publicView;
  const [isEditing, setIsEditing] = React.useState(editMode);
  const [status, setStatus] = React.useState<string>(invoice.status || "draft");
  const [saving, setSaving] = React.useState(false);
  const [emailStatus, setEmailStatus] = React.useState<EmailStatusState>(() =>
    toEmailStatusState({
      status: invoice.status,
      email_id: invoice.email_id,
      email_sent_at: invoice.email_sent_at,
      email_delivered: invoice.email_delivered,
      email_delivered_at: invoice.email_delivered_at,
      email_opened: invoice.email_opened,
      email_opened_at: invoice.email_opened_at,
      email_open_count: invoice.email_open_count,
      email_clicked: invoice.email_clicked,
      email_clicked_at: invoice.email_clicked_at,
      email_click_count: invoice.email_click_count,
      email_bounced: invoice.email_bounced,
      email_bounced_at: invoice.email_bounced_at,
      email_complained: invoice.email_complained,
      email_complained_at: invoice.email_complained_at,
    })
  );
  const pollingStateRef = React.useRef<{
    active: boolean;
    timeoutId: ReturnType<typeof setTimeout> | null;
  }>({
    active: false,
    timeoutId: null,
  });

  const mergeEmailStatus = React.useCallback((patch: EmailStatusPatch) => {
    if (!patch) {
      return;
    }

    const nextStatusValue =
      patch.status !== undefined ? (patch.status ?? null) : undefined;

    setEmailStatus((prev) => mergeEmailStatusState(prev, patch));

    if (patch.status !== undefined && nextStatusValue) {
      setStatus(nextStatusValue);
    }
  }, []);

  const fetchLatestEmailStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status !== 404) {
          console.warn("Failed to refresh invoice status", res.statusText);
        }
        return null;
      }

      const payload = (await res.json()) as { invoice?: EmailStatusPatch };

      if (payload?.invoice) {
        mergeEmailStatus(payload.invoice);
        return payload.invoice;
      }
    } catch (error) {
      console.error("Error fetching invoice status:", error);
    }

    return null;
  }, [invoice.id, mergeEmailStatus]);

  const stopStatusPolling = React.useCallback(() => {
    const controller = pollingStateRef.current;
    controller.active = false;
    if (controller.timeoutId) {
      clearTimeout(controller.timeoutId);
      controller.timeoutId = null;
    }
  }, []);

  const startStatusPolling = React.useCallback(() => {
    stopStatusPolling();

    const controller = pollingStateRef.current;
    controller.active = true;
    const startedAt = Date.now();
    const maxDurationMs = 30000;

    const poll = async () => {
      if (!controller.active) {
        return;
      }

      const latest = await fetchLatestEmailStatus();

      if (!controller.active) {
        return;
      }

      if (shouldStopStatusPolling(latest)) {
        stopStatusPolling();
        return;
      }

      if (Date.now() - startedAt >= maxDurationMs) {
        stopStatusPolling();
        return;
      }

      controller.timeoutId = setTimeout(poll, 2000);
    };

    void poll();
  }, [fetchLatestEmailStatus, stopStatusPolling]);

  React.useEffect(() => () => stopStatusPolling(), [stopStatusPolling]);

  const initialBankDetails = React.useMemo(() => {
    if (!invoice.bank_details) {
      return "";
    }
    if (typeof invoice.bank_details === "string") {
      return invoice.bank_details;
    }
    if (typeof invoice.bank_details === "object") {
      const { accountType, accountName, sortCode, accountNumber } =
        invoice.bank_details as Record<string, string>;
      const parts: string[] = [];
      if (accountType) parts.push(`Account Type: ${accountType}`);
      if (accountName) parts.push(`Account Name: ${accountName}`);
      if (sortCode) parts.push(`Sort Code: ${sortCode}`);
      if (accountNumber) parts.push(`Account Number: ${accountNumber}`);
      return parts.join("\n");
    }
    return "";
  }, [invoice.bank_details]);

  const [bankAccountName, setBankAccountName] =
    React.useState(initialBankDetails);
  const [notes, setNotes] = React.useState<string>(invoice.notes || "");
  const [isCompactLayout, setIsCompactLayout] = React.useState(false);

  const normalizedInvoiceCurrency = React.useMemo(
    () => normalizeCurrencyCode(invoice.currency),
    [invoice.currency]
  );

  React.useEffect(() => {
    const updateLayout = () => {
      if (typeof window === "undefined") {
        return;
      }
      setIsCompactLayout(window.innerWidth < 768);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const [desc, setDesc] = React.useState<string>(invoice.description || "");
  const [issueDate, setIssueDate] = React.useState<string>(
    invoice.issue_date || ""
  );
  const [dueDate, setDueDate] = React.useState<string>(invoice.due_date || "");
  const [currency, setCurrency] = React.useState<string>(
    normalizedInvoiceCurrency
  );
  const [discount, setDiscount] = React.useState<number>(
    Number(invoice.discount || 0)
  );
  const [shipping, setShipping] = React.useState<number>(
    Number(invoice.shipping || 0)
  );
  const [itemRows, setItemRows] = React.useState<InvoiceItemRow[]>(() =>
    parseInvoiceItems(invoice.items)
  );

  const updateItem = React.useCallback(
    (index: number, patch: Partial<InvoiceItemRow>) => {
      setItemRows((prev) =>
        prev.map((item, current) =>
          current === index ? { ...item, ...patch } : item
        )
      );
    },
    []
  );

  const addItem = React.useCallback(() => {
    setItemRows((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0, tax: 0, amount: 0 },
    ]);
  }, []);

  const removeItem = React.useCallback((index: number) => {
    setItemRows((prev) => prev.filter((_, current) => current !== index));
  }, []);

  const recalcAmounts = React.useCallback(() => {
    setItemRows((prev) =>
      prev.map((item) => {
        const qty = Number(item.quantity || 0);
        const price = Number(item.unit_price || 0);
        const taxValue = Number(item.tax || 0);
        const base = qty * price;
        const total = base + (base * taxValue) / 100;
        return { ...item, amount: Number.isFinite(total) ? Number(total) : 0 };
      })
    );
  }, []);

  const resetFieldsFromInvoice = React.useCallback(() => {
    setStatus(invoice.status || "draft");
    let bankText = "";
    if (invoice.bank_details) {
      if (typeof invoice.bank_details === "string") {
        bankText = invoice.bank_details;
      } else if (typeof invoice.bank_details === "object") {
        const { accountType, accountName, sortCode, accountNumber } =
          invoice.bank_details as Record<string, string>;
        const parts: string[] = [];
        if (accountType) parts.push(`Account Type: ${accountType}`);
        if (accountName) parts.push(`Account Name: ${accountName}`);
        if (sortCode) parts.push(`Sort Code: ${sortCode}`);
        if (accountNumber) parts.push(`Account Number: ${accountNumber}`);
        bankText = parts.join("\n");
      }
    }
    setBankAccountName(bankText);
    setNotes(invoice.notes || "");
    setDesc(invoice.description || "");
    setIssueDate(invoice.issue_date || "");
    setDueDate(invoice.due_date || "");
    setCurrency(normalizedInvoiceCurrency);
    setDiscount(Number(invoice.discount || 0));
    setShipping(Number(invoice.shipping || 0));
    setItemRows(parseInvoiceItems(invoice.items));
  }, [invoice, normalizedInvoiceCurrency]);

  const handleCurrencyChange = React.useCallback((value: string) => {
    setCurrency(normalizeCurrencyCode(value));
  }, []);

  const enterEditMode = React.useCallback(() => {
    setIsEditing(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("edit", "1");
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Failed to update URL for edit mode", error);
    }
  }, []);

  const cancelEdit = React.useCallback(() => {
    resetFieldsFromInvoice();
    setIsEditing(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Failed to reset URL", error);
    }
  }, [resetFieldsFromInvoice]);

  const saveChanges = React.useCallback(async () => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        invoiceId: invoice.id,
        bank_details: bankAccountName.trim(),
        notes: notes.trim(),
        status,
      };
      if (isEnterprise) {
        payload.description = desc;
        payload.issue_date = issueDate;
        payload.due_date = dueDate;
        payload.currency = currency;
        payload.discount = discount;
        payload.shipping = shipping;
        payload.items = JSON.stringify(itemRows);
      }
      const res = await fetch("/api/invoices/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save");
      }
      toast.success("Invoice updated");
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.location.href = url.toString();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save changes";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [
    bankAccountName,
    currency,
    desc,
    discount,
    dueDate,
    invoice.id,
    isEnterprise,
    issueDate,
    itemRows,
    notes,
    shipping,
    status,
  ]);

  const [showSuccess, setShowSuccess] = React.useState(!isPublicView);
  const [downloading, setDownloading] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const items = React.useMemo(
    () => parseInvoiceItems(invoice.items),
    [invoice.items]
  );
  const billTo = React.useMemo(
    () => parseBillTo(invoice.bill_to),
    [invoice.bill_to]
  );

  const copyPublicLink = React.useCallback(() => {
    if (!invoice.public_token) {
      toast.error("Public link unavailable. Try sending the invoice first.");
      return;
    }
    const publicUrl = `${window.location.origin}/invoice/${invoice.public_token}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        toast.success("Public invoice link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  }, [invoice.public_token]);

  const downloadPDF = React.useCallback(async () => {
    try {
      setDownloading(true);
      const container = document.getElementById(
        "invoice-capture"
      ) as HTMLElement | null;

      if (!container) {
        const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
        if (!res.ok) {
          throw new Error("Could not generate PDF");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded");
        return;
      }

      const html = document.documentElement;
      const body = document.body;
      const originalHtmlClass = html.className;
      const originalBodyBg = body.style.backgroundColor;
      const originalBodyColor = body.style.color;
      const originalContainerBg = container.style.backgroundColor;
      const originalContainerColor = container.style.color;

      html.classList.remove("dark");
      body.style.backgroundColor = "#ffffff";
      body.style.color = "#000000";
      container.style.backgroundColor = "#ffffff";
      container.style.color = "#000000";

      const allElements = container.querySelectorAll("*");
      const originalStyles: Array<{
        el: HTMLElement;
        bg: string;
        color: string;
      }> = [];

      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const isDarkDesign =
          htmlElement.classList.contains("bg-gray-800") ||
          htmlElement.classList.contains("bg-gray-900");
        if (!isDarkDesign) {
          originalStyles.push({
            el: htmlElement,
            bg: htmlElement.style.backgroundColor,
            color: htmlElement.style.color,
          });
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (isPublicView) {
        const originalBorder = container.style.border;
        const originalShadow = container.style.boxShadow;
        const originalBackground = container.style.background;
        const originalPadding = container.style.padding;
        container.style.border = "none";
        container.style.boxShadow = "none";
        container.style.background = "#ffffff";
        if (!originalPadding) {
          container.style.padding = "48px";
        }

        try {
          await downloadElementAsPDF(container, {
            filename: `Invoice-${invoice.invoice_number || "unnamed"}.pdf`,
            margin: 40,
            scale: 3,
            format: "a4",
          });
          toast.success("PDF downloaded");
        } finally {
          container.style.border = originalBorder;
          container.style.boxShadow = originalShadow;
          container.style.background = originalBackground;
          if (!originalPadding) {
            container.style.removeProperty("padding");
          } else {
            container.style.padding = originalPadding;
          }
          html.className = originalHtmlClass;
          body.style.backgroundColor = originalBodyBg;
          body.style.color = originalBodyColor;
          container.style.backgroundColor = originalContainerBg;
          container.style.color = originalContainerColor;
          originalStyles.forEach(({ el, bg, color }) => {
            el.style.backgroundColor = bg;
            el.style.color = color;
          });
        }
      } else {
        try {
          await downloadElementAsPDF(container, {
            filename: `Invoice-${invoice.invoice_number || "unnamed"}.pdf`,
            margin: 8,
            scale: 3,
            format: "a4",
          });
          toast.success("PDF downloaded");
        } finally {
          html.className = originalHtmlClass;
          body.style.backgroundColor = originalBodyBg;
          body.style.color = originalBodyColor;
          container.style.backgroundColor = originalContainerBg;
          container.style.color = originalContainerColor;
          originalStyles.forEach(({ el, bg, color }) => {
            el.style.backgroundColor = bg;
            el.style.color = color;
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to generate PDF: ${message}`);
    } finally {
      setDownloading(false);
    }
  }, [invoice.id, invoice.invoice_number, isPublicView]);

  const sendToClient = React.useCallback(async () => {
    try {
      setSending(true);

      const response = await fetch("/api/invoices/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          businessId: company.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invoice");
      }

      toast.success(data.message || "Invoice sent successfully!");

      mergeEmailStatus({
        status: (data.updatedStatus as string | null) || "sent",
        email_id: (data.emailId as string | null) ?? emailStatus.email_id,
        email_sent_at: new Date().toISOString(),
        email_delivered: null,
        email_delivered_at: null,
        email_opened: null,
        email_opened_at: null,
        email_open_count: 0,
        email_clicked: null,
        email_clicked_at: null,
        email_click_count: 0,
        email_bounced: null,
        email_bounced_at: null,
        email_complained: null,
        email_complained_at: null,
      });

      startStatusPolling();
    } catch (error) {
      console.error("Error sending invoice:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send invoice to client";
      toast.error(message);
    } finally {
      setSending(false);
    }
  }, [
    company.id,
    emailStatus.email_id,
    invoice.id,
    mergeEmailStatus,
    startStatusPolling,
  ]);

  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("download") === "1") {
        url.searchParams.delete("download");
        window.history.replaceState({}, "", url.toString());
        setTimeout(() => {
          void downloadPDF();
        }, 600);
      }
    } catch (error) {
      console.error("Failed to process download param", error);
    }
  }, [downloadPDF]);

  React.useEffect(() => {
    if (isPublicView) {
      setShowSuccess(false);
      return;
    }
    try {
      const key = `invoice_${invoice?.id}_shown`;
      const alreadyShown = localStorage.getItem(key);
      if (alreadyShown) {
        setShowSuccess(false);
      } else {
        setShowSuccess(true);
        localStorage.setItem(key, "1");
      }
    } catch (error) {
      console.error("Failed to read success flag", error);
    }
  }, [invoice?.id, isPublicView]);

  const baseInvoiceContainerClass = isCompactLayout
    ? "w-full max-w-none bg-white px-4 py-6 sm:px-6 sm:py-8 rounded-xl"
    : "mx-auto w-full max-w-[794px] bg-white px-8 py-10 sm:px-12 sm:py-12 rounded-2xl";
  const invoiceContainerClass = isPublicView
    ? `${baseInvoiceContainerClass} ${isCompactLayout ? "shadow-md" : "shadow-lg"}`
    : `${baseInvoiceContainerClass} ${isCompactLayout ? "shadow-lg" : "shadow-xl"}`;

  const rawDescription = (invoice.description || "").trim();
  const isDefaultDescription =
    rawDescription.length === 0 ||
    rawDescription.toLowerCase() === "new invoice";
  const currentDescription = (isEditing ? desc : rawDescription).trim();
  const shouldRenderDescription =
    (isEditing && isEnterprise) ||
    (!isDefaultDescription && currentDescription.length > 0);

  const bankDetailsDisplay = React.useMemo<BankDetailsDisplay>(
    () => buildBankDetailsDisplay(bankAccountName),
    [bankAccountName]
  );

  const emailBadges = React.useMemo(
    () => buildEmailStatusBadges(emailStatus),
    [emailStatus]
  );
  const emailTimeline = React.useMemo<EmailStatusTimelineEntry[]>(
    () => [
      { label: "Sent", value: formatDateTime(emailStatus.email_sent_at) },
      {
        label: "Delivered",
        value: formatDateTime(emailStatus.email_delivered_at),
      },
      {
        label: "Last opened",
        value: formatDateTime(emailStatus.email_opened_at),
      },
      {
        label: "Last clicked",
        value: formatDateTime(emailStatus.email_clicked_at),
      },
      { label: "Bounced", value: formatDateTime(emailStatus.email_bounced_at) },
      { label: "Spam", value: formatDateTime(emailStatus.email_complained_at) },
    ],
    [emailStatus]
  );

  return (
    <main
      className={`relative w-full min-h-[100vh] ${
        isPublicView ? "py-12 bg-gray-50 dark:bg-slate-900" : "pt-24 md:pt-28"
      }`}
    >
      {!isPublicView && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-0" />
          <div className="absolute top-20 right-10 md:right-40 w-64 md:w-96 h-64 md:h-96 rounded-full bg-green-100/40 dark:bg-green-900/20 mix-blend-multiply blur-3xl"></div>
        </>
      )}

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {!isPublicView && (
          <SuccessBanner
            invoiceNumber={invoice.invoice_number}
            visible={showSuccess}
          />
        )}

        <Card className="shadow-2xl border-0">
          {!isPublicView && (
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-slate-700">
              <InvoiceActionsBar
                isEditing={isEditing}
                status={status}
                onStatusChange={setStatus}
                onSave={saveChanges}
                saving={saving}
                onCancel={cancelEdit}
                onEdit={enterEditMode}
                onCopyPublicLink={copyPublicLink}
                hasPublicLink={Boolean(invoice.public_token)}
                onSendToClient={sendToClient}
                sending={sending}
                onDownloadPDF={downloadPDF}
                downloading={downloading}
              />
            </CardHeader>
          )}

          {!isPublicView && (
            <div className="px-6 pt-4 pb-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <InvoiceEmailStatus
                badges={emailBadges}
                timeline={emailTimeline}
              />
            </div>
          )}

          <CardContent
            className="bg-white p-4 sm:p-6"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              padding: isCompactLayout ? "16px" : "24px",
            }}
          >
            {isPublicView && (
              <div className="flex justify-end mb-6">
                <Button
                  onClick={downloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                  disabled={downloading}
                >
                  {downloading ? "Generating…" : "Download PDF"}
                </Button>
              </div>
            )}
            <div
              id="invoice-capture"
              className={invoiceContainerClass}
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              <InvoiceHeaderSection
                company={company}
                invoice={invoice}
                isEditing={isEditing}
                isEnterprise={isEnterprise}
                issueDate={issueDate}
                onIssueDateChange={setIssueDate}
                dueDate={dueDate}
                onDueDateChange={setDueDate}
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
                currencies={currencies}
                isCompactLayout={isCompactLayout}
              />

              <BillToSection billTo={billTo} />

              <InvoiceDescriptionSection
                isEditing={isEditing}
                isEnterprise={isEnterprise}
                description={isEditing ? desc : currentDescription}
                onChange={setDesc}
                shouldRender={shouldRenderDescription}
                fallbackText="No description"
              />

              <InvoiceItemsTable
                isEditing={isEditing}
                isEnterprise={isEnterprise}
                itemRows={itemRows}
                items={items}
                onItemChange={updateItem}
                onItemRemove={removeItem}
                onAddItem={addItem}
                onRecalculate={recalcAmounts}
                currency={currency}
                invoiceCurrency={normalizedInvoiceCurrency}
                getCurrencySymbol={getCurrencySymbol}
                isCompactLayout={isCompactLayout}
                taxLabel={company.tax_label || "VAT"}
              />

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6"
                style={{
                  display: "grid",
                  gridTemplateColumns: isCompactLayout ? "1fr" : "1fr 1fr",
                  gap: isCompactLayout ? "20px" : "24px",
                  paddingTop: "24px",
                }}
              >
                <InvoiceNotesSection
                  isEditing={isEditing}
                  bankDetails={bankAccountName}
                  onBankDetailsChange={setBankAccountName}
                  bankDetailsDisplay={bankDetailsDisplay}
                  notes={notes}
                  onNotesChange={setNotes}
                  invoiceNotes={invoice.notes || ""}
                />

                <InvoiceSummarySection
                  isEditing={isEditing}
                  isEnterprise={isEnterprise}
                  itemRows={itemRows}
                  shipping={shipping}
                  onShippingChange={setShipping}
                  discount={discount}
                  onDiscountChange={setDiscount}
                  currency={currency}
                  invoice={invoice}
                  getCurrencySymbol={getCurrencySymbol}
                  isCompactLayout={isCompactLayout}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <style jsx global>{`
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-capture,
            #invoice-capture * {
              visibility: visible;
            }
            #invoice-capture {
              position: absolute;
              left: 0;
              top: 0;
              width: calc(100% - 24mm);
              margin: 0 auto;
              padding: 12mm;
              background: white !important;
              color: black !important;
              border: none !important;
              box-shadow: none !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>

        {!isPublicView && (
          <div className="flex gap-4 justify-center pt-6">
            <Link
              href={`/dashboard/business?business_id=${company.id}&name=${encodeURIComponent(company.name)}`}
            >
              <CustomButton
                label="Back to Dashboard"
                icon={ArrowLeft}
                variant="secondary"
              />
            </Link>
            <Link href={`/dashboard/invoices?business_id=${company.id}`}>
              <CustomButton label="View All Invoices" variant="primary" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
