import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { InvoiceItemRow } from "./types";

interface InvoiceItemsMobileListProps {
  isEditing: boolean;
  canEditFullInvoice: boolean;
  itemRows: InvoiceItemRow[];
  items: InvoiceItemRow[];
  onItemChange: (index: number, patch: Partial<InvoiceItemRow>) => void;
  onItemRemove: (index: number) => void;
  onAddItem: () => void;
  onRecalculate: () => void;
  currency: string;
  invoiceCurrency: string;
  getCurrencySymbol: (code?: string) => string;
  taxLabel?: string;
}

const formatCurrency = (
  getCurrencySymbol: (code?: string) => string,
  code: string,
  value: number
) => {
  return `${getCurrencySymbol(code)} ${value.toFixed(2)}`;
};

export function InvoiceItemsMobileList({
  isEditing,
  canEditFullInvoice,
  itemRows,
  items,
  onItemChange,
  onItemRemove,
  onAddItem,
  onRecalculate,
  currency,
  invoiceCurrency,
  getCurrencySymbol,
  taxLabel = "VAT",
}: InvoiceItemsMobileListProps) {
  const renderEditableItems = () => {
    if (!itemRows.length) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
          No items yet
        </div>
      );
    }

    return itemRows.map((item, index) => (
      <div
        key={index}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Item {index + 1}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onItemRemove(index)}
            className="text-gray-400 hover:text-red-600"
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Description
            <input
              value={item.description || ""}
              onChange={(event) =>
                onItemChange(index, { description: event.target.value })
              }
              placeholder="Item description"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Quantity
              <input
                type="number"
                min={0}
                step={1}
                value={Number(item.quantity ?? 0)}
                onChange={(event) => {
                  const next = parseInt(event.target.value || "0", 10);
                  onItemChange(index, {
                    quantity: Number.isFinite(next) ? next : 0,
                  });
                  onRecalculate();
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Unit Price
              <input
                type="number"
                min={0}
                step={0.01}
                value={Number(item.unit_price ?? 0)}
                onChange={(event) => {
                  const next = parseFloat(event.target.value || "0");
                  onItemChange(index, {
                    unit_price: Number.isFinite(next) ? next : 0,
                  });
                  onRecalculate();
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {taxLabel} (%)
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={Number(item.tax ?? 0)}
                onChange={(event) => {
                  const next = parseFloat(event.target.value || "0");
                  onItemChange(index, {
                    tax: Number.isFinite(next) ? next : 0,
                  });
                  onRecalculate();
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-col justify-end">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Amount
              </span>
              <span className="mt-1 text-lg font-bold text-gray-900">
                {formatCurrency(
                  getCurrencySymbol,
                  currency,
                  Number(item.amount || 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderReadonlyItems = () => {
    if (!items.length) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
          No items found
        </div>
      );
    }

    return items.map((item, index) => (
      <div
        key={index}
        className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
          <span>Item {index + 1}</span>
          <span>
            {Number(item.quantity || 0)} ×{" "}
            {formatCurrency(
              getCurrencySymbol,
              invoiceCurrency,
              Number(item.unit_price || 0)
            )}
          </span>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <span className="block text-xs uppercase tracking-wide text-gray-500">
              Description
            </span>
            <span>{item.description || "No description"}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>{Number(item.tax || 0)}%</span>
          </div>
          <div className="flex justify-between text-gray-900 font-semibold text-base">
            <span>Amount</span>
            <span>
              {formatCurrency(
                getCurrencySymbol,
                invoiceCurrency,
                Number(item.amount || 0)
              )}
            </span>
          </div>
        </div>
      </div>
    ));
  };

  const showEditor = isEditing && canEditFullInvoice;

  return (
    <div className="space-y-4" style={{ marginBottom: "24px" }}>
      {showEditor ? renderEditableItems() : renderReadonlyItems()}
      {showEditor && (
        <div className="pt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onAddItem}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      )}
    </div>
  );
}
