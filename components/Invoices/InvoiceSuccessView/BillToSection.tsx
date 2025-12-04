import * as React from "react";
import type { ParsedBillTo } from "./types";

interface BillToSectionProps {
  billTo: ParsedBillTo | null;
}

export function BillToSection({ billTo }: BillToSectionProps) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h3
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
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <p
          style={{
            fontWeight: "bold",
            color: "#111827",
            fontSize: "16px",
            marginBottom: "4px",
            margin: 0,
          }}
        >
          {billTo?.name || "Client"}
        </p>
        {billTo?.address && (
          <p
            style={{
              fontSize: "14px",
              color: "#4b5563",
              whiteSpace: "pre-line",
              lineHeight: 1.6,
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            {billTo.address as string}
          </p>
        )}
        {billTo?.email && (
          <p
            style={{
              fontSize: "14px",
              color: "#4b5563",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            {billTo.email as string}
          </p>
        )}
      </div>
    </div>
  );
}
