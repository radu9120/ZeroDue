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
    <div className="flex flex-col gap-5">
      {/* Bank Details */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          BANK DETAILS
        </h4>
        {isEditing ? (
          <textarea
            value={bankDetails}
            onChange={(event) => onBankDetailsChange(event.target.value)}
            rows={3}
            className="w-full bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600 text-sm text-gray-900 dark:text-slate-100 resize-none outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add bank details..."
          />
        ) : (
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600">
            {bankDetailsDisplay.type === "list" ? (
              <div className="flex flex-col gap-2">
                {bankDetailsDisplay.entries.map((entry) => (
                  <div
                    key={`${entry.label}-${entry.value}`}
                    className="flex justify-between gap-4"
                  >
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      {entry.label}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-slate-100 text-right">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-900 dark:text-slate-100 whitespace-pre-line leading-relaxed m-0">
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
        <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          NOTES
        </h4>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            className="w-full bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600 text-sm text-gray-900 dark:text-slate-100 resize-none outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add notes..."
          />
        ) : (
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600">
            <p className="text-sm text-gray-900 dark:text-slate-100 whitespace-pre-line leading-relaxed m-0">
              {invoiceNotes || "No additional notes"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
