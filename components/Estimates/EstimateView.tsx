"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Check,
  X,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generateEstimatePDF, type PDFTheme } from "@/lib/estimate-pdf";
import type { Estimate } from "@/types";

interface EstimateViewProps {
  estimate: Estimate;
  publicView?: boolean;
  onStatusChange?: (status: string) => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  draft: {
    label: "Draft",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: FileText,
  },
  sent: {
    label: "Sent",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    icon: Mail,
  },
  viewed: {
    label: "Viewed",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    icon: Clock,
  },
  converted: {
    label: "Converted",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    icon: CheckCircle2,
  },
};

export default function EstimateView({
  estimate,
  publicView = false,
  onStatusChange,
}: EstimateViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [clientNotes, setClientNotes] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const currencySymbol =
    estimate.currency === "GBP" ? "£" : estimate.currency === "USD" ? "$" : "€";
  const status = statusConfig[estimate.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  const items = Array.isArray(estimate.items) ? estimate.items : [];

  const isExpired =
    estimate.valid_until && new Date(estimate.valid_until) < new Date();
  const canRespond =
    publicView && ["sent", "viewed"].includes(estimate.status) && !isExpired;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Detect current theme
      const isDark = document.documentElement.classList.contains("dark");
      const theme: PDFTheme = isDark ? "dark" : "light";
      await generateEstimatePDF(estimate, theme);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResponse = async (accepted: boolean) => {
    setIsResponding(true);
    try {
      const res = await fetch(`/api/estimates/${estimate.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepted,
          client_notes: clientNotes,
          public_token: estimate.public_token,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit response");

      toast.success(accepted ? "Estimate accepted!" : "Estimate declined");
      onStatusChange?.(accepted ? "accepted" : "rejected");
      setShowResponseForm(false);

      // Reload to show updated status
      window.location.reload();
    } catch (error) {
      toast.error("Failed to submit response");
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {estimate.estimate_number}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {isExpired && estimate.status !== "expired"
                ? "Expired"
                : status.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="neutralOutline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Download PDF</span>
          </Button>

          {canRespond && !showResponseForm && (
            <>
              <Button
                size="sm"
                onClick={() => setShowResponseForm(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Accept</span>
              </Button>
              <Button
                size="sm"
                variant="neutralOutline"
                onClick={() => setShowResponseForm(true)}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Decline</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Response Form */}
      {showResponseForm && canRespond && (
        <div className="p-4 sm:p-6 bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-200 dark:border-purple-800/30">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Your Response
          </h3>
          <Textarea
            placeholder="Add any notes or comments (optional)..."
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            className="mb-4 dark:bg-slate-800 dark:border-slate-700"
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              onClick={() => handleResponse(true)}
              disabled={isResponding}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isResponding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Accept Estimate
            </Button>
            <Button
              onClick={() => handleResponse(false)}
              disabled={isResponding}
              variant="neutralOutline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {isResponding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Decline
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowResponseForm(false)}
              disabled={isResponding}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Printable Content */}
      <div className="p-6 sm:p-8 lg:p-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              ESTIMATE
            </h2>
            <p className="text-lg font-medium text-slate-900 dark:text-white">
              {estimate.estimate_number}
            </p>
            {estimate.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {estimate.description}
              </p>
            )}
          </div>

          {/* Business Info */}
          {estimate.business && (
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {estimate.business.name}
                </span>
              </div>
              {estimate.business.email && (
                <div className="flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  {estimate.business.email}
                </div>
              )}
              {estimate.business.phone && (
                <div className="flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Phone className="h-3.5 w-3.5" />
                  {estimate.business.phone}
                </div>
              )}
              {estimate.business.address && (
                <div className="flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {estimate.business.address}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Client & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Client */}
          {estimate.client && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Prepared For
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {estimate.client.name}
                </span>
              </div>
              {estimate.client.email && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  {estimate.client.email}
                </div>
              )}
              {estimate.client.address && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {estimate.client.address}
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Issue Date
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(estimate.issue_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {estimate.valid_until && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Valid Until
                  </span>
                  <span
                    className={`text-sm font-medium ${isExpired ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
                  >
                    {new Date(estimate.valid_until).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                    {isExpired && " (Expired)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Line Items
          </h3>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Description
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Qty
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Rate
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((item: any, index: number) => {
                  const qty = Number(item.quantity) || 0;
                  const rate = Number(item.rate || item.unit_price) || 0;
                  const amount = qty * rate;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="py-4 px-4 text-slate-900 dark:text-white">
                        {item.description || "—"}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-300">
                        {qty}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-300">
                        {currencySymbol}
                        {rate.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">
                        {currencySymbol}
                        {amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {items.map((item: any, index: number) => {
              const qty = Number(item.quantity) || 0;
              const rate = Number(item.rate || item.unit_price) || 0;
              const amount = qty * rate;
              return (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4"
                >
                  <p className="font-medium text-slate-900 dark:text-white mb-2">
                    {item.description || "—"}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {qty} × {currencySymbol}
                      {rate.toFixed(2)}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {currencySymbol}
                      {amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-72 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Subtotal
              </span>
              <span className="text-slate-900 dark:text-white">
                {currencySymbol}
                {(estimate.subtotal || 0).toFixed(2)}
              </span>
            </div>
            {estimate.discount && estimate.discount > 0 && (
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>Discount ({estimate.discount}%)</span>
                <span>
                  -{currencySymbol}
                  {(
                    (estimate.subtotal || 0) *
                    (estimate.discount / 100)
                  ).toFixed(2)}
                </span>
              </div>
            )}
            {estimate.shipping && estimate.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Shipping
                </span>
                <span className="text-slate-900 dark:text-white">
                  {currencySymbol}
                  {estimate.shipping.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-white">Total</span>
              <span className="text-purple-600 dark:text-purple-400">
                {currencySymbol}
                {(estimate.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {estimate.notes && (
          <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
            <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2">
              Notes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {estimate.notes}
            </p>
          </div>
        )}

        {/* Client Response */}
        {estimate.client_notes && (
          <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Client Response
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {estimate.client_notes}
            </p>
            {estimate.client_response_at && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Responded on{" "}
                {new Date(estimate.client_response_at).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
