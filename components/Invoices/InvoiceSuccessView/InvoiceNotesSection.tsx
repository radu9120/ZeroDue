import type { BankDetailsDisplay } from "./types";

interface InvoiceNotesSectionProps {
  isEditing: boolean;
  bankDetails: string;
  onBankDetailsChange: (value: string) => void;
  bankDetailsDisplay: BankDetailsDisplay;
  notes: string;
  onNotesChange: (value: string) => void;
  invoiceNotes: string;
}

export function InvoiceNotesSection({
  isEditing,
  bankDetails,
  onBankDetailsChange,
  bankDetailsDisplay,
  notes,
  onNotesChange,
  invoiceNotes,
}: InvoiceNotesSectionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Bank Details */}
      <div>
        <h4
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "8px",
          }}
        >
          BANK DETAILS
        </h4>
        {isEditing ? (
          <textarea
            value={bankDetails}
            onChange={(event) => onBankDetailsChange(event.target.value)}
            rows={3}
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
              fontSize: "14px",
              color: "#111827",
              resize: "none",
              outline: "none",
            }}
            placeholder="Add bank details..."
          />
        ) : (
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
            }}
          >
            {bankDetailsDisplay.type === "list" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {bankDetailsDisplay.entries.map((entry) => (
                  <div
                    key={`${entry.label}-${entry.value}`}
                    style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}>
                      {entry.label}
                    </span>
                    <span style={{ fontSize: "14px", color: "#111827", textAlign: "right" }}>
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: "14px",
                  color: "#111827",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {bankDetailsDisplay.type === "text"
                  ? bankDetailsDisplay.text
                  : "No bank details provided"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <h4
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "8px",
          }}
        >
          NOTES
        </h4>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            style={{
              width: "100%",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
              fontSize: "14px",
              color: "#111827",
              resize: "none",
              outline: "none",
            }}
            placeholder="Add notes..."
          />
        ) : (
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#111827",
                whiteSpace: "pre-line",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {invoiceNotes || "No additional notes"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
