import * as React from "react";
import type { InvoiceListItem } from "@/types";
import type { InvoiceItemRow } from "./types";

interface InvoiceSummarySectionProps {
  isEditing: boolean;
  isEnterprise: boolean;
  itemRows: InvoiceItemRow[];
  shipping: number;
  onShippingChange: (value: number) => void;
  discount: number;
  onDiscountChange: (value: number) => void;
  currency: string;
  invoice: InvoiceListItem;
  getCurrencySymbol: (code?: string) => string;
}

export function InvoiceSummarySection({
  isEditing,
  isEnterprise,
  itemRows,
  shipping,
  onShippingChange,
  discount,
  onDiscountChange,
  currency,
  invoice,
  getCurrencySymbol,
}: InvoiceSummarySectionProps) {
  const symbol =
    isEditing && isEnterprise
      ? getCurrencySymbol(currency)
      : getCurrencySymbol(invoice.currency || "GBP");
  const subtotal =
    isEditing && isEnterprise
      ? itemRows.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : Number(invoice.subtotal || 0);
  const shippingValue =
    isEditing && isEnterprise
      ? Number(shipping || 0)
      : Number(invoice.shipping || 0);
  const discountValue =
    isEditing && isEnterprise
      ? Number(discount || 0)
      : Number(invoice.discount || 0);
  const total = subtotal + shippingValue - (subtotal * discountValue) / 100;

  return (
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
          style={{ backgroundColor: "#1f2937", padding: "12px 20px" }}
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
              style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563" }}
            >
              Subtotal
            </span>
            <span
              className="text-sm font-bold text-gray-900"
              style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}
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
              style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563" }}
            >
              Shipping
            </span>
            {isEditing && isEnterprise ? (
              <input
                type="number"
                step={0.01}
                value={shipping}
                onChange={(event) =>
                  onShippingChange(parseFloat(event.target.value || "0"))
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
                {shippingValue.toFixed(2)}
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
              style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563" }}
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
                  onChange={(event) =>
                    onDiscountChange(parseFloat(event.target.value || "0"))
                  }
                  className="w-16 text-right text-sm border border-gray-300 rounded px-2 py-1"
                />
                <span className="text-sm text-gray-600">%</span>
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
                {discountValue}%
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
            <div className="text-center" style={{ textAlign: "center" }}>
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
                style={{ fontSize: "28px", fontWeight: "bold", color: "#fff" }}
              >
                {symbol}
                {(Number.isFinite(total) ? total : 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
