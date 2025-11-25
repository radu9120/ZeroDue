"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InvoiceUpdatePayload,
  updateInvoiceBankDetailsAndNotes,
} from "@/lib/actions/invoice.actions";
import { InvoiceListItem } from "@/types";
import { Loader2 } from "lucide-react";

interface InvoiceEditModalProps {
  invoice: InvoiceListItem;
  userPlan: "free_user" | "professional" | "enterprise";
  onSuccess: () => void;
  onClose: () => void;
}

export default function InvoiceEditModal({
  invoice,
  userPlan,
  onSuccess,
  onClose,
}: InvoiceEditModalProps) {
  // Parse bank details - handle JSON, object, or plain text
  let initialBankType: "uk" | "international" = "international";
  let initialBankText = "";
  let initialAccountType = "";
  let initialAccountName = "";
  let initialSortCode = "";
  let initialAccountNumber = "";

  try {
    if (invoice.bank_details) {
      if (typeof invoice.bank_details === "string") {
        // Try to parse as JSON to check if it's UK format
        try {
          const parsed = JSON.parse(invoice.bank_details);
          if (parsed.sortCode && parsed.accountNumber) {
            initialBankType = "uk";
            initialAccountType = parsed.accountType || "";
            initialAccountName = parsed.accountName || "";
            initialSortCode = parsed.sortCode || "";
            initialAccountNumber = parsed.accountNumber || "";
          } else {
            initialBankText = invoice.bank_details;
          }
        } catch {
          // Plain text - international format
          initialBankText = invoice.bank_details;
        }
      } else if (typeof invoice.bank_details === "object") {
        const details = invoice.bank_details as any;
        if (details.sortCode && details.accountNumber) {
          initialBankType = "uk";
          initialAccountType = details.accountType || "";
          initialAccountName = details.accountName || "";
          initialSortCode = details.sortCode || "";
          initialAccountNumber = details.accountNumber || "";
        } else {
          initialBankText = JSON.stringify(invoice.bank_details, null, 2);
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse bank details:", e);
  }

  const [status, setStatus] = useState(invoice.status || "draft");
  const [notes, setNotes] = useState(invoice.notes || "");
  const [bankType, setBankType] = useState<"uk" | "international">(
    initialBankType
  );
  const [bankDetails, setBankDetails] = useState(initialBankText);
  const [accountType, setAccountType] = useState(initialAccountType);
  const [accountName, setAccountName] = useState(initialAccountName);
  const [sortCode, setSortCode] = useState(initialSortCode);
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice.invoice_number || ""
  );
  const [descriptionText, setDescriptionText] = useState(
    invoice.description || ""
  );
  const [issueDate, setIssueDate] = useState(() =>
    invoice.issue_date
      ? new Date(invoice.issue_date).toISOString().split("T")[0]
      : ""
  );
  const [dueDate, setDueDate] = useState(() =>
    invoice.due_date
      ? new Date(invoice.due_date).toISOString().split("T")[0]
      : ""
  );
  const [invoiceCurrency, setInvoiceCurrency] = useState(
    invoice.currency || "GBP"
  );
  const canEditMetadata = userPlan !== "free_user";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let bankDetailsToSave = "";

      if (bankType === "uk") {
        // Save as JSON for UK format
        bankDetailsToSave = JSON.stringify({
          accountType: accountType.trim(),
          accountName: accountName.trim(),
          sortCode: sortCode.trim(),
          accountNumber: accountNumber.trim(),
        });
      } else {
        // Save as plain text for international format
        bankDetailsToSave = bankDetails.trim();
      }

      const payload: InvoiceUpdatePayload = {
        bank_details: bankDetailsToSave,
        notes: notes.trim(),
        status,
      };

      if (canEditMetadata) {
        payload.invoice_number = invoiceNumber.trim() || undefined;
        payload.description = descriptionText.trim();
        payload.issue_date = issueDate || undefined;
        payload.due_date = dueDate || undefined;
        payload.currency = invoiceCurrency.trim() || undefined;
      }

      const { data, error } = await updateInvoiceBankDetailsAndNotes(
        invoice.id,
        payload
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update invoice");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Selection */}
      <div className="space-y-2">
        <Label htmlFor="status" className="dark:text-slate-200">
          Invoice Status
        </Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {canEditMetadata && (
        <div className="space-y-4 border-t border-gray-200 dark:border-slate-600 pt-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            Invoice Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Invoice Number</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-1234"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Currency</Label>
              <Input
                value={invoiceCurrency}
                onChange={(e) => setInvoiceCurrency(e.target.value)}
                placeholder="GBP"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Description</Label>
            <Textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Add a short memo or description"
              rows={3}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Issue Date</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Section */}
      <div className="space-y-4 border-t border-gray-200 dark:border-slate-600 pt-4">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100">
          Bank Details
        </h3>

        {/* Bank Format Toggle */}
        <div className="space-y-2">
          <Label className="dark:text-slate-200">Banking Format</Label>
          <Select
            value={bankType}
            onValueChange={(value: "uk" | "international") =>
              setBankType(value)
            }
          >
            <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
              <SelectItem value="uk">
                UK Banking (Sort Code & Account Number)
              </SelectItem>
              <SelectItem value="international">
                International (IBAN, SWIFT, etc.)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {bankType === "uk" ? (
          // UK Banking Format
          <>
            <div className="space-y-2">
              <Label htmlFor="accountType" className="dark:text-slate-200">
                Account Type
              </Label>
              <Input
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                placeholder="e.g., Business, Personal"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName" className="dark:text-slate-200">
                Account Name
              </Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g., VEROSITE LTD"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortCode" className="dark:text-slate-200">
                  Sort Code
                </Label>
                <Input
                  id="sortCode"
                  value={sortCode}
                  onChange={(e) => setSortCode(e.target.value)}
                  placeholder="23-11-85"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="dark:text-slate-200">
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="63274627"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
              </div>
            </div>
          </>
        ) : (
          // International Banking Format
          <div className="space-y-2">
            <Label htmlFor="bankDetails" className="dark:text-slate-200">
              Bank Account Information
            </Label>
            <Textarea
              id="bankDetails"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder="Enter your bank details&#10;e.g.:&#10;Bank Name: International Bank&#10;IBAN: GB29 NWBK 6016 1331 9268 19&#10;SWIFT/BIC: NWBKGB2L&#10;Account Name: Your Company Ltd"
              rows={6}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Add any banking information (IBAN, SWIFT, BSB, Routing Number,
              etc.)
            </p>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="space-y-2 border-t border-gray-200 dark:border-slate-600 pt-4">
        <Label htmlFor="notes" className="dark:text-slate-200">
          Notes & Terms
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or terms..."
          rows={4}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-600">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Information Notice */}
      {userPlan === "free_user" ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          <strong>Plan Restriction:</strong> You can only modify status, bank
          details, and notes. Invoice items, amounts, and client info cannot be
          changed to maintain plan limit integrity. Upgrade to Professional or
          Enterprise for broader editing.
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg text-sm text-green-800 dark:text-green-300">
          <strong>
            {userPlan === "professional" ? "Professional" : "Enterprise"} Plan:
          </strong>{" "}
          You can edit invoice metadata, issue/due dates, and banking details
          directly here for full control over your documents.
        </div>
      )}
    </form>
  );
}
