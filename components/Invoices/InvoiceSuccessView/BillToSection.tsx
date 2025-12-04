import * as React from "react";
import type { ParsedBillTo } from "./types";

interface BillToSectionProps {
  billTo: ParsedBillTo | null;
}

export function BillToSection({ billTo }: BillToSectionProps) {
  return (
    <div className="mb-6" style={{ marginBottom: "24px" }}>
      <h3
        className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3"
        style={{
          fontSize: "11px",
          fontWeight: "bold",
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom: "8px",
        }}
      >
        BILL TO
      </h3>
      <div
        className="bg-white rounded-lg p-4 border border-gray-300"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "16px",
          border: "1px solid #d1d5db",
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
            {billTo.address as string}
          </p>
        )}
        {billTo?.email && (
          <p
            className="text-sm text-gray-600 mt-1"
            style={{ fontSize: "14px", color: "#4b5563", marginTop: "4px" }}
          >
            {billTo.email as string}
          </p>
        )}
      </div>
    </div>
  );
}
