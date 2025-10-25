"use client";
import * as React from "react";
import {
  CheckCircle,
  Download,
  ArrowLeft,
  FileText,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/ui/CustomButton";
import { downloadElementAsPDF } from "@/lib/pdf";
import type { InvoiceListItem, BusinessType } from "@/types";
import { Badge } from "@/components/ui/badge";
import currencies from "@/lib/currencies.json";

interface InvoiceSuccessViewProps {
  invoice: InvoiceListItem;
  company: BusinessType;
  editMode?: boolean;
  userPlan?: string;
  publicView?: boolean;
}

export default function InvoiceSuccessView({
  invoice,
  company,
  editMode = false,
  userPlan = "free",
  publicView = false,
}: InvoiceSuccessViewProps) {
  const router = useRouter();
  const isEnterprise = userPlan === "enterprise";
  const isPublicView = publicView;
  const [isEditing, setIsEditing] = React.useState(editMode);
  const [status, setStatus] = React.useState<string>(invoice.status || "draft");
  const [saving, setSaving] = React.useState(false);

  // Parse bank_details from invoice - now just a simple text field
  const initialBankDetails = (() => {
    if (!invoice.bank_details) return "";
    if (typeof invoice.bank_details === "string") {
      return invoice.bank_details;
    }
    if (typeof invoice.bank_details === "object") {
      // Legacy structured format - convert to plain text
      const { accountType, accountName, sortCode, accountNumber } =
        invoice.bank_details as any;
      const parts = [];
      if (accountType) parts.push(`Account Type: ${accountType}`);
      if (accountName) parts.push(`Account Name: ${accountName}`);
      if (sortCode) parts.push(`Sort Code: ${sortCode}`);
      if (accountNumber) parts.push(`Account Number: ${accountNumber}`);
      return parts.join("\n");
    }
    return "";
  })();
  const [bankAccountName, setBankAccountName] =
    React.useState<string>(initialBankDetails);
  const [notes, setNotes] = React.useState<string>(invoice.notes || "");
  // Currency helper - now uses the comprehensive currency list
  const getCurrencySymbol = (code?: string) => {
    const currencyCode = (code || "GBP").toUpperCase();
    const currency = currencies.find((c) => c.code === currencyCode);
    return currency ? currency.symbol : "£";
  };

  type BankDetailsDisplay =
    | { type: "empty" }
    | { type: "text"; text: string }
    | { type: "list"; entries: { label: string; value: string }[] };

  const bankDetailsDisplay = React.useMemo<BankDetailsDisplay>(() => {
    const raw = bankAccountName?.trim();
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
            ([_, value]) =>
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
      // Ignore JSON parse failures and fall back to raw text rendering.
    }

    return { type: "text", text: raw };
  }, [bankAccountName]);

  // Enterprise: editable items and meta
  const [desc, setDesc] = React.useState<string>(invoice.description || "");
  const [issueDate, setIssueDate] = React.useState<string>(
    invoice.issue_date || ""
  );
  const [dueDate, setDueDate] = React.useState<string>(invoice.due_date || "");
  const [currency, setCurrency] = React.useState<string>(
    invoice.currency || "GBP"
  );
  const [discount, setDiscount] = React.useState<number>(
    Number(invoice.discount || 0)
  );
  const [shipping, setShipping] = React.useState<number>(
    Number(invoice.shipping || 0)
  );
  const [itemRows, setItemRows] = React.useState<any[]>(() => {
    try {
      if (Array.isArray(invoice.items)) return invoice.items as any[];
      if (typeof invoice.items === "string")
        return JSON.parse(invoice.items) || [];
      if (invoice.items && typeof invoice.items === "object")
        return Object.values(invoice.items);
    } catch {}
    return [];
  });

  const updateItem = (index: number, patch: Partial<any>) => {
    setItemRows((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  };
  const addItem = () =>
    setItemRows((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0, tax: 0, amount: 0 },
    ]);
  const removeItem = (index: number) =>
    setItemRows((prev) => prev.filter((_, i) => i !== index));

  const recalcAmounts = () => {
    setItemRows((prev) =>
      prev.map((it) => {
        const qty = Number(it.quantity || 0);
        const price = Number(it.unit_price || 0);
        const tax = Number(it.tax || 0);
        const base = qty * price;
        const total = base + (base * tax) / 100;
        return { ...it, amount: Number.isFinite(total) ? Number(total) : 0 };
      })
    );
  };

  const resetFieldsFromInvoice = () => {
    setStatus(invoice.status || "draft");
    // Reset bank details
    let bankText = "";
    if (invoice.bank_details) {
      if (typeof invoice.bank_details === "string") {
        bankText = invoice.bank_details;
      } else if (typeof invoice.bank_details === "object") {
        // Legacy structured format - convert to plain text
        const { accountType, accountName, sortCode, accountNumber } =
          invoice.bank_details as any;
        const parts = [];
        if (accountType) parts.push(`Account Type: ${accountType}`);
        if (accountName) parts.push(`Account Name: ${accountName}`);
        if (sortCode) parts.push(`Sort Code: ${sortCode}`);
        if (accountNumber) parts.push(`Account Number: ${accountNumber}`);
        bankText = parts.join("\n");
      }
    }
    setBankAccountName(bankText);
    setNotes(invoice.notes || "");
    // Enterprise fields
    setDesc(invoice.description || "");
    setIssueDate(invoice.issue_date || "");
    setDueDate(invoice.due_date || "");
    setCurrency(invoice.currency || "GBP");
    setDiscount(Number(invoice.discount || 0));
    setShipping(Number(invoice.shipping || 0));
    try {
      if (Array.isArray(invoice.items)) setItemRows(invoice.items as any[]);
      else if (typeof invoice.items === "string")
        setItemRows(JSON.parse(invoice.items) || []);
      else if (invoice.items && typeof invoice.items === "object")
        setItemRows(Object.values(invoice.items));
      else setItemRows([]);
    } catch {
      setItemRows([]);
    }
  };

  const enterEditMode = () => {
    setIsEditing(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("edit", "1");
      window.history.replaceState({}, "", url.toString());
    } catch {}
  };

  const cancelEdit = () => {
    resetFieldsFromInvoice();
    setIsEditing(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.history.replaceState({}, "", url.toString());
    } catch {}
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const payload: any = {
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
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      toast.success("Invoice updated");
      // refresh view: remove edit=1 from URL and reload
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.location.href = url.toString();
    } catch (e: any) {
      toast.error(e?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };
  const [showSuccess, setShowSuccess] = React.useState(!isPublicView);
  // Parse items safely
  let items: any[] = [];
  try {
    if (Array.isArray(invoice.items)) {
      items = invoice.items;
    } else if (typeof invoice.items === "string") {
      items = JSON.parse(invoice.items);
    } else if (invoice.items && typeof invoice.items === "object") {
      items = Object.values(invoice.items);
    }
  } catch (error) {
    console.error("Error parsing items:", error);
    items = [];
  }

  // Parse bill_to safely
  let billTo = null;
  try {
    if (typeof invoice.bill_to === "string") {
      billTo = JSON.parse(invoice.bill_to);
    } else if (invoice.bill_to && typeof invoice.bill_to === "object") {
      billTo = invoice.bill_to;
    }
  } catch (error) {
    console.error("Error parsing bill_to:", error);
    billTo = null;
  }

  const [downloading, setDownloading] = React.useState(false);
  const [serverGenerating, setServerGenerating] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  // Print is intentionally removed — prefer client-side PDF download

  const baseInvoiceContainerClass =
    "mx-auto w-full max-w-[794px] bg-white px-8 py-10 sm:px-12 sm:py-12 rounded-2xl";
  const invoiceContainerClass = isPublicView
    ? `${baseInvoiceContainerClass} shadow-lg`
    : `${baseInvoiceContainerClass} shadow-xl`;

  // Helper to determine if we should show the description section
  const rawDescription = (invoice.description || "").trim();
  const isDefaultDescription =
    rawDescription.length === 0 ||
    rawDescription.toLowerCase() === "new invoice";
  const currentDescription = (isEditing ? desc : rawDescription).trim();
  const shouldRenderDescription =
    (isEditing && isEnterprise) ||
    (!isDefaultDescription && currentDescription.length > 0);

  const copyPublicLink = () => {
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
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);

      // Capture the CardContent which has the full invoice with padding
      const container = document.getElementById(
        "invoice-capture"
      ) as HTMLElement | null;

      if (!container) {
        // No container, try server as last resort
        const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
        if (!res.ok) throw new Error("Could not generate PDF");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded");
        return;
      }

      // Force the entire document to light mode temporarily for PDF capture
      const html = document.documentElement;
      const body = document.body;
      const originalHtmlClass = html.className;
      const originalBodyBg = body.style.backgroundColor;
      const originalBodyColor = body.style.color;
      const originalContainerBg = container.style.backgroundColor;
      const originalContainerColor = container.style.color;

      // Remove dark class and force light styling
      html.classList.remove("dark");
      body.style.backgroundColor = "#ffffff";
      body.style.color = "#000000";
      container.style.backgroundColor = "#ffffff";
      container.style.color = "#000000";

      // Force all elements in container to light mode
      const allElements = container.querySelectorAll("*");
      const originalStyles: Array<{
        el: HTMLElement;
        bg: string;
        color: string;
      }> = [];

      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Skip intentionally dark elements (table headers, summary boxes)
        const isDarkDesign =
          htmlEl.classList.contains("bg-gray-800") ||
          htmlEl.classList.contains("bg-gray-900");
        if (!isDarkDesign) {
          originalStyles.push({
            el: htmlEl,
            bg: htmlEl.style.backgroundColor,
            color: htmlEl.style.color,
          });
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Only strip decorative chrome on public view PDFs
      if (isPublicView) {
        const originalInlineBorder = container.style.border;
        const originalInlineShadow = container.style.boxShadow;
        const originalInlineBackground = container.style.background;
        const originalInlinePadding = container.style.padding;
        container.style.border = "none";
        container.style.boxShadow = "none";
        container.style.background = "#ffffff";
        if (!originalInlinePadding) {
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
          container.style.border = originalInlineBorder;
          container.style.boxShadow = originalInlineShadow;
          container.style.background = originalInlineBackground;
          if (!originalInlinePadding) {
            container.style.removeProperty("padding");
          } else {
            container.style.padding = originalInlinePadding;
          }
          // Restore all original styles
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
          // Restore all original styles
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
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Failed to generate PDF: ${msg}`);
    } finally {
      setDownloading(false);
    }
  };

  const sendToClient = async () => {
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

      // Wait 2 seconds for webhook to process, then force refresh
      setTimeout(() => {
        if (router) {
          router.refresh();
        }
        // Also reload the page to ensure fresh data
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error sending invoice:", error);
      toast.error(error.message || "Failed to send invoice to client");
    } finally {
      setSending(false);
    }
  };

  // Top actions: when editing, show status selector and save/cancel

  const downloadServerPDF = async () => {
    try {
      setServerGenerating(true);
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (!res.ok) throw new Error(`Server PDF failed: ${await res.text()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Server PDF downloaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
    } finally {
      setServerGenerating(false);
    }
  };

  // Auto-download when navigated with ?download=1
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("download") === "1") {
        // Remove the download parameter to prevent re-downloading
        url.searchParams.delete("download");
        window.history.replaceState({}, "", url.toString());

        // Give the preview a moment to render and images to settle
        setTimeout(() => {
          downloadPDF();
        }, 600);
      }
    } catch (e) {
      // no-op
    }
  }, []);

  // Show success banner only once per invoice id
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
    } catch (_) {
      // ignore storage errors
    }
  }, [invoice?.id]);

  // Build a minimal printable DOM (hidden) to capture for clean PDF output
  const PrintableInvoice = () => (
    <div
      id="invoice-printable"
      style={{
        position: "fixed",
        left: -10000,
        top: 0,
        width: "210mm",
        minHeight: "297mm",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "297mm",
          padding: "18mm 20mm",
          background: "#fff",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Header - Matches visible invoice design */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <div style={{ flex: 1 }}>
            {company?.logo && (
              <div style={{ marginBottom: 16 }}>
                <img
                  src={company.logo}
                  alt="Company Logo"
                  style={{
                    maxWidth: "220px",
                    maxHeight: "100px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <h2
              style={{
                fontSize: 20,
                fontWeight: "bold",
                margin: "0 0 8px 0",
                color: "#111827",
              }}
            >
              {company?.name}
            </h2>
            <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
              {company?.address && (
                <div style={{ marginBottom: 2, whiteSpace: "pre-line" }}>
                  {company.address}
                </div>
              )}
              {company?.email && <div>{company.email}</div>}
              {company?.phone && <div>{company.phone}</div>}
              {company?.vat && <div>VAT: {company.vat}</div>}
            </div>
          </div>

          <div style={{ textAlign: "right", minWidth: "250px" }}>
            <h1
              style={{
                fontSize: 48,
                fontWeight: "bold",
                margin: "0 0 24px 0",
                color: "#111827",
                letterSpacing: "-0.5px",
              }}
            >
              INVOICE
            </h1>
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "16px",
                fontSize: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  Invoice #
                </span>
                <span style={{ fontWeight: "bold", color: "#111827" }}>
                  {invoice.invoice_number || "N/A"}
                </span>
              </div>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#e5e7eb",
                  margin: "8px 0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 600, color: "#374151" }}>Date</span>
                <span style={{ color: "#111827" }}>
                  {invoice.issue_date
                    ? new Date(invoice.issue_date).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  Due Date
                </span>
                <span style={{ color: "#111827" }}>
                  {new Date(invoice.due_date).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To - Matches visible invoice design */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: "bold",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 12,
            }}
          >
            Bill To
          </div>
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              {billTo?.name || "Client"}
            </div>
            {billTo?.address && (
              <div
                style={{
                  fontSize: 14,
                  color: "#4b5563",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                }}
              >
                {billTo.address}
              </div>
            )}
            {billTo?.email && (
              <div style={{ fontSize: 14, color: "#4b5563", marginTop: 4 }}>
                {billTo.email}
              </div>
            )}
          </div>
        </div>

        {/* Items Table - Matches visible invoice design */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 24,
            border: "2px solid #1f2937",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1f2937", color: "#fff" }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: "bold",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: "bold",
                  width: "80px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontSize: 11,
                  fontWeight: "bold",
                  width: "112px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Unit Price
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: "bold",
                  width: "80px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Tax
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontSize: 11,
                  fontWeight: "bold",
                  width: "128px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr
                key={idx}
                style={{
                  borderBottom:
                    idx < items.length - 1 ? "1px solid #f3f4f6" : "none",
                  backgroundColor: "#fff",
                }}
              >
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    color: "#111827",
                  }}
                >
                  {item.description || "-"}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 14,
                    color: "#111827",
                  }}
                >
                  {item.quantity || 0}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontSize: 14,
                    color: "#111827",
                  }}
                >
                  {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                  {Number(item.unit_price || 0).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 14,
                    color: "#111827",
                  }}
                >
                  {item.tax || 0}%
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                  {Number(item.amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Section: Bank Details, Notes & Summary - Matches visible invoice */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          {/* Left Column: Bank Details & Notes */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#6b7280",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Bank Details
              </h4>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: 12,
                  fontSize: 14,
                  color: "#111827",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                }}
              >
                {bankAccountName || "No bank details provided"}
              </div>
            </div>
            <div>
              <h4
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#6b7280",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Notes & Terms
              </h4>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: 12,
                  fontSize: 14,
                  color: "#111827",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                }}
              >
                {invoice.notes || "No additional notes"}
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Summary */}
          <div>
            <div
              style={{
                backgroundColor: "#fff",
                border: "2px solid #1f2937",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div style={{ backgroundColor: "#1f2937", padding: "12px 20px" }}>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#fff",
                    margin: 0,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Invoice Summary
                </h4>
              </div>
              <div style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 8,
                    marginBottom: 8,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#4b5563" }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                    {Number(invoice.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 8,
                    marginBottom: 8,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#4b5563" }}
                  >
                    Shipping
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                    {Number(invoice.shipping || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 8,
                    marginBottom: 8,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#4b5563" }}
                  >
                    Discount
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    {invoice.discount || 0}%
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: "#1f2937",
                    borderRadius: "8px",
                    padding: "16px",
                    marginTop: 12,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: "bold",
                          color: "#fff",
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                        }}
                      >
                        Total Amount
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: "bold",
                          color: "#fff",
                        }}
                      >
                        {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                        {Number(invoice.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        {/* Success Header - show only first time for this invoice */}
        {!isPublicView && showSuccess && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 dark:bg-green-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-300 mb-2">
                    Invoice Created Successfully!
                  </h1>
                  <p className="text-green-700 dark:text-green-400 text-base md:text-lg">
                    Invoice #{invoice.invoice_number || "N/A"} has been saved
                    and is ready to use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Preview */}
        <Card className="shadow-2xl border-0">
          {!isPublicView && (
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                      Invoice Preview
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Review your invoice details
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-100"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <Button
                        onClick={saveChanges}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? "Saving…" : "Save Changes"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={cancelEdit}
                        className="dark:bg-slate-700 dark:hover:bg-slate-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        onClick={enterEditMode}
                        className="dark:bg-slate-700 dark:hover:bg-slate-600"
                      >
                        Edit Invoice
                      </Button>
                      {invoice.public_token && (
                        <Button
                          onClick={copyPublicLink}
                          variant="secondary"
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                        >
                          Copy Public Link
                        </Button>
                      )}
                      <Button
                        onClick={sendToClient}
                        className="bg-green-600 hover:bg-green-700 shadow-lg"
                        disabled={sending}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {sending ? "Sending…" : "Send to Client"}
                      </Button>
                      <Button
                        onClick={downloadPDF}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                        disabled={downloading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloading ? "Generating…" : "Download PDF"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          )}

          {!isPublicView && (
            <div className="px-6 pt-4 pb-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {invoice.email_sent_at && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Sent
                    </Badge>
                  )}
                  {invoice.email_delivered && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Delivered
                    </Badge>
                  )}
                  {invoice.email_open_count ? (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      Opened {invoice.email_open_count}
                    </Badge>
                  ) : invoice.email_opened ? (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      Opened 1
                    </Badge>
                  ) : null}
                  {invoice.email_click_count ? (
                    <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                      Clicked {invoice.email_click_count}
                    </Badge>
                  ) : invoice.email_clicked ? (
                    <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                      Clicked 1
                    </Badge>
                  ) : null}
                  {invoice.email_bounced && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Bounced
                    </Badge>
                  )}
                  {invoice.email_complained && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Marked as spam
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                  {invoice.email_sent_at && (
                    <span>Sent: {formatDateTime(invoice.email_sent_at)}</span>
                  )}
                  {invoice.email_delivered_at && (
                    <span>
                      Delivered: {formatDateTime(invoice.email_delivered_at)}
                    </span>
                  )}
                  {invoice.email_opened_at && (
                    <span>
                      Last opened: {formatDateTime(invoice.email_opened_at)}
                    </span>
                  )}
                  {invoice.email_clicked_at && (
                    <span>
                      Last clicked: {formatDateTime(invoice.email_clicked_at)}
                    </span>
                  )}
                  {invoice.email_bounced_at && (
                    <span>
                      Bounced: {formatDateTime(invoice.email_bounced_at)}
                    </span>
                  )}
                  {invoice.email_complained_at && (
                    <span>
                      Spam: {formatDateTime(invoice.email_complained_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <CardContent
            className="p-6 bg-white"
            style={{
              height: "auto",
              backgroundColor: "#ffffff",
              color: "#000000",
              padding: "24px",
            }}
          >
            {isPublicView && (
              <div className="flex justify-end mb-6">
                <Button
                  onClick={downloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                  disabled={downloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Generating…" : "Download PDF"}
                </Button>
              </div>
            )}
            <div
              id="invoice-capture"
              className={invoiceContainerClass}
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              {/* Redesigned Header - Clean and Balanced */}
              <div
                className="mb-6 pb-6 border-b-2 border-gray-200"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "32px",
                  marginBottom: "24px",
                  paddingBottom: "24px",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                {/* Left: Company Info */}
                <div className="flex-1" style={{ flex: 1 }}>
                  {company.logo && (
                    <div
                      className="mb-4"
                      style={{
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      <Image
                        src={company.logo}
                        alt="Company Logo"
                        width={220}
                        height={100}
                        className="object-contain object-left"
                        style={{
                          maxWidth: "220px",
                          maxHeight: "100px",
                          objectFit: "contain",
                          objectPosition: "left center",
                        }}
                      />
                    </div>
                  )}
                  <h2
                    className="text-xl font-bold text-gray-900 mb-2"
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {company.name}
                  </h2>
                  <div
                    className="text-sm text-gray-600 space-y-0.5"
                    style={{
                      fontSize: "14px",
                      color: "#4b5563",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {company.address && (
                      <p
                        className="whitespace-pre-line leading-relaxed"
                        style={{ whiteSpace: "pre-line", marginBottom: "2px" }}
                      >
                        {company.address}
                      </p>
                    )}
                    {company.email && (
                      <p style={{ marginBottom: "2px" }}>{company.email}</p>
                    )}
                    {company.phone && (
                      <p style={{ marginBottom: "2px" }}>{company.phone}</p>
                    )}
                    {company.vat && (
                      <p style={{ marginBottom: "2px" }}>VAT: {company.vat}</p>
                    )}
                  </div>
                </div>

                {/* Right: Invoice Title & Meta */}
                <div
                  className="text-right"
                  style={{ textAlign: "right", minWidth: "250px" }}
                >
                  <h1
                    className="text-5xl font-bold text-gray-900 mb-6 tracking-tight"
                    style={{
                      fontSize: "48px",
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: "24px",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    INVOICE
                  </h1>
                  <div
                    className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm"
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      padding: "16px",
                      fontSize: "14px",
                    }}
                  >
                    <div
                      className="flex justify-between items-center"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        className="font-semibold text-gray-700"
                        style={{ fontWeight: 600, color: "#374151" }}
                      >
                        Invoice #
                      </span>
                      <span
                        className="font-bold text-gray-900"
                        style={{ fontWeight: "bold", color: "#111827" }}
                      >
                        {invoice.invoice_number || "N/A"}
                      </span>
                    </div>
                    <div
                      className="h-px bg-gray-200"
                      style={{
                        height: "1px",
                        backgroundColor: "#e5e7eb",
                        margin: "8px 0",
                      }}
                    ></div>
                    <div
                      className="flex justify-between items-center"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        className="font-semibold text-gray-700"
                        style={{ fontWeight: 600, color: "#374151" }}
                      >
                        Date
                      </span>
                      {isEditing && isEnterprise ? (
                        <input
                          type="date"
                          value={(issueDate || "").slice(0, 10)}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                        />
                      ) : (
                        <span
                          className="text-gray-900"
                          style={{ color: "#111827" }}
                        >
                          {invoice.issue_date
                            ? new Date(invoice.issue_date).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </span>
                      )}
                    </div>
                    <div
                      className="flex justify-between items-center"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        className="font-semibold text-gray-700"
                        style={{ fontWeight: 600, color: "#374151" }}
                      >
                        Due Date
                      </span>
                      {isEditing && isEnterprise ? (
                        <input
                          type="date"
                          value={(dueDate || "").slice(0, 10)}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                        />
                      ) : (
                        <span
                          className="text-gray-900"
                          style={{ color: "#111827" }}
                        >
                          {new Date(invoice.due_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                      )}
                    </div>
                    {isEditing && isEnterprise && (
                      <>
                        <div className="h-px bg-gray-200"></div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">
                            Currency
                          </span>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                          >
                            {currencies.map((curr) => (
                              <option key={curr.code} value={curr.code}>
                                {curr.code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="mb-6" style={{ marginBottom: "24px" }}>
                <h3
                  className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3"
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "12px",
                  }}
                >
                  Bill To
                </h3>
                <div
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  style={{
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <p
                    className="font-bold text-gray-900 text-base mb-1"
                    style={{
                      fontWeight: "bold",
                      color: "#111827",
                      fontSize: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    {billTo?.name || "Client"}
                  </p>
                  {billTo?.address && (
                    <p
                      className="text-sm text-gray-600 whitespace-pre-line leading-relaxed"
                      style={{
                        fontSize: "14px",
                        color: "#4b5563",
                        whiteSpace: "pre-line",
                        lineHeight: 1.6,
                      }}
                    >
                      {billTo.address}
                    </p>
                  )}
                  {billTo?.email && (
                    <p
                      className="text-sm text-gray-600 mt-1"
                      style={{
                        fontSize: "14px",
                        color: "#4b5563",
                        marginTop: "4px",
                      }}
                    >
                      {billTo.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Invoice Description - only show if not default */}
              {shouldRenderDescription && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  {isEditing && isEnterprise ? (
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-900"
                      placeholder="Describe the invoice..."
                    />
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {currentDescription || "No description"}
                    </p>
                  )}
                </div>
              )}

              {/* Professional Items Table */}
              <div className="mb-6" style={{ marginBottom: "24px" }}>
                <div
                  className="overflow-hidden rounded-lg border-2 border-gray-800"
                  style={{
                    overflow: "hidden",
                    borderRadius: "8px",
                    border: "2px solid #1f2937",
                  }}
                >
                  <table
                    className="w-full"
                    style={{ borderCollapse: "collapse", width: "100%" }}
                  >
                    <thead>
                      <tr
                        className="bg-gray-800 text-white"
                        style={{ backgroundColor: "#1f2937", color: "#fff" }}
                      >
                        <th
                          className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Description
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide w-20"
                          style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            width: "80px",
                          }}
                        >
                          Qty
                        </th>
                        <th
                          className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide w-28"
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            width: "112px",
                          }}
                        >
                          Unit Price
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide w-20"
                          style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            width: "80px",
                          }}
                        >
                          Tax
                        </th>
                        <th
                          className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide w-32"
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            width: "128px",
                          }}
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="bg-white"
                      style={{ backgroundColor: "#fff" }}
                    >
                      {isEditing && isEnterprise ? (
                        itemRows.length > 0 ? (
                          itemRows.map((item: any, index: number) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <input
                                    value={item.description || ""}
                                    onChange={(e) => {
                                      updateItem(index, {
                                        description: e.target.value,
                                      });
                                    }}
                                    placeholder="Item description"
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => removeItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={item.quantity ?? 0}
                                  onChange={(e) => {
                                    const val = parseInt(
                                      e.target.value || "0",
                                      10
                                    );
                                    updateItem(index, {
                                      quantity: Number.isFinite(val) ? val : 0,
                                    });
                                    recalcAmounts();
                                  }}
                                  className="w-16 text-center text-sm border border-gray-300 rounded px-2 py-1"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={item.unit_price ?? 0}
                                  onChange={(e) => {
                                    const val = parseFloat(
                                      e.target.value || "0"
                                    );
                                    updateItem(index, {
                                      unit_price: Number.isFinite(val)
                                        ? val
                                        : 0,
                                    });
                                    recalcAmounts();
                                  }}
                                  className="w-24 text-right text-sm border border-gray-300 rounded px-2 py-1"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.01}
                                  value={item.tax ?? 0}
                                  onChange={(e) => {
                                    const val = parseFloat(
                                      e.target.value || "0"
                                    );
                                    updateItem(index, {
                                      tax: Number.isFinite(val) ? val : 0,
                                    });
                                    recalcAmounts();
                                  }}
                                  className="w-16 text-center text-sm border border-gray-300 rounded px-2 py-1"
                                />
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-gray-900">
                                {getCurrencySymbol(currency)}
                                {Number(item.amount || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-8 text-center text-sm text-gray-500"
                            >
                              No items yet
                            </td>
                          </tr>
                        )
                      ) : items.length > 0 ? (
                        items.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <td className="px-4 py-3.5 text-sm text-gray-900">
                              {item.description || "No description"}
                            </td>
                            <td className="px-4 py-3.5 text-center text-sm text-gray-900">
                              {item.quantity || 0}
                            </td>
                            <td className="px-4 py-3.5 text-right text-sm text-gray-900">
                              {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                              {(item.unit_price || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3.5 text-center text-sm text-gray-900">
                              {item.tax || 0}%
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-gray-900">
                              {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                              {(item.amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {isEditing && isEnterprise && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addItem()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                )}
              </div>

              {/* Bottom Section: Bank Details, Notes & Summary */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  paddingTop: "24px",
                }}
              >
                {/* Left Column: Bank Details & Notes */}
                <div
                  className="space-y-5"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    minWidth: 0,
                  }}
                >
                  <div>
                    <h4
                      className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        marginBottom: "8px",
                      }}
                    >
                      Bank Details
                    </h4>
                    {isEditing ? (
                      <textarea
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        placeholder="Add bank details..."
                      />
                    ) : (
                      <div
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        style={{
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          padding: "12px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {bankDetailsDisplay.type === "list" ? (
                          <dl className="space-y-2">
                            {bankDetailsDisplay.entries.map((entry) => (
                              <div
                                key={`${entry.label}-${entry.value}`}
                                className="flex items-start justify-between gap-4"
                              >
                                <dt className="text-sm font-medium text-gray-600">
                                  {entry.label}
                                </dt>
                                <dd
                                  className="text-sm text-gray-900 text-right"
                                  style={{
                                    maxWidth: "65%",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {entry.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p
                            className="text-sm text-gray-900 whitespace-pre-line leading-relaxed"
                            style={{
                              fontSize: "14px",
                              color: "#111827",
                              whiteSpace: "pre-line",
                              lineHeight: 1.6,
                              wordBreak: "break-word",
                            }}
                          >
                            {bankDetailsDisplay.type === "text"
                              ? bankDetailsDisplay.text
                              : "No bank details provided"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4
                      className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        marginBottom: "8px",
                      }}
                    >
                      Notes & Terms
                    </h4>
                    {isEditing ? (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        placeholder="Add notes..."
                      />
                    ) : (
                      <div
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        style={{
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          padding: "12px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <p
                          className="text-sm text-gray-900 whitespace-pre-line leading-relaxed"
                          style={{
                            fontSize: "14px",
                            color: "#111827",
                            whiteSpace: "pre-line",
                            lineHeight: 1.6,
                            wordBreak: "break-word",
                          }}
                        >
                          {invoice.notes || "No additional notes"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Invoice Summary */}
                <div>
                  <div
                    className="bg-white rounded-lg border-2 border-gray-800 overflow-hidden"
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "2px solid #1f2937",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="bg-gray-800 px-5 py-3"
                      style={{
                        backgroundColor: "#1f2937",
                        padding: "12px 20px",
                      }}
                    >
                      <h4
                        className="text-sm font-bold text-white uppercase tracking-wide"
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#fff",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          margin: 0,
                        }}
                      >
                        Invoice Summary
                      </h4>
                    </div>

                    <div className="p-5 space-y-3" style={{ padding: "20px" }}>
                      {(() => {
                        const symbol =
                          isEditing && isEnterprise
                            ? getCurrencySymbol(currency)
                            : getCurrencySymbol(invoice.currency || "GBP");
                        const subtotal =
                          isEditing && isEnterprise
                            ? itemRows.reduce(
                                (sum, it) => sum + Number(it.amount || 0),
                                0
                              )
                            : Number(invoice.subtotal || 0);
                        const ship =
                          isEditing && isEnterprise
                            ? Number(shipping || 0)
                            : Number(invoice.shipping || 0);
                        const disc =
                          isEditing && isEnterprise
                            ? Number(discount || 0)
                            : Number(invoice.discount || 0);
                        const total = subtotal + ship - (subtotal * disc) / 100;
                        return (
                          <>
                            <div
                              className="flex justify-between items-center py-2 border-b border-gray-100"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                borderBottom: "1px solid #f3f4f6",
                                marginBottom: "8px",
                              }}
                            >
                              <span
                                className="text-sm font-semibold text-gray-600"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#4b5563",
                                }}
                              >
                                Subtotal
                              </span>
                              <span
                                className="text-sm font-bold text-gray-900"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  color: "#111827",
                                }}
                              >
                                {symbol}
                                {subtotal.toFixed(2)}
                              </span>
                            </div>

                            <div
                              className="flex justify-between items-center py-2 border-b border-gray-100"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                borderBottom: "1px solid #f3f4f6",
                                marginBottom: "8px",
                              }}
                            >
                              <span
                                className="text-sm font-semibold text-gray-600"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#4b5563",
                                }}
                              >
                                Shipping
                              </span>
                              {isEditing && isEnterprise ? (
                                <input
                                  type="number"
                                  step={0.01}
                                  value={shipping}
                                  onChange={(e) =>
                                    setShipping(
                                      parseFloat(e.target.value || "0")
                                    )
                                  }
                                  className="w-24 text-right text-sm border border-gray-300 rounded px-2 py-1"
                                />
                              ) : (
                                <span
                                  className="text-sm font-bold text-gray-900"
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: "#111827",
                                  }}
                                >
                                  {symbol}
                                  {ship.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <div
                              className="flex justify-between items-center py-2 border-b border-gray-100"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                borderBottom: "1px solid #f3f4f6",
                                marginBottom: "8px",
                              }}
                            >
                              <span
                                className="text-sm font-semibold text-gray-600"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#4b5563",
                                }}
                              >
                                Discount
                              </span>
                              {isEditing && isEnterprise ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={discount}
                                    onChange={(e) =>
                                      setDiscount(
                                        parseFloat(e.target.value || "0")
                                      )
                                    }
                                    className="w-16 text-right text-sm border border-gray-300 rounded px-2 py-1"
                                  />
                                  <span className="text-sm text-gray-600">
                                    %
                                  </span>
                                </div>
                              ) : (
                                <span
                                  className="text-sm font-bold text-gray-900"
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: "#111827",
                                  }}
                                >
                                  {disc}%
                                </span>
                              )}
                            </div>

                            <div
                              className="bg-gray-800 rounded-lg p-4 mt-4"
                              style={{
                                backgroundColor: "#1f2937",
                                borderRadius: "8px",
                                padding: "16px",
                                marginTop: "12px",
                              }}
                            >
                              <div
                                className="text-center"
                                style={{ textAlign: "center" }}
                              >
                                <div
                                  className="text-xs font-bold text-white uppercase tracking-wider mb-2"
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.8px",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Total Amount
                                </div>
                                <div
                                  className="text-3xl font-bold text-white"
                                  style={{
                                    fontSize: "28px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                  }}
                                >
                                  {symbol}
                                  {(Number.isFinite(total) ? total : 0).toFixed(
                                    2
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print-only CSS: isolate invoice content and size to A4 for browser Print to PDF */}
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
