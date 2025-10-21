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
import { updateInvoiceBankDetailsAndNotes } from "@/lib/actions/invoice.actions";
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
  const isEnterprise = userPlan === "enterprise";
  // Parse bank details - handle JSON, object, or plain text
  let bankDetailsObj = {
    accountType: "",
    accountName: "",
    sortCode: "",
    accountNumber: "",
  };

  try {
    if (invoice.bank_details) {
      if (typeof invoice.bank_details === "string") {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(invoice.bank_details);
          if (typeof parsed === "object" && parsed !== null) {
            bankDetailsObj = {
              accountType: parsed.accountType || "",
              accountName: parsed.accountName || "",
              sortCode: parsed.sortCode || "",
              accountNumber: parsed.accountNumber || "",
            };
          }
        } catch {
          // If JSON parse fails, it's probably plain text - leave fields empty
          // User can fill them in the form
          console.log("Bank details is plain text, not JSON");
        }
      } else if (typeof invoice.bank_details === "object") {
        bankDetailsObj = {
          accountType: (invoice.bank_details as any).accountType || "",
          accountName: (invoice.bank_details as any).accountName || "",
          sortCode: (invoice.bank_details as any).sortCode || "",
          accountNumber: (invoice.bank_details as any).accountNumber || "",
        };
      }
    }
  } catch (e) {
    console.error("Failed to parse bank details:", e);
  }

  const [status, setStatus] = useState(invoice.status || "draft");
  const [notes, setNotes] = useState(invoice.notes || "");
  const [accountType, setAccountType] = useState(
    bankDetailsObj.accountType || ""
  );
  const [accountName, setAccountName] = useState(
    bankDetailsObj.accountName || ""
  );
  const [sortCode, setSortCode] = useState(bankDetailsObj.sortCode || "");
  const [accountNumber, setAccountNumber] = useState(
    bankDetailsObj.accountNumber || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const bankDetails = JSON.stringify({
        accountType,
        accountName,
        sortCode,
        accountNumber,
      });

      await updateInvoiceBankDetailsAndNotes(invoice.id, {
        bank_details: bankDetails,
        notes: notes.trim(),
        status,
      });

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

      {/* Bank Details Section */}
      <div className="space-y-4 border-t border-gray-200 dark:border-slate-600 pt-4">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100">
          Bank Details
        </h3>

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
              placeholder="12-34-56"
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
              placeholder="12345678"
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
        </div>
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
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
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
      {isEnterprise ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg text-sm text-green-800 dark:text-green-300">
          <strong>Enterprise Plan:</strong> You have unlimited invoices!
          However, for audit and integrity purposes, we recommend only modifying
          status, bank details, and notes. For significant changes, consider
          creating a new invoice.
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          <strong>Plan Restriction:</strong> You can only modify status, bank
          details, and notes. Invoice items, amounts, and client info cannot be
          changed to maintain plan limit integrity. Upgrade to Enterprise for
          unlimited invoices.
        </div>
      )}
    </form>
  );
}
