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
    <div
      className="space-y-5"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        minWidth: 0,
      }}
    >
      <div>
        <h4
          className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "8px",
          }}
        >
          Bank Details
        </h4>
        {isEditing ? (
          <textarea
            value={bankDetails}
            onChange={(event) => onBankDetailsChange(event.target.value)}
            rows={3}
            className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="Add bank details..."
          />
        ) : (
          <div
            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            {bankDetailsDisplay.type === "list" ? (
              <dl className="space-y-2">
                {bankDetailsDisplay.entries.map((entry) => (
                  <div
                    key={`${entry.label}-${entry.value}`}
                    className="flex items-start justify-between gap-4"
                  >
                    <dt className="text-sm font-medium text-gray-600">
                      {entry.label}
                    </dt>
                    <dd
                      className="text-sm text-gray-900 text-right"
                      style={{ maxWidth: "65%", wordBreak: "break-word" }}
                    >
                      {entry.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p
                className="text-sm text-gray-900 whitespace-pre-line leading-relaxed"
                style={{
                  fontSize: "14px",
                  color: "#111827",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                  wordBreak: "break-word",
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

      <div>
        <h4
          className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "8px",
          }}
        >
          Notes & Terms
        </h4>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="Add notes..."
          />
        ) : (
          <div
            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              className="text-sm text-gray-900 whitespace-pre-line leading-relaxed"
              style={{
                fontSize: "14px",
                color: "#111827",
                whiteSpace: "pre-line",
                lineHeight: 1.6,
                wordBreak: "break-word",
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
