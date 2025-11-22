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
    <div className="mb-6">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        Description
      </h4>
      {isEditing && canEditFullInvoice ? (
        <textarea
          value={description}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-900"
          placeholder="Describe the invoice..."
        />
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3 border border-gray-200">
          {description || fallbackText}
        </p>
      )}
    </div>
  );
}
