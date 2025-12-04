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
    <div className="mb-6" style={{ marginBottom: "24px" }}>
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
        DESCRIPTION
      </h4>
      {isEditing && canEditFullInvoice ? (
        <textarea
          value={description}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          className="w-full bg-white rounded-lg p-3 border border-gray-300 text-sm text-gray-900"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "12px 16px",
            border: "1px solid #d1d5db",
          }}
          placeholder="Describe the invoice..."
        />
      ) : (
        <p
          className="text-sm text-gray-700 whitespace-pre-line bg-white rounded-lg p-3 border border-gray-300"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "12px 16px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            color: "#374151",
          }}
        >
          {description || fallbackText}
        </p>
      )}
    </div>
  );
}
