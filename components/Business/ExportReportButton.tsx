"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportReportButtonProps {
  businessName: string;
  overview: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    totalValueAll: number;
  };
  revenueData: Array<{ month: string; amount: number }>;
  invoiceStatusData: Array<{ status: string; count: number }>;
}

export function ExportReportButton({
  businessName,
  overview,
  revenueData,
  invoiceStatusData,
}: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Generate CSV content
      const lines: string[] = [];

      // Header
      lines.push(`Analytics Report - ${businessName}`);
      lines.push(`Generated: ${new Date().toLocaleDateString()}`);
      lines.push("");

      // Overview Section
      lines.push("=== OVERVIEW (Last 30 Days) ===");
      lines.push(`Total Invoices,${overview.total}`);
      lines.push(`Paid Invoices,${overview.paid}`);
      lines.push(`Pending Invoices,${overview.pending}`);
      lines.push(`Overdue Invoices,${overview.overdue}`);
      lines.push(`Total Revenue,£${overview.totalAmount.toFixed(2)}`);
      lines.push(`Total Value (All),£${overview.totalValueAll.toFixed(2)}`);
      lines.push("");

      // Revenue Trend
      lines.push("=== REVENUE TREND (Last 6 Months) ===");
      lines.push("Month,Amount");
      revenueData.forEach((item) => {
        lines.push(`${item.month},£${item.amount.toFixed(2)}`);
      });
      lines.push("");

      // Invoice Status Breakdown
      lines.push("=== INVOICE STATUS BREAKDOWN ===");
      lines.push("Status,Count");
      invoiceStatusData.forEach((item) => {
        lines.push(`${item.status},${item.count}`);
      });

      const csvContent = lines.join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${businessName.replace(/\s+/g, "_")}_analytics_report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="secondary"
      className="border-blue-200 dark:border-slate-700 w-full sm:w-auto"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isExporting ? "Exporting..." : "Export Report"}
    </Button>
  );
}
