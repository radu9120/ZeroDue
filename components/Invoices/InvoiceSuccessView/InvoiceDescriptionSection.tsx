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
      <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        DESCRIPTION
      </h4>
      {isEditing && canEditFullInvoice ? (
        <textarea
          value={description}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          className="w-full bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600 text-sm text-gray-900 dark:text-slate-100 resize-none outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the invoice..."
        />
      ) : (
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600">
          <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line m-0">
            {description || fallbackText}
          </p>
        </div>
      )}
    </div>
  );
}
