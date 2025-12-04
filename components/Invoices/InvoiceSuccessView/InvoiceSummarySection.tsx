import * as React from "react";
import type { InvoiceListItem } from "@/types";
import type { InvoiceItemRow } from "./types";
import { normalizeCurrencyCode } from "@/lib/utils";

interface InvoiceSummarySectionProps {
  isEditing: boolean;
  canEditFullInvoice: boolean;
  itemRows: InvoiceItemRow[];
  shipping: number;
  onShippingChange: (value: number) => void;
  discount: number;
  onDiscountChange: (value: number) => void;
  currency: string;
  invoice: InvoiceListItem;
  getCurrencySymbol: (code?: string) => string;
  isCompactLayout: boolean;
}

export function InvoiceSummarySection({
  isEditing,
  canEditFullInvoice,
  itemRows,
  shipping,
  onShippingChange,
  discount,
  onDiscountChange,
  currency,
  invoice,
  getCurrencySymbol,
  isCompactLayout,
}: InvoiceSummarySectionProps) {
  const symbol =
    isEditing && canEditFullInvoice
      ? getCurrencySymbol(currency)
      : getCurrencySymbol(normalizeCurrencyCode(invoice.currency));
  const subtotal =
    isEditing && canEditFullInvoice
      ? itemRows.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : Number(invoice.subtotal || 0);
  const shippingValue =
    isEditing && canEditFullInvoice
      ? Number(shipping || 0)
      : Number(invoice.shipping || 0);
  const discountValue =
    isEditing && canEditFullInvoice
      ? Number(discount || 0)
      : Number(invoice.discount || 0);
  const total = subtotal + shippingValue - (subtotal * discountValue) / 100;

  return (
    <div>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #1f2937",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#1f2937",
            padding: "12px 20px",
          }}
        >
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            INVOICE SUMMARY
          </h4>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "8px",
              paddingBottom: "8px",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: "8px",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563" }}
            >
              Subtotal
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}
            >
              {symbol}
              {subtotal.toFixed(2)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}
            >
              Total
            </span>
            <span
              style={{ fontSize: "16px", fontWeight: "bold", color: "#111827" }}
            >
              {symbol}
              {(Number.isFinite(total) ? total : 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
