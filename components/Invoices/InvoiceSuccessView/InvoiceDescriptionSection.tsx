interface InvoiceDescriptionSectionProps {
  isEditing: boolean;
  canEditFullInvoice: boolean;
  description: string;
  onChange: (value: string) => void;
  shouldRender: boolean;
  fallbackText: string;
}

export function InvoiceDescriptionSection({
  isEditing,
  canEditFullInvoice,
  description,
  onChange,
  shouldRender,
  fallbackText,
}: InvoiceDescriptionSectionProps) {
  if (!shouldRender) {
    return null;
  }

  return (
    <div style={{ marginBottom: "24px" }}>
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
        DESCRIPTION
      </h4>
      {isEditing && canEditFullInvoice ? (
        <textarea
          value={description}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
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
          placeholder="Describe the invoice..."
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
              color: "#374151",
              whiteSpace: "pre-line",
              margin: 0,
            }}
          >
            {description || fallbackText}
          </p>
        </div>
      )}
    </div>
  );
}
