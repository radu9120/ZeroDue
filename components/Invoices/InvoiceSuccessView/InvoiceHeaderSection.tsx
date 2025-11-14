import * as React from "react";
import type { BusinessType, InvoiceListItem } from "@/types";

interface InvoiceHeaderSectionProps {
  company: BusinessType;
  invoice: InvoiceListItem;
  isEditing: boolean;
  isEnterprise: boolean;
  issueDate: string;
  onIssueDateChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  currencies: Array<{ code: string }>;
  isCompactLayout: boolean;
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return parsed.toLocaleDateString("en-GB");
};

export function InvoiceHeaderSection({
  company,
  invoice,
  isEditing,
  isEnterprise,
  issueDate,
  onIssueDateChange,
  dueDate,
  onDueDateChange,
  currency,
  onCurrencyChange,
  currencies,
  isCompactLayout,
}: InvoiceHeaderSectionProps) {
  const containerStyle: React.CSSProperties = React.useMemo(
    () => ({
      display: "flex",
      flexDirection: isCompactLayout ? "column" : "row",
      justifyContent: isCompactLayout ? "flex-start" : "space-between",
      alignItems: isCompactLayout ? "stretch" : "flex-start",
      gap: isCompactLayout ? "20px" : "32px",
      marginBottom: isCompactLayout ? "20px" : "24px",
      paddingBottom: isCompactLayout ? "20px" : "24px",
      borderBottom: "2px solid #e5e7eb",
    }),
    [isCompactLayout]
  );

  const metaStyle: React.CSSProperties = React.useMemo(
    () => ({
      textAlign: isCompactLayout ? "left" : "right",
      width: "100%",
      maxWidth: isCompactLayout ? "100%" : "320px",
      alignSelf: isCompactLayout ? "stretch" : "flex-start",
    }),
    [isCompactLayout]
  );

  const rowStyle: React.CSSProperties = React.useMemo(
    () => ({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
      flexWrap: isCompactLayout ? "wrap" : "nowrap",
      gap: "8px",
    }),
    [isCompactLayout]
  );

  return (
    <div
      className="mb-6 pb-6 border-b-2 border-gray-200"
      style={containerStyle}
    >
      <div className="flex-1" style={{ flex: 1 }}>
        {company.logo && (
          <div
            className="mb-4 flex items-start"
            style={{ marginBottom: "16px" }}
          >
            <img
              src={company.logo}
              alt={`${company.name || "Company"} logo`}
              loading="eager"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="sync"
              style={{
                width: "auto",
                maxWidth: "220px",
                maxHeight: "100px",
                objectFit: "contain",
                objectPosition: "left center",
                display: "block",
              }}
            />
          </div>
        )}
        <h2
          className="text-xl font-bold text-gray-900 mb-2"
          style={{
            fontSize: isCompactLayout ? "18px" : "20px",
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
            <p style={{ marginBottom: "2px" }}>
              {company.tax_label || "VAT"}: {company.vat}
            </p>
          )}
        </div>
      </div>

      <div
        className={isCompactLayout ? "text-left w-full" : "text-right w-full"}
        style={metaStyle}
      >
        <h1
          className="text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          style={{
            fontSize: isCompactLayout ? "32px" : "48px",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: isCompactLayout ? "16px" : "24px",
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
            padding: isCompactLayout ? "12px" : "16px",
            fontSize: isCompactLayout ? "13px" : "14px",
          }}
        >
          <div className="flex justify-between items-center" style={rowStyle}>
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
          <div className="flex justify-between items-center" style={rowStyle}>
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
                onChange={(event) => onIssueDateChange(event.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
              />
            ) : (
              <span className="text-gray-900" style={{ color: "#111827" }}>
                {formatDate(invoice.issue_date)}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center" style={rowStyle}>
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
                onChange={(event) => onDueDateChange(event.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
              />
            ) : (
              <span className="text-gray-900" style={{ color: "#111827" }}>
                {formatDate(invoice.due_date)}
              </span>
            )}
          </div>
          {isEditing && isEnterprise && (
            <>
              <div className="h-px bg-gray-200"></div>
              <div
                className="flex justify-between items-center"
                style={rowStyle}
              >
                <span
                  className="font-semibold text-gray-700"
                  style={{ fontWeight: 600, color: "#374151" }}
                >
                  Currency
                </span>
                <select
                  value={currency}
                  onChange={(event) => onCurrencyChange(event.target.value)}
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
  );
}
