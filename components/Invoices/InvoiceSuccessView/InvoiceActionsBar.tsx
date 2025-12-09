import { Button } from "@/components/ui/button";
import { FileText, Mail, Download } from "lucide-react";
import * as React from "react";

interface InvoiceActionsBarProps {
  isEditing: boolean;
  status: string;
  onStatusChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onCopyPublicLink: () => void;
  hasPublicLink: boolean;
  onSendToClient: () => void;
  sending: boolean;
  onDownloadPDF: () => void;
  downloading: boolean;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export function InvoiceActionsBar({
  isEditing,
  status,
  onStatusChange,
  onSave,
  saving,
  onCancel,
  onEdit,
  onCopyPublicLink,
  hasPublicLink,
  onSendToClient,
  sending,
  onDownloadPDF,
  downloading,
}: InvoiceActionsBarProps) {
  return (
    <div className="flex flex-col sm:flex-row  sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Invoice Preview
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Review your invoice details
          </p>
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-sm font-medium text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              onClick={onSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-5 py-2.5 font-medium w-full sm:w-auto"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              variant="secondary"
              onClick={onCancel}
              className="rounded-xl px-5 py-2.5 dark:bg-slate-700 dark:hover:bg-slate-600 w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:flex sm:flex-row sm:flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={onEdit}
            className="!w-full sm:!w-auto rounded-xl px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:hover:text-white"
          >
            Edit Invoice
          </Button>
          {hasPublicLink && (
            <Button
              onClick={onCopyPublicLink}
              variant="secondary"
              className="!w-full sm:!w-auto rounded-xl px-4 py-2 text-sm font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-800/50 dark:hover:text-purple-100"
            >
              Copy Public Link
            </Button>
          )}
          <Button
            onClick={onSendToClient}
            className="!w-full sm:!w-auto bg-green-600 hover:bg-green-500 text-white rounded-xl px-4 py-2 text-sm font-medium shadow-md shadow-green-500/20"
            disabled={sending}
          >
            <Mail className="h-4 w-4 mr-1.5" />
            {sending ? "Sending…" : "Send to Client"}
          </Button>

          <Button
            onClick={onDownloadPDF}
            className="!w-full sm:!w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-medium shadow-md shadow-blue-500/20"
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-1.5" />
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      )}
    </div>
  );
}
