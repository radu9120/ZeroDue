"use client";
import React from "react";
import {
  CheckCircle,
  Download,
  ArrowLeft,
  FileText,
  Building2,
  User,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CustomButton from "@/components/ui/CustomButton";
import Link from "next/link";
import { downloadElementAsPDF } from "@/lib/pdf";
import { toast } from "sonner";
import Image from "next/image";

export default function InvoiceSuccessView({
  invoice,
  company,
}: {
  invoice: any;
  company: any;
}) {
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
  // Print is intentionally removed — prefer client-side PDF download

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      // Prefer a lightweight client-side capture of the dedicated printable DOM.
      // This avoids heavy server-side rendering and gives fast, deterministic output.
      const printable = document.getElementById(
        "invoice-printable"
      ) as HTMLElement | null;
      if (printable) {
        try {
          await downloadElementAsPDF(printable, {
            filename: `Invoice-${invoice.invoice_number || "unnamed"}.pdf`,
            margin: 8,
            scale: 3,
            format: "a4",
          });
          toast.success("PDF downloaded");
          return;
        } catch (clientErr) {
          // fallback to the visible preview if printable DOM fails
          console.warn("Printable capture failed, falling back:", clientErr);
        }
      }

      // Fallback: capture the visible invoice preview or ask server to generate
      const container =
        (document.getElementById("invoice-capture") as HTMLElement | null) ||
        (document.querySelector(
          "[data-invoice-preview]"
        ) as HTMLElement | null);
      if (!container) {
        toast.error("Could not find invoice preview to export.");
        return;
      }
      try {
        await downloadElementAsPDF(container, {
          filename: `Invoice-${invoice.invoice_number || "unnamed"}.pdf`,
          margin: 12,
          scale: 2.5,
          format: "a4",
        });
        toast.success("PDF downloaded (preview)");
        return;
      } catch (clientErr) {
        // Last resort: try server route
        try {
          const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
          if (!res.ok) throw new Error(await res.text());
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          toast.success("PDF downloaded (server)");
          return;
        } catch (serverErr) {
          throw serverErr || clientErr;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Failed to generate PDF: ${msg}`);
    } finally {
      setDownloading(false);
    }
  };

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
                    {new Date(invoice.issue_date).toLocaleDateString("en-GB")}
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
                  £{Number(item.unit_price || 0).toFixed(2)}
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
                  £{Number(item.amount || 0).toFixed(2)}
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
                {invoice.bank_details || "No bank details provided"}
              </div>
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
                    £{Number(invoice.subtotal || 0).toFixed(2)}
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
                    £{Number(invoice.shipping || 0).toFixed(2)}
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
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
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
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#fff",
                        whiteSpace: "nowrap",
                      }}
                    >
                      £{Number(invoice.total || 0).toFixed(2)}
                    </span>
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
    <main className="relative w-full min-h-[100vh]">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-white z-0" />
      <div className="absolute top-20 right-10 md:right-40 w-64 md:w-96 h-64 md:h-96 rounded-full bg-green-100/40 mix-blend-multiply blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Success Header - show only first time for this invoice */}
        {showSuccess && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-green-800 mb-2">
                    Invoice Created Successfully!
                  </h1>
                  <p className="text-green-700 text-lg">
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
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Invoice Preview
                  </h2>
                  <p className="text-sm text-gray-500">
                    Review your invoice details
                  </p>
                </div>
              </div>
              <Button
                onClick={downloadPDF}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                disabled={downloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? "Generating…" : "Download PDF"}
              </Button>
            </div>
          </CardHeader>

          <CardContent
            className="p-12 bg-white"
            data-invoice-preview
            style={{ height: "auto" }}
          >
            <div id="invoice-capture" className="max-w-5xl mx-auto">
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
                      <span className="text-sm text-gray-900">
                        {new Date(invoice.issue_date).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Due Date:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(invoice.due_date).toLocaleDateString("en-GB")}
                      </span>
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

              {/* Professional Items Table */}
              <div className="mb-8">
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Description
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold w-24">
                          Qty
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold w-32">
                          Unit Price
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold w-24">
                          Tax
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold w-36">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {items.length > 0 ? (
                        items.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.description || "No description"}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-900">
                              {item.quantity || 0}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-900">
                              £{(item.unit_price || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-900">
                              {item.tax || 0}%
                            </td>
                            <td className="px-6 py-4 text-right text-base font-bold text-gray-900">
                              £{(item.amount || 0).toFixed(2)}
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
              </div>

              {/* Additional Details & Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Bank Details
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {invoice.bank_details || "No bank details provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Notes & Terms
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {invoice.notes || "No additional notes"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg border-2 border-gray-300 overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4">
                      <h4 className="text-base font-bold text-white">
                        Invoice Summary
                      </h4>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          Subtotal
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          £{(invoice.subtotal || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          Shipping
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          £{(invoice.shipping || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          Discount
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          {invoice.discount || 0}%
                        </span>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-5 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-white">
                            TOTAL AMOUNT
                          </span>
                          <span className="text-3xl font-bold text-white">
                            £{(invoice.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
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
          <Link href={`/dashboard?business_id=${company.id}`}>
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
      {/* Hidden printable DOM for clean PDF capture */}
      <PrintableInvoice />
    </main>
  );
}
