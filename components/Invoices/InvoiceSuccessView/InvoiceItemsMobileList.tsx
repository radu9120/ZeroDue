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
  template?: string;
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
  template,
}: InvoiceItemsMobileListProps) {
  const isHourly = template === "hourly" || template === "freelance";
  const isTimesheet = template === "timesheet";
  const qtyLabel = isHourly ? "Hours" : "Quantity";
  const priceLabel = isHourly ? "Rate/Hr" : "Unit Price";

  const renderEditableItems = () => {
    if (!itemRows.length) {
      return (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 p-4 text-center text-sm text-gray-500 dark:text-slate-400">
          No items yet
        </div>
      );
    }

    return itemRows.map((item, index) => (
      <div
        key={index}
        className="space-y-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
            Item {index + 1}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onItemRemove(index)}
            className="text-gray-400 dark:text-slate-500 hover:text-red-600"
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {isTimesheet ? (
            <>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Date
                <input
                  type="date"
                  value={item.description || ""}
                  onChange={(event) =>
                    onItemChange(index, { description: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Start Time
                  <input
                    type="time"
                    value={item.start_time || ""}
                    onChange={(event) =>
                      onItemChange(index, { start_time: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  End Time
                  <input
                    type="time"
                    value={item.end_time || ""}
                    onChange={(event) =>
                      onItemChange(index, { end_time: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </>
          ) : (
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Description
              <input
                value={item.description || ""}
                onChange={(event) =>
                  onItemChange(index, { description: event.target.value })
                }
                placeholder="Item description"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              {qtyLabel}
              <input
                type="number"
                min={0}
                step={isTimesheet ? 0.1 : 1}
                value={Number(item.quantity ?? 0)}
                onChange={(event) => {
                  const next = parseFloat(event.target.value || "0");
                  onItemChange(index, {
                    quantity: Number.isFinite(next) ? next : 0,
                  });
                  onRecalculate();
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              {priceLabel}
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
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
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
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-col justify-end">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Amount
              </span>
              <span className="mt-1 text-lg font-bold text-gray-900 dark:text-slate-100">
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
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 p-4 text-center text-sm text-gray-500 dark:text-slate-400">
          No items found
        </div>
      );
    }

    return items.map((item, index) => (
      <div
        key={index}
        className="space-y-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-slate-200">
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
        <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
          {isTimesheet ? (
            <>
              <div>
                <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Date
                </span>
                <span>
                  {item.description
                    ? new Date(item.description).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Start
                  </span>
                  <span>{item.start_time || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    End
                  </span>
                  <span>{item.end_time || "-"}</span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Description
              </span>
              <span>{item.description || "No description"}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>{taxLabel}</span>
            <span>{Number(item.tax || 0)}%</span>
          </div>
          <div className="flex justify-between text-gray-900 dark:text-slate-100 font-semibold text-base">
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
