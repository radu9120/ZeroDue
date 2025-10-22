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
}

export default function InvoiceSuccessView({
  invoice,
  company,
  editMode = false,
  userPlan = "free",
}: InvoiceSuccessViewProps) {
  const router = useRouter();
  const isEnterprise = userPlan === "enterprise";
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
  const [showSuccess, setShowSuccess] = React.useState(true);
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
      const container = document.querySelector(
        "[data-invoice-preview]"
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
      try {
        // Refresh the page so status and email badges update immediately
        if (router) {
          router.refresh();
        }
      } catch {}
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
        {/* Professional Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 40,
            paddingBottom: 20,
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <div style={{ flex: 1, maxWidth: "55%" }}>
            {company?.logo && (
              <div style={{ marginBottom: 18 }}>
                <img
                  src={company.logo}
                  alt="Company Logo"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "90px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <h2
              style={{
                fontSize: 22,
                fontWeight: "bold",
                margin: "0 0 14px 0",
                color: "#111",
              }}
            >
              {company?.name}
            </h2>
            {company?.address && (
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 6,
                  whiteSpace: "pre-line",
                  lineHeight: 1.5,
                }}
              >
                {company.address}
              </div>
            )}
            {company?.email && (
              <div style={{ fontSize: 12, color: "#666" }}>{company.email}</div>
            )}
            {company?.phone && (
              <div style={{ fontSize: 12, color: "#666" }}>{company.phone}</div>
            )}
            {company?.vat && (
              <div style={{ fontSize: 12, color: "#666" }}>
                VAT: {company.vat}
              </div>
            )}
          </div>

          <div style={{ textAlign: "right", minWidth: "250px" }}>
            <h1
              style={{
                fontSize: 38,
                fontWeight: "bold",
                margin: "0 0 24px 0",
                color: "#111",
                letterSpacing: "1px",
              }}
            >
              INVOICE
            </h1>
            <table style={{ fontSize: 12, marginLeft: "auto", width: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "6px 16px 6px 0",
                      fontWeight: 600,
                      color: "#666",
                      textAlign: "left",
                    }}
                  >
                    Invoice #:
                  </td>
                  <td
                    style={{
                      padding: "6px 0",
                      fontWeight: "bold",
                      color: "#111",
                      textAlign: "right",
                    }}
                  >
                    {invoice.invoice_number || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "6px 16px 6px 0",
                      fontWeight: 600,
                      color: "#666",
                      textAlign: "left",
                    }}
                  >
                    Date:
                  </td>
                  <td
                    style={{
                      padding: "6px 0",
                      color: "#111",
                      textAlign: "right",
                    }}
                  >
                    {invoice.issue_date
                      ? new Date(invoice.issue_date).toLocaleDateString("en-GB")
                      : "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "6px 16px 6px 0",
                      fontWeight: 600,
                      color: "#666",
                      textAlign: "left",
                    }}
                  >
                    Due Date:
                  </td>
                  <td
                    style={{
                      padding: "6px 0",
                      color: "#111",
                      textAlign: "right",
                    }}
                  >
                    {new Date(invoice.due_date).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill To */}
        <div
          style={{
            marginBottom: 30,
            paddingBottom: 24,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 12,
            }}
          >
            Bill To:
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: "bold",
              color: "#111",
              marginBottom: 8,
            }}
          >
            {billTo?.name || "Client"}
          </div>
          {billTo?.address && (
            <div
              style={{
                fontSize: 12,
                color: "#666",
                whiteSpace: "pre-line",
                lineHeight: 1.6,
              }}
            >
              {billTo.address}
            </div>
          )}
          {billTo?.email && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              {billTo.email}
            </div>
          )}
        </div>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 32,
            border: "2px solid #1f2937",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1f2937", color: "#fff" }}>
              <th
                style={{
                  padding: "14px 18px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "14px 18px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  width: "90px",
                  letterSpacing: "0.5px",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  padding: "14px 18px",
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: 600,
                  width: "120px",
                  letterSpacing: "0.5px",
                }}
              >
                Unit Price
              </th>
              <th
                style={{
                  padding: "14px 18px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  width: "80px",
                  letterSpacing: "0.5px",
                }}
              >
                Tax
              </th>
              <th
                style={{
                  padding: "14px 18px",
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: 600,
                  width: "130px",
                  letterSpacing: "0.5px",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td
                  style={{ padding: "14px 18px", fontSize: 12, color: "#111" }}
                >
                  {item.description || "-"}
                </td>
                <td
                  style={{
                    padding: "14px 18px",
                    textAlign: "center",
                    fontSize: 12,
                    color: "#111",
                  }}
                >
                  {item.quantity || 0}
                </td>
                <td
                  style={{
                    padding: "14px 18px",
                    textAlign: "right",
                    fontSize: 12,
                    color: "#111",
                  }}
                >
                  {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                  {Number(item.unit_price || 0).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "14px 18px",
                    textAlign: "center",
                    fontSize: 12,
                    color: "#111",
                  }}
                >
                  {item.tax || 0}%
                </td>
                <td
                  style={{
                    padding: "14px 18px",
                    textAlign: "right",
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#111",
                  }}
                >
                  {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                  {Number(item.amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Section: Bank Details + Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 32,
            marginTop: 32,
          }}
        >
          {/* Bank Details & Notes */}
          <div>
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#666",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Bank Details
              </h4>
              {isEditing ? (
                <textarea
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: 16,
                    fontSize: 12,
                    color: "#374151",
                  }}
                  placeholder="Add bank details or payment instructions..."
                />
              ) : (
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: 16,
                    fontSize: 12,
                    color: "#374151",
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                  }}
                >
                  {bankAccountName || "No bank details provided"}
                </div>
              )}
            </div>
            <div>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#666",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Notes & Terms
              </h4>
              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: 16,
                    fontSize: 12,
                    color: "#374151",
                  }}
                  placeholder="Add notes or terms..."
                />
              ) : (
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: 16,
                    fontSize: 12,
                    color: "#374151",
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                  }}
                >
                  {invoice.notes || "No additional notes"}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Summary */}
          <div>
            <div
              style={{
                backgroundColor: "#fff",
                border: "2px solid #1f2937",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div style={{ backgroundColor: "#1f2937", padding: "14px 20px" }}>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#fff",
                    margin: 0,
                    letterSpacing: "0.5px",
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
                    paddingBottom: 12,
                    marginBottom: 12,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#111" }}
                  >
                    {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                    {Number(invoice.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 12,
                    marginBottom: 12,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                  >
                    Shipping
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#111" }}
                  >
                    {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                    {Number(invoice.shipping || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 12,
                    marginBottom: 12,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                  >
                    Discount
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#111" }}
                  >
                    {invoice.discount || 0}%
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: "#1f2937",
                    borderRadius: "8px",
                    padding: "20px",
                    marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: "bold",
                          color: "#fff",
                          letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        TOTAL AMOUNT
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "#fff",
                          whiteSpace: "nowrap",
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
    <main className="relative w-full min-h-[100vh] pt-24 md:pt-28">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-0" />
      <div className="absolute top-20 right-10 md:right-40 w-64 md:w-96 h-64 md:h-96 rounded-full bg-green-100/40 dark:bg-green-900/20 mix-blend-multiply blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Success Header - show only first time for this invoice */}
        {showSuccess && (
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

          {/* Email activity summary */}
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

              {/* Timestamps */}
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

          <CardContent
            className="p-12 bg-white"
            data-invoice-preview
            style={{
              height: "auto",
              backgroundColor: "#ffffff",
              color: "#000000",
            }}
          >
            <div
              id="invoice-capture"
              className="max-w-5xl mx-auto"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              {/* Professional Invoice Header */}
              <div className="flex justify-between items-start mb-10">
                <div className="flex-1">
                  {company.logo && (
                    <div className="mb-6">
                      <Image
                        src={company.logo}
                        alt="Company Logo"
                        width={180}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {company.name}
                    </h2>
                    {company.address && (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-2">
                        {company.address}
                      </p>
                    )}
                    {company.email && (
                      <p className="text-sm text-gray-600">{company.email}</p>
                    )}
                    {company.phone && (
                      <p className="text-sm text-gray-600">{company.phone}</p>
                    )}
                    {company.vat && (
                      <p className="text-sm text-gray-600">
                        VAT: {company.vat}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right min-w-[280px]">
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">
                    INVOICE
                  </h1>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Invoice #:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {invoice.invoice_number || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Date:
                      </span>
                      {isEditing && isEnterprise ? (
                        <input
                          type="date"
                          value={(issueDate || "").slice(0, 10)}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {invoice.issue_date
                            ? new Date(invoice.issue_date).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Due Date:
                      </span>
                      {isEditing && isEnterprise ? (
                        <input
                          type="date"
                          value={(dueDate || "").slice(0, 10)}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {new Date(invoice.due_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Currency:
                      </span>
                      {isEditing && isEnterprise ? (
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900 max-w-[200px]"
                        >
                          {currencies.map((curr) => (
                            <option key={curr.code} value={curr.code}>
                              {curr.code} - {curr.symbol} ({curr.name})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {invoice.currency || "GBP"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Bill To:
                </h3>
                <p className="text-base font-bold text-gray-900 mb-1">
                  {billTo?.name || "Client"}
                </p>
                {billTo?.address && (
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {billTo.address}
                  </p>
                )}
                {billTo?.email && (
                  <p className="text-sm text-gray-600 mt-1">{billTo.email}</p>
                )}
              </div>

              {/* Invoice Description (Enterprise editable) */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </h4>
                {isEditing && isEnterprise ? (
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-900"
                    placeholder="Describe the invoice..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {invoice.description || "No description"}
                  </p>
                )}
              </div>

              {/* Professional Items Table */}
              <div className="mb-8">
                <div
                  className="border-2 border-gray-300 rounded-md overflow-hidden"
                  style={{ border: "2px solid #d1d5db" }}
                >
                  <table
                    className="w-full"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr
                        className="bg-gray-800 text-white"
                        style={{ backgroundColor: "#1f2937", color: "#ffffff" }}
                      >
                        <th
                          className="px-6 py-4 text-left text-sm font-semibold"
                          style={{ padding: "16px 24px", textAlign: "left" }}
                        >
                          Description
                        </th>
                        <th
                          className="px-6 py-4 text-center text-sm font-semibold w-24"
                          style={{ padding: "16px 24px", textAlign: "center" }}
                        >
                          Qty
                        </th>
                        <th
                          className="px-6 py-4 text-right text-sm font-semibold w-32"
                          style={{ padding: "16px 24px", textAlign: "right" }}
                        >
                          Unit Price
                        </th>
                        <th
                          className="px-6 py-4 text-center text-sm font-semibold w-24"
                          style={{ padding: "16px 24px", textAlign: "center" }}
                        >
                          Tax
                        </th>
                        <th
                          className="px-6 py-4 text-right text-sm font-semibold w-36"
                          style={{ padding: "16px 24px", textAlign: "right" }}
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="bg-white"
                      style={{ backgroundColor: "#ffffff" }}
                    >
                      {isEditing && isEnterprise ? (
                        itemRows.length > 0 ? (
                          itemRows.map((item: any, index: number) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                            >
                              <td className="px-6 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  <input
                                    value={item.description || ""}
                                    onChange={(e) => {
                                      updateItem(index, {
                                        description: e.target.value,
                                      });
                                    }}
                                    placeholder="Item description"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                                  />
                                  <Button
                                    variant="secondary"
                                    onClick={() => removeItem(index)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
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
                                  className="w-20 text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900 text-center"
                                />
                              </td>
                              <td className="px-6 py-3 text-right">
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
                                  className="w-28 text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900 text-right"
                                />
                              </td>
                              <td className="px-3 py-3 text-center">
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
                                  className="w-20 text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900 text-center"
                                />
                              </td>
                              <td className="px-6 py-3 text-right text-base font-bold text-gray-900">
                                {getCurrencySymbol(currency)}
                                {Number(item.amount || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-sm text-gray-500"
                            >
                              No items yet
                            </td>
                          </tr>
                        )
                      ) : items.length > 0 ? (
                        items.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                            style={{ borderBottom: "1px solid #e5e7eb" }}
                          >
                            <td
                              className="px-6 py-4 text-sm text-gray-900"
                              style={{
                                padding: "16px 24px",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {item.description || "No description"}
                            </td>
                            <td
                              className="px-6 py-4 text-center text-sm text-gray-900"
                              style={{
                                padding: "16px 24px",
                                textAlign: "center",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {item.quantity || 0}
                            </td>
                            <td
                              className="px-6 py-4 text-right text-sm text-gray-900"
                              style={{
                                padding: "16px 24px",
                                textAlign: "right",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                              {(item.unit_price || 0).toFixed(2)}
                            </td>
                            <td
                              className="px-6 py-4 text-center text-sm text-gray-900"
                              style={{
                                padding: "16px 24px",
                                textAlign: "center",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {item.tax || 0}%
                            </td>
                            <td
                              className="px-6 py-4 text-right text-base font-bold text-gray-900"
                              style={{
                                padding: "16px 24px",
                                textAlign: "right",
                                fontWeight: "bold",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {getCurrencySymbol(invoice.currency || "GBP")}{" "}
                              {(item.amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-sm text-gray-500"
                          >
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {isEditing && isEnterprise && (
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => addItem()}>
                      Add Item
                    </Button>
                  </div>
                )}
              </div>

              {/* Additional Details & Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-8">
                <div className="lg:col-span-3 space-y-5">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Bank Details
                    </h4>
                    {isEditing ? (
                      <textarea
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        rows={3}
                        className="w-full bg-white rounded-lg p-4 border-2 border-gray-300 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        placeholder="Add bank details or payment instructions..."
                      />
                    ) : (
                      <div
                        className="bg-white rounded-lg p-4 border-2 border-gray-300"
                        style={{
                          border: "3px solid #9ca3af",
                          borderRadius: "8px",
                          padding: "16px",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <p
                          className="text-sm text-gray-900 whitespace-pre-line leading-relaxed"
                          style={{ color: "#111827", lineHeight: "1.6" }}
                        >
                          {bankAccountName || "No bank details provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Notes & Terms
                    </h4>
                    {isEditing ? (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-white rounded-lg p-4 border-2 border-gray-300 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        placeholder="Add notes or terms..."
                      />
                    ) : (
                      <div
                        className="bg-white rounded-lg p-4 border-2 border-gray-300"
                        style={{
                          border: "3px solid #9ca3af",
                          borderRadius: "8px",
                          padding: "16px",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <p
                          className="text-sm text-gray-900 whitespace-pre-line leading-relaxed"
                          style={{ color: "#111827", lineHeight: "1.6" }}
                        >
                          {invoice.notes || "No additional notes"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div
                    className="bg-gray-50 rounded-lg border-2 border-gray-300 overflow-hidden"
                    style={{ border: "3px solid #9ca3af", borderRadius: "8px" }}
                  >
                    <div
                      className="bg-gray-800 px-6 py-4"
                      style={{
                        backgroundColor: "#1f2937",
                        color: "#ffffff",
                        padding: "16px 24px",
                      }}
                    >
                      <h4 className="text-base font-bold text-white">
                        Invoice Summary
                      </h4>
                    </div>

                    <div className="p-6 space-y-5">
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
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
                                Subtotal
                              </span>
                              <span className="text-base font-semibold text-gray-900">
                                {symbol}
                                {subtotal.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
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
                                  className="w-28 text-right text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900"
                                />
                              ) : (
                                <span className="text-base font-semibold text-gray-900">
                                  {symbol}
                                  {ship.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
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
                                    className="w-20 text-right text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900"
                                  />
                                  <span className="text-sm text-gray-600">
                                    %
                                  </span>
                                </div>
                              ) : (
                                <span className="text-base font-semibold text-gray-900">
                                  {disc}%
                                </span>
                              )}
                            </div>

                            <div
                              className="bg-gray-800 rounded-lg p-6 mt-4"
                              style={{
                                backgroundColor: "#1f2937",
                                color: "#ffffff",
                                borderRadius: "8px",
                                padding: "24px",
                              }}
                            >
                              <div className="text-center space-y-3">
                                <span className="block text-sm font-bold text-white tracking-wider">
                                  TOTAL AMOUNT
                                </span>
                                <span className="block text-4xl font-bold text-white">
                                  {symbol}
                                  {(Number.isFinite(total) ? total : 0).toFixed(
                                    2
                                  )}
                                </span>
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
              width: 190mm; /* a bit less than A4 to account for margins */
              background: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>

        {/* Action Buttons */}
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
      </div>
    </main>
  );
}
