"use client";
import React from "react";
import {
  CheckCircle,
  Download,
  ArrowLeft,
  FileText,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CustomButton from "@/components/ui/CustomButton";
import Link from "next/link";
import { downloadElementAsPDF } from "@/lib/pdf";
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

  const downloadPDF = async () => {
    const container = document.querySelector(
      "[data-invoice-preview]"
    ) as HTMLElement | null;
    if (!container) return;
    await downloadElementAsPDF(container, {
      filename: `Invoice-${invoice.invoice_number || "unnamed"}.pdf`,
      margin: 12,
      scale: 2,
      format: "a4",
    });
  };

  // Auto-download when navigated with ?download=1
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("download") === "1") {
        // Give the preview a tick to render before capturing
        setTimeout(() => {
          downloadPDF();
        }, 350);
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
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white" data-invoice-preview>
            {/* Company & Client Information - Matching new InvoiceForm structure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* From - Company Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      From
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your business information
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
                  {/* Company Logo Display */}
                  {company.logo && (
                    <div className="mb-6 flex justify-start">
                      <div className="w-32 h-24 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
                        <Image
                          src={company.logo}
                          alt="Company Logo"
                          width={196}
                          height={196}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Company Details */}
                  <div className="space-y-4">
                    <div>
                      <span className="block text-sm font-medium text-gray-600 mb-1">
                        Company Name
                      </span>
                      <p className="text-gray-900 font-semibold text-lg">
                        {company.name}
                      </p>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </span>
                      <p className="text-gray-700">{company.email}</p>
                    </div>
                    {company.phone && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600 mb-1">
                          Phone
                        </span>
                        <p className="text-gray-700">{company.phone}</p>
                      </div>
                    )}
                    {company.address && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600 mb-1">
                          Address
                        </span>
                        <p className="text-gray-700 leading-relaxed">
                          {company.address}
                        </p>
                      </div>
                    )}
                    {company.vat && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600 mb-1">
                          VAT Number
                        </span>
                        <p className="text-gray-700 font-mono">{company.vat}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* To - Client Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bill To
                    </h3>
                    <p className="text-sm text-gray-500">Client information</p>
                  </div>
                </div>

                {billTo ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl p-6 border border-green-100/50">
                    <div className="space-y-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-600 mb-1">
                          Client Name
                        </span>
                        <p className="text-gray-900 font-semibold text-lg">
                          {billTo.name || "No name"}
                        </p>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600 mb-1">
                          Email
                        </span>
                        <p className="text-gray-700">
                          {billTo.email || "No email"}
                        </p>
                      </div>
                      {billTo.phone && (
                        <div>
                          <span className="block text-sm font-medium text-gray-600 mb-1">
                            Phone
                          </span>
                          <p className="text-gray-700">{billTo.phone}</p>
                        </div>
                      )}
                      {billTo.address && (
                        <div>
                          <span className="block text-sm font-medium text-gray-600 mb-1">
                            Address
                          </span>
                          <p className="text-gray-700 leading-relaxed">
                            {billTo.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200/50 rounded-2xl p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <User className="h-6 w-6 text-amber-600" />
                      </div>
                      <p className="text-amber-800 font-medium">
                        No client information available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details Section */}
            <div className="border-t border-gray-100 pt-12 mb-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invoice Details
                  </h3>
                  <p className="text-sm text-gray-500">
                    Invoice number and dates
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </span>
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {invoice.invoice_number || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(invoice.issue_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(invoice.due_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {invoice.description && (
                <div className="mt-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </span>
                    <p className="text-gray-900">{invoice.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Items Section */}
            <div className="border-t border-gray-100 pt-12 mb-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invoice Items
                  </h3>
                  <p className="text-sm text-gray-500">
                    Items, services, or products
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Unit Price
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Tax
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.length > 0 ? (
                      items.map((item: any, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-900">
                            {item.description || "No description"}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">
                            {item.quantity || 0}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            £{(item.unit_price || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">
                            {item.tax || 0}%
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            £{(item.amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <FileText className="h-8 w-8 text-gray-300 mb-2" />
                            <p>No items found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Details & Summary */}
            <div className="border-t border-gray-100 pt-12">
              <div className="flex w-full gap-12">
                <div className="flex-1 space-y-8">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-4 block">
                      Bank Details
                    </label>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-32">
                      <p className="text-gray-700 whitespace-pre-line">
                        {invoice.bank_details || "No bank details provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-4 block">
                      Notes & Terms
                    </label>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-28">
                      <p className="text-gray-700 whitespace-pre-line">
                        {invoice.notes || "No additional notes"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-80">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">
                      Invoice Summary
                    </h4>

                    <div className="space-y-6">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          Shipping
                        </label>
                        <span className="text-lg font-semibold text-gray-900">
                          £{(invoice.shipping || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          Discount
                        </label>
                        <span className="text-lg font-semibold text-gray-900">
                          {invoice.discount || 0}%
                        </span>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              Total Amount
                            </p>
                            <p className="text-4xl font-bold text-gray-900">
                              £{(invoice.total || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
    </main>
  );
}
